-- Dev-only seed for Sun* Kudos Live Board.
-- Supabase CLI applies seed.sql ONLY on `supabase db reset` (local), not on remote migrations.
-- Safe to run on local dev; never reaches staging or production.
--
-- Creates 10 synthetic auth.users (UUID prefix 11111111-...) — the on_auth_user_created
-- trigger from migration 20260522 auto-creates matching profiles rows; this block then
-- backfills display fields and inserts kudos / likes / gifts / secret_boxes for demo viewing.

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

  UPDATE public.profiles SET
    display_name = 'Huỳnh Dương Xuân Nhật', avatar_url = '/kudos-live-board/avatars/u1.png',
    department = 'CEVC10', title = 'Legend Hero', rank_stars = 3
  WHERE id = u1;
  UPDATE public.profiles SET
    display_name = 'Nguyễn Bá Chức', avatar_url = '/kudos-live-board/avatars/u2.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u2;
  UPDATE public.profiles SET
    display_name = 'Trần Minh Anh', avatar_url = '/kudos-live-board/avatars/u3.png',
    department = 'Marketing', title = 'New Hero', rank_stars = 1
  WHERE id = u3;
  UPDATE public.profiles SET
    display_name = 'Phạm Thu Hà', avatar_url = '/kudos-live-board/avatars/u4.png',
    department = 'CEVC12', title = 'Legend Hero', rank_stars = 3
  WHERE id = u4;
  UPDATE public.profiles SET
    display_name = 'Lê Văn Sơn', avatar_url = '/kudos-live-board/avatars/u5.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u5;
  UPDATE public.profiles SET
    display_name = 'Hoàng Mai Linh', avatar_url = '/kudos-live-board/avatars/u6.png',
    department = 'HR', title = 'New Hero', rank_stars = 1
  WHERE id = u6;
  UPDATE public.profiles SET
    display_name = 'Đỗ Thanh Tùng', avatar_url = '/kudos-live-board/avatars/u7.png',
    department = 'CEVC15', title = 'Rising Hero', rank_stars = 2
  WHERE id = u7;
  UPDATE public.profiles SET
    display_name = 'Bùi Khánh Linh', avatar_url = '/kudos-live-board/avatars/u8.png',
    department = 'Marketing', title = 'Legend Hero', rank_stars = 3
  WHERE id = u8;
  UPDATE public.profiles SET
    display_name = 'Vũ Quang Huy', avatar_url = '/kudos-live-board/avatars/u9.png',
    department = 'CEVC11', title = 'New Hero', rank_stars = 1
  WHERE id = u9;
  UPDATE public.profiles SET
    display_name = 'Trịnh Phương Thảo', avatar_url = '/kudos-live-board/avatars/u10.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u10;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u1, u2, 'IDOL GIỚI TRẺ',
     'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn em đã cùng team chăm chỉ, cần mẫn nhé!',
     '{}', now() - interval '2 hours')
  RETURNING id INTO k1;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u3, u4, 'NGƯỜI TRUYỀN CẢM HỨNG',
     'Cảm ơn chị đã luôn nhắc nhở mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống nữa nhé!',
     ARRAY['/kudos/samples/img1.jpg','/kudos/samples/img2.jpg'], now() - interval '5 hours')
  RETURNING id INTO k2;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u5, u1, 'NGƯỜI THẦY TẬN TÂM',
     'Anh đã dạy em rất nhiều bài học quý báu trong suốt quá trình làm việc — biết ơn anh.',
     '{}', now() - interval '1 day')
  RETURNING id INTO k3;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u6, u7, 'HỖ TRỢ XUẤT SẮC',
     'Cảm ơn anh đã hỗ trợ chị onboarding các bạn mới trong tháng vừa rồi rất nhiệt tình!',
     '{}', now() - interval '3 days')
  RETURNING id INTO k4;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u8, u9, 'TINH THẦN HỌC HỎI',
     'Em rất nể phục tinh thần học hỏi và chịu khó của anh. Mong anh giữ lửa nhé!',
     ARRAY['/kudos/samples/img3.jpg'], now() - interval '4 days')
  RETURNING id INTO k5;

  INSERT INTO public.kudos_hashtags (kudos_id, tag) VALUES
    (k1, 'Dedicated'), (k1, 'Inspiring'), (k1, 'IDOL GIỚI TRẺ'),
    (k2, 'Dedicated'), (k2, 'TeamPlayer'),
    (k3, 'Mentor'),    (k3, 'Inspiring'),
    (k4, 'TeamPlayer'),(k4, 'Supportive'),
    (k5, 'Inspiring'), (k5, 'IDOL GIỚI TRẺ')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.kudos_likes (kudos_id, user_id, weight) VALUES
    (k1, u3, 1), (k1, u4, 1), (k1, u5, 1), (k1, u6, 2), (k1, u7, 1), (k1, u8, 1), (k1, u9, 1), (k1, u10, 1),
    (k2, u1, 1), (k2, u5, 1), (k2, u6, 1), (k2, u7, 2), (k2, u8, 1), (k2, u10, 1),
    (k3, u2, 1), (k3, u4, 1), (k3, u6, 1), (k3, u9, 1),
    (k4, u1, 1), (k4, u3, 1), (k4, u9, 1),
    (k5, u2, 1)
  ON CONFLICT DO NOTHING;

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

  FOR i IN 1..array_length(uids, 1) LOOP
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], true);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
  END LOOP;
END $$;
