// Client-side helper — uploads one image to the `kudos-images` bucket and returns
// its public URL. Called from the form component before submitting the kudo.

'use client';

import { createClient } from '@/lib/supabase/client';

const BUCKET = 'kudos-images';
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB per file

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

// Removes already-uploaded objects when a subsequent step in the submit flow
// fails — keeps storage clean of orphans whose owning kudo never existed.
export async function deleteKudoImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove(paths);
}

function safeExt(file: File): string {
  const fromType = file.type === 'image/png' ? 'png' : 'jpg';
  const m = file.name.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : fromType;
}

export async function uploadKudoImage(file: File, userId: string): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: 'Chỉ hỗ trợ ảnh JPG hoặc PNG' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Ảnh không được vượt quá 5MB' };
  }

  const supabase = createClient();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl, path };
}
