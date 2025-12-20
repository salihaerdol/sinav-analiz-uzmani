-- =====================================================
-- SINAV ANALİZ UZMANI - YENİ MODÜLLER DATABASE MIGRATION
-- Tarih: 20 Aralık 2025
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MODÜL 1: PSİKOMETRİK ANALİZ
-- =====================================================
CREATE TABLE IF NOT EXISTS psychometric_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL,
    question_id UUID,
    user_id UUID,
    
    -- Klasik Test Teorisi (CTT)
    item_difficulty NUMERIC(5,4),          -- P-değeri (0.00-1.00)
    item_discrimination NUMERIC(5,4),      -- Ayırt edicilik (-1.00 - +1.00)
    point_biserial NUMERIC(5,4),           -- Nokta-biserial korelasyon
    
    -- Item Response Theory (IRT) - 3PL Model
    irt_difficulty NUMERIC(6,4),           -- b parametresi
    irt_discrimination NUMERIC(6,4),       -- a parametresi
    guessing_parameter NUMERIC(5,4),       -- c parametresi
    
    -- Test Güvenilirliği (Exam Level)
    cronbach_alpha NUMERIC(5,4),
    standard_error NUMERIC(5,4),
    
    -- Soru Kalitesi
    quality_rating TEXT CHECK (quality_rating IN ('Mükemmel', 'İyi', 'Orta', 'Zayıf', 'Revize')),
    quality_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(exam_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_psychometric_exam ON psychometric_analysis(exam_id);
CREATE INDEX IF NOT EXISTS idx_psychometric_user ON psychometric_analysis(user_id);

ALTER TABLE psychometric_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "psychometric_public_access" ON psychometric_analysis;
CREATE POLICY "psychometric_public_access" ON psychometric_analysis FOR ALL USING (true);

-- =====================================================
-- MODÜL 2: RİSK ANALİZİ
-- =====================================================
CREATE TABLE IF NOT EXISTS student_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID,
    user_id UUID,
    class_id UUID,
    
    -- Risk Metrikleri
    risk_level TEXT CHECK (risk_level IN ('Düşük', 'Orta', 'Yüksek', 'Kritik')),
    risk_score NUMERIC(5,2),               -- 0-100
    
    -- Faktörler
    performance_trend TEXT CHECK (performance_trend IN ('Yükseliyor', 'Sabit', 'Düşüyor')),
    average_score NUMERIC(5,2),
    consistency_score NUMERIC(5,2),        -- Tutarlılık
    failed_outcomes JSONB DEFAULT '[]',    -- Başarısız kazanımlar
    
    -- AI Önerileri
    ai_recommendations JSONB DEFAULT '[]',
    suggested_interventions JSONB DEFAULT '[]',
    predicted_end_score NUMERIC(5,2),      -- Dönem sonu tahmini
    
    -- Trend Verisi
    score_history JSONB DEFAULT '[]',      -- Son 5 sınav
    
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_student ON student_risk_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON student_risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_user ON student_risk_scores(user_id);

ALTER TABLE student_risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "risk_public_access" ON student_risk_scores;
CREATE POLICY "risk_public_access" ON student_risk_scores FOR ALL USING (true);

-- =====================================================
-- MODÜL 3: BLOOM TAKSONOMİSİ
-- =====================================================
CREATE TABLE IF NOT EXISTS bloom_taxonomy_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID,
    user_id UUID,
    exam_id UUID,
    
    -- Bloom Seviyeleri
    cognitive_level TEXT CHECK (cognitive_level IN (
        'Bilgi',       -- Hatırlama
        'Kavrama',     -- Anlama
        'Uygulama',    -- Uygulama
        'Analiz',      -- Analiz
        'Sentez',      -- Yaratma
        'Değerlendirme' -- Değerlendirme
    )) NOT NULL,
    
    -- Seviye Numarası (sıralama için)
    level_order INTEGER CHECK (level_order BETWEEN 1 AND 6),
    
    -- Ek Bilgiler
    difficulty_level TEXT CHECK (difficulty_level IN ('Kolay', 'Orta', 'Zor')),
    time_estimate_seconds INTEGER,         -- Tahmini çözüm süresi
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bloom_question ON bloom_taxonomy_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_bloom_level ON bloom_taxonomy_tags(cognitive_level);
CREATE INDEX IF NOT EXISTS idx_bloom_exam ON bloom_taxonomy_tags(exam_id);

ALTER TABLE bloom_taxonomy_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bloom_public_access" ON bloom_taxonomy_tags;
CREATE POLICY "bloom_public_access" ON bloom_taxonomy_tags FOR ALL USING (true);

-- =====================================================
-- MODÜL 4: OCR TARAMA
-- =====================================================
CREATE TABLE IF NOT EXISTS ocr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    student_list_id UUID,
    
    -- Dosya Bilgileri
    original_filename TEXT,
    file_url TEXT,                         -- Supabase Storage URL
    file_type TEXT,                        -- image/jpeg, image/png
    
    -- OCR Sonuçları
    raw_text TEXT,                         -- Ham OCR çıktısı
    extracted_data JSONB,                  -- Yapılandırılmış veri
    confidence_score NUMERIC(5,2),         -- OCR güven skoru
    
    -- İşlem Durumu
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')) DEFAULT 'pending',
    error_message TEXT,
    
    -- Kullanıcı Düzeltmeleri
    user_corrections JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ocr_user ON ocr_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_status ON ocr_scans(status);

ALTER TABLE ocr_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ocr_public_access" ON ocr_scans;
CREATE POLICY "ocr_public_access" ON ocr_scans FOR ALL USING (true);

-- =====================================================
-- MODÜL 5: RAPOR ŞABLONLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    
    -- Şablon Bilgileri
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Şablon Tipi
    template_type TEXT CHECK (template_type IN (
        'full_report',
        'student_cards',
        'meb_official',
        'parent_letter',
        'summary',
        'custom'
    )) DEFAULT 'custom',
    
    -- Şablon Layout (JSON)
    layout JSONB NOT NULL DEFAULT '[]',
    
    -- Ayarlar
    settings JSONB DEFAULT '{
        "paperSize": "A4",
        "orientation": "landscape",
        "margins": {"top": 20, "bottom": 20, "left": 15, "right": 15},
        "showHeader": true,
        "showFooter": true,
        "includeSignature": true
    }'::jsonb,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_template_user ON report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_template_type ON report_templates(template_type);

ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "template_public_access" ON report_templates;
CREATE POLICY "template_public_access" ON report_templates FOR ALL USING (true);

-- =====================================================
-- MODÜL 6: ULUSLARARASI BENCHMARK VERİLERİ
-- =====================================================
CREATE TABLE IF NOT EXISTS international_benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Kaynak
    source TEXT CHECK (source IN ('PISA', 'TIMSS', 'PIRLS', 'CUSTOM')),
    year INTEGER,
    
    -- Konu ve Seviye
    subject TEXT,
    grade TEXT,
    
    -- Benchmark Değerleri
    oecd_average NUMERIC(6,2),
    turkey_average NUMERIC(6,2),
    
    -- Yeterlik Seviyeleri
    proficiency_levels JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan PISA 2022 Verileri
INSERT INTO international_benchmarks (source, year, subject, grade, oecd_average, turkey_average, proficiency_levels)
VALUES 
('PISA', 2022, 'Matematik', '8', 472, 453, '[
  {"level": 6, "name": "İleri", "min_score": 669, "description": "Karmaşık matematiksel modelleme"},
  {"level": 5, "name": "Yüksek", "min_score": 607, "description": "Çoklu adımlı problem çözme"},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 545, "description": "Açık model kullanımı"},
  {"level": 3, "name": "Orta", "min_score": 482, "description": "Temel prosedürleri uygulama"},
  {"level": 2, "name": "Temel", "min_score": 420, "description": "Basit bağlamlarda temel beceriler"},
  {"level": 1, "name": "Düşük", "min_score": 358, "description": "Sınırlı matematiksel beceriler"}
]'::jsonb),
('PISA', 2022, 'Fen Bilimleri', '8', 485, 476, '[
  {"level": 6, "name": "İleri", "min_score": 708},
  {"level": 5, "name": "Yüksek", "min_score": 633},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 559},
  {"level": 3, "name": "Orta", "min_score": 484},
  {"level": 2, "name": "Temel", "min_score": 410},
  {"level": 1, "name": "Düşük", "min_score": 335}
]'::jsonb),
('PISA', 2022, 'Okuma', '8', 476, 456, '[
  {"level": 6, "name": "İleri", "min_score": 698},
  {"level": 5, "name": "Yüksek", "min_score": 626},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 553},
  {"level": 3, "name": "Orta", "min_score": 480},
  {"level": 2, "name": "Temel", "min_score": 407},
  {"level": 1, "name": "Düşük", "min_score": 335}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TRIGGER: updated_at otomatik güncelleme
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
DROP TRIGGER IF EXISTS update_psychometric_updated_at ON psychometric_analysis;
CREATE TRIGGER update_psychometric_updated_at 
    BEFORE UPDATE ON psychometric_analysis 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_updated_at ON student_risk_scores;
CREATE TRIGGER update_risk_updated_at 
    BEFORE UPDATE ON student_risk_scores 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_template_updated_at ON report_templates;
CREATE TRIGGER update_template_updated_at 
    BEFORE UPDATE ON report_templates 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- TAMAMLANDI!
-- =====================================================
