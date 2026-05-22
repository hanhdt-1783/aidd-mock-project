# Phase 04 — Auth + role wiring in homepage server component

**Track:** B (Integration with Track A)
**Priority:** High
**Depends on:** Phase 02 (profiles table), Track A (`home-header` accepts `isAuthenticated` + `isAdmin` props)

## Goal

The homepage server component reads the current user + role and passes flags down to Track A's header. Anonymous users still see the page (homepage is public per test cases ID-0, ID-1) but no bell/account-menu.

## Files to modify

- `app/page.tsx` (Track A creates the base file; Track B replaces the placeholder data-fetch block)

## Logic

```ts
// app/page.tsx (server component)
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/get-lang';
import { getEventDatetime } from '@/lib/event/get-event-datetime';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  const lang = await getLang();
  const eventDate = getEventDatetime();
  const targetIso = eventDate ? eventDate.toISOString() : null;

  return (
    <HomeShell
      lang={lang}
      isAuthenticated={!!user}
      isAdmin={isAdmin}
      targetIso={targetIso}
    />
  );
}
```

The `HomeShell` component is Track A's composition root (or `app/page.tsx` directly composes Header / Hero / Awards / Kudos / Footer / WidgetButton).

## Security

- `profiles.role` reads are gated by RLS — only the authenticated user's own row is returned
- `isAdmin` defaults to `false` if profile row missing or user is anonymous

## Success criteria

- Anonymous visit to `/` shows homepage with no bell/account menu (header right side: `[Lang]` only)
- Logged-in non-admin: shows bell + avatar; account menu items = Profile + Sign out
- Logged-in admin: account menu items = Profile + Sign out + Admin Dashboard
- `npm run build` succeeds; `npx tsc --noEmit` clean

## Final notes

**Status: ✅ DONE**

Auth wiring in `app/page.tsx` implemented as planned. Server component reads `getUser()` + queries `profiles.role`, passes `isAuthenticated` + `isAdmin` flags to header. Anonymous users see lang-only header; logged-in users see bell + avatar; admin flag conditionally renders "Admin Dashboard" menu item. Build passed, TypeScript clean. No deviations from plan.
