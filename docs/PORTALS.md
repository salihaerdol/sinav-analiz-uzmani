# 🏢 PAYDAŞ PORTALLERI - Detaylı Gereksinim Belgesi

> **Son Güncelleme:** 2026-01-11  
> **Durum:** Planlama Aşaması

---

## 📊 PAYDAŞ MATRISI

| Paydaş | Birincil İhtiyaç | İkincil İhtiyaç | Portal Önceliği |
|--------|------------------|-----------------|-----------------|
| **Öğretmen** | Hızlı analiz, rapor | Gelişim takibi | ✅ Mevcut |
| **Yönetici** | Okul geneli görünürlük | Karar desteği | 🔴 Kritik |
| **Veli** | Çocuk performansı | İletişim | 🟠 Yüksek |
| **Öğrenci** | Kendi durumu | Motivasyon | 🟡 Orta |
| **Koordinatör** | Branş yönetimi | Müfredat takibi | 🟡 Orta |

---

## 👔 YÖNETİCİ PORTALI

### Kullanıcı Profili
- **Rol:** Okul Müdürü, Müdür Yardımcısı, Genel Koordinatör
- **Temel Hedef:** Okul geneli performansı izlemek ve stratejik kararlar almak
- **Kullanım Sıklığı:** Günlük/Haftalık
- **Teknik Yetkinlik:** Orta

### Dashboard Ekranı

#### Ana KPI Kartları
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  📊 OKUL    │ │  📈 TREND   │ │  ⚠️ RİSK    │ │  ✅ KAPSAMA │
│  ORTALAMASI │ │             │ │  ÖĞRENCİ   │ │  ORANI     │
│             │ │             │ │             │ │             │
│    72.4     │ │   ↑ +3.2%   │ │     23      │ │    87%     │
│             │ │             │ │             │ │             │
│ Son 30 gün  │ │ vs geçen ay │ │ Kritik+Yük  │ │ MEB Kaz.   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

#### Sınıf Performans Grafiği
```
Sınıf Ortalamaları (Son Dönem)
┌────────────────────────────────────────────────┐
│ 5/A  ████████████████████████████░░░░░ 78.5   │
│ 5/B  ██████████████████████████░░░░░░░ 74.2   │
│ 6/A  █████████████████████████████████ 82.1   │
│ 6/B  ███████████████████████░░░░░░░░░░ 68.9   │
│ 7/A  ██████████████████████████████░░░ 76.4   │
│ 7/B  █████████████████████████████░░░░ 79.8   │
│ 8/A  ████████████████████████░░░░░░░░░ 71.2   │
│ 8/B  ███████████████████████████░░░░░░ 75.6   │
└────────────────────────────────────────────────┘
     0        25        50        75       100
```

#### Trend Grafiği
```
Okul Ortalaması Trendi (Son 12 Ay)
 85 ┤
 80 ┤                              ╭───╮
 75 ┤      ╭───╮             ╭────╯   │
 70 ┼──────╯   ╰─────────────╯        │
 65 ┤                                 │
 60 ┤                                 │
    └─────────────────────────────────────
     Oca  Şub  Mar  Nis  May  Haz  Tem
```

### Alt Sayfalar

#### 1. Sınıf Detayı
- Sınıfın tüm sınavları
- Öğrenci bazlı performans tablosu
- Kazanım kapsama analizi
- Öğretmen notu/yorumu

#### 2. Branş Analizi
- Branş bazlı ortalamalar
- Öğretmen karşılaştırması (anonim/açık seçenek)
- Zayıf kazanımlar
- Önerilen aksiyonlar

#### 3. Risk Öğrenci Listesi
- Kritik + Yüksek riskli öğrenciler
- Son 3 sınav performansı
- Önerilen müdahale
- Takip durumu

#### 4. Raporlar
- Yönetim kurulu sunumu (auto-generate)
- Dönem sonu analiz raporu
- Veliye gönderilecek toplu rapor
- MEB formatında raporlar

### API Endpoints

```typescript
GET /api/admin/dashboard
  → Özet KPI'lar ve grafikler

GET /api/admin/classes
  → Tüm sınıfların listesi ve performansı

GET /api/admin/classes/:id
  → Belirli sınıfın detayları

GET /api/admin/teachers
  → Öğretmen listesi ve sınıfları

GET /api/admin/risk-students
  → Risk altındaki öğrenciler

GET /api/admin/reports/generate
  → Rapor oluşturma

POST /api/admin/announcements
  → Duyuru gönderme
```

### Veri Modeli

```typescript
interface AdminDashboardData {
  // KPI'lar
  schoolAverage: number;
  trendPercentage: number;
  riskStudentCount: number;
  outcomesCoverage: number;
  
  // Grafikler
  classPerformance: {
    className: string;
    average: number;
    studentCount: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  
  monthlyTrend: {
    month: string;
    average: number;
  }[];
  
  // Risk öğrenciler
  riskStudents: {
    id: string;
    name: string;
    className: string;
    riskLevel: 'Kritik' | 'Yüksek' | 'Orta';
    lastScore: number;
    trend: 'down' | 'stable';
  }[];
  
  // Zayıf kazanımlar
  weakOutcomes: {
    code: string;
    description: string;
    successRate: number;
    affectedStudents: number;
  }[];
}
```

---

## 👨‍👩‍👧 VELİ PORTALI

### Kullanıcı Profili
- **Rol:** Anne, Baba, Veli/Vasi
- **Temel Hedef:** Çocuğunun akademik durumunu takip etmek
- **Kullanım Sıklığı:** Sınav sonrası, haftalık
- **Teknik Yetkinlik:** Düşük-Orta

### Kayıt & Giriş Akışı

```
1. Veli Davet Linki (Öğretmen/Okul tarafından)
   ↓
2. E-posta doğrulama
   ↓
3. Profil oluşturma (ad, telefon, ilişki)
   ↓
4. Çocuk bağlantısı (Öğretmen onayı)
   ↓
5. Portal erişimi aktif
```

### Dashboard Ekranı

#### Çocuk Performans Kartı
```
┌─────────────────────────────────────────────────┐
│  👧 Ayşe Yılmaz                     5/A Sınıfı │
│  ─────────────────────────────────────────────  │
│                                                 │
│  📊 Genel Ortalama          📈 Trend           │
│       78.5                    ↑ +5.2%          │
│                                                 │
│  🏆 Sınıf Sıralaması        📚 Son Sınav      │
│       8 / 32                  Matematik: 85    │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [📋 Sınav Geçmişi]  [💪 Güçlü/Zayıf]  [📱 İletişim] │
└─────────────────────────────────────────────────┘
```

#### Son Sınavlar
```
┌──────────────────────────────────────────────────┐
│ 📝 Son Sınavlar                                  │
├──────────────────────────────────────────────────┤
│ 📐 Matematik 2. Yazılı          15.01.2026      │
│    Puan: 85 / 100    Sınıf Ort: 72    🔵 +13    │
├──────────────────────────────────────────────────┤
│ 🔬 Fen Bilimleri 2. Yazılı      12.01.2026      │
│    Puan: 78 / 100    Sınıf Ort: 68    🔵 +10    │
├──────────────────────────────────────────────────┤
│ 📖 Türkçe 2. Yazılı             08.01.2026      │
│    Puan: 72 / 100    Sınıf Ort: 75    🔴 -3     │
└──────────────────────────────────────────────────┘
```

### Sınav Detay Sayfası

```
┌─────────────────────────────────────────────────┐
│ 📐 Matematik 2. Yazılı - Detay                  │
│ 15 Ocak 2026 | 5/A Sınıfı                       │
├─────────────────────────────────────────────────┤
│                                                 │
│ PUAN: 85/100     SIRALAMA: 8/32     SINIF: 72  │
│                                                 │
│ ─────────────────────────────────────────────── │
│                                                 │
│ KONU BAZLI PERFORMANS                           │
│ ┌─────────────────────────────────────────────┐ │
│ │ Kesirler          ████████████░░░░░ 90%     │ │
│ │ Ondalık Sayılar   █████████████░░░░ 85%     │ │
│ │ Yüzdeler          █████████░░░░░░░░ 70%     │ │
│ │ Problem Çözme     ████████████████░ 95%     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 💡 ÖNERİLER                                     │
│ • Yüzdeler konusuna ekstra çalışma önerilir   │
│ • Khan Academy "Yüzdeler" bölümü faydalı olur │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Güçlü/Zayıf Yönler

```
┌─────────────────────────────────────────────────┐
│ 💪 GÜÇLÜ YÖNLER                                 │
├─────────────────────────────────────────────────┤
│ ✅ Problem Çözme            Ort: 92%           │
│ ✅ Okuma Anlama             Ort: 88%           │
│ ✅ Geometri                 Ort: 85%           │
│                                                 │
│ ⚠️ GELİŞTİRİLECEK ALANLAR                       │
├─────────────────────────────────────────────────┤
│ 📚 İngilizce Gramer         Ort: 58%           │
│ 📚 Yüzdeler                 Ort: 62%           │
│ 📚 Fen - Elektrik           Ort: 65%           │
│                                                 │
│ 🎯 Önerilen Aktiviteler                        │
│ 1. Günde 15 dk İngilizce gramer alıştırması   │
│ 2. Yüzde problemleri çözümü (haftada 10)      │
│ 3. Fen deneyleri videoları izleme             │
└─────────────────────────────────────────────────┘
```

### Veri Gizliliği ve Güvenlik

| Veri | Veliye Görünür | Açıklama |
|------|----------------|----------|
| Kendi çocuğunun puanları | ✅ Evet | Tam detay |
| Kendi çocuğunun sıralaması | ✅ Evet | X/Toplam formatında |
| Sınıf ortalaması | ✅ Evet | Sadece sayı |
| Diğer öğrenci isimleri | ❌ Hayır | Hiçbir zaman |
| Diğer öğrenci puanları | ❌ Hayır | Hiçbir zaman |
| Öğretmen notları (çocuk için) | ✅ Evet | Varsa |

### Bildirimler

| Bildirim Tipi | Kanal | Varsayılan |
|---------------|-------|------------|
| Sınav sonucu | Push + E-posta | Açık |
| Devamsızlık | SMS + Push | Açık |
| Risk uyarısı | E-posta | Açık |
| Öğretmen mesajı | Push | Açık |
| Genel duyuru | E-posta | Açık |

---

## 👧 ÖĞRENCİ PORTALI

### Kullanıcı Profili
- **Rol:** 5-8. sınıf öğrenci
- **Temel Hedef:** Kendi performansını görmek, motive olmak
- **Kullanım Sıklığı:** Günlük/Haftalık
- **Teknik Yetkinlik:** Yüksek (dijital native)

### Gamification Sistemi

#### Rozet Kategorileri

**🌟 Performans Rozetleri**
| Rozet | İsim | Koşul | Puan |
|-------|------|-------|------|
| 🥇 | Altın Yıldız | 3 sınav üst üste %90+ | 150 |
| 🥈 | Gümüş Yıldız | 3 sınav üst üste %80+ | 100 |
| 🥉 | Bronz Yıldız | 3 sınav üst üste %70+ | 50 |
| 🏆 | Şampiyon | Sınıf 1.'si | 200 |
| 🎯 | Hedef Vurucu | Belirlenen hedefe ulaşma | 75 |

**📈 Gelişim Rozetleri**
| Rozet | İsim | Koşul | Puan |
|-------|------|-------|------|
| ⬆️ | Yükselen Yıldız | 3 sınav art arda gelişim | 80 |
| 🚀 | Roket | Bir sınavda %20+ artış | 60 |
| 💪 | Azimli | Zayıf konuda %30 gelişim | 100 |

**📚 Çalışkanlık Rozetleri**
| Rozet | İsim | Koşul | Puan |
|-------|------|-------|------|
| 🐝 | Çalışkan Arı | 7 gün art arda çalışma | 40 |
| 📖 | Kitap Kurdu | 30 gün içinde tüm ödevler | 60 |
| ⏰ | Erken Kalkan | Sabah 07:00 öncesi çalışma | 20 |

#### Seviye Sistemi

```
Seviye   Gereken Puan   Unvan
  1         0-99        Çırak
  2       100-249       Öğrenci
  3       250-499       Araştırmacı
  4       500-999       Uzman
  5      1000-1999      Usta
  6      2000-4999      Bilge
  7      5000+          Efsane
```

### Dashboard Ekranı

```
┌─────────────────────────────────────────────────────┐
│  👤 Merhaba, Ali!                      Level 4 ⭐   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ 💯 ORT.     │  │ 📈 TREND    │  │ 🏆 SIRALAM  │  │
│  │   78.5     │  │   ↑ +5%    │  │   8/32     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                     │
│  🎖️ ROZETLER (12 adet)                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │ 🥈 │ │ 🚀 │ │ 🐝 │ │ 📖 │ │ ⬆️ │ │ +7 │        │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘        │
│                                                     │
│  📊 BU HAFTA HEDEFİN                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ Matematik %75 → %80    ████████████████░░░ 80% │   │
│  │ 4 gün kaldı                                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📝 YAKLAŞAN SINAVLAR                               │
│  • Fen Bilimleri - 18 Ocak (7 gün)                │
│  • İngilizce - 22 Ocak (11 gün)                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Çalışma Planı

```
┌─────────────────────────────────────────────────────┐
│ 📅 BU HAFTA ÇALIŞMA PLANI                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ PAZARTESİ (Bugün)                                   │
│ ☑️ 15:00-15:30  Matematik - Yüzdeler ✅             │
│ ☐ 16:00-16:30  Fen - Elektrik                      │
│ ☐ 17:00-17:15  İngilizce - Kelime                  │
│                                                     │
│ SALI                                                │
│ ☐ 15:00-15:30  Türkçe - Paragraf                   │
│ ☐ 16:00-16:30  Matematik - Problem                 │
│                                                     │
│ ... (diğer günler)                                 │
│                                                     │
│ 🔥 Streak: 5 gün art arda  (🐝 rozet için 2 gün!)  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Liderlik Tablosu (Opt-in)

```
┌─────────────────────────────────────────────────────┐
│ 🏆 5/A SINIFI LİDERLİK TABLOSU                     │
├─────────────────────────────────────────────────────┤
│  #   İsim              Puan      Seviye  Rozetler  │
├─────────────────────────────────────────────────────┤
│  1   Zeynep K.         1,250     ⭐⭐⭐⭐⭐  🥇🏆🚀   │
│  2   Mehmet A.         1,180     ⭐⭐⭐⭐⭐  🥈🚀💪   │
│  3   Elif S.           1,050     ⭐⭐⭐⭐⭐  🥈⬆️🐝   │
│  ...                                               │
│  8   SEN → Ali Y.        780     ⭐⭐⭐⭐   🥈🐝📖   │
│  ...                                               │
│ 32   [Anonim]            120     ⭐       -        │
└─────────────────────────────────────────────────────┘

⚙️ Liderlik tablosuna katılımı kapat/aç
```

---

## 🔐 YETKİLENDİRME MATRİSİ

| Özellik | Owner | Admin | Principal | Teacher | Parent | Student |
|---------|-------|-------|-----------|---------|--------|---------|
| Tüm okulları gör | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Okul ayarları | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tüm sınıfları gör | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Kendi sınıfını gör | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Analiz oluştur | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Rapor oluştur | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Öğrenci ekle | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Veli davet et | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Çocuğunu gör | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Kendini gör | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Mesaj gönder | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Duyuru gönder | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 📱 MOBİL TASARIM NOTLARI

### Responsive Breakpoints
- **Mobile:** <640px
- **Tablet:** 640-1024px
- **Desktop:** >1024px

### Mobile-First Öncelikler
1. Dashboard kartları tek sütun
2. Büyük dokunma hedefleri (min 44px)
3. Swipe gestürler (sınav detayları arası)
4. Pull-to-refresh
5. Offline mod (son görüntülenen veri)

### PWA Özellikleri
- [ ] Service Worker
- [ ] Web App Manifest
- [ ] Push Notifications
- [ ] Offline caching
- [ ] App-like splash screen

---

> **Sonraki Adım:** Yönetici portalı tasarım mockup'ları hazırla
