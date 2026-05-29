// Single source of truth for kudo hashtag sanitization — shared by the UI input,
// the server action, and the create_kudo RPC must follow the same rule so that
// what the user sees on a chip matches what lands in `kudos_hashtags.tag`.
//
// Rule: strip leading '#', strip Vietnamese diacritics (không dấu), remove all
// internal whitespace (viết liền), cap at 64 chars. The stored value never
// contains the leading '#'; the UI prepends '#' purely for display.
// Keep this equivalent to public.kudo_sanitize_tag() in SQL.

export const MAX_TAG_LEN = 64;

export function sanitizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    // đ/Đ have no NFD decomposition — map them before stripping marks.
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove combining diacritical marks
    .replace(/\s+/g, '')
    .slice(0, MAX_TAG_LEN);
}
