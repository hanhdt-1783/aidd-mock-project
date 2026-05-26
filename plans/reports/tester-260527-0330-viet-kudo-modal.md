# Tester Report — Viết Kudo Modal

**Date:** 2026-05-27
**Branch:** master
**Verifier:** orchestrator (tester subagent was BLOCKED by OAuth-only login)

## Coverage

| Layer | Method | Result |
|-------|--------|--------|
| TypeScript | `npx tsc --noEmit` | ✅ Clean |
| Production build | `npm run build` | ✅ Clean (10 routes built, 0 errors) |
| Schema migration | Applied via `supabase db push --include-all --local` | ✅ Applied + verified via REST OpenAPI: `kudos` columns now `[id, sender_id, receiver_id, content, image_urls, created_at, is_special_day, like_count, title, is_anonymous, anonymous_alias]` |
| Storage bucket | Service-role REST `GET /storage/v1/bucket` | ✅ `kudos-images` exists, public=true |
| RPC visibility | REST OpenAPI introspection | ✅ `/rpc/create_kudo` exposed |
| RPC end-to-end | HS256 JWT minted for u1 (auth.uid), POST `/rpc/create_kudo` | ✅ Returned `{"id": "..."}` |
| Hashtag sanitization parity | Input `["#  Team  Work  ","##Inspiring","Hello  World","   "]` → output `["TeamWork","Inspiring","HelloWorld"]` (empty dropped) | ✅ Matches `lib/kudos/sanitize-tag.ts` rule exactly |
| Anonymous mode | Inserted row with `is_anonymous=true, anonymous_alias='...'` | ✅ Columns populated |
| Cleanup | DELETE via service-role | ✅ 204 |

## Not Verified (Blocked)

- **Browser e2e**: `/login` page is Google OAuth-only. Local Playwright session can't be minted without either (a) implementing a dev-mode magic-link path or (b) running against a staging environment with real OAuth. The original `tester` subagent reported BLOCKED for this reason.
- **Visual regression**: Track A's `implementer` already captured screenshots vs Figma frame `ihQ26W78P2` during its visual-validation loop (Step 7 of `momorph-implement-design`). Screenshots at `plans/260527-0330-viet-kudo-modal/data/actual-modal-v3-full.png`.

## What this means

Backend correctness verified at the API + DB layer. UI correctness was verified by Track A's MoMorph visual-validation loop against the Figma source. The only unverified path is "live browser e2e of the integrated form" — possible regression surface is the wiring in `kudos-hero-banner.tsx` (modal state, upload-then-create-then-cleanup flow). Reviewer already audited this code and the 2 critical issues were fixed.

## Recommendations

1. Run full browser e2e against staging once OAuth callback URL is configured for the test environment.
2. If a magic-link / dev-bypass path is added later, re-run the 57 Figma test cases.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Backend RPC + RLS + storage + schema verified end-to-end via real user JWT; in-browser e2e was blocked by OAuth-only login and was not run locally.
**Concerns/Blockers:** Browser e2e on staging recommended before broad rollout.
