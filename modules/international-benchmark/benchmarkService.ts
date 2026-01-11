// =====================================================
// MODÜL: ULUSLARARASI KIYASLAMA - VERİ VE HESAPLAMA SERVİSİ
// =====================================================

import {
    PISALevel,
    TIMSSBenchmark,
    BloomLevel,
    PISABenchmarkData,
    TIMSSBenchmarkData,
    BenchmarkResult,
    BloomComparison,
    BenchmarkReport,
    IRTParameters,
    ItemAnalysis,
    BenchmarkArea
} from './types';

// ═══════════════════════════════════════════════════════════════
// REFERANS VERİLERİ (PISA 2022, TIMSS 2023)
// ═══════════════════════════════════════════════════════════════

export const PISA_2022_DATA: Record<'Matematik' | 'Okuma' | 'Fen', PISABenchmarkData> = {
    Matematik: {
        area: 'Matematik',
        turkeyScore: 453,
        oecdAverage: 472,
        year: 2022,
        levelDistribution: {
            turkey: { 0: 17, 1: 22, 2: 28, 3: 22, 4: 8, 5: 2.5, 6: 0.5 },
            oecd: { 0: 13, 1: 18, 2: 25, 3: 25, 4: 14, 5: 5, 6: 0 }
        }
    },
    Okuma: {
        area: 'Okuma',
        turkeyScore: 456,
        oecdAverage: 476,
        year: 2022,
        levelDistribution: {
            turkey: { 0: 15, 1: 21, 2: 29, 3: 24, 4: 9, 5: 2, 6: 0 },
            oecd: { 0: 12, 1: 16, 2: 24, 3: 27, 4: 16, 5: 5, 6: 0 }
        }
    },
    Fen: {
        area: 'Fen',
        turkeyScore: 476,
        oecdAverage: 485,
        year: 2022,
        levelDistribution: {
            turkey: { 0: 11, 1: 18, 2: 27, 3: 27, 4: 13, 5: 4, 6: 0 },
            oecd: { 0: 10, 1: 15, 2: 23, 3: 28, 4: 18, 5: 6, 6: 0 }
        }
    }
};

export const TIMSS_2023_DATA: Record<string, TIMSSBenchmarkData> = {
    'Matematik_4': {
        grade: 4,
        area: 'Matematik',
        turkeyScore: 553,
        internationalAverage: 500,
        worldRank: 8,
        year: 2023,
        benchmarkDistribution: {
            turkey: { Advanced: 24, High: 34, Intermediate: 24, Low: 13, Below: 5 },
            international: { Advanced: 9, High: 25, Intermediate: 30, Low: 23, Below: 13 }
        }
    },
    'Matematik_8': {
        grade: 8,
        area: 'Matematik',
        turkeyScore: 509,
        internationalAverage: 500,
        worldRank: 13,
        year: 2023,
        benchmarkDistribution: {
            turkey: { Advanced: 8, High: 24, Intermediate: 28, Low: 22, Below: 18 },
            international: { Advanced: 7, High: 20, Intermediate: 26, Low: 25, Below: 22 }
        }
    },
    'Fen_4': {
        grade: 4,
        area: 'Fen',
        turkeyScore: 570,
        internationalAverage: 500,
        worldRank: 4,
        year: 2023,
        benchmarkDistribution: {
            turkey: { Advanced: 28, High: 36, Intermediate: 22, Low: 10, Below: 4 },
            international: { Advanced: 7, High: 22, Intermediate: 28, Low: 26, Below: 17 }
        }
    },
    'Fen_8': {
        grade: 8,
        area: 'Fen',
        turkeyScore: 530,
        internationalAverage: 500,
        worldRank: 7,
        year: 2023,
        benchmarkDistribution: {
            turkey: { Advanced: 12, High: 30, Intermediate: 28, Low: 18, Below: 12 },
            international: { Advanced: 6, High: 18, Intermediate: 28, Low: 28, Below: 20 }
        }
    }
};

// Bloom seviyesi Türkiye ve OECD ortalamaları
export const BLOOM_AVERAGES: Record<BloomLevel, { turkey: number; oecd: number }> = {
    'Hatırlama': { turkey: 80, oecd: 75 },
    'Anlama': { turkey: 72, oecd: 70 },
    'Uygulama': { turkey: 65, oecd: 68 },
    'Analiz': { turkey: 48, oecd: 55 },
    'Değerlendirme': { turkey: 38, oecd: 42 },
    'Yaratma': { turkey: 28, oecd: 35 }
};

// ═══════════════════════════════════════════════════════════════
// PISA HESAPLAMALARI
// ═══════════════════════════════════════════════════════════════

/**
 * Yerel puanı PISA ölçeğine dönüştür (0-100 → 300-700)
 */
export function convertToPISAScale(localScore: number): number {
    // Lineer dönüşüm: 0 → 300, 100 → 700
    return 300 + (localScore / 100) * 400;
}

/**
 * PISA seviyesini hesapla
 */
export function calculatePISALevel(pisaScore: number): PISALevel {
    if (pisaScore >= 669) return 6;
    if (pisaScore >= 607) return 5;
    if (pisaScore >= 545) return 4;
    if (pisaScore >= 482) return 3;
    if (pisaScore >= 420) return 2;
    if (pisaScore >= 358) return 1;
    return 0;
}

/**
 * PISA seviye açıklaması
 */
export function getPISALevelDescription(level: PISALevel, area: 'Matematik' | 'Okuma' | 'Fen'): string {
    const descriptions: Record<PISALevel, Record<string, string>> = {
        6: {
            Matematik: 'İleri düşünme ve genelleme yapabilir',
            Okuma: 'Karmaşık metinleri derinlemesine analiz edebilir',
            Fen: 'Bilimsel modeller geliştirebilir'
        },
        5: {
            Matematik: 'Karmaşık problemleri modelleyebilir',
            Okuma: 'Farklı kaynaklardan sentez yapabilir',
            Fen: 'Karmaşık fenolojik açıklamalar yapabilir'
        },
        4: {
            Matematik: 'Çok adımlı işlemleri yürütebilir',
            Okuma: 'Uzun metinleri yorumlayabilir',
            Fen: 'Bilimsel kanıtları değerlendirebilir'
        },
        3: {
            Matematik: 'Açık prosedürleri uygulayabilir',
            Okuma: 'Temel çıkarımlar yapabilir',
            Fen: 'Basit araştırma yapabilir'
        },
        2: {
            Matematik: 'Basit yorumlamalar yapabilir',
            Okuma: 'Açık bilgileri bulabilir',
            Fen: 'Temel bilimsel kavramları tanır'
        },
        1: {
            Matematik: 'Temel hesaplamaları yapabilir',
            Okuma: 'Basit cümleleri anlayabilir',
            Fen: 'Günlük olgularla ilişki kurabilir'
        },
        0: {
            Matematik: 'Temel matematik becerilerini geliştirmeli',
            Okuma: 'Okuma becerilerini geliştirmeli',
            Fen: 'Temel bilim kavramlarını öğrenmeli'
        }
    };

    return descriptions[level]?.[area] || 'Değerlendirme yapılamadı';
}

// ═══════════════════════════════════════════════════════════════
// TIMSS HESAPLAMALARI
// ═══════════════════════════════════════════════════════════════

/**
 * Yerel puanı TIMSS ölçeğine dönüştür (0-100 → 400-650)
 */
export function convertToTIMSSScale(localScore: number): number {
    return 400 + (localScore / 100) * 250;
}

/**
 * TIMSS benchmark seviyesini hesapla
 */
export function calculateTIMSSBenchmark(timssScore: number): TIMSSBenchmark {
    if (timssScore >= 625) return 'Advanced';
    if (timssScore >= 550) return 'High';
    if (timssScore >= 475) return 'Intermediate';
    if (timssScore >= 400) return 'Low';
    return 'Below';
}

/**
 * TIMSS benchmark açıklaması
 */
export function getTIMSSBenchmarkDescription(benchmark: TIMSSBenchmark): string {
    const descriptions: Record<TIMSSBenchmark, string> = {
        Advanced: 'İleri düzey: Karmaşık problemleri çözebilir ve sonuçları genelleyebilir',
        High: 'Yüksek düzey: Prosedürleri karmaşık durumlara uygulayabilir',
        Intermediate: 'Orta düzey: Temel prosedürleri ve kavramları anlayabilir',
        Low: 'Düşük düzey: Basit işlemleri ve temel bilgileri hatırlayabilir',
        Below: 'Temel seviye altı: Temel becerilerin geliştirilmesi gerekli'
    };
    return descriptions[benchmark];
}

// ═══════════════════════════════════════════════════════════════
// TAM KIYASLAMA HESAPLAMA
// ═══════════════════════════════════════════════════════════════

/**
 * Tam benchmark sonucu hesapla
 */
export function calculateBenchmarkResult(
    localScore: number,
    area: 'Matematik' | 'Okuma' | 'Fen' = 'Matematik',
    grade: 4 | 8 = 8
): BenchmarkResult {
    const pisaScore = convertToPISAScale(localScore);
    const timssScore = convertToTIMSSScale(localScore);
    const pisaLevel = calculatePISALevel(pisaScore);
    const timssBenchmark = calculateTIMSSBenchmark(timssScore);

    // PISA karşılaştırması
    const pisaData = PISA_2022_DATA[area];
    const vsTurkeyPISA = pisaScore - pisaData.turkeyScore;
    const vsOECDPISA = pisaScore - pisaData.oecdAverage;

    // Yüzdelik dilim hesaplama (yaklaşık)
    let percentile = 50;
    if (vsTurkeyPISA > 50) percentile = 90;
    else if (vsTurkeyPISA > 25) percentile = 75;
    else if (vsTurkeyPISA > 0) percentile = 60;
    else if (vsTurkeyPISA > -25) percentile = 40;
    else if (vsTurkeyPISA > -50) percentile = 25;
    else percentile = 10;

    // TIMSS karşılaştırması
    const timssKey = `${area === 'Fen' ? 'Fen' : 'Matematik'}_${grade}`;
    const timssData = TIMSS_2023_DATA[timssKey] || TIMSS_2023_DATA['Matematik_8'];
    const vsTurkeyTIMSS = timssScore - timssData.turkeyScore;
    const vsInternational = timssScore - timssData.internationalAverage;

    // Genel durum
    let overallStatus: BenchmarkResult['overallStatus'];
    let statusLabel: string;
    let statusColor: string;

    if (localScore >= 80) {
        overallStatus = 'excellent';
        statusLabel = 'Mükemmel - Üst Düzey Performans';
        statusColor = '#10B981';
    } else if (localScore >= 70) {
        overallStatus = 'above_average';
        statusLabel = 'Ortalamanın Üstünde';
        statusColor = '#059669';
    } else if (localScore >= 55) {
        overallStatus = 'average';
        statusLabel = 'Ortalama Düzey';
        statusColor = '#F59E0B';
    } else if (localScore >= 40) {
        overallStatus = 'below_average';
        statusLabel = 'Ortalamanın Altında';
        statusColor = '#EF4444';
    } else {
        overallStatus = 'needs_improvement';
        statusLabel = 'Gelişim Gerekli';
        statusColor = '#DC2626';
    }

    return {
        localScore,
        pisaEquivalent: Math.round(pisaScore),
        timssEquivalent: Math.round(timssScore),
        pisaLevel,
        pisaComparison: {
            vsTurkey: Math.round(vsTurkeyPISA),
            vsOECD: Math.round(vsOECDPISA),
            percentile
        },
        timssBenchmark,
        timssComparison: {
            vsTurkey: Math.round(vsTurkeyTIMSS),
            vsInternational: Math.round(vsInternational),
            worldPercentile: percentile
        },
        overallStatus,
        statusLabel,
        statusColor
    };
}

/**
 * Bloom seviye karşılaştırması
 */
export function calculateBloomComparison(
    schoolBloomData: Record<BloomLevel, number>
): BloomComparison[] {
    const levels: BloomLevel[] = ['Hatırlama', 'Anlama', 'Uygulama', 'Analiz', 'Değerlendirme', 'Yaratma'];

    return levels.map(level => {
        const schoolPct = schoolBloomData[level] || 0;
        const avg = BLOOM_AVERAGES[level];

        let status: BloomComparison['status'];
        if (schoolPct >= avg.oecd + 5) {
            status = 'strong';
        } else if (schoolPct >= avg.turkey - 5) {
            status = 'average';
        } else {
            status = 'needs_improvement';
        }

        return {
            level,
            schoolPercentage: schoolPct,
            turkeyAverage: avg.turkey,
            oecdAverage: avg.oecd,
            status
        };
    });
}

// ═══════════════════════════════════════════════════════════════
// IRT HESAPLAMALARI
// ═══════════════════════════════════════════════════════════════

/**
 * Klasik test teorisinden IRT parametreleri tahmin et
 */
export function estimateIRTFromCTT(
    successRate: number,
    pointBiserial: number = 0.3,
    answerChoices: number = 4
): IRTParameters {
    // Güçlük: logit dönüşüm
    const p = Math.max(0.01, Math.min(0.99, successRate));
    const difficulty = -Math.log(p / (1 - p));

    // Ayırt edicilik: point-biserial'den tahmin
    const discrimination = Math.max(0, pointBiserial * 2.5);

    // Şans: 1 / seçenek sayısı
    const guessing = 1 / answerChoices;

    // Kalite değerlendirmesi
    let quality: IRTParameters['quality'];
    if (discrimination >= 1.5) quality = 'excellent';
    else if (discrimination >= 1.0) quality = 'good';
    else if (discrimination >= 0.5) quality = 'acceptable';
    else quality = 'poor';

    return {
        difficulty: Math.max(-3, Math.min(3, difficulty)),
        discrimination: Math.max(0, Math.min(3, discrimination)),
        guessing,
        quality
    };
}

/**
 * Madde analizi yap
 */
export function analyzeItem(
    questionNumber: number,
    correctRate: number,
    pointBiserial: number = 0.3
): ItemAnalysis {
    const irt = estimateIRTFromCTT(correctRate, pointBiserial);

    let recommendation: string;
    if (irt.quality === 'poor') {
        recommendation = 'Bu soru revize edilmeli veya çıkarılmalı';
    } else if (correctRate > 0.9) {
        recommendation = 'Çok kolay - Daha zorlayıcı hale getirilebilir';
    } else if (correctRate < 0.2) {
        recommendation = 'Çok zor - Basitleştirilebilir veya ipucu eklenebilir';
    } else if (irt.quality === 'excellent') {
        recommendation = 'Mükemmel ayırt edicilik - Soru bankasına eklenebilir';
    } else {
        recommendation = 'Kabul edilebilir düzeyde';
    }

    return {
        questionNumber,
        correctRate,
        pointBiserial,
        irt,
        recommendation
    };
}

// ═══════════════════════════════════════════════════════════════
// RAPOR OLUŞTURMA
// ═══════════════════════════════════════════════════════════════

/**
 * Tam kıyaslama raporu oluştur
 */
export function generateBenchmarkReport(
    schoolData: {
        schoolName: string;
        className: string;
        subject: BenchmarkArea;
        examTitle: string;
        date: string;
        averageScore: number;
        bloomScores?: Record<BloomLevel, number>;
        previousScore?: number;
    }
): BenchmarkReport {
    const scoreComparison = calculateBenchmarkResult(
        schoolData.averageScore,
        schoolData.subject === 'Fen Bilimleri' ? 'Fen' :
            schoolData.subject === 'Türkçe' ? 'Okuma' : 'Matematik'
    );

    const bloomComparison = schoolData.bloomScores
        ? calculateBloomComparison(schoolData.bloomScores)
        : calculateBloomComparison({
            'Hatırlama': schoolData.averageScore + 10,
            'Anlama': schoolData.averageScore + 5,
            'Uygulama': schoolData.averageScore,
            'Analiz': schoolData.averageScore - 10,
            'Değerlendirme': schoolData.averageScore - 20,
            'Yaratma': schoolData.averageScore - 25
        });

    // Önerileri oluştur
    const recommendations: string[] = [];

    if (scoreComparison.overallStatus === 'needs_improvement' || scoreComparison.overallStatus === 'below_average') {
        recommendations.push('Temel kavramların pekiştirilmesi için ek çalışmalar planlanmalı');
    }

    const weakBloom = bloomComparison.filter(b => b.status === 'needs_improvement');
    if (weakBloom.length > 0) {
        recommendations.push(`${weakBloom.map(w => w.level).join(', ')} seviyelerinde iyileştirme gerekli`);
    }

    if (scoreComparison.pisaComparison.vsOECD < -30) {
        recommendations.push('PISA tarzı açık uçlu ve gerçek yaşam problemleri eklenebilir');
    }

    if (recommendations.length === 0) {
        recommendations.push('Performans hedeflenen düzeyde, mevcut stratejilere devam edilebilir');
    }

    let trend: BenchmarkReport['trend'];
    if (schoolData.previousScore !== undefined) {
        const change = schoolData.averageScore - schoolData.previousScore;
        trend = {
            previousScore: schoolData.previousScore,
            change,
            direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable'
        };
    }

    return {
        schoolName: schoolData.schoolName,
        className: schoolData.className,
        subject: schoolData.subject,
        examTitle: schoolData.examTitle,
        date: schoolData.date,
        scoreComparison,
        bloomComparison,
        recommendations,
        trend
    };
}
