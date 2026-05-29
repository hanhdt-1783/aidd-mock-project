# Phase 4 — Integrate UI ↔ Backend

## Goals
Replace mock data in UI components with real props from the server. Wire like-toggle to the server action.

## Steps
1. **Consolidate types** — delete `app/_components/kudos/types.ts` (UI agent's local copy). Update all UI components to import from `@/lib/kudos/types`. Resolve any field-name mismatches.
2. **Update `app/kudos/page.tsx`** — replace placeholder with:
   - Auth gate (redirect to /login if not signed in)
   - Parallel data fetch:
     - `listHighlightKudos(viewerId, filters, 5)`
     - `listAllKudos(viewerId, filters, 20)`
     - `getSidebarStats(viewerId)`
     - `listGiftRecipients(10)`
     - `listHashtags()`
     - `listDepartments()`
     - `getTotalKudosCount()`
     - `listSpotlightNames(80)`
   - Read filters from `searchParams` (`?hashtag=X&department=Y`)
   - Pass everything as props to top-level Kudos client component
3. **Remove `kudos-mock-data.ts`** once components no longer depend on it.
4. **Wire like-toggle** in `kudos-card.tsx` + `kudos-card-highlight.tsx`:
   - Replace local-state toggle with `useTransition` + `toggleKudosLike(id)` server action
   - Optimistic update on click, reconcile from response
   - Show optimistic `+1/-1` on the like count
5. **Wire filter buttons** in `kudos-highlight-section.tsx`:
   - On select, push `router` to `/kudos?hashtag=X` (or `?department=Y`). Server component re-fetches.
6. **Wire entry input + Mở quà button** to dispatch a toast (already in UI as local state; just ensure the i18n keys point to the right strings).

## Resolve naming conflict
- Type vs component both named `KudosCard` — rename the component to `KudosPostCard` OR keep type and component but import type as `import type { KudosCard as KudosCardData } from '@/lib/kudos/types'`. Decide at integration time, prefer the second pattern (less file churn).

## Acceptance
- `npm run build` succeeds
- `/kudos` renders real seed data
- Like toggle persists across reload
- Hashtag/department filters change the rendered list
- Empty states verifiable by deleting seed rows

## Status
Completed 2026-05-24. Types consolidated. Page wired for data fetching. Like toggle + filter buttons functional. Mock data removed.
