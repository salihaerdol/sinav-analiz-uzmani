-- =====================================================
-- SINAV ANALİZ UZMANI - ADVANCED DATABASE SCHEMA
-- Dünya Standartlarında Eğitim Yönetim Sistemi
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES (Extended from Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    school_name TEXT,
    role TEXT DEFAULT 'teacher', -- teacher, admin, coordinator
    is_admin BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}'::jsonb, -- UI preferences, notifications, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. STUDENT LISTS (Class Groups)
-- =====================================================
CREATE TABLE IF NOT EXISTS student_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "5/A Sınıfı 2024-2025"
    grade TEXT NOT NULL, -- "5", "6", "7", "8"
    section TEXT, -- "A", "B", "C"
    academic_year TEXT NOT NULL, -- "2024-2025"
    subject TEXT, -- Optional: specific subject grouping
    school_name TEXT,
    total_students INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name, academic_year)
);

-- =====================================================
-- 3. STUDENTS (Individual Student Records)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_list_id UUID REFERENCES student_lists(id) ON DELETE CASCADE,
    student_number TEXT, -- School student ID
    full_name TEXT NOT NULL,
    gender TEXT, -- "M", "F", "Other"
    date_of_birth DATE,
    contact_email TEXT,
    parent_phone TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_list_id, student_number)
);

-- =====================================================
-- 4. EXAMS (Exam Metadata)
-- =====================================================
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    student_list_id UUID REFERENCES student_lists(id) ON DELETE SET NULL,
    
    -- Basic Info
    title TEXT NOT NULL,
    subject TEXT NOT NULL, -- "İngilizce", "Matematik"
    grade TEXT NOT NULL,
    
    -- Exam Details
    exam_date DATE NOT NULL,
    term TEXT NOT NULL, -- "1", "2"
    exam_number TEXT NOT NULL, -- "1", "2", "3", "4"
    exam_type TEXT NOT NULL, -- "Yazılı", "Sözlü", "Performans"
    
    -- MEB Reference
    scenario_id TEXT, -- Reference to MEB scenario
    total_points INTEGER,
    duration_minutes INTEGER,
    
    -- Status
    status TEXT DEFAULT 'draft', -- draft, published, archived
    is_template BOOLEAN DEFAULT false, -- Can be reused
    
    -- Analytics (cached)
    class_average NUMERIC(5,2),
    participation_count INTEGER,
    completion_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EXAM QUESTIONS (Questions for each exam)
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    
    question_number INTEGER NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    
    -- Learning Outcome
    outcome_code TEXT,
    outcome_description TEXT,
    
    -- Question Content (Optional)
    question_text TEXT,
    question_image_url TEXT,
    answer_key TEXT,
    difficulty_level TEXT, -- "easy", "medium", "hard"
    
    -- Cognitive Level (Bloom's Taxonomy)
    cognitive_level TEXT, -- "remember", "understand", "apply", "analyze", "evaluate", "create"
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, question_number)
);

-- =====================================================
-- 6. EXAM SCORES (Student Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    exam_question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    
    -- Additional tracking
    attempted BOOLEAN DEFAULT true,
    time_spent_seconds INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id, exam_question_id)
);

-- =====================================================
-- 7. EXAM ANALYTICS (Cached Analysis Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID UNIQUE REFERENCES exams(id) ON DELETE CASCADE,
    
    -- Overall Statistics
    class_average NUMERIC(5,2),
    median_score NUMERIC(5,2),
    std_deviation NUMERIC(5,2),
    min_score NUMERIC(5,2),
    max_score NUMERIC(5,2),
    
    -- Distribution
    score_distribution JSONB, -- {"0-10": 2, "10-20": 5, ...}
    
    -- Question Statistics
    question_stats JSONB, -- Array of question analysis
    
    -- Outcome Statistics
    outcome_stats JSONB, -- Array of outcome analysis
    
    -- Student Rankings
    top_performers JSONB, -- Top 10 students
    struggling_students JSONB, -- Students needing support
    
    -- AI Insights
    ai_summary TEXT,
    recommendations JSONB,
    
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. ACHIEVEMENT LIBRARY (Learning Outcomes Database)
-- =====================================================
-- Already exists, but let's enhance it
ALTER TABLE IF EXISTS achievements ADD COLUMN IF NOT EXISTS cognitive_level TEXT;
ALTER TABLE IF EXISTS achievements ADD COLUMN IF NOT EXISTS difficulty_estimate TEXT;
ALTER TABLE IF EXISTS achievements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 9. AUDIT LOGS (Track Important Actions)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- "create_exam", "delete_student", etc.
    entity_type TEXT NOT NULL, -- "exam", "student", "class"
    entity_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_student_lists_user ON student_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_student_lists_grade ON student_lists(grade);
CREATE INDEX IF NOT EXISTS idx_students_list ON students(student_list_id);
CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_scores_exam ON exam_scores(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_scores_student ON exam_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Student Lists
ALTER TABLE student_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own student lists" ON student_lists FOR ALL USING (auth.uid() = user_id);

-- Students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD students in own lists" ON students FOR ALL 
    USING (student_list_id IN (SELECT id FROM student_lists WHERE user_id = auth.uid()));

-- Exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own exams" ON exams FOR ALL USING (auth.uid() = user_id);

-- Exam Questions
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD questions in own exams" ON exam_questions FOR ALL 
    USING (exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid()));

-- Exam Scores
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD scores in own exams" ON exam_scores FOR ALL 
    USING (exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid()));

-- Exam Analytics
ALTER TABLE exam_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read analytics for own exams" ON exam_analytics FOR SELECT 
    USING (exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid()));

-- Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_student_lists_updated_at BEFORE UPDATE ON student_lists 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update student count in student_lists
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE student_lists 
    SET total_students = (
        SELECT COUNT(*) FROM students WHERE student_list_id = COALESCE(NEW.student_list_id, OLD.student_list_id)
    )
    WHERE id = COALESCE(NEW.student_list_id, OLD.student_list_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_count_trigger
    AFTER INSERT OR DELETE ON students
    FOR EACH ROW EXECUTE PROCEDURE update_student_count();

-- =====================================================
-- SAMPLE DATA (for development/testing)
-- =====================================================

-- This will be populated by the application
-- We'll keep the existing achievements table data

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Extended user information for teachers and administrators';
COMMENT ON TABLE student_lists IS 'Class groups organized by grade, section, and academic year';
COMMENT ON TABLE students IS 'Individual student records with contact information';
COMMENT ON TABLE exams IS 'Exam metadata including MEB references and status tracking';
COMMENT ON TABLE exam_questions IS 'Questions for each exam with learning outcomes and cognitive levels';
COMMENT ON TABLE exam_scores IS 'Individual student scores for each question';
COMMENT ON TABLE exam_analytics IS 'Cached analysis results for performance optimization';
COMMENT ON TABLE audit_logs IS 'Security and compliance tracking';
