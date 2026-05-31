# E2E Playwright Config + Auth Infra — Implementation Report

## Task
Phase 01 (Install + Config) and Phase 02 (Auth Seeding Infra) of the Playwright E2E plan.

## Status: DONE

---

## Files Created / Modified

| File | Action | Lines |
|------|--------|-------|
| `playwright.config.ts` | Created | 49 |
| `e2e/support/test-user.ts` | Created | 38 |
| `e2e/support/supabase-admin.ts` | Created | 113 |
| `e2e/support/storage-state.ts` | Created | 82 |
| `e2e/support/global.setup.ts` | Created | 52 |
| `package.json` | Modified | +2 scripts |
| `.gitignore` | Modified | +4 entries |
| `playwright/.auth/user.json` | Generated (gitignored) | — |

---

## Final Cookie Format

- **Name**: `sb-127-auth-token` (derived from `new URL(SUPABASE_URL).hostname.split('.')[0]` → `127`)
- **Value**: `base64-` + base64url(JSON.stringify(full GoTrue session object))
- **Encoding**: Node `Buffer.from(json, 'utf8').toString('base64url')` — confirmed identical to `@supabase/ssr`'s own `stringToBase64URL` implementation
- **Length**: ~2553 chars (< 3180 MAX_CHUNK_SIZE → single cookie, no chunking)
- **Cookie attributes**: `domain: localhost`, `path: /`, `expires: -1`, `httpOnly: false`, `secure: false`, `sameSite: Lax`

---

## Verification Command + Result

```
npx playwright test --project=setup
```

```
Running 1 test using 1 worker

[setup] › e2e/support/global.setup.ts:16:6 › authenticate test user
[global.setup] Auth OK — storageState written to playwright/.auth/user.json

  1 passed (4.7s)
```

The setup:
1. Created the test user via `POST /auth/v1/admin/users` (service_role).
2. Signed in via `POST /auth/v1/token?grant_type=password` (anon key).
3. Wrote `playwright/.auth/user.json` with one `sb-127-auth-token` cookie.
4. Self-verified by loading `/kudos` in a fresh browser context with that storageState — URL did NOT redirect to `/login`.

**`npx tsc --noEmit`**: passes clean (zero errors).

---

## Deviations from Plan

1. **GoTrue admin list API bug**: `GET /auth/v1/admin/users` (no params) returns HTTP 500 on this GoTrue version. Fixed by using `GET /auth/v1/admin/users?filter=<email>` (the `filter` param does a text search, not `email=<email>`).

2. **Bug caught in setup script**: The original `global.setup.ts` called `page.context().storageState({ path: AUTH_FILE })` which **saves** (overwrites) the file with the empty page context instead of loading it. Removed that line; the new context creation with `{ storageState: AUTH_FILE }` is sufficient.

3. **Error_code field type**: GoTrue returns `code` as a JSON number, not a string. Fixed the TypeScript interface accordingly.

4. **dotenv not available**: No `dotenv` package in the project. `playwright.config.ts` uses a custom `loadEnvFile()` function with Node built-in `fs` to load `.env.local` and `.env.test.local`.

---

## Interfaces / Exports for Spec-Writing Agent

### Auth file path

```ts
import { AUTH_FILE } from './e2e/support/test-user';
// Value: '<root>/playwright/.auth/user.json'
```

### Test user credentials

```ts
import { TEST_EMAIL, TEST_PASSWORD, TEST_DISPLAY_NAME } from './e2e/support/test-user';
// TEST_EMAIL = 'e2e-test@sun-asterisk.com'
// TEST_PASSWORD = 'E2eTestPassword!2025'
// TEST_DISPLAY_NAME = 'E2E Test User'
```

### storageState path (for use in test fixtures)

```ts
// playwright.config.ts: chromium project has dependencies: ['setup']
// Authed specs use storageState in their fixture — example:
import { AUTH_FILE } from '../support/test-user';
// test.use({ storageState: AUTH_FILE });
```

### GoTrue session shape (for reference)

The session object stored in the cookie includes: `access_token`, `token_type`, `expires_in`, `expires_at`, `refresh_token`, `user` (full GoTrue user object), and `weak_password: null`.

### Key constraints for spec authors

- Authed specs must be under `e2e/authed/` (picked up by the `chromium` project which depends on `setup`).
- Unauthenticated specs go under `e2e/unauth/` — they also run under `chromium` but must NOT set `storageState`.
- `/profile` is a "Coming Soon" placeholder — assert heading text, not a display name.
- Default app language is `vi`; board/modal text is Vietnamese. Prefer `role`, `aria-label`, or `data-testid` selectors.

---

**Status:** DONE
**Summary:** Phase 01 and Phase 02 fully implemented. Playwright installed, config written with setup→chromium project chain, all four auth-support files created using raw fetch (no supabase-js), and the self-verification of the storageState against the live `/kudos` route passes.
**Concerns/Blockers:** None. Two bugs found and fixed during implementation (GoTrue filter query param format and storageState file clobber). Both are documented above.
