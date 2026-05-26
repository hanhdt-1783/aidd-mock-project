'use server';

// Server actions for kudos mutations.
// - toggleKudosLike: like/unlike a kudos
// - createKudo: insert a new kudo with hashtags (atomic via create_kudo RPC)

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sanitizeTag } from './sanitize-tag';
import type { CreateKudoInput } from './types';

export type ToggleLikeResult =
  | { ok: true; liked: boolean; likeCount: number }
  | { ok: false; error: string };

export async function toggleKudosLike(
  kudosId: string,
): Promise<ToggleLikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase.rpc('toggle_kudos_like', {
    p_kudos_id: kudosId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as { liked: boolean; like_count: number } | null;
  if (!payload) {
    return { ok: false, error: 'Empty RPC response' };
  }

  revalidatePath('/kudos');
  return { ok: true, liked: payload.liked, likeCount: payload.like_count };
}

export type CreateKudoResult =
  | { ok: true; kudoId: string }
  | { ok: false; error: string };

export async function createKudo(input: CreateKudoInput): Promise<CreateKudoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Not authenticated' };
  }

  // App-layer validation — friendlier errors than the RPC's RAISE EXCEPTIONs.
  const title = input.title?.trim() ?? '';
  if (!title || title.length > 200) {
    return { ok: false, error: 'Danh hiệu phải từ 1 đến 200 ký tự' };
  }
  const content = input.contentMarkdown?.trim() ?? '';
  if (!content || content.length > 1000) {
    return { ok: false, error: 'Nội dung phải từ 1 đến 1000 ký tự' };
  }
  if (!input.recipientId || input.recipientId === user.id) {
    return { ok: false, error: 'Người nhận không hợp lệ' };
  }
  const tags = (input.hashtags ?? [])
    .map(sanitizeTag)
    .filter((t) => t.length > 0);
  if (tags.length < 1 || tags.length > 5) {
    return { ok: false, error: 'Phải có từ 1 đến 5 hashtag' };
  }
  const imageUrls = (input.imageUrls ?? []).filter(Boolean);
  if (imageUrls.length > 5) {
    return { ok: false, error: 'Tối đa 5 ảnh' };
  }

  const { data, error } = await supabase.rpc('create_kudo', {
    p_receiver_id: input.recipientId,
    p_title: title,
    p_content: content,
    p_hashtags: tags,
    p_image_urls: imageUrls,
    p_is_anonymous: input.isAnonymous ?? false,
    p_anonymous_alias: input.isAnonymous ? input.anonymousAlias?.trim() || null : null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  const payload = data as { id: string } | null;
  if (!payload?.id) {
    return { ok: false, error: 'Không tạo được Kudo' };
  }

  revalidatePath('/kudos');
  return { ok: true, kudoId: payload.id };
}
