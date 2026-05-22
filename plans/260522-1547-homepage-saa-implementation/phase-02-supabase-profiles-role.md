# Phase 02 — Supabase profiles table + role + trigger + RLS

**Track:** B
**Priority:** High — blocks Phase 04 (auth wiring)

## Goal

Create a `profiles` table tied to `auth.users`, with a `role` column (`admin`/`user`). Auto-create profile row when a user signs up. RLS so users can read their own profile.

## Files to create

- `supabase/migrations/20260522154800_create_profiles_table.sql`

## Migration content

```sql
-- profiles: per-user metadata for SAA, including role
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile.
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Trigger: insert a profile row on auth.users insert.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for any existing users.
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

## Verification

```bash
supabase db reset             # rebuild local DB applying the migration
psql "$DATABASE_URL" -c "\d public.profiles"
psql "$DATABASE_URL" -c "SELECT id, role FROM public.profiles LIMIT 5;"
```

## Success criteria

- Migration applies cleanly to local Supabase via `supabase db reset` (or `supabase migration up`)
- `\d public.profiles` shows columns + RLS enabled
- Signing in via Google creates exactly one profile row with `role='user'`
- `UPDATE public.profiles SET role='admin' WHERE id = <my-uid>;` switches user's account menu to show Admin Dashboard

## Final notes

**Status: ✅ DONE**

Migration `20260522154800_create_profiles_table.sql` applied successfully. Schema verified via tester (all columns present, RLS active, trigger functional). Tested: profile row auto-created on signup, role UPDATE works, RLS enforcement confirmed. Database layer operational. No deviations from plan.
