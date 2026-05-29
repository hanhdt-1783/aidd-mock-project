# Sun* Kudos — Live Board

**Status:** Completed (2026-05-24)
**MoMorph:** [Sun* Kudos - Live board](https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ) — screenId `MaZUn5xHXZ`
**Clarifications:** [clarifications.md](./clarifications.md)

## Scope (MVP)
Static layout matching Figma. Real data for highlight carousel, all-kudos feed, sidebar stats. Like toggle, filters, copy link functional. Spotlight word cloud as static visual. Submit dialog + Mở quà dialog out of scope (placeholder toasts).

## Phases
- [x] Phase 0 — Discovery & clarification
- [x] Phase 1 — UI implementation → `phase-01-ui-implementation.md`
- [x] Phase 2 — DB schema + migration → `phase-02-database-schema.md`
- [x] Phase 3 — Backend data layer (queries + actions) → `phase-03-backend-data-layer.md`
- [x] Phase 4 — Integrate UI ↔ backend → `phase-04-integration.md`
- [x] Phase 5 — Verify (tester + reviewer + dev server) → `phase-05-verify.md`

## Architecture
```
app/kudos/page.tsx                 (server component, fetches data, auth gate)
  └─ KudosPage                     (client orchestrator)
       ├─ KudosHeroBanner          (Section A)
       │    └─ KudosEntryInput     (A.1 — opens toast)
       ├─ KudosHighlightSection    (Section B header + filters)
       │    ├─ KudosFilterButton×2 (hashtag, department)
       │    └─ KudosHighlightCarousel (B.2 — top 5 by likes)
       │         └─ KudosCardHighlight× (B.3)
       ├─ KudosSpotlightBoard      (Section B.7 — static)
       ├─ KudosAllSection          (Section C)
       │    └─ KudosCard×          (C.3..C.7)
       └─ KudosSidebar             (Section D)
            ├─ KudosSidebarStats   (D.1)
            └─ KudosSidebarLeaderboard× (D.3)
```

## Data layer
- `lib/kudos/queries.ts` — server-side fetchers (listHighlightKudos, listAllKudos, getSidebarStats, listGiftRecipients, listHashtags, listDepartments)
- `lib/kudos/actions.ts` — server actions (toggleLike)
- `lib/kudos/types.ts` — domain types shared with UI

## Database
- `kudos` — kudos posts
- `kudos_likes` — like junction (per user per kudos)
- `hashtags` — master list (cleanup on FK)
- `kudos_hashtags` — junction
- `departments` — master list of departments
- `profiles` — extend existing w/ name, avatar_url, department_id, title, rank_stars (or compute rank_stars from kudos count)
- `gift_recipients` — for D.3 leaderboard (seeded only)
- `secret_boxes` — for D.1 stats (per user; unopened/opened state)

## Out of scope
- Send-kudos dialog and create endpoint
- Spotlight pan/zoom/search interactivity
- Mở quà / Secret Box reveal dialog
- Kudos detail page route
- Special-day +2 hearts logic (column added to schema, but admin config UI not built)

## Key dependencies
- Existing: `HomeHeader`, `HomeFooter`, supabase server/client, i18n dictionary
- New translation keys: `kudos.*` family

## Risks
- Spotlight static layout may look poor without canvas — limit to ~80 names, use CSS positioning + font-size variation
- Sidebar leaderboards mostly empty in real data — seed data must include at least 3 rows so visual is testable

## Completion Summary

**Tester:** All 9 test scenarios PASS. Fixed 2x TypeError on unauthenticated render via defensive try/catch + safe guards in queries + page.

**Reviewer:** DONE_WITH_CONCERNS. Flagged 3 items, all now fixed:
- Seed moved from migration to `supabase/seed.sql` (migration schema-only)
- `heartsReceived` keyed correctly via `.like_count`
- `applyFilters` refactored → single resolution, both list fetchers use pre-resolved IDs

**Verification:** Type-check clean. Build clean. DB reset + seed apply cleanly. Hearts aggregate verified (9 for u2).
