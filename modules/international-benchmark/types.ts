// =====================================================
// MODÜL: ULUSLARARASI KIYASLAMA - TYPE TANIMLARI
// =====================================================

/**
 * PISA Yeterlilik Seviyeleri
 */
export type PISALevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * TIMSS Benchmark Seviyeleri
 */
export type TIMSSBenchmark = 'Advanced' | 'High' | 'Intermediate' | 'Low' | 'Below';

/**
 * Bloom Seviyesi
 */
export type BloomLevel = 'Hatırlama' | 'Anlama' | 'Uygulama' | 'Analiz' | 'Değerlendirme' | 'Yaratma';

/**
 * Kıyaslama alanları
 */
export type BenchmarkArea = 'Matematik' | 'Okuma' | 'Fen' | 'Fen Bilimleri' | 'Türkçe' | 'İngilizce';

/**
 * PISA karşılaştırma verileri
 */
export interface PISABenchmarkData {
    area: 'Matematik' | 'Okuma' | 'Fen';
    turkeyScore: number;      // Türkiye ortalaması
    oecdAverage: number;      // OECD ortalaması
    year: number;             // 2022

    // Level dağılımları (%)
    levelDistribution: {
        turkey: Record<PISALevel, number>;
        oecd: Record<PISALevel, number>;
    };
}

/**
 * TIMSS karşılaştırma verileri
 */
export interface TIMSSBenchmarkData {
    grade: 4 | 8;
    area: 'Matematik' | 'Fen';
    turkeyScore: number;
    internationalAverage: number;
    worldRank: number;
    year: number;  // 2023

    // Benchmark dağılımları (%)
    benchmarkDistribution: {
        turkey: Record<TIMSSBenchmark, number>;
        international: Record<TIMSSBenchmark, number>;
    };
}

/**
 * Öğrenci/Sınıf kıyaslama sonucu
 */
export interface BenchmarkResult {
    // Puan bilgileri
    localScore: number;           // Okulun puanı (0-100)
    pisaEquivalent: number;       // PISA ölçeğinde (300-700)
    timssEquivalent: number;      // TIMSS ölçeğinde (400-650)

    // PISA değerlendirmesi
    pisaLevel: PISALevel;
    pisaComparison: {
        vsTurkey: number;         // Türkiye'ye göre fark
        vsOECD: number;           // OECD'ye göre fark
        percentile: number;       // Türkiye'deki yüzdelik dilim
    };

    // TIMSS değerlendirmesi
    timssBenchmark: TIMSSBenchmark;
    timssComparison: {
        vsTurkey: number;
        vsInternational: number;
        worldPercentile: number;
    };

    // Genel değerlendirme
    overallStatus: 'excellent' | 'above_average' | 'average' | 'below_average' | 'needs_improvement';
    statusLabel: string;
    statusColor: string;
}

/**
 * Bloom Seviye karşılaştırması
 */
export interface BloomComparison {
    level: BloomLevel;
    schoolPercentage: number;
    turkeyAverage: number;
    oecdAverage: number;
    status: 'strong' | 'average' | 'needs_improvement';
}

/**
 * Tam kıyaslama raporu
 */
export interface BenchmarkReport {
    // Meta bilgileri
    schoolName: string;
    className: string;
    subject: BenchmarkArea;
    examTitle: string;
    date: string;

    // Puan kıyaslaması
    scoreComparison: BenchmarkResult;

    // Bloom seviye kıyaslaması
    bloomComparison: BloomComparison[];

    // Öneriler
    recommendations: string[];

    // Trend (varsa)
    trend?: {
        previousScore: number;
        change: number;
        direction: 'up' | 'down' | 'stable';
    };
}

/**
 * IRT Parametreleri
 */
export interface IRTParameters {
    difficulty: number;       // b: -3 to +3
    discrimination: number;   // a: 0 to 3
    guessing?: number;        // c: 0 to 0.5
    quality: 'excellent' | 'good' | 'acceptable' | 'poor';
}

/**
 * Madde analizi
 */
export interface ItemAnalysis {
    questionNumber: number;
    correctRate: number;        // 0-1
    pointBiserial: number;      // Korelasyon
    irt: IRTParameters;
    recommendation: string;
}
