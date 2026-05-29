# Clarifications — Sun* Kudos Live Board

## Session 2026-05-23
- Q: Scope for this session? → A: MVP layout + all 4 sections with real data. Carousel + like + filters functional. Spotlight + Mở quà stubbed.
- Q: Send-kudos dialog (clicking input)? → A: Out of scope. Input click → toast 'Coming soon'. No create flow.
- Q: Spotlight word cloud (388 KUDOS center board)? → A: Static SVG/list layout matching design. Real count from DB. Pan/zoom + search stubbed.
- Q: Sidebar D (stats + leaderboards + Mở quà)? → A: Stats from DB. Mở quà → toast placeholder. Leaderboards from seed data with empty state.

## MoMorph refs
- Sun* Kudos - Live board: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
- Frame: 2940:13431 · 64 spec items · 41 test cases

## In-scope features (functional)
- View highlight carousel (top 5 by likes, with prev/next + page index)
- Filter by hashtag + department (affects both Highlight + All Kudos)
- Like toggle on kudos card (1 per user, sender can't like own; +1 normal day, +2 special day)
- Copy link → toast 'Link copied — ready to share!'
- All Kudos infinite-scroll feed (paginated)
- Sidebar real stats: kudos received, kudos sent, hearts received, secret boxes opened/unopened
- Two leaderboards from seed (10 latest rank-ups, 10 latest gift recipients)
- Empty states: "Hiện tại chưa có Kudos nào." / "Chưa có dữ liệu"

## Out-of-scope (stubbed)
- Submit-kudos dialog (separate screen; input → toast)
- Spotlight word cloud interactivity (pan/zoom/search/click-node) — static visual only
- Kudos detail page navigation (link present but target page not built)
- Profile page navigation (link present, /profile already a placeholder)
- Secret Box / "Mở quà" dialog (button → toast)
- Image gallery / attachments (display in seed if present, no full-image modal)
- Hashtag click → filter (in scope only via the filter dropdowns)
- Hover profile preview popovers

## Tech choices
- Auth required (per TC 71b3ef43) — page redirects to /login if not authenticated
- Supabase local: new migration file `supabase/migrations/{ts}_create_kudos_tables.sql`
- Server components fetch data via `lib/supabase/server.ts`
- Like toggle as server action (`'use server'`)
- Real-time: NOT in scope (page revalidates on like via router.refresh())
