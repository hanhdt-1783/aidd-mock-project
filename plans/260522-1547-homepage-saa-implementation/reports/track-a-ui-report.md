# Track A — Homepage SAA UI — Hand-off Report

**Status:** DONE
**Date:** 2026-05-22

---

## Files Created / Modified

### New files

| File | Lines | Role |
|------|-------|------|
| `app/_components/home/home-header.tsx` | ~200 | Client component. Sticky header with logo, nav, auth controls |
| `app/_components/home/home-countdown.tsx` | ~120 | Client component. Live countdown using setInterval |
| `app/_components/home/home-hero.tsx` | ~238 | Server component. Hero section with keyvisual, countdown, event info, CTAs |
| `app/_components/home/home-root-further.tsx` | ~112 | Server component. Root Further prose block |
| `app/_components/home/home-award-card.tsx` | ~176 | Server component. Single award card UI |
| `app/_components/home/home-awards-section.tsx` | ~134 | Server component. Awards section with 6 cards |
| `app/_components/home/home-kudos-section.tsx` | ~175 | Server component. Sun* Kudos banner (responsive) |
| `app/_components/home/home-widget-button.tsx` | ~65 | Client component. Fixed bottom-right pill button |
| `app/_components/home/home-footer.tsx` | ~130 | Server component. Footer with nav + copyright |
| `scripts/download-home-assets.mjs` | ~80 | Node.js ESM script. One-time asset download from S3 presigned URLs |

### Modified files

| File | Change |
|------|--------|
| `app/page.tsx` | Replaced boilerplate with full home page composition |
| `lib/i18n/dictionary.ts` | Added ~60 `home.*` translation keys (vi + en) |
| `package.json` | Added `"download-assets:home"` npm script |

### Public assets saved to `public/home/`

```
keyvisual-bg.png        — Hero background keyvisual
root-further-logo.png   — ROOT FURTHER wordmark (451×200)
logo-header.png         — Header logo (52×48)
logo-footer.png         — Footer logo (69×64)
award-bg.png            — Award card background fill
award-top-talent.png    — Award name image
award-top-project.png   — Award name image
award-top-project-leader.png
award-best-manager.png
award-signature-creator.png
award-mvp.png
kudos-bg.png            — Kudos section background
kudos-logo.svg          — Sun* Kudos wordmark (364×72)
root-text.png           — Decorative ROOT background text
further-text.png        — Decorative FURTHER background text
```

---

## Component Tree

```
app/page.tsx (async server)
  ├── HomeHeader          (client, sticky, z-50)
  ├── main
  │   ├── HomeHero        (server)
  │   │   └── HomeCountdown (client)
  │   ├── HomeRootFurther (server)
  │   ├── HomeAwardsSection (server)
  │   │   └── HomeAwardCard × 6 (server)
  │   └── HomeKudosSection  (server)
  ├── HomeWidgetButton    (client, fixed)
  └── HomeFooter          (server)
```

---

## Props Each Component Expects

### `HomeHeader`
```ts
{
  lang: Language;
  isAuthenticated: boolean;
  isAdmin?: boolean;          // default false
  activeNav?: "about" | "awards" | "kudos";  // default none
}
```

### `HomeHero`
```ts
{
  lang: Language;
  countdownTargetIso?: string;  // ISO-8601, default "2025-12-26T18:30:00+07:00"
}
```

### `HomeCountdown`
```ts
{
  lang: Language;
  targetIso?: string;  // ISO-8601, default "2025-12-26T18:30:00+07:00"
}
```

### `HomeRootFurther`
```ts
{ lang: Language }
```

### `HomeAwardsSection`
```ts
{ lang: Language }
```

### `HomeAwardCard`
```ts
{
  lang: Language;
  award: AwardCardData;  // see type export from home-award-card.tsx
}
```

### `HomeKudosSection`
```ts
{ lang: Language }
```

### `HomeWidgetButton`
```ts
{ lang: Language }
```

### `HomeFooter`
```ts
{ lang: Language }
```

---

## Placeholder Routes / Hrefs

| Location | Href | Notes |
|----------|------|-------|
| Hero CTA "About Awards" | `/awards` | Stub route exists (phase-05) |
| Hero CTA "About Kudos" | `/kudos` | Stub route exists (phase-05) |
| Award card "Chi tiết" links | `/awards#<slug>` | Needs anchor targets on /awards page |
| Kudos CTA button | `/kudos` | OK |
| Widget button | `/kudos/write` | Placeholder — route does not exist yet |
| Header "About SAA 2025" nav | `/#about-saa-2025` | Needs anchor `id="about-saa-2025"` on the HomeRootFurther section |
| Header "Awards" nav | `/awards` | Stub route exists |
| Header "Kudos" nav | `/kudos` | Stub route exists |
| Header "Admin Dashboard" | `/admin` | Conditional on `isAdmin`, route not yet implemented |
| Footer "Tiêu chuẩn chung" | `#` | Placeholder href — destination TBD by orchestrator |
| Header notification bell | no href (button click) | Panel render placeholder, no real notifications yet |
| Header sign-out | calls `handleSignOut` stub | Orchestrator must wire real Supabase signOut (phase-06) |
| Header avatar/account menu | no href | Dropdown open/close only, no profile route wired |

---

## Open Questions for the Orchestrator

1. **`/kudos/write` route** — Widget button links here. Is this the correct path? Does this route need to exist before launch?

2. **`/#about-saa-2025` anchor** — Header nav "About SAA 2025" scrolls to this anchor. The `HomeRootFurther` section needs `id="about-saa-2025"` added (or the hero/page needs a matching anchor). Orchestrator decides which section owns this ID.

3. **`handleSignOut` in `HomeHeader`** — Currently a no-op placeholder. Phase-06 should wire `supabase.auth.signOut()` + redirect. The header component is a client component and has the `"use client"` directive, so Supabase browser client import is straightforward.

4. **`activeNav` prop** — Header highlights the active nav item when `activeNav` is passed. Currently `page.tsx` does not pass it. Orchestrator should pass `activeNav` from the route context on each page (e.g., `/awards` → `activeNav="awards"`).

5. **`isAdmin` role check** — Currently hardcoded `false` in `page.tsx`. Phase-02 (Supabase profiles/role) should replace with a real role query.

6. **Countdown showing zeros** — The countdown target `"2025-12-26T18:30:00+07:00"` is in the past relative to 2026-05-22, so it always shows `00 00 00`. This is expected; the orchestrator should update `SAA_COUNTDOWN_TARGET` env var to a future date before the event, or replace the fallback value.

7. **`home.hero.event.date/time/location/livestream` i18n keys** — Currently have hardcoded Vietnamese text in the hero as label prefixes ("Ngày:", "Thời gian:", "Địa điểm:"). These labels are hardcoded strings (not i18n keys) — orchestrator may want to move them to dictionary keys for full EN support.

8. **Footer "Tiêu chuẩn chung" link** — `href="#"` placeholder. Real URL/route TBD.

9. **Header notification count** — The red badge on the bell is always visible (static mock). Orchestrator should wire a real unread count or hide the badge when count is 0.

---

## Visual Validation Summary

| Viewport | Status | Notes |
|----------|--------|-------|
| 1440 (desktop) | Pass | 3-col awards, kudos banner, all sections correct |
| 768 (tablet) | Pass | 2-col awards, responsive padding correct |
| 375 (mobile) | Pass | 1-col awards, kudos stacked layout, CTA buttons wrap |

Build: `npm run build` passes — TypeScript clean, 0 errors, all routes render.
