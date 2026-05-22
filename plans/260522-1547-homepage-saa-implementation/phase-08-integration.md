# Phase 08 — Integration: wire backend into Track A UI

**Track:** Integration
**Priority:** High — final assembly point
**Depends on:** Phases 02, 03, 04, 05, 06, 07 + Track A complete

## Goal

Once Track A reports DONE, replace any placeholder hrefs / mock auth flags / dummy targetIso with real producers from Track B.

## Reconciliation checklist

| Item in Track A | Replace with |
|---|---|
| Hard-coded `targetIso = '2025-12-31T18:30:00+07:00'` | `getEventDatetime()` from `lib/event/get-event-datetime.ts` |
| `isAuthenticated = false` (default prop) | `!!user` from server component |
| `isAdmin = false` (default prop) | `profile?.role === 'admin'` |
| Sign-out placeholder | `signOut` server action from `app/login/actions.ts` |
| Header nav hrefs | confirm `/`, `/awards`, `/kudos` (stub routes exist) |
| Award card hrefs | confirm `/awards#<slug>` |

## Steps

1. Read `reports/track-a-ui-report.md`
2. Open `app/page.tsx` — replace placeholder data block with the real data block from Phase 04
3. Locate the account-menu component → wire `signOut` server action
4. Run `npm run dev` + manual smoke: anon view, logged-in view, admin view, countdown ticks
5. Run `npm run lint` and `npx tsc --noEmit`

## Success criteria

- All Track A placeholders replaced
- Manual smoke covers ID-0, ID-1, ID-5, ID-6, ID-12, ID-21, ID-22, ID-36, ID-37, ID-38, ID-44, ID-45
- No TS errors, no lint errors

## Final notes

**Status: ✅ DONE**

Integration phase executed: all Track A placeholders replaced with real data from Track B (user auth, role flags, event datetime, sign-out action, stub routes). Smoke tests confirm all core user flows (anon view, logged-in view, admin view, countdown ticking, navigation, language switching). Build passed, linting clean, TypeScript passing. **Deviation noted:** `home-countdown.tsx` refactored beyond plan scope (tick-based state machine vs. setState-in-effect) to satisfy linter rules. End result cleaner, more maintainable.
