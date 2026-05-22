# Phase 05 — Stub routes for /awards and /kudos

**Track:** B
**Priority:** Medium

## Goal

Add minimal placeholder pages so the homepage links don't 404 (satisfies ID-21, ID-22, ID-44, ID-45 navigation tests, even if the destination is a stub).

## Files to create

- `app/awards/page.tsx`
- `app/kudos/page.tsx`

## Content

Each page: a single async server component that renders the header + footer from Track A (reused as shared layout pieces) and a centered "Coming Soon" panel. Uses the same i18n keys.

```ts
// app/awards/page.tsx
import { getLang } from '@/lib/i18n/get-lang';
import { t } from '@/lib/i18n/dictionary';

export default async function AwardsPage() {
  const lang = await getLang();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#00101A] text-white">
      <h1 className="text-3xl">{t(lang, 'home.stub.coming_soon')} — Awards Information</h1>
    </main>
  );
}
```

`/kudos` is the same with "Sun* Kudos".

## i18n keys to add (Phase 07)

- `home.stub.coming_soon` → "Sắp ra mắt" / "Coming soon"

## Success criteria

- Clicking nav link "Awards Information" from `/` lands on `/awards` and renders the stub
- Clicking nav link "Sun* Kudos" lands on `/kudos`
- Clicking an award card with hashtag (e.g. `/awards#top-talent`) lands on `/awards` (hash present but no scroll target yet — acceptable per ID-62)

## Final notes

**Status: ✅ DONE**

Stub routes `/awards` and `/kudos` created as planned. Both render "Coming Soon" placeholder pages. Test cases ID-21, ID-22, ID-44, ID-45 validated; navigation links work correctly. **Deviation noted:** Reviewer requested `/profile` and `/standards` stub routes during polish phase to address dead-link concerns; both added (minimal pages, no functional backend). All routes tested and navigating correctly.
