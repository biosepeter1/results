-- ══════════════════════════════════════════════════════════════════════════════
-- ACADEMIC EXAMINATION & CBT RESULTS PORTAL
-- Complete Supabase PostgreSQL Schema
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Examination Results Table (Uploaded Scores from CSV)
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT NOT NULL,
    student TEXT NOT NULL,
    reg TEXT NOT NULL,
    subject TEXT NOT NULL,
    class TEXT NOT NULL,
    arm TEXT DEFAULT '',
    score TEXT DEFAULT '',
    pct NUMERIC DEFAULT 0,
    exam_date TEXT DEFAULT '',
    uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Fast Indexes for Instant Filter / Search
CREATE INDEX IF NOT EXISTS idx_exam_results_term ON public.exam_results(term);
CREATE INDEX IF NOT EXISTS idx_exam_results_subject ON public.exam_results(subject);
CREATE INDEX IF NOT EXISTS idx_exam_results_class ON public.exam_results(class);
CREATE INDEX IF NOT EXISTS idx_exam_results_arm ON public.exam_results(arm);
CREATE INDEX IF NOT EXISTS idx_exam_results_reg ON public.exam_results(reg);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.exam_results(student);

-- 2. Teachers Management Table
CREATE TABLE IF NOT EXISTS public.exam_teachers (
    id TEXT PRIMARY KEY,               -- Clean username (e.g. 'mrsitema')
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    subjects TEXT[] DEFAULT '{}',      -- Assigned subjects array
    classes TEXT[] DEFAULT '{}',       -- Assigned classes array (Year 7 - 12)
    arms TEXT[] DEFAULT '{}',          -- Optional assigned arms
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. CBT Teacher Exam Submissions Table
CREATE TABLE IF NOT EXISTS public.cbt_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id TEXT UNIQUE,
    exam_id TEXT,                      -- 24-character MongoDB hex ObjectId
    title TEXT NOT NULL,
    teacher_name TEXT DEFAULT '',
    teacher_user TEXT DEFAULT '',
    subject_name TEXT NOT NULL,
    subject_id TEXT,                   -- MongoDB subject ObjectId
    class_name TEXT DEFAULT 'All',
    class_id TEXT,                     -- MongoDB class ObjectId
    term_name TEXT DEFAULT '',
    term_id TEXT,
    session_name TEXT DEFAULT '',
    session_id TEXT,
    duration INTEGER DEFAULT 30,
    number_of_questions INTEGER DEFAULT 0,
    questions JSONB DEFAULT '[]'::jsonb, -- Array of questions with options, answers & diagrams
    launch_date TEXT DEFAULT '2026-10-27',
    start_time TEXT DEFAULT '08:00',
    end_time TEXT DEFAULT '20:00',
    shuffle BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending',     -- 'pending', 'approved', 'active'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cbt_submissions_teacher ON public.cbt_submissions(teacher_user);
CREATE INDEX IF NOT EXISTS idx_cbt_submissions_subject ON public.cbt_submissions(subject_name);

-- 4. CBT Official Subjects Catalog & MongoDB ObjectIds
CREATE TABLE IF NOT EXISTS public.cbt_subjects (
    name TEXT PRIMARY KEY,             -- e.g. "Computer Studies"
    mongo_id TEXT NOT NULL,            -- e.g. "68c5508044dc59aedc899eab"
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. System Metadata (For 1-read cache synchronization)
CREATE TABLE IF NOT EXISTS public.exam_meta (
    key TEXT PRIMARY KEY,              -- e.g. "version"
    last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    meta JSONB DEFAULT '{}'::jsonb
);

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows the web client to read/write using the Supabase Public Anon Key
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_meta ENABLE ROW LEVEL SECURITY;

-- Allow public read and write (matching current Firebase portal behavior)
CREATE POLICY "Public full access on exam_results" ON public.exam_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on exam_teachers" ON public.exam_teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on cbt_submissions" ON public.cbt_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on cbt_subjects" ON public.cbt_subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on exam_meta" ON public.exam_meta FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED INITIAL CBT SUBJECTS (Official MongoDB ObjectIds)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.cbt_subjects (name, mongo_id) VALUES
('Mathematics', '68acd2b5b81c01af321d0998'),
('Chemistry', '68c00870f7e71f38e1e4b962'),
('Physics', '68c5507544dc59aedc899ea7'),
('Computer Studies', '68c5508044dc59aedc899eab'),
('Physical Health Education', '68c550a044dc59aedc899eb6'),
('Biology', '68c822cae693c212be80d8f1'),
('Data Processing', '68d0467fc92e802af0bb8746'),
('English Language', '68d04890c92e802af0bb876d'),
('Literature in English', '68d04a5dc92e802af0bb8785'),
('Economics', '68d04b14c92e802af0bb8793'),
('French Language', '68d290c4dccbf5227b8d79e0'),
('Yoruba Language', '68d29460dccbf5227b8d79ff'),
('Further Mathematics', '68d296e6dccbf5227b8d7a1b'),
('Robotics', '68d2bd64dccbf5227b8d7ac2'),
('Civic Education', '68d2c7fddccbf5227b8d7bdf'),
('Technical Drawing', '68d3d4fe213f0bc29679c451'),
('ICT', '68d3e53b213f0bc29679c4b1'),
('Geography', '68d3e617213f0bc29679c4da'),
('Commerce', '68d3fd7d213f0bc29679c500'),
('Financial Accounting', '68d3fe38213f0bc29679c512'),
('Marketing', '68d40248213f0bc29679c524'),
('Government', '68d402ef213f0bc29679c539'),
('Islamic Religious Studies', '68d404b1213f0bc29679c57c'),
('Christian Religious Studies', '68d404d8213f0bc29679c586'),
('Agricultural Science', '68d4544a902dbca0fec8274e'),
('Cultural and Creative Art', '68d454ee902dbca0fec82766'),
('Visual Art', '68d455bf902dbca0fec82782'),
('Basic Science', '6919eaa4a1f7894cb96a1343'),
('Basic Technology', '6919eebea1f7894cb96a13b2'),
('Business Studies', '6919f342a1f7894cb96a1401'),
('Social Studies', '6919f3f6a1f7894cb96a141d'),
('History', '6919f571a1f7894cb96a1465'),
('Home Economics', '6919f64ca1f7894cb96a1495'),
('Music', '6919f7f1a1f7894cb96a14cc'),
('Computer Hardware and GSM Repair', '6985dfe321fa2427ffc9c072'),
('Fashion Design and Garment making', '6985e01f21fa2427ffc9c07b')
ON CONFLICT (name) DO NOTHING;

