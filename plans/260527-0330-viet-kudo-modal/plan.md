# Plan — Viết Kudo Modal

**Branch:** master | **Started:** 2026-05-27 03:30 | **Status:** Complete (pending commit)

## Goal
Implement the "Viết Kudo" (Write Kudo) form so authenticated users can post a new
kudos card from `/kudos`. Plugs into the existing Kudos Live Board placeholder.

## Source
- MoMorph screen `ihQ26W78P2` (file `9ypp4enmFmdK3YAFJLIu6C`)
- Spec CSV: 26 design items
- Test cases CSV: 57 cases
- Clarifications: [`clarifications.md`](./clarifications.md)

## Phases

| Phase | Status | Output |
|-------|--------|--------|
| 1. Scan codebase + scout kudos board | ✅ | Explore agent report (inline) |
| 2. Clarification with user (4 + 4 questions) | ✅ | `clarifications.md` |
| 3. Track A — UI modal (background `implementer`) | ✅ | 7 components in `app/_components/kudos/` |
| 4. Track B — DB migration + RPC + server action + queries | ✅ | Migration, `createKudo`, `listRecipients`, upload helper |
| 5. Integration — wire entry button → modal → submit | ✅ | Hero banner + kudos page wired |
| 6. Type-check, build, end-to-end RPC test (real JWT) | ✅ | Build clean, RPC verified, sanitization aligned across 3 layers |
| 7. Code review (`reviewer` subagent) | ✅ | 2 critical fixes applied (orphan cleanup, sanitization), minor items deferred |
| 8. Browser e2e test (`tester` subagent) | ⚠️ | BLOCKED on OAuth-only login; backend verified by orchestrator |
| 9. Delivery — project-manager, doc-writer, commit, journal | ⏳ | In progress |

## Key Decisions (from clarifications.md)
- Modal overlay (not dedicated route)
- New columns on `kudos`: `title`, `is_anonymous`, `anonymous_alias`
- Public Supabase Storage bucket `kudos-images` for uploads
- Hashtag autocomplete from existing tags + allow new
- Recipients = all profiles except self
- Markdown storage in `content text(1-1000)`
- Standards link → `/standards` new tab

## Files Touched

### New
- `supabase/migrations/20260527033000_kudos_create_support.sql`
- `lib/kudos/sanitize-tag.ts`
- `lib/kudos/upload-kudo-image.ts`
- `app/_components/kudos/kudos-create-modal.tsx`
- `app/_components/kudos/kudos-create-form.tsx`
- `app/_components/kudos/kudos-create-form-types.ts`
- `app/_components/kudos/kudos-create-recipient-input.tsx`
- `app/_components/kudos/kudos-create-hashtag-input.tsx`
- `app/_components/kudos/kudos-create-rich-toolbar.tsx`

### Modified
- `lib/kudos/actions.ts` — added `createKudo`
- `lib/kudos/queries.ts` — added `listRecipients`, bounded `listHashtags`
- `lib/kudos/types.ts` — added `RecipientOption`, `CreateKudoInput`
- `app/_components/kudos/types.ts` — barrel re-exports
- `app/_components/kudos/kudos-page.tsx` — forward props
- `app/_components/kudos/kudos-hero-banner.tsx` — modal state, submit flow
- `app/kudos/page.tsx` — fetch recipients

## Open / Deferred
- Minor reviewer notes (#6 form size 395 lines; #7 content-length DB constraint vs RPC; #8 alias length guard; #9 setTimeout focus) — non-blocking, deferred
- Browser e2e (UI smoke test through real auth) — blocked locally on OAuth, recommended on staging
