# Plan — Login + Supabase (Google OAuth) + Language Dropdown

**Date:** 2026-05-22
**Branch:** master
**Status:** Implemented, reviewed, ready to ship

## Goal
Implement the Login page at `/login` per two MoMorph screens:
- **Login** (screenId `GzbNeVGJHz`)
- **Dropdown-ngôn ngữ** (screenId `hUyaaugye2`)

Wire Supabase local for Google OAuth authentication. Support VN/EN language switching via cookie + tiny custom dictionary.

## MoMorph refs
- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Dropdown: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
- Clarifications: [clarifications.md](./clarifications.md)
- Specs (CSV): [data/login-specs.csv](./data/login-specs.csv), [data/dropdown-specs.csv](./data/dropdown-specs.csv)
- Test cases (CSV): [data/login-testcases.csv](./data/login-testcases.csv)

## Phases

### Phase 1 — Track A: UI (parallel background subagents) ✅
Two `implementer` subagents in background, one per screen.
- **Login UI** → `app/login/page.tsx` + `app/login/_components/{login-header, login-hero, login-footer, login-actions, google-login-button, language-switcher}.tsx` + assets in `public/login/`
- **Dropdown UI** → `app/login/_components/language-dropdown.tsx` + flag SVGs in `public/login/flags/`
- Build passed. Visual validation deferred to integration (Bash blocked in subagent).

### Phase 2 — Track B: Backend wiring ✅
- `lib/supabase/{client,server,middleware}.ts` — SSR-friendly Supabase auth (cookie-based sessions, browser + server + edge variants)
- `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`, exported function must be `proxy`) — refreshes session cookies on every request
- `lib/i18n/{dictionary,get-lang,actions}.ts` — vi/en dictionary, cookie reader, `setLanguage` server action
- `app/login/actions.ts` — `signInWithGoogle` (Origin → NEXT_PUBLIC_SITE_URL fallback), `signOut`, defensive fallback redirect
- `app/auth/callback/route.ts` — OAuth code exchange, redirect to `NEXT_PUBLIC_AUTH_REDIRECT`

### Phase 3 — Integration ✅
Wire UI to Supabase actions and i18n dictionary:
- `login-actions.tsx` → `<form action={signInWithGoogle}>` with `useFormStatus` for pending state
- `language-switcher.tsx` → calls `setLanguage` server action via `useTransition`
- `page.tsx` → server-side auth guard (`getUser()` → `redirect` if authed); reads lang cookie; passes `lang` to children; renders OAuth error via dictionary key (no raw query value rendered → no XSS)
- All UI strings flow through `t(lang, key)` from `lib/i18n/dictionary.ts`

### Phase 4 — Tempering + Inspection ✅
- `npm run build` → clean
- `npx tsc --noEmit` (excl. `.next/`) → 0 errors
- `npx eslint app lib` → 0 errors
- Visual validation via Playwright at 1440×900:
  - `/login` renders pixel-close to Figma (header, hero, button, footer, background layers)
  - Language switcher opens dropdown
  - Click EN → cookie set → page reloads in English (welcome copy + button + footer all translated)
  - Click VN → reverts
- OAuth callback returns 307 for missing/invalid code (redirects to `/login?error=...`)
- Reviewer report: 0 critical, 3 major (all fixed: middleware/proxy added, OAuth redirect hardened, defensive fallback added), 4 minor (3 addressed: shared `Language` type)

## Test case coverage (Login)
- 45278c06 — unauthenticated visible: ✅ (page renders)
- f62b0c97 — authed redirected: ✅ (page.tsx auth guard)
- b9805e65 / 8415b629 — logo left / language right: ✅
- 33a1dacf — footer bottom: ✅
- 5fbe2a18 — background artwork: ✅
- 42b82364 — title + descriptions: ✅
- 6ae76d15 — button centered with Google icon: ✅
- 20d87e28 / 4426635b — dropdown opens on click: ✅
- 5f1cbabd — default VN: ✅
- 98e20775 — flag + chevron: ✅
- 60bc5bbb / e76aa170 — Google OAuth flow + redirect: ✅ (wired, requires real Google client_id in supabase/.env to fully exercise)
- 37eae882 — disabled with loader: ✅ (`useFormStatus` pending → `SpinnerIcon`)
- c18649fa — hover shadow: ✅ (Tailwind `hover:shadow-…`)
- cb42461d — hover highlight: ✅

## Files changed
**Created:**
- `app/auth/callback/route.ts`
- `app/login/actions.ts`
- `app/login/page.tsx`
- `app/login/_components/google-login-button.tsx`
- `app/login/_components/language-dropdown.tsx`
- `app/login/_components/language-switcher.tsx`
- `app/login/_components/login-actions.tsx`
- `app/login/_components/login-footer.tsx`
- `app/login/_components/login-header.tsx`
- `app/login/_components/login-hero.tsx`
- `lib/i18n/actions.ts`
- `lib/i18n/dictionary.ts`
- `lib/i18n/get-lang.ts`
- `lib/supabase/client.ts`
- `lib/supabase/middleware.ts`
- `lib/supabase/server.ts`
- `proxy.ts`
- `public/login/flags/{en,vn}.svg`
- `public/login/{mm-media-keyvisual-bg.png, mm-media-logo.png, mm-media-root-further-logo.png}`

**Updated:**
- `package.json` / `package-lock.json` — added `@supabase/ssr`, `@supabase/supabase-js`

## Known minor issues
- Next.js Image aspect-ratio warnings (dev-only) on flag + root-further logo; not blocking
- `<html lang="en">` hardcoded in `app/layout.tsx` (reviewer m4); low priority
- `metadata` in `page.tsx` hardcodes Vietnamese title (static export limitation)

## Unresolved questions
None.
