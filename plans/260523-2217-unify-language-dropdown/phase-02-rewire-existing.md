# Phase 2 — Rewire Existing Consumers

## Files to update
- `app/login/_components/login-header.tsx`
  - Old: `import LanguageSwitcher from "./language-switcher";`
  - New: `import LanguageSwitcher from "@/app/_components/shared/language-switcher";`
- `app/_components/home/home-header.tsx`
  - Old: `import LanguageSwitcher from "@/app/login/_components/language-switcher";`
  - New: `import LanguageSwitcher from "@/app/_components/shared/language-switcher";`

## Status
**Completed 2026-05-23** — Both files updated to use shared component import path.

## Acceptance
- [x] No imports remain pointing at `app/login/_components/language-*`
- [x] `tsc --noEmit` clean
