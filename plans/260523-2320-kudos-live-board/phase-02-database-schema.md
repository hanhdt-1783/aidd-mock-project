# Phase 2 — Database Schema

## Tables

### `profiles` (EXTEND existing)
Existing columns: `id (uuid PK)`, `role`, `created_at`, `updated_at`.
Add columns:
- `display_name text` — defaults to email local-part
- `avatar_url text` — gmail picture or null
- `department text` — free-text (no FK; departments table is just for filter dropdown distinct values)
- `title text` — e.g. 'Rising Hero', 'Legend Hero', 'CEVC10' (free-text)
- `rank_stars int default 0 check (rank_stars in (0,1,2,3))` — derived from kudos count but stored for read perf

### `kudos`
- `id uuid pk default gen_random_uuid()`
- `sender_id uuid not null references profiles(id) on delete cascade`
- `receiver_id uuid not null references profiles(id) on delete cascade`
- `content text not null check (length(content) > 0 and length(content) <= 1000)`
- `image_urls text[] not null default '{}'` — array of attachment URLs
- `created_at timestamptz not null default now()`
- `is_special_day boolean not null default false` — admin-controlled; affects like weight
- `like_count int not null default 0` — denormalized for sort
- index on `created_at desc`
- index on `like_count desc` (for highlight top-5)
- check `sender_id != receiver_id`

### `kudos_likes`
- `id uuid pk default gen_random_uuid()`
- `kudos_id uuid not null references kudos(id) on delete cascade`
- `user_id uuid not null references profiles(id) on delete cascade`
- `created_at timestamptz not null default now()`
- `weight int not null default 1 check (weight in (1, 2))` — 1 normal, 2 special day
- unique constraint `(kudos_id, user_id)` — 1 per user per kudos
- trigger: on insert/delete, update `kudos.like_count` (+weight / -weight)

### `kudos_hashtags`
- `kudos_id uuid not null references kudos(id) on delete cascade`
- `tag text not null`
- primary key `(kudos_id, tag)`
- index on `tag`

### `gift_recipients` (seed-only, no auth-driven writes)
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `prize_description text not null`
- `awarded_at timestamptz not null default now()`
- index on `awarded_at desc`

### `secret_boxes` (per user; opened flag)
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `opened boolean not null default false`
- `created_at timestamptz not null default now()`
- index on `user_id`

## RLS Policies

### kudos
- SELECT: authenticated (everyone signed-in can read all kudos)
- INSERT: out of scope this session (no UI)
- UPDATE/DELETE: out of scope

### kudos_likes
- SELECT: authenticated
- INSERT: authenticated AND `user_id = auth.uid()` AND sender ≠ receiver (enforce via constraint? actually enforce via policy referencing kudos)
- DELETE: authenticated AND `user_id = auth.uid()`

### kudos_hashtags
- SELECT: authenticated

### gift_recipients
- SELECT: authenticated

### secret_boxes
- SELECT: authenticated AND `user_id = auth.uid()` (own boxes only)

### profiles (UPDATE existing policy to add public-readable name+avatar)
- New policy: SELECT for authenticated on `(id, display_name, avatar_url, department, title, rank_stars)` (already public via Sun* context)

## Triggers / Functions

### `bump_like_count()` — increments/decrements `kudos.like_count`
On insert into kudos_likes → `update kudos set like_count = like_count + NEW.weight where id = NEW.kudos_id;`
On delete → `update kudos set like_count = like_count - OLD.weight where id = OLD.kudos_id;`

### `prevent_self_like()` — INSERT trigger on kudos_likes raises if sender == liker
`select sender_id from kudos where id = NEW.kudos_id` → if `sender_id = NEW.user_id` raise.

### `toggle_kudos_like(kudos_id uuid)` — RPC function
Returns json `{ liked: bool, like_count: int }`.
Logic: if exists row for (kudos_id, auth.uid()) → delete; else insert with weight = (special day ? 2 : 1).

## Seed Data
Place in same migration file (end), or `supabase/seed.sql`:
- 10 sample profiles (use random uuids; do NOT touch auth.users — these are orphan profile rows for display only; or upsert by created_at)
- 20 kudos with varied hashtags + image_urls
- some kudos_likes
- 10 gift_recipients
- 5 secret_boxes

**Important:** Sample profiles must NOT collide with `auth.users` — use synthetic UUIDs. Drop FK constraint to `auth.users` from profiles? **No — current schema has FK. Workaround:** seed sample rows ONLY after creating fake `auth.users` entries via supabase admin SDK, OR use a separate `sample_profiles` table for display.

**Decision:** Add nullable column `profiles.is_synthetic boolean default false`, drop FK requirement OR keep FK but skip seed and rely on the orchestrator (real signed-in users) for testing. **For MVP we will create a separate `display_profiles` view+seed table** OR seed via service-role script outside migration.

**Final approach (simpler):** Move the FK relax — `kudos.sender_id` and `kudos.receiver_id` reference `profiles(id)` directly (already), and we create new auth-less profile rows by *first* relaxing `profiles.id` from FK to `auth.users(id)` (since the project is internal/demo, this is acceptable). Actually NO — that breaks the signup trigger.

**Approved approach:** Add a `kudos_actors` (or generic `directory_users`) table seeded with synthetic users for demo display, and `kudos.sender_id/receiver_id` reference `directory_users(id)` instead of `profiles(id)`. The real signed-in user maps to a directory_user via email match (handled by trigger or join). For MVP simplicity, we will use a SEPARATE table `kudos_actors` with synthetic rows.

## File
`supabase/migrations/20260523232000_create_kudos_tables.sql`

## Acceptance
- `supabase db reset` runs migration cleanly
- Sample queries return rows (e.g. `select * from kudos order by like_count desc limit 5`)
- RLS policies prevent unauthenticated reads (verify with anon role)

## Status
Completed 2026-05-24. Schema + RLS policies + triggers applied. Seed moved to `supabase/seed.sql` (10 actors, 20 kudos, likes, gift_recipients, secret_boxes).
