-- Viết Kudo (Write Kudo) form support
-- Adds:
--   - kudos.title, kudos.is_anonymous, kudos.anonymous_alias
--   - INSERT RLS policies for kudos + kudos_hashtags
--   - Storage bucket `kudos-images` (public) with auth-write / public-read policies
--   - RPC create_kudo() — atomic kudos + hashtags insert

-- ============================================================================
-- 1. Extend kudos with title + anonymous columns
-- ============================================================================

ALTER TABLE public.kudos
  ADD COLUMN IF NOT EXISTS title            text,
  ADD COLUMN IF NOT EXISTS is_anonymous     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_alias  text;

-- Length constraints — nullable so existing seed rows keep their state.
ALTER TABLE public.kudos
  DROP CONSTRAINT IF EXISTS kudos_title_length_chk;
ALTER TABLE public.kudos
  ADD CONSTRAINT kudos_title_length_chk
  CHECK (title IS NULL OR length(title) BETWEEN 1 AND 200);

ALTER TABLE public.kudos
  DROP CONSTRAINT IF EXISTS kudos_anonymous_alias_length_chk;
ALTER TABLE public.kudos
  ADD CONSTRAINT kudos_anonymous_alias_length_chk
  CHECK (anonymous_alias IS NULL OR length(anonymous_alias) BETWEEN 1 AND 50);

-- ============================================================================
-- 2. INSERT RLS for kudos + kudos_hashtags
-- ============================================================================

DROP POLICY IF EXISTS kudos_insert_own ON public.kudos;
CREATE POLICY kudos_insert_own
  ON public.kudos
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS kudos_hashtags_insert_own ON public.kudos_hashtags;
CREATE POLICY kudos_hashtags_insert_own
  ON public.kudos_hashtags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kudos k
       WHERE k.id = kudos_id
         AND k.sender_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. Storage bucket for uploaded kudos images (public read)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('kudos-images', 'kudos-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Auth users can upload to the bucket; everyone (anon + authed) can read.
DROP POLICY IF EXISTS kudos_images_authenticated_insert ON storage.objects;
CREATE POLICY kudos_images_authenticated_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kudos-images');

DROP POLICY IF EXISTS kudos_images_public_select ON storage.objects;
CREATE POLICY kudos_images_public_select
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kudos-images');

DROP POLICY IF EXISTS kudos_images_owner_delete ON storage.objects;
CREATE POLICY kudos_images_owner_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'kudos-images' AND owner = auth.uid());

-- ============================================================================
-- 4. RPC create_kudo — atomic insert of kudo + its hashtags
-- ============================================================================
--
-- Inputs are validated at the SQL layer; the server action also validates so
-- the user gets a friendly error before reaching here. The RPC runs as
-- SECURITY DEFINER so the hashtag insert isn't blocked by RLS interleaving.
--
-- Returns the new kudo id as { id: uuid } jsonb.

CREATE OR REPLACE FUNCTION public.create_kudo(
  p_receiver_id      uuid,
  p_title            text,
  p_content          text,
  p_hashtags         text[],
  p_image_urls       text[],
  p_is_anonymous     boolean,
  p_anonymous_alias  text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid := auth.uid();
  v_kudos_id  uuid;
  v_tag       text;
  v_tag_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_receiver_id IS NULL OR p_receiver_id = v_user_id THEN
    RAISE EXCEPTION 'Invalid recipient';
  END IF;

  IF p_title IS NULL OR length(btrim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Title is required';
  END IF;

  IF p_content IS NULL OR length(btrim(p_content)) = 0 THEN
    RAISE EXCEPTION 'Content is required';
  END IF;

  IF p_hashtags IS NULL THEN
    RAISE EXCEPTION 'Hashtags are required';
  END IF;

  v_tag_count := array_length(p_hashtags, 1);
  IF v_tag_count IS NULL OR v_tag_count < 1 OR v_tag_count > 5 THEN
    RAISE EXCEPTION 'Hashtag count must be between 1 and 5';
  END IF;

  IF p_image_urls IS NOT NULL AND array_length(p_image_urls, 1) > 5 THEN
    RAISE EXCEPTION 'Image count must not exceed 5';
  END IF;

  IF p_is_anonymous IS NULL THEN
    p_is_anonymous := false;
  END IF;

  INSERT INTO public.kudos (
    sender_id, receiver_id, title, content, image_urls,
    is_anonymous, anonymous_alias
  )
  VALUES (
    v_user_id,
    p_receiver_id,
    btrim(p_title),
    p_content,
    COALESCE(p_image_urls, '{}'::text[]),
    p_is_anonymous,
    CASE
      WHEN p_is_anonymous AND p_anonymous_alias IS NOT NULL
        AND length(btrim(p_anonymous_alias)) > 0
      THEN btrim(p_anonymous_alias)
      ELSE NULL
    END
  )
  RETURNING id INTO v_kudos_id;

  -- Hashtag sanitization MUST match lib/kudos/sanitize-tag.ts:
  --   strip leading '#', remove ALL whitespace, cap at 64 chars.
  FOREACH v_tag IN ARRAY p_hashtags LOOP
    v_tag := btrim(v_tag);
    v_tag := regexp_replace(v_tag, '^#+', '');
    v_tag := regexp_replace(v_tag, '\s+', '', 'g');
    v_tag := left(v_tag, 64);
    IF length(v_tag) >= 1 THEN
      INSERT INTO public.kudos_hashtags (kudos_id, tag)
      VALUES (v_kudos_id, v_tag)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('id', v_kudos_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_kudo(uuid, text, text, text[], text[], boolean, text) TO authenticated;
