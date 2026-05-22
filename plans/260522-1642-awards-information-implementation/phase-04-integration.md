# Phase 04 — Integration

**Track:** Integration
**Priority:** High
**Depends on:** Track A complete + Phase 02 + Phase 03

## Goal

Wire Track A's UI together with the auth gate and verify the page renders coherently.

## Reconciliation

| Track A surface | Action |
|---|---|
| `app/awards/page.tsx` composition | Insert auth guard at the top per Phase 02 |
| Reused `home-header` | Confirm `activeNav="awards"` is passed and the header highlights "Awards Information" |
| Reused `home-kudos-section` | Confirm it renders at the bottom of the page above the footer |
| Award section `id` attributes | Confirm 6 ids: `top-talent`, `top-project`, `top-project-leader`, `best-manager`, `signature-2025-creator`, `mvp` |
| Homepage deep-links | Confirm `/awards#top-talent` lands on the page and highlights Top Talent |

## Smoke

1. `npm run build` succeeds
2. Log in, click each award card on `/` → lands on the corresponding section
3. Log out, click an award card → bounced to `/login`
4. Click each side-menu item — URL updates, scroll happens, active state moves

---

## Final notes

**Status:** ✅ DONE

**CRITICAL DEVIATION LOGGED:** Refactored `app/awards/page.tsx` layout from duplicate desktop/mobile trees (`hidden lg:flex` + `flex flex-col lg:hidden`) to single unified `flex flex-col lg:flex-row` tree. This fix resolved a real mobile bug where duplicate DOM ids broke IntersectionObserver scroll-sync and scrollIntoView. Emerged from reviewer feedback [C1]; not in original plan. Extracted `awards-value-block.tsx` to keep `awards-section.tsx` under 200-line convention (was 325 → now 194). All reused components (header, kudos, footer) wired correctly. Build passes. All smoke tests verified.
