/**
 * MEB Konu Soru Dağılım Tabloları - 2025-2026 / 1. Dönem
 * Senaryo Kodu = PDF dosyasının ilk kelimesi (URL'deki kod)
 * Kaynak: https://odsgm.meb.gov.tr/www/1-donem-konu-soru-dagilim-tablolari-2025-2026/icerik/1474
 */

export interface MEBScenario {
    code: string;          // PDF'in URL'sindeki kod (örn: turk5, mat6, fen7)
    subject: string;       // Ders adı
    grade: number;         // Sınıf
    level: 'temel' | 'orta'; // Temel Eğitim (5-8) veya Ortaöğretim (9-12)
    publisher?: string;    // Yayınevi (varsa)
    pdfUrl: string;        // PDF URL
    academicYear: string;  // Eğitim yılı
    term: 1 | 2;          // Dönem
    lastUpdated: string;   // Son güncelleme
}

// 2025-2026 Eğitim Yılı 1. Dönem Tüm Senaryolar
export const MEB_SCENARIOS_2025_2026_TERM_1: MEBScenario[] = [
    // =====================================
    // TEMEL EĞİTİM - 5. SINIF
    // =====================================
    {
        code: 'turk5',
        subject: 'Türkçe',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat5',
        subject: 'Matematik',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fen5',
        subject: 'Fen Bilimleri',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fen5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'sos5',
        subject: 'Sosyal Bilgiler',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/sos5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab5',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ing5',
        subject: 'İngilizce',
        grade: 5,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ing5.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // TEMEL EĞİTİM - 6. SINIF
    // =====================================
    {
        code: 'turk6',
        subject: 'Türkçe',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat6',
        subject: 'Matematik',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fen6',
        subject: 'Fen Bilimleri',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fen6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'sos6',
        subject: 'Sosyal Bilgiler',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/sos6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab6',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ing6',
        subject: 'İngilizce',
        grade: 6,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ing6.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // TEMEL EĞİTİM - 7. SINIF
    // =====================================
    {
        code: 'turk7meb',
        subject: 'Türkçe',
        grade: 7,
        level: 'temel',
        publisher: 'MEB Yayınları',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk7meb.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'turk7ozgun',
        subject: 'Türkçe',
        grade: 7,
        level: 'temel',
        publisher: 'Özgün Yayınları',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk7ozgun.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat7',
        subject: 'Matematik',
        grade: 7,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat7_1.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fen7',
        subject: 'Fen Bilimleri',
        grade: 7,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fen7.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'sos7',
        subject: 'Sosyal Bilgiler',
        grade: 7,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/sos7.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab7',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 7,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab7.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ing7',
        subject: 'İngilizce',
        grade: 7,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ing7.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // TEMEL EĞİTİM - 8. SINIF
    // =====================================
    {
        code: 'turk8meb',
        subject: 'Türkçe',
        grade: 8,
        level: 'temel',
        publisher: 'MEB Yayınları',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk8meb_1.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'turk8hecce',
        subject: 'Türkçe',
        grade: 8,
        level: 'temel',
        publisher: 'Hecce Yayınları',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/turk8hecce_2.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat8',
        subject: 'Matematik',
        grade: 8,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat8_1.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fen8',
        subject: 'Fen Bilimleri',
        grade: 8,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fen8.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ita8',
        subject: 'T.C. İnkılap Tarihi ve Atatürkçülük',
        grade: 8,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ita8.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab8',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 8,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab8.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ing8',
        subject: 'İngilizce',
        grade: 8,
        level: 'temel',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ing8.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // ORTAÖĞRETİM - 9. SINIF
    // =====================================
    {
        code: 'tde9',
        subject: 'Türk Dili ve Edebiyatı',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tde9_1.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat9',
        subject: 'Matematik',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fiz9',
        subject: 'Fizik',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fiz9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'kim9',
        subject: 'Kimya',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/kim9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'biyo9',
        subject: 'Biyoloji',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/biyo9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'cog9',
        subject: 'Coğrafya',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'tar9',
        subject: 'Tarih',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab9',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ingg9',
        subject: 'İngilizce',
        grade: 9,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg9.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // ORTAÖĞRETİM - 10. SINIF
    // =====================================
    {
        code: 'tde10',
        subject: 'Türk Dili ve Edebiyatı',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tde10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat10',
        subject: 'Matematik',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fiz10',
        subject: 'Fizik',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fiz10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'kim10',
        subject: 'Kimya',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/kim10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'biyo10',
        subject: 'Biyoloji',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/biyo10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'cog10',
        subject: 'Coğrafya',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'tar10',
        subject: 'Tarih',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab10',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ingg10',
        subject: 'İngilizce',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fel10',
        subject: 'Felsefe',
        grade: 10,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel10.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // ORTAÖĞRETİM - 11. SINIF
    // =====================================
    {
        code: 'tde11',
        subject: 'Türk Dili ve Edebiyatı',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tde11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat11',
        subject: 'Matematik',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fiz11',
        subject: 'Fizik',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fiz11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'kim11',
        subject: 'Kimya',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/kim11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'biyo11',
        subject: 'Biyoloji',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/biyo11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'cog11',
        subject: 'Coğrafya',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'tar11',
        subject: 'Tarih',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab11',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ingg11',
        subject: 'İngilizce',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fel11',
        subject: 'Felsefe',
        grade: 11,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel11.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },

    // =====================================
    // ORTAÖĞRETİM - 12. SINIF
    // =====================================
    {
        code: 'tde12',
        subject: 'Türk Dili ve Edebiyatı',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tde12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'mat12',
        subject: 'Matematik',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/mat12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'fiz12',
        subject: 'Fizik',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fiz12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'kim12',
        subject: 'Kimya',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/kim12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'biyo12',
        subject: 'Biyoloji',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/biyo12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'cog12',
        subject: 'Coğrafya',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'tar12',
        subject: 'T.C. İnkılap Tarihi ve Atatürkçülük',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'dkab12',
        subject: 'Din Kültürü ve Ahlak Bilgisi',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    },
    {
        code: 'ingg12',
        subject: 'İngilizce',
        grade: 12,
        level: 'orta',
        pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg12.pdf',
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    }
];

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Senaryo kodu ile senaryo bul
 */
export function getScenarioByCode(code: string): MEBScenario | undefined {
    return MEB_SCENARIOS_2025_2026_TERM_1.find(s => s.code.toLowerCase() === code.toLowerCase());
}

/**
 * Sınıf ve ders ile senaryo bul
 */
export function getScenarioByGradeAndSubject(grade: number, subject: string): MEBScenario[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.filter(s =>
        s.grade === grade &&
        s.subject.toLowerCase().includes(subject.toLowerCase())
    );
}

/**
 * Sınıfa göre tüm senaryoları getir
 */
export function getScenariosByGrade(grade: number): MEBScenario[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.filter(s => s.grade === grade);
}

/**
 * Derse göre tüm senaryoları getir
 */
export function getScenariosBySubject(subject: string): MEBScenario[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.filter(s =>
        s.subject.toLowerCase().includes(subject.toLowerCase())
    );
}

/**
 * Seviyeye göre senaryoları getir
 */
export function getScenariosByLevel(level: 'temel' | 'orta'): MEBScenario[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.filter(s => s.level === level);
}

/**
 * Tüm benzersiz dersleri getir
 */
export function getAllSubjects(): string[] {
    return [...new Set(MEB_SCENARIOS_2025_2026_TERM_1.map(s => s.subject))];
}

/**
 * Tüm benzersiz sınıfları getir
 */
export function getAllGrades(): number[] {
    return [...new Set(MEB_SCENARIOS_2025_2026_TERM_1.map(s => s.grade))].sort((a, b) => a - b);
}

/**
 * Senaryo sayısını getir
 */
export function getScenarioCount(): number {
    return MEB_SCENARIOS_2025_2026_TERM_1.length;
}

/**
 * MEB kaynak URL'sini getir
 */
export function getMEBSourceURL(): string {
    return 'https://odsgm.meb.gov.tr/www/1-donem-konu-soru-dagilim-tablolari-2025-2026/icerik/1474';
}

/**
 * Senaryo kodundan ders ve sınıf bilgisi çıkar
 * Örnek: turk5 -> { subject: 'Türkçe', grade: 5 }
 */
export function parseScenarioCode(code: string): { subject: string; grade: number } | null {
    const match = code.match(/^([a-z]+)(\d+)/i);
    if (!match) return null;

    const [, subjectCode, gradeStr] = match;
    const grade = parseInt(gradeStr);

    const subjectMap: Record<string, string> = {
        'turk': 'Türkçe',
        'mat': 'Matematik',
        'fen': 'Fen Bilimleri',
        'sos': 'Sosyal Bilgiler',
        'dkab': 'Din Kültürü ve Ahlak Bilgisi',
        'ing': 'İngilizce',
        'ingg': 'İngilizce',
        'tde': 'Türk Dili ve Edebiyatı',
        'fiz': 'Fizik',
        'kim': 'Kimya',
        'biyo': 'Biyoloji',
        'cog': 'Coğrafya',
        'tar': 'Tarih',
        'ita': 'T.C. İnkılap Tarihi ve Atatürkçülük',
        'fel': 'Felsefe'
    };

    const subject = subjectMap[subjectCode.toLowerCase()] || subjectCode;
    return { subject, grade };
}
