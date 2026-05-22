# Plan — Awards Information Page Implementation

**Date:** 2026-05-22
**Branch:** master (continues from SHA `2f1f3f3`)
**MoMorph:** [Hệ thống giải](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD)
**Clarifications:** [clarifications.md](clarifications.md)

---

## ✅ SHIPPED

**Status:** Delivered 2026-05-22 1710  
**Reviewer arc:** 8.5 → 9.5 (5 critical issues fixed; DOM duplicate, mobile layout, nav highlight, border styling, dead variable)  
**Tests:** tester DONE_WITH_CONCERNS (2 low items fixed); reviewer DONE_WITH_CONCERNS (5 items fixed)

---

## Goal

Replace the `/awards` "Coming Soon" stub with the full Awards Information page per the Hệ thống giải Figma design. Two-track concurrent execution:
- **Track A (background):** UI components built from Figma by an `implementer` subagent (already running).
- **Track B (this thread):** auth gate, page assembly, integration with Track A's UI.

## Phases

| # | Phase | Track | Status |
|---|---|---|---|
| 01 | [Track A — Awards UI from Figma](phase-01-track-a-awards-ui.md) | A (UI subagent) | ✅ DONE |
| 02 | [Auth gate on /awards](phase-02-auth-gate.md) | B | ✅ DONE |
| 03 | [Side-menu hash sync (intersection observer + URL)](phase-03-side-menu-hash.md) | A/B | ✅ DONE |
| 04 | [Integration — wire reused components + auth flag](phase-04-integration.md) | Integration | ✅ DONE |
| 05 | [i18n keys + audit](phase-05-i18n.md) | B | ✅ DONE |
| 06 | [Temper + Inspect](phase-06-temper-inspect.md) | QA | ✅ DONE |

## Cross-track contract

Track A builds UI components, Track B owns the page-level auth gate and routing decisions.

| Track A component | Prop expected | Producer (Track B) |
|---|---|---|
| `awards-side-menu` | `initialActiveSlug?: string` | parsed from URL hash on the client |
| `awards-list` | (data baked in per Figma; no props from B) | n/a |
| reused `home-header` | `isAuthenticated: true`, `isAdmin: boolean`, `activeNav="awards"` | `app/awards/page.tsx` |
| reused `home-kudos-section` | `lang` | `app/awards/page.tsx` |
| reused `home-footer` | `lang` | `app/awards/page.tsx` |

## Out of scope (this iteration)

- `redirectTo` param on login → return-to-page (deferred per clarifications)
- Image gallery / award winners lists (only category info per Figma)
- Award metadata stored in DB (Figma copy is the source — no `awards` table)

## Risk

- Track A finishes the side-menu component but the URL-hash-sync behavior is partially scoped to Track A. If Track A returns a menu without hash sync, Phase 03 adds it. If Track A includes it, Phase 03 is a no-op verification step.
- Auth gate change is observable: anonymous users clicking homepage award cards now bounce to /login — that is the chosen behavior per clarifications, not a regression.
