# Homepage SAA

The `/` route implements the SAA homepage: header, hero, countdown, awards cards, kudos section, and footer. This doc covers backend concerns only — UI component structure lives in `app/_components/home/`.

---

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Server component; resolves auth + role, passes props to UI |
| `/awards` | `app/awards/page.tsx` | Stub — "Coming Soon" panel |
| `/kudos` | `app/kudos/page.tsx` | Stub — "Coming Soon" panel |
| `/profile` | `app/profile/page.tsx` | Stub |
| `/standards` | `app/standards/page.tsx` | Stub |

Stubs render a centered message via `t(lang, 'home.stub.coming_soon')`. They satisfy navigation tests (no 404) without real content.

---

## Countdown

`lib/event/get-event-datetime.ts` exports `getEventDatetime(): Date | null`.

Env var: `NEXT_PUBLIC_EVENT_DATETIME` — ISO-8601 string, e.g. `2025-12-31T18:30:00+07:00`.

| Env value | Countdown display | "Coming soon" label |
|---|---|---|
| Valid ISO-8601, future date | `DD / HH / MM`, ticks each minute | visible |
| Valid ISO-8601, past date | `00 / 00 / 00` | hidden |
| Missing or unparseable | `-- / -- / --` | hidden |

Returns `null` for missing/invalid; the countdown component checks for `null` to choose the `--` state.

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

## i18n

~60 keys added under the `home.*` family. Key groups:

| Prefix | Covers |
|---|---|
| `home.header.*` | Nav links, account menu labels |
| `home.hero.*` | Hero section copy |
| `home.countdown.*` | Countdown labels (days/hours/minutes) |
| `home.awards.*` | Awards section heading + card labels |
| `home.kudos.*` | Kudos section heading + copy |
| `home.footer.*` | Footer links and copyright |
| `home.stub.*` | "Coming Soon" text for stub pages |

All keys exist in both `vi` and `en` in `lib/i18n/dictionary.ts`.
