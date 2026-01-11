# 🌍 ULUSLARARASI STANDARTLAR VE KIYASLAMA

> **Son Güncelleme:** 2026-01-11  
> **Kapsam:** PISA, TIMSS, Bloom Taksonomisi, IRT

---

## 📊 PISA (Programme for International Student Assessment)

### Genel Bilgi
| Özellik | Değer |
|---------|-------|
| **Düzenleyen** | OECD |
| **Sıklık** | 3 yılda bir |
| **Hedef Yaş** | 15 yaş |
| **Alanlar** | Matematik, Okuma, Fen |
| **Puanlama** | Ortalama 500, StdDev 100 |

### Türkiye PISA 2022 Sonuçları

| Alan | Türkiye | OECD Ort. | Fark | Trend |
|------|---------|-----------|------|-------|
| **Matematik** | 453 | 472 | -19 | ↑ Yükseliyor |
| **Okuma** | 456 | 476 | -20 | → Stabil |
| **Fen** | 476 | 485 | -9 | ↑ Yükseliyor |

### PISA Yeterlilik Seviyeleri

#### Matematik
| Seviye | Puan Aralığı | Açıklama |
|--------|--------------|----------|
| 6 | 669+ | İleri düşünme, genelleme |
| 5 | 607-668 | Karmaşık problem çözme |
| 4 | 545-606 | Çoklu adım işlemler |
| 3 | 482-544 | Prosedürleri uygulama |
| 2 | 420-481 | Temel yorumlama |
| 1 | 358-419 | Basit hesaplama |
| <1 | <358 | Yeterlilik altı |

**Türkiye Dağılımı (Matematik 2022):**
- Level 2+ (Temel yeterlilik): %61 (OECD: %69)
- Level 5-6 (Üst performans): %5 (OECD: %9)
- Level 1 altı: %17 (OECD: %13)

### Sistemimize Entegrasyon

```typescript
// PISA seviye hesaplama
function calculatePISALevel(score: number, area: 'math' | 'reading' | 'science'): number {
  // Normalized score (0-100 → PISA scale)
  const pisaScore = 300 + (score / 100) * 400; // 300-700 range
  
  if (pisaScore >= 669) return 6;
  if (pisaScore >= 607) return 5;
  if (pisaScore >= 545) return 4;
  if (pisaScore >= 482) return 3;
  if (pisaScore >= 420) return 2;
  if (pisaScore >= 358) return 1;
  return 0;
}

// PISA yetkinlik yorumu
function getPISAInterpretation(level: number, area: string): string {
  const interpretations = {
    math: {
      6: "Matematiksel düşünme ve genelleme yapabilir",
      5: "Karmaşık problemleri modelleyebilir",
      4: "Çok adımlı işlemleri yürütebilir",
      3: "Açık prosedürleri uygulayabilir",
      2: "Basit yorumlamalar yapabilir",
      1: "Temel hesaplamaları yapabilir",
      0: "Temel matematik becerilerini geliştirmeli"
    }
    // ... reading, science
  };
  return interpretations[area][level];
}
```

---

## 📈 TIMSS (Trends in International Mathematics and Science Study)

### Genel Bilgi
| Özellik | Değer |
|---------|-------|
| **Düzenleyen** | IEA (Boston College) |
| **Sıklık** | 4 yılda bir |
| **Hedef Sınıflar** | 4. sınıf, 8. sınıf |
| **Alanlar** | Matematik, Fen |
| **Puanlama** | Ortalama 500, StdDev 100 |

### Türkiye TIMSS 2023 Sonuçları

| Sınıf | Alan | Türkiye | Uluslararası | Dünya Sırası |
|-------|------|---------|--------------|--------------|
| 4. | Matematik | 553 | 500 | 8. |
| 4. | Fen | 570 | 500 | 4. |
| 8. | Matematik | 509 | 500 | 13. |
| 8. | Fen | 530 | 500 | 7. |

### TIMSS Benchmark Seviyeleri

| Benchmark | Puan | 4. Sınıf Mat % | 8. Sınıf Mat % |
|-----------|------|----------------|----------------|
| Advanced | 625+ | 24% | 8% |
| High | 550 | 58% | 32% |
| Intermediate | 475 | 82% | 60% |
| Low | 400 | 95% | 82% |

### Sistemimize Entegrasyon

```typescript
// TIMSS benchmark hesaplama
function calculateTIMSSBenchmark(score: number): 'Advanced' | 'High' | 'Intermediate' | 'Low' | 'Below' {
  const timssScore = 400 + (score / 100) * 250; // 400-650 range
  
  if (timssScore >= 625) return 'Advanced';
  if (timssScore >= 550) return 'High';
  if (timssScore >= 475) return 'Intermediate';
  if (timssScore >= 400) return 'Low';
  return 'Below';
}

interface TIMSSComparison {
  studentScore: number;
  timssEquivalent: number;
  benchmark: string;
  turkeyPercentile: number;
  globalPercentile: number;
}
```

---

## 🧠 BLOOM TAKSONOMİSİ (Revize)

### Bilişsel Seviyeler (Anderson & Krathwohl, 2001)

| Seviye | Türkçe | İngilizce | Anahtar Fiiller |
|--------|--------|-----------|-----------------|
| 1 | **Hatırlama** | Remember | tanımla, listele, adlandır, hatırla, bul |
| 2 | **Anlama** | Understand | açıkla, özetle, yorumla, karşılaştır, sınıfla |
| 3 | **Uygulama** | Apply | uygula, çöz, hesapla, kullan, göster, bul |
| 4 | **Analiz** | Analyze | analiz et, çözümle, ayır, incele, ilişkilendir |
| 5 | **Değerlendirme** | Evaluate | değerlendir, eleştir, savun, seç, karar ver |
| 6 | **Yaratma** | Create | tasarla, oluştur, planla, geliştir, yaz, model |

### MEB Kazanım Kodu - Bloom Eşleştirme

```typescript
// MEB kazanım kodu formatı: [Branş].[Sınıf].[Ünite].[Kazanım]
// Örnek: M.5.1.1.1, F.6.3.2.1

const outcomeToBloomMapping: Record<string, BloomLevel> = {
  // Matematik örnek eşleştirmeler
  'tanımlar': 'Hatırlama',
  'açıklar': 'Anlama',
  'hesaplar': 'Uygulama',
  'çözer': 'Uygulama',
  'analiz eder': 'Analiz',
  'değerlendirir': 'Değerlendirme',
  'oluşturur': 'Yaratma',
  'tasarlar': 'Yaratma'
};

function inferBloomFromOutcome(outcomeDescription: string): BloomLevel {
  const normalized = outcomeDescription.toLowerCase();
  
  for (const [keyword, level] of Object.entries(outcomeToBloomMapping)) {
    if (normalized.includes(keyword)) {
      return level;
    }
  }
  
  // Default: Anlama
  return 'Anlama';
}
```

### Bloom Seviyesi Dağılım Önerisi (MEB Kılavuzu)

| Seviye | Minimum % | Önerilen % | Maksimum % |
|--------|-----------|------------|------------|
| Hatırlama | 10% | 15% | 25% |
| Anlama | 15% | 25% | 35% |
| Uygulama | 25% | 35% | 45% |
| Analiz | 10% | 15% | 25% |
| Değerlendirme | 5% | 5% | 10% |
| Yaratma | 0% | 5% | 10% |

---

## 📐 MADDE YANIT KURAMI (IRT - Item Response Theory)

### Temel Kavramlar

#### 1-Parametreli Model (Rasch)
Sadece güçlük parametresi (b):
```
P(θ) = 1 / (1 + e^-(θ-b))
```

#### 2-Parametreli Model (2PL)
Güçlük (b) ve ayırt edicilik (a):
```
P(θ) = 1 / (1 + e^(-a(θ-b)))
```

#### 3-Parametreli Model (3PL)
Güçlük (b), ayırt edicilik (a) ve şans (c):
```
P(θ) = c + (1-c) / (1 + e^(-a(θ-b)))
```

### Parametre Yorumlama

#### Güçlük (b - Difficulty)
| Değer | Yorumlama | Başarı Oranı |
|-------|-----------|--------------|
| b < -2 | Çok Kolay | >90% |
| -2 ≤ b < -1 | Kolay | 80-90% |
| -1 ≤ b < 0 | Kolay-Orta | 70-80% |
| 0 ≤ b < 1 | Orta-Zor | 30-70% |
| 1 ≤ b < 2 | Zor | 20-30% |
| b ≥ 2 | Çok Zor | <20% |

#### Ayırt Edicilik (a - Discrimination)
| Değer | Yorumlama |
|-------|-----------|
| a < 0.5 | Düşük (sorun var) |
| 0.5 ≤ a < 1.0 | Kabul edilebilir |
| 1.0 ≤ a < 1.5 | İyi |
| 1.5 ≤ a < 2.0 | Çok iyi |
| a ≥ 2.0 | Mükemmel |

### Basitleştirilmiş IRT Hesaplama (Klasik Test Teorisi Yaklaşımı)

```typescript
interface IRTParameters {
  difficulty: number;       // -3 to +3
  discrimination: number;   // 0 to 3
  guessing?: number;        // 0 to 0.5
}

// Klasik test teorisinden IRT tahmini
function estimateIRTFromCTT(
  successRate: number,        // 0-1
  pointBiserial: number,      // korelasyon
  answerChoices: number = 4   // seçenek sayısı
): IRTParameters {
  // Güçlük: başarı oranından
  // b = Φ⁻¹(1 - p) yaklaşımı
  const difficulty = -Math.log(successRate / (1 - successRate));
  
  // Ayırt edicilik: point-biserial korelasyondan
  const discrimination = pointBiserial * 2.5;
  
  // Şans: 1/seçenek sayısı
  const guessing = 1 / answerChoices;
  
  return {
    difficulty: Math.max(-3, Math.min(3, difficulty)),
    discrimination: Math.max(0, Math.min(3, discrimination)),
    guessing
  };
}

// Madde kalitesi değerlendirme
function evaluateItemQuality(params: IRTParameters): string {
  if (params.discrimination < 0.5) {
    return 'Zayıf - Revize edilmeli';
  }
  if (params.discrimination < 1.0) {
    return 'Kabul edilebilir';
  }
  if (params.discrimination < 1.5) {
    return 'İyi';
  }
  return 'Mükemmel';
}
```

---

## 🔄 KARŞILAŞTIRMA RAPORU ŞABLONU

### Okul vs Ulusal Kıyaslama

```
┌─────────────────────────────────────────────────────────┐
│ 📊 ULUSAL KIYASLAMA RAPORU                              │
│ Örnek Ortaokulu | 5. Sınıf Matematik | 2. Dönem        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PUAN KARŞILAŞTIRMASI                                   │
│  ────────────────────────────────────────────────────   │
│                                                         │
│  Okul Ortalaması:    72.5 / 100                        │
│  Türkiye Ortalaması: 68.3 / 100  (TIMSS 2023)          │
│  OECD Ortalaması:    ~65 / 100   (PISA dönüşüm)        │
│                                                         │
│  Konumunuz: 🟢 Türkiye ortalamasının ÜSTÜNDE (+4.2)    │
│                                                         │
│  BİLİŞSEL DÜZEY KARŞILAŞTIRMASI                        │
│  ────────────────────────────────────────────────────   │
│                                                         │
│  Düzey       Okul    Türkiye   OECD    Durum           │
│  ─────────────────────────────────────────────         │
│  Hatırlama   85%     80%       75%     ✅ GÜÇLÜ        │
│  Anlama      78%     72%       70%     ✅ GÜÇLÜ        │
│  Uygulama    72%     65%       68%     ✅ GÜÇLÜ        │
│  Analiz      58%     48%       55%     ⚠️ GELİŞTİR    │
│  Değerlend.  45%     38%       42%     ⚠️ GELİŞTİR    │
│  Yaratma     35%     28%       35%     → NORMAL        │
│                                                         │
│  ÖNERİLER                                               │
│  ────────────────────────────────────────────────────   │
│  1. Analiz düzeyinde soru sayısını artırın             │
│  2. PISA tarzı açık uçlu sorular ekleyin               │
│  3. Gerçek yaşam problem senaryoları kullanın          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 VERİ KAYNAKLARI

### PISA
- [OECD PISA 2022 Results](https://www.oecd.org/pisa/)
- [Turkey Country Note](https://www.oecd.org/publication/pisa-2022-results/)

### TIMSS
- [IEA TIMSS 2023](https://timss2023.org/)
- [TIMSS 2019 Turkey Report](https://www.worldbank.org/)

### Bloom Taksonomisi
- Anderson, L.W., & Krathwohl, D.R. (2001). A Taxonomy for Learning, Teaching, and Assessing
- MEB Ölçme Değerlendirme Genel Müdürlüğü Kılavuzları

### IRT
- Hambleton, R.K., & Swaminathan, H. (1985). Item Response Theory: Principles and Applications
- Baker, F.B. (2001). The Basics of Item Response Theory

---

## 🎯 UYGULAMA PLANI

### Faz 1: PISA/TIMSS Benchmark Veritabanı
- [ ] `international_benchmarks` tablosunu doldur
- [ ] API endpoint'leri oluştur
- [ ] Karşılaştırma algoritması yaz

### Faz 2: Bloom Otomatik Etiketleme
- [ ] Anahtar kelime veritabanı oluştur
- [ ] Türkçe NLP entegrasyonu (opsiyonel)
- [ ] Gemini AI ile doğrulama

### Faz 3: IRT Basitleştirilmiş Hesaplama
- [ ] CTT → IRT dönüşüm fonksiyonları
- [ ] Madde kalite raporlama
- [ ] Sınav güvenilirlik (Cronbach Alpha)

### Faz 4: Karşılaştırma Raporları
- [ ] PDF'e benchmark ekleme
- [ ] Ulusal sıralama gösterimi
- [ ] Trend grafikleri

---

> **Not:** Bu belge akademik standartlara dayalıdır ve uygulama detayları projeye göre uyarlanmalıdır.
