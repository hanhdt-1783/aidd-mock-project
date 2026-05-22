# Phase 02 — Auth gate on /awards

**Track:** B
**Priority:** High (test case ID-1)

## Goal

Anonymous user visiting `/awards` (or any deep link like `/awards#mvp`) is redirected to `/login`. Logged-in user proceeds as normal.

## File to modify

- `app/awards/page.tsx` — created by Track A. Add the auth guard at the top.

## Code

```ts
// app/awards/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AwardsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  // ...rest of Track A composition continues from here
}
```

## Success criteria

- Anonymous visit to `/awards` → 307 redirect to `/login`
- Anonymous visit to `/awards#mvp` → 307 redirect to `/login` (hash is preserved client-side but redirect doesn't carry it; acceptable per clarifications — no `redirectTo` param this iteration)
- Authenticated visit to `/awards` → page renders normally

---

## Final notes

**Status:** ✅ DONE

Auth guard implemented in `app/awards/page.tsx:29` using `createClient()` and `getUser()`. Unauthenticated users redirect to `/login` (test case ID-1 verified). Role check included for admin status display (lines 32-37). No deviations from spec.
