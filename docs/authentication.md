# Authentication

Google OAuth via Supabase SSR. Applies to Next.js 16 (this project's version).

---

## Environment Variables

### `.env.local` (app)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. Local: `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `NEXT_PUBLIC_AUTH_REDIRECT` | Yes | Path to redirect after successful OAuth. E.g. `/dashboard` |
| `NEXT_PUBLIC_SITE_URL` | Prod only | Full origin used for OAuth `redirectTo`. Falls back to request `Origin` header in dev |

### `supabase/.env` (local Supabase only, gitignored)

Copy `supabase/.env.example` and fill in real values:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-client-secret
```

Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- Application type: Web application
- Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`

---

## OAuth Flow

```
User clicks "Sign in with Google"
  → signInWithGoogle() [app/login/actions.ts]
  → supabase.auth.signInWithOAuth() → redirect to Google
  → Google redirects to /auth/callback?code=...
  → exchangeCodeForSession(code) [app/auth/callback/route.ts]
  → redirect to NEXT_PUBLIC_AUTH_REDIRECT
```

Errors at any step redirect to `/login?error=<encoded message>`. The login page reads the `error` query param and renders a translated error string via `t(lang, 'login.error.oauth')` — no raw query value is rendered (XSS-safe).

---

## Supabase Clients (`lib/supabase/`)

| File | Use |
|---|---|
| `client.ts` | Browser components — `createBrowserClient` |
| `server.ts` | Server components and route handlers — `createServerClient` with `next/headers` cookies |
| `middleware.ts` | Edge/proxy context — `updateSession()` called by `proxy.ts` on every request |

---

## proxy.ts (Next.js 16)

Next.js 16 renamed `middleware.ts` → `proxy.ts` and the exported function from `middleware` → `proxy`. The file at project root calls `updateSession()`, which silently refreshes the Supabase access token on every request so server components always see a valid session.

Do not create a `middleware.ts` at the project root — it is ignored in Next.js 16.

---

## Internationalisation (`lib/i18n/`)

Cookie-based, no routing changes needed.

| File | Role |
|---|---|
| `dictionary.ts` | `vi`/`en` string map + `t(lang, key)` helper. Cookie name: `lang`. Default: `vi` |
| `get-lang.ts` | `getLang()` — reads `lang` cookie server-side, returns `Language` |
| `actions.ts` | `setLanguage(lang)` server action — writes `lang` cookie, triggers page rerender |

The language switcher UI calls `setLanguage` via `useTransition`. All UI strings flow through `t(lang, key)` — no hard-coded copy in components.
