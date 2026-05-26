---
plan: 260527-0330-viet-kudo-modal
screen: Viết Kudo
fileKey: 9ypp4enmFmdK3YAFJLIu6C
screenId: ihQ26W78P2
---

# Clarifications — Viết Kudo

## Session 2026-05-27

- Q: Form shell (modal vs page vs drawer) → A: Modal/dialog overlay on /kudos, opened from existing KudosEntryInput
- Q: "Danh hiệu" field shown in design but missing from spec CSV → A: Add as new required field + new DB column `title` on kudos table; renders as kudos card title
- Q: Anonymous mode data model → A: Add `is_anonymous` (boolean) + `anonymous_alias` (text) columns to kudos table
- Q: Image upload storage → A: Supabase Storage public bucket `kudos-images`; public URLs go into existing `image_urls text[]`
- Q: Hashtag input source → A: Autocomplete existing tags from `kudos_hashtags.tag` (distinct) + allow creating new tags; sanitize (strip leading #, max 64 chars, no spaces)
- Q: Recipient picker source → A: `profiles` where id ≠ current user; search by display_name; return id, display_name, avatar_url, department
- Q: Rich text storage format → A: Markdown string in existing `content text(1–1000)` column; render with small markdown parser; mentions as `@username`
- Q: Standards link destination → A: Opens existing `/standards` route in new tab (target=_blank)
