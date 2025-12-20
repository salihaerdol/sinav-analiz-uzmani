// =====================================================
// MODÜL 1: PSİKOMETRİK HESAPLAMALAR
// Klasik Test Teorisi (CTT) Formülleri
// =====================================================

import { PsychometricResult, TestReliability, PsychometricSummary, QUALITY_CRITERIA } from './types';
import { QuestionConfig, Student } from '../../types';

/**
 * Soru Güçlüğü (Item Difficulty / P-değeri)
 * Formül: P = (Soruyu doğru yapan öğrenci sayısı) / (Toplam öğrenci sayısı)
 * Aralık: 0.00 - 1.00 (Yüksek = kolay, Düşük = zor)
 */
export function calculateItemDifficulty(
    scores: number[],
    maxScore: number
): number {
    if (scores.length === 0 || maxScore === 0) return 0;

    const totalEarned = scores.reduce((sum, score) => sum + score, 0);
    const totalPossible = scores.length * maxScore;

    return Number((totalEarned / totalPossible).toFixed(4));
}

/**
 * Soru Ayırt Ediciliği (Item Discrimination)
 * Formül: D = P(üst) - P(alt)
 * Üst %27 ve alt %27 grupları karşılaştırılır
 * Aralık: -1.00 - +1.00 (Yüksek = iyi ayırt edici)
 */
export function calculateItemDiscrimination(
    scores: number[],
    totalScores: number[],
    maxScore: number
): number {
    if (scores.length < 4 || maxScore === 0) return 0;

    // Öğrencileri toplam puana göre sırala
    const combined = scores.map((score, i) => ({
        questionScore: score,
        totalScore: totalScores[i]
    })).sort((a, b) => b.totalScore - a.totalScore);

    // Üst ve alt %27 grupları
    const groupSize = Math.max(1, Math.floor(combined.length * 0.27));
    const upperGroup = combined.slice(0, groupSize);
    const lowerGroup = combined.slice(-groupSize);

    // Her grup için ortalama başarı oranı
    const upperAvg = upperGroup.reduce((sum, s) => sum + s.questionScore, 0) / (groupSize * maxScore);
    const lowerAvg = lowerGroup.reduce((sum, s) => sum + s.questionScore, 0) / (groupSize * maxScore);

    return Number((upperAvg - lowerAvg).toFixed(4));
}

/**
 * Nokta-Biserial Korelasyon
 * Soru puanı ile toplam test puanı arasındaki korelasyon
 */
export function calculatePointBiserial(
    scores: number[],
    totalScores: number[]
): number {
    if (scores.length < 3) return 0;

    const n = scores.length;

    // Ortalamalar
    const meanScore = scores.reduce((a, b) => a + b, 0) / n;
    const meanTotal = totalScores.reduce((a, b) => a + b, 0) / n;

    // Standart sapmalar
    const sdScore = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - meanScore, 2), 0) / n);
    const sdTotal = Math.sqrt(totalScores.reduce((sum, s) => sum + Math.pow(s - meanTotal, 2), 0) / n);

    if (sdScore === 0 || sdTotal === 0) return 0;

    // Kovaryans
    const covariance = scores.reduce((sum, s, i) =>
        sum + (s - meanScore) * (totalScores[i] - meanTotal), 0
    ) / n;

    return Number((covariance / (sdScore * sdTotal)).toFixed(4));
}

/**
 * Cronbach's Alpha - Test Güvenilirliği
 * Formül: α = (k / (k-1)) * (1 - Σσ²ᵢ / σ²ₜ)
 * k = soru sayısı, σ²ᵢ = soru varyansları, σ²ₜ = toplam puan varyansı
 */
export function calculateCronbachAlpha(
    questions: QuestionConfig[],
    students: Student[]
): number {
    if (questions.length < 2 || students.length < 2) return 0;

    const k = questions.length;

    // Her soru için varyans hesapla
    const itemVariances = questions.map(q => {
        const scores = students.map(s => s.scores[q.id] || 0);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        return scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    });

    // Toplam puan varyansı
    const totalScores = students.map(s =>
        Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
    );
    const totalMean = totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
    const totalVariance = totalScores.reduce((sum, s) => sum + Math.pow(s - totalMean, 2), 0) / totalScores.length;

    if (totalVariance === 0) return 0;

    const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);

    const alpha = (k / (k - 1)) * (1 - sumItemVariances / totalVariance);

    return Number(Math.max(0, Math.min(1, alpha)).toFixed(4));
}

/**
 * Soru Kalitesi Değerlendirmesi
 */
export function evaluateQuestionQuality(
    difficulty: number,
    discrimination: number
): { rating: PsychometricResult['qualityRating']; notes: string } {

    // Negatif ayırt edicilik - KRİTİK
    if (discrimination < 0) {
        return {
            rating: 'Revize',
            notes: 'Negatif ayırt edicilik: Düşük başarılı öğrenciler daha iyi yapıyor. Soru mutlaka revize edilmeli.'
        };
    }

    // Çok kolay veya çok zor + düşük ayırt edicilik
    if ((difficulty > 0.90 || difficulty < 0.10) && discrimination < 0.20) {
        return {
            rating: 'Zayıf',
            notes: difficulty > 0.90
                ? 'Çok kolay ve ayırt edici değil. Zorlaştırılmalı.'
                : 'Çok zor ve ayırt edici değil. Kolaylaştırılmalı.'
        };
    }

    // İdeal güçlük + yüksek ayırt edicilik
    if (difficulty >= 0.30 && difficulty <= 0.70 && discrimination >= 0.40) {
        return {
            rating: 'Mükemmel',
            notes: 'İdeal güçlük seviyesi ve yüksek ayırt edicilik. Mükemmel soru.'
        };
    }

    // İyi güçlük + iyi ayırt edicilik
    if (difficulty >= 0.20 && difficulty <= 0.80 && discrimination >= 0.30) {
        return {
            rating: 'İyi',
            notes: 'İyi soru. Öğrencileri iyi ayırt ediyor.'
        };
    }

    // Kabul edilebilir
    if (discrimination >= 0.20) {
        return {
            rating: 'Orta',
            notes: 'Kabul edilebilir soru. İyileştirme potansiyeli var.'
        };
    }

    return {
        rating: 'Zayıf',
        notes: 'Düşük ayırt edicilik. Soru revizyona ihtiyaç duyabilir.'
    };
}

/**
 * Güçlük yorumu
 */
export function interpretDifficulty(p: number): string {
    if (p >= 0.85) return 'Çok Kolay - Öğrencilerin %85+ doğru yapıyor';
    if (p >= 0.70) return 'Kolay - Çoğu öğrenci yapabiliyor';
    if (p >= 0.30) return 'İdeal - Orta güçlükte';
    if (p >= 0.15) return 'Zor - Az öğrenci yapabiliyor';
    return 'Çok Zor - %15\'den az öğrenci yapabiliyor';
}

/**
 * Ayırt edicilik yorumu
 */
export function interpretDiscrimination(d: number): string {
    if (d >= 0.40) return 'Mükemmel - Başarılı/başarısız öğrencileri çok iyi ayırt ediyor';
    if (d >= 0.30) return 'İyi - İyi ayırt edici';
    if (d >= 0.20) return 'Kabul Edilebilir - Marjinal ayırt edicilik';
    if (d >= 0) return 'Zayıf - Ayırt edici değil, revizyon düşünülmeli';
    return 'KRİTİK - Negatif ayırt edicilik! Mutlaka revize edilmeli';
}

/**
 * Cronbach Alpha yorumu
 */
export function interpretReliability(alpha: number): { isReliable: boolean; interpretation: string } {
    if (alpha >= 0.90) return { isReliable: true, interpretation: 'Mükemmel güvenilirlik' };
    if (alpha >= 0.80) return { isReliable: true, interpretation: 'İyi güvenilirlik' };
    if (alpha >= 0.70) return { isReliable: true, interpretation: 'Kabul edilebilir güvenilirlik' };
    if (alpha >= 0.60) return { isReliable: false, interpretation: 'Şüpheli güvenilirlik - İyileştirme gerekli' };
    if (alpha >= 0.50) return { isReliable: false, interpretation: 'Zayıf güvenilirlik - Revizyon gerekli' };
    return { isReliable: false, interpretation: 'Kabul edilemez güvenilirlik - Test yeniden tasarlanmalı' };
}

/**
 * Tam Psikometrik Analiz
 */
export function calculateFullPsychometricAnalysis(
    questions: QuestionConfig[],
    students: Student[]
): PsychometricSummary {

    // Her öğrencinin toplam puanı
    const totalScores = students.map(s =>
        Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
    );

    // Her soru için analiz
    const questionResults: PsychometricResult[] = questions.map((q, index) => {
        const scores = students.map(s => s.scores[q.id] || 0);

        const difficulty = calculateItemDifficulty(scores, q.maxScore);
        const discrimination = calculateItemDiscrimination(scores, totalScores, q.maxScore);
        const pointBiserial = calculatePointBiserial(scores, totalScores);
        const { rating, notes } = evaluateQuestionQuality(difficulty, discrimination);

        return {
            questionId: q.id.toString(),
            questionNumber: index + 1,
            itemDifficulty: difficulty,
            itemDiscrimination: discrimination,
            pointBiserial,
            qualityRating: rating,
            qualityNotes: notes,
            interpretation: `Güçlük: ${interpretDifficulty(difficulty)} | Ayırt Edicilik: ${interpretDiscrimination(discrimination)}`
        };
    });

    // Cronbach Alpha
    const alpha = calculateCronbachAlpha(questions, students);
    const { isReliable, interpretation } = interpretReliability(alpha);

    // Kalite dağılımı
    const distribution = {
        excellent: questionResults.filter(r => r.qualityRating === 'Mükemmel').length,
        good: questionResults.filter(r => r.qualityRating === 'İyi').length,
        fair: questionResults.filter(r => r.qualityRating === 'Orta').length,
        poor: questionResults.filter(r => r.qualityRating === 'Zayıf').length,
        revise: questionResults.filter(r => r.qualityRating === 'Revize').length
    };

    // Ortalamalar
    const avgDifficulty = questionResults.reduce((sum, r) => sum + r.itemDifficulty, 0) / questionResults.length;
    const avgDiscrimination = questionResults.reduce((sum, r) => sum + r.itemDiscrimination, 0) / questionResults.length;

    // Öneriler
    const recommendations: string[] = [];

    if (!isReliable) {
        recommendations.push(`Test güvenilirliği düşük (α=${alpha.toFixed(2)}). Soru sayısını artırın veya zayıf soruları revize edin.`);
    }

    if (distribution.revise > 0) {
        recommendations.push(`${distribution.revise} soru negatif ayırt edicilik gösteriyor. Acil revizyon gerekli.`);
    }

    if (distribution.poor > questions.length * 0.3) {
        recommendations.push(`Soruların %30'undan fazlası zayıf kalitede. Genel sınav revizyonu düşünülmeli.`);
    }

    if (avgDifficulty > 0.80) {
        recommendations.push(`Sınav genel olarak çok kolay (P=${avgDifficulty.toFixed(2)}). Zorluk seviyesi artırılmalı.`);
    } else if (avgDifficulty < 0.30) {
        recommendations.push(`Sınav genel olarak çok zor (P=${avgDifficulty.toFixed(2)}). Zorluk seviyesi azaltılmalı.`);
    }

    if (recommendations.length === 0) {
        recommendations.push('Sınav psikometrik açıdan iyi durumda. PISA/TIMSS standartlarına uygun.');
    }

    return {
        examId: '',
        totalQuestions: questions.length,
        totalStudents: students.length,
        reliability: {
            cronbachAlpha: alpha,
            standardError: Math.sqrt(1 - alpha) * (totalScores.reduce((sum, s) => sum + Math.pow(s - totalScores.reduce((a, b) => a + b, 0) / totalScores.length, 2), 0) / totalScores.length),
            isReliable,
            interpretation
        },
        distribution,
        averageDifficulty: avgDifficulty,
        averageDiscrimination: avgDiscrimination,
        recommendations
    };
}

/**
 * Tek soru için psikometrik analiz
 */
export function analyzeQuestion(
    question: QuestionConfig,
    questionIndex: number,
    students: Student[],
    totalScores: number[]
): PsychometricResult {
    const scores = students.map(s => s.scores[question.id] || 0);

    const difficulty = calculateItemDifficulty(scores, question.maxScore);
    const discrimination = calculateItemDiscrimination(scores, totalScores, question.maxScore);
    const pointBiserial = calculatePointBiserial(scores, totalScores);
    const { rating, notes } = evaluateQuestionQuality(difficulty, discrimination);

    return {
        questionId: question.id.toString(),
        questionNumber: questionIndex + 1,
        itemDifficulty: difficulty,
        itemDiscrimination: discrimination,
        pointBiserial,
        qualityRating: rating,
        qualityNotes: notes,
        interpretation: `${interpretDifficulty(difficulty)} | ${interpretDiscrimination(discrimination)}`
    };
}
