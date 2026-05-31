# Phase 02 — Auth Seeding Infra (storageState) — HIGHEST RISK

## Overview
- Priority: P1
- Status: completed
- Build a global-setup that produces a Playwright `storageState` carrying a valid
  `@supabase/ssr` session cookie, so authed specs reach server components without OAuth.

## Key insights (researched, confirmed against live local stack)
- **Cookie name**: `sb-127-auth-token`. Ref `127` = first label of host `127.0.0.1`
  (supabase-js default storageKey = `sb-${urlHostFirstLabel}-auth-token`).
- **Cookie value**: literal prefix `base64-` + base64url(JSON.stringify(session)).
  Session JSON = the token endpoint response (access_token, refresh_token, expires_at,
  expires_in, token_type, user). Verified length ~2543 chars < MAX_CHUNK_SIZE (3180) →
  **single cookie, no `.0/.1` chunking** for a normal session.
- **Node 20 WebSocket gotcha**: instantiating a supabase-js client (even `createServerClient`)
  triggers realtime init which throws "Node.js 20 detected without native WebSocket".
  => Setup helpers MUST avoid supabase-js entirely and use raw `fetch` to the GoTrue
  REST API. This sidesteps the issue and keeps zero extra deps.
- Seed users use provider 'seed' with NO password → cannot password-grant directly.
  Must provision a dedicated email/password test user via admin API first.

## Data flow
1. global.setup.ts reads SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY from env.
2. `ensureTestUser()` → POST /auth/v1/admin/users (service_role) with
   `{ email, password, email_confirm: true }`. If 422 "already registered" → look up id
   via GET /auth/v1/admin/users?... and PUT password to keep idempotent.
3. (Optional) ensure a `profiles` row exists with a known display_name via REST/PostgREST
   using service_role — only if an authed spec asserts on it. (Profile page is Coming Soon,
   so NOT required for current specs; document as future hook.)
4. `signIn()` → POST /auth/v1/token?grant_type=password (anon key) → session JSON.
5. `buildStorageState(session)`:
   - cookieValue = `'base64-' + base64url(JSON.stringify(session))`.
   - Compute name = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`
     (yields `sb-127`). Do NOT hardcode — derive so it survives URL changes.
   - Write Playwright storageState JSON: `{ cookies: [{ name, value, domain: 'localhost',
     path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' }], origins: [] }`.
   - **Chunking guard**: if encoded value > 3180, split into `${name}.0`, `${name}.1`, ...
     to match `@supabase/ssr` `combineChunks`. (Defensive; current session fits in one.)
6. Persist to `playwright/.auth/user.json`. Authed project loads it via `storageState`.

## Verification inside setup (fail fast)
- After writing state, open a context with that storageState, `goto('/kudos')`, assert URL
  is NOT `/login` (i.e. session accepted by server `getUser()`). If redirected → throw with
  a clear message so the whole authed suite fails loudly, not silently.

## Related code files
- Create: `e2e/support/global.setup.ts` (orchestrates 1–6 + verification)
- Create: `e2e/support/supabase-admin.ts` (ensureTestUser, signIn — raw fetch, <120 lines)
- Create: `e2e/support/storage-state.ts` (buildStorageState, cookie name derive, chunking)
- Create: `e2e/support/test-user.ts` (constants: TEST_EMAIL `e2e-test@sun-asterisk.com`,
  TEST_PASSWORD, AUTH_FILE path) — single source of truth
- Generated: `playwright/.auth/user.json`
- Read: `lib/supabase/server.ts`, `lib/supabase/middleware.ts` (cookie contract reference)

## Implementation steps
1. `test-user.ts`: export TEST_EMAIL, TEST_PASSWORD (from env or default), AUTH_FILE,
   getEnv() reading SUPABASE_URL/ANON/SERVICE_ROLE with thrown errors if missing.
2. `supabase-admin.ts`: `ensureTestUser()` (create→on-conflict update password),
   `signInWithPassword()` returning session JSON. All via `fetch`. No supabase-js import.
3. `storage-state.ts`: `cookieName(url)`, `encodeSession(session)`, `chunk(value, name)`,
   `writeStorageState(session, file)`.
4. `global.setup.ts`: wire steps; run verification context; write AUTH_FILE.
5. Keep service_role key OUT of git: read from `process.env.SUPABASE_SERVICE_ROLE_KEY`
   (set in `.env.test.local` for local). Document the well-known local default in P05 docs.

## Todo
- [x] test-user.ts constants + env loader
- [x] supabase-admin.ts (ensureTestUser, signIn via REST)
- [x] storage-state.ts (derive name, base64- encode, chunk guard, write JSON)
- [x] global.setup.ts (orchestrate + self-verify against /kudos)
- [x] Confirm playwright/.auth/user.json generated and gitignored

## Success criteria
- Running the `setup` project produces `playwright/.auth/user.json` with one
  `sb-127-auth-token` cookie whose value starts `base64-`.
- Self-verification step loads `/kudos` authed without redirect to `/login`.

## Risk assessment
- Cookie format drift if @supabase/ssr upgrades (Low/High): self-verify step catches it
  immediately; pin `^0.10.3`.
- Token expiry mid-run (Low/Med): expires_in ~3600s >> suite runtime; proxy.ts refreshes
  on first request anyway. storageState regenerated each setup run.
- WebSocket throw if someone reintroduces supabase-js in setup (Med/High): documented;
  raw fetch only. Add code comment.
- `sameSite`/`secure` mismatch causing browser to drop cookie on http://localhost
  (Med/High): use `secure: false`, `sameSite: 'Lax'`, `domain: 'localhost'`.

## Security considerations
- service_role key is a local dev secret; never commit. Use `.env.test.local` (gitignored).
- Test user is local-only; do not reuse against staging/prod.

## Next steps
- Unblocks Phase 04 (authed specs).

## Completion note
- Delivered: e2e/support/{test-user.ts, supabase-admin.ts, storage-state.ts, global.setup.ts}; playwright/.auth/user.json (gitignored).
- Auth flow: admin API → create test user → password grant → sb-127-auth-token cookie (base64- encoded).
- Self-verification confirms storageState loads /kudos without redirect.
- No seeded-user mutation approach used; test user created via admin API with password grant.
