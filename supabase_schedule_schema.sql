-- =============================================
-- Camp Schedule: Supabase Table Migration
-- Guidance for Dream 7th (ค่ายสานฝันเพื่อน้อง ครั้งที่ 7)
-- =============================================
-- Run this SQL in your Supabase SQL Editor to create
-- the schedule table and enable realtime sync.
-- =============================================

CREATE TABLE IF NOT EXISTS public.camp_schedule (
  id TEXT PRIMARY KEY,
  schedule_type TEXT NOT NULL DEFAULT 'master',       -- 'master' (กำหนดการหลัก) | 'subgroup' (แยกกลุ่ม)
  day_num INT NOT NULL DEFAULT 1,                     -- 1, 2, 3, 4
  date_str TEXT DEFAULT '',                           -- e.g. 'วันศุกร์ 6 พ.ย. 2569'
  date_iso TEXT DEFAULT '',                           -- e.g. '2026-11-06'
  time TEXT NOT NULL,                                 -- e.g. '10:00 - 12:00'
  start_time TEXT DEFAULT '',                         -- e.g. '10:00'
  end_time TEXT DEFAULT '',                           -- e.g. '12:00'
  duration TEXT DEFAULT '',                           -- e.g. '120' (นาที)
  title TEXT NOT NULL,                                -- กิจกรรมหลัก
  description TEXT DEFAULT '',                        -- รายละเอียดเพิ่มเติม
  loc_male TEXT DEFAULT '',                           -- สถานที่มุสลีมีน
  loc_female TEXT DEFAULT '',                         -- สถานที่มุสลีมะฮฺ
  dept TEXT DEFAULT '',                               -- ฝ่ายที่รับผิดชอบ
  note TEXT DEFAULT '',                               -- หมายเหตุ
  category TEXT NOT NULL DEFAULT 'activity',          -- 'activity' | 'prayer' | 'meal_break' | 'travel'
  gender TEXT DEFAULT 'both',                         -- 'both' | 'male' | 'female'
  target_group TEXT DEFAULT 'main',                   -- 'main' or e.g. 'มุสลีมีน กลุ่ม 1'
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for high-performance querying
CREATE INDEX IF NOT EXISTS idx_schedule_type ON public.camp_schedule(schedule_type);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON public.camp_schedule(day_num);
CREATE INDEX IF NOT EXISTS idx_schedule_sort ON public.camp_schedule(sort_order);
CREATE INDEX IF NOT EXISTS idx_schedule_active ON public.camp_schedule(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.camp_schedule ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active schedule items
CREATE POLICY "Allow public read schedule" ON public.camp_schedule
  FOR SELECT USING (true);

-- Allow all operations for admin
CREATE POLICY "Allow all for schedule" ON public.camp_schedule
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime updates for live website synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_schedule;

