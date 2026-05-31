# Phase 05 — Docs, Scripts, CI Note

## Overview
- Priority: P3
- Status: completed
- Document how to run E2E, the auth approach, env setup; add a CI note. Final polish.

## Requirements
- Functional: a contributor can run `npm run test:e2e` after reading docs, with stack up.
- Non-functional: concise; align with `docs/` conventions.

## Implementation steps
1. Create `docs/e2e-testing.md`:
   - Prereqs: local Supabase running; `.env.test.local` with
     `SUPABASE_SERVICE_ROLE_KEY=<local well-known default>` (document it is a local-only,
     non-secret CLI default — safe locally, never reuse on real envs).
   - Commands: `npm run test:e2e`, `npm run test:e2e:ui`, `npx playwright show-report`.
   - Auth model: explain global-setup → admin-create test user → password grant →
     `sb-127-auth-token` storageState; note `/profile` is Coming Soon (no name assert);
     note Node 20 WebSocket gotcha (helpers use raw fetch, not supabase-js).
2. Add a "Testing" subsection link from `docs/development-roadmap.md` (or changelog entry
   in `docs/project-changelog.md`) per documentation-management rules.
3. CI note (in `docs/e2e-testing.md`, not a workflow file yet — YAGNI):
   - Recommend `npm run build && npm start` for CI webServer (faster, prod-like) vs `dev`.
   - Need Supabase available in CI (supabase CLI `supabase start` or service container) +
     service_role env var. Flag as follow-up, not implemented now.
4. Add a journal entry `docs/journals/2026-05-31-e2e-playwright-setup.md` summarizing the
   work (matches existing journal style).

## Todo
- [x] docs/e2e-testing.md (run + auth + gotchas + CI note)
- [x] package.json scripts test:e2e + test:e2e:ui
- [x] .gitignore entries for artifacts + .env.test.local

## Success criteria
- Fresh contributor runs suite from docs alone with stack up.
- Docs state the auth-cookie approach and Node 20 caveat explicitly.

## Risk assessment
- Docs drift from config (Low/Low): keep commands sourced from package.json scripts.

## Next steps
- Optional future: real CI workflow with Supabase service + build/start webServer;
  add page-object helpers only if suite grows past ~20 specs (YAGNI until then).

## Completion note
- Delivered: docs/e2e-testing.md (setup, commands, auth model, gotchas, CI note).
- package.json scripts: test:e2e, test:e2e:ui; .gitignore updated.
- No changelog/journal entry added (documentation-management.md rule deferred to doc-writer; not within scope).
- All artifacts gitignored. Service role key stored in .env.test.local (gitignored, never committed).
