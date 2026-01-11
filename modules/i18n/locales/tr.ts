// =====================================================
// MODÜL: ULUSLARARASILAŞTIRMA (i18n) - TÜRKÇE ÇEVİRİLER
// =====================================================

import { Translations } from '../types';

export const tr: Translations = {
    common: {
        // Genel
        appName: 'Sınav Analiz Uzmanı',
        loading: 'Yükleniyor...',
        error: 'Hata',
        success: 'Başarılı',
        warning: 'Uyarı',
        info: 'Bilgi',

        // Eylemler
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        create: 'Oluştur',
        update: 'Güncelle',
        search: 'Ara',
        filter: 'Filtrele',
        export: 'Dışa Aktar',
        import: 'İçe Aktar',
        download: 'İndir',
        upload: 'Yükle',
        print: 'Yazdır',
        close: 'Kapat',
        back: 'Geri',
        next: 'İleri',
        previous: 'Önceki',
        confirm: 'Onayla',

        // Durum
        active: 'Aktif',
        inactive: 'Pasif',
        pending: 'Beklemede',
        completed: 'Tamamlandı',
        draft: 'Taslak',

        // Zaman
        today: 'Bugün',
        yesterday: 'Dün',
        thisWeek: 'Bu Hafta',
        thisMonth: 'Bu Ay',
        lastMonth: 'Geçen Ay',

        // Sayfalama
        page: 'Sayfa',
        of: '/',
        showing: 'Gösterilen',
        items: 'öğe',
        noResults: 'Sonuç bulunamadı'
    },

    auth: {
        login: 'Giriş Yap',
        logout: 'Çıkış Yap',
        register: 'Kayıt Ol',
        forgotPassword: 'Şifremi Unuttum',
        resetPassword: 'Şifre Sıfırla',
        email: 'E-posta',
        password: 'Şifre',
        confirmPassword: 'Şifre Tekrar',
        rememberMe: 'Beni Hatırla',
        loginSuccess: 'Başarıyla giriş yapıldı',
        loginError: 'Giriş başarısız',
        logoutSuccess: 'Başarıyla çıkış yapıldı',
        sessionExpired: 'Oturum süresi doldu',
        unauthorized: 'Yetkisiz erişim',
        forbidden: 'Bu işlem için yetkiniz yok'
    },

    dashboard: {
        title: 'Kontrol Paneli',
        welcome: 'Hoş Geldiniz',
        overview: 'Genel Bakış',
        statistics: 'İstatistikler',
        recentActivity: 'Son Aktiviteler',
        quickActions: 'Hızlı İşlemler',

        // KPIs
        totalStudents: 'Toplam Öğrenci',
        totalExams: 'Toplam Sınav',
        averageScore: 'Ortalama Puan',
        passRate: 'Başarı Oranı',
        riskStudents: 'Riskli Öğrenci',

        // Grafikler
        performanceTrend: 'Performans Trendi',
        subjectComparison: 'Ders Karşılaştırma',
        bloomDistribution: 'Bloom Dağılımı',
        difficultyAnalysis: 'Zorluk Analizi'
    },

    exam: {
        title: 'Sınav',
        exams: 'Sınavlar',
        newExam: 'Yeni Sınav',
        editExam: 'Sınavı Düzenle',
        deleteExam: 'Sınavı Sil',
        examDetails: 'Sınav Detayları',

        // Alanlar
        examName: 'Sınav Adı',
        subject: 'Ders',
        grade: 'Sınıf',
        date: 'Tarih',
        duration: 'Süre',
        questions: 'Sorular',
        students: 'Öğrenciler',
        score: 'Puan',

        // Analiz
        analyze: 'Analiz Et',
        analysis: 'Analiz',
        results: 'Sonuçlar',
        statistics: 'İstatistikler',

        // Durumlar
        notStarted: 'Başlamadı',
        inProgress: 'Devam Ediyor',
        completed: 'Tamamlandı'
    },

    student: {
        title: 'Öğrenci',
        students: 'Öğrenciler',
        studentDetails: 'Öğrenci Detayları',
        studentProgress: 'Öğrenci İlerlemesi',

        // Alanlar
        name: 'Ad Soyad',
        studentNumber: 'Öğrenci Numarası',
        className: 'Sınıf',
        parent: 'Veli',

        // Analiz
        strongPoints: 'Güçlü Yönler',
        weakPoints: 'Zayıf Yönler',
        recommendations: 'Öneriler',
        riskLevel: 'Risk Seviyesi'
    },

    report: {
        title: 'Rapor',
        reports: 'Raporlar',
        newReport: 'Yeni Rapor',
        generateReport: 'Rapor Oluştur',
        exportReport: 'Raporu Dışa Aktar',

        // Türler
        classReport: 'Sınıf Raporu',
        studentReport: 'Öğrenci Raporu',
        examReport: 'Sınav Raporu',
        progressReport: 'İlerleme Raporu',

        // Seçenekler
        includeCharts: 'Grafikleri Dahil Et',
        includeRecommendations: 'Önerileri Dahil Et',
        includeAIAnalysis: 'AI Analizini Dahil Et'
    },

    benchmark: {
        title: 'Kıyaslama',
        pisaComparison: 'PISA Karşılaştırması',
        timssComparison: 'TIMSS Karşılaştırması',
        nationalAverage: 'Ulusal Ortalama',
        oecdAverage: 'OECD Ortalaması',
        yourScore: 'Puanınız',
        level: 'Seviye',
        benchmark: 'Kıyaslama',
        aboveAverage: 'Ortalamanın Üstünde',
        belowAverage: 'Ortalamanın Altında',
        onTarget: 'Hedefe Uygun'
    }
};
