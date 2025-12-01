# 🎓 Sınav Analiz Uzmanı - Advanced Education Analytics Platform

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?logo=supabase)

### Dünya Standartlarında Sınav Analiz ve Eğitim Yönetim Sistemi

[Demo](https://demo-url.com) • [Dokümantasyon](./KULLANICI_REHBERI.md) • [Destek](mailto:salihaerdol11@gmail.com)

</div>

---

## ✨ Özellikler

### 📊 Sınav Analizi
- ✅ MEB müfredatına uyumlu kazanım bazlı analiz
- ✅ Otomatik istat istik hesaplamaları (ortalama, medyan, std sapma)
- ✅ Görsel raporlar (histogram, pasta grafik, çizgi grafik)
- ✅ AI destekli pedagojik öneriler (Google Gemini)
- ✅ Bilingual raporlar (Türkçe/İngilizce)

### 👥 Sınıf Yönetimi
- ✅ Sınıf listesi oluşturma ve düzenleme
- ✅ Öğrenci profilleri (iletişim bilgileri, notlar)
- ✅ Kademeler arası organizasyon (5-8. sınıflar)
- ✅ Arşivleme sistemi

### 📥📤 Excel Entegrasyonu
- ✅ Excel'den öğrenci listesi import
- ✅ Excel'den not girişi import
- ✅ Kopyala-yapıştır desteği (Excel/Word)
- ✅ Formül destekli şablon export
- ✅ Detaylı analiz export (çoklu sayfalar)

### 📄 Raporlama
- ✅ Profesyonel PDF raporlar
- ✅ Bireysel öğrenci karneleri
- ✅ Word formatı raporlar
- ✅ Grafik entegrasyonlu PDF

### 🔐 Güvenlik
- ✅ Google OAuth 2.0 entegrasyonu
- ✅ Row Level Security (RLS)
- ✅ Audit logging
- ✅ GDPR uyumlu veri yönetimi

### 🎨 Kullanıcı Deneyimi
- ✅ Modern ve responsive tasarım
- ✅ Step-by-step kullanım akışı
- ✅ Gerçek zamanlı form validasyonu
- ✅ Otomatik kaydetme
- ✅ Dashboard ve istatistikler

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18.x veya üzeri
- Supabase hesabı
- Google Cloud Console (OAuth için)

### Kurulum

```bash
# 1. Projeyi klonlayın
git clone https://github.com/yourusername/sinav-analiz-uzmani.git
cd sinav-analiz-uzmani

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# 4. Supabase veritabanını kurun
# Supabase SQL Editor'de database-schema-advanced.sql dosyasını çalıştırın

# 5. Uygulamayı başlatın
npm run dev
```

### Ortam Değişkenleri

`.env.local` dosyasını oluşturun:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📁 Proje Yapısı

```
sınav-analiz-uzmanı/
├── components/           # React bileşenleri
│   ├── AnalysisView.tsx
│   ├── Dashboard.tsx
│   ├── DataImport.tsx
│   ├── Login.tsx
│   └── ...
├── context/             # React Context (Auth)
│   └── AuthContext.tsx
├── data/                # Statik veri (curriculum)
│   └── curriculum.ts
├── services/            # API servisleri
│   ├── supabase.ts
│   ├── excelService.ts
│   ├── exportServiceAdvanced.ts
│   └── geminiService.ts
├── types/               # TypeScript tipleri
│   └── index.ts
├── database-schema-advanced.sql  # Veritabanı şeması
├── KULLANICI_REHBERI.md          # Kullanıcı kılavuzu
└── README.md
```

---

## 🗄️ Veritabanı Mimarisi

### Ana Tablolar

| Tablo | Amacı |
|-------|-------|
| `user_profiles` | Kullanıcı profilleri ve yetkiler |
| `student_lists` | Sınıf grupları (5/A, 6/B) |
| `students` | Bireysel öğrenci kayıtları |
| `exams` | Sınav metadata ve durum |
| `exam_questions` | Sınav soruları ve kazanımlar |
| `exam_scores` | Öğrenci-soru bazlı puanlar |
| `exam_analytics` | Önbelleklenmiş analizler |
| `audit_logs` | Güvenlik ve izleme |

### İlişkiler (ER Diagram)
```
users (1) → (N) student_lists
student_lists (1) → (N) students
users (1) → (N) exams
exams (1) → (N) exam_questions
exams (1) → (N) exam_scores
students (1) → (N) exam_scores
```

---

## 🛠️ Kullanılan Teknolojiler

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Grafik ve görselleştirme
- **Lucide React** - İkonlar

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions

### Services & APIs
- **Google Gemini AI** - Analiz ve öneriler
- **Google OAuth** - Kimlik doğrulama
- **jsPDF & docx** - Rapor oluşturma
- **html2canvas** - Grafik yakalama
- **xlsx-js-style** - Excel işlemleri

---

## 📚 Kullanım Kılavuzu

Detaylı kullanım talimatları için [KULLANICI_REHBERI.md](./KULLANICI_REHBERI.md) dosyasına bakın.

### Temel Akış

1. **Giriş Yap** → Google hesabınızla giriş yapın
2. **Sınıf Oluştur** → Dashboard'dan yeni sınıf ekleyin
3. **Öğrenci Ekle** → Excel import veya manuel giriş
4. **Sınav Oluştur** → MEB senaryosu seçin veya özel oluşturun
5. **Not Gir** → Excel şablonu veya manuel
6. **Analiz Et** → Otomatik analiz ve grafikler
7. **Rapor Al** → PDF, Word veya Excel

---

## 🎯 Öne Çıkan Özellikler

### 1. AI Destekli Analiz
```typescript
// Gemini AI ile otomatik pedagojik öneriler
const analysis = await generateAIAnalysis(examResults, metadata);
// → Başarısız kazanımlar için eylem planı
// → Sınıf geneli önerileri
// → Bireysel öğrenci tavsiyeleri
```

### 2. Excel Power User Features
```typescript
// Kopyala-yapıştır desteği
const students = parseClipboardData(clipboardText);
// → Excel/Word'den direkt yapıştır
// → Otomatik parse ve validasyon
// → Formül korumalı şablon export
```

### 3. Bilingual Reporting
```typescript
// Tek tıkla hem TR hem EN rapor
exportBilingualReports(analysis, metadata, ...);
// → Uluslararası okullara uygun
// → MEB ve Cambridge standartları
```

### 4. Individual Student Cards
```typescript
// Her öğrenci için özel karne
exportIndividualStudentReports(students, analysis);
// → Güçlü/zayıf yönler
// → Gelişim önerileri
// → Veli görüşmesi için hazır
```

---

## 📊 Ekran Görüntüleri

### Dashboard
![Dashboard](./docs/screenshots/dashboard.png)

### Analiz Ekranı
![Analysis](./docs/screenshots/analysis.png)

### Excel Import
![Excel Import](./docs/screenshots/excel-import.png)

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

- MEB Ölçme Değerlendirme Genel Müdürlüğü (Kazanım verileri)
- Google Gemini AI (Analiz desteği)
- Supabase Team (Harika BaaS platform)
- React ve TailwindCSS ekipleri

---

## 📧 İletişim

**Proje Sahibi:** Saliha Erdol  
**Email:** salihaerdol11@gmail.com  
**Proje Linki:** [GitHub Repository]

---

## 🗺️ Roadmap

### v2.1.0 (Q1 2025)
- [ ] Karşılaştırmalı analiz (sınıflar arası)
- [ ] Gelişim grafikleri (dönemler arası)
- [ ] WhatsApp veli bildirimleri
- [ ] Mobil responsive iyileştirmeler

### v2.2.0 (Q2 2025)
- [ ] Soru bankası sistemi
- [ ] Otomatik soru üretici (AI)
- [ ] Online sınav platformu
- [ ] Öğrenci portali

### v3.0.0 (Q3 2025)
- [ ] Machine Learning tahmin modelleri
- [ ] Akıllı sınıf yönetimi
- [ ] Blockchain sertifikasyon
- [ ] Multi-tenant SaaS dönüşümü

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by educators, for educators

[⬆ Başa Dön](#-sınav-analiz-uzmanı---advanced-education-analytics-platform)

</div>
