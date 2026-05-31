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
  u11 uuid := '11111111-1111-1111-1111-11111111000b';
  uids uuid[];
  i int;
  k1 uuid; k2 uuid; k3 uuid; k4 uuid; k5 uuid;
BEGIN
  uids := ARRAY[u1, u2, u3, u4, u5, u6, u7, u8, u9, u10, u11];

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

  -- Vietnamese full names + avatars cycled across avatar0..avatar9 (11 users → u11 wraps to avatar0).
  UPDATE public.profiles SET
    display_name = 'Nguyễn Hoàng Long', avatar_url = '/kudos/avatars/avatar0.png',
    department = 'CEVC10', title = 'Legend Hero', rank_stars = 3
  WHERE id = u1;
  UPDATE public.profiles SET
    display_name = 'Trần Thị Mỹ Duyên', avatar_url = '/kudos/avatars/avatar1.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u2;
  UPDATE public.profiles SET
    display_name = 'Lê Quang Vinh', avatar_url = '/kudos/avatars/avatar2.png',
    department = 'Marketing', title = 'New Hero', rank_stars = 1
  WHERE id = u3;
  UPDATE public.profiles SET
    display_name = 'Phạm Ngọc Bích', avatar_url = '/kudos/avatars/avatar3.png',
    department = 'CEVC12', title = 'Legend Hero', rank_stars = 3
  WHERE id = u4;
  UPDATE public.profiles SET
    display_name = 'Vũ Đình Khôi', avatar_url = '/kudos/avatars/avatar4.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u5;
  UPDATE public.profiles SET
    display_name = 'Đặng Thuỳ Trang', avatar_url = '/kudos/avatars/avatar5.png',
    department = 'HR', title = 'New Hero', rank_stars = 1
  WHERE id = u6;
  UPDATE public.profiles SET
    display_name = 'Bùi Tiến Dũng', avatar_url = '/kudos/avatars/avatar6.png',
    department = 'CEVC15', title = 'Rising Hero', rank_stars = 2
  WHERE id = u7;
  UPDATE public.profiles SET
    display_name = 'Hoàng Thị Lan Anh', avatar_url = '/kudos/avatars/avatar7.png',
    department = 'Marketing', title = 'Legend Hero', rank_stars = 3
  WHERE id = u8;
  UPDATE public.profiles SET
    display_name = 'Ngô Gia Bảo', avatar_url = '/kudos/avatars/avatar8.png',
    department = 'CEVC11', title = 'New Hero', rank_stars = 1
  WHERE id = u9;
  UPDATE public.profiles SET
    display_name = 'Dương Khánh Vy', avatar_url = '/kudos/avatars/avatar9.png',
    department = 'CEVC10', title = 'Rising Hero', rank_stars = 2
  WHERE id = u10;
  UPDATE public.profiles SET
    display_name = 'Đỗ Mạnh Hùng', avatar_url = '/kudos/avatars/avatar0.png',
    department = 'CEVC10', title = 'Super Hero', rank_stars = 3
  WHERE id = u11;

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
     '{}', now() - interval '5 hours')
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
     '{}', now() - interval '4 days')
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

  -- Extra demo kudos (fixed IDs) so the All-Kudos feed exceeds one page (5)
  -- and the "Xem thêm" button appears. Older timestamps → they sort below k1..k5.
  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    ('22222222-2222-2222-2222-222222220001', u2, u3, 'ĐỒNG ĐỘI TUYỆT VỜI',
     'Cảm ơn em đã luôn sẵn sàng hỗ trợ cả nhóm mỗi khi cần. Có em, team yên tâm hẳn!',
     '{}', now() - interval '5 days'),
    ('22222222-2222-2222-2222-222222220002', u4, u5, 'TƯ DUY SÁNG TẠO',
     'Ý tưởng của anh trong buổi brainstorm vừa rồi thật sự đột phá. Cảm ơn anh nhiều!',
     '{}', now() - interval '6 days'),
    ('22222222-2222-2222-2222-222222220003', u7, u8, 'LUÔN ĐÚNG DEADLINE',
     'Cảm ơn em vì sự kỷ luật và đúng hẹn trong mọi task. Rất đáng để học hỏi!',
     '{}', now() - interval '7 days'),
    ('22222222-2222-2222-2222-222222220004', u9, u10, 'NĂNG LƯỢNG TÍCH CỰC',
     'Mỗi ngày đi làm có chị là cả team thấy vui hơn hẳn. Cảm ơn chị nhiều nhé!',
     '{}', now() - interval '8 days'),
    ('22222222-2222-2222-2222-222222220005', u10, u1, 'TỈ MỈ TỪNG CHI TIẾT',
     'Cảm ơn anh đã review kỹ càng giúp em tránh được bao nhiêu lỗi. Biết ơn anh!',
     '{}', now() - interval '9 days'),
    ('22222222-2222-2222-2222-222222220006', u3, u6, 'NGƯỜI HÙNG THẦM LẶNG',
     'Những việc anh làm tuy âm thầm nhưng cả team đều thấy và rất trân trọng!',
     '{}', now() - interval '10 days'),
    ('22222222-2222-2222-2222-222222220007', u5, u8, 'SẺ CHIA KIẾN THỨC',
     'Cảm ơn chị đã không ngại chia sẻ kinh nghiệm cho các bạn junior. Tuyệt vời!',
     '{}', now() - interval '11 days'),
    ('22222222-2222-2222-2222-222222220008', u6, u2, 'BỀN BỈ VƯỢT KHÓ',
     'Khâm phục sự kiên trì của em qua giai đoạn dự án căng thẳng vừa rồi. Cố lên!',
     '{}', now() - interval '12 days')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.kudos_hashtags (kudos_id, tag) VALUES
    ('22222222-2222-2222-2222-222222220001', 'TeamPlayer'),
    ('22222222-2222-2222-2222-222222220002', 'Inspiring'),
    ('22222222-2222-2222-2222-222222220003', 'Dedicated'),
    ('22222222-2222-2222-2222-222222220004', 'Inspiring'),
    ('22222222-2222-2222-2222-222222220005', 'Dedicated'),
    ('22222222-2222-2222-2222-222222220006', 'Supportive'),
    ('22222222-2222-2222-2222-222222220007', 'Mentor'),
    ('22222222-2222-2222-2222-222222220008', 'Dedicated')
  ON CONFLICT DO NOTHING;

  -- Extra distinct hashtags so the create-form dropdown has a long, scrollable,
  -- searchable list. Tags are stored already-sanitized (no spaces/diacritics —
  -- matching kudo_sanitize_tag / sanitizeTag) so they display cleanly as #Tag.
  -- Attached to one existing kudos; only the distinct `tag` values matter for
  -- the dropdown (listHashtags dedupes). ON CONFLICT keeps re-seeds idempotent.
  INSERT INTO public.kudos_hashtags (kudos_id, tag) VALUES
    ('22222222-2222-2222-2222-222222220001', 'BeProfessional'),
    ('22222222-2222-2222-2222-222222220001', 'BeOptimistic'),
    ('22222222-2222-2222-2222-222222220001', 'BeATeam'),
    ('22222222-2222-2222-2222-222222220001', 'ThinkOutsideTheBox'),
    ('22222222-2222-2222-2222-222222220001', 'GetRisky'),
    ('22222222-2222-2222-2222-222222220001', 'GoFast'),
    ('22222222-2222-2222-2222-222222220001', 'Wasshoi'),
    ('22222222-2222-2222-2222-222222220001', 'HighPerforming'),
    ('22222222-2222-2222-2222-222222220001', 'AimHigh'),
    ('22222222-2222-2222-2222-222222220001', 'BeAgile'),
    ('22222222-2222-2222-2222-222222220001', 'GoalOriented'),
    ('22222222-2222-2222-2222-222222220001', 'CustomerFirst'),
    ('22222222-2222-2222-2222-222222220001', 'ProcessDriven'),
    ('22222222-2222-2222-2222-222222220001', 'CreativeSolution'),
    ('22222222-2222-2222-2222-222222220001', 'GreatLeadership'),
    ('22222222-2222-2222-2222-222222220001', 'Comprehensive'),
    ('22222222-2222-2222-2222-222222220001', 'Reliable'),
    ('22222222-2222-2222-2222-222222220001', 'Proactive'),
    ('22222222-2222-2222-2222-222222220001', 'Innovative'),
    ('22222222-2222-2222-2222-222222220001', 'Ownership')
  ON CONFLICT DO NOTHING;

  -- "Super Hero" demo (u11): 12 received Kudos (the 10–20 range that the
  -- "Super Hero" title + hover describe), one very recent so the card surfaces
  -- at the top of the All-Kudos feed, plus a couple sent by u11.
  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  SELECT gen_random_uuid(), uids[1 + (g % 10)], u11, 'NGƯỜI HÙNG CỦA TEAM',
    'Cảm ơn anh đã luôn là chỗ dựa vững chắc và truyền cảm hứng cho cả team!',
    '{}', now() - (g * interval '30 minutes')
  FROM generate_series(1, 12) AS g;

  INSERT INTO public.kudos (id, sender_id, receiver_id, title, content, image_urls, created_at)
  VALUES
    (gen_random_uuid(), u11, u2, 'TINH THẦN TRÁCH NHIỆM',
     'Cảm ơn em đã chủ động gánh vác phần khó nhất của dự án. Rất đáng nể!',
     '{}', now() - interval '40 minutes'),
    (gen_random_uuid(), u11, u4, 'SẺ CHIA TẬN TÂM',
     'Cảm ơn chị đã kiên nhẫn hướng dẫn cả nhóm. Học được rất nhiều từ chị!',
     '{}', now() - interval '50 minutes');

  -- Extra Sunners to populate the SPOTLIGHT BOARD name cloud. The board lists
  -- DISTINCT recent kudos receivers, so with only 11 users it stayed sparse. Each
  -- generated Sunner below receives one kudos so they surface in the cloud. Names
  -- are composed deterministically from Vietnamese name parts; avatars cycle 0–9.
  DECLARE
    fam    text[] := ARRAY['Nguyễn','Trần','Lê','Phạm','Hoàng','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý','Phan','Võ','Đinh','Mai','Trịnh','Lương','Tạ'];
    mid    text[] := ARRAY['Văn','Thị','Hữu','Đức','Quang','Minh','Thanh','Gia','Khánh','Ngọc','Thu','Bá','Đình','Xuân','Hải','Tuấn','Phương','Mạnh','Hoài','Kim'];
    giv    text[] := ARRAY['An','Bình','Cường','Dũng','Hà','Hương','Khoa','Lan','Linh','Long','Mai','Nam','Nga','Nhung','Phúc','Quân','Sơn','Trang','Tú','Vy','Hùng','Thảo','Đạt','Yến','Hiếu'];
    depts  text[] := ARRAY['CEVC10','CEVC11','CEVC12','CEVC15','Marketing','HR','Finance','QA','BrSE','Design'];
    titles text[] := ARRAY['New Hero','Rising Hero','Legend Hero'];
    g int;
    nid uuid;
  BEGIN
    FOR g IN 12..60 LOOP
      nid := gen_random_uuid();
      INSERT INTO auth.users (
        id, email, instance_id, aud, role,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, email_confirmed_at
      )
      VALUES (
        nid, format('demo%s@sun-asterisk.com', g),
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb,
        now(), now(), now()
      )
      ON CONFLICT (id) DO NOTHING;

      UPDATE public.profiles SET
        display_name = fam[1 + (g % array_length(fam, 1))] || ' '
                    || mid[1 + ((g * 3) % array_length(mid, 1))] || ' '
                    || giv[1 + ((g * 7) % array_length(giv, 1))],
        avatar_url   = '/kudos/avatars/avatar' || (g % 10) || '.png',
        department   = depts[1 + (g % array_length(depts, 1))],
        title        = titles[1 + (g % 3)],
        rank_stars   = 1 + (g % 3)
      WHERE id = nid;

      INSERT INTO public.kudos (sender_id, receiver_id, title, content, created_at)
      VALUES (
        uids[1 + (g % 11)], nid, 'GHI NHẬN ĐÓNG GÓP',
        'Cảm ơn bạn đã góp phần tạo nên một Sun* gắn kết và tích cực!',
        now() - interval '13 days' - (g * interval '3 hours')
      );
    END LOOP;
  END;

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
    (u10,'Nhận được 1 áo phông SAA', now() - interval '2 days 4 hours'),
    (u11,'Nhận được 1 áo hoodie SAA', now() - interval '30 minutes');

  FOR i IN 1..array_length(uids, 1) LOOP
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], true);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
    INSERT INTO public.secret_boxes (user_id, opened) VALUES (uids[i], false);
  END LOOP;

  -- Attach sample images to ~80% of kudos. Deterministic by created_at order:
  -- every 5th kudos (rn % 5 = 4) is left bare → 20% without, 80% with.
  -- Each attached kudos gets between 1 and 5 images (count = 1 + arn % 5), the
  -- image indexes cycling across /kudos/samples/attachment0.png..attachment9.png.
  WITH ranked AS (
    SELECT id, (row_number() OVER (ORDER BY created_at, id) - 1) AS rn
    FROM public.kudos
  ),
  attached AS (
    SELECT id, (row_number() OVER (ORDER BY rn) - 1) AS arn
    FROM ranked
    WHERE rn % 5 <> 4
  )
  UPDATE public.kudos k
  SET image_urls = (
    SELECT array_agg('/kudos/samples/attachment' || ((a.arn + g) % 10) || '.png')
    FROM generate_series(0, a.arn % 5) AS g
  )
  FROM attached a
  WHERE k.id = a.id;
END $$;
