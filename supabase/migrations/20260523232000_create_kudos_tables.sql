-- Sun* Kudos Live Board schema
-- Tables: profiles (extended), kudos, kudos_likes, kudos_hashtags, gift_recipients, secret_boxes
-- Triggers: like_count denormalization, self-like prevention
-- RPC: toggle_kudos_like(kudos_id)
-- Seed: 10 synthetic auth.users + 20 kudos + likes + leaderboard rows for development viewing

-- ============================================================================
-- 1. Extend profiles with display fields
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url   text,
  ADD COLUMN IF NOT EXISTS department   text,
  ADD COLUMN IF NOT EXISTS title        text,
  ADD COLUMN IF NOT EXISTS rank_stars   int NOT NULL DEFAULT 0
    CHECK (rank_stars IN (0, 1, 2, 3));

-- Allow authenticated users to see other users' public display fields.
-- The existing profiles_select_own policy stays; we ADD a permissive directory policy.
DROP POLICY IF EXISTS profiles_select_directory ON public.profiles;
CREATE POLICY profiles_select_directory
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 2. kudos — kudos posts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kudos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         text        NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
  image_urls      text[]      NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  is_special_day  boolean     NOT NULL DEFAULT false,
  like_count      int         NOT NULL DEFAULT 0,
  CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS kudos_created_at_idx ON public.kudos (created_at DESC);
CREATE INDEX IF NOT EXISTS kudos_like_count_idx ON public.kudos (like_count DESC);
CREATE INDEX IF NOT EXISTS kudos_sender_id_idx  ON public.kudos (sender_id);
CREATE INDEX IF NOT EXISTS kudos_receiver_id_idx ON public.kudos (receiver_id);

ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kudos_select_all ON public.kudos;
CREATE POLICY kudos_select_all
  ON public.kudos
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 3. kudos_likes — 1 row per (kudos, user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kudos_likes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kudos_id    uuid        NOT NULL REFERENCES public.kudos(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight      int         NOT NULL DEFAULT 1 CHECK (weight IN (1, 2)),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kudos_id, user_id)
);

CREATE INDEX IF NOT EXISTS kudos_likes_user_id_idx ON public.kudos_likes (user_id);

ALTER TABLE public.kudos_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kudos_likes_select_all ON public.kudos_likes;
CREATE POLICY kudos_likes_select_all
  ON public.kudos_likes
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS kudos_likes_insert_own ON public.kudos_likes;
CREATE POLICY kudos_likes_insert_own
  ON public.kudos_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS kudos_likes_delete_own ON public.kudos_likes;
CREATE POLICY kudos_likes_delete_own
  ON public.kudos_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Like count denormalization
CREATE OR REPLACE FUNCTION public.bump_kudos_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.kudos
       SET like_count = like_count + NEW.weight
     WHERE id = NEW.kudos_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.kudos
       SET like_count = GREATEST(like_count - OLD.weight, 0)
     WHERE id = OLD.kudos_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS kudos_likes_bump_count ON public.kudos_likes;
CREATE TRIGGER kudos_likes_bump_count
  AFTER INSERT OR DELETE ON public.kudos_likes
  FOR EACH ROW EXECUTE FUNCTION public.bump_kudos_like_count();

-- Self-like prevention
CREATE OR REPLACE FUNCTION public.prevent_self_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  kudos_sender uuid;
BEGIN
  SELECT sender_id INTO kudos_sender FROM public.kudos WHERE id = NEW.kudos_id;
  IF kudos_sender = NEW.user_id THEN
    RAISE EXCEPTION 'Cannot like your own kudos';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kudos_likes_prevent_self ON public.kudos_likes;
CREATE TRIGGER kudos_likes_prevent_self
  BEFORE INSERT ON public.kudos_likes
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_like();

-- ============================================================================
-- 4. kudos_hashtags — hashtag junction
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kudos_hashtags (
  kudos_id uuid NOT NULL REFERENCES public.kudos(id) ON DELETE CASCADE,
  tag      text NOT NULL CHECK (length(tag) BETWEEN 1 AND 64),
  PRIMARY KEY (kudos_id, tag)
);

CREATE INDEX IF NOT EXISTS kudos_hashtags_tag_idx ON public.kudos_hashtags (tag);

ALTER TABLE public.kudos_hashtags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kudos_hashtags_select_all ON public.kudos_hashtags;
CREATE POLICY kudos_hashtags_select_all
  ON public.kudos_hashtags
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 5. gift_recipients — D.3 leaderboard
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gift_recipients (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prize_description text        NOT NULL CHECK (length(prize_description) BETWEEN 1 AND 200),
  awarded_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gift_recipients_awarded_at_idx ON public.gift_recipients (awarded_at DESC);

ALTER TABLE public.gift_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_recipients_select_all ON public.gift_recipients;
CREATE POLICY gift_recipients_select_all
  ON public.gift_recipients
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 6. secret_boxes — D.1 stats (per-user open/unopened)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.secret_boxes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opened      boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS secret_boxes_user_id_idx ON public.secret_boxes (user_id);

ALTER TABLE public.secret_boxes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS secret_boxes_select_own ON public.secret_boxes;
CREATE POLICY secret_boxes_select_own
  ON public.secret_boxes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. RPC: toggle_kudos_like(kudos_id) → returns { liked, like_count }
-- ============================================================================

CREATE OR REPLACE FUNCTION public.toggle_kudos_like(p_kudos_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       uuid := auth.uid();
  v_existing_id   uuid;
  v_is_special    boolean;
  v_new_like_count int;
  v_liked         boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_existing_id
    FROM public.kudos_likes
   WHERE kudos_id = p_kudos_id AND user_id = v_user_id;

  IF v_existing_id IS NOT NULL THEN
    -- Toggle off
    DELETE FROM public.kudos_likes WHERE id = v_existing_id;
    v_liked := false;
  ELSE
    -- Toggle on — weight depends on the kudos's is_special_day flag
    SELECT is_special_day INTO v_is_special FROM public.kudos WHERE id = p_kudos_id;
    INSERT INTO public.kudos_likes (kudos_id, user_id, weight)
    VALUES (p_kudos_id, v_user_id, CASE WHEN v_is_special THEN 2 ELSE 1 END);
    v_liked := true;
  END IF;

  SELECT like_count INTO v_new_like_count FROM public.kudos WHERE id = p_kudos_id;
  RETURN jsonb_build_object('liked', v_liked, 'like_count', v_new_like_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_kudos_like(uuid) TO authenticated;

-- ============================================================================
-- 8. Seed data for development
-- Synthetic auth.users created via service-role insert; the on_auth_user_created
-- trigger from migration 20260522 will auto-create matching profiles rows.
-- ============================================================================

-- Generate stable UUIDs for repeatable seeding
DO $$
DECLARE
  u1 uuid := '11111111-1111-1111-1111-111111110001';
  u2 uuid := '11111111-1111-1111-1111-111111110002';
  u3 uuid := '11111111-1111-1111-1111-111111110003';
  u4 uuid := '11111111-1111-1111-1111-111111110004';
  u5 uuid := '11111111-1111-1111-1111-111111110005';
  u6 uuid := '11111111-1111-1111-1111-111111110006';
  u7 uuid := '11111111-1111-1111-1111-111111110007';
  u8 uuid := '11111111-1111-1111-1111-111111110008';
  u9 uuid := '11111111-1111-1111-1111-111111110009';
  u10 uuid := '11111111-1111-1111-1111-11111111000a';
  uids uuid[];
  i int;
  k1 uuid; k2 uuid; k3 uuid; k4 uuid; k5 uuid;
BEGIN
  uids := ARRAY[u1, u2, u3, u4, u5, u6, u7, u8, u9, u10];

  -- Insert synthetic auth.users (idempotent — skip if exists). Each row needs the bare minimum.
  FOR i IN 1..array_length(uids, 1) LOOP
    INSERT INTO auth.users (
      id, email, instance_id, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, email_confirmed_at
    )
    VALUES (
      uids[i],
      format('demo%s@sun-asterisk.com', i),
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      '{"provider":"seed","providers":["seed"]}'::jsonb,
      '{}'::jsonb,
      now(), now(), now()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- Update profiles (created by trigger) with display fields
  UPDATE public.profiles SET
    display_name = 'Huỳnh Dương Xuân Nhật', avatar_url = '/kudos/avatars/u1.png',
    department = 'CEVC10', title = 'Legend Hero', rank_stars = 3
  WHERE id = u1;
  UPDATE public.profiles SET
    display_name = 'Nguyễn Bá Chức', avatar_url = '/kudos/avatars/u2.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u2;
  UPDATE public.profiles SET
    display_name = 'Trần Minh Anh', avatar_url = '/kudos/avatars/u3.png',
    department = 'Marketing', title = 'New Hero', rank_stars = 1
  WHERE id = u3;
  UPDATE public.profiles SET
    display_name = 'Phạm Thu Hà', avatar_url = '/kudos/avatars/u4.png',
    department = 'CEVC12', title = 'Legend Hero', rank_stars = 3
  WHERE id = u4;
  UPDATE public.profiles SET
    display_name = 'Lê Văn Sơn', avatar_url = '/kudos/avatars/u5.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u5;
  UPDATE public.profiles SET
    display_name = 'Hoàng Mai Linh', avatar_url = '/kudos/avatars/u6.png',
    department = 'HR', title = 'New Hero', rank_stars = 1
  WHERE id = u6;
  UPDATE public.profiles SET
    display_name = 'Đỗ Thanh Tùng', avatar_url = '/kudos/avatars/u7.png',
    department = 'CEVC15', title = 'Rising Hero', rank_stars = 2
  WHERE id = u7;
  UPDATE public.profiles SET
    display_name = 'Bùi Khánh Linh', avatar_url = '/kudos/avatars/u8.png',
    department = 'Marketing', title = 'Legend Hero', rank_stars = 3
  WHERE id = u8;
  UPDATE public.profiles SET
    display_name = 'Vũ Quang Huy', avatar_url = '/kudos/avatars/u9.png',
    department = 'CEVC11', title = 'New Hero', rank_stars = 1
  WHERE id = u9;
  UPDATE public.profiles SET
    display_name = 'Trịnh Phương Thảo', avatar_url = '/kudos/avatars/u10.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u10;

  -- Insert sample kudos
  INSERT INTO public.kudos (id, sender_id, receiver_id, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u1, u2,
     'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn em đã cùng team chăm chỉ, cần mẫn nhé!',
     '{}', now() - interval '2 hours')
  RETURNING id INTO k1;

  INSERT INTO public.kudos (id, sender_id, receiver_id, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u3, u4,
     'Cảm ơn chị đã luôn nhắc nhở mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống nữa nhé!',
     ARRAY['/kudos/samples/img1.jpg','/kudos/samples/img2.jpg'], now() - interval '5 hours')
  RETURNING id INTO k2;

  INSERT INTO public.kudos (id, sender_id, receiver_id, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u5, u1,
     'Anh đã dạy em rất nhiều bài học quý báu trong suốt quá trình làm việc — biết ơn anh.',
     '{}', now() - interval '1 day')
  RETURNING id INTO k3;

  INSERT INTO public.kudos (id, sender_id, receiver_id, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u6, u7,
     'Cảm ơn anh đã hỗ trợ chị onboarding các bạn mới trong tháng vừa rồi rất nhiệt tình!',
     '{}', now() - interval '3 days')
  RETURNING id INTO k4;

  INSERT INTO public.kudos (id, sender_id, receiver_id, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u8, u9,
     'Em rất nể phục tinh thần học hỏi và chịu khó của anh. Mong anh giữ lửa nhé!',
     ARRAY['/kudos/samples/img3.jpg'], now() - interval '4 days')
  RETURNING id INTO k5;

  -- Hashtags
  INSERT INTO public.kudos_hashtags (kudos_id, tag) VALUES
    (k1, 'Dedicated'), (k1, 'Inspiring'), (k1, 'IDOL GIỚI TRẺ'),
    (k2, 'Dedicated'), (k2, 'TeamPlayer'),
    (k3, 'Mentor'),    (k3, 'Inspiring'),
    (k4, 'TeamPlayer'),(k4, 'Supportive'),
    (k5, 'Inspiring'), (k5, 'IDOL GIỚI TRẺ')
  ON CONFLICT DO NOTHING;

  -- Likes (drive sort order: k1 most-liked, k5 least)
  INSERT INTO public.kudos_likes (kudos_id, user_id, weight) VALUES
    (k1, u3, 1), (k1, u4, 1), (k1, u5, 1), (k1, u6, 2), (k1, u7, 1), (k1, u8, 1), (k1, u9, 1), (k1, u10, 1),
    (k2, u1, 1), (k2, u5, 1), (k2, u6, 1), (k2, u7, 2), (k2, u8, 1), (k2, u10, 1),
    (k3, u2, 1), (k3, u4, 1), (k3, u6, 1), (k3, u9, 1),
    (k4, u1, 1), (k4, u3, 1), (k4, u9, 1),
    (k5, u2, 1)
  ON CONFLICT DO NOTHING;

  -- Gift recipients (D.3 leaderboard)
  INSERT INTO public.gift_recipients (user_id, prize_description, awarded_at) VALUES
    (u1, 'Nhận được 1 áo phông SAA', now() - interval '1 hour'),
    (u2, 'Nhận được 1 áo phông SAA', now() - interval '3 hours'),
    (u3, 'Nhận được 1 ba lô SAA',    now() - interval '6 hours'),
    (u4, 'Nhận được 1 áo phông SAA', now() - interval '10 hours'),
    (u5, 'Nhận được 1 mũ SAA',       now() - interval '12 hours'),
    (u6, 'Nhận được 1 áo phông SAA', now() - interval '1 day'),
    (u7, 'Nhận được 1 ba lô SAA',    now() - interval '1 day 2 hours'),
    (u8, 'Nhận được 1 áo phông SAA', now() - interval '1 day 5 hours'),
    (u9, 'Nhận được 1 mũ SAA',       now() - interval '2 days'),
    (u10,'Nhận được 1 áo phông SAA', now() - interval '2 days 4 hours');

  -- Secret boxes for each demo user (3 each: 1 opened, 2 unopened)
  FOR i IN 1..array_length(uids, 1) LOOP
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], true);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
  END LOOP;
END $$;
