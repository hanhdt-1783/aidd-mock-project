-- ============================================================================
-- Normalize kudo hashtags: strip Vietnamese diacritics (không dấu) + whitespace.
--
-- Keeps SQL in lockstep with lib/kudos/sanitize-tag.ts. Adds a reusable
-- IMMUTABLE sanitizer, rewires create_kudo() to use it, and rewrites existing
-- kudos_hashtags rows (dedup-safe against the (kudos_id, tag) primary key).
--
-- Stored tags never contain the leading '#'; the UI prepends '#' for display.
-- ============================================================================

-- 1. Shared sanitizer ---------------------------------------------------------
--    strip leading '#', map đ/Đ → d/D, decompose (NFD) + drop combining marks,
--    remove all whitespace, cap at 64 chars.
CREATE OR REPLACE FUNCTION public.kudo_sanitize_tag(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $fn$
  SELECT left(
    regexp_replace(
      regexp_replace(
        normalize(
          translate(
            regexp_replace(btrim(COALESCE(p, '')), '^#+', ''),
            'đĐ', 'dD'
          ),
          NFD
        ),
        E'[̀-ͯ]', '', 'g'
      ),
      '\s+', '', 'g'
    ),
    64
  );
$fn$;

-- 2. create_kudo() — use the shared sanitizer for hashtags --------------------
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

  -- Hashtag sanitization MUST match lib/kudos/sanitize-tag.ts (see fn above).
  FOREACH v_tag IN ARRAY p_hashtags LOOP
    v_tag := public.kudo_sanitize_tag(v_tag);
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

-- 3. Backfill existing rows ---------------------------------------------------
-- 3a. Drop tags that sanitize to empty (only diacritics/symbols/whitespace).
DELETE FROM public.kudos_hashtags
WHERE length(public.kudo_sanitize_tag(tag)) = 0;

-- 3b. Within each kudo, drop rows that would collide after normalization
--     (keep one), so the (kudos_id, tag) PK update below cannot conflict.
DELETE FROM public.kudos_hashtags a
USING public.kudos_hashtags b
WHERE a.kudos_id = b.kudos_id
  AND a.ctid > b.ctid
  AND public.kudo_sanitize_tag(a.tag) = public.kudo_sanitize_tag(b.tag);

-- 3c. Normalize survivors.
UPDATE public.kudos_hashtags
SET tag = public.kudo_sanitize_tag(tag)
WHERE tag IS DISTINCT FROM public.kudo_sanitize_tag(tag);
