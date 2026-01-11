// =====================================================
// MODÜL: SORU BANKASI - TYPE TANIMLARI
// =====================================================

import { BloomLevel } from '../international-benchmark/types';

/**
 * Soru zorluk seviyesi
 */
export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';

/**
 * Soru tipi
 */
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';

/**
 * Konu/Ünite
 */
export interface Topic {
    id: string;
    subjectId: string;
    name: string;
    grade: number;
    unitNumber: number;
    parentTopicId?: string;
    mebCode?: string;
    description?: string;
}

/**
 * Kazanım
 */
export interface LearningOutcome {
    id: string;
    topicId: string;
    code: string;           // MEB kazanım kodu: M.5.1.1.1
    description: string;
    bloomLevel: BloomLevel;
    grade: number;
    subject: string;
}

/**
 * Soru seçeneği (çoktan seçmeli için)
 */
export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
}

/**
 * Soru
 */
export interface Question {
    id: string;

    // Temel bilgiler
    text: string;
    type: QuestionType;
    subject: string;
    grade: number;

    // İçerik
    options?: QuestionOption[];
    correctAnswer?: string;
    explanation?: string;
    imageUrl?: string;

    // Sınıflandırma
    topicId?: string;
    topicName?: string;
    outcomeId?: string;
    outcomeCode?: string;
    bloomLevel: BloomLevel;
    difficulty: DifficultyLevel;

    // İstatistikler
    usageCount: number;
    averageSuccessRate?: number;
    lastUsedAt?: string;

    // Etiketler
    tags: string[];

    // Meta
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    isPublic: boolean;
    isApproved: boolean;
}

/**
 * Soru bankası filtresi
 */
export interface QuestionBankFilter {
    subject?: string;
    grade?: number;
    topicId?: string;
    outcomeId?: string;
    bloomLevel?: BloomLevel;
    difficulty?: DifficultyLevel;
    type?: QuestionType;
    tags?: string[];
    searchText?: string;
    isPublic?: boolean;
    createdBy?: string;
    minSuccessRate?: number;
    maxSuccessRate?: number;
}

/**
 * Soru bankası istatistikleri
 */
export interface QuestionBankStats {
    totalQuestions: number;
    bySubject: Record<string, number>;
    byGrade: Record<number, number>;
    byBloomLevel: Record<BloomLevel, number>;
    byDifficulty: Record<DifficultyLevel, number>;
    byType: Record<QuestionType, number>;
    recentlyAdded: number;  // Son 7 gün
    mostUsed: Question[];
}

/**
 * Sınav oluşturucu ayarları
 */
export interface ExamBuilderSettings {
    title: string;
    subject: string;
    grade: number;
    totalQuestions: number;
    duration: number;  // dakika

    // Dağılım tercihler
    bloomDistribution?: Partial<Record<BloomLevel, number>>;
    difficultyDistribution?: Partial<Record<DifficultyLevel, number>>;
    topicIds?: string[];

    // Seçenekler
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showPoints: boolean;
}

/**
 * Oluşturulan sınav
 */
export interface GeneratedExam {
    id: string;
    settings: ExamBuilderSettings;
    questions: Question[];
    totalPoints: number;
    createdAt: string;
}

/**
 * Soru düzenleme formu
 */
export interface QuestionFormData {
    text: string;
    type: QuestionType;
    subject: string;
    grade: number;
    options: QuestionOption[];
    correctAnswer: string;
    explanation: string;
    topicId: string;
    outcomeCode: string;
    bloomLevel: BloomLevel;
    difficulty: DifficultyLevel;
    tags: string[];
    isPublic: boolean;
}
