# Clarifications — Homepage SAA Implementation

## Session 2026-05-22
- Q: Routing scope for navigation links (Awards Information, Sun* Kudos) → A: Stub routes (`/awards`, `/kudos`) with placeholder "Coming Soon" pages; "About SAA 2025" scrolls to top of `/`.
- Q: How is admin role detected for the account menu? → A: Profiles table in Supabase with `role` column (`admin`/`user`), FK to `auth.users(id)`, RLS so users read own row, trigger auto-creates row on signup.
- Q: Event datetime env var name and fallback? → A: `NEXT_PUBLIC_EVENT_DATETIME` (ISO-8601). If missing/invalid → countdown shows `--`, "Coming soon" label hidden, no crash.
- Q: Notification bell panel + widget button menu in scope? → A: Stub — render the buttons + visual badge, click is a no-op. Full dropdowns deferred.
