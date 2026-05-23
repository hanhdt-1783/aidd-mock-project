# Homepage SAA

The `/` route implements the SAA homepage: header, hero, countdown, awards cards, kudos section, and footer. This doc covers backend concerns only — UI component structure lives in `app/_components/home/`.

---

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Server component; resolves auth + role, passes props to UI |
| `/prelaunch` | `app/prelaunch/page.tsx` | Public standalone countdown page; no auth required |
| `/awards` | `app/awards/page.tsx` | Full Awards Information page; **requires auth** (anonymous → `/login`) |
| `/kudos` | `app/kudos/page.tsx` | Stub — "Coming Soon" panel |
| `/profile` | `app/profile/page.tsx` | Stub |
| `/standards` | `app/standards/page.tsx` | Stub |

Stubs render a centered message via `t(lang, 'home.stub.coming_soon')`. They satisfy navigation tests (no 404) without real content.

---

## Countdown

`lib/event/get-event-datetime.ts` exports `getEventDatetime(): Promise<Date | null>` (async).

**Source order (DB-first, env fallback):**

1. `public.event_config.event_datetime` — singleton Supabase row; readable by anyone (public RLS); writable via service-role only. Migration: `supabase/migrations/20260523131000_create_event_config_table.sql`.
2. `NEXT_PUBLIC_EVENT_DATETIME` — ISO-8601 env var, used when the DB row is absent or the query errors (e.g. during build).

Both the homepage (`app/page.tsx`) and the prelaunch page (`app/prelaunch/page.tsx`) call the same resolver.

| Source / value | Countdown display | "Coming soon" label |
|---|---|---|
| Valid future datetime | `DD / HH / MM`, ticks each second | visible |
| Valid past datetime | `00 / 00 / 00` | hidden |
| No DB row + missing/unparseable env | `-- / -- / --` | hidden |

Returns `null` for missing/invalid; countdown components check for `null` to choose the `--` state.

**Updating the event datetime:** edit the `event_config` row in Supabase Studio (`event_datetime` column). No redeploy needed.

---

## Profiles Table + RLS

Migration: `supabase/migrations/20260522154800_create_profiles_table.sql`

```
public.profiles
  id         uuid  PK → auth.users(id) ON DELETE CASCADE
  role       text  NOT NULL DEFAULT 'user'  CHECK (role IN ('admin', 'user'))
  created_at timestamptz
  updated_at timestamptz
```

**RLS:** `profiles_select_own` — authenticated users may `SELECT` their own row only. No UPDATE policy is exposed; self-promotion is not possible.

**Auto-create:** trigger `on_auth_user_created` fires `AFTER INSERT ON auth.users` and inserts a `profiles` row with `role = 'user'`. Existing users are backfilled on migration run.

### Promoting a user to admin

No UI exists for this. Use one of:

- **Supabase Studio:** Table Editor → `profiles` → edit `role` cell.
- **SQL (service-role or local):**
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE id = '<auth-user-uuid>';
  ```

---

## Account Menu + Sign-Out

`app/page.tsx` (server component) resolves `isAdmin`:

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

const isAdmin = profile?.role === 'admin';
```

Props `isAuthenticated` and `isAdmin` are forwarded to `HomeHeader`. When `isAdmin` is true the header renders an Admin Dashboard link in the account menu.

Sign-out reuses `signOut` from `app/login/actions.ts`. No new action was created.

---

## Prelaunch Page

`app/prelaunch/page.tsx` is a public server component — no auth required.

It calls `getEventDatetime()` and passes `targetIso` (string or `null`) to `PrelaunchCountdownPage`, a full-screen client component under `app/_components/prelaunch/`.

| Component | File | Notes |
|---|---|---|
| `PrelaunchCountdownPage` | `prelaunch-countdown-page.tsx` | Full-screen layout wrapper; receives `lang` + `targetIso` |
| `PrelaunchCountdownLogic` | `prelaunch-countdown-logic.ts` | Client-side tick logic; 1 s interval |
| `PrelaunchCountdownUnit` | `prelaunch-countdown-unit.tsx` | Single unit block (label + digit tiles) |
| `PrelaunchDigitTile` | `prelaunch-digit-tile.tsx` | Individual digit tile |

Background image: `public/prelaunch/bg-image.png`. Fetch/refresh via `npm run download-assets:prelaunch`.

Display units: DAYS / HOURS / MINUTES only (no seconds). T=0 behavior: stays at `00 / 00 / 00` (no redirect).

---

## Awards Information Page

`app/awards/page.tsx` is a server component that renders the full Awards Information page.

### Auth gate

Anonymous users are redirected to `/login` before any content is rendered:

```ts
if (!user) redirect("/login");
```

Role resolution follows the same pattern as `app/page.tsx` — reads `profiles.role` to determine `isAdmin` and forwards it to `HomeHeader`.

### Layout and shared components

| Component | Source | Notes |
|---|---|---|
| `HomeHeader` | `app/_components/home/home-header` | `activeNav="awards"` highlights the nav item |
| `AwardsPageTitle` | `app/_components/awards/awards-page-title` | Page heading block |
| `AwardsSideMenu` | `app/_components/awards/awards-side-menu` | Sticky left nav; hash sync (see below) |
| `AwardsList` | `app/_components/awards/awards-list` | Renders 6 award category sections |
| `AwardsSection` | `app/_components/awards/awards-section` | Single category wrapper |
| `AwardsValueBlock` | `app/_components/awards/awards-value-block` | Prize detail block within a section |
| `HomeKudosSection` | `app/_components/home/home-kudos-section` | Shared with homepage |
| `HomeFooter` | `app/_components/home/home-footer` | Shared with homepage |

### Award categories

Six categories, each identified by a slug used for URL hashing and section IDs:

| Slug | Label |
|---|---|
| `top-talent` | Top Talent |
| `top-project` | Top Project |
| `top-project-leader` | Top Project Leader |
| `best-manager` | Best Manager |
| `signature-2025-creator` | Signature 2025 - Creator |
| `mvp` | MVP |

### Side-menu hash sync

`AwardsSideMenu` is a client component with two behaviors:

1. **Click → hash:** clicking a menu item calls `window.history.replaceState` to update `#<slug>` without adding a history entry, then smooth-scrolls to the matching section element.
2. **Scroll → hash:** an `IntersectionObserver` watches each section element; the observed slug in view becomes the active menu item and updates the URL hash.
3. **Deep-link on load:** on mount, the component seeds `activeSlug` from `window.location.hash`; the browser's native scroll handles the initial scroll position.

Net effect: `/awards#best-manager` lands on that section with the sidebar item highlighted.

---

## i18n

~60 keys added under the `home.*` family for the homepage. The Awards Information page adds ~100 keys under the `awards.*` family. Key groups:

| Prefix | Covers |
|---|---|
| `home.header.*` | Nav links, account menu labels |
| `home.hero.*` | Hero section copy |
| `home.countdown.*` | Countdown labels (days/hours/minutes) |
| `home.awards.*` | Homepage awards section heading + card labels |
| `home.kudos.*` | Kudos section heading + copy |
| `home.footer.*` | Footer links and copyright |
| `home.stub.*` | "Coming Soon" text for stub pages |
| `awards.meta.*` | Page `<title>` for `/awards` |
| `awards.menu.*` | Side-menu item labels |
| `awards.*` | Page heading, section titles, prize details |
| `prelaunch.meta.*` | Page `<title>` for `/prelaunch` |
| `prelaunch.*` | Countdown heading + unit labels (DAYS / HOURS / MINUTES) |

All keys exist in both `vi` and `en` in `lib/i18n/dictionary.ts`.
