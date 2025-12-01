# 🚀 Hızlı Başlangıç Kılavuzu

## Supabase'i 5 Dakikada Kurun!

### ✅ Adım 1: Bağımlılıkları Yükleyin

Windows için `install-supabase.bat` dosyasına çift tıklayın veya terminal'de:

```bash
npm install
```

### ✅ Adım 2: Supabase Hesabı Oluşturun

1. 🌐 [supabase.com](https://supabase.com) adresine gidin
2. 📝 "Start your project" butonuna tıklayın
3. 🔑 Google veya GitHub ile giriş yapın
4. ➕ "New Project" butonuna tıklayın

**Proje Bilgileri:**
- **Name:** `sinav-analiz-uzmani`
- **Database Password:** Güçlü bir şifre oluşturun (kaydedin!)
- **Region:** `Europe (Frankfurt)` - en yakın bölge
- **Pricing Plan:** `Free` (başlangıç için yeterli)

⏳ Proje oluşturulması ~2 dakika sürer.

### ✅ Adım 3: Veritabanı Tablolarını Oluşturun

1. 📊 Sol menüden **SQL Editor**'e tıklayın
2. ➕ "New Query" butonuna tıklayın
3. 📋 `supabase-setup.sql` dosyasını açın
4. 📄 Tüm içeriği kopyalayın (Ctrl+A, Ctrl+C)
5. 📝 SQL Editor'e yapıştırın (Ctrl+V)
6. ▶️ **Run** butonuna tıklayın (veya Ctrl+Enter)

✅ Başarılı olursa: "Success. No rows returned" mesajı görürsünüz.

### ✅ Adım 4: API Anahtarlarını Alın

1. ⚙️ Sol alt köşeden **Settings** (dişli ikonu) tıklayın
2. 🔌 **API** sekmesine gidin
3. 📋 Şu bilgileri kopyalayın:

```
Project URL: https://xxxxxxxx.supabase.co
anon public key: eyJhbGc...
```

### ✅ Adım 5: Environment Variables Ayarlayın

**Seçenek 1:** `.env.local` dosyasını düzenleyin:

```bash
GEMINI_API_KEY=your_existing_key
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Seçenek 2:** `Credentials.txt` dosyasını düzenleyin (aynı formatta).

### ✅ Adım 6: Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine gidin.

---

## 🎯 Yeni Özellikleri Kullanma

### 🔹 Özellik 1: MEB Senaryolarını İçe Aktarma

1. Ana sayfada **Sınav Ayarları** bölümünde sınıf ve ders seçin
2. "Devam Et" butonuna tıklayın
3. **MEB Senaryo Seçimi** düğmesine tıklayın (yeni özellik!)
4. İstediğiniz senaryoyu seçin ve "Projeye Aktar" butonuna tıklayın
5. ✅ Kazanımlar otomatik olarak sorulara yüklenecek!

### 🔹 Özellik 2: Sınıf Listelerini Kaydetme

1. Supabase panelini açın
2. **Sınıf Listeleri** sekmesine gidin
3. Formu doldurun:
   - Okul Adı
   - Sınıf (örn: 5/A)
   - Ders
   - Öğretmen Adı
4. "Kaydet" butonuna tıklayın
5. ✅ Sınıfınız Supabase'e kaydedildi!

### 🔹 Özellik 3: PDF İndirme

MEB senaryolarını direkt PDF olarak indirebilirsiniz:
- Senaryo listesinde "PDF" butonuna tıklayın
- PDF otomatik olarak indirilecek

---

## 📁 Oluşturulan Dosyalar

### 🔧 Servisler
- `services/supabase.ts` - Supabase client ve database işlemleri
- `services/mebScraper.ts` - MEB senaryolarını çekme

### 🎨 Bileşenler
- `components/ClassListManager.tsx` - Sınıf yönetimi
- `components/ScenarioSelector.tsx` - Senaryo seçici
- `components/SupabaseIntegration.tsx` - Ana entegrasyon paneli

### 📄 Konfigürasyon
- `supabase-setup.sql` - Veritabanı kurulum scripti
- `.env.local` - Environment variables (GİZLİ!)
- `Credentials.txt` - API anahtarları (GİZLİ!)
- `install-supabase.bat` - Otomatik kurulum scripti

---

## 🔍 Test Etme

### Test 1: Veritabanı Bağlantısı
1. Supabase Dashboard > Database > Tables
2. Şu tabloları görmelisiniz:
   - ✅ `class_lists`
   - ✅ `achievements`
   - ✅ `scenarios`

### Test 2: Sınıf Ekleme
1. Uygulamada Supabase panelini açın
2. Yeni sınıf ekleyin
3. Supabase Dashboard > Table Editor > `class_lists`
4. ✅ Yeni kaydı görebilmelisiniz

### Test 3: MEB Senaryoları
1. 9. sınıf İngilizce seçin
2. Senaryo listesinde PDF linkini görmelisiniz
3. "PDF İndir" butonuna tıklayın
4. ✅ PDF indirilmelisiniz

---

## ❗ Sık Karşılaşılan Sorunlar

### Sorun 1: "Supabase is not defined"
**Çözüm:**
```bash
npm install @supabase/supabase-js
npm run dev
```

### Sorun 2: "Invalid API key"
**Çözüm:**
- `.env.local` dosyasını kontrol edin
- Supabase'den doğru anahtarları kopyaladığınızdan emin olun
- Uygulamayı yeniden başlatın

### Sorun 3: "Table does not exist"
**Çözüm:**
- `supabase-setup.sql` scriptini tekrar çalıştırın
- Supabase Dashboard'da tabloları kontrol edin

### Sorun 4: "CORS Error"
**Çözüm:**
- Supabase Dashboard > Settings > API
- Authentication altında "Enable email confirmations" kapalı olmalı
- RLS politikalarını kontrol edin

---

## 📊 Mevcut MEB Senaryoları

### İngilizce
- ✅ 9. Sınıf
- ✅ 10. Sınıf
- ✅ 11. Sınıf
- ✅ 12. Sınıf

### Diğer Dersler
- ✅ Coğrafya (12. Sınıf)
- ✅ Tarih (9, 10, 11, 12. Sınıflar)
- ✅ Felsefe (10, 11. Sınıflar)
- ✅ DKAB (9, 10, 11, 12. Sınıflar)

---

## 🎓 Gelecek Özellikler

- [ ] PDF'lerden otomatik kazanım çıkarma
- [ ] Excel'den toplu sınıf ekleme
- [ ] Sınıflar arası karşılaştırma
- [ ] Kazanım istatistikleri
- [ ] Öğrenci performans takibi

---

## 🆘 Yardım

- 📚 [Supabase Dokümantasyonu](https://supabase.com/docs)
- 🎥 [Supabase YouTube Kanalı](https://www.youtube.com/c/supabase)
- 💬 [Supabase Discord](https://discord.supabase.com)

---

**💡 İpucu:** Supabase'in ücretsiz planı günde 500MB veri transferi ve 500MB depolama alanı sunar. Bir sınıf için yeterlidir!

**🎉 Başarılar!** Artık Supabase ile entegre bir sınav analiz sisteminiz var!
