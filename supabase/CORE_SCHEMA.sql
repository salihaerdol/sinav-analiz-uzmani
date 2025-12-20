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

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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
-- ANALYSIS HISTORY TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  school_name text,
  teacher_name text,
  class_name text,
  grade text,
  subject text,
  scenario text,
  exam_date date,
  term text,
  exam_number text,
  exam_type text,
  academic_year text,
  class_average numeric,
  total_students integer,
  total_questions integer,
  analysis_data jsonb,
  questions_data jsonb,
  students_data jsonb,
  ai_summary text,
  ai_recommendations jsonb,
  tags text[] DEFAULT '{}'::text[],
  notes text,
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT analysis_history_pkey PRIMARY KEY (id),
  CONSTRAINT analysis_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  student_name text NOT NULL,
  class_name text,
  total_exams integer DEFAULT 0,
  average_score numeric,
  best_score numeric,
  worst_score numeric,
  trend text CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  exam_history jsonb DEFAULT '[]'::jsonb,
  outcome_progress jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_progress_pkey PRIMARY KEY (id),
  CONSTRAINT student_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

CREATE TABLE IF NOT EXISTS public.class_progress (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  class_name text NOT NULL,
  grade text,
  subject text NOT NULL,
  total_exams integer DEFAULT 0,
  average_score numeric,
  best_average numeric,
  worst_average numeric,
  trend text CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  exam_history jsonb DEFAULT '[]'::jsonb,
  outcome_progress jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_progress_pkey PRIMARY KEY (id),
  CONSTRAINT class_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  gemini_api_key text,
  gemini_api_key_valid boolean DEFAULT false,
  gemini_last_verified timestamp with time zone,
  openai_api_key text,
  total_ai_requests integer DEFAULT 0,
  last_ai_request timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_api_keys_pkey PRIMARY KEY (id),
  CONSTRAINT user_api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
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
CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_filters ON public.analysis_history(user_id, class_name, subject, grade);
CREATE INDEX IF NOT EXISTS idx_analysis_history_exam_date ON public.analysis_history(exam_date);
CREATE INDEX IF NOT EXISTS idx_student_progress_user ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_name ON public.student_progress(user_id, student_name);
CREATE INDEX IF NOT EXISTS idx_class_progress_user ON public.class_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_class_progress_key ON public.class_progress(user_id, class_name, subject);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user ON public.user_api_keys(user_id);
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
DROP POLICY IF EXISTS "psychometric_owner_access" ON public.psychometric_analysis;
CREATE POLICY "psychometric_owner_access" ON public.psychometric_analysis
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.student_risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "risk_owner_access" ON public.student_risk_scores;
CREATE POLICY "risk_owner_access" ON public.student_risk_scores
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.bloom_taxonomy_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloom_owner_access" ON public.bloom_taxonomy_tags;
CREATE POLICY "bloom_owner_access" ON public.bloom_taxonomy_tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.ocr_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ocr_owner_access" ON public.ocr_scans;
CREATE POLICY "ocr_owner_access" ON public.ocr_scans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "template_owner_access" ON public.report_templates;
CREATE POLICY "template_owner_access" ON public.report_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analysis_history_owner_access" ON public.analysis_history;
CREATE POLICY "analysis_history_owner_access" ON public.analysis_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_progress_owner_access" ON public.student_progress;
CREATE POLICY "student_progress_owner_access" ON public.student_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.class_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "class_progress_owner_access" ON public.class_progress;
CREATE POLICY "class_progress_owner_access" ON public.class_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_api_keys_owner_access" ON public.user_api_keys;
CREATE POLICY "user_api_keys_owner_access" ON public.user_api_keys
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_profiles_owner_access" ON public.user_profiles;
CREATE POLICY "user_profiles_owner_access" ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE public.student_lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_lists_owner_access" ON public.student_lists;
CREATE POLICY "student_lists_owner_access" ON public.student_lists
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_owner_access" ON public.students;
CREATE POLICY "students_owner_access" ON public.students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.student_lists sl
      WHERE sl.id = student_list_id
        AND sl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_lists sl
      WHERE sl.id = student_list_id
        AND sl.user_id = auth.uid()
    )
  );

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exams_owner_access" ON public.exams;
CREATE POLICY "exams_owner_access" ON public.exams
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_questions_owner_access" ON public.exam_questions;
CREATE POLICY "exam_questions_owner_access" ON public.exam_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  );

ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_scores_owner_access" ON public.exam_scores;
CREATE POLICY "exam_scores_owner_access" ON public.exam_scores
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  );

ALTER TABLE public.exam_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exam_analytics_owner_access" ON public.exam_analytics;
CREATE POLICY "exam_analytics_owner_access" ON public.exam_analytics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id
        AND e.user_id = auth.uid()
    )
  );

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_logs_owner_access" ON public.audit_logs;
CREATE POLICY "audit_logs_owner_access" ON public.audit_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_lists_updated_at ON public.student_lists;
CREATE TRIGGER update_student_lists_updated_at
  BEFORE UPDATE ON public.student_lists
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exams_updated_at ON public.exams;
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_questions_updated_at ON public.exam_questions;
CREATE TRIGGER update_exam_questions_updated_at
  BEFORE UPDATE ON public.exam_questions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_scores_updated_at ON public.exam_scores;
CREATE TRIGGER update_exam_scores_updated_at
  BEFORE UPDATE ON public.exam_scores
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_analytics_updated_at ON public.exam_analytics;
CREATE TRIGGER update_exam_analytics_updated_at
  BEFORE UPDATE ON public.exam_analytics
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_history_updated_at ON public.analysis_history;
CREATE TRIGGER update_analysis_history_updated_at
  BEFORE UPDATE ON public.analysis_history
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_progress_updated_at ON public.student_progress;
CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON public.student_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_progress_updated_at ON public.class_progress;
CREATE TRIGGER update_class_progress_updated_at
  BEFORE UPDATE ON public.class_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON public.user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
  BEFORE UPDATE ON public.user_api_keys
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
