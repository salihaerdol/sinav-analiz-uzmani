// =====================================================
// MODÜL 1: PSİKOMETRİK ANALİZ - SUPABASE SERVİS
// =====================================================

import { supabase } from '../../services/supabase';
import { PsychometricResult, PsychometricSummary } from './types';
import { QuestionConfig, Student } from '../../types';
import { calculateFullPsychometricAnalysis, analyzeQuestion } from './psychometricCalculations';

/**
 * Psikometrik analiz sonuçlarını veritabanına kaydet
 */
export async function savePsychometricAnalysis(
    examId: string,
    userId: string,
    questions: QuestionConfig[],
    students: Student[]
): Promise<{ success: boolean; data?: PsychometricSummary; error?: string }> {
    try {
        // Tam analiz hesapla
        const summary = calculateFullPsychometricAnalysis(questions, students);
        summary.examId = examId;

        // Her soru için toplam puanlar
        const totalScores = students.map(s =>
            Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
        );

        // Her soru için analiz kaydet
        const insertData = questions.map((q, index) => {
            const result = analyzeQuestion(q, index, students, totalScores);
            return {
                exam_id: examId,
                question_id: q.id.toString(),
                user_id: userId,
                item_difficulty: result.itemDifficulty,
                item_discrimination: result.itemDiscrimination,
                point_biserial: result.pointBiserial,
                cronbach_alpha: summary.reliability.cronbachAlpha,
                standard_error: summary.reliability.standardError,
                quality_rating: result.qualityRating,
                quality_notes: result.qualityNotes
            };
        });

        // Mevcut kayıtları sil (güncelleme için)
        await supabase
            .from('psychometric_analysis')
            .delete()
            .eq('exam_id', examId);

        // Yeni kayıtları ekle
        const { error } = await supabase
            .from('psychometric_analysis')
            .insert(insertData);

        if (error) throw error;

        return { success: true, data: summary };
    } catch (error: any) {
        console.error('Psikometrik analiz kaydetme hatası:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Psikometrik analiz sonuçlarını getir
 */
export async function getPsychometricAnalysis(
    examId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('psychometric_analysis')
            .select('*')
            .eq('exam_id', examId)
            .order('question_id');

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error('Psikometrik analiz getirme hatası:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Kullanıcının tüm psikometrik analizlerini getir
 */
export async function getUserPsychometricHistory(
    userId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('psychometric_analysis')
            .select('exam_id, cronbach_alpha, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Benzersiz examId'leri al
        const uniqueExams = Array.from(new Set(data?.map(d => d.exam_id)));

        return {
            success: true, data: uniqueExams.map(examId => {
                const examData = data?.find(d => d.exam_id === examId);
                return {
                    examId,
                    cronbachAlpha: examData?.cronbach_alpha,
                    createdAt: examData?.created_at
                };
            })
        };
    } catch (error: any) {
        console.error('Psikometrik geçmiş getirme hatası:', error);
        return { success: false, error: error.message };
    }
}

export default {
    savePsychometricAnalysis,
    getPsychometricAnalysis,
    getUserPsychometricHistory
};
