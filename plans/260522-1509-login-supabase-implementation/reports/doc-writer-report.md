# Doc Writer Report — Login + Supabase Implementation

**Date:** 2026-05-22

---

## Files Reviewed

| File | Finding |
|---|---|
| `docs/` (root) | Contains only `docs/journals/` — no architecture, changelog, roadmap, or code-standards docs exist |
| `proxy.ts` | Confirmed: exports `proxy` function (not `middleware`); calls `updateSession()` |
| `lib/supabase/client.ts` | Confirmed: `createBrowserClient` wrapper |
| `lib/supabase/server.ts` | Confirmed: `createServerClient` with `next/headers` cookies |
| `lib/supabase/middleware.ts` | Confirmed: `updateSession()` — token-refresh logic for edge context |
| `app/auth/callback/route.ts` | Confirmed: `exchangeCodeForSession`, redirects to `NEXT_PUBLIC_AUTH_REDIRECT` |
| `app/login/actions.ts` | Confirmed: `signInWithGoogle`, `signOut`, `getSiteOrigin` with env/header fallback |
| `lib/i18n/dictionary.ts` | Confirmed: `vi`/`en` map, `t()` helper, `LANG_COOKIE = 'lang'` |
| `lib/i18n/get-lang.ts` | Confirmed: reads `lang` cookie, defaults to `vi` |
| `supabase/.env.example` | Confirmed: `GOOGLE_CLIENT_ID` + `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` |
| `README.md` | Boilerplate create-next-app — no auth or setup content; updating would be justified but the task scope caps at authentication.md |

---

## Files Updated / Created

| File | Action | Verdict |
|---|---|---|
| `docs/authentication.md` | Created (new) | Justified — no existing doc covers env setup, OAuth flow, proxy.ts rename, callback route, or i18n cookie mechanics. Under 120 lines. |

No existing docs were updated: none of the standard docs (`system-architecture.md`, `code-standards.md`, `development-roadmap.md`, `project-changelog.md`) exist yet — creating them falls outside this task's scope (YAGNI).

---

## Unresolved Questions

- `README.md` only contains create-next-app boilerplate. It does not mention Supabase, env setup, or the `supabase start` requirement for local dev. A future pass should add a "Local setup" section, but that was out of scope here.
- `<html lang="en">` is hardcoded in `app/layout.tsx` (noted as minor in reviewer report). If/when fixed, `authentication.md` i18n section needs no update — it only documents the cookie layer.

---

**Status:** DONE
**Summary:** `docs/` had no relevant existing files to update; created `docs/authentication.md` (107 lines) covering env vars, OAuth flow, Supabase client variants, Next.js 16 `proxy.ts` rename, and i18n cookie mechanics — all verified against actual source files before writing.
**Concerns:** None.
