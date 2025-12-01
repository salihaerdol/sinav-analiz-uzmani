# ===============================================
# KURULUM REHBERİ - Sınav Analiz Uzmanı v2.0
# ===============================================

echo "🎓 Sınav Analiz Uzmanı - Kurulum Başlıyor..."
echo ""

# Node.js kontrolü
echo "📦 Node.js kontrolü yapılıyor..."
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js bulunamadı! Lütfen önce Node.js kurun."
    echo "   https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js mevcut"
echo ""

# npm bağımlılıklarını yükle
echo "📥 Bağımlılıklar yükleniyor..."
npm install
echo "✅ Bağımlılıklar yüklendi"
echo ""

# xlsx-js-style kütüphanesini ekle
echo "📊 Excel desteği ekleniyor..."
npm install xlsx-js-style --save
echo "✅ Excel desteği eklendi"
echo ""

# .env.local dosyası kontrolü
echo "🔐 Ortam değişkenleri kontrol ediliyor..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local dosyası bulunamadı!"
    echo "📝 Örnek dosya oluşturuluyor..."
    cat > .env.local << EOF
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF
    echo "✅ .env.local dosyası oluşturuldu"
    echo "   ⚠️  Lütfen Supabase bilgilerinizi ekleyin!"
else
    echo "✅ .env.local mevcut"
fi
echo ""

echo "==============================================="
echo "✨ KURULUM TAMAMLANDI!"
echo "==============================================="
echo ""
echo "📚 Sıradaki Adımlar:"
echo ""
echo "1. .env.local dosyasını Supabase bilgilerinizle güncelleyin"
echo ""
echo "2. Supabase SQL Editor'de şu komutu çalıştırın:"
echo "   → database-schema-advanced.sql dosyasının içeriğini kopyalayıp yapıştırın"
echo ""
echo "3. Google OAuth ayarlarını yapın:"
echo "   → https://console.cloud.google.com"
echo "   → Credentials → OAuth 2.0 Client IDs"
echo "   → Supabase Authentication settings'e ekleyin"
echo ""
echo "4. Uygulamayı başlatın:"
echo "   npm run dev"
echo ""
echo "📖 Detaylı kılavuz: KULLANICI_REHBERI.md"
echo "🐛 Sorun mu var?: GitHub Issues"
echo ""
echo "🎉 İyi çalışmalar!"
echo "==============================================="
