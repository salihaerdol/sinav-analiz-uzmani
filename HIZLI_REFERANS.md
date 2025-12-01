# 🚀 Hızlı Referans Kartı

## ⚡ Komutlar

```bash
# Kurulum
npm install                    # Tüm bağımlılıkları yükle
install-supabase.bat          # Sadece Supabase yükle

# Çalıştırma
npm run dev                   # Development server
npm run build                 # Production build
npm run preview               # Preview build

# Test
npm test                      # Testleri çalıştır
```

---

## 🔑 Environment Variables

```bash
# .env.local dosyası
GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 📊 Supabase Tabloları

```sql
-- Sınıf bilgileri
class_lists (id, grade, subject, className, schoolName, teacherName, academicYear)

-- Kazanımlar
achievements (id, code, description, grade, subject, source)

-- Senaryolar
scenarios (id, grade, subject, scenarioNumber, title, pdfUrl, achievements)
```

---

## 💻 API Kullanımı

### Sınıf İşlemleri
```typescript
import { classListService } from './services/supabase';

// Tüm sınıflar
const allClasses = await classListService.getAll();

// Sınıf ekle
await classListService.create({
  grade: '5',
  subject: 'İngilizce',
  className: '5/A',
  schoolName: 'Test Okulu',
  teacherName: 'Test Öğretmen',
  academicYear: '2025-2026'
});

// Sınıf sil
await classListService.delete(id);
```

### Kazanım İşlemleri
```typescript
import { achievementService } from './services/supabase';

// Tüm kazanımlar
const all = await achievementService.getAll();

// Sınıf ve derse göre
const filtered = await achievementService
  .getByGradeAndSubject('5', 'İngilizce');

// Kod ile ara
const results = await achievementService
  .searchByCode('E5.1');

// Tekli ekle
await achievementService.create({
  code: 'E5.1.S1',
  description: 'Can introduce...',
  grade: '5',
  subject: 'İngilizce',
  source: 'meb'
});

// Toplu ekle
await achievementService.bulkCreate([
  { code: 'E5.1.S1', ... },
  { code: 'E5.1.S2', ... }
]);
```

### MEB Senaryoları
```typescript
import { 
  MEB_SCENARIOS,
  getScenariosByGrade,
  downloadMEBPDF 
} from './services/mebScraper';

// Tüm senaryolar
console.log(MEB_SCENARIOS);

// Sınıfa göre filtrele
const grade9 = getScenariosByGrade('9');

// PDF indir
const blob = await downloadMEBPDF(
  'https://cdn.eba.gov.tr/.../ingg9.pdf'
);
```

---

## 🎨 Bileşen Kullanımı

### ClassListManager
```tsx
import { ClassListManager } from './components/ClassListManager';

<ClassListManager />
```

### ScenarioSelector
```tsx
import { ScenarioSelector } from './components/ScenarioSelector';

<ScenarioSelector
  grade="9"
  subject="İngilizce"
  onScenarioSelect={(achievements) => {
    console.log('Kazanımlar:', achievements);
  }}
/>
```

### SupabaseIntegration
```tsx
import { SupabaseIntegration } from './components/SupabaseIntegration';

const [showPanel, setShowPanel] = useState(false);

{showPanel && (
  <SupabaseIntegration
    grade="5"
    subject="İngilizce"
    onClose={() => setShowPanel(false)}
    onImportAchievements={(achs) => {
      // Kazanımları işle
    }}
  />
)}
```

---

## 🔍 Supabase Dashboard

### Hızlı Linkler
```
Dashboard: https://app.supabase.com
SQL Editor: .../editor
Table Editor: .../editor/{table}
API Settings: .../settings/api
Logs: .../logs/explorer
```

### SQL Komutları
```sql
-- Tüm sınıfları listele
SELECT * FROM class_lists ORDER BY createdAt DESC;

-- Belirli sınıftaki kazanımlar
SELECT * FROM achievements 
WHERE grade = '5' AND subject = 'İngilizce';

-- Son eklenen senaryolar
SELECT * FROM scenarios 
ORDER BY createdAt DESC LIMIT 10;

-- Veri sayıları
SELECT 
  (SELECT COUNT(*) FROM class_lists) as classes,
  (SELECT COUNT(*) FROM achievements) as achievements,
  (SELECT COUNT(*) FROM scenarios) as scenarios;
```

---

## 🐛 Hata Ayıklama

### Console Komutları
```javascript
// Browser Console'da (F12)

// Supabase durumunu kontrol et
localStorage.getItem('supabase.auth.token');

// Tüm local storage'ı temizle
localStorage.clear();

// Network isteklerini izle
// Network tab > Filter: supabase.co
```

### Yaygın Hatalar
```
❌ "Supabase is not defined"
→ npm install @supabase/supabase-js

❌ "401 Unauthorized"
→ API anahtarlarını kontrol et

❌ "Table does not exist"
→ supabase-setup.sql çalıştır

❌ "CORS Error"
→ Supabase CORS ayarlarını kontrol et
```

---

## 📁 Dosya Yolları

```
Proje Kökü: C:/Users/saliha/Desktop/sınav-analiz-uzmanı/

Backend:
  services/supabase.ts
  services/mebScraper.ts

Frontend:
  components/ClassListManager.tsx
  components/ScenarioSelector.tsx
  components/SupabaseIntegration.tsx

Config:
  .env.local
  Credentials.txt
  supabase-setup.sql
  package.json

Docs:
  README_SUPABASE.md
  HIZLI_BASLANGIC.md
  SUPABASE_SETUP.md
  ENTEGRASYON_OZETI.md
  KURULUM_KONTROL_LISTESI.md
  INTEGRATION_EXAMPLE.tsx
```

---

## 🎯 Hızlı Başlangıç (5 Dakika)

```bash
# 1. Supabase'e git
→ supabase.com > New Project

# 2. SQL çalıştır
→ Dashboard > SQL Editor > Paste supabase-setup.sql > Run

# 3. API keys al
→ Settings > API > Copy URL & Key

# 4. .env.local düzenle
VITE_SUPABASE_URL=<yapıştır>
VITE_SUPABASE_ANON_KEY=<yapıştır>

# 5. Başlat
npm install
npm run dev
```

---

## 📞 Yardım

### Dokümantasyon Önceliği
1. **İlk kez kuruyorum** → HIZLI_BASLANGIC.md
2. **Adım adım ilerlemek istiyorum** → KURULUM_KONTROL_LISTESI.md
3. **Detaylı bilgi istiyorum** → SUPABASE_SETUP.md
4. **Kod örnekleri arıyorum** → INTEGRATION_EXAMPLE.tsx
5. **Genel bakış istiyorum** → README_SUPABASE.md

### Online Yardım
- 📚 https://supabase.com/docs
- 💬 https://discord.supabase.com
- 🎥 https://youtube.com/c/supabase
- 📧 support@supabase.com

---

## 💾 Yedekleme

### Veritabanı Yedeği
```sql
-- Supabase Dashboard > Database > Backups
-- Manuel yedek: Backup now
-- Otomatik: Daily backups (Free plan)
```

### Kod Yedeği
```bash
# Git ile
git add .
git commit -m "Supabase entegrasyonu tamamlandı"
git push

# Manuel
# Tüm proje klasörünü ZIP'le
```

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] `.env.local` .gitignore'da
- [ ] `Credentials.txt` .gitignore'da
- [ ] API anahtarları gizli
- [ ] RLS politikaları aktif
- [ ] HTTPS kullanılıyor
- [ ] Güçlü database şifresi
- [ ] 2FA aktif (Supabase hesabı)

---

## 📊 Performans İpuçları

```typescript
// Index kullan
const results = await supabase
  .from('achievements')
  .select('*')
  .eq('grade', grade)  // Indexed column
  .eq('subject', subject);  // Indexed column

// Gereksiz veri çekme
.select('id, code, description')  // Sadece gerekli sütunlar

// Pagination
.range(0, 9)  // 10 kayıt

// Caching
const cached = localStorage.getItem('achievements');
```

---

## 🎨 UI İpuçları

```css
/* Gradient renkler */
bg-gradient-to-r from-indigo-600 to-violet-600

/* Hover efektleri */
hover:shadow-lg hover:scale-105 transition-all

/* Loading state */
{loading && <Loader2 className="animate-spin" />}

/* Error state */
{error && <AlertCircle className="text-red-500" />}
```

---

**Yazdır ve yanında tut!** 📄

*Bu kartı yazıcıdan çıkarıp masanıza koyabilirsiniz.*
