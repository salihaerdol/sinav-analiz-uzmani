/**
 * Türkçe Karakter Desteği ve Font Yönetimi
 * PDF ve Word belgelerinde tam Türkçe karakter uyumu için yardımcı fonksiyonlar
 */

import jsPDF from 'jspdf';

// Türkçe karakterler için encoding tabloları
export const TURKISH_CHARS = {
    upper: ['Ç', 'Ğ', 'I', 'İ', 'Ö', 'Ş', 'Ü'],
    lower: ['ç', 'ğ', 'ı', 'i', 'ö', 'ş', 'ü'],
    all: ['Ç', 'ç', 'Ğ', 'ğ', 'I', 'ı', 'İ', 'i', 'Ö', 'ö', 'Ş', 'ş', 'Ü', 'ü']
};

// Base64 encoded Roboto font (subset with Turkish characters)
// This is a minimal subset to ensure Turkish character support
const ROBOTO_TURKISH_BASE64 = `AAEAAAATAQAABAAwR0RFRgBLAAgAAAE0AAAAHkdQT1MAAAEAAAABLAAAABZHU1VC...`; // Placeholder - actual font data would go here

/**
 * Font URL listesi - öncelik sırasına göre
 */
const FONT_SOURCES = [
    // Google Fonts CDN
    'https://fonts.gstatic.com/s/noto/sans/v32/notoSans-regular.ttf',
    // jsDelivr CDN
    'https://cdn.jsdelivr.net/npm/@fontsource/roboto@4.5.8/files/roboto-latin-400-normal.woff',
    // Unpkg CDN
    'https://unpkg.com/@fontsource/noto-sans@4.5.11/files/noto-sans-latin-400-normal.woff',
    // pdfMake font
    'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    // GitHub Raw
    'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto%5Bwdth%2Cwght%5D.ttf'
];

/**
 * ArrayBuffer'ı Base64 string'e çevir
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Türkçe karakter içeren metni normalize et
 */
export const normalizeTurkishText = (text: string): string => {
    if (!text) return '';

    // Unicode normalleştirme
    let normalized = text.normalize('NFC');

    // Türkçe karakter düzeltmeleri
    const replacements: Record<string, string> = {
        '\u0131': 'ı',  // dotless i
        '\u0130': 'İ',  // capital I with dot
        '\u015e': 'Ş',  // S with cedilla
        '\u015f': 'ş',  // s with cedilla
        '\u011e': 'Ğ',  // G with breve
        '\u011f': 'ğ',  // g with breve
        '\u00c7': 'Ç',  // C with cedilla
        '\u00e7': 'ç',  // c with cedilla
        '\u00d6': 'Ö',  // O with umlaut
        '\u00f6': 'ö',  // o with umlaut
        '\u00dc': 'Ü',  // U with umlaut
        '\u00fc': 'ü',  // u with umlaut
    };

    Object.entries(replacements).forEach(([from, to]) => {
        normalized = normalized.replace(new RegExp(from, 'g'), to);
    });

    return normalized;
};

/**
 * Metindeki Türkçe karakterleri ASCII karşılıklarıyla değiştir (fallback)
 */
export const toASCII = (text: string): string => {
    if (!text) return '';

    const map: Record<string, string> = {
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G',
        'ı': 'i', 'I': 'I',
        'i': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ş': 's', 'Ş': 'S',
        'ü': 'u', 'Ü': 'U'
    };

    return text.split('').map(char => map[char] || char).join('');
};

/**
 * Font yükle ve PDF'e ekle
 */
export const loadTurkishFont = async (doc: jsPDF): Promise<{ success: boolean; fontName: string }> => {
    // Önce localStorage'dan cache kontrol et
    const cachedFont = localStorage.getItem('pdf_font_cache');
    if (cachedFont) {
        try {
            const fontData = JSON.parse(cachedFont);
            if (fontData.base64 && fontData.name) {
                doc.addFileToVFS(`${fontData.name}.ttf`, fontData.base64);
                doc.addFont(`${fontData.name}.ttf`, fontData.name, 'normal');
                doc.setFont(fontData.name);
                return { success: true, fontName: fontData.name };
            }
        } catch (e) {
            localStorage.removeItem('pdf_font_cache');
        }
    }

    // Font kaynaklarını dene
    for (const url of FONT_SOURCES) {
        try {
            const response = await fetch(url, {
                mode: 'cors',
                cache: 'force-cache'
            });

            if (!response.ok) continue;

            const buffer = await response.arrayBuffer();
            if (buffer.byteLength < 1000) continue; // Çok küçük, muhtemelen hata

            const base64String = arrayBufferToBase64(buffer);
            const fontName = 'TurkishFont';

            doc.addFileToVFS(`${fontName}.ttf`, base64String);
            doc.addFont(`${fontName}.ttf`, fontName, 'normal');
            doc.setFont(fontName);

            // Cache'e kaydet
            try {
                localStorage.setItem('pdf_font_cache', JSON.stringify({
                    base64: base64String,
                    name: fontName,
                    timestamp: Date.now()
                }));
            } catch (e) {
                // localStorage dolu olabilir, devam et
            }

            return { success: true, fontName };
        } catch (e) {
            console.warn(`Font yüklenemedi: ${url}`, e);
        }
    }

    // Fallback: Helvetica kullan ama Türkçe karakterleri ASCII'ye çevir
    console.warn('Özel font yüklenemedi, Helvetica kullanılacak');
    return { success: false, fontName: 'helvetica' };
};

/**
 * PDF için güvenli metin oluştur
 * Font yüklenemezse Türkçe karakterleri dönüştürür
 */
export const createSafeText = (text: string, fontLoaded: boolean): string => {
    const normalized = normalizeTurkishText(text);
    return fontLoaded ? normalized : toASCII(normalized);
};

/**
 * Tarih formatla (Türkçe)
 */
export const formatDateTurkish = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Tarih formatla (İngilizce)
 */
export const formatDateEnglish = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/**
 * Sayıyı Türkçe formatla
 */
export const formatNumberTurkish = (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals).replace('.', ',');
};

/**
 * Dosya adını güvenli hale getir
 */
export const sanitizeFileName = (name: string): string => {
    // Türkçe karakterleri koru ama dosya sistemi için güvenli yap
    return name
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .trim();
};

/**
 * Türkçe büyük/küçük harf dönüşümü
 */
export const toUpperCaseTurkish = (text: string): string => {
    return text
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .toUpperCase();
};

export const toLowerCaseTurkish = (text: string): string => {
    return text
        .replace(/I/g, 'ı')
        .replace(/İ/g, 'i')
        .toLowerCase();
};

/**
 * Türkçe sıralama fonksiyonu
 */
export const compareTurkish = (a: string, b: string): number => {
    return a.localeCompare(b, 'tr', { sensitivity: 'base' });
};

/**
 * Word belgesi için Türkçe metin hazırla
 */
export const prepareTextForWord = (text: string): string => {
    // Word UTF-8 destekliyor, sadece normalize et
    return normalizeTurkishText(text);
};

/**
 * Excel için Türkçe metin hazırla
 */
export const prepareTextForExcel = (text: string): string => {
    // Excel UTF-8 BOM ile uyumlu
    return normalizeTurkishText(text);
};

/**
 * PDF Header/Footer için kısa metin oluştur
 */
export const createShortText = (text: string, maxLength: number = 30): string => {
    const normalized = normalizeTurkishText(text);
    if (normalized.length <= maxLength) return normalized;
    return normalized.substring(0, maxLength - 3) + '...';
};

/**
 * Başarı durumunu Türkçe olarak döndür
 */
export const getSuccessStatusTurkish = (rate: number): { text: string; color: string } => {
    if (rate >= 85) return { text: 'Pekiyi', color: '#22c55e' };
    if (rate >= 70) return { text: 'İyi', color: '#3b82f6' };
    if (rate >= 55) return { text: 'Orta', color: '#eab308' };
    if (rate >= 45) return { text: 'Geçer', color: '#f97316' };
    return { text: 'Başarısız', color: '#ef4444' };
};

/**
 * Başarı durumunu İngilizce olarak döndür
 */
export const getSuccessStatusEnglish = (rate: number): { text: string; color: string } => {
    if (rate >= 85) return { text: 'Excellent', color: '#22c55e' };
    if (rate >= 70) return { text: 'Good', color: '#3b82f6' };
    if (rate >= 55) return { text: 'Average', color: '#eab308' };
    if (rate >= 45) return { text: 'Pass', color: '#f97316' };
    return { text: 'Fail', color: '#ef4444' };
};
