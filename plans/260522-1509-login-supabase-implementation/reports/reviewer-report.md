# Reviewer Report — Login + Supabase Implementation

**Date:** 2026-05-22
**Reviewer:** reviewer agent
**Files reviewed:** 14 files (login page, server actions, callback route, Supabase clients, i18n layer, all login components)

---

## Summary

Solid, idiomatic implementation with one architectural omission (missing middleware) that affects session refresh correctness in production, one security-adjacent concern (origin header spoofability for OAuth redirect_to), and a handful of minor issues. No critical security vulnerabilities. Ready to merge with recommended fixes addressed.

---

## Critical

None.

---

## Major

### M1 — No middleware: token refresh will silently fail for Server Component renders

`lib/supabase/server.ts` `setAll()` swallows its error with the comment "middleware refreshes the session instead." There is **no `middleware.ts`** in the project. The official `@supabase/ssr` pattern requires a middleware that re-calls `supabase.auth.getUser()` on each request so refreshed tokens are written back to cookies. Without it:

- A user with an **expired access token but valid refresh token** calls `LoginPage` → `getUser()` triggers a token refresh internally → the refreshed token **cannot be written to cookies** (Server Component context, `setAll` throws and is silently swallowed) → user is treated as unauthenticated → redirected to `/login` despite having a valid session.
- Effect: invisible session expiry loop after the JWT access token TTL (typically 1 hour).

**Fix:** add `middleware.ts` at the project root following the Supabase SSR middleware pattern:
```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()
  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
```

---

### M2 — `signInWithGoogle` derives `redirectTo` from the `Origin` request header

`app/login/actions.ts` line 9:
```ts
const origin = (await headers()).get('origin') ?? 'http://localhost:3000';
```

The `Origin` header in a server action POST is set by the browser and reflects the page origin. In normal usage this is safe. The risks:

1. **Fallback to `localhost:3000`** — if any proxy strips the `Origin` header in production (not uncommon with some reverse proxies), `redirectTo` becomes `http://localhost:3000/auth/callback`. Supabase will reject this unless localhost is in the allowed-redirect list (which it shouldn't be in prod). Results in a broken OAuth flow, not exploitable but user-facing failure.

2. **Supabase's allowed-redirect-URLs list is the real guard** — if that list is misconfigured to include wildcards (`*`), a CSRF-like request with a forged `Origin` could redirect the OAuth callback to an attacker-controlled domain. This is a configuration risk, not a code risk, but the code offers no defense-in-depth.

**Fix (lower risk, more robust):**
```ts
const origin = process.env.NEXT_PUBLIC_SITE_URL 
  ?? (await headers()).get('origin') 
  ?? 'http://localhost:3000';
```
Add `NEXT_PUBLIC_SITE_URL` to env config. Keeps `headers()` as fallback for dev.

---

### M3 — Silent failure when `signInWithOAuth` returns no URL and no error

`app/login/actions.ts` lines 22–24:
```ts
if (data?.url) {
  redirect(data.url);
}
// function returns void — no redirect, no error shown to user
```

If Supabase returns `{ data: { url: null }, error: null }` (can happen in edge cases or misconfig), the server action returns silently. The user clicks the button, the spinner appears briefly, and nothing happens. No error message, no feedback.

**Fix:**
```ts
if (data?.url) {
  redirect(data.url);
}
redirect(`/login?error=${encodeURIComponent('OAuth provider unavailable')}`);
```

---

## Minor

### m1 — `Language` type duplicated in `language-dropdown.tsx`

`app/login/_components/language-dropdown.tsx` line 6 defines `export type Language = 'vi' | 'en'` independently from `lib/i18n/dictionary.ts`. The exported type is never imported anywhere — `language-switcher.tsx` imports `Language` from `dictionary.ts`. The local redefinition is dead code.

**Fix:** Remove the local type declaration, import from `@/lib/i18n/dictionary` as the other components do.

---

### m2 — `useEffect` dependency on inline `onClose` arrow function

`app/login/_components/language-dropdown.tsx` lines 43–57: the `useEffect` has `[onClose]` as its dependency. `onClose` is passed from `LanguageSwitcher` as `() => setIsOpen(false)` — a new function reference on every render. This causes the `mousedown` event listener to be removed and re-registered on every render cycle of the parent. No functional bug, but unnecessary overhead and a potential gap window between deregister/register.

**Fix:** Pass `useCallback`-memoized `onClose` from the parent, or remove `onClose` from the dependency array (ESLint will flag this — suppress with a comment and rationale).

---

### m3 — Hardcoded Vietnamese strings in `page.tsx` metadata

`app/login/page.tsx` lines 11–12:
```ts
title: "Đăng nhập — Sun* Annual Awards 2025",
description: "Đăng nhập để khám phá Sun* Annual Awards 2025",
```

`metadata` is a static export — it cannot be async or depend on cookies. This is a known Next.js constraint, so the only options are: accept the hardcoded VI strings, or use `generateMetadata()` (async, supports cookies). The current approach is fine for an MVP. Log it as tech debt if EN locale is expected to show EN meta tags.

---

### m4 — `<html lang="en">` hardcoded in root layout

`app/layout.tsx` line 27 has `lang="en"` regardless of the user's language cookie. This is technically incorrect for VI users (affects screen readers and browser translation detection). The root layout is a Server Component and can call `getLang()` async. Low priority given the MVP scope, but worth noting for accessibility.

---

### m5 — Lang cookie missing `secure` flag

`lib/i18n/actions.ts`: `cookieStore.set(LANG_COOKIE, lang, { maxAge, sameSite: 'lax', path: '/' })` — no `secure: true`. The language preference is not sensitive, so this is low-risk. In production under HTTPS, setting `secure` is a hygiene best practice. Can be conditioned on `process.env.NODE_ENV === 'production'`.

---

### m6 — `LanguageDropdown` double-calls `onClose` on option select

When a language option is clicked, `LanguageDropdown.handleSelect` calls both `onSelect(lang)` and `onClose()`. `LanguageSwitcher.handleSelect` (the `onSelect` receiver) already calls `setIsOpen(false)`. So `setIsOpen(false)` fires twice per selection. React deduplicates same-value state updates, so no visible bug — purely redundant.

---

## Security Checklist Results

| Check | Result |
|---|---|
| XSS via `?error=` param | Safe — `t(lang, 'login.error.oauth')` returns dictionary string, raw `error` value never rendered |
| Open redirect in `/auth/callback` (`?next=`) | Safe — `${origin}${next}` prepends origin; `//attacker.com` becomes `https://myapp.com//attacker.com` |
| CSRF on server action | N/A — Next.js server actions include built-in CSRF protection (same-origin enforcement) |
| PKCE vs implicit flow | Safe — `@supabase/ssr` defaults to PKCE; `exchangeCodeForSession` is correct |
| `getUser()` vs `getSession()` | Correct — `getUser()` makes a server-side token validation call; `getSession()` only reads the local JWT |
| Auth cookies `httpOnly` | Managed by `@supabase/ssr` library (sets appropriate flags) |
| Secrets in source | None — `.env.local` is gitignored |
| Stack traces to user | None — only dictionary strings shown to users |
| SQL injection | N/A — no raw SQL |

---

## Test Case Coverage

| TC ID | Description | Result |
|---|---|---|
| 45278c06 | Unauthed → Login visible | Pass — no redirect for unauthenticated users |
| f62b0c97 | Authed → redirected from /login | Pass — `getUser()` → `redirect()` at top of page |
| 60bc5bbb | Click Google → OAuth flow starts | Pass — server action triggers `signInWithOAuth` |
| 37eae882 | Button disabled + spinner during auth | Pass — `useFormStatus.pending` correctly inside `<form>` |
| e76aa170 | Success → redirect to / | Pass (redirect) — `app/page.tsx` has no user display, acceptable at MVP stage |
| 4426635b | Click language → dropdown opens | Pass — `useState` toggle on button click |

---

## Positive Observations

- `getUser()` over `getSession()` for server-side auth guard is the correct and secure choice
- The `?error=` → `t(lang, key)` indirection is a clean pattern that eliminates XSS risk entirely
- Server/client component boundaries are correct throughout; all cross-boundary props are serializable primitives
- `useFormStatus` placement is correct: `SubmitButton` is a child of `<form action={...}>` ✓
- `setLanguage` server action validates `lang` against `LANGUAGES` before writing cookie ✓
- `exchangeCodeForSession` is correct for PKCE flow; callback handles both success and error paths ✓
- `aria-busy`, `aria-expanded`, `aria-haspopup`, `role="listbox"`, `role="option"` — good a11y coverage

---

## Score: 7.5 / 10

Blocked from auto-approve (≥9.5) by M1 (missing middleware — auth will silently break after token expiry) and M2 (origin-header dependency). M3 is a UX silent failure. All three are fixable in < 30 minutes.
