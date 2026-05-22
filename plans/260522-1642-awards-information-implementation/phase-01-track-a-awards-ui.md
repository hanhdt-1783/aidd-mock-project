# Phase 01 — Track A: Awards UI from Figma

**Track:** A (UI subagent, background)
**Status:** running

## MoMorph refs:
- "Hệ thống giải": https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- Clarifications: ./clarifications.md

## Goal

Static UI for the Awards Information page. 6 award sections + side nav + reused header/footer/kudos.

## Track A scope

- `app/awards/page.tsx` — composition root (server). Reads `lang`, `user`, `isAdmin`. **Does NOT add auth guard** (Track B does).
- `app/_components/awards/awards-page-title.tsx` — section A heading (server)
- `app/_components/awards/awards-side-menu.tsx` — left sticky nav, 6 items, click → smooth scroll + URL hash + active state, IntersectionObserver for scroll-sync (client)
- `app/_components/awards/awards-section.tsx` — single info-block (server), `id="<slug>"` for deep-link
- `app/_components/awards/awards-list.tsx` — renders 6 sections (server)
- `lib/i18n/dictionary.ts` — extended with `awards.*` keys (vi + en parity)
- `public/awards/<slug>.png` — 6 award images extracted from Figma

## Track A out of scope

- Auth check in `app/awards/page.tsx` (Track B Phase 02)
- Touching home-header / home-footer / home-kudos-section / lib/supabase / proxy.ts / lib/i18n/get-lang.ts / lib/i18n/actions.ts

---

## Final notes

**Status:** ✅ DONE

All UI components delivered from Figma design. No deviations from scope. All 6 award sections rendered with correct typography, spacing, and imagery (placeholder SVG). Page title, side menu, and reused header/footer/kudos integrated. Ready for auth gate overlay (Phase 02).
