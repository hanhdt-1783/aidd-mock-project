# Clarifications — Countdown Prelaunch Page

## Session 2026-05-23

- Q: How should event datetime be stored in Supabase local? → A: New `event_config` table, single row, env fallback. Schema: `id uuid PK, event_datetime timestamptz, updated_at timestamptz`. Page reads DB first; falls back to `NEXT_PUBLIC_EVENT_DATETIME` if row missing or query errors. Editable via Supabase Studio.
- Q: Access control for /prelaunch? → A: Public — no auth required. Any visitor (anon, low-priv, admin, expired session) can view the countdown.
- Q: Background image missing — how to handle? → A: Fetch fresh signed URL via `get_media_files` MCP, update download script, run `npm run download-assets:prelaunch` during forge stage.

## Decisions inferred from specs (not asked)

- Q: Update interval? → A: 1s tick (matches Track A implementation and existing `home-countdown.tsx`).
- Q: T=0 behavior? → A: Show `00/00/00` and stay (matches test case `50fc4021`; no redirect).
- Q: Localization? → A: vi + en (Track A already added `prelaunch.*` keys to both locales).
- Q: Route path? → A: `/prelaunch` standalone (Track A scaffolded this).
- Q: Display units? → A: DAYS/HOURS/MINUTES only — no seconds (matches specs `0.2`, `1`, `2`, `3`).
