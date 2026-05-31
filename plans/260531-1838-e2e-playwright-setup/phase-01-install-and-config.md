# Phase 01 — Install Playwright + Config

## Overview
- Priority: P1 (blocks all)
- Status: completed
- Install `@playwright/test`, chromium, write `playwright.config.ts`, scripts, gitignore.

## Requirements
- Functional: `npx playwright test` discovers specs under `e2e/`, boots dev server, runs chromium.
- Non-functional: KISS — one config, no projects sprawl beyond setup + chromium.

## Architecture / data flow
- Playwright config `webServer` spawns `npm run dev` (port 3000), waits for ready, reuses
  existing server locally. Two project deps: `setup` (global auth) → `chromium` (specs).

## Related code files
- Create: `playwright.config.ts`
- Modify: `package.json` (scripts + devDep), `.gitignore`
- Read: `package.json`, `node_modules/next/dist/docs/` only if dev-server start flags differ.

## Implementation steps
1. `npm i -D @playwright/test && npx playwright install chromium`.
2. Create `playwright.config.ts`:
   - `testDir: './e2e'`, `fullyParallel: true`, `forbidOnly: !!process.env.CI`,
     `retries: process.env.CI ? 1 : 0`, `reporter: 'html'`.
   - `use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' }`.
   - `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 120_000 }`.
   - `projects`:
     - `{ name: 'setup', testMatch: /global\.setup\.ts/ }`
     - `{ name: 'chromium', use: devices['Desktop Chrome'], dependencies: ['setup'] }`
   - Load `.env.local` + `.env.test.local` via `dotenv` at top of config (so service_role key is available to setup). Use Node's built-in if dotenv absent; `dotenv` is already an indirect dep of Next but add explicit `import 'dotenv/config'` fallback guarded.
3. `package.json` scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.
4. `.gitignore`: add `/test-results/`, `/playwright-report/`, `/playwright/.auth/`, `.env.test.local`.

## Todo
- [x] Install @playwright/test + chromium
- [x] Write playwright.config.ts (setup→chromium deps, webServer)
- [x] Add test:e2e scripts
- [x] Update .gitignore

## Success criteria
- `npm run test:e2e -- --list` lists specs without launching a browser error.
- Config typechecks (`npx tsc --noEmit` clean for config if included in tsconfig, else no error on run).

## Risk assessment
- Port 3000 in use (Med/Low): `reuseExistingServer` mitigates locally.
- dev-server slow first compile (Med/Med): `webServer.timeout: 120s`.
- Next 16 dev flag drift (Low/Med): verify `npm run dev` = `next dev` (confirmed in package.json).

## Rollback
- Revert package.json, delete playwright.config.ts + .gitignore lines. No app code touched.

## Next steps
- Phase 02 (auth infra) and Phase 03 (unauth specs) can both start after this.

## Completion note
- Delivered: playwright.config.ts with chromium project, manual .env loader (dotenv fallback), webServer `npm run dev` on :3000, setup→chromium chain.
- All checkboxes passed. Config typechecks, specs discover correctly.
