// =====================================================
// MODÜL 1: PSİKOMETRİK ANALİZ - TYPE TANIMLARI
// =====================================================

export interface PsychometricResult {
    id?: string;
    questionId: string;
    questionNumber: number;

    // Klasik Test Teorisi (CTT)
    itemDifficulty: number;        // P-değeri (0.00-1.00) - Yüksek = kolay
    itemDiscrimination: number;    // Ayırt edicilik (-1.00 - +1.00)
    pointBiserial: number;         // Nokta-biserial korelasyon

    // Soru Kalitesi
    qualityRating: 'Mükemmel' | 'İyi' | 'Orta' | 'Zayıf' | 'Revize';
    qualityNotes?: string;

    // Yorum
    interpretation: string;
}

export interface TestReliability {
    cronbachAlpha: number;
    standardError: number;
    splitHalfReliability?: number;
    isReliable: boolean;           // alpha > 0.70
    interpretation: string;
}

export interface PsychometricSummary {
    examId: string;
    totalQuestions: number;
    totalStudents: number;

    // Test Güvenilirliği
    reliability: TestReliability;

    // Soru Dağılımı
    distribution: {
        excellent: number;   // Mükemmel
        good: number;        // İyi
        fair: number;        // Orta
        poor: number;        // Zayıf
        revise: number;      // Revize edilmeli
    };

    // Ortalamalar
    averageDifficulty: number;
    averageDiscrimination: number;

    // Öneriler
    recommendations: string[];
}

// Kalite değerlendirme kriterleri
export const QUALITY_CRITERIA = {
    difficulty: {
        tooEasy: { min: 0.85, max: 1.00, label: 'Çok Kolay', color: '#f97316' },
        easy: { min: 0.70, max: 0.85, label: 'Kolay', color: '#84cc16' },
        ideal: { min: 0.30, max: 0.70, label: 'İdeal', color: '#22c55e' },
        hard: { min: 0.15, max: 0.30, label: 'Zor', color: '#eab308' },
        tooHard: { min: 0.00, max: 0.15, label: 'Çok Zor', color: '#ef4444' }
    },
    discrimination: {
        excellent: { min: 0.40, max: 1.00, label: 'Mükemmel', color: '#22c55e' },
        good: { min: 0.30, max: 0.40, label: 'İyi', color: '#84cc16' },
        acceptable: { min: 0.20, max: 0.30, label: 'Kabul Edilebilir', color: '#eab308' },
        poor: { min: 0.00, max: 0.20, label: 'Zayıf', color: '#f97316' },
        negative: { min: -1.00, max: 0.00, label: 'Negatif - Revize!', color: '#ef4444' }
    }
};
