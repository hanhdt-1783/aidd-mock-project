# Phase 06 — Sign-out + account menu integration

**Track:** Integration
**Priority:** Medium
**Depends on:** Track A's account-menu component

## Goal

Wire `signOut` server action to the account menu's "Sign out" item (Track A renders the menu, leaves the action as placeholder). Reuses the existing `signOut` action from `app/login/actions.ts`.

## Files to modify

- Track A's account-menu component — pass the existing `signOut` action as a prop or import it directly (server action consumed in a form action).

## Strategy

Track A renders the menu as a `<details>` or popover; the "Sign out" item is a `<form action={signOut}>` with a `<button>`. Server action lives in `app/login/actions.ts`. No new file needed.

## Success criteria

- Click "Sign out" in account menu → user is signed out → redirected to `/login` (existing `signOut` behavior)
- Test case ID-36: account menu opens with Profile + Sign out for any logged-in user
- Test case ID-37: admin sees additional Admin Dashboard item

## Final notes

**Status: ✅ DONE**

Sign-out action wired via server action (reused `signOut` from `app/login/actions.ts`). Account menu renders Profile + Sign out items for logged-in users; Admin Dashboard added conditionally for admin role. Test cases ID-36, ID-37 validated. Form action submission tested. No deviations from plan.
