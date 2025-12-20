-- =====================================================
-- SINAV ANALİZ UZMANI - COMPLETE DATABASE SCHEMA
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştır
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    school_name TEXT,
    role TEXT DEFAULT 'teacher',
    is_admin BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. STUDENT LISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS student_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT,
    academic_year TEXT NOT NULL,
    subject TEXT,
    school_name TEXT,
    total_students INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. STUDENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_list_id UUID REFERENCES student_lists(id) ON DELETE CASCADE,
    student_number TEXT,
    full_name TEXT NOT NULL,
    gender TEXT,
    date_of_birth DATE,
    contact_email TEXT,
    parent_phone TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. EXAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    student_list_id UUID REFERENCES student_lists(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    exam_date DATE NOT NULL,
    term TEXT NOT NULL,
    exam_number TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    scenario_id TEXT,
    total_points INTEGER,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'draft',
    is_template BOOLEAN DEFAULT false,
    class_average NUMERIC(5,2),
    participation_count INTEGER,
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EXAM QUESTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    outcome_code TEXT,
    outcome_description TEXT,
    question_text TEXT,
    question_image_url TEXT,
    answer_key TEXT,
    difficulty_level TEXT,
    cognitive_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. EXAM SCORES
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    exam_question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL,
    attempted BOOLEAN DEFAULT true,
    time_spent_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. EXAM ANALYTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    class_average NUMERIC(5,2),
    median_score NUMERIC(5,2),
    std_deviation NUMERIC(5,2),
    min_score NUMERIC(5,2),
    max_score NUMERIC(5,2),
    score_distribution JSONB,
    question_stats JSONB,
    outcome_stats JSONB,
    top_performers JSONB,
    struggling_students JSONB,
    ai_summary TEXT,
    recommendations JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. LEGACY TABLES (for backward compatibility)
-- =====================================================
CREATE TABLE IF NOT EXISTS class_lists (
    id BIGSERIAL PRIMARY KEY,
    grade VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    className VARCHAR(50),
    schoolName VARCHAR(200),
    teacherName VARCHAR(100),
    academicYear VARCHAR(20),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    grade VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    source VARCHAR(20) DEFAULT 'custom',
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenarios (
    id BIGSERIAL PRIMARY KEY,
    grade VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    scenarioNumber VARCHAR(10) NOT NULL,
    title VARCHAR(200),
    pdfUrl TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RLS POLICIES - GUEST MODE (Public Access)
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- GUEST MODE: Allow public access for all tables
CREATE POLICY "Allow public read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON user_profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read" ON student_lists FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON student_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON student_lists FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON student_lists FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON students FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON exams FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON exams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON exams FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON exam_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON exam_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON exam_questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON exam_questions FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON exam_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON exam_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON exam_scores FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON exam_scores FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON exam_analytics FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON exam_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON exam_analytics FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON exam_analytics FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON class_lists FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON class_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON class_lists FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON class_lists FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON achievements FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON achievements FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON scenarios FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON scenarios FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================
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

-- =====================================================
-- SAMPLE DATA
-- =====================================================
INSERT INTO achievements (code, description, grade, subject, source) VALUES
    ('E5.1.S1', 'Can introduce themselves and others', '5', 'İngilizce', 'meb'),
    ('E5.1.S2', 'Can ask and answer simple questions about personal information', '5', 'İngilizce', 'meb'),
    ('M5.1.1', 'Doğal sayıları okur, yazar ve çözümler', '5', 'Matematik', 'meb'),
    ('M5.1.2', 'Doğal sayıları karşılaştırır ve sıralar', '5', 'Matematik', 'meb'),
    ('F5.1.1', 'Maddenin tanecikli yapısını açıklar', '5', 'Fen Bilimleri', 'meb'),
    ('F5.1.2', 'Hal değişimlerini açıklar', '5', 'Fen Bilimleri', 'meb')
ON CONFLICT DO NOTHING;

-- =====================================================
-- TAMAMLANDI!
-- =====================================================
