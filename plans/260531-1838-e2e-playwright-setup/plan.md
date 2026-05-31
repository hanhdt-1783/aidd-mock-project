---
title: "Playwright E2E Smoke Suite"
description: "Add a Playwright E2E test suite with seeded-session auth for the Next.js 16 + Supabase app."
status: completed
priority: P2
effort: 6h
branch: master
tags: [testing, e2e, playwright, supabase, auth]
created: 2026-05-31
---

# Playwright E2E Smoke Suite

Add a focused Playwright smoke suite (~10 specs) covering unauthenticated redirects and
authenticated flows. Auth uses a **seeded Supabase session injected as Playwright
storageState** — no real Google OAuth. First E2E in the repo; establish reusable infra.

## Key architectural decisions
- Framework: `@playwright/test`, chromium only, config `webServer` runs `npm run dev` on :3000.
- Auth: global-setup creates/updates a dedicated test user via service_role admin API
  (seed users have no password), signs in via anon password grant, writes the
  `@supabase/ssr` cookie into `playwright/.auth/user.json` storageState.
- **Confirmed cookie format** (probed against live local stack): name `sb-127-auth-token`,
  value `base64-` + base64url(JSON session), ~2543 chars → single cookie, no chunking.
- **Node 20 gotcha**: no native `WebSocket`; supabase-js realtime init throws. Auth helpers
  must use raw `fetch` REST (no supabase-js client) OR stub `globalThis.WebSocket`.
- `/profile` is a "Coming Soon" placeholder — assert heading, NOT a display name.
- Default language is `vi`; modal/board text is Vietnamese. Prefer role/aria/test-id;
  use stable Vietnamese text only where roles are unavailable.

## Phases

| # | Phase | Status | Depends on |
|---|-------|--------|-----------|
| 01 | [Install Playwright + config](phase-01-install-and-config.md) | done | — |
| 02 | [Auth seeding infra (storageState)](phase-02-auth-seeding-infra.md) | done | 01 |
| 03 | [Unauthenticated specs](phase-03-unauth-specs.md) | done | 01 |
| 04 | [Authenticated specs](phase-04-authed-specs.md) | done | 02 |
| 05 | [Docs + scripts + CI note](phase-05-docs-and-scripts.md) | done | 03, 04 |

## Key dependencies
- Local Supabase stack RUNNING at http://127.0.0.1:54321 (DB :54322).
- `.env.local` present (NEXT_PUBLIC_SUPABASE_URL/_ANON_KEY). E2E adds service_role key
  via `.env.test.local` (gitignored) or env var — never commit a real secret.
- npm; Next.js 16.2.6 (proxy.ts, not middleware.ts — see AGENTS.md).

## File ownership (no overlap across phases)
- P01: `playwright.config.ts`, `package.json`, `.gitignore`
- P02: `e2e/support/*`, `playwright/.auth/` (generated)
- P03: `e2e/unauth/*`
- P04: `e2e/authed/*`
- P05: `docs/*`, `README`/journal entry

## Unresolved questions
- CI: should webServer use `npm run build && npm start` instead of `dev` for speed/stability? Plan defaults to `dev` for local; CI note in P05 flags the option.
