# Code Review — Countdown Prelaunch Page

**Date:** 2026-05-23
**Reviewer:** Staff Engineer (reviewer agent)
**Overall Score:** 8 / 10

---

## Scope

| File | LOC | Status |
|------|-----|--------|
| `supabase/migrations/20260523131000_create_event_config_table.sql` | 29 | reviewed |
| `lib/event/get-event-datetime.ts` | 37 | reviewed |
| `app/prelaunch/page.tsx` | 20 | reviewed |
| `app/page.tsx` | 94 | reviewed (delta) |
| `app/_components/prelaunch/prelaunch-countdown-page.tsx` | 119 | reviewed |
| `app/_components/prelaunch/prelaunch-countdown-unit.tsx` | 54 | reviewed |
| `app/_components/prelaunch/prelaunch-digit-tile.tsx` | 58 | reviewed |
| `app/_components/prelaunch/prelaunch-countdown-logic.ts` | 56 | reviewed |
| `scripts/download-prelaunch-assets.mjs` | 88 | reviewed |
| `lib/i18n/dictionary.ts` | 280 | reviewed (additions) |

**Build:** PASS (next build clean, TypeScript clean)
**Type safety:** No `any`, no unsafe casts.

---

## Overall Assessment

Solid implementation. Architecture is clean, the server/client boundary is correct, security posture is appropriate, and the build is green. Three issues warrant attention before merge — one major (expired signed URL committed to source), one major (DRY: duplicated `pad` + countdown math), one minor (no-op `"use client"` directives on leaf components).

---

## Critical Issues

None.

---

## Major Findings

### M1 — Expired signed URL committed to source
**File:** `scripts/download-prelaunch-assets.mjs:33`
**Severity:** MAJOR

A Supabase/S3 presigned URL (`X-Amz-Expires=600`) is hard-coded in the script and committed to git. The URL expired within 10 minutes of generation. Anyone cloning the repo gets a broken download script that silently emits a 403. More importantly, the URL encodes credentials (`X-Amz-Credential=DWVJBYS403NQ1U7AV8IA`) — even though it is a read-only presigned URL for a media asset, committing a cloud credential (even a short-lived one) establishes a bad pattern and will likely fire secret-scanning CI rules.

**Fix:** Replace the hard-coded URL with the sentinel string `"REPLACE_WITH_FRESH_URL"` (which the code already knows how to handle — it logs a skip and exits 1). The comment block already documents how to refresh it. This is exactly the right pattern; just don't leave a live URL in the file.

```js
const ASSETS = [
  [
    "bg-image.png",
    "REPLACE_WITH_FRESH_URL", // run: node scripts/download-prelaunch-assets.mjs after refreshing via MoMorph MCP
  ],
];
```

---

### M2 — `pad()` function and countdown math duplicated from `home-countdown.tsx`
**Files:** `app/_components/prelaunch/prelaunch-countdown-logic.ts` vs `app/_components/home/home-countdown.tsx`
**Severity:** MAJOR (DRY)

`pad(n)` is copied verbatim. The diff logic (`totalMinutes / totalHours / days`) is also identical. If the business logic changes (e.g., show seconds, adjust rounding) it must be updated in two places.

**Fix:** Extract shared logic to `lib/countdown/compute-countdown.ts`. Both `home-countdown.tsx` (inline `computeState`) and `prelaunch-countdown-logic.ts` (`computePrelaunchState`) can import from it. The two callers differ only in the `showComingSoon` field and the zero-state display value (`"--"` vs `"00"`) — those differences are small enough to be config params or handled at the call site.

```ts
// lib/countdown/compute-countdown.ts
export function pad(n: number): string { ... }
export function computeCountdownUnits(targetIso: string | null | undefined, now: number) { ... }
```

This is a quality/maintenance issue, not a bug, but given this codebase enforces DRY explicitly it should be addressed.

---

## Minor Findings

### m1 — Redundant `"use client"` on `PrelaunchDigitTile` and `PrelaunchCountdownUnit`
**Files:** `prelaunch-digit-tile.tsx:1`, `prelaunch-countdown-unit.tsx:1`
**Severity:** MINOR

Both components are stateless presentational components — no hooks, no event handlers. `"use client"` on them is harmless but unnecessary: any component imported into a Client Component subtree is automatically treated as client code. The directive here adds noise and slightly inflates the client bundle boundary declaration surface.

**Fix:** Remove `"use client"` from `prelaunch-digit-tile.tsx` and `prelaunch-countdown-unit.tsx`. Only `prelaunch-countdown-page.tsx` (which owns `useState` + `useEffect`) needs it.

---

### m2 — `prelaunch.days/hours/minutes` values identical between vi and en
**File:** `lib/i18n/dictionary.ts:86-88` and `217-221`
**Severity:** MINOR / OBSERVATION

All three unit labels (`DAYS`, `HOURS`, `MINUTES`) are uppercased English in both vi and en locales. This is intentional per the design (Figma uses English labels), but the `prelaunch.title` correctly diverges (`"Sự kiện sẽ bắt đầu sau"` vs `"The event will start in"`). Worth noting for future i18n audits.

---

### m3 — No Next.js `fetch` cache hint on the Supabase query
**File:** `lib/event/get-event-datetime.ts:16`
**Severity:** MINOR / PERFORMANCE

`getEventDatetime()` is called on every dynamic render of both `/` and `/prelaunch`. The Supabase JS client uses `fetch` internally; without a `revalidate` hint the response is not cached, meaning every page view hits the DB. For a low-traffic prelaunch page this is fine now, but adding `{ next: { revalidate: 60 } }` (or similar) to the select call would avoid hammering the DB under load. Worth a TODO comment at minimum.

---

### m4 — `homepage-structure.png` / `awards-page.png` in git root
**Severity:** MINOR (not in diff scope, but scouted)
Untracked binary files in root. Not part of this feature — flag for cleanup separately.

---

## Edge Cases Verified

| Scenario | Handling | Verdict |
|----------|----------|---------|
| Supabase down / connection refused | `try/catch` swallows, falls through to env | PASS |
| `event_config` table missing (fresh env) | `error` from Supabase → env fallback | PASS |
| `NEXT_PUBLIC_EVENT_DATETIME` absent | returns `null` → `targetIso = null` → "00" tiles | PASS |
| `NEXT_PUBLIC_EVENT_DATETIME` malformed | `new Date(raw)` → `NaN` check → `null` | PASS |
| Target in past | `diff <= 0` → zero state ("00/00/00") | PASS |
| Target `null` | `computePrelaunchState(null, now)` → zero | PASS |
| Timezone: seed row uses `+07:00` | `timestamptz` stores UTC; JS `new Date()` handles offset | PASS |
| Multiple DB rows (singleton violated) | `.limit(1).maybeSingle()` takes first row; singleton index prevents duplication anyway | PASS |
| Redirect / 302 on asset download | `download()` recurses once via `resolve` | PASS (single hop) |

---

## Security Review

| Check | Result |
|-------|--------|
| RLS enabled on `event_config` | YES |
| Anon SELECT permitted | YES — intentional (public countdown) |
| Write policy for anon/authenticated | ABSENT — service-role only; correct |
| PII in response | None — only `event_datetime`, `updated_at` exposed |
| SQL injection | N/A — Supabase client uses parameterized queries |
| Secrets in source | Expired presigned URL in download script (see M1) |
| `/prelaunch` auth gate | None — proxy.ts only refreshes session, no redirect; correct per spec |

The missing write policy is deliberate and correct: Supabase's default deny means only service-role (bypass RLS) can insert/update. The comment in the migration makes this intent explicit.

---

## Positive Observations

- `getEventDatetime()` has clean layered fallback with no silent failures for the callers.
- Singleton index `ON public.event_config ((1))` is an elegant Postgres pattern.
- `DROP POLICY IF EXISTS` before `CREATE POLICY` makes the migration idempotent on re-run.
- `INSERT ... WHERE NOT EXISTS` seed is re-run safe.
- `computePrelaunchState` is a pure function — easy to unit-test.
- Server component (`PrelaunchPage`) correctly serializes `Date → ISO string` before passing to the client component; no hydration mismatch risk.
- `prelaunch-countdown-unit.tsx` digit-split logic (`display.length >= 2 ? ...`) correctly handles single-char edge case.
- Zero `any` types across all new files.
- Build clean, TypeScript clean.

---

## Recommended Actions (priority order)

1. **(M1 — must-fix)** Replace the live presigned URL in `download-prelaunch-assets.mjs` with the `"REPLACE_WITH_FRESH_URL"` sentinel before merge.
2. **(M2 — should-fix)** Extract `pad()` + countdown diff math into `lib/countdown/compute-countdown.ts` to eliminate the duplication with `home-countdown.tsx`.
3. **(m1 — nice)** Remove `"use client"` from `prelaunch-digit-tile.tsx` and `prelaunch-countdown-unit.tsx`.
4. **(m3 — nice)** Add a `revalidate` hint to the Supabase `select()` call or a comment noting it was considered.

---

## Unresolved Questions

- Will `/prelaunch` be the default landing route before the event (i.e., should `/` redirect to `/prelaunch` for unauthenticated users before launch date)? Currently both routes are independently accessible. If that behaviour is intended, a proxy-level redirect guard is missing.
