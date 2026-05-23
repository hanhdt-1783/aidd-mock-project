# Phase 3 — Add Header to Placeholder Screens

The placeholder pages (`/kudos`, `/standards`, `/profile`) currently render a full-screen "Coming Soon" card with no header. Per clarification, add `HomeHeader` to each so the language dropdown appears uniformly.

## Considerations
- `HomeHeader` is a client component. Pages are async server components fetching `lang` and the user. That's fine — pass props server-side.
- Authentication status:
  - `/kudos`, `/standards`: public placeholders. Fetch `user` via supabase `getUser()`.
  - `/profile`: already requires auth (redirects to /login if no user).
- `activeNav` mapping:
  - `/kudos` → `"kudos"`
  - `/standards` → omit (not in nav)
  - `/profile` → omit (accessed from account menu)
- Add top padding to "Coming Soon" content to clear the 80px fixed header.

## Files to update
- `app/kudos/page.tsx` — add `<HomeHeader lang={lang} isAuthenticated={!!user} activeNav="kudos" />`
- `app/standards/page.tsx` — add `<HomeHeader lang={lang} isAuthenticated={!!user} />`
- `app/profile/page.tsx` — add `<HomeHeader lang={lang} isAuthenticated={true} />` (always authenticated post-redirect)

## Status
**Completed 2026-05-23** — HomeHeader added to /kudos, /standards, /profile with correct activeNav and auth props.

## Acceptance
- [x] All three pages render with HomeHeader at top
- [x] Language dropdown clickable, persists selection (cookie set via server action)
- [x] "Coming Soon" content not occluded by fixed header
