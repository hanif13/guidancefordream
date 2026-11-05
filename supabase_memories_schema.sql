-- =============================================
-- Memories & Gallery Categories Schema (Safe & Re-runnable)
-- =============================================

-- 1. Table for dynamic categories created by admin
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_gallery_categories_sort_order ON public.gallery_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_is_active ON public.gallery_categories(is_active);

-- Enable RLS
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for gallery_categories
DROP POLICY IF EXISTS "Allow public read gallery_categories" ON public.gallery_categories;
CREATE POLICY "Allow public read gallery_categories" ON public.gallery_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for gallery_categories" ON public.gallery_categories;
CREATE POLICY "Allow all for gallery_categories" ON public.gallery_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Safely add to Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'gallery_categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_categories;
  END IF;
END $$;


-- 2. Gallery images table
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

-- Indexing
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON public.gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort_order ON public.gallery_images(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_active ON public.gallery_images(is_active);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for gallery_images
DROP POLICY IF EXISTS "Allow public read gallery_images" ON public.gallery_images;
CREATE POLICY "Allow public read gallery_images" ON public.gallery_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for gallery_images" ON public.gallery_images;
CREATE POLICY "Allow all for gallery_images" ON public.gallery_images
  FOR ALL USING (true) WITH CHECK (true);

-- Safely add to Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'gallery_images'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images;
  END IF;
END $$;
