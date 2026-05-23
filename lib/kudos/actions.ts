'use server';

// Server action — toggles a like on a kudos for the current authenticated user.
// Returns the new state to the client for optimistic UI reconciliation.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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
