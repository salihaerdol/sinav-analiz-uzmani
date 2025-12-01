@echo off
echo ================================
echo Supabase Entegrasyonu Kurulumu
echo ================================
echo.

echo Node.js versiyonu kontrol ediliyor...
node --version
if %errorlevel% neq 0 (
    echo HATA: Node.js yuklu degil! Lutfen Node.js yukleyin: https://nodejs.org
    pause
    exit /b 1
)
echo.

echo NPM versiyonu kontrol ediliyor...
npm --version
if %errorlevel% neq 0 (
    echo HATA: NPM yuklu degil!
    pause
    exit /b 1
)
echo.

echo Supabase kutuphanesi yukleniyor...
npm install @supabase/supabase-js
if %errorlevel% neq 0 (
    echo HATA: Supabase yukleme basarisiz!
    pause
    exit /b 1
)
echo.

echo ================================
echo Kurulum Tamamlandi!
echo ================================
echo.
echo Simdi asagidaki adimlari takip edin:
echo 1. Supabase hesabi olusturun: https://supabase.com
echo 2. Yeni bir proje olusturun
echo 3. SQL Editor'de supabase-setup.sql dosyasini calistirin
echo 4. .env.local dosyasina Supabase URL ve API key'inizi ekleyin
echo 5. npm run dev komutuyla uygulamayi baslatin
echo.
echo Detayli bilgi icin SUPABASE_SETUP.md dosyasini okuyun.
echo.
pause
