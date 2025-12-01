# ✅ Supabase Kurulum Kontrol Listesi

Bu kontrol listesini takip ederek Supabase entegrasyonunun tam olarak çalıştığından emin olun.

---

## 📋 Ön Hazırlık

### Sistem Gereksinimleri
- [ ] Windows 10 veya üzeri
- [ ] Node.js v16+ yüklü
- [ ] NPM v8+ yüklü
- [ ] Modern web tarayıcı (Chrome, Edge, Firefox)
- [ ] İnternet bağlantısı

**Kontrol Komutu:**
```bash
node --version   # v16.0.0 veya üzeri olmalı
npm --version    # v8.0.0 veya üzeri olmalı
```

---

## 🌐 Supabase Hesap Kurulumu

### Adım 1: Hesap Oluşturma
- [ ] https://supabase.com adresine git
- [ ] "Start your project" butonuna tıkla
- [ ] Google veya GitHub ile giriş yap
- [ ] Email doğrulamasını tamamla

### Adım 2: Proje Oluşturma
- [ ] Dashboard'da "New Project" tıkla
- [ ] Proje adı: `sinav-analiz-uzmani`
- [ ] Database şifresi oluştur ve kaydet: _______________
- [ ] Region seç: Europe (Frankfurt)
- [ ] "Create new project" tıkla
- [ ] Proje hazır olana kadar bekle (~2 dakika)

---

## 🗄️ Veritabanı Kurulumu

### Adım 3: SQL Script Çalıştırma
- [ ] Supabase Dashboard > SQL Editor'e git
- [ ] "New Query" butonuna tıkla
- [ ] `supabase-setup.sql` dosyasını aç
- [ ] İçeriği kopyala (Ctrl+A, Ctrl+C)
- [ ] SQL Editor'e yapıştır (Ctrl+V)
- [ ] "Run" butonuna tıkla veya Ctrl+Enter

**Beklenen Sonuç:**
```
✅ Success. No rows returned.
```

### Adım 4: Tabloları Doğrula
- [ ] Supabase Dashboard > Database > Tables
- [ ] `class_lists` tablosu var mı?
- [ ] `achievements` tablosu var mı?
- [ ] `scenarios` tablosu var mı?

---

## 🔑 API Anahtarları

### Adım 5: Anahtarları Al
- [ ] Supabase Dashboard > Settings (⚙️) > API
- [ ] "Project URL" kopyala
- [ ] "Project API keys" altında "anon public" kopyala

**Bilgilerim:**
```
Project URL: https://________________.supabase.co
anon key: eyJhbGc________________
```

### Adım 6: Environment Variables
- [ ] Projedeki `.env.local` dosyasını aç
- [ ] Şu satırları düzenle:
```bash
VITE_SUPABASE_URL=<Project URL'i yapıştır>
VITE_SUPABASE_ANON_KEY=<anon key'i yapıştır>
```
- [ ] Dosyayı kaydet (Ctrl+S)

**Alternatif:** `Credentials.txt` dosyasını da güncelleyebilirsiniz.

---

## 📦 Bağımlılık Kurulumu

### Adım 7: NPM Paketleri
- [ ] Terminal'i aç (PowerShell veya CMD)
- [ ] Proje klasörüne git:
```bash
cd "C:\Users\saliha\Desktop\sınav-analiz-uzmanı"
```

**Seçenek 1: Otomatik Kurulum (Önerilen)**
- [ ] `install-supabase.bat` dosyasına çift tıkla
- [ ] Kurulumun bitmesini bekle

**Seçenek 2: Manuel Kurulum**
- [ ] Şu komutu çalıştır:
```bash
npm install
```

**Beklenen Sonuç:**
```
added 1 package, and audited X packages
found 0 vulnerabilities
```

---

## 🧪 Test Etme

### Test 1: Uygulamayı Başlat
- [ ] Terminal'de şu komutu çalıştır:
```bash
npm run dev
```
- [ ] Tarayıcıda `http://localhost:5173` aç
- [ ] "Sınav Analiz Uzmanı" başlığını gör

### Test 2: Supabase Bağlantısı
- [ ] Tarayıcı Console'u aç (F12)
- [ ] "Supabase client initialized" mesajını ara
- [ ] Hata yok mu kontrol et

### Test 3: Sınıf Listesi Ekleme
- [ ] Uygulamada "Supabase Panelini Aç" butonuna tıkla
- [ ] "Sınıf Listeleri" sekmesine git
- [ ] Formu doldur:
  * Okul Adı: Test Okulu
  * Sınıf: 5/A
  * Ders: İngilizce
  * Öğretmen: Test Öğretmen
- [ ] "Kaydet" butonuna tıkla
- [ ] Başarı mesajı göründü mü?

### Test 4: Supabase'de Doğrula
- [ ] Supabase Dashboard > Table Editor > `class_lists`
- [ ] Yeni kaydı gör
- [ ] Veriler doğru mu?

### Test 5: MEB Senaryoları
- [ ] Uygulamada "MEB Senaryoları" sekmesine git
- [ ] 9. Sınıf İngilizce seç
- [ ] Senaryo listesi göründü mü?
- [ ] "PDF İndir" butonuna tıkla
- [ ] PDF indirildi mi?

---

## 🔍 Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### ❌ "Supabase is not defined"
**Çözüm:**
- [ ] `npm install @supabase/supabase-js` komutu çalıştır
- [ ] Uygulamayı yeniden başlat (`npm run dev`)

#### ❌ "Invalid API key" veya "401 Unauthorized"
**Çözüm:**
- [ ] `.env.local` dosyasını kontrol et
- [ ] API anahtarlarını tekrar kopyala
- [ ] Boşluk veya ekstra karakter yok mu kontrol et
- [ ] Uygulamayı yeniden başlat

#### ❌ "Table does not exist"
**Çözüm:**
- [ ] Supabase SQL Editor'de `supabase-setup.sql` tekrar çalıştır
- [ ] Database > Tables'da tabloları kontrol et
- [ ] Hata mesajı var mı kontrol et

#### ❌ "CORS Error"
**Çözüm:**
- [ ] Supabase Dashboard > Settings > API
- [ ] "CORS" ayarlarında `http://localhost:5173` ekli mi kontrol et
- [ ] RLS politikalarını kontrol et

#### ❌ "npm Not Found" (Windows)
**Çözüm:**
- [ ] Node.js'i yeniden yükle: https://nodejs.org
- [ ] Installation sırasında "Add to PATH" seçeneğini işaretle
- [ ] Bilgisayarı yeniden başlat
- [ ] Terminal'i yeniden aç

---

## 📊 Başarı Kriterleri

Aşağıdaki tüm işlemler başarılı olmalı:

### Backend
- [✓] Supabase projesi oluşturuldu
- [✓] 3 tablo (`class_lists`, `achievements`, `scenarios`) var
- [✓] RLS politikaları aktif
- [✓] Sample data eklendi

### Frontend
- [✓] `@supabase/supabase-js` paketi yüklü
- [✓] Environment variables doğru ayarlandı
- [✓] Uygulama localhost'ta çalışıyor
- [✓] Console'da Supabase hatası yok

### Features
- [✓] Yeni sınıf eklenebiliyor
- [✓] Sınıf listesi görüntülenebiliyor
- [✓] MEB senaryoları listelenebiliyor
- [✓] PDF indirilebiliyor
- [✓] Kazanımlar aktarılabiliyor

---

## 📅 Tamamlanma Zamanlaması

| Adım | Tahmini Süre | Tamamlandı |
|------|--------------|------------|
| Supabase hesap oluştur | 5 dakika | [ ] |
| Veritabanı kur | 2 dakika | [ ] |
| API anahtarları al | 1 dakika | [ ] |
| Env variables ayarla | 2 dakika | [ ] |
| NPM paketleri yükle | 3 dakika | [ ] |
| Test et | 5 dakika | [ ] |
| **TOPLAM** | **~20 dakika** | [ ] |

---

## 🎯 Son Kontrol

Tüm kutular işaretlendiyse:

✅ **Supabase entegrasyonu başarılı!**
✅ **Sistem kullanıma hazır!**
✅ **Dokümantasyon tamamlandı!**

---

## 📝 Notlar

Kurulum sırasında karşılaştığınız sorunları buraya yazın:

```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🆘 Yardım Gerektiğinde

1. **Dokümantasyon:**
   - `HIZLI_BASLANGIC.md` - Hızlı kurulum
   - `SUPABASE_SETUP.md` - Detaylı kılavuz
   - `ENTEGRASYON_OZETI.md` - Genel bakış

2. **Online Kaynaklar:**
   - https://supabase.com/docs
   - https://discord.supabase.com
   - YouTube: "Supabase Tutorials"

3. **Log Kontrolleri:**
   - Browser Console (F12)
   - Supabase Dashboard > Logs
   - Terminal output

---

**Son Güncelleme:** 1 Aralık 2025  
**Doküman Versiyonu:** 1.0.0

**İyi çalışmalar! 🚀**
