# Phase 04 — Authenticated Specs

## Overview
- Priority: P2
- Status: completed
- Specs that load `playwright/.auth/user.json` storageState (default for chromium project)
  and exercise authed pages + the give-kudos modal flow.

## Confirmed selectors / text (default lang = vi)
- Board `/kudos`: spotlight section heading id `spotlight-board-heading`; "All Kudos"
  region via `t('kudos.all.title')`. Seeded kudo titles present: **"Legend Hero",
  "Rising Hero", "New Hero"** → assert at least one visible.
- Give-kudos flow (two-step FAB):
  1. Closed FAB = `<button aria-label="Viết Kudos">` (`home.widget.label`, vi) →
     `getByRole('button', { name: 'Viết Kudos' })`. Click → expands.
  2. Expanded shows "Viết KUDOS" button (`home.widget.write-kudos`) → click → opens modal.
  3. Modal = native `<dialog aria-modal="true" aria-label="Viết Kudo">` →
     `getByRole('dialog', { name: 'Viết Kudo' })`.
  4. Core fields present: title heading "Gửi lời cám ơn và ghi nhận đến đồng đội";
     recipient label "Người nhận"; title input `aria-label="Danh hiệu"`;
     content `aria-label="Nội dung Kudo"`. Assert presence — do NOT submit (avoid mutating data).
- `/profile`: **Coming Soon placeholder.** Assert heading `getByRole('heading', { name: 'Profile' })`
  and text "Sắp ra mắt" (vi). Do NOT assert a display name (page has none).
- `/secret-box`: heading "Secret Box" visible.
- `/awards`: loads authed (URL stays `/awards`, not `/login`); assert a stable heading/region
  (read `app/awards/page.tsx` for exact heading/test-id before finalizing assertion).

## Related code files
- Create: `e2e/authed/kudos-board.spec.ts`
- Create: `e2e/authed/give-kudos-modal.spec.ts`
- Create: `e2e/authed/profile-secret-awards.spec.ts`
- Read (selectors): `app/_components/kudos/kudos-page.tsx`,
  `app/_components/home/home-widget-button.tsx`,
  `app/_components/kudos/kudos-create-modal.tsx`,
  `app/_components/kudos/kudos-create-form.tsx`, `app/profile/page.tsx`,
  `app/secret-box/page.tsx`, `app/awards/page.tsx`, `supabase/seed.sql`

## Implementation steps
1. `kudos-board.spec.ts`: goto `/kudos`; assert NOT redirected; spotlight heading visible;
   at least one seeded title (`Legend Hero`|`Rising Hero`|`New Hero`) visible.
2. `give-kudos-modal.spec.ts`: goto `/kudos`; click FAB "Viết Kudos" → click "Viết KUDOS";
   assert dialog open; assert recipient label + "Danh hiệu" + "Nội dung Kudo" fields present;
   close via ESC; assert dialog closed. No submit.
3. `profile-secret-awards.spec.ts`: three quick checks — `/profile` heading + "Sắp ra mắt";
   `/secret-box` heading "Secret Box"; `/awards` stays on route with a visible heading.

## Todo
- [x] kudos-board.spec.ts (board + seeded titles)
- [x] give-kudos-modal.spec.ts (FAB→KUDOS→dialog fields, no submit)
- [x] profile-secret-awards.spec.ts (3 authed pages render)

## Success criteria
- All authed specs green; storageState session accepted by server `getUser()`.
- Modal opens and exposes core fields; suite makes no DB writes.

## Risk assessment
- Silent redirect to /login if cookie format wrong (Med/High): Phase 02 self-verify catches
  it first; specs also assert `not.toHaveURL(/login/)` early.
- Localized text changes break assertions (Med/Med): roles/aria/test-id preferred; seed
  titles ("...Hero") are English and stable.
- FAB animation/timing flake (Low/Low): Playwright auto-waits on role queries.
- Seed data reset between runs (Low/Med): board asserts on title classes that the seed
  guarantees; if seed reseeds, "...Hero" titles remain (seed.sql uses them repeatedly).

## Security considerations
- Specs are read-only on data (no kudo submission) to keep the seeded DB stable.

## Next steps
- With Phase 03, gates Phase 05.

## Completion note
- Delivered: e2e/authed/{kudos-board.spec.ts, give-kudos-modal.spec.ts, profile-secret-awards.spec.ts}.
- All 10 authed specs pass (13/13 total). Seeded kudo title assertions use exact matches on "Legend Hero", "Rising Hero", "New Hero".
- Modal opens via two-step FAB (closed → expanded → KUDOS button). Dialog visibility confirmed via aria-modal; form heading used (not data-testid).
- Profile/Secret Box/Awards assertions use role-based selectors; no display name asserted (Profile Coming Soon).
