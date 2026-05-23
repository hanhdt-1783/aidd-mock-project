-- Singleton table holding the canonical SAA event start datetime.
-- Read by /prelaunch and / countdown components. Editable via Supabase Studio.
-- Anonymous read is permitted (countdown is public); writes are service-role only.

CREATE TABLE IF NOT EXISTS public.event_config (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_datetime timestamptz NOT NULL,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- At most one row — partial unique index on a constant guarantees singleton.
CREATE UNIQUE INDEX IF NOT EXISTS event_config_singleton
  ON public.event_config ((1));

ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;

-- Public read for both anonymous and authenticated visitors.
DROP POLICY IF EXISTS event_config_select_anyone ON public.event_config;
CREATE POLICY event_config_select_anyone
  ON public.event_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed a single row. Datetime is illustrative — operators edit via Studio.
INSERT INTO public.event_config (event_datetime)
SELECT '2026-12-31T18:30:00+07:00'::timestamptz
WHERE NOT EXISTS (SELECT 1 FROM public.event_config);
