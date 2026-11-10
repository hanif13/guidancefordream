-- ==============================================================================
-- GUIDANCE FOR DREAM 7TH: MASTER DATABASE MIGRATION (ALL-IN-ONE)
-- รันไฟล์นี้ใน Supabase SQL Editor ของโปรเจกต์ใหม่ เพื่อสร้างตารางทั้งหมดในคลิกเดียว
-- ==============================================================================

-- 1. ตารางวิทยากร (Speakers)
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  activity TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read speakers" ON public.speakers;
CREATE POLICY "Allow public read speakers" ON public.speakers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for speakers" ON public.speakers;
CREATE POLICY "Allow all for speakers" ON public.speakers FOR ALL USING (true) WITH CHECK (true);

-- 2. ตารางประชาสัมพันธ์ โปสเตอร์ (Posters)
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read posters" ON public.posters;
CREATE POLICY "Allow public read posters" ON public.posters FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for posters" ON public.posters;
CREATE POLICY "Allow all for posters" ON public.posters FOR ALL USING (true) WITH CHECK (true);

-- 3. ตารางผู้สนับสนุน (Partners)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  tier TEXT DEFAULT 'gold',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read partners" ON public.partners;
CREATE POLICY "Allow public read partners" ON public.partners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for partners" ON public.partners;
CREATE POLICY "Allow all for partners" ON public.partners FOR ALL USING (true) WITH CHECK (true);

-- 4. ตารางวิดีโอ (Videos)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  video_type TEXT NOT NULL DEFAULT 'youtube',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read videos" ON public.videos;
CREATE POLICY "Allow public read videos" ON public.videos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for videos" ON public.videos;
CREATE POLICY "Allow all for videos" ON public.videos FOR ALL USING (true) WITH CHECK (true);

-- 5. ตารางกำหนดการค่าย (Camp Schedule)
CREATE TABLE IF NOT EXISTS public.camp_schedule (
  id TEXT PRIMARY KEY,
  schedule_type TEXT NOT NULL DEFAULT 'master',
  day_num INT NOT NULL DEFAULT 1,
  date_str TEXT DEFAULT '',
  date_iso TEXT DEFAULT '',
  time TEXT NOT NULL,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  loc_male TEXT DEFAULT '',
  loc_female TEXT DEFAULT '',
  dept TEXT DEFAULT '',
  note TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'activity',
  gender TEXT DEFAULT 'both',
  target_group TEXT DEFAULT 'main',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.camp_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read schedule" ON public.camp_schedule;
CREATE POLICY "Allow public read schedule" ON public.camp_schedule FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for schedule" ON public.camp_schedule;
CREATE POLICY "Allow all for schedule" ON public.camp_schedule FOR ALL USING (true) WITH CHECK (true);

-- 6. ตารางหมวดหมู่ความทรงจำ (Gallery Categories)
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gallery_categories" ON public.gallery_categories;
CREATE POLICY "Allow public read gallery_categories" ON public.gallery_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for gallery_categories" ON public.gallery_categories;
CREATE POLICY "Allow all for gallery_categories" ON public.gallery_categories FOR ALL USING (true) WITH CHECK (true);

-- 7. ตารางรูปภาพประมวลความทรงจำ (Gallery Images)
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  alt_text TEXT DEFAULT '',
  category TEXT DEFAULT 'ทั่วไป',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read gallery_images" ON public.gallery_images;
CREATE POLICY "Allow public read gallery_images" ON public.gallery_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for gallery_images" ON public.gallery_images;
CREATE POLICY "Allow all for gallery_images" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true);

-- 8. ตารางเสียงสะท้อนจากน้อง (Camp Feedbacks)
CREATE TABLE IF NOT EXISTS public.camp_feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  bg_color TEXT NOT NULL DEFAULT 'bg-amber-100 border-amber-300',
  text_color TEXT NOT NULL DEFAULT 'text-amber-950',
  rotate_deg TEXT NOT NULL DEFAULT 'rotate-0',
  date_display TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.camp_feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read feedbacks" ON public.camp_feedbacks;
CREATE POLICY "Allow public read feedbacks" ON public.camp_feedbacks FOR SELECT USING (is_approved = true);
DROP POLICY IF EXISTS "Allow public insert feedbacks" ON public.camp_feedbacks;
CREATE POLICY "Allow public insert feedbacks" ON public.camp_feedbacks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for admin on feedbacks" ON public.camp_feedbacks;
CREATE POLICY "Allow all for admin on feedbacks" ON public.camp_feedbacks FOR ALL USING (true) WITH CHECK (true);

-- 9. ตารางจดหมาย Time Capsule (Future Letters)
CREATE TABLE IF NOT EXISTS public.future_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT DEFAULT '',
  dream_faculty TEXT DEFAULT '',
  letter_content TEXT NOT NULL,
  delivery_timing TEXT NOT NULL,
  target_date DATE,
  delivered_at TIMESTAMPTZ,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert future letters" ON public.future_letters;
CREATE POLICY "Allow public insert future letters" ON public.future_letters FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for admin on future letters" ON public.future_letters;
CREATE POLICY "Allow all for admin on future letters" ON public.future_letters FOR ALL USING (true) WITH CHECK (true);

-- 10. ตารางข้อมูลทีมงานค่าย (Camp Staff)
CREATE TABLE IF NOT EXISTS public.camp_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  year_level TEXT NOT NULL,
  faculty TEXT NOT NULL,
  student_id TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  role TEXT NOT NULL,
  dept TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.camp_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read staff" ON public.camp_staff;
CREATE POLICY "Allow public read staff" ON public.camp_staff FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Allow all for staff" ON public.camp_staff;
CREATE POLICY "Allow all for staff" ON public.camp_staff FOR ALL USING (true) WITH CHECK (true);

-- 11. ตารางมื้ออาหารค่าย (Camp Meals)
CREATE TABLE IF NOT EXISTS public.camp_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_num INT NOT NULL,
  date_str TEXT NOT NULL,
  day_label TEXT NOT NULL,
  breakfast TEXT DEFAULT '',
  lunch TEXT DEFAULT '',
  dinner TEXT DEFAULT '',
  supper TEXT DEFAULT '',
  beverage TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.camp_meals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read meals" ON public.camp_meals;
CREATE POLICY "Allow public read meals" ON public.camp_meals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for meals" ON public.camp_meals;
CREATE POLICY "Allow all for meals" ON public.camp_meals FOR ALL USING (true) WITH CHECK (true);

-- 12. ตารางเอกสารค่าย & E-Book (Documents)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  download_url TEXT,
  file_size TEXT,
  file_type TEXT DEFAULT 'pdf',
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read documents" ON public.documents;
CREATE POLICY "Allow public read documents" ON public.documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all for documents" ON public.documents;
CREATE POLICY "Allow all for documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- 13. ตารางควิซถามตอบ & สะท้อนคิด 3 มิติ (Camp Quiz Responses)
CREATE TABLE IF NOT EXISTS public.camp_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camper_name TEXT,
  camper_nickname TEXT,
  camper_school TEXT,
  self_new_knowledge TEXT,
  self_commitment_score INTEGER DEFAULT 10,
  self_mindset_takeaway TEXT,
  self_target_faculty TEXT,
  self_target_major TEXT,
  self_faculty_reason TEXT,
  activities_ratings JSONB DEFAULT '[]'::jsonb,
  mentors_remembered JSONB DEFAULT '[]'::jsonb,
  mentors_remembered_count INTEGER DEFAULT 0,
  friends_remembered JSONB DEFAULT '[]'::jsonb,
  friends_remembered_count INTEGER DEFAULT 0,
  contact_mentors TEXT,
  mentor_review TEXT,
  mentor_dedication_score INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.camp_quiz_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert quiz" ON public.camp_quiz_responses;
CREATE POLICY "Allow public insert quiz" ON public.camp_quiz_responses FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all for admin on quiz" ON public.camp_quiz_responses;
CREATE POLICY "Allow all for admin on quiz" ON public.camp_quiz_responses FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'camp_feedbacks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_feedbacks;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'camp_schedule') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_schedule;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gallery_categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_categories;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'gallery_images') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'videos') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
  END IF;
END $$;

