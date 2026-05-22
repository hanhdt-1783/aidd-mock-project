# Clarifications — Awards Information Page Implementation

## Session 2026-05-22
- Q: Route path — `/awards` (homepage links use this) vs `/he-thong-giai` (spec test case)? → A: Keep `/awards` to align with the existing homepage links shipped at SHA `2f1f3f3`.
- Q: Auth gate per test case ID-1 (unauth → /login)? → A: Auth required. Add `if (!user) redirect('/login')` to `app/awards/page.tsx`. Post-login, user returns to `/` per existing `NEXT_PUBLIC_AUTH_REDIRECT`. No `redirectTo` param this iteration.
- Q: URL hash sync on side-menu click? → A: Yes — clicking a side-menu item updates the URL hash (`/awards#mvp`) and active state is read from the hash on load. Side-menu also uses IntersectionObserver to keep active state in sync while scrolling.
