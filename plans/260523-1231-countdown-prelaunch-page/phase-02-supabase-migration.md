# Phase 02 — Supabase `event_config` Migration (Track B) ✅ Done

## Overview

Single-row table holding the canonical event start datetime. Editable via Supabase Studio. Replaces `NEXT_PUBLIC_EVENT_DATETIME` as primary source; env stays as fallback.

## Schema

```sql
public.event_config
  id             uuid          PK DEFAULT gen_random_uuid()
  event_datetime timestamptz   NOT NULL
  updated_at     timestamptz   NOT NULL DEFAULT now()
```

## RLS

- `event_config_select_anyone` — `FOR SELECT TO anon, authenticated USING (true)` (public read).
- No INSERT/UPDATE/DELETE policy → only service-role or Studio can mutate (matches `homepage-saa.md` admin pattern).

## Seed

INSERT one row with current `NEXT_PUBLIC_EVENT_DATETIME` value (or `2025-12-31T18:30:00+07:00` if env absent), so migration is self-bootstrapping.

## Single-row Enforcement

Use partial unique index on a constant: `CREATE UNIQUE INDEX event_config_singleton ON event_config((1));` — guarantees at most one row.

## File

- `supabase/migrations/20260523130000_create_event_config_table.sql`

## Acceptance

- Migration applies clean on local Supabase (`supabase db reset` or `supabase migration up`).
- `SELECT event_datetime FROM event_config` returns one row.
- Anonymous client can SELECT the row.
- Second INSERT errors on the singleton index.

## Actual Outcome

- Migration file created: `supabase/migrations/20260523131000_create_event_config_table.sql` (29 LOC).
- Table created with correct schema: `id` (uuid PK), `event_datetime` (timestamptz NOT NULL), `updated_at` (timestamptz NOT NULL DEFAULT now()).
- Singleton unique index enforced: `CREATE UNIQUE INDEX event_config_singleton ON event_config((1))`.
- RLS policy created: `event_config_select_anyone` — SELECT FOR anon, authenticated USING (true).
- Seed row inserted: event_datetime = 2026-12-31T18:30:00+07:00.
- Migration applied cleanly locally; table confirmed in Supabase Studio.
- Anonymous SELECT verified: anon client can read the row; INSERT/UPDATE/DELETE blocked (service-role only).

## Out of Scope

- Admin UI to edit datetime (use Studio).
- Audit log / history.
