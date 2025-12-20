-- =====================================================
-- SINAV ANALIZ UZMANI - CORE SCHEMA (NO DEMO DATA)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BASE TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  school_name text,
  role text DEFAULT 'teacher',
  is_admin boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.student_lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL,
  grade text NOT NULL,
  section text,
  academic_year text NOT NULL,
  subject text,
  school_name text,
  total_students integer DEFAULT 0,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_lists_pkey PRIMARY KEY (id),
  CONSTRAINT student_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_list_id uuid,
  student_number text,
  full_name text NOT NULL,
  gender text,
  date_of_birth date,
  contact_email text,
  parent_phone text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_student_list_id_fkey FOREIGN KEY (student_list_id) REFERENCES public.student_lists(id)
);

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  student_list_id uuid,
  title text NOT NULL,
  subject text NOT NULL,
  grade text NOT NULL,
  exam_date date NOT NULL,
  term text NOT NULL,
  exam_number text NOT NULL,
  exam_type text NOT NULL,
  scenario_id text,
  total_points integer,
  duration_minutes integer,
  status text DEFAULT 'draft',
  is_template boolean DEFAULT false,
  class_average numeric,
  participation_count integer,
  completion_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT exams_student_list_id_fkey FOREIGN KEY (student_list_id) REFERENCES public.student_lists(id)
);

CREATE TABLE IF NOT EXISTS public.exam_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid,
  question_number integer NOT NULL,
  max_score numeric NOT NULL,
  outcome_code text,
  outcome_description text,
  question_text text,
  question_image_url text,
  answer_key text,
  difficulty_level text,
  cognitive_level text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_questions_pkey PRIMARY KEY (id),
  CONSTRAINT exam_questions_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);

CREATE TABLE IF NOT EXISTS public.exam_scores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid,
  student_id uuid,
  exam_question_id uuid,
  score numeric NOT NULL,
  max_score numeric NOT NULL,
  attempted boolean DEFAULT true,
  time_spent_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_scores_pkey PRIMARY KEY (id),
  CONSTRAINT exam_scores_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_scores_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT exam_scores_exam_question_id_fkey FOREIGN KEY (exam_question_id) REFERENCES public.exam_questions(id)
);

CREATE TABLE IF NOT EXISTS public.exam_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid UNIQUE,
  class_average numeric,
  median_score numeric,
  std_deviation numeric,
  min_score numeric,
  max_score numeric,
  score_distribution jsonb,
  question_stats jsonb,
  outcome_stats jsonb,
  top_performers jsonb,
  struggling_students jsonb,
  ai_summary text,
  recommendations jsonb,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exam_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT exam_analytics_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id)
);

-- =====================================================
-- MODULE TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bloom_taxonomy_tags (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid,
  user_id uuid,
  exam_id uuid,
  cognitive_level text NOT NULL CHECK (cognitive_level = ANY (ARRAY['Bilgi', 'Kavrama', 'Uygulama', 'Analiz', 'Sentez', 'Değerlendirme'])),
  level_order integer CHECK (level_order >= 1 AND level_order <= 6),
  difficulty_level text CHECK (difficulty_level = ANY (ARRAY['Kolay', 'Orta', 'Zor'])),
  time_estimate_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bloom_taxonomy_tags_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.psychometric_analysis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  exam_id uuid NOT NULL,
  question_id uuid,
  user_id uuid,
  item_difficulty numeric,
  item_discrimination numeric,
  point_biserial numeric,
  irt_difficulty numeric,
  irt_discrimination numeric,
  guessing_parameter numeric,
  cronbach_alpha numeric,
  standard_error numeric,
  quality_rating text CHECK (quality_rating = ANY (ARRAY['Mükemmel', 'İyi', 'Orta', 'Zayıf', 'Revize'])),
  quality_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT psychometric_analysis_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.student_risk_scores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  user_id uuid,
  class_id uuid,
  risk_level text CHECK (risk_level = ANY (ARRAY['Düşük', 'Orta', 'Yüksek', 'Kritik'])),
  risk_score numeric,
  performance_trend text CHECK (performance_trend = ANY (ARRAY['Yükseliyor', 'Sabit', 'Düşüyor'])),
  average_score numeric,
  consistency_score numeric,
  failed_outcomes jsonb DEFAULT '[]'::jsonb,
  ai_recommendations jsonb DEFAULT '[]'::jsonb,
  suggested_interventions jsonb DEFAULT '[]'::jsonb,
  predicted_end_score numeric,
  score_history jsonb DEFAULT '[]'::jsonb,
  last_calculated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_risk_scores_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ocr_scans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  student_list_id uuid,
  original_filename text,
  file_url text,
  file_type text,
  raw_text text,
  extracted_data jsonb,
  confidence_score numeric,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'processing', 'completed', 'failed', 'needs_review'])),
  error_message text,
  user_corrections jsonb,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT ocr_scans_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.report_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  name text NOT NULL DEFAULT 'Varsayılan Şablon',
  description text,
  template_type text NOT NULL DEFAULT 'sinav_analizi',
  is_default boolean DEFAULT false,
  is_public boolean DEFAULT false,
  layout jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{
    "paperSize": "A4",
    "orientation": "portrait",
    "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20},
    "fontFamily": "Inter",
    "primaryColor": "#4f46e5"
  }'::jsonb,
  school_name text,
  province text DEFAULT 'KAHRAMANMARAŞ',
  district text DEFAULT 'Onikişubat',
  include_charts boolean DEFAULT true,
  include_student_grades boolean DEFAULT true,
  include_outcome_analysis boolean DEFAULT true,
  include_recommendations boolean DEFAULT true,
  chart_types jsonb DEFAULT '["bar", "pie"]'::jsonb,
  grade_ranges jsonb DEFAULT '[{"max": 49, "min": 0, "color": "#ef4444", "label": "Geçmez"}, {"max": 59, "min": 50, "color": "#f97316", "label": "Geçer"}, {"max": 69, "min": 60, "color": "#eab308", "label": "Orta"}, {"max": 84, "min": 70, "color": "#22c55e", "label": "İyi"}, {"max": 100, "min": 85, "color": "#3b82f6", "label": "Pekiyi"}]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usage_count integer DEFAULT 0,
  CONSTRAINT report_templates_pkey PRIMARY KEY (id),
  CONSTRAINT report_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

CREATE TABLE IF NOT EXISTS public.international_benchmarks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source text CHECK (source = ANY (ARRAY['PISA', 'TIMSS', 'PIRLS', 'CUSTOM'])),
  year integer,
  subject text,
  grade text,
  oecd_average numeric,
  turkey_average numeric,
  proficiency_levels jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT international_benchmarks_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

-- =====================================================
-- SAFE ALTER FOR REPORT EDITOR FIELDS
-- =====================================================
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS layout jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{
  "paperSize": "A4",
  "orientation": "portrait",
  "margins": {"top": 20, "bottom": 20, "left": 20, "right": 20},
  "fontFamily": "Inter",
  "primaryColor": "#4f46e5"
}'::jsonb;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS usage_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_psychometric_exam ON public.psychometric_analysis(exam_id);
CREATE INDEX IF NOT EXISTS idx_psychometric_user ON public.psychometric_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_student ON public.student_risk_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON public.student_risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_user ON public.student_risk_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_bloom_question ON public.bloom_taxonomy_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_bloom_level ON public.bloom_taxonomy_tags(cognitive_level);
CREATE INDEX IF NOT EXISTS idx_bloom_exam ON public.bloom_taxonomy_tags(exam_id);
CREATE INDEX IF NOT EXISTS idx_ocr_user ON public.ocr_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_status ON public.ocr_scans(status);
CREATE INDEX IF NOT EXISTS idx_template_user ON public.report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_template_type ON public.report_templates(template_type);

-- =====================================================
-- RLS FOR MODULE TABLES
-- =====================================================
ALTER TABLE public.psychometric_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "psychometric_public_access" ON public.psychometric_analysis;
CREATE POLICY "psychometric_public_access" ON public.psychometric_analysis FOR ALL USING (true);

ALTER TABLE public.student_risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "risk_public_access" ON public.student_risk_scores;
CREATE POLICY "risk_public_access" ON public.student_risk_scores FOR ALL USING (true);

ALTER TABLE public.bloom_taxonomy_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloom_public_access" ON public.bloom_taxonomy_tags;
CREATE POLICY "bloom_public_access" ON public.bloom_taxonomy_tags FOR ALL USING (true);

ALTER TABLE public.ocr_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ocr_public_access" ON public.ocr_scans;
CREATE POLICY "ocr_public_access" ON public.ocr_scans FOR ALL USING (true);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "template_public_access" ON public.report_templates;
CREATE POLICY "template_public_access" ON public.report_templates FOR ALL USING (true);

-- =====================================================
-- UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_psychometric_updated_at ON public.psychometric_analysis;
CREATE TRIGGER update_psychometric_updated_at
  BEFORE UPDATE ON public.psychometric_analysis
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_updated_at ON public.student_risk_scores;
CREATE TRIGGER update_risk_updated_at
  BEFORE UPDATE ON public.student_risk_scores
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_template_updated_at ON public.report_templates;
CREATE TRIGGER update_template_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET FOR OCR FILES
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ocr_scans', 'ocr_scans', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload OCR scans" ON storage.objects;
CREATE POLICY "Authenticated users can upload OCR scans"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ocr_scans' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated users can view their own OCR scans" ON storage.objects;
CREATE POLICY "Authenticated users can view their own OCR scans"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated users can update their own OCR scans" ON storage.objects;
CREATE POLICY "Authenticated users can update their own OCR scans"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Authenticated users can delete their own OCR scans" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own OCR scans"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ocr_scans' AND auth.uid() = owner);
