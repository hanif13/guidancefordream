-- ==============================================================================
-- GFD 7th: Camp Quiz & 3-Dimension Reflection Table (ควิซประเมินและสะท้อนคิด 3 มิติ)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.camp_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Camper Profile
  camper_name TEXT,
  camper_nickname TEXT,
  camper_school TEXT,
  
  -- Dimension 1: มิติตัวเอง (Self Dimension)
  self_new_knowledge TEXT,
  self_commitment_score INTEGER DEFAULT 10,
  self_mindset_takeaway TEXT,
  self_target_faculty TEXT,
  self_target_major TEXT,
  self_faculty_reason TEXT,
  
  -- Dimension 2: มิติกิจกรรม (Activities Dimension)
  activities_ratings JSONB DEFAULT '[]'::jsonb,
  
  -- Dimension 3: มิติพี่ค่ายและเพื่อน (Mentors & Friends Dimension)
  mentors_remembered JSONB DEFAULT '[]'::jsonb,
  mentors_remembered_count INTEGER DEFAULT 0,
  friends_remembered JSONB DEFAULT '[]'::jsonb,
  friends_remembered_count INTEGER DEFAULT 0,
  contact_mentors TEXT,
  mentor_review TEXT,
  mentor_dedication_score INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for quick analytics
CREATE INDEX IF NOT EXISTS idx_camp_quiz_created_at ON public.camp_quiz_responses (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.camp_quiz_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous & authenticated campers to submit quiz responses
CREATE POLICY "Allow public insert to camp_quiz_responses"
  ON public.camp_quiz_responses
  FOR INSERT
  WITH CHECK (true);

-- Allow public & admin to view quiz responses
CREATE POLICY "Allow public select from camp_quiz_responses"
  ON public.camp_quiz_responses
  FOR SELECT
  USING (true);

-- Allow admin to delete if needed
CREATE POLICY "Allow admin delete on camp_quiz_responses"
  ON public.camp_quiz_responses
  FOR DELETE
  USING (true);

