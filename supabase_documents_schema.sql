-- =============================================
-- Camp Documents: Supabase Table Migration
-- =============================================
-- Run this SQL in your Supabase SQL Editor to create
-- the documents table and enable storage and realtime.
-- =============================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'academic',          -- 'academic' | 'faculty_slides' | 'camp_docs'
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  file_url TEXT DEFAULT '',                          -- Link to uploaded PDF / document
  cover_url TEXT DEFAULT '',                         -- Link to cover image
  cover_gradient TEXT DEFAULT 'from-stone-900 via-amber-950 to-stone-950',
  icon TEXT DEFAULT '📖',
  badge TEXT DEFAULT 'E-BOOK',
  author TEXT DEFAULT 'ชมรมมุสลิม ม.อ. หาดใหญ่',
  total_pages INT DEFAULT 1,
  file_size TEXT DEFAULT '',
  spreads JSONB DEFAULT '[]'::jsonb,                 -- 2-page spreads JSON content for real book view
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for fast filtering & ordering
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_sort_order ON public.documents(sort_order);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON public.documents(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active documents
CREATE POLICY "Allow public read documents" ON public.documents
  FOR SELECT USING (true);

-- Allow all operations (Insert, Update, Delete for admin via anon/service key)
CREATE POLICY "Allow all for documents" ON public.documents
  FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime updates for live website synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Ensure storage bucket 'gfd-media' exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('gfd-media', 'gfd-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies: Allow public read & upload
CREATE POLICY "Allow public read gfd-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gfd-media');

CREATE POLICY "Allow public upload gfd-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gfd-media');

CREATE POLICY "Allow public update gfd-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gfd-media')
  WITH CHECK (bucket_id = 'gfd-media');

CREATE POLICY "Allow public delete gfd-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gfd-media');
