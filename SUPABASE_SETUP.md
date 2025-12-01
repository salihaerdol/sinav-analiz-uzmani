# Supabase Entegrasyon Kılavuzu

Bu proje artık Supabase ile entegre edilmiştir. Aşağıdaki adımları takip ederek kurulumu tamamlayabilirsiniz.

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- Supabase hesabı ([supabase.com](https://supabase.com))

## 🚀 Kurulum Adımları

### 1. Supabase Projesi Oluşturun

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - Project Name: `sinav-analiz-uzmani`
   - Database Password: Güçlü bir şifre seçin
   - Region: Europe (Frankfurt) veya size en yakın bölge
4. "Create new project" butonuna tıklayın

### 2. Database Tablolarını Oluşturun

1. Supabase Dashboard'da sol menüden "SQL Editor"e gidin
2. Sağ üst köşede "New Query" butonuna tıklayın
3. `supabase-setup.sql` dosyasının içeriğini kopyalayın
4. SQL editöre yapıştırın
5. "Run" butonuna tıklayarak çalıştırın

Bu işlem şu tabloları oluşturacak:
- `class_lists` - Sınıf bilgileri
- `achievements` - Kazanımlar (MEB müfredatından)
- `scenarios` - Sınav senaryoları

### 3. API Anahtarlarını Alın

1. Supabase Dashboard'da "Settings" > "API" bölümüne gidin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (örn: https://xxxxx.supabase.co)
   - **anon/public key** (uzun bir string)

### 4. Environment Variables Ayarlayın

`.env.local` dosyasını açın ve aşağıdaki değişkenleri doldurun:

```bash
GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**Alternatif:** `Credentials.txt` dosyasına da aynı bilgileri ekleyebilirsiniz.

### 5. Bağımlılıkları Yükleyin

Terminal'de proje klasörüne gidin ve şu komutu çalıştırın:

```bash
npm install @supabase/supabase-js
```

### 6. Uygulamayı Başlatın

```bash
npm run dev
```

## 🎯 Özellikler

### 1. Sınıf Listeleri Yönetimi

- Sınıflarınızı Supabase'e kaydedin
- Tüm sınıfları görüntüleyin ve yönetin
- Sınıf bilgilerini güncelleyin veya silin

**Kullanım:**
```typescript
import { classListService } from './services/supabase';

// Tüm sınıfları getir
const classes = await classListService.getAll();

// Yeni sınıf ekle
await classListService.create({
  grade: '5',
  subject: 'İngilizce',
  className: '5/A',
  schoolName: 'Atatürk Ortaokulu',
  teacherName: 'Ayşe Yılmaz',
  academicYear: '2025-2026'
});
```

### 2. MEB Kazanım Kodları

- MEB müfredatından kazanım kodlarını otomatik çekin
- Sınıf düzeyine göre filtreleyin
- Kazanımları projeye aktarın

**Kullanım:**
```typescript
import { achievementService } from './services/supabase';

// Belirli sınıf ve ders için kazanımları getir
const achievements = await achievementService.getByGradeAndSubject('5', 'İngilizce');
```

### 3. MEB Senaryoları

Milli Eğitim Bakanlığı'nın resmi senaryolarını kullanın:

- PDF dosyalarını doğrudan indirin
- Senaryoları projeye aktarın
- Kazanım kodlarını otomatik yükleyin

**Mevcut Senaryolar:**
- İngilizce (9, 10, 11, 12. Sınıflar)
- Matematik (Yakında)
- Coğrafya (12. Sınıf)
- Tarih (9, 10, 11, 12. Sınıflar)
- Felsefe (10, 11. Sınıflar)
- Din Kültürü ve Ahlak Bilgisi (9, 10, 11, 12. Sınıflar)

## 📁 Dosya Yapısı

```
├── services/
│   ├── supabase.ts          # Supabase client ve veritabanı işlemleri
│   └── mebScraper.ts        # MEB senaryolarını çekme servisi
├── components/
│   ├── ClassListManager.tsx  # Sınıf listesi yönetim bileşeni
│   └── ScenarioSelector.tsx  # MEB senaryo seçici bileşeni
├── supabase-setup.sql       # Veritabanı kurulum scripti
├── .env.local               # Environment variables (GİZLİ)
└── Credentials.txt          # API anahtarları (GİZLİ - Git'e eklemeyin!)
```

## 🔒 Güvenlik Notları

1. `.env.local` ve `Credentials.txt` dosyalarını **asla** Git'e eklemeyin
2. API anahtarlarınızı kimseyle paylaşmayın
3. Production ortamında RLS (Row Level Security) politikalarını güncelleyin
4. Supabase Dashboard'dan güvenlik ayarlarını kontrol edin

## 🛠️ Veritabanı Tabloları

### class_lists
- `id` (Primary Key)
- `grade` (Sınıf düzeyi)
- `subject` (Ders)
- `className` (Şube)
- `schoolName` (Okul adı)
- `teacherName` (Öğretmen adı)
- `academicYear` (Akademik yıl)
- `createdAt` (Oluşturulma tarihi)

### achievements
- `id` (Primary Key)
- `code` (Kazanım kodu, örn: E5.1.S1)
- `description` (Kazanım açıklaması)
- `grade` (Sınıf düzeyi)
- `subject` (Ders)
- `source` ('meb' veya 'custom')
- `createdAt` (Oluşturulma tarihi)

### scenarios
- `id` (Primary Key)
- `grade` (Sınıf düzeyi)
- `subject` (Ders)
- `scenarioNumber` (Senaryo numarası)
- `title` (Başlık)
- `pdfUrl` (PDF linki)
- `achievements` (Kazanım kodları - JSON array)
- `createdAt` (Oluşturulma tarihi)

## 🔧 Sorun Giderme

### "Supabase is not defined" Hatası
```bash
npm install @supabase/supabase-js
```

### "Invalid API key" Hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Supabase Dashboard'dan doğru anahtarları kopyaladığınızdan emin olun
- Uygulamayı yeniden başlatın (`npm run dev`)

### "Table does not exist" Hatası
- `supabase-setup.sql` scriptini Supabase SQL Editor'de çalıştırdığınızdan emin olun
- Supabase Dashboard > Database > Tables bölümünden tabloları kontrol edin

## 📚 Ek Kaynaklar

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [MEB Konu Soru Dağılım Tabloları](https://odsgm.meb.gov.tr/www/1-donem-konu-soru-dagilim-tablolari-2025-2026/icerik/1474)
- [React + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

## 💡 İpuçları

1. **Kazanım Ekleme**: MEB PDF'lerini indirip manuel olarak kazanımları Supabase'e ekleyebilirsiniz
2. **Toplu İşlemler**: `bulkCreate` metodunu kullanarak birden fazla kazanımı aynı anda ekleyebilirsiniz
3. **Arama**: Kazanım kodlarında arama yapmak için `searchByCode` metodunu kullanın

## 📞 Destek

Sorularınız için:
- GitHub Issues bölümünü kullanabilirsiniz
- Supabase Community Discord'una katılabilirsiniz

---

**Not:** Bu entegrasyon MEB'in resmi senaryolarını kullanır ve tamamen eğitim amaçlıdır.
