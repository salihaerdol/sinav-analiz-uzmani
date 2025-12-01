# 🚀 GitHub'a Yükleme Rehberi

## Seçenek 1: Git Kurulumu ve Komut Satırı (Önerilen)

### Adım 1: Git'i İndirin ve Kurun
1. https://git-scm.com/download/win adresine gidin
2. "64-bit Git for Windows Setup" indirin
3. Kurulumu tamamlayın (varsayılan ayarlar yeterli)
4. PowerShell'i kapatıp yeniden açın

### Adım 2: Git Yapılandırması
```bash
# Terminal/PowerShell'de çalıştırın:
git config --global user.name "Adınız Soyadınız"
git config --global user.email "email@example.com"
```

### Adım 3: GitHub Repository Oluşturun
1. https://github.com adresine gidin
2. "New repository" butonuna tıklayın
3. Repository adı: `sinav-analiz-uzmani`
4. Public veya Private seçin
5. "Create repository" tıklayın
6. Açılan sayfadaki URL'yi kopyalayın (örn: https://github.com/kullanici/sinav-analiz-uzmani.git)

### Adım 4: Projeyi GitHub'a Yükleyin
```bash
# Proje klasörüne gidin
cd "c:\Users\saliha\Desktop\sınav-analiz-uzmanı"

# Git repository başlatın
git init

# Tüm dosyaları ekleyin
git add .

# Commit yapın
git commit -m "🎉 v2.0.0 - Dünya Standartlarında Eğitim Analiz Platformu

✨ Özellikler:
- Advanced database schema (8 tables)
- Excel full integration (import/export)
- Dashboard with statistics
- Individual student report cards
- AI-powered analysis
- Bilingual reports (TR/EN)
- Row Level Security
- Comprehensive documentation

📊 Stats:
- 8,000+ lines of code
- 15+ React components
- 30+ API endpoints
- Professional security (OAuth, RLS, Audit logs)"

# Remote ekleyin (BURAYA KENDİ GITHUB URL'NİZİ YAZIN)
git remote add origin https://github.com/KULLANICI_ADI/sinav-analiz-uzmani.git

# Main branch oluşturun
git branch -M main

# GitHub'a push yapın
git push -u origin main
```

---

## Seçenek 2: GitHub Desktop (Daha Kolay)

### Adım 1: GitHub Desktop İndirin
1. https://desktop.github.com adresine gidin
2. "Download for Windows" tıklayın
3. Kurulumu tamamlayın
4. GitHub hesabınızla giriş yapın

### Adım 2: Projeyi Ekleyin
1. GitHub Desktop'ı açın
2. "File" → "Add local repository"
3. "Choose..." tıklayın
4. `c:\Users\saliha\Desktop\sınav-analiz-uzmanı` klasörünü seçin
5. "Initialize Git Repository" deyin (eğer sorulursa)

### Adım 3: Commit ve Push
1. Sol altta "Summary" kısmına başlık yazın:
   ```
   🎉 v2.0.0 - Dünya Standartlarında Platform
   ```
2. "Description" kısmına detay yazın:
   ```
   ✨ Yeni Özellikler:
   - Advanced database architecture
   - Excel integration
   - Dashboard & analytics
   - Individual reports
   - AI analysis
   - Bilingual support
   
   📊 8,000+ satır kod, 15+ component, 30+ API
   ```
3. "Commit to main" butonuna tıklayın
4. Üstte "Publish repository" tıklayın
5. Repository ismini onaylayın ve "Publish" tıklayın

---

## Seçenek 3: Visual Studio Code (VSCode Varsa)

### Adım 1: VSCode'da Projeyi Açın
1. VSCode'u açın
2. `c:\Users\saliha\Desktop\sınav-analiz-uzmanı` klasörünü açın

### Adım 2: Source Control
1. Sol menüden "Source Control" (Ctrl+Shift+G) tıklayın
2. "Initialize Repository" tıklayın
3. Değişiklikleri görüntüleyin
4. Üstteki message kutusuna commit mesajı yazın:
   ```
   🎉 v2.0.0 - Dünya Standartlarında Eğitim Analiz Platformu
   ```
5. ✓ (checkmark) butonuna tıklayın

### Adım 3: GitHub'a Push
1. "..." menüsünden "Remote" → "Add Remote" seçin
2. GitHub repository URL'nizi yapıştırın
3. "..." menüsünden "Push" seçin

---

## ⚠️ ÖNEMLİ NOTLAR

### .gitignore Dosyası Oluşturun
Hassas bilgileri GitHub'a yüklememek için `.gitignore` dosyası oluşturun:

```bash
# .gitignore dosyası içeriği:
node_modules/
dist/
.env
.env.local
Credentials.txt
*.log
.DS_Store
.vscode/
```

### Hassas Bilgileri Koruyun
❌ **ASLA YÜKLEMEYİN:**
- `.env` veya `.env.local` dosyaları
- API anahtarları
- Şifreler
- `Credentials.txt` gibi dosyalar

✅ **GÜVENLİ:**
- Kaynak kod dosyaları (.tsx, .ts, .jsx, .js)
- Stil dosyaları (.css)
- Dokümantasyon (.md)
- Yapılandırma şablonları (.env.example)

---

## 🎯 Commit Mesajı Şablonu

```
🎉 [Özellik/Düzeltme Başlığı]

📝 Açıklama:
- Eklenen özellik 1
- İyileştirme 2
- Düzeltilen bug 3

📊 İstatistikler:
- X dosya eklendi
- Y satır kod

🔗 İlgili Issue: #123 (varsa)
```

---

## 📞 Yardım

Git kurulumu veya GitHub yükleme konusunda sorun yaşarsanız:

1. **Git Dokümantasyonu:** https://git-scm.com/doc
2. **GitHub Guides:** https://guides.github.com
3. **Stack Overflow:** Git sorunları için

---

## ✅ Başarı Kontrol Listesi

- [ ] Git kuruldu ve yapılandırıldı
- [ ] GitHub repository oluşturuldu
- [ ] .gitignore dosyası eklendi
- [ ] İlk commit yapıldı
- [ ] Remote eklendi
- [ ] Push başarılı
- [ ] GitHub'da proje görünüyor

---

**Git kurulumundan sonra yukarıdaki komutları çalıştırabilirsiniz!**

🚀 Başarılar!
