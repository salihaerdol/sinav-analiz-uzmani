# 📚 SINAV ANALİZ UZMANI - MODÜLER GELİŞTİRME PLANI

**Versiyon:** 3.0  
**Tarih:** 20 Aralık 2025  
**Yaklaşım:** Mevcut sistemi bozmadan, modüler yapıda yeni özellikler ekleme

---

## 🏗️ MİMARİ YAKLAŞIM

### Temel Prensip: MEVCUT SİSTEM KORUNACAK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SINAV ANALİZ UZMANI v2                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    MEVCUT SİSTEM (DOKUNULMAYACAK)                   │   │
│   │  ├── App.tsx (Ana uygulama)                                        │   │
│   │  ├── components/AnalysisView.tsx                                   │   │
│   │  ├── components/ProgressDashboard.tsx                              │   │
│   │  ├── services/exportServiceAdvanced.ts                             │   │
│   │  ├── services/supabase.ts                                          │   │
│   │  └── ...diğer mevcut dosyalar                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         YENİ MODÜLLER                               │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │ MODÜL 1     │  │ MODÜL 2     │  │ MODÜL 3     │                 │   │
│   │  │ Psikometrik │  │ Risk Analiz │  │ Bloom       │                 │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │  │ MODÜL 4     │  │ MODÜL 5     │  │ MODÜL 6     │                 │   │
│   │  │ OCR Tarama  │  │ Rapor Edit. │  │ MEB Form    │                 │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 GOOGLE AUTH (SUPABASE)

### Mevcut Durum
✅ Google OAuth Supabase üzerinden yapılandırılmış

### Auth Akışı
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Kullanıcı  │────▶│  Google OAuth│────▶│   Supabase   │
│   Giriş Yap  │     │   Popup      │     │   Auth       │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ user_profiles│
                                          │   tablosu    │
                                          └──────────────┘
```

### Mevcut Auth Kodu (context/AuthContext.tsx)
```typescript
// Mevcut - DEĞİŞTİRME
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🗄️ VERİTABANI TASARIMI

### Mevcut Tablolar (DOKUNULMAYACAK)
- `user_profiles`
- `student_lists`
- `students`
- `exams`
- `exam_questions`
- `exam_scores`
- `exam_analytics`
- `class_lists` (legacy)
- `achievements`
- `scenarios`

### YENİ TABLOLAR

#### 1. Psikometrik Analiz Tablosu
```sql
-- =====================================================
-- MODÜL 1: PSİKOMETRİK ANALİZ
-- =====================================================
CREATE TABLE IF NOT EXISTS psychometric_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
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

-- Index
CREATE INDEX idx_psychometric_exam ON psychometric_analysis(exam_id);
CREATE INDEX idx_psychometric_user ON psychometric_analysis(user_id);

-- RLS
ALTER TABLE psychometric_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own psychometric data" ON psychometric_analysis
    FOR ALL USING (auth.uid() = user_id);
```

#### 2. Öğrenci Risk Skoru Tablosu
```sql
-- =====================================================
-- MODÜL 2: RİSK ANALİZİ
-- =====================================================
CREATE TABLE IF NOT EXISTS student_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
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

-- Index
CREATE INDEX idx_risk_student ON student_risk_scores(student_id);
CREATE INDEX idx_risk_level ON student_risk_scores(risk_level);
CREATE INDEX idx_risk_user ON student_risk_scores(user_id);

-- RLS
ALTER TABLE student_risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own risk data" ON student_risk_scores
    FOR ALL USING (auth.uid() = user_id);
```

#### 3. Bloom Taksonomisi Etiketleri
```sql
-- =====================================================
-- MODÜL 3: BLOOM TAKSONOMİSİ
-- =====================================================
CREATE TABLE IF NOT EXISTS bloom_taxonomy_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(question_id)
);

-- Index
CREATE INDEX idx_bloom_question ON bloom_taxonomy_tags(question_id);
CREATE INDEX idx_bloom_level ON bloom_taxonomy_tags(cognitive_level);

-- RLS
ALTER TABLE bloom_taxonomy_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own bloom tags" ON bloom_taxonomy_tags
    FOR ALL USING (auth.uid() = user_id);
```

#### 4. OCR Tarama Kayıtları
```sql
-- =====================================================
-- MODÜL 4: OCR TARAMA
-- =====================================================
CREATE TABLE IF NOT EXISTS ocr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    student_list_id UUID REFERENCES student_lists(id) ON DELETE SET NULL,
    
    -- Dosya Bilgileri
    original_filename TEXT,
    file_url TEXT,                         -- Supabase Storage URL
    file_type TEXT,                        -- image/jpeg, image/png, application/pdf
    
    -- OCR Sonuçları
    raw_text TEXT,                         -- Ham OCR çıktısı
    extracted_data JSONB,                  -- Yapılandırılmış veri
    confidence_score NUMERIC(5,2),         -- OCR güven skoru
    
    -- İşlem Durumu
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')),
    error_message TEXT,
    
    -- Kullanıcı Düzeltmeleri
    user_corrections JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_ocr_user ON ocr_scans(user_id);
CREATE INDEX idx_ocr_status ON ocr_scans(status);

-- RLS
ALTER TABLE ocr_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own OCR scans" ON ocr_scans
    FOR ALL USING (auth.uid() = user_id);
```

#### 5. Rapor Şablonları
```sql
-- =====================================================
-- MODÜL 5: RAPOR ŞABLONLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Şablon Bilgileri
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,       -- Diğer kullanıcılarla paylaşım
    
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
    /*
    layout örnek:
    [
      {"type": "header", "position": {"x": 0, "y": 0}, "size": {"w": 12, "h": 1}},
      {"type": "bar_chart", "position": {"x": 0, "y": 1}, "size": {"w": 6, "h": 3}},
      {"type": "student_table", "position": {"x": 6, "y": 1}, "size": {"w": 6, "h": 5}}
    ]
    */
    
    -- Ayarlar
    settings JSONB DEFAULT '{}'::jsonb,
    /*
    settings örnek:
    {
      "paperSize": "A4",
      "orientation": "landscape",
      "margins": {"top": 20, "bottom": 20, "left": 15, "right": 15},
      "showHeader": true,
      "showFooter": true,
      "includeSignature": true
    }
    */
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

-- Index
CREATE INDEX idx_template_user ON report_templates(user_id);
CREATE INDEX idx_template_type ON report_templates(template_type);
CREATE INDEX idx_template_public ON report_templates(is_public) WHERE is_public = TRUE;

-- RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own templates" ON report_templates
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read public templates" ON report_templates
    FOR SELECT USING (is_public = TRUE);
```

#### 6. Uluslararası Benchmark Verileri
```sql
-- =====================================================
-- MODÜL 6: ULUSLARARASI BENCHMARK
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
    /*
    [
      {"level": 6, "name": "İleri", "min_score": 698, "description": "..."},
      {"level": 5, "name": "Yüksek", "min_score": 626, "description": "..."},
      ...
    ]
    */
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan PISA Verileri
INSERT INTO international_benchmarks (source, year, subject, grade, oecd_average, turkey_average, proficiency_levels)
VALUES 
('PISA', 2022, 'Matematik', '8', 472, 453, '[
  {"level": 6, "name": "İleri", "min_score": 669},
  {"level": 5, "name": "Yüksek", "min_score": 607},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 545},
  {"level": 3, "name": "Orta", "min_score": 482},
  {"level": 2, "name": "Temel", "min_score": 420},
  {"level": 1, "name": "Düşük", "min_score": 358}
]'),
('PISA', 2022, 'Fen Bilimleri', '8', 485, 476, '[
  {"level": 6, "name": "İleri", "min_score": 708},
  {"level": 5, "name": "Yüksek", "min_score": 633},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 559},
  {"level": 3, "name": "Orta", "min_score": 484},
  {"level": 2, "name": "Temel", "min_score": 410},
  {"level": 1, "name": "Düşük", "min_score": 335}
]'),
('PISA', 2022, 'Okuma', '8', 476, 456, '[
  {"level": 6, "name": "İleri", "min_score": 698},
  {"level": 5, "name": "Yüksek", "min_score": 626},
  {"level": 4, "name": "Orta-Yüksek", "min_score": 553},
  {"level": 3, "name": "Orta", "min_score": 480},
  {"level": 2, "name": "Temel", "min_score": 407},
  {"level": 1, "name": "Düşük", "min_score": 335}
]');
```

---

## 📂 DOSYA YAPISI (YENİ MODÜLLER)

```
src/
├── App.tsx                          # MEVCUT - DEĞİŞMEZ
├── types.ts                         # MEVCUT - Genişletilecek
├── context/
│   └── AuthContext.tsx              # MEVCUT - DEĞİŞMEZ
│
├── components/                       # MEVCUT KLASÖR
│   ├── AnalysisView.tsx             # MEVCUT - DEĞİŞMEZ
│   ├── Login.tsx                    # MEVCUT - DEĞİŞMEZ
│   └── ...                          # Diğer mevcut componentler
│
├── modules/                          # 🆕 YENİ MODÜL KLASÖRÜ
│   │
│   ├── psychometric/                 # MODÜL 1
│   │   ├── PsychometricAnalysis.tsx
│   │   ├── PsychometricCard.tsx
│   │   ├── ItemQualityTable.tsx
│   │   ├── psychometricService.ts
│   │   ├── psychometricCalculations.ts
│   │   └── types.ts
│   │
│   ├── risk-analysis/                # MODÜL 2
│   │   ├── RiskDashboard.tsx
│   │   ├── RiskScoreCard.tsx
│   │   ├── RiskAlertBanner.tsx
│   │   ├── PredictionChart.tsx
│   │   ├── riskService.ts
│   │   ├── riskCalculations.ts
│   │   └── types.ts
│   │
│   ├── bloom-taxonomy/               # MODÜL 3
│   │   ├── BloomAnalysis.tsx
│   │   ├── BloomPyramid.tsx
│   │   ├── CognitiveLevelChart.tsx
│   │   ├── bloomService.ts
│   │   └── types.ts
│   │
│   ├── ocr-scanner/                  # MODÜL 4
│   │   ├── OCRScanner.tsx
│   │   ├── ImagePreview.tsx
│   │   ├── TableExtractor.tsx
│   │   ├── CorrectionEditor.tsx
│   │   ├── ocrService.ts            # Gemini Vision API
│   │   └── types.ts
│   │
│   ├── report-editor/                # MODÜL 5
│   │   ├── ReportEditor.tsx
│   │   ├── ComponentPalette.tsx
│   │   ├── DraggableComponent.tsx
│   │   ├── ReportCanvas.tsx
│   │   ├── TemplateManager.tsx
│   │   ├── reportService.ts
│   │   └── types.ts
│   │
│   ├── meb-official/                 # MODÜL 6
│   │   ├── MEBOfficialForm.tsx
│   │   ├── OfficialFormPreview.tsx
│   │   ├── mebExportService.ts
│   │   └── types.ts
│   │
│   └── internationalization/         # MODÜL 7
│       ├── BenchmarkComparison.tsx
│       ├── PISAChart.tsx
│       ├── LanguageSelector.tsx
│       ├── i18n.ts
│       ├── translations/
│       │   ├── tr.json
│       │   ├── en.json
│       │   └── de.json
│       └── types.ts
│
├── services/                         # MEVCUT KLASÖR
│   ├── supabase.ts                  # MEVCUT - DEĞİŞMEZ
│   ├── exportServiceAdvanced.ts     # MEVCUT - DEĞİŞMEZ
│   └── ...                          # Diğer mevcut servisler
│
└── hooks/                            # 🆕 YENİ HOOKS
    ├── usePsychometric.ts
    ├── useRiskAnalysis.ts
    ├── useBloomTaxonomy.ts
    ├── useOCR.ts
    └── useReportTemplate.ts
```

---

## 🔌 BACKEND API TASARIMI

### API Endpoint Yapısı

```
/api/v1/
│
├── /auth/                           # Auth (Supabase handles)
│   ├── POST /login
│   ├── POST /logout
│   └── GET  /me
│
├── /psychometric/                    # MODÜL 1
│   ├── POST   /analyze/{exam_id}    # Analiz hesapla
│   ├── GET    /results/{exam_id}    # Sonuçları getir
│   └── GET    /question/{id}        # Soru detayı
│
├── /risk/                            # MODÜL 2
│   ├── POST   /calculate/{class_id} # Risk hesapla
│   ├── GET    /students/{class_id}  # Sınıf risk listesi
│   ├── GET    /student/{id}         # Öğrenci risk detayı
│   └── GET    /alerts               # Kritik uyarılar
│
├── /bloom/                           # MODÜL 3
│   ├── POST   /tag/{question_id}    # Soru etiketle
│   ├── GET    /analysis/{exam_id}   # Sınav dağılımı
│   └── PUT    /tag/{id}             # Etiket güncelle
│
├── /ocr/                             # MODÜL 4
│   ├── POST   /scan                 # Resim yükle ve tara
│   ├── GET    /status/{id}          # İşlem durumu
│   ├── PUT    /verify/{id}          # Düzeltmeleri onayla
│   └── POST   /import/{id}          # Sınıfa aktar
│
├── /templates/                       # MODÜL 5
│   ├── GET    /                     # Şablonları listele
│   ├── POST   /                     # Yeni şablon
│   ├── PUT    /{id}                 # Şablon güncelle
│   ├── DELETE /{id}                 # Şablon sil
│   └── GET    /public               # Herkese açık şablonlar
│
├── /export/                          # MODÜL 6
│   ├── POST   /meb-official         # MEB resmi form
│   ├── POST   /custom/{template_id} # Özel şablon export
│   └── POST   /bulk                 # Toplu export
│
└── /benchmark/                       # MODÜL 7
    ├── GET    /pisa                 # PISA verileri
    ├── GET    /timss                # TIMSS verileri
    └── GET    /compare/{exam_id}    # Karşılaştırma
```

### Supabase Edge Functions (Opsiyonel)

```typescript
// supabase/functions/calculate-psychometric/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { exam_id } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Psikometrik hesaplamalar
  const results = await calculatePsychometrics(exam_id, supabase)
  
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 📋 YENİ TYPE TANIMLARI

```typescript
// types.ts - EKLENECEK (mevcut tipler korunacak)

// ==================== MODÜL 1: PSİKOMETRİK ====================
export interface PsychometricResult {
  questionId: string;
  itemDifficulty: number;
  itemDiscrimination: number;
  pointBiserial: number;
  irtDifficulty?: number;
  irtDiscrimination?: number;
  guessingParameter?: number;
  qualityRating: 'Mükemmel' | 'İyi' | 'Orta' | 'Zayıf' | 'Revize';
}

export interface TestReliability {
  cronbachAlpha: number;
  standardError: number;
  splitHalfReliability?: number;
  isReliable: boolean; // alpha > 0.70
}

// ==================== MODÜL 2: RİSK ANALİZİ ====================
export interface StudentRisk {
  studentId: string;
  studentName: string;
  riskLevel: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik';
  riskScore: number;
  performanceTrend: 'Yükseliyor' | 'Sabit' | 'Düşüyor';
  averageScore: number;
  failedOutcomes: string[];
  recommendations: string[];
  predictedEndScore: number;
  scoreHistory: { date: string; score: number }[];
}

// ==================== MODÜL 3: BLOOM TAKSONOMİSİ ====================
export interface BloomTag {
  questionId: string;
  cognitiveLevel: 'Bilgi' | 'Kavrama' | 'Uygulama' | 'Analiz' | 'Sentez' | 'Değerlendirme';
  levelOrder: 1 | 2 | 3 | 4 | 5 | 6;
  difficultyLevel?: 'Kolay' | 'Orta' | 'Zor';
}

export interface BloomDistribution {
  level: string;
  count: number;
  percentage: number;
  successRate: number;
}

// ==================== MODÜL 4: OCR ====================
export interface OCRScanResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
  extractedData: {
    students: Array<{
      rowNumber: number;
      studentNumber?: string;
      firstName: string;
      lastName: string;
      confidence: number;
    }>;
  };
  confidenceScore: number;
  needsCorrection: boolean;
}

// ==================== MODÜL 5: RAPOR ŞABLONU ====================
export interface ReportTemplate {
  id: string;
  name: string;
  templateType: 'full_report' | 'student_cards' | 'meb_official' | 'parent_letter' | 'summary' | 'custom';
  layout: ReportComponent[];
  settings: ReportSettings;
  isDefault: boolean;
  isPublic: boolean;
}

export interface ReportComponent {
  id: string;
  type: 'header' | 'bar_chart' | 'pie_chart' | 'line_chart' | 'student_table' | 
        'outcome_table' | 'psychometric_table' | 'risk_card' | 'ai_comment' | 
        'free_text' | 'signature' | 'grade_distribution';
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings?: Record<string, any>;
}

export interface ReportSettings {
  paperSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; bottom: number; left: number; right: number };
  showHeader: boolean;
  showFooter: boolean;
  includeSignature: boolean;
}

// ==================== MODÜL 6: BENCHMARK ====================
export interface BenchmarkComparison {
  source: 'PISA' | 'TIMSS';
  year: number;
  subject: string;
  oecdAverage: number;
  turkeyAverage: number;
  classAverage: number;
  comparisonText: string;
  proficiencyDistribution: {
    level: number;
    name: string;
    percentage: number;
  }[];
}
```

---

## 🎯 MODÜL ENTEGRASYON NOKTASI

### AnalysisView.tsx'e Modül Ekleme

```tsx
// components/AnalysisView.tsx - SADECE YENİ TABlAR EKLEME

// Mevcut importlar korunacak...

// Yeni modül importları
import { PsychometricAnalysis } from '../modules/psychometric/PsychometricAnalysis';
import { RiskDashboard } from '../modules/risk-analysis/RiskDashboard';
import { BloomAnalysis } from '../modules/bloom-taxonomy/BloomAnalysis';

// Mevcut tab state'e yeni tablar ekle
const [activeTab, setActiveTab] = useState<
  'overview' | 'questions' | 'students' | 'outcomes' | 'export' |
  'psychometric' | 'risk' | 'bloom'  // 🆕 Yeni tablar
>('overview');

// Render kısmında yeni tabları ekle
{activeTab === 'psychometric' && (
  <PsychometricAnalysis 
    examId={examId}
    questions={questions}
    students={students}
  />
)}

{activeTab === 'risk' && (
  <RiskDashboard 
    classId={classId}
    students={students}
  />
)}

{activeTab === 'bloom' && (
  <BloomAnalysis 
    examId={examId}
    questions={questions}
  />
)}
```

---

## 📅 UYGULAMA TAKVİMİ

```
HAFTA 1: Hazırlık
├── [ ] Database migration dosyası oluştur
├── [ ] Yeni SQL tabloları Supabase'e uygula
├── [ ] modules/ klasör yapısını oluştur
└── [ ] Yeni type tanımlarını ekle

HAFTA 2: MODÜL 1 - Psikometrik Analiz
├── [ ] psychometricCalculations.ts
├── [ ] psychometricService.ts
├── [ ] PsychometricAnalysis.tsx
├── [ ] ItemQualityTable.tsx
└── [ ] Test et

HAFTA 3: MODÜL 2 - Risk Analizi
├── [ ] riskCalculations.ts
├── [ ] riskService.ts
├── [ ] RiskDashboard.tsx
├── [ ] PredictionChart.tsx
└── [ ] Test et

HAFTA 4: MODÜL 3 & 4 - Bloom + OCR
├── [ ] Bloom komponetleri
├── [ ] OCR tarama (Gemini Vision)
└── [ ] Test et

HAFTA 5: MODÜL 5 - Rapor Editörü
├── [ ] react-dnd entegrasyonu
├── [ ] Bileşen paleti
├── [ ] Şablon kaydetme
└── [ ] Test et

HAFTA 6: MODÜL 6 - MEB Resmi Form
├── [ ] Yatay A4 format
├── [ ] Kullanıcı örneğine uyumlu layout
└── [ ] Export test
```

---

## ✅ BAŞLANGIÇ ADIMLARI

1. **Database Migration** - Yeni tabloları Supabase'e uygula
2. **Klasör Yapısı** - `modules/` klasörünü oluştur
3. **MODÜL 1** ile başla - Psikometrik Analiz

**Hangisiyle başlayalım?**

---

**Hazırlayan:** AI Asistan  
**Tarih:** 20 Aralık 2025  
**Yaklaşım:** Mevcut sistemi koruyarak modüler geliştirme
