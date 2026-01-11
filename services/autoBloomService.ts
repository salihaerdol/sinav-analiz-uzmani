/**
 * ═══════════════════════════════════════════════════════════════
 * OTOMATİK BLOOM TAKSONOMİSİ ETİKETLEME SERVİSİ
 * ═══════════════════════════════════════════════════════════════
 * 
 * Kazanım metinlerinden ve soru performansından otomatik olarak
 * Bloom Taksonomisi seviyesi ve güçlük derecesi tahmin eder.
 * 
 * Özellikler:
 * - Anahtar kelime analizi (Türkçe NLP)
 * - MEB kazanım kodundan çıkarım
 * - Başarı oranından güçlük tahmini (IRT benzeri)
 * - Güven skoru hesaplama
 */

import { QuestionConfig } from '../types';

// ═══════════════════════════════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════════════════════════════

export type BloomLevel =
    | 'Bilgi'
    | 'Kavrama'
    | 'Uygulama'
    | 'Analiz'
    | 'Sentez'
    | 'Değerlendirme';

export type DifficultyLevel = 'Kolay' | 'Orta' | 'Zor';

export interface AutoBloomResult {
    cognitiveLevel: BloomLevel;
    difficulty: DifficultyLevel;
    confidence: number; // 0-100
    source: 'keyword' | 'outcome_code' | 'success_rate' | 'ai' | 'manual';
    keywords: string[];
}

export interface BloomAnalysisConfig {
    useKeywords?: boolean;
    useOutcomeCode?: boolean;
    useSuccessRate?: boolean;
    successRate?: number; // 0-100
}

// ═══════════════════════════════════════════════════════════════
// ANAHTAR KELİME VERİTABANI (Türkçe)
// ═══════════════════════════════════════════════════════════════

/**
 * Bloom Taksonomisi Revize (Anderson & Krathwohl, 2001) tabanlı
 * Türkçe anahtar kelimeler
 */
export const BLOOM_KEYWORDS: Record<BloomLevel, string[]> = {
    Bilgi: [
        // Temel hatırlama fiilleri
        'tanımla', 'tanımlar', 'tanımlama',
        'listele', 'listeler', 'listeleme',
        'hatırla', 'hatırlar', 'hatırlama',
        'bul', 'bulur', 'bulma',
        'adlandır', 'adlandırır', 'adlandırma',
        'söyle', 'söyler', 'söyleme',
        'sırala', 'sıralar', 'sıralama',
        'say', 'sayar', 'sayma',
        'eşleştir', 'eşleştirir', 'eşleştirme',
        'işaretle', 'işaretler', 'işaretleme',
        'ezberle', 'ezberler', 'ezberleme',
        'yaz', 'yazar', 'yazma',
        'tekrarla', 'tekrarlar', 'tekrarlama',
        'belirt', 'belirtir', 'belirtme',
        'göster', 'gösterir', 'gösterme',
        'seç', 'seçer', 'seçme',
        'tanı', 'tanır', 'tanıma',
        'bilgi', 'bilgisi', 'bilir',
        'ne', 'nedir', 'kim', 'nerede', 'ne zaman'
    ],

    Kavrama: [
        // Anlama ve yorumlama fiilleri
        'açıkla', 'açıklar', 'açıklama',
        'anlat', 'anlatır', 'anlatma',
        'özetle', 'özetler', 'özetleme',
        'yorumla', 'yorumlar', 'yorumlama',
        'karşılaştır', 'karşılaştırır', 'karşılaştırma',
        'sınıflandır', 'sınıflandırır', 'sınıflandırma',
        'örnek ver', 'örnekler', 'örnekleme',
        'tahmin et', 'tahmin eder', 'tahmin etme',
        'çevir', 'çevirir', 'çevirme',
        'ifade et', 'ifade eder', 'ifade etme',
        'ayırt et', 'ayırt eder', 'ayırt etme',
        'farkını', 'farkını belirtir', 'fark',
        'benzerlik', 'benzerliğini', 'benzer',
        'neden', 'nedeni', 'nedenini',
        'nasıl', 'nasıl çalışır',
        'kendi cümlesiyle', 'kendi sözleriyle',
        'anlamını', 'anlamı', 'anlam',
        'kavra', 'kavrar', 'kavrama',
        'sonuç çıkar', 'sonuç çıkarır'
    ],

    Uygulama: [
        // Uygulama ve problem çözme fiilleri
        'uygula', 'uygular', 'uygulama',
        'çöz', 'çözer', 'çözme',
        'hesapla', 'hesaplar', 'hesaplama',
        'kullan', 'kullanır', 'kullanma',
        'göster', 'gösterir', 'gösterme',
        'gerçekleştir', 'gerçekleştirir', 'gerçekleştirme',
        'yap', 'yapar', 'yapma',
        'oluştur', 'oluşturur', 'oluşturma',
        'çiz', 'çizer', 'çizme',
        'tamamla', 'tamamlar', 'tamamlama',
        'doldur', 'doldurur', 'doldurma',
        'düzenle', 'düzenler', 'düzenleme',
        'işlem', 'işlemler', 'işlem yapar',
        'problem', 'problemi', 'problem çözer',
        'bölme', 'çarpma', 'toplama', 'çıkarma',
        'deneme', 'deneyi', 'deney',
        'yöntemi', 'yöntem', 'yöntemini'
    ],

    Analiz: [
        // Çözümleme ve inceleme fiilleri
        'analiz et', 'analiz eder', 'analiz',
        'çözümle', 'çözümler', 'çözümleme',
        'incele', 'inceler', 'inceleme',
        'karşılaştır', 'karşılaştırır', 'karşılaştırma',
        'ayır', 'ayırır', 'ayırma',
        'ilişkilendir', 'ilişkilendirir', 'ilişkilendirme',
        'grupla', 'gruplar', 'gruplama',
        'bölümle', 'bölümler', 'bölümleme',
        'kestirim', 'kestirir', 'kestirme',
        'neden-sonuç', 'nedeni ve sonucu',
        'bağlantı', 'bağlantıyı', 'bağlantı kurar',
        'ilişki', 'ilişkiyi', 'ilişki kurar',
        'sonuç çıkar', 'sonuç çıkarır', 'çıkarım',
        'varsayım', 'varsayımı', 'varsayar',
        'hipotez', 'hipotezi', 'hipotez kurar',
        'nitelikleri', 'niteliklerini', 'nitelik',
        'özellikleri', 'özelliklerini', 'özellik',
        'faktör', 'faktörleri', 'etken'
    ],

    Sentez: [
        // Yaratma ve birleştirme fiilleri
        'tasarla', 'tasarlar', 'tasarlama',
        'oluştur', 'oluşturur', 'oluşturma',
        'planla', 'planlar', 'planlama',
        'geliştir', 'geliştirir', 'geliştirme',
        'yaz', 'yazar', 'yazma',
        'model', 'modeller', 'modelleme',
        'kur', 'kurar', 'kurma',
        'birleştir', 'birleştirir', 'birleştirme',
        'formül', 'formülize', 'formüle',
        'üret', 'üretir', 'üretme',
        'yarat', 'yaratır', 'yaratma',
        'yeni', 'yenilik', 'yenilikçi',
        'özgün', 'özgünlük', 'orijinal',
        'proje', 'projeyi', 'proje oluştur',
        'hikaye', 'hikayeyi', 'hikaye yaz',
        'kompozisyon', 'kompozisyonu', 'kompozisyon yaz',
        'strateji', 'stratejiyi', 'strateji geliştir'
    ],

    Değerlendirme: [
        // Yargılama ve karar verme fiilleri
        'değerlendir', 'değerlendirir', 'değerlendirme',
        'eleştir', 'eleştirir', 'eleştirme',
        'savun', 'savunur', 'savunma',
        'kanıtla', 'kanıtlar', 'kanıtlama',
        'seç', 'seçer', 'seçme',
        'gerekçelendir', 'gerekçelendirir', 'gerekçelendirme',
        'yargıla', 'yargılar', 'yargılama',
        'karar ver', 'karar verir', 'karar verme',
        'önceliklendir', 'önceliklendirir', 'önceliklendirme',
        'karşılaştır ve değerlendir',
        'hangisi', 'hangisini', 'en uygun',
        'en iyi', 'en doğru', 'en etkili',
        'tercih', 'tercih et', 'tercih eder',
        'öneri', 'öneri sun', 'öneride bulun',
        'tavsiye', 'tavsiye et', 'tavsiye eder',
        'haklı', 'haklılık', 'haksız',
        'doğru', 'yanlış', 'doğruluğu',
        'avantaj', 'dezavantaj', 'artı', 'eksi'
    ]
};

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

/**
 * Türkçe metni normalleştirme
 */
function normalizeText(text: string): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Türkçe karakterlerle orijinal metni küçük harfe çevirir
 */
function toLowerTurkish(text: string): string {
    if (!text) return '';
    return text.toLocaleLowerCase('tr-TR');
}

// ═══════════════════════════════════════════════════════════════
// ANA ANALİZ FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════

/**
 * Anahtar kelime analizi ile Bloom seviyesi tahmin et
 */
export function analyzeBloomByKeywords(text: string): {
    level: BloomLevel | null;
    confidence: number;
    matchedKeywords: string[];
} {
    if (!text) {
        return { level: null, confidence: 0, matchedKeywords: [] };
    }

    const normalizedText = toLowerTurkish(text);
    const results: { level: BloomLevel; score: number; keywords: string[] }[] = [];

    // Her Bloom seviyesi için anahtar kelime eşleşmelerini say
    for (const [level, keywords] of Object.entries(BLOOM_KEYWORDS) as [BloomLevel, string[]][]) {
        const matchedKeywords: string[] = [];
        let score = 0;

        for (const keyword of keywords) {
            const normalizedKeyword = toLowerTurkish(keyword);
            if (normalizedText.includes(normalizedKeyword)) {
                matchedKeywords.push(keyword);
                // Daha uzun eşleşmeler daha değerli
                score += keyword.length >= 6 ? 2 : 1;
            }
        }

        if (score > 0) {
            results.push({ level, score, keywords: matchedKeywords });
        }
    }

    if (results.length === 0) {
        return { level: null, confidence: 0, matchedKeywords: [] };
    }

    // En yüksek skora sahip seviyeyi seç
    results.sort((a, b) => b.score - a.score);
    const best = results[0];

    // Güven skoru hesapla (max 100)
    const maxPossibleScore = 10; // Varsayılan maksimum
    const confidence = Math.min(100, (best.score / maxPossibleScore) * 100);

    return {
        level: best.level,
        confidence: Math.round(confidence),
        matchedKeywords: best.keywords
    };
}

/**
 * MEB kazanım kodundan Bloom seviyesi tahmin et
 * Örnek kodlar: 
 * - M.5.1.1.1 (Matematik.5.Ünite.Konu.Kazanım)
 * - F.6.3.2.1 (Fen.6.Ünite.Konu.Kazanım)
 */
export function analyzeBloomByOutcomeCode(code: string): {
    level: BloomLevel | null;
    confidence: number;
} {
    if (!code) {
        return { level: null, confidence: 0 };
    }

    // MEB kodundan ders ve seviye bilgisi çıkar
    const parts = code.split('.');
    if (parts.length < 4) {
        return { level: null, confidence: 0 };
    }

    // Son kısım genellikle kazanım numarası
    // İlk kazanımlar genellikle temel (Bilgi/Kavrama)
    // Son kazanımlar genellikle ileri (Analiz/Sentez)
    const outcomeNumber = parseInt(parts[parts.length - 1], 10);
    const topicNumber = parseInt(parts[parts.length - 2], 10);

    if (isNaN(outcomeNumber)) {
        return { level: null, confidence: 0 };
    }

    // Basit heuristik: 
    // - İlk kazanımlar (1-2) → Bilgi/Kavrama
    // - Orta kazanımlar (3-5) → Uygulama
    // - Son kazanımlar (6+) → Analiz ve üstü
    let level: BloomLevel;
    let confidence: number;

    if (outcomeNumber <= 2) {
        level = 'Kavrama';
        confidence = 40;
    } else if (outcomeNumber <= 5) {
        level = 'Uygulama';
        confidence = 50;
    } else if (outcomeNumber <= 8) {
        level = 'Analiz';
        confidence = 40;
    } else {
        level = 'Değerlendirme';
        confidence = 30;
    }

    return { level, confidence };
}

/**
 * Başarı oranından güçlük seviyesi tahmin et (IRT benzeri)
 * 
 * IRT (Item Response Theory) temelinde basitleştirilmiş yaklaşım:
 * - %75+ başarı → Kolay
 * - %45-75 başarı → Orta
 * - %45 altı başarı → Zor
 */
export function calculateDifficultyFromSuccessRate(successRate: number): {
    difficulty: DifficultyLevel;
    confidence: number;
    irtEstimate: number;
} {
    // IRT güçlük tahmini (b parametresi)
    // Formül: b ≈ -ln(p / (1-p)) basitleştirilmiş
    const p = Math.max(0.01, Math.min(0.99, successRate / 100));
    const irtEstimate = -Math.log(p / (1 - p));

    let difficulty: DifficultyLevel;
    let confidence: number;

    if (successRate >= 75) {
        difficulty = 'Kolay';
        confidence = 80;
    } else if (successRate >= 45) {
        difficulty = 'Orta';
        confidence = 85;
    } else {
        difficulty = 'Zor';
        confidence = 80;
    }

    return {
        difficulty,
        confidence,
        irtEstimate: Math.round(irtEstimate * 100) / 100
    };
}

/**
 * Bloom seviyesinden varsayılan güçlük tahmin et
 */
export function inferDifficultyFromBloom(level: BloomLevel): DifficultyLevel {
    switch (level) {
        case 'Bilgi':
            return 'Kolay';
        case 'Kavrama':
            return 'Kolay';
        case 'Uygulama':
            return 'Orta';
        case 'Analiz':
            return 'Orta';
        case 'Sentez':
            return 'Zor';
        case 'Değerlendirme':
            return 'Zor';
        default:
            return 'Orta';
    }
}

// ═══════════════════════════════════════════════════════════════
// ENTEGRE ANALİZ FONKSİYONU
// ═══════════════════════════════════════════════════════════════

/**
 * Kapsamlı otomatik Bloom analizi
 * Tüm kaynakları birleştirerek en iyi tahmini üretir
 */
export function analyzeBloomAuto(
    question: QuestionConfig,
    config: BloomAnalysisConfig = {}
): AutoBloomResult {
    const {
        useKeywords = true,
        useOutcomeCode = true,
        useSuccessRate = true,
        successRate
    } = config;

    const description = question.outcome?.description || '';
    const code = question.outcome?.code || '';

    // Sonuçları topla
    const results: {
        level: BloomLevel;
        confidence: number;
        source: AutoBloomResult['source'];
        keywords: string[];
    }[] = [];

    // 1. Anahtar kelime analizi
    if (useKeywords && description) {
        const keywordResult = analyzeBloomByKeywords(description);
        if (keywordResult.level) {
            results.push({
                level: keywordResult.level,
                confidence: keywordResult.confidence,
                source: 'keyword',
                keywords: keywordResult.matchedKeywords
            });
        }
    }

    // 2. Kazanım kodu analizi
    if (useOutcomeCode && code) {
        const codeResult = analyzeBloomByOutcomeCode(code);
        if (codeResult.level) {
            results.push({
                level: codeResult.level,
                confidence: codeResult.confidence,
                source: 'outcome_code',
                keywords: []
            });
        }
    }

    // En yüksek güven skoruna sahip sonucu seç
    if (results.length === 0) {
        // Varsayılan: Uygulama (orta seviye)
        return {
            cognitiveLevel: 'Uygulama',
            difficulty: 'Orta',
            confidence: 10,
            source: 'keyword',
            keywords: []
        };
    }

    results.sort((a, b) => b.confidence - a.confidence);
    const best = results[0];

    // Güçlük hesapla
    let difficulty: DifficultyLevel;
    let difficultySource: AutoBloomResult['source'] = best.source;

    if (useSuccessRate && typeof successRate === 'number') {
        // Başarı oranı varsa onu kullan
        const difficultyResult = calculateDifficultyFromSuccessRate(successRate);
        difficulty = difficultyResult.difficulty;
        difficultySource = 'success_rate';
    } else {
        // Bloom seviyesinden varsayılan güçlük
        difficulty = inferDifficultyFromBloom(best.level);
    }

    return {
        cognitiveLevel: best.level,
        difficulty,
        confidence: best.confidence,
        source: best.source,
        keywords: best.keywords
    };
}

/**
 * Soru listesine otomatik Bloom etiketleme uygula
 * Manuel etiketlemeler korunur
 */
export function applyAutoBloomToQuestions(
    questions: QuestionConfig[],
    questionSuccessRates?: Map<number, number> // questionId -> successRate
): QuestionConfig[] {
    return questions.map(question => {
        // Manuel etiketleme varsa koru
        if (question.cognitiveLevel && question.difficulty) {
            return question;
        }

        const successRate = questionSuccessRates?.get(question.id);
        const result = analyzeBloomAuto(question, { successRate });

        return {
            ...question,
            cognitiveLevel: question.cognitiveLevel || result.cognitiveLevel,
            difficulty: question.difficulty || result.difficulty
        };
    });
}

/**
 * Tek soru için otomatik etiketleme önerisi al
 */
export function getBloomSuggestion(
    question: QuestionConfig,
    successRate?: number
): AutoBloomResult {
    return analyzeBloomAuto(question, {
        useKeywords: true,
        useOutcomeCode: true,
        useSuccessRate: typeof successRate === 'number',
        successRate
    });
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
    analyzeBloomByKeywords,
    analyzeBloomByOutcomeCode,
    calculateDifficultyFromSuccessRate,
    inferDifficultyFromBloom,
    analyzeBloomAuto,
    applyAutoBloomToQuestions,
    getBloomSuggestion,
    BLOOM_KEYWORDS
};
