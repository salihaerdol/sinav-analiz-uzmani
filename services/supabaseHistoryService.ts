/**
 * SUPABASE HISTORY SERVICE
 * Analiz geçmişi, öğrenci ve sınıf gelişim takibi için Supabase servisi
 */

import { supabase, isSupabaseConfigured } from './supabase';
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
    exam_date: string | null;
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
// LOCAL STORAGE HELPERS
// =====================================================

const LOCAL_STORAGE_PREFIX = 'analysis_history_local_v1';

const padTwo = (value: number) => value.toString().padStart(2, '0');

const normalizeExamDate = (value?: string | null): string | null => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        const year = Number(isoMatch[1]);
        const month = Number(isoMatch[2]);
        const day = Number(isoMatch[3]);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        if (
            parsed.getUTCFullYear() === year &&
            parsed.getUTCMonth() === month - 1 &&
            parsed.getUTCDate() === day
        ) {
            return `${year}-${padTwo(month)}-${padTwo(day)}`;
        }
        return null;
    }

    const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmyMatch) {
        const day = Number(dmyMatch[1]);
        const month = Number(dmyMatch[2]);
        const year = Number(dmyMatch[3]);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        if (
            parsed.getUTCFullYear() === year &&
            parsed.getUTCMonth() === month - 1 &&
            parsed.getUTCDate() === day
        ) {
            return `${year}-${padTwo(month)}-${padTwo(day)}`;
        }
        return null;
    }

    return null;
};

const getLocalStorageKey = (userId?: string) => `${LOCAL_STORAGE_PREFIX}:${userId || 'guest'}`;

const readLocalAnalyses = (key: string): SavedAnalysis[] => {
    if (typeof localStorage === 'undefined') return [];
    try {
        const stored = localStorage.getItem(key);
        const parsed = stored ? JSON.parse(stored) : [];
        return (parsed || []).sort((a: SavedAnalysis, b: SavedAnalysis) => {
            const aDate = new Date(a.metadata.date || a.createdAt).getTime();
            const bDate = new Date(b.metadata.date || b.createdAt).getTime();
            return bDate - aDate;
        });
    } catch (error) {
        console.warn('Local analysis read failed:', error);
        return [];
    }
};

const writeLocalAnalyses = (key: string, analyses: SavedAnalysis[]) => {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(analyses));
    } catch (error) {
        console.warn('Local analysis write failed:', error);
    }
};

const mergeAnalyses = (remote: SavedAnalysis[], local: SavedAnalysis[]) => {
    const remoteIds = new Set(remote.map(item => item.id));
    const merged = [...remote];
    local.forEach(item => {
        if (!remoteIds.has(item.id)) {
            merged.push(item);
        }
    });
    return merged.sort((a, b) => {
        const aDate = new Date(a.metadata.date || a.createdAt).getTime();
        const bDate = new Date(b.metadata.date || b.createdAt).getTime();
        return bDate - aDate;
    });
};

const buildLocalSavedAnalysis = (
    metadata: ExamMetadata,
    analysis: AnalysisResult,
    questions: QuestionConfig[],
    students: Student[],
    aiSummary?: string
): SavedAnalysis => {
    const now = new Date().toISOString();
    return {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
        metadata,
        analysis,
        questions,
        students,
        aiSummary
    };
};

const upsertLocalAnalysis = (key: string, analysis: SavedAnalysis) => {
    const items = readLocalAnalyses(key);
    const index = items.findIndex(item => item.id === analysis.id);
    if (index >= 0) {
        items[index] = { ...items[index], ...analysis, updatedAt: new Date().toISOString() };
    } else {
        items.unshift(analysis);
    }
    writeLocalAnalyses(key, items);
};

const updateLocalAnalysis = (key: string, id: string, updates: Partial<SavedAnalysis>): boolean => {
    const items = readLocalAnalyses(key);
    const index = items.findIndex(item => item.id === id);
    if (index < 0) return false;
    items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    writeLocalAnalyses(key, items);
    return true;
};

const deleteLocalAnalysis = (key: string, id: string) => {
    const items = readLocalAnalyses(key).filter(item => item.id !== id);
    writeLocalAnalyses(key, items);
};

const buildStudentProgressFromAnalyses = (analyses: SavedAnalysis[]): StudentProgress[] => {
    const sortedAnalyses = [...analyses].sort((a, b) => {
        const aDate = new Date(a.metadata.date || a.createdAt).getTime();
        const bDate = new Date(b.metadata.date || b.createdAt).getTime();
        return aDate - bDate;
    });

    const studentMap = new Map<string, StudentProgress>();

    sortedAnalyses.forEach(entry => {
        const stats = entry.analysis.studentStats;
        const totalStudents = entry.students.length;
        const ranked = [...stats].sort((a, b) => b.percentage - a.percentage);
        const rankMap = new Map(ranked.map((item, index) => [item.studentId, index + 1]));

        stats.forEach(stat => {
            const student = entry.students.find(s => s.id === stat.studentId);
            if (!student) return;

            const key = student.name;
            const existing = studentMap.get(key) || {
                studentId: `local-${key}`,
                studentName: student.name,
                className: entry.metadata.className,
                examHistory: [],
                outcomeProgress: [],
                overallTrend: 'stable',
                averagePercentage: 0
            };

            existing.examHistory.push({
                analysisId: entry.id,
                date: entry.metadata.date || entry.createdAt,
                subject: entry.metadata.subject,
                examType: entry.metadata.examType,
                score: stat.totalScore,
                percentage: stat.percentage,
                classAverage: entry.analysis.classAverage,
                rank: rankMap.get(stat.studentId) || existing.examHistory.length + 1,
                totalStudents
            });

            existing.className = entry.metadata.className;
            studentMap.set(key, existing);
        });
    });

    return Array.from(studentMap.values()).map(student => {
        const scores = student.examHistory.map(e => e.percentage);
        const average = scores.reduce((sum, score) => sum + score, 0) / (scores.length || 1);
        let overallTrend: StudentProgress['overallTrend'] = 'stable';
        if (scores.length >= 2) {
            const lastTwo = scores.slice(-2);
            if (lastTwo[1] > lastTwo[0] + 5) overallTrend = 'improving';
            else if (lastTwo[1] < lastTwo[0] - 5) overallTrend = 'declining';
        }
        return {
            ...student,
            overallTrend,
            averagePercentage: average,
            totalExams: scores.length,
            averageScore: average,
            bestScore: Math.max(...scores),
            worstScore: Math.min(...scores),
            trend: overallTrend === 'improving' ? 'up' : overallTrend === 'declining' ? 'down' : 'stable'
        } as any;
    }).sort((a, b) => b.averagePercentage - a.averagePercentage);
};

const buildClassProgressFromAnalyses = (analyses: SavedAnalysis[]): ClassProgress[] => {
    const sortedAnalyses = [...analyses].sort((a, b) => {
        const aDate = new Date(a.metadata.date || a.createdAt).getTime();
        const bDate = new Date(b.metadata.date || b.createdAt).getTime();
        return aDate - bDate;
    });

    const classMap = new Map<string, ClassProgress>();

    sortedAnalyses.forEach(entry => {
        const key = `${entry.metadata.className}::${entry.metadata.subject}`;
        const percentages = entry.analysis.studentStats.map(stat => stat.percentage);
        const highest = percentages.length ? Math.max(...percentages) : 0;
        const lowest = percentages.length ? Math.min(...percentages) : 0;
        const passRate = percentages.length
            ? (percentages.filter(p => p >= 50).length / percentages.length) * 100
            : 0;

        const existing = classMap.get(key) || {
            className: entry.metadata.className,
            subject: entry.metadata.subject,
            examHistory: [],
            outcomeProgress: [],
            overallTrend: 'stable'
        };

        existing.examHistory.push({
            analysisId: entry.id,
            date: entry.metadata.date || entry.createdAt,
            examType: entry.metadata.examType,
            classAverage: entry.analysis.classAverage,
            highestScore: highest,
            lowestScore: lowest,
            passRate,
            studentCount: entry.students.length
        });

        classMap.set(key, existing);
    });

    return Array.from(classMap.values()).map(cls => {
        const averages = cls.examHistory.map(e => e.classAverage);
        const averageScore = averages.reduce((sum, score) => sum + score, 0) / (averages.length || 1);
        let overallTrend: ClassProgress['overallTrend'] = 'stable';
        if (averages.length >= 2) {
            const lastTwo = averages.slice(-2);
            if (lastTwo[1] > lastTwo[0] + 3) overallTrend = 'improving';
            else if (lastTwo[1] < lastTwo[0] - 3) overallTrend = 'declining';
        }

        return {
            ...cls,
            overallTrend,
            totalExams: averages.length,
            averageScore,
            bestAverage: Math.max(...averages),
            worstAverage: Math.min(...averages),
            trend: overallTrend === 'improving' ? 'up' : overallTrend === 'declining' ? 'down' : 'stable'
        } as any;
    }).sort((a, b) => b.averageScore - a.averageScore);
};

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
        const userId = user?.id;
        const localKey = getLocalStorageKey(userId);

        if (!isSupabaseConfigured || !userId) {
            const local = buildLocalSavedAnalysis(metadata, analysis, questions, students, aiSummary);
            upsertLocalAnalysis(localKey, local);
            return local;
        }

        const normalizedDate = normalizeExamDate(metadata.date);
        if (metadata.date && !normalizedDate) {
            console.warn('Sınav tarihi formatı çözülemedi, değer atlandı:', metadata.date);
        }

        const record = {
            user_id: userId,
            school_name: metadata.schoolName,
            teacher_name: metadata.teacherName,
            class_name: metadata.className,
            grade: metadata.grade,
            subject: metadata.subject,
            scenario: metadata.scenario,
            exam_date: normalizedDate,
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
            const local = buildLocalSavedAnalysis(metadata, analysis, questions, students, aiSummary);
            upsertLocalAnalysis(localKey, local);
            return local;
        }

        // Öğrenci ve sınıf ilerlemesini güncelle
        const saved = this.dbToSavedAnalysis(data);
        upsertLocalAnalysis(localKey, saved);
        await this.updateStudentProgress(metadata, analysis, students, saved.id);
        await this.updateClassProgress(metadata, analysis, saved.id);

        return saved;
    },

    /**
     * Tüm analizleri getir
     */
    async getAllAnalyses(options?: { scope?: 'own' | 'all' }): Promise<SavedAnalysis[]> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);
        const localAnalyses = readLocalAnalyses(localKey);

        if (!isSupabaseConfigured || !user?.id) {
            return localAnalyses;
        }

        let query = supabase
            .from('analysis_history')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (options?.scope !== 'all') {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Analizler getirilemedi:', error);
            return localAnalyses;
        }

        const remoteAnalyses = (data || []).map(item => this.dbToSavedAnalysis(item));
        if (options?.scope === 'all') {
            return remoteAnalyses;
        }
        return mergeAnalyses(remoteAnalyses, localAnalyses);
    },

    /**
     * Tek analiz getir
     */
    async getAnalysisById(id: string): Promise<SavedAnalysis | null> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);

        if (!isSupabaseConfigured || !user?.id) {
            return readLocalAnalyses(localKey).find(item => item.id === id) || null;
        }

        const { data, error } = await supabase
            .from('analysis_history')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Analiz getirilemedi:', error);
            return readLocalAnalyses(localKey).find(item => item.id === id) || null;
        }

        return this.dbToSavedAnalysis(data);
    },

    /**
     * Analiz güncelle
     */
    async updateAnalysis(id: string, updates: Partial<SavedAnalysis>): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);
        const localUpdated = updateLocalAnalysis(localKey, id, updates);

        if (!isSupabaseConfigured || !user?.id) {
            return localUpdated;
        }

        const dbUpdates: any = {};

        if (updates.metadata) {
            const normalizedDate = normalizeExamDate(updates.metadata.date);
            if (updates.metadata.date && !normalizedDate) {
                console.warn('Sınav tarihi formatı çözülemedi, değer atlandı:', updates.metadata.date);
            }
            dbUpdates.school_name = updates.metadata.schoolName;
            dbUpdates.teacher_name = updates.metadata.teacherName;
            dbUpdates.class_name = updates.metadata.className;
            dbUpdates.grade = updates.metadata.grade;
            dbUpdates.subject = updates.metadata.subject;
            dbUpdates.scenario = updates.metadata.scenario;
            dbUpdates.exam_date = normalizedDate;
            dbUpdates.term = updates.metadata.term;
            dbUpdates.exam_number = updates.metadata.examNumber;
            dbUpdates.exam_type = updates.metadata.examType;
            dbUpdates.academic_year = updates.metadata.academicYear;
        }
        if (updates.analysis) {
            dbUpdates.analysis_data = updates.analysis;
            dbUpdates.class_average = updates.analysis.classAverage;
        }
        if (updates.questions) {
            dbUpdates.questions_data = updates.questions;
            dbUpdates.total_questions = updates.questions.length;
        }
        if (updates.students) {
            dbUpdates.students_data = updates.students;
            dbUpdates.total_students = updates.students.length;
        }
        if (updates.aiSummary !== undefined) {
            dbUpdates.ai_summary = updates.aiSummary;
        }

        const { error } = await supabase
            .from('analysis_history')
            .update(dbUpdates)
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            console.error('Analiz güncellenemedi:', error);
            return localUpdated;
        }

        return true;
    },

    /**
     * Analiz sil
     */
    async deleteAnalysis(id: string, options?: { scope?: 'own' | 'all' }): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);
        deleteLocalAnalysis(localKey, id);

        if (!isSupabaseConfigured || !user?.id) {
            return true;
        }

        let query = supabase
            .from('analysis_history')
            .delete()
            .eq('id', id);

        if (options?.scope !== 'all') {
            query = query.eq('user_id', user.id);
        }

        const { error } = await query;

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
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);
        const localAnalyses = readLocalAnalyses(localKey);

        if (!isSupabaseConfigured || !user?.id) {
            return localAnalyses.filter(item => {
                if (filters.className && item.metadata.className !== filters.className) return false;
                if (filters.subject && item.metadata.subject !== filters.subject) return false;
                if (filters.grade && item.metadata.grade !== filters.grade) return false;
                if (filters.startDate && item.metadata.date < filters.startDate) return false;
                if (filters.endDate && item.metadata.date > filters.endDate) return false;
                return true;
            });
        }

        let query = supabase
            .from('analysis_history')
            .select('*')
            .eq('is_archived', false)
            .eq('user_id', user.id);

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
            return localAnalyses;
        }

        return (data || []).map(this.dbToSavedAnalysis);
    },

    /**
     * Öğrenci ilerlemesini güncelle
     */
    async updateStudentProgress(
        metadata: ExamMetadata,
        analysis: AnalysisResult,
        students: Student[],
        analysisId?: string
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

            const examDate = normalizeExamDate(metadata.date) || new Date().toISOString();
            const examEntry = {
                date: examDate,
                subject: metadata.subject,
                className: metadata.className,
                score: studentStat.percentage,
                analysisId: analysisId || null
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
        analysis: AnalysisResult,
        analysisId?: string
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

        const examDate = normalizeExamDate(metadata.date) || new Date().toISOString();
        const examEntry = {
            date: examDate,
            average: analysis.classAverage,
            studentCount: analysis.studentStats.length,
            analysisId: analysisId || null
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
    async getAllStudentProgress(options?: { scope?: 'own' | 'all' }): Promise<StudentProgress[]> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);

        if (!isSupabaseConfigured || !user?.id) {
            return buildStudentProgressFromAnalyses(readLocalAnalyses(localKey));
        }

        let query = supabase
            .from('student_progress')
            .select('*')
            .order('average_score', { ascending: false });

        if (options?.scope !== 'all') {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Öğrenci ilerlemeleri getirilemedi:', error);
            return buildStudentProgressFromAnalyses(readLocalAnalyses(localKey));
        }

        if (!data || data.length === 0) {
            const analyses = await this.getAllAnalyses(options);
            return buildStudentProgressFromAnalyses(analyses);
        }

        return data.map(this.dbToStudentProgress);
    },

    /**
     * Tüm sınıf ilerlemelerini getir
     */
    async getAllClassProgress(options?: { scope?: 'own' | 'all' }): Promise<ClassProgress[]> {
        const { data: { user } } = await supabase.auth.getUser();
        const localKey = getLocalStorageKey(user?.id);

        if (!isSupabaseConfigured || !user?.id) {
            return buildClassProgressFromAnalyses(readLocalAnalyses(localKey));
        }

        let query = supabase
            .from('class_progress')
            .select('*')
            .order('average_score', { ascending: false });

        if (options?.scope !== 'all') {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Sınıf ilerlemeleri getirilemedi:', error);
            return buildClassProgressFromAnalyses(readLocalAnalyses(localKey));
        }

        if (!data || data.length === 0) {
            const analyses = await this.getAllAnalyses(options);
            return buildClassProgressFromAnalyses(analyses);
        }

        return data.map(this.dbToClassProgress);
    },

    /**
     * Dashboard özeti getir
     */
    async getDashboardSummary(options?: { scope?: 'own' | 'all' }): Promise<DashboardSummary> {
        const [analyses, students, classes] = await Promise.all([
            this.getAllAnalyses(options),
            this.getAllStudentProgress(options),
            this.getAllClassProgress(options)
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
                date: db.exam_date || '',
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
