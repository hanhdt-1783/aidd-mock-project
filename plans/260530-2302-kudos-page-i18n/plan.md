# Kudos Page i18n — Wire VN/EN translations

## Problem
Kudos page (`/kudos`) renders hardcoded text (mostly Vietnamese). The language
switcher (VN/EN) works but kudos content does not react to it. ~28 `kudos.*` keys
already exist in `lib/i18n/dictionary.ts` (vi+en) from a prior effort but no kudos
component imports `t()`. Some existing `vi` values are wrong (English in the vi slot,
e.g. `kudos.card.copied.toast`).

## Goal
Every user-facing string on the `/kudos` page tree switches with the language toggle.
- Current hardcoded text → `vi` value (correct the wrong existing vi entries).
- Add `en` translations.
- Reuse existing `kudos.*` keys; add new keys only where missing.

## Pattern (established, reuse — DRY)
- Components receive `lang: Language` prop and call `t(lang, 'key')`.
- Import: `import { t, type Language } from '@/lib/i18n/dictionary';`
- No context; lang is prop-threaded (same as `home`/`awards` components).
- Server route `app/kudos/page.tsx` already has `lang` via `getLang()`.

## Conflict-avoidance
- `dictionary.ts` is SINGLE-WRITER (orchestrator merges). Implementers return
  new-key blocks + vi-corrections; they do NOT edit dictionary.ts.
- Each implementer owns DISTINCT component files (no overlap).
- `lang` is a REQUIRED prop everywhere → `tsc --noEmit` flags any missed wiring.

## Component groups (parallel implementers)
- **G1 — feed/cards/page**: kudos-page, kudos-card, kudos-card-highlight,
  kudos-card-user-info, kudos-empty-state, kudos-toast. ns: `kudos.feed.*`, `kudos.card.*`
- **G2 — hero/highlight/spotlight**: kudos-hero-banner, kudos-hero-tag,
  kudos-highlight-section, kudos-highlight-carousel, kudos-spotlight-board,
  kudos-double-hearts-badge, kudos-avatar-hover. ns: `kudos.hero.*`, `kudos.highlight.*`, `kudos.spotlight.*`
- **G3 — sidebar/filter/search**: kudos-sidebar, kudos-sidebar-stats,
  kudos-sidebar-leaderboard, kudos-filter-button, kudos-search-input,
  kudos-entry-input. ns: `kudos.sidebar.*`, `kudos.filter.*`, `kudos.search.*`
- **G4 — create flow**: kudos-create-form, kudos-create-modal,
  kudos-create-hashtag-input, kudos-create-recipient-input,
  kudos-create-rich-toolbar. ns: `kudos.create.*`

## Orchestrator steps
1. Dispatch G1–G4 in parallel.
2. Merge returned dictionary changes into `lib/i18n/dictionary.ts` (vi + en).
3. Edit `app/kudos/page.tsx` → pass `lang={lang}` into `<KudosPage>`.
4. `npx tsc --noEmit` + `npm run lint` → fix wiring gaps.
5. Visual verify (Playwright) VN↔EN on /login switcher path + build.
6. tester + reviewer.

## Status — COMPLETE
- [x] G1  - [x] G2  - [x] G3  - [x] G4
- [x] dictionary merge (92 kudos keys, vi/en symmetric)
- [x] route lang threading (app/kudos/page.tsx → KudosPage lang={lang})
- [x] typecheck (0) + lint (0) + production build (pass)
- [x] no hardcoded VN literals remain; cleaned leftover `as TranslationKey` casts + dead `'bắt buộc'` default + dropped unused `lang` from KudosToast
- Note: live VN↔EN view of /kudos needs an authenticated Google session (route is auth-gated); switcher mechanism itself verified on /login.
