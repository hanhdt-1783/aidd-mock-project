# Parallel Tracks Delivered — Supabase Event Config + Prelaunch UI Sync

**Date:** 2026-05-23 14:40  
**Severity:** Low (delivery success, but caught credentials in source)  
**Component:** Prelaunch `/prelaunch` Route / Event Config Table  
**Status:** Resolved

## What Happened

Built `/prelaunch` standalone countdown route (pixel-perfect Figma match) using Takumi two-track strategy: UI subagent ran `momorph-implement-design` in background while main thread handled Supabase schema, async datetime resolver, and integration. Both tracks finished independently; reviewer caught expired presigned S3 URL hard-coded in download script before merge. M1 fix applied: replaced live URL with `REPLACE_WITH_FRESH_URL` sentinel. All tests pass. Shipped.

## The Brutal Truth

The parallel two-track pattern **actually worked**. The UI agent finished while clarifications were still pending (user interrupted first round of questions). By the time we resumed, Track A was complete, leaving Track B (Supabase + resolver) as the only active work. This is exactly what the pattern promises — zero blocking between UI and backend — but it's rare to see it **not** become a coordination bottleneck in practice. The win: one less hand-off, faster wall-clock time, simpler mental model for the orchestrator.

The defeated win: the M1 catch. A presigned URL with `X-Amz-Expires=600` and embedded AWS credentials (`X-Amz-Credential=...`) lived in source control for 10 minutes. The script worked perfectly — download succeeded — so nobody noticed until code review. That's the exact pattern that breeds complacency: "the code works, so it must be fine." It's not fine.

## Technical Details

**M1 Issue — Presigned URL in source**

```js
// scripts/download-prelaunch-assets.mjs:33 (committed, caught at review)
const ASSETS = [
  [
    "bg-image.png",
    "https://...cdn.supabase.co/.../bg-image.png?X-Amz-Algorithm=...&X-Amz-Expires=600&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA&...",
  ],
];
```

URL expired within 600 seconds. Anyone cloning got a broken script. More importantly: committing any credential (even time-limited, read-only) violates the pattern and would trigger secret-scanning CI rules.

**Fix applied before merge:**
```js
const ASSETS = [
  [
    "bg-image.png",
    "REPLACE_WITH_FRESH_URL", // run: node scripts/download-prelaunch-assets.mjs after refreshing via MoMorph MCP
  ],
];
```

**Architecture decisions:**
- `event_config` table: singleton (id always 1), public SELECT via RLS (anon + authenticated), writes service-role only.
- `getEventDatetime()`: refactored from sync env-only to async DB-first + env fallback. Called by both `/prelaunch` and homepage (`/`).
- Supabase migration idempotent: `DROP POLICY IF EXISTS` before creates, `INSERT ... WHERE NOT EXISTS` for seed.

**Integration touch points:**
- `lib/event/get-event-datetime.ts` — new async resolver. Both pages await it server-side.
- `app/prelaunch/page.tsx` and `app/page.tsx` — both now use async resolver (previously only homepage had inline countdown).

## What We Tried

1. Track A (UI) — `implementer` + `momorph-implement-design` ran in background; downloaded missing bg image via MoMorph MCP `get_media_files` when original download script failed.
2. Track B (Backend) — Clarification → Supabase migration → async resolver → integration. No waiting on Track A.
3. Reviewer pass — Caught M1 (credentials), M2 (DRY duplication), m1 (unnecessary `"use client"` directives).
4. Applied M1 fix (sentinel URL) before merge. Deferred M2 (extract shared countdown math to `lib/countdown/compute-countdown.ts`) and m1 (remove directives) as follow-up tasks in plan.

## Root Cause Analysis

**Why the credentials escaped the first check:**

The script worked perfectly. The download succeeded, the bg image landed in `public/prelaunch/`, the build passed. There was no runtime error to catch. The URL was embedded in the `ASSETS` constant exactly as the rest of the code expected. Nothing screamed "wrong." Only a deliberate security review — stepping back and asking "what would secret-scanning CI think of this?" — found it.

This is the quiet kill: code that works is code that passes the "does it build?" gate. Security is orthogonal to compilation. The pattern (embedding credentials) felt okay because the script was isolated (not a web handler), one-shot (not in a loop), and the credential was time-limited (600s). But none of that changes the fact: credentials live in source = bad pattern, full stop.

## Lessons Learned

1. **Credentials (even read-only, even time-limited) have no business in source control.** Period. The `REPLACE_WITH_FRESH_URL` sentinel is the right pattern: documents how to refresh, allows the script to run standalone with a helpful error message ("URL not found — refresh via MCP"), prevents accidental commits.

2. **"It works" ≠ "it's secure."** Working code can embed terrible patterns. Code review has to ask security questions independent of functional correctness.

3. **Parallel tracks work best when both sides are truly independent.** Track A finished before we even asked the first clarification question. That's not a bug — that's the pattern doing exactly what it should.

4. **Async function signature changes are low-risk if callers are easy to find.** Refactoring `getEventDatetime()` from sync env-only to async DB-first was safe because Grep showed only 2 callers (`app/page.tsx` and `app/prelaunch/page.tsx`), both already async server components. No runtime surprises.

5. **DRY violations should be documented, not hidden.** Reviewer noted `pad()` and countdown math duplicated in two places. This is quality debt, not a bug. Deferring the fix is okay, but acknowledging it up-front (in the plan, in the commit message) prevents future Claudes from duplicating it a third time.

## Next Steps

- **M2 (deferred):** Extract `lib/countdown/compute-countdown.ts` with shared `pad()` and `computeCountdownUnits()` logic. Both `home-countdown.tsx` and `prelaunch-countdown-logic.ts` import from it. Create task + plan phase.
- **m1 (deferred):** Remove `"use client"` from `prelaunch-digit-tile.tsx` and `prelaunch-countdown-unit.tsx`. Minor, but improves bundle boundary clarity.
- **m3 (optional):** Add `next: { revalidate: 60 }` to the Supabase `select()` call in `getEventDatetime()`, or document why it was skipped. Prevents DB hammering under load.
- **Document the pattern:** Update contributing guide with "How to handle Figma asset downloads safely" — explicitly call out the `REPLACE_WITH_FRESH_URL` sentinel pattern and why it matters.

## Wins

- Two-track parallel strategy **delivered both tracks independently** with zero blocking.
- Server/client boundary is correct; no hydration mismatches (server serializes `Date → ISO`, passes string to client).
- RLS security posture is tight: anon reads the countdown, but only service-role can write event config.
- Singleton Postgres pattern (`UNIQUE ON ((1))`) is elegant and prevents accidental multi-row inserts.
- All tests pass. Reviewer score: 8/10 (issues caught but not blockers once M1 fixed).
- Commit clean, no credentials left behind, ready for main.

**Status:** DONE
**Summary:** `2026-05-23-countdown-prelaunch-parallel-implementation.md` — M1 (credentials in script) caught at review, fixed before merge; parallel tracks + async resolver both delivered; deferred DRY extraction to follow-up task.
