-- ================================================================
-- GUIDANCE FOR DREAM 7TH: NEW FEATURES DATABASE MIGRATION
-- Tables:
--   1. camp_feedbacks (เสียงสะท้อนจากน้อง - Sticky Notes Board)
--   2. future_letters (จดหมายถึงตัวฉันในอนาคต - Time Capsule)
--   3. camp_staff     (ทีมงานมุสลีมีน / มุสลิมะฮ์)
--   4. camp_meals     (ตารางอาหารค่าย 4 วัน 5 คอลัมน์)
-- ================================================================

-- 1. TABLE: camp_feedbacks (เสียงสะท้อนจากน้อง)
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

-- Indexing
CREATE INDEX IF NOT EXISTS idx_camp_feedbacks_created_at ON public.camp_feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_camp_feedbacks_is_approved ON public.camp_feedbacks(is_approved);

-- RLS
ALTER TABLE public.camp_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read feedbacks" ON public.camp_feedbacks
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow public insert feedbacks" ON public.camp_feedbacks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all for admin on feedbacks" ON public.camp_feedbacks
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_feedbacks;


-- 2. TABLE: future_letters (จดหมายถึงตัวฉันในอนาคต)
CREATE TABLE IF NOT EXISTS public.future_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT DEFAULT '',
  dream_faculty TEXT DEFAULT '',
  letter_content TEXT NOT NULL,
  delivery_timing TEXT NOT NULL,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_future_letters_created_at ON public.future_letters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_future_letters_email ON public.future_letters(email);

-- RLS
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert future letters" ON public.future_letters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all for admin on future letters" ON public.future_letters
  FOR ALL USING (true) WITH CHECK (true);


-- 3. TABLE: camp_staff (ข้อมูลทีมงาน)
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

-- Indexing
CREATE INDEX IF NOT EXISTS idx_camp_staff_gender ON public.camp_staff(gender);
CREATE INDEX IF NOT EXISTS idx_camp_staff_sort_order ON public.camp_staff(sort_order);
CREATE INDEX IF NOT EXISTS idx_camp_staff_is_active ON public.camp_staff(is_active);

-- RLS
ALTER TABLE public.camp_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read staff" ON public.camp_staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow all for admin on staff" ON public.camp_staff
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_staff;


-- 4. TABLE: camp_meals (ตารางมื้ออาหาร)
CREATE TABLE IF NOT EXISTS public.camp_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_num INT NOT NULL,
  date_str TEXT NOT NULL,
  day_title TEXT NOT NULL,
  breakfast_menu TEXT DEFAULT '',
  breakfast_time TEXT DEFAULT '-',
  breakfast_provided BOOLEAN DEFAULT false,
  lunch_menu TEXT DEFAULT '',
  lunch_time TEXT DEFAULT '12:00 - 13:00 น.',
  lunch_provided BOOLEAN DEFAULT true,
  dinner_menu TEXT DEFAULT '',
  dinner_time TEXT DEFAULT '18:00 - 19:30 น.',
  dinner_provided BOOLEAN DEFAULT true,
  snacks_menu TEXT DEFAULT '',
  snacks_time TEXT DEFAULT '15:30 - 16:00 น.',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_camp_meals_day_num ON public.camp_meals(day_num);

-- RLS
ALTER TABLE public.camp_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read meals" ON public.camp_meals
  FOR SELECT USING (true);

CREATE POLICY "Allow all for admin on meals" ON public.camp_meals
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_meals;


-- ================================================================
-- INITIAL SEED DATA
-- ================================================================

-- Seed Initial Feedbacks
INSERT INTO public.camp_feedbacks (content, bg_color, text_color, rotate_deg, date_display) VALUES
('ค่ายนี้เปลี่ยนชีวิตหนูจริงๆ ค่ะ จากที่เคยไม่มั่นใจว่าตัวเองจะสอบแพทย์ได้ไหม พี่ๆ ฐานแพทย์ให้กำลังใจดีมาก ได้ลองจับหูฟัง Stethoscope ของจริง ประทับใจพี่เลี้ยงบ้าน 3 มากๆ ค่ะ สัญญาว่าจะพยายามให้เต็มที่เพื่อมาเจอกันในรั้วสีบลูนะคะ!', 'bg-amber-100 border-amber-300', 'text-amber-950', '-rotate-2', '6 พ.ย. 68 • 16:45 น.'),
('ชอบฐานวิศวะกับหุ่นยนต์มากครับ พี่ๆ สอนเข้าใจง่ายมาก แถมยังได้เรียนรู้เรื่องการแบ่งเวลาและการละหมาดในรั้วมหาวิทยาลัย คืนบายเนียร์น้ำตาซึมเลยครับ อบอุ่นเหมือนครอบครัวจริงๆ', 'bg-sky-100 border-sky-300', 'text-sky-950', 'rotate-1', '7 พ.ย. 68 • 19:20 น.'),
('ขอบคุณพี่ๆ ทุกคนที่จัดค่ายดีๆ แบบนี้นะคะ อาหารฮาลาลอร่อยทุกมื้อ พี่ๆ ฝ่ายพยาบาลดูแลดีมาก ได้ทั้งความรู้ TCAS และเพื่อนใหม่จากหลายจังหวัดเลย เป็น 4 วันที่คุ้มค่าที่สุดในชีวิต ม.ปลาย ค่ะ', 'bg-pink-100 border-pink-300', 'text-pink-950', '-rotate-1', '8 พ.ย. 68 • 12:30 น.'),
('ได้เข้าใจกฎหมายและบทบาทของนักกฎหมายมุสลิมในการช่วยเหลือสังคมอย่างลึกซึ้ง พี่ๆ ถ่ายทอดด้วยหัวใจจริงๆ ขอบคุณคำแนะนำเรื่องรอบพอร์ตโฟลิโอครับ จะนำไปปรับใช้แน่นอนครับ', 'bg-emerald-100 border-emerald-300', 'text-emerald-950', 'rotate-2', '8 พ.ย. 68 • 15:10 น.'),
('ฐานทันตะสนุกมากกก ได้ลองพิมพ์ฟันและกรอแบบจำลอง พี่ๆ ให้คำแนะนำการเตรียมตัวสอบแบบละเอียดสุดๆ ค่ายนี้ตอบโจทย์ทุกคำถามที่สงสัย ขอบคุณ Guidance for Dream มากๆ ค่ะ', 'bg-purple-100 border-purple-300', 'text-purple-950', '-rotate-2', '9 พ.ย. 68 • 10:15 น.'),
('ค่ายสอนให้รู้ว่า ''ความฝันที่ยิ่งใหญ่ ต้องเริ่มต้นด้วยศรัทธาและความพยายาม'' ขอบคุณพี่ๆ ทุกฝ่ายที่เหน็ดเหนื่อยเพื่อพวกเรา อาหารอร่อย กิจกรรมสนุก ได้รับพลังใจกลับไปเต็มร้อยเลยครับ', 'bg-rose-100 border-rose-300', 'text-rose-950', 'rotate-1', '9 พ.ย. 68 • 13:40 น.')
ON CONFLICT DO NOTHING;

-- Seed Initial Camp Staff (Brothers & Sisters)
INSERT INTO public.camp_staff (gender, name, nickname, year_level, faculty, student_id, phone, facebook, role, dept, sort_order) VALUES
('male', 'นายฮนีฟ ต่วนมีเด่น', 'ฮนีฟ', 'ปี 3', 'วิศวกรรมศาสตร์', '6510110xxx', '091-046-3361', 'Haneef Tuan', 'อมีรค่าย (ประธานโครงการ)', 'ฝ่ายอำนวยการ', 1),
('male', 'นายฟารุก หวันเหล็ม', 'ฟารุก', 'ปี 4', 'แพทยศาสตร์', '6410210xxx', '082-111-2233', 'Faruk Wanlem', 'หัวหน้าฝ่ายวิชาการ', 'ฝ่ายวิชาการ', 2),
('male', 'นายอัชรอฟ สาและ', 'อัชรอฟ', 'ปี 2', 'วิทยาศาสตร์', '6610510xxx', '083-444-5566', 'Ashraf Saleh', 'หัวหน้าฝ่ายกิจกรรม', 'ฝ่ายกิจกรรม', 3),
('male', 'นายดานิช เจ๊ะมะ', 'ดานิช', 'ปี 3', 'นิติศาสตร์', '6510810xxx', '089-777-8899', 'Danish Chema', 'หัวหน้าฝ่ายประสานงาน', 'ฝ่ายประสานงาน', 4),
('female', 'นางสาวนุรฮูดา กาซอ', 'ฮูดา', 'ปี 3', 'พยาบาลศาสตร์', '6510310xxx', '062-024-9308', 'Nurhuda Gaso', 'อมีเราะฮฺค่าย (รองประธานโครงการ)', 'ฝ่ายอำนวยการ', 5),
('female', 'นางสาวฟาตีมะห์ ดอเลาะ', 'ตีมะห์', 'ปี 3', 'เภสัชศาสตร์', '6510410xxx', '081-999-0011', 'Fatimah Doloh', 'หัวหน้าฝ่ายพยาบาล & สวัสดิการ', 'ฝ่ายพยาบาล', 6),
('female', 'นางสาวซูฮัยลา มะมิง', 'ซู', 'ปี 2', 'ศึกษาศาสตร์', '6610710xxx', '084-222-3344', 'Suhaila Maming', 'หัวหน้าฝ่ายทะเบียน & สารสนเทศ', 'ฝ่ายทะเบียน', 7),
('female', 'นางสาวมัรยัม ดาโอ๊ะ', 'ยัม', 'ปี 3', 'วิทยาการจัดการ', '6510910xxx', '086-555-6677', 'Maryam Daoh', 'หัวหน้าฝ่ายอาหาร & โภชนาการ', 'ฝ่ายอาหาร', 8)
ON CONFLICT DO NOTHING;

-- Seed Initial Camp Meals (4 Days, 5 Columns)
INSERT INTO public.camp_meals (day_num, date_str, day_title, breakfast_menu, breakfast_time, breakfast_provided, lunch_menu, lunch_time, lunch_provided, dinner_menu, dinner_time, dinner_provided, snacks_menu, snacks_time, sort_order) VALUES
(1, 'ศุกร์ 6 พ.ย. 2569', 'วันรายงานตัว & พิธีเปิดค่าย', '— เดินทางมารายงานตัว (ตามอัธยาศัย) —', '-', false, 'ข้าวมันไก่เบตงฮาลาลสูตรพิเศษ พร้อมน้ำซุปสมุนไพร', '12:00 - 13:00 น.', true, 'ข้าวหมกไก่สูตรอาหรับโบราณ พร้อมอาจาดแตงกวา', '18:00 - 19:30 น.', true, 'โรตีมะตะบะ และชาชักปักษ์ใต้', '15:30 - 16:00 น.', 1),
(2, 'เสาร์ 7 พ.ย. 2569', 'วันกิจกรรมฐานเจาะลึก 16 คณะ', 'ข้าวต้มกุ้งทรงเครื่องฮาลาล พร้อมไข่ลวกสมุนไพร', '07:00 - 08:00 น.', true, 'ข้าวผัดต้มยำกุ้งทะเล พร้อมไข่ดาวกรอบ', '12:00 - 13:00 น.', true, 'แกงส้มปลากะพงยอดมะพร้าว + ไก่ทอดหาดใหญ่', '18:00 - 19:30 น.', true, 'ขนมกะหรี่ปั๊บไส้ไก่ และน้ำกระเจี๊ยบเย็นชื่นใจ', '15:30 - 16:00 น.', 2),
(3, 'อาทิตย์ 8 พ.ย. 2569', 'วันวิชาการ TCAS & ค่ำคืนบายเนียร์', 'ข้าวยำปักษ์ใต้น้ำบูดูแท้ พร้อมไข่ต้มและผักสดพื้นบ้าน', '07:00 - 08:00 น.', true, 'ผัดไทยกุ้งสดห่อไข่ พร้อมน้ำมะนาวอัญชัน', '12:00 - 13:00 น.', true, 'บุฟเฟต์บาร์บีคิวเนื้อโคขุนฮาลาล & สเต็กไก่พริกไทยดำ คืนบายเนียร์', '18:00 - 20:00 น.', true, 'บัวลอยน้ำขิงร้อนๆ เสิร์ฟก่อนเข้ากิจกรรมบายเนียร์', '21:30 - 22:00 น.', 3),
(4, 'จันทร์ 9 พ.ย. 2569', 'พิธีปิดค่าย & อำลาสายใยสู่ยอดฝัน', 'โจ๊กไก่ฉีกใส่ไข่ ปาท่องโก๋ร้อน นมข้นหวาน', '07:00 - 08:00 น.', true, 'ข้าวแกงมัสมั่นเนื้อน่องลาย & ผัดผักรวมมิตร มื้ออำลา', '12:00 - 13:00 น.', true, '— เดินทางกลับภูมิลำเนาโดยสวัสดิภาพ —', '-', false, 'ขนมเค้กอินทผลัม และชาอู่หลงมะนาว', '10:30 - 11:00 น.', 4)
ON CONFLICT DO NOTHING;

