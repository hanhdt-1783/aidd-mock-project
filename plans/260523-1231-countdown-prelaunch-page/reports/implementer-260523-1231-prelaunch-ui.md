---
date: 2026-05-23
task: Countdown - Prelaunch page UI implementation
screen: 8PJQswPZmU
fileKey: 9ypp4enmFmdK3YAFJLIu6C
status: DONE_WITH_CONCERNS
---

## Files Created / Modified

| File | Type | Lines | Notes |
|------|------|-------|-------|
| `app/prelaunch/page.tsx` | Server component (new) | 20 | Route entry point |
| `app/_components/prelaunch/prelaunch-countdown-page.tsx` | Client component (new) | 105 | Root page component |
| `app/_components/prelaunch/prelaunch-countdown-unit.tsx` | Client component (new) | 54 | One DAYS/HOURS/MINUTES block |
| `app/_components/prelaunch/prelaunch-digit-tile.tsx` | Client component (new) | 59 | Single LED digit tile |
| `app/_components/prelaunch/prelaunch-countdown-logic.ts` | Pure TS (new) | 52 | Countdown computation |
| `lib/i18n/dictionary.ts` | Modified | +10 lines | Added `prelaunch.*` keys |
| `scripts/download-prelaunch-assets.mjs` | Script (new) | 72 | Asset downloader — URL refresh needed |
| `package.json` | Modified | +1 line | Added `download-assets:prelaunch` script |

## Component Tree

```
app/prelaunch/page.tsx (Server)
  └── PrelaunchCountdownPage (Client)
        ├── [bg div]          — /prelaunch/bg-image.png
        ├── [overlay div]     — gradient 18deg
        └── [content div]
              ├── <h1>        — prelaunch.title (vi/en)
              └── [units row]
                    ├── PrelaunchCountdownUnit (days)
                    │     ├── PrelaunchDigitTile (d1)
                    │     ├── PrelaunchDigitTile (d2)
                    │     └── <span> DAYS
                    ├── PrelaunchCountdownUnit (hours)
                    └── PrelaunchCountdownUnit (minutes)
```

## Props Interface

```ts
// Page (server)
// No props — reads lang from getLang(), targetIso from getEventDatetime()

// PrelaunchCountdownPage (client)
{ lang: Language; targetIso: string | null }

// PrelaunchCountdownUnit (client)
{ display: string; label: string }

// PrelaunchDigitTile (client)
{ digit: string }
```

## i18n Keys Added

| Key | vi | en |
|-----|----|----|
| `prelaunch.meta.title` | Sun* Annual Awards 2025 | Sun* Annual Awards 2025 |
| `prelaunch.title` | Sự kiện sẽ bắt đầu sau | The event will start in |
| `prelaunch.days` | DAYS | DAYS |
| `prelaunch.hours` | HOURS | HOURS |
| `prelaunch.minutes` | MINUTES | MINUTES |

## Design Values (from Figma MCP)

- Background: `MM_MEDIA_BG Image` node 2268:35129 — 1512×1077 dark organic pattern
- Cover gradient: `linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0.00) 63.41%)`
- Title: Montserrat 700 36px/48px, color `#FFFFFF`
- Digit tile (desktop): 77×123px, border-radius 12px, `0.75px solid #FFEA9E` border, gradient bg + 0.5 opacity + blur 25px
- Digit font: "Digital Numbers" ~73.73px 400 white
- Units gap: 60px (desktop) → clamp(20px, 5vw, 60px) responsive
- Tile gap: 21px (desktop) → clamp(8px, 1.5vw, 21px) responsive
- Title↔units gap: 24px
- Label: Montserrat 700 36px/48px, white

## Visual Validation

| Viewport | Status | Notes |
|----------|--------|-------|
| 1512×1077 (Figma size) | PASS | Layout matches design. BG image absent. |
| 375×812 (mobile) | PASS | All 3 units fit single row via clamp scaling |
| Background image | PENDING | `public/prelaunch/bg-image.png` not downloaded |

## Concerns

1. **Background asset not downloaded** — `public/prelaunch/bg-image.png` is missing. The signed URL (600s TTL) from `get_media_files` expired before we could run curl (permission denied). To fix: run `npm run download-assets:prelaunch` after updating the URL in `scripts/download-prelaunch-assets.mjs` with a fresh signed URL from `get_media_files(screenId="8PJQswPZmU")`.

2. **Background position** — Figma specifies `backgroundPosition: "-142px -789.753px"` with `backgroundSize: "109.392% 216.017%"`. These are fixed-pixel offsets from the original 1512×1077 frame; on truly large screens the crop may drift slightly. Acceptable for this screen's use case.

## Assumptions (for backend integration)

- `targetIso` prop is a plain ISO string or null. The backend agent should pass `eventDate.toISOString()` (already done in `page.tsx` via `getEventDatetime()`).
- Auth gate is out of scope — the page currently renders without auth. Backend agent should add a redirect in `page.tsx` if auth is required (read Supabase session in the server component).
- At T=0, countdown shows "00" tiles — no redirect or "event started" state. Backend agent should decide navigation behavior at expiry.
- Route is `/prelaunch` — no dynamic segments needed.
