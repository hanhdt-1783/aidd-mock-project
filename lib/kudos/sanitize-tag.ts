// Single source of truth for kudo hashtag sanitization — shared by the UI input,
// the server action, and the create_kudo RPC must follow the same rule so that
// what the user sees on a chip matches what lands in `kudos_hashtags.tag`.
//
// Rule: strip leading '#', remove all internal whitespace, cap at 64 chars.

export const MAX_TAG_LEN = 64;

export function sanitizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '')
    .slice(0, MAX_TAG_LEN);
}
