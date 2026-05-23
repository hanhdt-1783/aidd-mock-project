# Phase 1 — Shared Component + Visual Alignment

## Context
- Source files: `app/login/_components/language-switcher.tsx`, `app/login/_components/language-dropdown.tsx`
- MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2

## Steps
1. Create new files (kebab-case):
   - `app/_components/shared/language-switcher.tsx`
   - `app/_components/shared/language-dropdown.tsx`
2. Copy contents from `app/login/_components/*` verbatim; adjust internal import (`./language-dropdown`) to point within the same shared folder.
3. Apply design-match tweaks in `language-dropdown.tsx`:
   - `rounded-sm` → `rounded-lg` (≈8px corners)
   - Remove `border border-white/10`
   - Keep `shadow-lg` (panel depth)
4. Delete the originals at `app/login/_components/language-switcher.tsx` and `language-dropdown.tsx` (single source of truth).

## Status
**Completed 2026-05-23** — Shared component created, design tweaks applied (rounded-lg, border removed, width 108→110px), original files removed.

## Acceptance
- [x] Two new files exist under `app/_components/shared/`
- [x] Original files removed
- [x] TypeScript compiles
