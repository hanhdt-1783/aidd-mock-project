# Track A — UI Report: Awards Information Page

## Files Created / Modified

### New files
| File | Lines | Purpose |
|------|-------|---------|
| `app/awards/page.tsx` | 104 | Page root — replaces stub |
| `app/_components/awards/awards-page-title.tsx` | 55 | Section A: title + caption |
| `app/_components/awards/awards-side-menu.tsx` | 120 | Section C: sticky side-nav (client, IntersectionObserver) |
| `app/_components/awards/awards-section.tsx` | 195 | Single award info block (D.1-D.6 pattern) |
| `app/_components/awards/awards-list.tsx` | 82 | Renders 6 × AwardsSection with typed data |
| `public/awards/placeholder.svg` | 8 | SVG placeholder for award images (to replace) |

### Modified files
| File | Change |
|------|--------|
| `lib/i18n/dictionary.ts` | Added `awards.*` keys (vi + en parity, ~130 keys total) |

---

## Component Tree

```
AwardsPage (server)
├── HomeHeader          lang, isAuthenticated, isAdmin, activeNav="awards"
├── main
│   ├── <section>       page title wrapper (px-6 sm:px-10 lg:px-36)
│   │   └── AwardsPageTitle (server)   lang
│   ├── <section>       two-col wrapper (px-6 sm:px-10 lg:px-36)
│   │   ├── [lg+] sticky side col
│   │   │   └── AwardsSideMenu (client)  lang
│   │   ├── [lg+] content col
│   │   │   └── AwardsList (server)      lang
│   │   │       └── AwardsSection ×6     lang, award: AwardData
│   │   └── [<lg] stacked
│   │       ├── AwardsSideMenu (client)  lang
│   │       └── AwardsList (server)      lang
│   └── HomeKudosSection  lang
└── HomeFooter            lang
```

---

## Props Each New Component Expects

### `AwardsPageTitle`
```ts
{ lang: Language }
```

### `AwardsSideMenu`
```ts
{ lang: Language }
// Client component — manages activeSlug state via IntersectionObserver
// Scrolls to #<slug> on click; IntersectionObserver tracks in-view section
```

### `AwardsSection`
```ts
{
  lang: Language;
  award: AwardData;  // see awards-section.tsx for full type
}
// AwardData fields:
//   slug, imageLeft, imageSrc
//   titleKey, descriptionKey, countKey, countUnitKey, valueKey, valueUnitKey
//   value2Key?, value2UnitKey?, orKey?  ← only Signature 2025 Creator
```

### `AwardsList`
```ts
{ lang: Language }
// Owns the AWARDS const array with all 6 entries
```

---

## Section IDs (deep-link slugs)

| Slug | Route |
|------|-------|
| `top-talent` | `/awards#top-talent` |
| `top-project` | `/awards#top-project` |
| `top-project-leader` | `/awards#top-project-leader` |
| `best-manager` | `/awards#best-manager` |
| `signature-2025-creator` | `/awards#signature-2025-creator` |
| `mvp` | `/awards#mvp` |

Each `<section id={slug}>` has `scrollMarginTop: 120` to account for the fixed header.

---

## Award Images

No Figma media assets exist for the 6 award section images (all use `url(<path-to-image>)` placeholder in Figma). Currently using `/awards/placeholder.svg`.

**Orchestrator must:** replace `PLACEHOLDER` in `awards-list.tsx` with real image paths once assets are available, e.g.:
```ts
imageSrc: "/awards/top-talent.png"
```

---

## Placeholder Routes / Hrefs Orchestrator Should Reconcile

- `awards-side-menu.tsx` scrolls to `#<slug>` anchors on the same page — no external routes needed
- The `HomeHeader` nav item `/awards` already points to this page correctly
- The `HomeFooter` nav item `/awards` already correct
- Homepage award cards linking to `/awards#<slug>` will work as-is (IDs exist on rendered sections)

---

## Auth

The page reads `user` from Supabase but does NOT redirect. A `TODO(orchestrator)` comment marks line 41 in `app/awards/page.tsx`. Add redirect there once auth requirement is confirmed.

---

## Visual Validation Results

- **1440px**: Two-column layout, sticky side-menu, correct typography/colors — matches Figma structure
- **768px**: Stacked layout, full-width square images, readable
- **375px**: Clean mobile layout, no overflow
- **Deep-link `/awards#top-talent`**: Scrolls to section, side-menu item shows yellow + underline active state

---

## Open Questions

1. Real award images — will they be provided as assets or fetched from an API?
2. Auth requirement: does `/awards` require login? (orchestrator to confirm + add redirect)
3. The Figma has a "Root Further" logo in a KV banner above the title — spec says no keyvisual. Confirm omission is correct.
4. English translations for prize values use comma format (`7,000,000 VND`) while Vietnamese uses dot format (`7.000.000 VNĐ`) — confirm this is correct locale formatting.
