-- =====================================================
-- KALEKAYA ORTAOKULU SINIF LİSTELERİ
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştır
-- =====================================================

-- 8. Sınıf / A Şubesi (6 öğrenci)
INSERT INTO students (student_list_id, student_number, full_name, gender, is_active)
SELECT 
    (SELECT id FROM student_lists WHERE name = '8/A Sınıfı 2024-2025' LIMIT 1),
    student_number,
    full_name,
    gender,
    true
FROM (VALUES 
    ('8', 'AHMET KELLESİBÜYÜK', 'M'),
    ('13', 'HALİME GÜMÜŞ', 'F'),
    ('14', 'HACI MEHMET BİRİCİK', 'M'),
    ('21', 'MELİKE GÜMÜŞ', 'F'),
    ('76', 'AYSEL ŞAHAN', 'F'),
    ('98', 'UĞUR ŞAHAN', 'M')
) AS t(student_number, full_name, gender)
WHERE EXISTS (SELECT 1 FROM student_lists WHERE name = '8/A Sınıfı 2024-2025');

-- 6. Sınıf / A Şubesi (7 öğrenci)  
INSERT INTO students (student_list_id, student_number, full_name, gender, is_active)
SELECT 
    (SELECT id FROM student_lists WHERE name = '6/A Sınıfı 2024-2025' LIMIT 1),
    student_number,
    full_name,
    gender,
    true
FROM (VALUES 
    ('28', 'KEVSER FATMA BİRİCİK', 'F'),
    ('36', 'CENNET ŞAHAN', 'F'),
    ('42', 'HATİCE CANİK', 'F'),
    ('55', 'SUNA KEÇİKIÇLI', 'F'),
    ('60', 'YUNUS ÇOLAK', 'M'),
    ('73', 'MEHMET ŞAHAN', 'M'),
    ('94', 'TAYYİBE ŞAHAN', 'F')
) AS t(student_number, full_name, gender)
WHERE EXISTS (SELECT 1 FROM student_lists WHERE name = '6/A Sınıfı 2024-2025');

-- 7. Sınıf / A Şubesi (15 öğrenci)
INSERT INTO students (student_list_id, student_number, full_name, gender, is_active)
SELECT 
    (SELECT id FROM student_lists WHERE name = '7/A Sınıfı 2024-2025' LIMIT 1),
    student_number,
    full_name,
    gender,
    true
FROM (VALUES 
    ('11', 'GÜL BAHAR POYRAZ', 'F'),
    ('12', 'FERİDE AKSU', 'F'),
    ('43', 'RABİA AKSU', 'F'),
    ('45', 'DÖNDÜ CANİK', 'F'),
    ('46', 'DÖNDÜ ŞAHAN', 'F'),
    ('51', 'ÖMER SAMET ÇAPAR', 'M'),
    ('62', 'AYŞENUR BİRİCİK', 'F'),
    ('68', 'EDA BİRİCİK', 'F'),
    ('71', 'GÜLÜZAR GÜMÜŞ', 'F'),
    ('72', 'HASAN HÜSEYİN ÇAPAR', 'M'),
    ('77', 'BARIŞ BİRİCİK', 'M'),
    ('80', 'BÜNYAMİN ŞAHAN', 'M'),
    ('85', 'EMİNE CANİK', 'F'),
    ('90', 'HÜSNE TÜRK', 'F'),
    ('96', 'MUSA ŞAHAN', 'M')
) AS t(student_number, full_name, gender)
WHERE EXISTS (SELECT 1 FROM student_lists WHERE name = '7/A Sınıfı 2024-2025');

-- 5. Sınıf / A Şubesi (25 öğrenci)
INSERT INTO students (student_list_id, student_number, full_name, gender, is_active)
SELECT 
    (SELECT id FROM student_lists WHERE name = '5/A Sınıfı 2024-2025' LIMIT 1),
    student_number,
    full_name,
    gender,
    true
FROM (VALUES 
    ('9', 'BAYRAM CAN', 'M'),
    ('15', 'AHMET ŞAHAN', 'M'),
    ('16', 'AHMET ŞAHAN', 'M'),
    ('17', 'CAN BERKAN AVCI', 'M'),
    ('18', 'CANSU POYRAZ', 'F'),
    ('19', 'HACI AKSU', 'M'),
    ('20', 'HATİCE TORUN', 'F'),
    ('22', 'DURDU AKSU', 'M'),
    ('23', 'HAVVANUR AVCI', 'F'),
    ('24', 'HÜSEYİN ŞAHAN', 'M'),
    ('26', 'NURİ ÇAĞLAR POYRAZ', 'M'),
    ('27', 'ÖMER BİRİCİK', 'M'),
    ('29', 'RAHİME NUR KELLESİBÜYÜK', 'F'),
    ('30', 'ŞAİT TORUN', 'M'),
    ('32', 'UMUTCAN POYRAZ', 'M'),
    ('33', 'YASİN GÜMÜŞ', 'M'),
    ('34', 'YILMAZ POYRAZ', 'M'),
    ('65', 'BATTAL HACI CANİK', 'M'),
    ('66', 'DEDE CANİK', 'M'),
    ('69', 'ERTUĞRUL CANİK', 'M'),
    ('78', 'MEHMET ŞAHAN', 'M'),
    ('83', 'DURDİYE ŞAHAN', 'F'),
    ('87', 'GAMZE BİRİCİK', 'F'),
    ('89', 'HASAN POYRAZ', 'M'),
    ('92', 'KENAN AKSU', 'M')
) AS t(student_number, full_name, gender)
WHERE EXISTS (SELECT 1 FROM student_lists WHERE name = '5/A Sınıfı 2024-2025');

-- =====================================================
-- RAPOR ŞABLONU TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Varsayılan Şablon',
    template_type TEXT NOT NULL DEFAULT 'sinav_analizi', -- sinav_analizi, sinif_degerlendirmesi
    
    -- Header bilgileri
    school_name TEXT,
    province TEXT DEFAULT 'KAHRAMANMARAŞ',
    district TEXT DEFAULT 'Onikişubat',
    
    -- Rapor ayarları
    include_charts BOOLEAN DEFAULT true,
    include_student_grades BOOLEAN DEFAULT true,
    include_outcome_analysis BOOLEAN DEFAULT true,
    include_recommendations BOOLEAN DEFAULT true,
    
    -- Grafik ayarları
    chart_types JSONB DEFAULT '["bar", "pie"]'::jsonb,
    
    -- Not aralıkları
    grade_ranges JSONB DEFAULT '[
        {"min": 0, "max": 49, "label": "Geçmez", "color": "#ef4444"},
        {"min": 50, "max": 59, "label": "Geçer", "color": "#f97316"},
        {"min": 60, "max": 69, "label": "Orta", "color": "#eab308"},
        {"min": 70, "max": 84, "label": "İyi", "color": "#22c55e"},
        {"min": 85, "max": 100, "label": "Pekiyi", "color": "#3b82f6"}
    ]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for report_templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON report_templates FOR ALL USING (true);

-- =====================================================
-- SINIF LİSTELERİNİ OLUŞTUR
-- =====================================================
INSERT INTO student_lists (user_id, name, grade, section, academic_year, subject, school_name, is_archived)
VALUES 
    (NULL, '5/A Sınıfı 2024-2025', '5', 'A', '2024-2025', 'Tümü', 'Kalekaya Ortaokulu', false),
    (NULL, '6/A Sınıfı 2024-2025', '6', 'A', '2024-2025', 'Tümü', 'Kalekaya Ortaokulu', false),
    (NULL, '7/A Sınıfı 2024-2025', '7', 'A', '2024-2025', 'Tümü', 'Kalekaya Ortaokulu', false),
    (NULL, '8/A Sınıfı 2024-2025', '8', 'A', '2024-2025', 'Tümü', 'Kalekaya Ortaokulu', false)
ON CONFLICT DO NOTHING;
