# E2E Playwright Suite — Code Review

**Reviewer:** Staff Engineer (reviewer agent)
**Date:** 2026-05-31
**Scope:** playwright.config.ts, e2e/support/*.ts (4 files), e2e/unauth/*.spec.ts (3 files), e2e/authed/*.spec.ts (3 files), package.json + .gitignore changes
**Total LOC:** 522 (all files under 200-line limit ✓)

---

## Overall Assessment

Solid first E2E suite. Auth infra is well-thought-out (raw fetch to dodge the Node 20 WebSocket issue, documented cookie format, idempotent user provisioning, self-verification step). Spec files are concise and correctly partition unauth vs authed. **Two issues require fixes before merge** — one security-adjacent bug in env loading priority, and one logical issue where guard throws in `getEnv()` are unreachable dead code that could mislead future maintainers. Everything else is low priority.

---

## Critical Issues

None.

---

## High Priority

### H1 — `loadEnvFile` priority is inverted: `.env.test.local` can never override `.env.local`

**File:** `playwright.config.ts`, lines 9–21 + 24–25

**Problem:** The comment reads *"Later files override earlier ones — matches Next.js load order"* but the implementation does `if (!(key in process.env)) process.env[key] = val`. Because `.env.local` is loaded **first** (line 24) and this guard skips any key already present, values set in `.env.local` are frozen — `.env.test.local` (loaded line 25) can never override them.

Practical consequence: if a developer creates `.env.test.local` to point the E2E suite at a different `NEXT_PUBLIC_SUPABASE_URL` or to supply a real `SUPABASE_SERVICE_ROLE_KEY`, those values are silently ignored. Today this is masked because `SUPABASE_SERVICE_ROLE_KEY` is absent from `.env.local` so the fallback activates; but `NEXT_PUBLIC_SUPABASE_URL` is in `.env.local` and would block any test-local override.

**Fix:**

```ts
// WRONG — first writer wins, later files cannot override
if (!(key in process.env)) process.env[key] = val;

// CORRECT — later files win (matches Next.js test.local > local precedence)
process.env[key] = val;
```

Then call sites stay the same:
```ts
loadEnvFile(path.join(root, '.env.local'));       // baseline
loadEnvFile(path.join(root, '.env.test.local'));  // overrides baseline
```

---

### H2 — `getEnv()` null-guards are unreachable dead code (misleads readers)

**File:** `e2e/support/test-user.ts`, lines 29–31

**Problem:** All three variables have hardcoded non-falsy `??` fallbacks, so `!SUPABASE_URL`, `!ANON_KEY`, `!SERVICE_ROLE_KEY` are permanently false. The three `throw` statements will never execute.

This is not a runtime defect today, but it's actively misleading: a future reader might think removing a fallback or adding an env var is safe because "there's a validation guard" — but that guard does nothing. It also means misconfiguration (e.g. someone sets `SUPABASE_SERVICE_ROLE_KEY=` to an empty string in CI) would silently fall through to the fallback rather than throwing.

**Fix — option A (simplest):** Remove the dead guards entirely since all vars have defaults.

**Fix — option B (safer):** Remove the `??` fallbacks and keep the throw guards, so missing vars actually fail loudly:

```ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;          // no fallback
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;      // no fallback
if (!ANON_KEY) throw new Error('E2E: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
if (!SERVICE_ROLE_KEY) throw new Error('E2E: SUPABASE_SERVICE_ROLE_KEY is not set');
```

Option B is recommended: it forces CI to supply real credentials and removes the risk of the local demo JWT accidentally targeting a non-local URL.

---

## Medium Priority

### M1 — Security: hardcoded demo JWT keys could reach a non-local Supabase if `NEXT_PUBLIC_SUPABASE_URL` points elsewhere

**File:** `e2e/support/test-user.ts`, lines 22 + 27

The hardcoded ANON and SERVICE_ROLE JWTs are the well-known Supabase local CLI defaults (decoded payload: `iss=supabase-demo`). They will authenticate against **any** local Supabase instance started with `supabase start`. However, if a developer's `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` pointing to a staging or hosted instance (e.g. after a config swap), and `SUPABASE_SERVICE_ROLE_KEY` is not set, `getEnv()` silently returns the local demo service_role key. That key will be rejected by hosted Supabase (different JWT secret), so no admin action would succeed — but the attempt will leave an auth log entry and the local test suite would fail with a confusing error.

The root cause is H1 + H2 above. Fixing both eliminates this risk: with H1 fixed, `.env.test.local` can supply a test-specific URL; with H2 fixed (option B), absence of `SUPABASE_SERVICE_ROLE_KEY` is a hard failure, not a silent fallback.

No immediate action needed beyond fixing H1 and H2, but the comment on line 19–20 of `test-user.ts` ("Well-known non-secret local CLI default ... safe to document") should be extended with a caveat: *"Only safe when SUPABASE_URL is also local."*

---

### M2 — Redundant double-check in global setup verification

**File:** `e2e/support/global.setup.ts`, lines 36–46

Lines 37–43 manually check `finalUrl.includes('/login')` and throw. Lines 46's `expect(verifyPage).not.toHaveURL(/\/login/)` then repeats the same assertion via Playwright's expect API. The second check can never surface a different outcome. Remove lines 36–43 and rely solely on Playwright's `expect` + timeout for cleaner failure messages.

---

### M3 — Weak heading assertions in two specs

**Files:** `e2e/unauth/prelaunch-page.spec.ts:15`, `e2e/authed/profile-secret-awards.spec.ts:38`

Both use `page.getByRole('heading', { level: 1 })` without a `name` option. This would pass for any h1 on the page, including an error boundary's "500 Server Error" heading. Adding the known text strengthens signal:

- prelaunch: `getByRole('heading', { level: 1, name: /Sự kiện/ })` (partial, survives minor copy tweaks)
- awards: `getByRole('heading', { level: 1, name: /giải thưởng/ })` (partial match on the stable noun)

Plan acknowledges the Vietnamese text preference; these specific partial matches are low-fragility.

---

### M4 — Seeded-kudo assertion is data-dependent without comment

**File:** `e2e/authed/kudos-board.spec.ts`, line 23

```ts
const seededKudoTitle = page.getByText(/IDOL GIỚI TRẺ|NGƯỜI TRUYỀN CẢM HỨNG|NGƯỜI THẦY TẬN TÂM/).first();
```

This assertion passes only if the seed data is present. If someone runs `supabase db reset` without re-seeding, this test fails with a confusing locator-not-found error rather than a clear "seed data missing" message. A comment noting the dependency on `supabase/seed.sql` would prevent wasted debugging time.

---

## Low Priority

### L1 — `browser()!` non-null assertion in global.setup.ts

**File:** `e2e/support/global.setup.ts`, line 31

`page.context().browser()!` — the `!` is safe in Playwright's standard fixture context (browser is always set), but it's worth a brief comment to explain why the assertion is intentional:

```ts
// browser() is always defined in a Playwright fixture context (not a detached page)
const context = await page.context().browser()!.newContext({ storageState: AUTH_FILE });
```

---

### L2 — `lookupUserId` takes first result from `filter=` search

**File:** `e2e/support/supabase-admin.ts`, line 84

`data.users?.[0]?.id` — GoTrue's `filter` param does substring text search, not exact-email lookup. If two test users share a common prefix (unlikely with `e2e-test@sun-asterisk.com`) the wrong user could be updated. Not a real risk with the current single test user, but worth a brief comment noting this is a text search, not exact match.

---

### L3 — `test:e2e:ui` script works only with `@playwright/test` CLI, not via `npx`

**File:** `package.json`

The script is `playwright test --ui` (no `npx`). Since `@playwright/test` is in devDependencies and `npm run` resolves `node_modules/.bin`, this is fine. No action needed — just noting it's correct.

---

### L4 — `reporter: 'html'` only; no `list` reporter for CI stdout

**File:** `playwright.config.ts`, line 32

HTML reporter alone means CI log shows no inline pass/fail output — only a report artifact. Standard pattern is:

```ts
reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',
```

or at minimum `[['list'], ['html']]`. Nice-to-have for CI readability.

---

## Edge Cases Found (Scouting Phase)

1. **`/standards` is a protected route (calls `getUser`) but is not in `PROTECTED_ROUTES` test array.** Checked: `app/standards/page.tsx` checks the user but does **not** call `redirect('/login')` when unauthenticated — it renders a public "Coming Soon" view instead. So the omission is correct, not a gap.

2. **Cookie domain `localhost` vs app running on `localhost:3000`.** Browsers treat `localhost` cookies port-agnostically. Correct for Playwright's purposes.

3. **Session expiry during long test runs.** The E2E session is written once in global setup. If tests take >1 hour, the access token could expire. Mitigation: `expires_at` in the session object is far future for new tokens; `proxy.ts` refreshes via `updateSession`/`getUser` on each request. Low risk for a smoke suite.

4. **`fullyParallel: true` with `setup → chromium` dependency chain.** The dependency is correctly declared. Parallel execution within `chromium` project is safe since all authed specs use `test.use({ storageState: AUTH_FILE })` pointing at a shared read-only file.

5. **Unauth specs using `test.use({ storageState: { cookies: [], origins: [] } })`.** This correctly overrides any project-level storageState default and guarantees anonymous context regardless of future project config changes. Good defensive practice.

---

## Positive Observations

- Raw fetch approach (no supabase-js) correctly avoids the Node 20 WebSocket issue; well-documented in comments.
- `writeStorageState` with chunking support is future-proof without being over-engineered.
- Self-verification step in `global.setup.ts` catches cookie format regressions before any spec runs.
- All spec files correctly declare `test.use({ storageState: ... })` — no authed spec accidentally relies on ambient browser state.
- Idempotent user provisioning (`ensureTestUser`) handles the 422/already-exists case cleanly.
- File sizes all well under 200 lines; clear separation of concerns across support modules.
- `.gitignore` correctly covers `playwright/.auth/`, `.env.test.local`, `test-results/`, `playwright-report/`.
- `tsc --noEmit` passing clean is confirmed by implementer report.
- Plan adherence: all three documented deviations are corrections to plan assumptions based on runtime observations, not quality regressions.

---

## Recommended Actions (priority order)

1. **Fix H1** — flip `loadEnvFile` to use assignment (not guard-on-existing) so `.env.test.local` can override `.env.local`.
2. **Fix H2** — remove `??` fallbacks from ANON_KEY and SERVICE_ROLE_KEY; let the throw guards do real work.
3. **Fix M2** — remove redundant manual URL check in `global.setup.ts` lines 36–43; keep `expect()`.
4. **Fix M3** — add partial `name:` to the two level-1 heading assertions in prelaunch and awards specs.
5. **Add comment (M4)** — note seed data dependency in `kudos-board.spec.ts`.
6. **Add comment (L1)** — explain `browser()!` is safe in fixture context.

Items 1–2 are must-fix-before-merge. Items 3–6 are nice-to-have.

---

## Metrics

- Files reviewed: 11 source files + 2 config/ignore diffs
- Total LOC: 522 (all under 200-line limit)
- TypeScript errors: 0 (confirmed by implementer)
- Linting issues: 0 reported
- Security concerns: none critical (H1+H2 address the only meaningful risk surface)
- Plan adherence: full; 3 documented deviations are all reasonable runtime corrections

---

## Score: 7.5 / 10

**Verdict: APPROVE WITH FIXES** — H1 and H2 must be corrected before merge. All other findings are low-impact improvements. The architectural decisions (raw fetch, cookie format replication, self-verification, storageState injection) are sound and well-executed.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** 11 E2E files reviewed. Auth seeding infra is correct and well-documented. Two must-fix issues before merge: inverted env-file priority (`.env.test.local` silently ignored) and dead-code null-guards in `getEnv()` that mask misconfiguration.
**Concerns/Blockers:** H1 (`loadEnvFile` priority inverted — test.local values are silently discarded) and H2 (`getEnv()` throws are unreachable dead code — misconfigured CI would silently use local demo keys) must be fixed before merge.
