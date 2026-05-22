# Phase 01 — Track A: Homepage UI from Figma

**Track:** A (UI subagent, background)
**Status:** running (spawned at session start)
**Owner:** `implementer` subagent with `momorph-implement-design` skill

## MoMorph refs:
- Homepage SAA: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- Clarifications: ./clarifications.md

## Goal

Build the presentational layer for the homepage from the Figma design. Static, no real data wiring. Mock data extracted from Figma only.

## Out of scope

- Backend queries, Supabase, env vars, sign-out, navigation behavior beyond `<Link>` hrefs
- Editing `lib/supabase/*`, `lib/i18n/get-lang.ts`, `lib/i18n/actions.ts`, `proxy.ts`

## Integration contract

Track A reports to `plans/.../reports/track-a-ui-report.md` with:
- Files created/modified
- Component tree
- Props each component expects
- Placeholder routes/hrefs to reconcile
- Open questions

`app/page.tsx` reads `getUser()` to pass `isAuthenticated` to header; nothing else server-side.

## Final notes

**Status: ✅ DONE**

UI layer shipped as planned. 10 home-* components created from Figma design (header, hero, countdown, awards grid, kudos, footer, widget, account-menu). All static/presentational logic baked in; dynamic data (user auth, role, event datetime) sourced from Track B props. Report saved: `reports/track-a-ui-report.md`.
