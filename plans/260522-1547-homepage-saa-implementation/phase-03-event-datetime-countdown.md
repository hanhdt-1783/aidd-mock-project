# Phase 03 — Event datetime env + countdown contract

**Track:** B
**Priority:** Medium

## Goal

Define the `NEXT_PUBLIC_EVENT_DATETIME` env var and document the countdown's fallback behavior. The countdown component lives in Track A; Track B owns env + the helper that parses the value.

## Files to create

- `lib/event/get-event-datetime.ts` — server helper that returns `Date | null`

## Files to modify

- `supabase/.env.example` (no — that's for supabase only; instead, document in `docs/`)
- `docs/homepage-saa.md` — describe env var + countdown behavior

## Behavior (matches test cases ID-56, ID-57, ID-60)

| Env value | Countdown | "Coming soon" label |
|---|---|---|
| Valid ISO-8601 future date | Real DD/HH/MM, ticks each minute | visible |
| Valid ISO-8601 past date | `00 / 00 / 00` | hidden |
| Missing or invalid | `-- / -- / --` | hidden |

## Helper

```ts
// lib/event/get-event-datetime.ts
export function getEventDatetime(): Date | null {
  const raw = process.env.NEXT_PUBLIC_EVENT_DATETIME?.trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}
```

## Success criteria

- `getEventDatetime()` returns `null` for unset/invalid, `Date` for valid ISO-8601
- Countdown component (Track A) consumes `targetIso: string | null` prop
- Compile passes (`npx tsc --noEmit`)

## Final notes

**Status: ✅ DONE**

Helper `lib/event/get-event-datetime.ts` created and deployed. Parses `NEXT_PUBLIC_EVENT_DATETIME` (ISO-8601), returns `Date | null`. Tester confirmed fallback logic: invalid/missing env shows "--" tiles + hides "Coming soon" label. All 3 countdown states tested (future, past, missing). Compiled cleanly. No deviations from plan.
