/**
 * SUPABASE HISTORY SERVICE
 * Analiz geçmişi, öğrenci ve sınıf gelişim takibi için Supabase servisi
 */

import { supabase } from './supabase';
import { ExamMetadata, AnalysisResult, QuestionConfig, Student, SavedAnalysis, StudentProgress, ClassProgress, DashboardSummary } from '../types';

// =====================================================
// TİP TANIMLARI
// =====================================================

interface AnalysisHistoryDB {
    id: string;
    user_id: string;
    school_name: string;
    teacher_name: string;
    class_name: string;
    grade: string;
    subject: string;
    scenario: string;
    exam_date: string;
    term: string;
    exam_number: string;
    exam_type: string;
    academic_year: string;
    class_average: number;
    total_students: number;
    total_questions: number;
    analysis_data: AnalysisResult;
    questions_data: QuestionConfig[];
    students_data: Student[];
    ai_summary: string | null;
    ai_recommendations: any | null;
    tags: string[];
    notes: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

interface StudentProgressDB {
    id: string;
    user_id: string;
    student_name: string;
    class_name: string;
    total_exams: number;
    average_score: number;
    best_score: number;
    worst_score: number;
    trend: 'up' | 'down' | 'stable';
    exam_history: any[];
    outcome_progress: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface ClassProgressDB {
    id: string;
    user_id: string;
    class_name: string;
    grade: string;
    subject: string;
    total_exams: number;
    average_score: number;
    best_average: number;
    worst_average: number;
    trend: 'up' | 'down' | 'stable';
    exam_history: any[];
    outcome_progress: Record<string, any>;
    created_at: string;
    updated_at: string;
}

// =====================================================
// ANALİZ GEÇMİŞİ SERVİSİ
// =====================================================

export const analysisHistoryService = {
    /**
     * Yeni analiz kaydet
     */
    async saveAnalysis(
        metadata: ExamMetadata,
        analysis: AnalysisResult,
        questions: QuestionConfig[],
        students: Student[],
        aiSummary?: string
    ): Promise<SavedAnalysis | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('Kullanıcı oturum açmamış');
            return null;
        }

        const record = {
            user_id: user.id,
            school_name: metadata.schoolName,
            teacher_name: metadata.teacherName,
            class_name: metadata.className,
            grade: metadata.grade,
            subject: metadata.subject,
            scenario: metadata.scenario,
            exam_date: metadata.date,
            term: metadata.term,
            exam_number: metadata.examNumber,
            exam_type: metadata.examType,
            academic_year: metadata.academicYear,
            class_average: analysis.classAverage,
            total_students: students.length,
            total_questions: questions.length,
            analysis_data: analysis,
            questions_data: questions,
            students_data: students,
            ai_summary: aiSummary || null,
            tags: [],
            notes: null,
            is_archived: false
        };

        const { data, error } = await supabase
            .from('analysis_history')
            .insert(record)
            .select()
            .single();

        if (error) {
            console.error('Analiz kaydedilemedi:', error);
            return null;
        }

        // Öğrenci ve sınıf ilerlemesini güncelle
        await this.updateStudentProgress(metadata, analysis, students);
        await this.updateClassProgress(metadata, analysis);

        return this.dbToSavedAnalysis(data);
    },

    /**
     * Tüm analizleri getir
     */
    async getAllAnalyses(): Promise<SavedAnalysis[]> {
        const { data, error } = await supabase
            .from('analysis_history')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Analizler getirilemedi:', error);
            return [];
        }

        return (data || []).map(this.dbToSavedAnalysis);
    },

    /**
     * Tek analiz getir
     */
    async getAnalysisById(id: string): Promise<SavedAnalysis | null> {
        const { data, error } = await supabase
            .from('analysis_history')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Analiz getirilemedi:', error);
            return null;
        }

        return this.dbToSavedAnalysis(data);
    },

    /**
     * Analiz güncelle
     */
    async updateAnalysis(id: string, updates: Partial<SavedAnalysis>): Promise<boolean> {
        const dbUpdates: any = {};

        if (updates.metadata) {
            dbUpdates.school_name = updates.metadata.schoolName;
            dbUpdates.teacher_name = updates.metadata.teacherName;
            dbUpdates.class_name = updates.metadata.className;
        }
        if (updates.analysis) {
            dbUpdates.analysis_data = updates.analysis;
            dbUpdates.class_average = updates.analysis.classAverage;
        }
        if (updates.aiSummary !== undefined) {
            dbUpdates.ai_summary = updates.aiSummary;
        }

        const { error } = await supabase
            .from('analysis_history')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Analiz güncellenemedi:', error);
            return false;
        }

        return true;
    },

    /**
     * Analiz sil
     */
    async deleteAnalysis(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('analysis_history')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Analiz silinemedi:', error);
            return false;
        }

        return true;
    },

    /**
     * Filtrelenmiş analizler getir
     */
    async getFilteredAnalyses(filters: {
        className?: string;
        subject?: string;
        grade?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<SavedAnalysis[]> {
        let query = supabase
            .from('analysis_history')
            .select('*')
            .eq('is_archived', false);

        if (filters.className) {
            query = query.eq('class_name', filters.className);
        }
        if (filters.subject) {
            query = query.eq('subject', filters.subject);
        }
        if (filters.grade) {
            query = query.eq('grade', filters.grade);
        }
        if (filters.startDate) {
            query = query.gte('exam_date', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('exam_date', filters.endDate);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Filtrelenmiş analizler getirilemedi:', error);
            return [];
        }

        return (data || []).map(this.dbToSavedAnalysis);
    },

    /**
     * Öğrenci ilerlemesini güncelle
     */
    async updateStudentProgress(
        metadata: ExamMetadata,
        analysis: AnalysisResult,
        students: Student[]
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        for (const studentStat of analysis.studentStats) {
            const student = students.find(s => s.id === studentStat.studentId);
            if (!student) continue;

            // Mevcut ilerlemeyi kontrol et
            const { data: existing } = await supabase
                .from('student_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('student_name', student.name)
                .single();

            const examEntry = {
                date: metadata.date,
                subject: metadata.subject,
                className: metadata.className,
                score: studentStat.percentage,
                analysisId: null
            };

            if (existing) {
                // Güncelle
                const history = [...(existing.exam_history || []), examEntry];
                const scores = history.map((h: any) => h.score);
                const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

                let trend: 'up' | 'down' | 'stable' = 'stable';
                if (scores.length >= 2) {
                    const lastTwo = scores.slice(-2);
                    if (lastTwo[1] > lastTwo[0] + 5) trend = 'up';
                    else if (lastTwo[1] < lastTwo[0] - 5) trend = 'down';
                }

                await supabase
                    .from('student_progress')
                    .update({
                        total_exams: history.length,
                        average_score: avgScore,
                        best_score: Math.max(...scores),
                        worst_score: Math.min(...scores),
                        trend,
                        exam_history: history,
                        class_name: metadata.className
                    })
                    .eq('id', existing.id);
            } else {
                // Yeni kayıt
                await supabase
                    .from('student_progress')
                    .insert({
                        user_id: user.id,
                        student_name: student.name,
                        class_name: metadata.className,
                        total_exams: 1,
                        average_score: studentStat.percentage,
                        best_score: studentStat.percentage,
                        worst_score: studentStat.percentage,
                        trend: 'stable',
                        exam_history: [examEntry]
                    });
            }
        }
    },

    /**
     * Sınıf ilerlemesini güncelle
     */
    async updateClassProgress(
        metadata: ExamMetadata,
        analysis: AnalysisResult
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const classKey = `${metadata.className}-${metadata.subject}`;

        // Mevcut ilerlemeyi kontrol et
        const { data: existing } = await supabase
            .from('class_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('class_name', metadata.className)
            .eq('subject', metadata.subject)
            .single();

        const examEntry = {
            date: metadata.date,
            average: analysis.classAverage,
            studentCount: analysis.studentStats.length,
            analysisId: null
        };

        if (existing) {
            // Güncelle
            const history = [...(existing.exam_history || []), examEntry];
            const averages = history.map((h: any) => h.average);
            const avgScore = averages.reduce((a: number, b: number) => a + b, 0) / averages.length;

            let trend: 'up' | 'down' | 'stable' = 'stable';
            if (averages.length >= 2) {
                const lastTwo = averages.slice(-2);
                if (lastTwo[1] > lastTwo[0] + 3) trend = 'up';
                else if (lastTwo[1] < lastTwo[0] - 3) trend = 'down';
            }

            await supabase
                .from('class_progress')
                .update({
                    total_exams: history.length,
                    average_score: avgScore,
                    best_average: Math.max(...averages),
                    worst_average: Math.min(...averages),
                    trend,
                    exam_history: history
                })
                .eq('id', existing.id);
        } else {
            // Yeni kayıt
            await supabase
                .from('class_progress')
                .insert({
                    user_id: user.id,
                    class_name: metadata.className,
                    grade: metadata.grade,
                    subject: metadata.subject,
                    total_exams: 1,
                    average_score: analysis.classAverage,
                    best_average: analysis.classAverage,
                    worst_average: analysis.classAverage,
                    trend: 'stable',
                    exam_history: [examEntry]
                });
        }
    },

    /**
     * Tüm öğrenci ilerlemelerini getir
     */
    async getAllStudentProgress(): Promise<StudentProgress[]> {
        const { data, error } = await supabase
            .from('student_progress')
            .select('*')
            .order('average_score', { ascending: false });

        if (error) {
            console.error('Öğrenci ilerlemeleri getirilemedi:', error);
            return [];
        }

        return (data || []).map(this.dbToStudentProgress);
    },

    /**
     * Tüm sınıf ilerlemelerini getir
     */
    async getAllClassProgress(): Promise<ClassProgress[]> {
        const { data, error } = await supabase
            .from('class_progress')
            .select('*')
            .order('average_score', { ascending: false });

        if (error) {
            console.error('Sınıf ilerlemeleri getirilemedi:', error);
            return [];
        }

        return (data || []).map(this.dbToClassProgress);
    },

    /**
     * Dashboard özeti getir
     */
    async getDashboardSummary(): Promise<DashboardSummary> {
        const [analyses, students, classes] = await Promise.all([
            this.getAllAnalyses(),
            this.getAllStudentProgress(),
            this.getAllClassProgress()
        ]);

        // En başarılı öğrenciler - map to expected format
        const topPerformingStudents = students
            .slice(0, 5)
            .map(s => ({
                name: s.studentName,
                className: s.className,
                averageScore: s.averageScore,
                trend: s.trend === 'up' ? 'up' as const : s.trend === 'down' ? 'down' as const : 'stable' as const
            }));

        // Sınıf performansları
        const classPerformance = classes.map(c => ({
            className: c.className,
            averageScore: c.averageScore,
            trend: c.trend === 'up' ? 'up' as const : c.trend === 'down' ? 'down' as const : 'stable' as const
        }));

        // Zayıf kazanımlar (tüm analizlerden)
        const outcomeMap = new Map<string, { code: string; description: string; totalRate: number; count: number }>();

        analyses.forEach(a => {
            a.analysis.outcomeStats.forEach(o => {
                const existing = outcomeMap.get(o.code) || { code: o.code, description: o.description, totalRate: 0, count: 0 };
                existing.totalRate += o.successRate;
                existing.count++;
                outcomeMap.set(o.code, existing);
            });
        });

        const weakOutcomes = Array.from(outcomeMap.values())
            .map(o => ({
                code: o.code,
                description: o.description,
                averageSuccessRate: o.totalRate / o.count,
                frequency: o.count
            }))
            .filter(o => o.averageSuccessRate < 50)
            .sort((a, b) => a.averageSuccessRate - b.averageSuccessRate)
            .slice(0, 5);

        return {
            totalAnalyses: analyses.length,
            totalStudents: students.length,
            totalClasses: classes.length,
            recentAnalyses: analyses.slice(0, 5),
            topPerformingStudents,
            classPerformance,
            weakOutcomes
        };
    },

    // Helper functions
    dbToSavedAnalysis(db: AnalysisHistoryDB): SavedAnalysis {
        return {
            id: db.id,
            metadata: {
                schoolName: db.school_name,
                teacherName: db.teacher_name,
                className: db.class_name,
                grade: db.grade,
                subject: db.subject,
                scenario: db.scenario,
                date: db.exam_date,
                term: db.term as '1' | '2',
                examNumber: db.exam_number,
                examType: db.exam_type as 'Yazılı' | 'Sözlü' | 'Performans' | 'Proje',
                academicYear: db.academic_year,
                schoolType: 'Ortaokul'
            },
            analysis: db.analysis_data,
            questions: db.questions_data,
            students: db.students_data,
            aiSummary: db.ai_summary || undefined,
            createdAt: db.created_at,
            updatedAt: db.updated_at
        };
    },

    dbToStudentProgress(db: StudentProgressDB): any {
        const trendMap: Record<string, 'improving' | 'stable' | 'declining'> = {
            'up': 'improving',
            'down': 'declining',
            'stable': 'stable'
        };

        return {
            studentId: db.id,
            studentName: db.student_name,
            className: db.class_name,
            examHistory: db.exam_history || [],
            outcomeProgress: [],
            overallTrend: trendMap[db.trend] || 'stable',
            averagePercentage: db.average_score,
            // Additional fields for dashboard compatibility
            totalExams: db.total_exams,
            averageScore: db.average_score,
            bestScore: db.best_score,
            worstScore: db.worst_score,
            trend: db.trend
        };
    },

    dbToClassProgress(db: ClassProgressDB): any {
        const trendMap: Record<string, 'improving' | 'stable' | 'declining'> = {
            'up': 'improving',
            'down': 'declining',
            'stable': 'stable'
        };

        return {
            className: db.class_name,
            subject: db.subject,
            examHistory: db.exam_history || [],
            outcomeProgress: [],
            overallTrend: trendMap[db.trend] || 'stable',
            // Additional fields for dashboard compatibility
            grade: db.grade,
            totalExams: db.total_exams,
            averageScore: db.average_score,
            bestAverage: db.best_average,
            worstAverage: db.worst_average,
            trend: db.trend
        };
    },

    async exportAllData(): Promise<string> {
        const analyses = await this.getAllAnalyses();
        return JSON.stringify(analyses, null, 2);
    }
};

export default analysisHistoryService;
