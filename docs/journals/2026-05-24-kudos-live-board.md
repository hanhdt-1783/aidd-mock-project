# Supabase Aggregate Gotcha — Silent 0 When Column Name Matters

**Date:** 2026-05-24 00:45  
**Severity:** Medium (data bug surfaced during review, not in production)  
**Component:** Kudos Live Board (`/kudos`) / Supabase RPC aggregates  
**Status:** Resolved

## What Happened

Built `/kudos` Live Board from MoMorph screenId MaZUn5xHXZ using two-track parallel: UI subagent spun background `implementer` agent (15 components, mock data), main thread designed Supabase schema + RPC + server queries. Integration unified types via re-export module. Reviewer caught three issues before merge: (1) seed data hard-coded inside migration (prod risk), (2) `heartsReceived` stat always 0 (supabase-js aggregate syntax), (3) `applyFilters` called twice (state management).

All issues fixed, two commits shipped. Both tracks completed independently — parallel strategy worked.

## The Brutal Truth

The aggregate issue hurt because it was **silent**. No error message, no null, no undefined — just a 0 displayed where user hearts should be. The kudos cards would load perfectly, the stats would render, but the count was always zero. You'd stare at the component code, check the RPC signature, inspect the database directly — everything looked right. Only when you log the actual response shape does it click: `{ like_count: 47 }` instead of `{ sum: 47 }`. Supabase-js keys the result by the **column name** not the aggregate function name.

The seed-in-migration issue was worse — it wasn't obviously broken yet, just a time bomb. On local `db reset`, seed data populates. In staging/prod, migrations apply to an already-seeded database, so the INSERT silently becomes a no-op. That's the exact pattern that causes data inconsistency across environments and nobody notices until UAT.

The filter duplication was exhausting more than painful — `applyFilters` and `resolveFilteredKudosIds` both existed, neither had clear ownership. State lived in searchParams but was recomputed twice per render. Tiny perf hit, big mental burden.

## Technical Details

**M2 Issue — Aggregate keyed by column name, not aggregate function**

```ts
// What we did (returned { like_count: 0 })
const { data: stats } = await supabase
  .from('kudos')
  .select('like_count.sum()') // ← Guessed wrong column name
  .eq('id', kudosId);

// What we should have done (returns { like_count: 47 })
const { data: stats } = await supabase
  .from('kudos_likes')
  .select('kudos_id.count()')
  .eq('kudos_id', kudosId)
  .single();

// supabase-js response shape:
// ✓ { like_count: 47 }  — correct
// ✗ { sum: 47 }         — does NOT exist
// ✗ { count: 47 }       — does NOT exist (unless that's your column name)
```

Root cause: Supabase PostgREST API returns aggregates keyed by the **selected column name**, not the function. Missing keys silently default to 0 in JavaScript. Documentation example shows this, but it's easy to miss when you're thinking in SQL aggregate syntax.

**M1 Issue — Seed data in migration file**

```sql
-- migrations/20260524_create_kudos_schema.sql (WRONG)
INSERT INTO kudos (id, text, created_by, emoji) VALUES (...) 
  WHERE NOT EXISTS (SELECT 1 FROM kudos WHERE id = ...);
-- This is idempotent, but mixing seed + structure breaks the migration/seed contract
```

Correct pattern: seed data lives in `supabase/seed.sql`, which runs only on `db reset` (local dev). Migrations apply to every environment, multiple times. Seed data in migrations violates the contract and causes data leakage across environments.

**M2 Issue — Filter state computed twice**

```ts
// Before: applyFilters in useEffect, THEN resolveFilteredKudosIds in map
useEffect(() => {
  setFiltered(applyFilters(kudos, filters));
}, [filters]);

return filtered.map(k => <KudosCard ... />);

// But also: somewhere else, resolveFilteredKudosIds
const results = resolveFilteredKudosIds(kudos, filters);
```

After: Single source of truth at page level.

```ts
// page.tsx
const filteredIds = resolveFilteredKudosIds(allKudos, searchParams);
return <KudosGrid kudos={filteredIds} />;
```

## What We Tried

1. **Clarification pass** — Locked scope: MVP with real data, no send-kudos dialog, static spotlight, sidebar stats from DB. Unblocked Track A immediately.
2. **Track A (UI)** — Background `implementer` agent built 15 components with mock data props. Finished ~14 min before Track B.
3. **Track B (Backend)** — Schema (kudos, kudos_likes, kudos_hashtags, gift_recipients, secret_boxes + extended profiles), `toggle_kudos_like` RPC with special-day weight=2 + self-like-prevention trigger, async queries.
4. **Integration** — Replaced mock imports with real props, wired `useOptimistic` for like toggle, lifted filter state to URL searchParams.
5. **Tester pass** — Added defensive try/catch on every query (slightly overcautious but caught auth-gate edge case).
6. **Reviewer pass** — Caught M1, M2, H1. Applied all fixes before merge.

## Root Cause Analysis

**Why aggregate syntax was misguessed:**

SQL aggregate thinking (`SELECT COUNT(*) ...`) doesn't translate to PostgREST response shape. The API is correct, the pattern is just not obvious without explicit callout in examples. When you're used to SQL returning `{ count: 5 }` and the docs show one example, you guess the rest. Silent 0 means the mistake doesn't surface until data review.

**Why seed leaked into migrations:**

The `WHERE NOT EXISTS` pattern is idempotent, so it worked fine locally. In prod, if the schema exists but seed hasn't run, the INSERT silently succeeds (data already there from earlier setup). This creates invisible inconsistency: local has seed, staging/prod doesn't. Takes environment parity testing (or a UAT report) to notice.

**Why filter state split:**

Two different developers, two different mental models. One thought "filters live in state," the other thought "filters live in URL." Both patterns work, but mixing them creates two sources of truth and doubles the recomputation.

## Lessons Learned

1. **supabase-js aggregates key by column name, full stop.** `.select('column.count()')` returns `{ column: N }`, never `{ count: N }`. Document this explicitly in the query layer. A `@ts-check` comment or a one-liner in a nearby comment saves hours of debugging.

2. **Seed and migration contracts are sacred.** Keep seed in `supabase/seed.sql`, structure in migrations. Violating this breaks environment parity and hides bugs until UAT. The convention exists because teams learned the hard way.

3. **Parallel tracks actually work when you decouple UI and backend properly.** The UI agent finished its mock-data components while backend was still designing the schema. No blocking, no waiting, no merge hell. Integration was just a types unification (re-export module), not a rework. This pattern should be the default for MoMorph work.

4. **Single source of truth for derived state.** Filter state at the page level, pass down as props. Don't compute it in multiple places. URL searchParams are the right home because they survive navigation and compose well with URL.

## Next Steps

- **Add comment to `lib/kudos/get-kudos-with-stats.ts`:** Explicitly call out aggregate key naming rule. One-liner saves next dev 30 minutes.
- **Audit migrations:** Scan `supabase/migrations/` for any other seed data; move to `supabase/seed.sql` if found.
- **Tester overcautiousness:** The defensive try/catch on auth-gate edge case was actually a good catch. Document this pattern in testing standards for Supabase queries.

## Wins

- Two-track parallel strategy delivered 15 UI components + full backend independently.
- RPC `toggle_kudos_like` with special-day weight=2 + self-like-prevention trigger all working.
- Sidebar stats (`heartsReceived`, `kudosCount`) correctly wired after M2 fix.
- All tests pass after fixes. Reviewer score: 8/10.
- Commit clean, ready for main.

**Status:** DONE  
**Summary:** M1 seed-in-migration (moved to seed.sql), M2 aggregate syntax (keyed by column name, not function), M3 filter dedup (single resolveFilteredKudosIds at page level). All fixed pre-merge. Parallel tracks worked as designed.
