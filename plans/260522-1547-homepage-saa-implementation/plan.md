# Plan — Homepage SAA Implementation

**Date:** 2026-05-22
**Branch:** master
**MoMorph:** [Homepage SAA](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM)
**Clarifications:** [clarifications.md](clarifications.md)

## Goal

Implement the homepage (`/`) per the Homepage SAA Figma design. Two-track concurrent execution:
- **Track A (background):** UI scaffold built from Figma by an `implementer` subagent (already running).
- **Track B (this thread):** backend wiring — Supabase profiles + role, countdown env, navigation stubs, integration with Track A's UI.

## Shipped (2026-05-22)

**Status: ✅ COMPLETE**

All 9 phases executed and validated. Track A UI (Figma → React components) merged with Track B backend (Supabase, auth, routing, i18n). Integration successful; all core user flows passing (anon, logged-in, admin). Tester report: DONE. Reviewer: DONE_WITH_CONCERNS → DONE after fixes applied (score: 8.5 → 9.2).

**Key deliverables:**
- 10 home-* components (header, hero, countdown, awards, kudos, footer, widget, account-menu)
- Supabase `profiles` table w/ role column, RLS, auto-trigger on signup
- `NEXT_PUBLIC_EVENT_DATETIME` env + `getEventDatetime()` helper
- Auth wiring: server reads user + role → passes to header; isAdmin flag controls menu options
- Sign-out server action reused from `/login`
- Stub routes: `/awards` and `/kudos` (both "Coming Soon" pages)
- 30+ i18n keys (`home.meta.*`, `home.nav.*`, `home.hero.*`, etc.) — EN + VI
- Additional polish routes added during review: `/profile`, `/standards` (stubs, linked from header)

**Deviations logged:** See "Final notes" sections in each phase file.

## Phases

| # | Phase | Track | Status |
|---|---|---|---|
| 01 | [Track A — Homepage UI from Figma](phase-01-track-a-homepage-ui.md) | A (UI subagent) | ✅ DONE |
| 02 | [Supabase profiles table + role + trigger + RLS](phase-02-supabase-profiles-role.md) | B | ✅ DONE |
| 03 | [Event datetime env + countdown contract](phase-03-event-datetime-countdown.md) | B | ✅ DONE |
| 04 | [Auth + role wiring in homepage server component](phase-04-auth-role-wiring.md) | B | ✅ DONE |
| 05 | [Stub routes for /awards and /kudos](phase-05-stub-routes-awards-kudos.md) | B | ✅ DONE |
| 06 | [Sign-out + account menu integration](phase-06-account-menu-signout.md) | Integration | ✅ DONE |
| 07 | [i18n dictionary extension for home.* keys](phase-07-i18n-home-keys.md) | B | ✅ DONE |
| 08 | [Integration — wire backend into Track A UI](phase-08-integration.md) | Integration | ✅ DONE |
| 09 | [Temper (tests) + Inspect (review)](phase-09-temper-inspect.md) | QA | ✅ DONE |

## Cross-track contract (Track A ↔ Track B)

Track A is responsible for components and presentational shape. Track B passes data in via props:

| Track A component | Prop expected | Producer (Track B) |
|---|---|---|
| `home-header` | `isAuthenticated: boolean`, `isAdmin: boolean`, `lang: Language` | `app/page.tsx` server component |
| `home-countdown` | `targetIso: string \| null` | `process.env.NEXT_PUBLIC_EVENT_DATETIME` |
| `account-menu` | `onSignOut` server action | `app/_actions/signout.ts` (or reuse `app/login/actions.ts`) |
| `award-card` | `href: /awards#<slug>` | static href in Track A; route exists via Phase 05 |

## Out of scope (this iteration)

- Notification panel contents (button stub only)
- Widget quick-action menu items (button stub only)
- `/about-saa-2025` page (anchor on `/` only)
- Real `/awards` content (stub "Coming Soon")
- Real `/kudos` content (stub "Coming Soon")

## Risk

- Track A may finish before or after Track B. Integration phase 08 unblocks regardless of order.
- If Track A modifies `lib/i18n/dictionary.ts` simultaneously with Phase 07, last-writer-wins. Mitigation: Track A's prompt restricts it to *extending* the dictionary with `home.*` keys only — no overwrites. Phase 07 is therefore a no-op if Track A already added them; otherwise Phase 07 adds the missing ones.
