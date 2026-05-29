# Countdown Prelaunch Page — Implementation Plan

**Status:** ✅ Complete
**Branch:** master
**MoMorph:** [Countdown - Prelaunch page](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU)
**Clarifications:** [clarifications.md](./clarifications.md)

## Overview

Standalone `/prelaunch` route showing full-screen countdown to event start. Pixel-perfect from Figma. Event datetime sourced from Supabase `event_config` table (DB-first) with env fallback. Public access. T=0 → display `00/00/00`, no redirect.

## Phases

| # | Phase | Status | Track |
|---|---|---|---|
| 01 | [UI implementation](./phase-01-ui.md) | ✅ Done | A |
| 02 | [Supabase event_config migration](./phase-02-supabase-migration.md) | ✅ Done | B |
| 03 | [Event datetime resolver](./phase-03-datetime-resolver.md) | ✅ Done | B |
| 04 | [Integrate UI with Supabase source](./phase-04-integrate.md) | ✅ Done | Integration |
| 05 | [Background image asset](./phase-05-bg-asset.md) | ✅ Done | A polish |
| 06 | [Test + Review + Deliver](./phase-06-deliver.md) | ✅ Done | Final |

## Track Layout

- **Track A (UI):** Phase 01 — completed in background by `implementer` subagent.
- **Track B (Backend):** Phases 02 + 03 — Supabase table + datetime resolver. No dependency on Track A.
- **Integration:** Phase 04 — wires Track A page to Track B resolver.
- **Polish:** Phase 05 — bg image (asset only, no code).
- **Final:** Phase 06 — test, review, deliver.

## Files (Created/Modified)

### Track A — already on disk
- `app/prelaunch/page.tsx`
- `app/_components/prelaunch/prelaunch-countdown-page.tsx`
- `app/_components/prelaunch/prelaunch-countdown-unit.tsx`
- `app/_components/prelaunch/prelaunch-digit-tile.tsx`
- `app/_components/prelaunch/prelaunch-countdown-logic.ts`
- `scripts/download-prelaunch-assets.mjs`
- `lib/i18n/dictionary.ts` (+`prelaunch.*` keys)
- `package.json` (+`download-assets:prelaunch` script)

### Track B — to create
- `supabase/migrations/20260523130000_create_event_config_table.sql`
- `lib/event/get-event-datetime.ts` (extend with Supabase read + env fallback)

### Integration — to modify
- `app/prelaunch/page.tsx` (use new async resolver)
- `app/page.tsx` (use new async resolver — keeps homepage consistent)

## Out of Scope

- Admin UI to edit event_datetime (use Supabase Studio per `homepage-saa.md` pattern).
- Auto-redirect at T=0.
- Real-time Supabase subscription (page reload picks up new value).
- New auth/role logic (page is public).
