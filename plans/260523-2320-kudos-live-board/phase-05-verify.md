# Phase 5 — Verify

## Steps
1. `npx tsc --noEmit` — clean
2. `npx eslint app/_components/kudos app/kudos lib/kudos` — clean
3. `npm run build` — succeeds
4. Tester subagent runs dev server, exercises:
   - Page render w/ seed data (highlight + all kudos + sidebar stats)
   - Like toggle: click heart → count updates → reload → persists
   - Self-like blocked: viewing your own kudos → heart disabled
   - Filters: pick a hashtag → list narrows → clear → all back
   - Copy link: toast appears
   - Entry input click → toast 'Coming soon'
   - Mở quà click → toast 'Coming soon'
   - Empty states: visual via filter that matches nothing
   - Language switch (VN ↔ EN) updates all kudos UI strings
5. Reviewer subagent does adversarial review of `lib/kudos/*`, `app/_components/kudos/*`, `app/kudos/page.tsx`, and migration SQL.

## Acceptance
- 0 critical findings from reviewer
- All tester checks PASS
- Visual screenshot near-match to Figma

## Status
Completed 2026-05-24. Tester PASS (9 scenarios verified). Reviewer DONE_WITH_CONCERNS → all 3 flagged items fixed post-review. TypeScript, build, lint clean.
