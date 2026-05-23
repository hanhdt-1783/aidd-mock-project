# Unify Language Dropdown — Plan

**Status:** Completed 2026-05-23
**MoMorph:** [Dropdown-ngôn ngữ](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2) — screenId `hUyaaugye2`
**Clarifications:** [clarifications.md](./clarifications.md)

## Goal
One shared, design-matched language dropdown used by every screen with a header. Eliminate the awkward `login/_components/` cross-folder import from `HomeHeader`. Add header (with dropdown) to /kudos, /standards, /profile placeholders.

## Phases
- [x] Phase 0 — Discovery & clarification (this doc + clarifications.md)
- [x] Phase 1 — Move + visually align components → `phase-01-shared-component.md`
- [x] Phase 2 — Rewire login + home consumers → `phase-02-rewire-existing.md`
- [x] Phase 3 — Add headers to placeholder screens → `phase-03-add-placeholder-headers.md`
- [x] Phase 4 — Verify build, lint, visual → `phase-04-verify.md`

## Key dependencies
- `lib/i18n/dictionary.ts` (Language type, t())
- `lib/i18n/actions.ts` (setLanguage server action)
- Existing `LanguageSwitcher` + `LanguageDropdown` (will be relocated, not rewritten)

## Out of scope
- /prelaunch (no header by design)
- Adding any new translations or i18n logic
- Refactoring `HomeHeader`/`LoginHeader` beyond import path adjustment

## Completion Summary (2026-05-23)

**Tester:** PASS — build clean, lint clean, UI checks pass.

**Reviewer:** DONE_WITH_CONCERNS — identified 4 fixes:
- M1: click-outside race condition (added `e.stopPropagation()` on menu items)
- Width: 108px → 110px (design spec match)
- Callback: wrapped `closeMenu` in `useCallback`
- Removed redundant `onClose` call after menu item selection

All fixes applied post-review. No regressions.
