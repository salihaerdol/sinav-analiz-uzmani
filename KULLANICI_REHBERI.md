# 🎓 SINAV ANALİZ UZMANI - KULLANICI REHBERİ VE TAVSİYELER

## 📚 İÇİNDEKİLER
1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Veritabanı Kurulumu](#veritabanı-kurulumu)
3. [Excel Kullanım İpuçları](#excel-kullanım-ipuçları)
4. [En İyi Uygulamalar](#en-iyi-uygulamalar)
5. [Sık Sorulan Sorular](#sık-sorulan-sorular)
6. [Gelişmiş Özellikler](#gelişmiş-özellikler)

---

## 🚀 HIZLI BAŞLANGIÇ

### 1. Veritabanı Kurulumu
Supabase projenizin SQL Editor bölümünde `database-schema-advanced.sql` dosyasını çalıştırın:

```sql
-- Tüm SQL içeriğini buraya kopyalayıp çalıştırın
```

### 2. Ortam Değişkenleri
`.env.local` dosyanızın doğru yapılandırıldığından emin olun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. İlk Giriş
- Google hesabınızla giriş yapın
- İlk giriş otomatik olarak kullanıcı profilinizi oluşturur
- `salihaerdol11@gmail.com` admin yetkilerine sahiptir

---

## 🗄️ VERİTABANI KURULUMU

### Tablo Yapısı
Sistem 8 ana tablo kullanır:

| Tablo | Açıklama |
|-------|----------|
| `user_profiles` | Kullanıcı profilleri (öğretmen bilgileri) |
| `student_lists` | Sınıf grupları (5/A, 6/B vb.) |
| `students` | Bireysel öğrenci kayıtları |
| `exams` | Sınav metadata |
| `exam_questions` | Sınav soruları ve kazanımlar |
| `exam_scores` | Öğrenci puanları |
| `exam_analytics` | Önbelleklenmiş analiz sonuçları |
| `audit_logs` | Güvenlik ve takip günlükleri |

### Row Level Security (RLS)
- ✅ Tüm tablolar RLS ile korunmaktadır
- ✅ Kullanıcılar sadece kendi verilerini görebilir
- ✅ Admin kullanıcılar ek yetkilere sahiptir

### Trigger'lar ve Fonksiyonlar
- 🔄 `updated_at` alanları otomatik güncellenir
- 👤 Yeni kullanıcılar için profil otomatik oluşturulur
- 📊 Öğrenci sayıları otomatik hesaplanır

---

## 📊 EXCEL KULLANIM İPUÇLARI

### Öğrenci Listesi Yükleme

**Seçenek 1: Excel Dosyası**
1. "Şablon İndir" butonuna tıklayın
2. Şablonu Excel'de açın
3. Öğrenci bilgilerini doldurun
4. Kaydedin ve yükleyin

**Örnek Format:**
```
| No | Öğrenci No | Ad Soyad        | Cinsiyet | E-posta          | Veli Telefon    |
|----|-----------|-----------------|----------|------------------|-----------------|
| 1  | 101       | Ahmet Yılmaz    | M        | ahmet@email.com  | 0555 123 4567   |
| 2  | 102       | Ayşe Demir      | F        | ayse@email.com   | 0555 234 5678   |
```

**Seçenek 2: Kopyala-Yapıştır (Excel'den direkt)**
1. Excel'de öğrenci isimlerini seçin
2. Ctrl+C ile kopyalayın
3. "Toplu Ekle" modalında Ctrl+V yapın
4. Otomatik olarak parse edilir ✨

### Sınav Notu Girişi

**Excel Şablonu:**
1. "Not Girişi Şablonu İndir" butonuna tıklayın
2. Excel otomatik olarak:
   - Soru başlıklarını oluşturur
   - Toplam formülünü ekler
   - Yüzde hesaplamasını yapar
3. Sadece notları girin, geri kalanı otomatik!

**Kopyala-Yapıştır:**
```
| Ad Soyad      | S1 | S2 | S3 | S4 | S5 |
|---------------|----|----|----|----|-----|
| Ahmet Yılmaz  | 8  | 7  | 9  | 6  | 10  |
| Ayşe Demir    | 9  | 8  | 10 | 8  | 9   |
```
- Excel'den kopyalayın → "Yapıştır" butonuna tıklayın → Bitti! 🎉

---

## 🏆 EN İYİ UYGULAMALAR

### Sınıf Yönetimi

#### ✅ YAPILMASI GEREKENLER
- Sınıf adlarını tutarlı kullanın (Örn: "5/A 2024-2025")
- Akademik yılı her zaman belirtin
- Öğrenci numaralarını kaydedin
- Dönem sonunda sınıfları arşivleyin

#### ❌ YAPILMAMASI GEREKENLER
- Aynı isiml i birden fazla sınıf oluşturmayın
- Akademik yıl geçmeden eski sınıfları silmeyin
- Öğrenci listesini sık sık değiştirmeyin

### Sınav Oluşturma

#### 🎯 Başarılı Sınav İçin İpuçları

**1. Planlama Aşaması**
- Sınavdan önce MEB senaryosunu kontrol edin
- Kazanım dağılımını dengeleyin
- Soru zorluk seviyelerini çeşitlendirin

**2. Soru Hazırlama**
- Her soruya mutlaka kazanım kodu atayın
- Kazanım açıklamalarını kontrol edin
- Puan dağılımını dengeleyin (toplam 100)

**3. Not Girişi**
- Excel şablonu kullanarak toplu giriş yapın
- Her notun maksimum puanı geçmediğinden emin olun
- Notları kaydetmeden önce kontrol edin

**4. Analiz Sonrası**
- Başarısız kazanımlar için aksiyon planı yapın
- Bireysel karneleri öğrencilerle paylaşın
- AI önerilerini dikkate alın

### Veri Güvenliği

#### 🔒 Güvenlik Tavsiyeleri
- Öğrenci kişisel bilgilerini koruyun
- Sınav sonuçlarını sadece ilgili kişilerle paylaşın
- Düzenli olarak yedek alın
- Admin yetkilerini dikkatli verin

---

## 💡 SIKÇA SORULAN SORULAR

### **S: Eski analizlerimi nasıl bulurum?**
**C:** Dashboard → "Sınavlarım" sekmesi → İstediğiniz sınavı seçin

### **S: Öğrenci listesini nasıl güncellerim?**
**C:** Dashboard → "Sınıflarım" → Sınıfı seç → "Öğrencileri Düzenle"

### **S: Excel dosyam yüklenmiyor!**
**C:** Şu kontrolleri yapın:
- Dosya .xlsx formatında mı?
- İlk satır başlıkları içeriyor mu?
- Özel karakter var mı?

### **S: MEB senaryoları güncel mi?**
**C:** Senaryo seçim ekranında "MEB Güncel Senaryoları" linkini takip edin ve karşılaştırın.

### **S: Birden fazla sınıfı aynı anda analiz edebilir miyim?**
**C:** Şu an desteklenmiyor ama yakında "Karşılaştırmalı Analiz" özelliği gelecek!

---

## 🚀 GELİŞMİŞ ÖZELLİKLER

### 1. AI Destekli Analiz
- Sınav sonuçlarınızı Gemini AI ile analiz edin
- Pedagojik öneriler alın
- Özelleştirilmiş iyileştirme planları

### 2. İstatistiksel Raporlar
- Histogram ve dağılım grafikleri
- Standart sapma, medyan hesaplamaları
- Trend analizi (yakında)

### 3. Bireysel Karneler
- Her öğrenci için PDF karne
- Güçlü ve zayıf yönler
- Veli imza alanı

### 4. Excel Entegrasyonu
- Tam uyumlu import/export
- Formül destekli şablonlar
- Kopyala-yapıştır desteği

### 5. Multi-Language Raporlar
- Türkçe ve İngilizce raporlar
- Uluslararası okullara uygun
- Dünya standartlarında formatlar

---

## 📈 GELECEKTEKİ ÖZELLİKLER (Roadmap)

### Yakında Gelecek
- [ ] Karşılaştırmalı analiz (sınıflar arası)
- [ ] Gelişim takibi (dönemler arası)
- [ ] Mobil uygulama
- [ ] WhatsApp entegrasyonu (otomatik veli bildirimi)
- [ ] Kazanım bankası (MEB ile senkronize)
- [ ] Video ders önerileri
- [ ] Öğrenci portali (öğrenciler kendi sonuçlarını görsün)

### Uzun Vadeli Hedefler
- [ ] Machine Learning ile başarı tahmini
- [ ] Otomatik soru üretici
- [ ] Akıllı sınıf yönetimi
- [ ] Online sınav platformu
- [ ] Blockchain tabanlı sertifika sistemi

---

## 🆘 DESTEK VE KATKIDA BULUNMA

### Sorun Bildirimi
GitHub Issues kullanarak sorun bildirebilirsiniz.

### Özellik İsteği
Yeni özellik önerileri için tartışma forumu kullanın.

### Katkıda Bulunma
Pull request'ler memnuniyetle karşılanır!

---

## 📞 İLETİŞİM

- **Email:** salihaerdol11@gmail.com
- **GitHub:** [Proje Repository]
- **Dökümantasyon:** [Online Docs]

---

## 📝 LİSANS

Bu proje MIT lisansı altında lisanslanmıştır.

---

**💪 Başarılar dileriz!**  
*Eğitimde teknolojinin gücüyle kaliteyi artırıyoruz.*

---

## 🎯 HIZLI İPUÇLARI

| İpucu | Açıklama |
|-------|----------|
| **Ctrl + S** | Otomatik kaydet zaten aktif! |
| **Excel → Yapıştır** | Tab ile ayrılmış metni otomatik parse eder |
| **Şablon kullan** | Zaman kazanmak için hazır şablonları tercih et |
| **AI Yorum** | Her sınav sonrası mutlaka AI yorumu al |
| **Bireysel Karne** | Veli görüşmelerinde kullan |
| **Arşivle** | Eski sınıfları sil değil arşivle |
| **Yedekle** | Excel export ile düzenli yedek al |
| **Karşılaştır** | Dönemler arası gelişimi takip et |

---

*Versiyon: 2.0.0 - Advanced Education Analytics Platform*  
*Son Güncelleme: Aralık 2024*
