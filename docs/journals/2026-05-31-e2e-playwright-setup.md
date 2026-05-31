# Playwright E2E Smoke Suite: First End-to-End Tests Added

**Date**: 2026-05-31 21:10  
**Severity**: Medium  
**Component**: Testing Infrastructure, Authentication  
**Status**: Resolved

## What Shipped

Added first Playwright E2E smoke suite to the repo (13 tests, 100% pass rate, no flakiness). 3 unauth specs (protected-routes redirect, prelaunch page, login page), 2 authed modal tests (give-kudos, kudos board), and 3 secret-box/awards flows. Chromium only. `npm run test:e2e` and `npm run test:e2e:ui`. All tests run against live local Supabase stack via seeded session auth — **no Google OAuth invoked**.

Combined with existing 29 passing Vitest unit tests; tsc clean; playwright/.auth/ and .env.test.local gitignored.

## The Brutal Truth

This was the right call but not easy. The fundamental problem: every user-facing route is gated behind OAuth. E2E tests cannot drive real Google auth—it's flaky, requires human interaction, and brittle against credential rotation. The *only* pragmatic path was to seed a session server-side via the admin API, inject it as a browser cookie, and verify it works by hitting an authed endpoint.

This meant **reverse-engineering cookie contracts against the live system** rather than trusting docs or assumptions. Burned 2+ hours validating empirically that the `@supabase/ssr` cookie format was `base64-` + base64url(JSON) and exactly 2543 chars (under the single-chunk threshold). A false guess here cascades into silent failures where tests load /login instead of the protected page.

## Technical Details

### Auth Seeding Infrastructure
**Setup flow (global.setup.ts):**
1. `ensureTestUser()` → POST /auth/v1/admin/users with email/password (test user created via service_role admin API, password-grantable unlike seeded users)
2. `signInWithPassword()` → POST /auth/v1/token?grant_type=password → session JSON
3. `buildStorageState(session)` → derive cookie name `sb-127-auth-token` (hostname-aware, not hardcoded), base64-encode session, write Playwright storageState JSON
4. Persist to `playwright/.auth/user.json`
5. **Self-verify:** open browser context with that state, `goto('/kudos')`, assert no redirect to `/login`

**Cookie empirically verified:**
- Name: `sb-127-auth-token` (derived from host first label: `127` from `127.0.0.1`)
- Value: literal `base64-` prefix + base64url(JSON.stringify(session))
- ~2543 chars total (access_token, refresh_token, expires_at, user, etc.)
- Single cookie; no chunking needed (threshold is 3180 chars)

**Node 20 gotcha:** Instantiating supabase-js client even for `createServerClient` triggers realtime init → throws "Node.js 20 detected without native WebSocket". Setup helpers **must avoid supabase-js entirely** and use raw `fetch` to GoTrue REST API.

### Playwright Config
- `playwright.config.ts`: manual .env load (precedence: real env wins, then .env.test.local overrides .env.local) to avoid adding `dotenv` dependency
- webServer runs `npm run dev` on :3000, auto-starts
- Chromium only (Firefox/Safari add surface area without coverage gain for this smoke suite)

### Test Patterns
- Unauth specs: no storageState, assert redirect-to-login on protected routes
- Authed specs: load `AUTH_FILE` via `test.use({ storageState })`, session injected automatically
- Selectors: prefer role + aria attributes; stable Vietnamese text only where roles unavailable
- Sample assertion: `.getByText(/IDOL GIỚI TRẺ|NGƯỜI TRUYỀN CẢM HỨNG/)` to match seeded kudo titles (multiple name variants due to cycled avatar seeding)

## What We Tried (and Traps)

1. **Real OAuth in E2E?** Rejected. Flaky, can't automate Google 2FA, credentials tied to real accounts, CI fragile.

2. **Seed a user via seed.sql?** No. Seed users have no password, can't password-grant directly.

3. **Hardcode GoTrue admin list URL?** Failed. API returned 500 without a filter param. Fixed: added `?filter=<email>` to lookup.

4. **storageState overwrite bug:** Accidentally called `page.context().storageState({path})` mid-test, clobbering the good cookie file with an empty context. Caught by self-verification step failing on /kudos redirect.

5. **Selector assumptions:** Page locators were wrong in initial plan vs reality. Google button label is Vietnamese "ĐĂNG NHẬP Bằng Google", not English. Kudo cards show `title` (VN text), not badge labels (<img alt=...). <dialog> hidden due to CSS, not visibility. Default language is `vi`, not `en`. Empirically verified each via browser test loops.

6. **Env precedence bug (caught in review):** playwright.config.ts was loading .env files in wrong order (later file should override earlier). Fixed: explicit `realEnvKeys.has(key)` check ensures already-set env vars (from CI or shell) win; missing vars filled from .env files in order.

7. **Hardcoded fallback keys (caught in review):** supabase-admin.ts had `process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'fake-key'`. Security hole — silently falls back to fake key, masking real issues. Fixed: throw if key unset. `.env.test.local` (gitignored) supplies the well-known local demo key.

## Root Cause Analysis

Why was this hard?

**OAuth is fundamentally incompatible with E2E automation.** There is no "record and replay" for human OAuth flows. Every project with OAuth-gated features must either:
- Accept flaky E2E (real OAuth, retry loops)
- Seed a session server-side (our path; pragmatic but requires reverse-engineering cookie contracts)
- Mock OAuth at the network level (overkill for local smoke tests)

**Cookie formats are undocumented.** Supabase docs don't specify the @supabase/ssr cookie structure. Had to:
1. Read @supabase/ssr source code (`combineChunks` function)
2. Inspect live browser DevTools against the local Supabase stack
3. Write, test, iterate on encoding/decoding logic
4. Self-verify against real app behavior (the /kudos redirect guard)

**Next.js 16 gotcha**: The repo uses `proxy.ts` (Next.js 16 renamed `middleware.ts`). Standard middleware docs still reference the old name. AGENTS.md has the callout; easy to miss.

## Lessons Learned

1. **For OAuth-gated apps, session seeding is the only pragmatic E2E path.** It costs upfront engineering (admin API dance, cookie reverse-engineering, self-verification) but eliminates runtime flakiness. Document the cookie contract empirically once, reuse forever.

2. **Reverse-engineer external contracts against live systems.** Docs lie or drift. Open DevTools, log values, verify empirically. The 30 mins of inspection saved hours of debugging false assumptions.

3. **Self-verification as a guard rail.** The global-setup.ts verifies that its output is valid by actually loading a protected page. It catches silent failures (bad cookie format, wrong name, expiry issues) before tests start.

4. **Environment precedence matters.** CI wants to inject secrets; local dev wants to load from .env files. Real env should always win. Explicit is better than implicit (no magic fallbacks; throw if required keys are missing).

5. **Language/locale assumptions fail silently.** The app defaults to Vietnamese; button labels, kudo titles, error messages are all VN text. Tests must use role selectors or empirically-verified text. Hard-coding English breaks immediately.

## Next Steps

- **CI integration:** playwright.config.ts flags `webServer: { reuseExistingServer: !process.env.CI }` and `retries: process.env.CI ? 1 : 0`, but CI workflow not yet configured. Next owner should add `.github/workflows/e2e.yml` to run `npm run test:e2e` after build, inject `SUPABASE_SERVICE_ROLE_KEY` from a secret, and use `npm run build && npm start` for webServer (faster, more prod-like than dev mode).

- **Coverage expansion:** 13 specs cover happy paths and basic error states. Expand to: give-kudos validation (empty title, XSS payload), profile Coming Soon page, secret-box unlock (if that feature ships), language switching. All reuse the same seeded session.

- **Flakiness baseline:** Run suite 5–10 times to establish a flakiness baseline before shipping to CI. Timeouts, network jitter, and browser startup vary locally.

## Completion Note

- **Files added:** e2e/{authed,unauth,support}/, playwright.config.ts, playwright/.auth/ (generated)
- **Files updated:** .gitignore, package.json, README.md, docs/authentication.md
- **Test count:** 13 specs (3 unauth + 10 authed)
- **Pass rate:** 13/13 locally (2 runs, no flakiness observed)
- **Security:** service_role key in .env.test.local (gitignored); only well-known local demo key used
- **No mock data.** All test assertions flow against live seeded data (kudo titles from seed.sql, user email from test-user constant)
