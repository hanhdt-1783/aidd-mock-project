# Phase 03 — Event Datetime Resolver (Track B) ✅ Done

## Overview

Extend `lib/event/get-event-datetime.ts` to read from Supabase `event_config` first, fall back to env. Becomes async (server-only) since it calls `createClient()`.

## Contract

```ts
export async function getEventDatetime(): Promise<Date | null>
```

Behavior:

| Source state | Returns |
|---|---|
| Supabase row present, valid `event_datetime` | `Date` from DB |
| Supabase query errors OR row missing OR invalid datetime | Try env fallback |
| Env present + parseable | `Date` from env |
| Neither | `null` |

## File

`lib/event/get-event-datetime.ts` — replace existing synchronous impl.

## Caller Changes

Two existing callers, both server components:

- `app/page.tsx` — already `await`s Supabase calls, swap to `await getEventDatetime()`.
- `app/prelaunch/page.tsx` (Track A) — same.

`home-countdown.tsx` is a client component that already receives `targetIso` as a prop — no change.

## Acceptance

- TypeScript compiles.
- When DB row present → countdown shows DB datetime.
- When DB row absent + env present → countdown shows env datetime.
- When both absent → countdown shows `--` (pre-existing null path).
- No runtime errors on missing table (graceful try/catch).

## Actual Outcome

- Function signature: `export async function getEventDatetime(): Promise<Date | null>` (37 LOC).
- DB-first fallback logic: try Supabase select → on error or null, try env `NEXT_PUBLIC_EVENT_DATETIME`.
- Error handling: try/catch wrapping Supabase calls; graceful degradation to env or null.
- Both callers updated: `app/page.tsx` and `app/prelaunch/page.tsx` now `await` the resolver.
- TypeScript: clean, no `any` or unsafe casts.
- Callers verified: Grep confirmed no other call sites.
- Tested: DB row returns correct Date; absent row + env fallback works; both absent returns null.

## Risk

- **Breaking change:** sync → async. Mitigated by updating all callers in same phase. ✅ No other callers remain.

## Deferred (No blockers — follow-up tasks)

- **m2:** Add `{ next: { revalidate: 60 } }` (or similar) fetch cache hint to avoid hammering DB on high-traffic pages. Worth TODO comment at minimum for now.
