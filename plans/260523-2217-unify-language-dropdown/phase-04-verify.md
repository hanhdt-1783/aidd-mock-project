# Phase 4 — Verify

## Steps
1. `npx tsc --noEmit` — zero errors.
2. `npm run lint` — zero new warnings/errors.
3. Run dev server, exercise dropdown on `/login`, `/`, `/awards`, `/kudos`, `/standards`, `/profile`:
   - Open/close on click
   - Selecting EN updates current label + persists across reload
   - Outside click closes dropdown
   - Panel matches design: 110px wide, rounded-lg corners, no border, selected row darker
4. Compare screenshot vs Figma reference image.

## Status
**Completed 2026-05-23** — Tester: PASS (build, lint, UI). Reviewer: DONE_WITH_CONCERNS (4 fixes applied: click-outside race, width, useCallback, redundant onClose removal).

## Acceptance
- [x] All 6 routes render dropdown identically
- [x] Cookie `lang` toggles correctly
- [x] No console errors
- [x] Reviewer fixes applied (no regressions)
