-- =============================================
-- Video Section: Supabase Table Migration
-- =============================================
-- Run this SQL in Supabase SQL Editor to create
-- the videos table for the video section feature.
-- =============================================

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  video_type TEXT NOT NULL DEFAULT 'youtube',   -- 'youtube' | 'upload'
  video_url TEXT NOT NULL,                      -- YouTube URL or uploaded video public URL
  thumbnail_url TEXT DEFAULT '',                -- Optional thumbnail image URL
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read videos" ON public.videos
  FOR SELECT USING (true);

-- Allow all operations (for admin via anon key)
CREATE POLICY "Allow all for videos" ON public.videos
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
