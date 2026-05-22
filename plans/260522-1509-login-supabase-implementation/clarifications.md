# Clarifications — Login + Supabase Local

## Session 2026-05-22

- Q: Where should the user be redirected after a successful Google login? → A: Keep `/` (home page) — uses `NEXT_PUBLIC_AUTH_REDIRECT=/` from `.env.local`. Current Next.js starter is the post-login landing.
- Q: Google OAuth for local Supabase — credentials available, or fallback? → A: Real Google credentials in `supabase/.env` (assume `GOOGLE_CLIENT_ID` + `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` are set by the user). Wire `signInWithOAuth({provider:'google'})` and OAuth callback handler.
- Q: How should language selection (VN ↔ EN) be persisted? → A: Cookie + tiny custom dictionary (no library). Cookie name `lang`. Dictionary covers Login + dropdown strings only (YAGNI).
- Q: Where should authenticated-user redirect logic live? → A: Inside `app/login/page.tsx` server component. Check Supabase session at top of page, call `redirect(NEXT_PUBLIC_AUTH_REDIRECT)` if authed. No middleware for now.

## MoMorph refs
- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Dropdown-ngôn ngữ: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/hUyaaugye2
