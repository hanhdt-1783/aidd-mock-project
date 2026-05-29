# Review: Sun* Kudos Live Board
**Date:** 2026-05-23 | **Reviewer:** reviewer agent

---

## Scope
- `supabase/migrations/20260523232000_create_kudos_tables.sql`
- `lib/kudos/types.ts`, `lib/kudos/queries.ts`, `lib/kudos/actions.ts`
- `lib/i18n/dictionary.ts` (kudos.* keys)
- `app/kudos/page.tsx`
- `app/_components/kudos/*` (15 files)

LOC: ~1,100 (components) + ~416 (SQL) + ~345 (queries)

---

## Overall Assessment

Solid MVP: auth gate is correct, RLS policies are appropriate for the read-heavy board, optimistic UI reconciles cleanly on server response, and all out-of-scope features are properly stubbed. Found **one high-severity bug** (seed data in migration file — no env guard), **two medium-severity correctness concerns** (supabase aggregate type cast, duplicate filter queries), and several minor issues.

---

## Critical Issues

None.

---

## High Priority

### H1 — Seed data embedded in migration file (no environment guard)
**File:** `supabase/migrations/20260523232000_create_kudos_tables.sql` lines 263–415

The DO block that creates 10 synthetic `auth.users`, 5 kudos, 22 likes, 10 gifts, and 30 boxes runs unconditionally as part of the migration. `supabase/migrations/` executes on every environment (`supabase db push` to staging/prod). `supabase/seed.sql` is the dev-only file.

**Impact:** Running this migration in production inserts fake user accounts and fake kudos into the live event board, visible to all authenticated attendees.

**Fix:** Move the seed DO block to `supabase/seed.sql` (or a dedicated `supabase/seed/` file). Alternatively, guard with:
```sql
DO $$
BEGIN
  IF current_setting('app.environment', true) IS DISTINCT FROM 'production' THEN
    -- seed block
  END IF;
END $$;
```
The `ON CONFLICT DO NOTHING` idempotency is correct and should be kept wherever the seed ends up.

---

## Medium Priority

### M1 — Wrong type cast on `like_count.sum()` aggregate (silent 0 if shape differs)
**File:** `lib/kudos/queries.ts` lines 239–241, 257

```ts
.select('like_count.sum()')
.eq('receiver_id', viewerId)
.single<{ sum: number | null }>()
// ...
heartsReceived: heartsAgg.data?.sum ?? 0,
```

In supabase-js v2, `.select('column.aggregate()')` returns `{ data: { column: <value> } }` where the key matches the column name, not the aggregate name. The actual response shape is `{ like_count: number | null }` (supabase flattens the aggregate to the column key). If the SDK returns `{ like_count: 42 }`, then `heartsAgg.data?.sum` evaluates to `undefined`, and `heartsReceived` always shows `0` regardless of actual likes received.

**Fix:**
```ts
.single<{ like_count: number | null }>()
// ...
heartsReceived: heartsAgg.data?.like_count ?? 0,
```

Verify against actual SDK response shape; consider a quick console test or checking Supabase JS docs for `.sum()` response key behavior in v2.106.

### M2 — Duplicate `applyFilters` calls double filter query cost
**File:** `lib/kudos/queries.ts` lines 189–199, 210–220

`listHighlightKudos` and `listAllKudos` are called in parallel via `Promise.all` in the page, but each independently calls `applyFilters`. When both hashtag and department filters are active, `applyFilters` fires up to 3 DB queries. Called twice in parallel = 6 filter queries per page load, returning identical results.

**Impact:** Waste of ~2–6 DB round-trips per filtered page load. Not correctness-breaking but meaningless cost.

**Fix:** Call `applyFilters` once in `app/kudos/page.tsx` before `Promise.all`, pass the result to both fetchers as an additional parameter, or refactor into a single combined fetch function.

---

## Minor

### N1 — `dismissToast` recreated each render causes toast timer to reset
**File:** `app/_components/kudos/kudos-toast.tsx` lines 45–48

`showToast` and `dismissToast` are plain arrow functions in `useKudosToast`, recreated every render. `KudosToast` includes `onDismiss` in its `useEffect` dependency array. If the parent re-renders (e.g., during a `useTransition`), the toast timer resets to 3s from scratch.

**Fix:** Wrap both in `useCallback`:
```ts
const showToast = useCallback((msg: string) => setToast(msg), []);
const dismissToast = useCallback(() => setToast(null), []);
```

### N2 — Three independent toast instances can stack simultaneously
**Files:** `kudos-hero-banner.tsx`, `kudos-sidebar.tsx`, `kudos-page.tsx`

Each component instantiates its own `useKudosToast()`. If the user clicks "Viết Kudos" (hero toast) and then triggers a like error (page toast), both toasts render at `position: fixed; bottom: 32px; right: 32px` — they overlap without stacking.

**Fix (minor):** For this MVP scope, document as known limitation; no action needed unless multiple toasts appear during testing. A future shared toast context would be the clean fix.

### N3 — `listHashtags` fetches all rows without DISTINCT or limit
**File:** `lib/kudos/queries.ts` lines 291–295

```ts
const { data } = await supabase.from('kudos_hashtags').select('tag');
```

Deduplication is done in JS (`new Set`), not in SQL. With thousands of kudos each having 3–5 hashtags, this fetches O(N*5) rows to build a set that has O(50) unique values.

**Fix:** Use `.select('tag').limit(1000)` as a safety cap, or better, a DISTINCT query via PostgREST: not directly possible with supabase-js, but a lightweight RPC that returns `SELECT DISTINCT tag FROM kudos_hashtags ORDER BY tag` would be cleaner.

### N4 — Seed comment claims "20 kudos" but only 5 are inserted
**File:** `supabase/migrations/20260523232000_create_kudos_tables.sql` line 5

Header comment: `-- Seed: 10 synthetic auth.users + 20 kudos + likes...`. Only 5 kudos (k1–k5) are inserted. Like/hashtag counts in the comment (22 likes, 10 gifts, 30 boxes) are accurate. Minor documentation inconsistency.

### N5 — "Xem chi tiết" links route to unimplemented `/kudos/[id]` (404)
**Files:** `kudos-card.tsx:264`, `kudos-card-highlight.tsx:357`

Both render `href={'/kudos/${card.id}'}` which 404s since `app/kudos/[id]/` does not exist. This is explicitly noted as out-of-scope in clarifications ("Kudos detail page navigation — link present but target page not built"), so it's intentional. Flagging for completeness: if QA tests link functionality this will fail. Consider adding `tabIndex={-1}` or a click interceptor that shows the "Coming soon" toast instead of navigating.

### N6 — `profiles_select_directory` supersedes but doesn't remove `profiles_select_own`
**File:** `supabase/migrations/20260523232000_create_kudos_tables.sql` lines 21–26

The new `USING (true)` policy makes `profiles_select_own` (`USING (auth.uid() = id)`) unreachable since Supabase OR's permissive policies. The old policy is harmless but dead. Not a security issue — more permissive wins. Consider `DROP POLICY IF EXISTS profiles_select_own ON public.profiles` for clarity, but this is a judgment call.

### N7 — `kudos` table has no INSERT RLS policy
**File:** migration, kudos table, lines 49–56

Only a SELECT policy exists. INSERT is blocked for all authenticated users. This is correct for the current read-only MVP (seed data goes via service-role in DO block). Flagging because when the send-kudos feature is built, this policy needs to be added — easy to miss.

### N8 — i18n keys defined but not consumed by kudos components
**File:** `lib/i18n/dictionary.ts` lines 141–168

Extensive `kudos.*` keys are defined (sidebar labels, filter labels, toast messages, etc.) but all kudos components use hardcoded Vietnamese strings. The `dictionary.ts` keys for this feature are dead code for now.

**Impact:** When English locale support is needed, the keys exist but are wired to nothing. Low urgency since the page has no language toggle, but inconsistent with the rest of the codebase.

---

## Edge Cases Confirmed Safe

- **Self-like prevention**: `prevent_self_like` trigger fires `BEFORE INSERT` (line 143) — correct. RLS `insert_own` checks `user_id = auth.uid()` to prevent impersonation. Both layers active.
- **`toggle_kudos_like` special-day weight**: Reads `is_special_day` from `kudos` table at toggle time, not from cached client data. Correct. Optimistic UI uses +1 but reconciles with server count immediately after — comment at line 92 explicitly notes this.
- **Idempotent triggers**: `CREATE OR REPLACE FUNCTION` for both trigger functions; `DROP TRIGGER IF EXISTS` before recreating. Fully idempotent on re-migration.
- **Seed user conflict with real signins**: Seed users use stable UUIDs (`11111111-...`). `ON CONFLICT (id) DO NOTHING` prevents re-insert. `handle_new_user` trigger uses `ON CONFLICT (id) DO NOTHING`. Real Google OAuth users will have non-colliding UUIDs. Safe.
- **`rank_stars` new column + existing trigger**: New column has `NOT NULL DEFAULT 0`. `handle_new_user` inserts only `(id)` — the default fills the rest. No trigger breakage.
- **Filter injection**: `department` is user-controlled via searchParams but flows through `.eq('department', value)` — parameterized, not string-interpolated. The subsequent `.or('sender_id.in.(...)')` uses UUIDs sourced from a DB query, not user input. No injection vector.
- **Rapid-click race on like**: `startTransition` serializes transitions; React defers concurrent transitions. The `canLike` check runs on the optimistic state read at click time. If two rapid clicks land in the same transition, the second `handleLike` will see the already-patched `optimisticAll` and `optimisticHighlight`, flipping the state back — this is correct toggle behavior.
- **Empty filter result**: `applyFilters` returns `[]` when no matching IDs found. Both `listHighlightKudos` and `listAllKudos` short-circuit to `return []`. `KudosEmptyState` renders in both carousel and all-kudos list. Confirmed.
- **`app/_components/kudos/types.ts`**: Pure re-export of `lib/kudos/types.ts` — no drift possible, no duplication.
- **Out-of-scope stubs confirmed**: Entry input click → `showToast('Coming soon')`. Mở quà button → `showToast('Coming soon')`. Spotlight board is static (no interactivity). All three confirmed in code.

---

## Recommended Actions (Prioritized)

1. **[H1] Move seed DO block to `supabase/seed.sql`** — prevents fake data in prod. Do before any staging/prod deployment.
2. **[M1] Fix `heartsAgg.data?.sum` type cast** — verify actual supabase aggregate key name; fix to `.like_count` if confirmed. Sidebar stat will show 0 otherwise.
3. **[M2] Deduplicate `applyFilters` call** — extract to page-level, pass `filteredIds` to both fetchers. Reduces DB load ~30% on filtered requests.
4. **[N1] Wrap `showToast`/`dismissToast` in `useCallback`** — prevents erratic toast auto-dismiss during transitions.
5. **[N5] Consider intercepting "Xem chi tiết" clicks** with "Coming soon" toast instead of 404 navigation (nice-to-have before demo).

---

## Metrics

- Type coverage: High — all public APIs typed, no `any` without justification, `fallbackUser` handles null profiles correctly
- RLS coverage: Correct for read-only MVP; INSERT on `kudos` deliberately absent (documented)
- Auth paths: Page-level redirect + server action auth check both present. No bypass.
- Linting issues: None observed (ESLint suppress comment for `next/image` in card intentional)

---

## Unresolved Questions

1. Is `like_count.sum()` in supabase-js v2.106 actually keyed as `sum` or `like_count` in the response? Needs a quick local test before relying on `heartsReceived`.
2. Is staging/prod deployment planned for this migration before demo? If yes, H1 must be resolved first.
