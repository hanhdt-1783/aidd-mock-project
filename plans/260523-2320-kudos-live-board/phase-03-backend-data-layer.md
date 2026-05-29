# Phase 3 — Backend Data Layer (Track B)

## Files
- `lib/kudos/types.ts` — canonical domain types (KudosUser, KudosCard, SidebarStats, GiftRecipient, KudosFilters)
- `lib/kudos/queries.ts` — server-side fetchers (auth-protected; assumes signed-in user)
  - `getViewerId()`
  - `listHighlightKudos(viewerId, filters, limit=5)`
  - `listAllKudos(viewerId, filters, limit=20)`
  - `getSidebarStats(viewerId)`
  - `listGiftRecipients(limit=10)`
  - `listHashtags()`
  - `listDepartments()`
  - `getTotalKudosCount()`
  - `listSpotlightNames(limit=80)`
- `lib/kudos/actions.ts` — server actions
  - `toggleKudosLike(kudosId)` — calls Postgres RPC `toggle_kudos_like(p_kudos_id)`, returns `{ liked, likeCount }`

## Patterns
- All queries use `createClient()` from `lib/supabase/server.ts` — cookie-based session
- Profiles + hashtags + likes hydration done in batch (one query per dimension, no N+1)
- Type-safe row shapes typed inline; converted to domain types via `toUser()` mapper
- `applyFilters()` returns array of kudos IDs to intersect, or `null` if no filters

## Acceptance
- `tsc --noEmit` clean
- All exports importable from page.tsx
- Like RPC tested: `select public.toggle_kudos_like(<kudos_id>)` returns jsonb when authenticated

## Status
Completed 2026-05-24. Queries + actions implemented. Exported `resolveFilteredKudosIds` for page-level filter resolution (called once, both list fetchers use pre-resolved IDs).
