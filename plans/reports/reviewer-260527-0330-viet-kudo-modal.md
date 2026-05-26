# Code Review: Viết Kudo Modal

**Date:** 2026-05-27
**Files reviewed:** 11 (migration, 2 lib files, 4 types files, 5 UI components, 2 integration files)

---

## Summary

Feature is functionally complete and generally well-structured. Backend defense-in-depth (DB constraints + RPC validation + server-action validation) is solid. Two correctness issues need fixing before ship: orphaned images on submission failure, and a hashtag sanitization divergence that can cause silent duplication. One auth check gap in RPC (receiver existence unverified) is lower risk but worth a note.

---

## Strengths

- **Defense in depth on validation:** DB `CHECK` constraints, RPC `RAISE EXCEPTION`, and server action all independently enforce limits. Bypassing one layer hits another.
- **RPC auth guard is correct:** `SECURITY DEFINER` with `auth.uid() IS NULL → RAISE EXCEPTION` prevents anonymous invocation. `GRANT EXECUTE TO authenticated` at SQL level is tight.
- **Storage policies are minimal and correct:** `authenticated`-only insert, public read, owner-only delete. No anon-write risk.
- **Image MIME + size validation both client-side (`upload-kudo-image.ts`) and storage-level** (content-type passed to bucket).
- **Self-send prevention:** enforced in both server action and RPC.
- **`revalidatePath('/kudos')` called on success** — live board refreshes correctly.
- **Blob URL cleanup:** `URL.revokeObjectURL` called on `removeImage`.

---

## Findings

### Critical

None.

---

### Important

**[1] Orphaned images when `createKudo` RPC fails after successful uploads**
- `kudos-hero-banner.tsx` lines 31–55: all images are uploaded to Storage first, then the RPC is called. If the RPC fails (e.g., hashtag count violation, DB error), the uploaded files remain in `kudos-images` bucket forever — no cleanup path exists.
- **Impact:** Unbounded storage growth, potential PII images left orphaned with no owning record.
- **Fix:** After `!created.ok`, delete uploaded files via `supabase.storage.from('kudos-images').remove([...paths])`. Requires tracking paths (not just public URLs) at upload time.

**[2] Hashtag sanitization divergence — silent tag collision**
- `actions.ts` `sanitizeTag`: collapses whitespace to `'-'` → `"hello world"` → `"hello-world"`.
- `kudos-create-hashtag-input.tsx` `sanitizeTag`: strips all whitespace → `"hello world"` → `"helloworld"`.
- RPC: `btrim(v_tag)` only — no space removal.
- **Impact:** If user types `"hello world"`, the form stores `"helloworld"`, the server action sends `"hello-world"`, the RPC stores `"hello-world"`. What the user sees in the chip and what ends up in the DB diverge. Filtering by hashtag post-creation will fail to match.
- **Fix:** Unify `sanitizeTag` into a single shared util (e.g. `lib/kudos/sanitize-tag.ts`) and import from both locations. Decide on one convention (strip vs. hyphenate) and apply it in the RPC too.

**[3] No validation that `p_receiver_id` exists in `profiles`**
- RPC only checks `p_receiver_id IS NULL OR p_receiver_id = v_user_id`. An authenticated user can call `create_kudo` with any random UUID as receiver (e.g., a deleted or non-existent profile).
- **Impact:** Kudos row created with a `receiver_id` that resolves to `fallbackUser('Sunner')` on display — orphaned display, not a security issue, but a data integrity concern. FK constraint on `kudos.receiver_id → profiles(id)` would catch this at DB level only if it exists.
- **Check:** Confirm `kudos.receiver_id` has a FK → `profiles(id)` in `20260523232000_create_kudos_tables.sql`. If FK exists, this is caught. If not, add the check to the RPC or add the FK.

**[4] `listHashtags()` query is unbounded and unauthenticated**
- `queries.ts` line 334: `SELECT tag FROM kudos_hashtags` with no `LIMIT`. On a large board this returns every tag ever used.
- This list is passed as `existingHashtags` to the create form (all tags shipped to the client as page props).
- **Impact:** Not a security issue since tags are public, but a performance concern — one large response on every page load regardless of whether the user opens the form.
- **Fix:** Add `.limit(500)` or lazy-load suggestions via a search endpoint when the hashtag input is opened.

---

### Minor

**[5] `RecipientOption` type is duplicated**
- Defined in both `lib/kudos/types.ts` and `app/_components/kudos/kudos-create-form-types.ts`. The `types.ts` barrel re-exports `lib/kudos/types.ts`, so the UI components that import from `kudos-create-form-types.ts` use a structurally identical but separate declaration.
- **Impact:** Low — TypeScript structural typing means it works, but a change to one won't warn about the other.
- **Fix:** Remove from `kudos-create-form-types.ts`, import from `./types` (which re-exports from lib).

**[6] `kudos-create-form.tsx` is ~395 lines — exceeds 200-line project rule**
- Mixing form state, mention logic, image handling, and render in one file.
- Not a blocker; call it out for a future split (mention handling and image section are natural extraction points).

**[7] Content `1000` char limit enforced in server action but not in DB RPC**
- DB `CHECK` on `kudos.content` is `BETWEEN 1 AND 1000` (good), but the RPC only checks `length(btrim(p_content)) = 0`. An RPC call with content > 1000 chars will hit the DB constraint as an unhandled exception rather than a friendly `RAISE EXCEPTION`.
- **Impact:** User sees a raw Postgres error message instead of the localized string from the server action. Low severity since the server action fires first.
- **Fix:** Add `IF length(p_content) > 1000 THEN RAISE EXCEPTION '...'` in the RPC for consistent error surface.

**[8] Anonymous alias has no length enforcement in server action**
- `actions.ts` passes `anonymousAlias` directly after `.trim()` with no max-length check. DB constraint caps it at 50 chars, but the server action's friendly-error layer has no matching guard.
- Same pattern as item 7 — DB constraint fires as a raw error.

**[9] Hardcoded Vietnamese strings — consistent with existing components, no new debt introduced**
- All VN strings are hardcoded (no `lib/i18n/` usage). This matches the existing kudos board pattern, so no new inconsistency is introduced. Worth tracking if i18n scope ever expands to kudos.

**[10] `setTimeout` in `clear()` (recipient input) and hashtag input — fragile focus management**
- `setTimeout(() => inputRef.current?.focus(), 50)` — 50ms is arbitrary and can fail under load or in tests.
- **Fix:** Use `requestAnimationFrame` consistently (already used elsewhere in the form).

---

## Recommendations

1. **[Must fix before ship]** Fix orphaned image cleanup on RPC failure (finding #1).
2. **[Must fix before ship]** Unify `sanitizeTag` into a shared util to eliminate the hyphenate-vs-strip divergence (finding #2).
3. **[Should fix]** Confirm FK on `kudos.receiver_id`; if absent, add existence check in RPC (finding #3).
4. **[Should fix]** Add `LIMIT` to `listHashtags` (finding #4).
5. **[Nice to have]** Remove duplicated `RecipientOption` type (finding #5), replace `setTimeout` with `requestAnimationFrame` (finding #10).

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Two correctness bugs (orphaned images on failure, hashtag sanitization divergence) need fixes before shipping. All other findings are low-risk or style-level and can be addressed in a follow-up.
