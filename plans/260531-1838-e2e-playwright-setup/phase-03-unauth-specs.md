# Phase 03 — Unauthenticated Specs

## Overview
- Priority: P2
- Status: completed
- Specs that run with NO storageState (fresh context) verifying guard redirects + public pages.

## Architecture
- File-level `test.use({ storageState: { cookies: [], origins: [] } })` to guarantee anon
  context regardless of project default. Lives under `e2e/unauth/`.

## Confirmed selectors / text
- Protected routes server-side `getUser()` → `redirect('/login')`: `/`, `/kudos`, `/profile`,
  `/secret-box`, `/awards`.
- `/login`: Google button is `<button>` with `aria-label="LOGIN With Google"` →
  `getByRole('button', { name: /login with google/i })`.
- `/prelaunch`: renders `PrelaunchCountdownPage`; assert it loads (status 200, not redirected)
  and a countdown element is present. Use a resilient assertion: page has a heading/region;
  avoid brittle exact countdown digits.

## Related code files
- Create: `e2e/unauth/protected-routes-redirect.spec.ts`
- Create: `e2e/unauth/login-page.spec.ts`
- Create: `e2e/unauth/prelaunch-page.spec.ts`
- Read (selectors): `app/login/_components/google-login-button.tsx`,
  `app/prelaunch/page.tsx`, `app/_components/prelaunch/prelaunch-countdown-page.tsx`

## Implementation steps
1. `protected-routes-redirect.spec.ts`: parametrize over the 5 routes; for each,
   `await page.goto(route)`; `await expect(page).toHaveURL(/\/login/)`.
2. `login-page.spec.ts`: goto `/login`; assert Google button visible by role+name.
3. `prelaunch-page.spec.ts`: goto `/prelaunch`; assert URL stays `/prelaunch` and a
   countdown region/heading is visible (read component first for a stable role/test-id;
   if none, add a `data-testid="prelaunch-countdown"` to the component — minimal, allowed).

## Todo
- [x] protected-routes-redirect.spec.ts (5 routes → /login)
- [x] login-page.spec.ts (Google button)
- [x] prelaunch-page.spec.ts (countdown renders)

## Success criteria
- All unauth specs green against running stack; no flakiness over 3 runs.

## Risk assessment
- Default storageState leaking auth into these specs (Med/High): explicit empty
  storageState per file prevents it.
- Prelaunch countdown selector brittle (Med/Low): prefer role/test-id; add test-id if needed.

## Rollback
- Delete `e2e/unauth/`. If a `data-testid` was added to prelaunch component, that single
  attribute is inert and safe to keep or revert.

## Next steps
- Independent of Phase 02/04; gate P05 with Phase 04.

## Completion note
- Delivered: e2e/unauth/{protected-routes-redirect.spec.ts, login-page.spec.ts, prelaunch-page.spec.ts}.
- All 3 specs pass (13/13 total including authed). Specs use empty storageState override to guarantee anon context.
- Login button selector corrected from data-testid to getByRole('button', {name: /login with google/i}).
