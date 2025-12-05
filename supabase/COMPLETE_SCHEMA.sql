-- =====================================================
-- SINAV ANALİZ UZMANI - COMPLETE DATABASE SCHEMA (RESET & CREATE)
-- DİKKAT: Bu script mevcut tabloları siler ve yeniden oluşturur.
-- Supabase Dashboard > SQL Editor'da çalıştırın
-- =====================================================

-- 1. Önce mevcut tabloları temizle (Cascade ile bağımlılıkları da siler)
DROP TABLE IF EXISTS analysis_history CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS class_progress CASCADE;
DROP TABLE IF EXISTS user_api_keys CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS class_lists CASCADE;

-- =====================================================
-- BÖLÜM 1: KULLANICI VE PROFİL TABLOLARI
-- =====================================================

-- User Profiles (Kullanıcı Profilleri)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    school_name TEXT,
    role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'coordinator')),
    is_admin BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User API Keys (Kullanıcı API Anahtarları)
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Gemini API Key
    gemini_api_key TEXT,
    gemini_api_key_valid BOOLEAN DEFAULT FALSE,
    gemini_last_verified TIMESTAMPTZ,
    
    -- Diğer API Anahtarları (gelecek için)
    openai_api_key TEXT,
    
    -- Kullanım İstatistikleri
    total_ai_requests INTEGER DEFAULT 0,
    last_ai_request TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BÖLÜM 2: ANALİZ GEÇMİŞİ TABLOLARI
-- =====================================================

-- Analysis History (Analiz Geçmişi)
CREATE TABLE analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Metadata
    school_name TEXT,
    teacher_name TEXT,
    class_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    scenario TEXT,
    exam_date DATE,
    term TEXT,
    exam_number TEXT,
    exam_type TEXT,
    academic_year TEXT,
    
    -- Analiz Sonuçları
    class_average DECIMAL(5,2),
    total_students INTEGER,
    total_questions INTEGER,
    
    -- JSON Verileri
    analysis_data JSONB NOT NULL,
    questions_data JSONB NOT NULL,
    students_data JSONB NOT NULL,
    
    -- AI Yorum
    ai_summary TEXT,
    ai_recommendations JSONB,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BÖLÜM 3: GELİŞİM TAKİBİ TABLOLARI
-- =====================================================

-- Student Progress (Öğrenci Gelişim Takibi)
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    student_name TEXT NOT NULL,
    class_name TEXT,
    
    -- İstatistikler
    total_exams INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    worst_score DECIMAL(5,2) DEFAULT 0,
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
    
    -- Geçmiş
    exam_history JSONB DEFAULT '[]'::jsonb,
    outcome_progress JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class Progress (Sınıf Gelişim Takibi)
CREATE TABLE class_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    class_name TEXT NOT NULL,
    grade TEXT,
    subject TEXT,
    
    -- İstatistikler
    total_exams INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    best_average DECIMAL(5,2) DEFAULT 0,
    worst_average DECIMAL(5,2) DEFAULT 0,
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
    
    -- Geçmiş
    exam_history JSONB DEFAULT '[]'::jsonb,
    outcome_progress JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BÖLÜM 4: SINIF LİSTELERİ TABLOLARI
-- =====================================================

-- Class Lists (Sınıf Listeleri)
CREATE TABLE class_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    grade TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    school_name TEXT,
    teacher_name TEXT,
    academic_year TEXT NOT NULL,
    students TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BÖLÜM 5: ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =====================================================

-- Analysis History RLS
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analysis_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analysis_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analysis_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analysis_history
    FOR DELETE USING (auth.uid() = user_id);

-- Student Progress RLS
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own student progress" ON student_progress
    FOR ALL USING (auth.uid() = user_id);

-- Class Progress RLS
ALTER TABLE class_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own class progress" ON class_progress
    FOR ALL USING (auth.uid() = user_id);

-- User API Keys RLS
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON user_api_keys
    FOR ALL USING (auth.uid() = user_id);

-- User Profiles RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Class Lists RLS
ALTER TABLE class_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own class lists" ON class_lists
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- BÖLÜM 6: İNDEKSLER
-- =====================================================

CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_class ON analysis_history(class_name, subject);
CREATE INDEX idx_analysis_history_date ON analysis_history(created_at DESC);
CREATE INDEX idx_student_progress_user ON student_progress(user_id, student_name);
CREATE INDEX idx_class_progress_user ON class_progress(user_id, class_name);
CREATE INDEX idx_class_lists_user ON class_lists(user_id);
CREATE INDEX idx_user_api_keys_user ON user_api_keys(user_id);

-- =====================================================
-- BÖLÜM 7: TRİGGER FONKSİYONLARI
-- =====================================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
DROP TRIGGER IF EXISTS update_analysis_history_updated_at ON analysis_history;
CREATE TRIGGER update_analysis_history_updated_at
    BEFORE UPDATE ON analysis_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_progress_updated_at ON student_progress;
CREATE TRIGGER update_student_progress_updated_at
    BEFORE UPDATE ON student_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_progress_updated_at ON class_progress;
CREATE TRIGGER update_class_progress_updated_at
    BEFORE UPDATE ON class_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_lists_updated_at ON class_lists;
CREATE TRIGGER update_class_lists_updated_at
    BEFORE UPDATE ON class_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- BÖLÜM 8: YENİ KULLANICI KAYDI TRİGGER'I
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- TAMAMLANDI!
-- =====================================================
