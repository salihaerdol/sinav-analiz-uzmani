// =====================================================
// MODÜL: VELİ PORTALI - SERVİS
// =====================================================
import {
    StudentSummary,
    ExamResult,
    SubjectPerformance,
    OutcomeAnalysis,
    ParentRecommendation,
    ParentNotification,
    ParentDashboardData
} from './types';
import { analysisHistoryService } from '../../services/supabaseHistoryService';
import { SavedAnalysis, Student } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const normalizeName = (value?: string) => (value || '').trim().toLowerCase();

const toDateValue = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

const getExamPercentage = (entry: { percentage?: number; score?: number }) => {
    if (typeof entry.percentage === 'number') return entry.percentage;
    if (typeof entry.score === 'number') return entry.score;
    return 0;
};

const buildRankMap = (analysis: SavedAnalysis) => new Map(
    [...analysis.analysis.studentStats]
        .sort((a, b) => b.percentage - a.percentage)
        .map((item, index) => [item.studentId, index + 1])
);

const buildExamTitle = (analysis: SavedAnalysis) => {
    const term = analysis.metadata.term ? `${analysis.metadata.term}. Dönem` : '';
    const number = analysis.metadata.examNumber ? `${analysis.metadata.examNumber}.` : '';
    const type = analysis.metadata.examType || '';
    return [term, number, type].filter(Boolean).join(' ').trim();
};

const findLatestAnalysisForStudent = (analyses: SavedAnalysis[], studentName: string) => {
    const nameKey = normalizeName(studentName);
    return analyses.find((analysis) =>
        analysis.students.some(student => normalizeName(student.name) === nameKey)
    );
};

const findStudentInAnalysis = (analysis: SavedAnalysis, studentName: string) => {
    const nameKey = normalizeName(studentName);
    return analysis.students.find(student => normalizeName(student.name) === nameKey);
};

const getStudentScoreBreakdown = (student: Student, analysis: SavedAnalysis) => {
    const questions = analysis.questions || [];
    const scoreMap = student.scores || {};
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    questions.forEach((question) => {
        const score = scoreMap[question.id] ?? 0;
        if (score >= question.maxScore) {
            correct += 1;
        } else if (score <= 0) {
            wrong += 1;
        } else {
            empty += 1;
        }
    });

    return { correct, wrong, empty, totalQuestions: questions.length };
};

const buildExamResults = (analyses: SavedAnalysis[], studentName: string): ExamResult[] => {
    const nameKey = normalizeName(studentName);
    return analyses.flatMap((analysis) => {
        const student = analysis.students.find(s => normalizeName(s.name) === nameKey);
        if (!student) return [];
        const stat = analysis.analysis.studentStats.find(s => s.studentId === student.id);
        if (!stat) return [];
        const rankMap = buildRankMap(analysis);
        const breakdown = getStudentScoreBreakdown(student, analysis);
        const percentage = stat.percentage;

        return [{
            id: analysis.id,
            examTitle: buildExamTitle(analysis),
            subject: analysis.metadata.subject,
            date: analysis.metadata.date || analysis.createdAt,
            score: Math.round(percentage),
            maxScore: 100,
            percentage,
            classAverage: analysis.analysis.classAverage,
            classRank: rankMap.get(student.id) || 0,
            totalStudents: analysis.students.length,
            status: percentage >= 70 ? 'passed' : percentage >= 50 ? 'borderline' : 'failed',
            correctAnswers: breakdown.correct,
            wrongAnswers: breakdown.wrong,
            emptyAnswers: breakdown.empty,
            totalQuestions: breakdown.totalQuestions
        }];
    });
};

const buildSubjectPerformances = (analyses: SavedAnalysis[], studentName: string): SubjectPerformance[] => {
    const nameKey = normalizeName(studentName);
    const subjectMap = new Map<string, { scores: number[]; latest?: SavedAnalysis }>();

    analyses.forEach((analysis) => {
        const student = analysis.students.find(s => normalizeName(s.name) === nameKey);
        if (!student) return;
        const stat = analysis.analysis.studentStats.find(s => s.studentId === student.id);
        if (!stat) return;
        const entry = subjectMap.get(analysis.metadata.subject) || { scores: [] };
        entry.scores.push(stat.percentage);
        if (!entry.latest) {
            entry.latest = analysis;
        }
        subjectMap.set(analysis.metadata.subject, entry);
    });

    return Array.from(subjectMap.entries()).map(([subject, entry]) => {
        const scores = entry.scores;
        const average = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
        const lastScore = scores[scores.length - 1] || 0;
        const previousScore = scores.length > 1 ? scores[scores.length - 2] : undefined;
        const trend = previousScore === undefined
            ? 'stable'
            : lastScore > previousScore + 3
                ? 'up'
                : lastScore < previousScore - 3
                    ? 'down'
                    : 'stable';

        const outcomeStats = entry.latest?.analysis.outcomeStats || [];
        const sortedOutcomes = [...outcomeStats].sort((a, b) => b.successRate - a.successRate);
        const strongTopics = sortedOutcomes.filter(o => o.successRate >= 70).slice(0, 2).map(o => o.description);
        const weakTopics = sortedOutcomes.filter(o => o.successRate < 70).slice(-1).map(o => o.description);

        return {
            subject,
            examCount: scores.length,
            average,
            trend,
            strongTopics,
            weakTopics,
            lastScore
        };
    });
};

const buildOutcomeAnalyses = (analysis?: SavedAnalysis): OutcomeAnalysis[] => {
    if (!analysis) return [];
    return analysis.analysis.outcomeStats.map(o => ({
        code: o.code,
        description: o.description,
        successRate: o.successRate,
        status: o.successRate >= 70 ? 'strong' : o.successRate >= 50 ? 'average' : 'weak',
        recommendation: o.successRate < 50 ? 'Ek tekrar yapılması önerilir.' : undefined
    }));
};

const buildRecommendations = (outcomes: OutcomeAnalysis[], fallbackSubject?: string): ParentRecommendation[] => {
    const weakOutcomes = outcomes.filter(o => o.status === 'weak');
    if (weakOutcomes.length === 0) {
        return [{
            id: 'rec-stable',
            type: 'study_tip',
            title: 'Düzenli tekrar önerisi',
            description: 'Kazanımlar dengeli görünüyor. Haftalık kısa tekrarlar başarıyı korur.',
            priority: 'low',
            subject: fallbackSubject
        }];
    }

    return weakOutcomes.slice(0, 3).map((outcome, index) => ({
        id: `rec-${index + 1}`,
        type: outcome.successRate < 40 ? 'study_tip' : 'activity',
        title: `${outcome.code} için destek`,
        description: `${outcome.description} kazanımı için ek tekrar ve kısa ödevler önerilir.`,
        priority: outcome.successRate < 40 ? 'high' : 'medium',
        subject: fallbackSubject
    }));
};

const buildNotifications = (exams: ExamResult[], studentName: string, includeReport: boolean) => {
    const base = exams.slice(0, 3).map((exam, index) => ({
        id: `notif-exam-${index + 1}`,
        type: 'exam_result' as const,
        title: `${exam.subject} sınav sonucu`,
        message: `${studentName} için ${exam.subject} sınav sonucu: ${exam.score} puan`,
        isRead: index > 0,
        createdAt: exam.date
    }));

    if (includeReport) {
        base.unshift({
            id: 'notif-report',
            type: 'report_ready',
            title: 'Analiz raporu hazır',
            message: `${studentName} için son analiz raporu hazırlandı.`,
            isRead: false,
            createdAt: exams[0]?.date || new Date().toISOString()
        });
    }

    return base;
};

/**
 * Veli portalı verilerini Supabase analizlerinden üretir.
 */
export async function loadParentDashboardData(options?: { selectedChildId?: string }): Promise<ParentDashboardData | null> {
    const [analyses, progressList] = await Promise.all([
        analysisHistoryService.getAllAnalyses(),
        analysisHistoryService.getAllStudentProgress()
    ]);

    if (!analyses.length && !progressList.length) {
        return null;
    }

    const sortedProgress = [...progressList].sort((a, b) => {
        const aExams = a.examHistory?.length || 0;
        const bExams = b.examHistory?.length || 0;
        if (bExams !== aExams) return bExams - aExams;
        return (b.averagePercentage || 0) - (a.averagePercentage || 0);
    });

    const children = sortedProgress.length
        ? sortedProgress.map(progress => {
            const latestAnalysis = findLatestAnalysisForStudent(analyses, progress.studentName);
            const rankMap = latestAnalysis ? buildRankMap(latestAnalysis) : new Map<string, number>();
            const latestExam = progress.examHistory?.[progress.examHistory.length - 1];
            const previousExam = progress.examHistory?.length > 1
                ? progress.examHistory[progress.examHistory.length - 2]
                : undefined;
            const lastScore = latestExam ? getExamPercentage(latestExam) : progress.averagePercentage;
            const previousScore = previousExam ? getExamPercentage(previousExam) : progress.averagePercentage;
            const trend = lastScore > previousScore + 3 ? 'up' : lastScore < previousScore - 3 ? 'down' : 'stable';

            const student = latestAnalysis ? findStudentInAnalysis(latestAnalysis, progress.studentName) : undefined;
            const classRank = student && latestAnalysis ? rankMap.get(student.id) : undefined;
            const totalStudentsInClass = latestAnalysis?.students.length;

            return {
                id: progress.studentId || `student-${normalizeName(progress.studentName)}`,
                name: progress.studentName,
                className: progress.className || latestAnalysis?.metadata.className || '-',
                grade: latestAnalysis?.metadata.grade || '-',
                schoolName: latestAnalysis?.metadata.schoolName || '-',
                overallAverage: Number((progress.averagePercentage || 0).toFixed(1)),
                previousAverage: Number((previousScore || progress.averagePercentage || 0).toFixed(1)),
                trend,
                classRank,
                totalStudentsInClass,
                lastExamDate: latestExam?.date || latestAnalysis?.metadata.date,
                lastExamScore: lastScore ? Math.round(lastScore) : undefined,
                lastExamSubject: latestExam?.subject || latestAnalysis?.metadata.subject
            } as StudentSummary;
        })
        : [];

    if (children.length === 0) {
        const latestAnalysis = analyses[0];
        if (!latestAnalysis) return null;
        const fallbackStudent = latestAnalysis.students[0];
        if (!fallbackStudent) return null;
        children.push({
            id: fallbackStudent.id,
            name: fallbackStudent.name,
            className: latestAnalysis.metadata.className,
            grade: latestAnalysis.metadata.grade,
            schoolName: latestAnalysis.metadata.schoolName || '-',
            overallAverage: latestAnalysis.analysis.classAverage,
            previousAverage: latestAnalysis.analysis.classAverage,
            trend: 'stable',
            classRank: 1,
            totalStudentsInClass: latestAnalysis.students.length,
            lastExamDate: latestAnalysis.metadata.date,
            lastExamScore: Math.round(latestAnalysis.analysis.classAverage),
            lastExamSubject: latestAnalysis.metadata.subject
        });
    }

    const preferredChild = options?.selectedChildId
        ? children.find(child => child.id === options.selectedChildId)
        : undefined;
    const resolvedChild = preferredChild || children[0];
    const selectedChildId = resolvedChild?.id || '';
    const selectedChildName = resolvedChild?.name || '';
    const selectedAnalyses = analyses.filter((analysis) =>
        analysis.students.some(student => normalizeName(student.name) === normalizeName(selectedChildName))
    );
    const recentExams = buildExamResults(selectedAnalyses, selectedChildName).slice(0, 4);
    const subjectPerformances = buildSubjectPerformances(selectedAnalyses, selectedChildName);
    const latestAnalysis = selectedAnalyses[0];
    const outcomes = buildOutcomeAnalyses(latestAnalysis);
    const recommendations = buildRecommendations(outcomes, latestAnalysis?.metadata.subject);
    const notifications = buildNotifications(recentExams, selectedChildName, Boolean(latestAnalysis?.aiSummary));

    return {
        children,
        selectedChildId,
        recentExams,
        subjectPerformances,
        outcomes,
        recommendations,
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
    };
}

/**
 * Trend hesaplama
 */
export function getTrendInfo(trend: 'up' | 'down' | 'stable'): { icon: string; color: string; label: string } {
    switch (trend) {
        case 'up': return { icon: '↑', color: 'text-emerald-600', label: 'Yükseliyor' };
        case 'down': return { icon: '↓', color: 'text-rose-600', label: 'Düşüyor' };
        case 'stable': return { icon: '→', color: 'text-slate-500', label: 'Stabil' };
    }
}

/**
 * Durum rengi
 */
export function getStatusColor(status: 'passed' | 'failed' | 'borderline' | 'strong' | 'average' | 'weak'): string {
    switch (status) {
        case 'passed':
        case 'strong': return 'bg-emerald-100 text-emerald-700';
        case 'failed':
        case 'weak': return 'bg-rose-100 text-rose-700';
        case 'borderline':
        case 'average': return 'bg-amber-100 text-amber-700';
        default: return 'bg-slate-100 text-slate-700';
    }
}

/**
 * Bildirim ikonu
 */
export function getNotificationIcon(type: ParentNotification['type']): string {
    switch (type) {
        case 'exam_result': return '📊';
        case 'report_ready': return '📋';
        case 'teacher_message': return '💬';
        case 'alert': return '⚠️';
        case 'announcement': return '📢';
        default: return '📌';
    }
}

/**
 * Öneri ikonu
 */
export function getRecommendationIcon(type: ParentRecommendation['type']): string {
    switch (type) {
        case 'study_tip': return '💡';
        case 'activity': return '🎯';
        case 'resource': return '📚';
        case 'meeting': return '👥';
        default: return '📌';
    }
}

// ═══════════════════════════════════════════════════════════════
// WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Bildirimi okundu olarak işaretle
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
        console.warn('Supabase yapılandırılmamış, bildirim güncellenemedi.');
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('parent_notifications')
        .upsert({
            user_id: user.id,
            notification_id: notificationId,
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,notification_id' });

    if (error) {
        console.error('Bildirim güncellenemedi:', error);
        return false;
    }

    return true;
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('parent_notifications')
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('Bildirimler güncellenemedi:', error);
        return false;
    }

    return true;
}

/**
 * Veli tercihlerini kaydet
 */
export async function saveParentPreferences(preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyReport?: boolean;
    selectedChildId?: string;
    language?: string;
}): Promise<boolean> {
    if (!isSupabaseConfigured) {
        console.warn('Supabase yapılandırılmamış, tercihler kaydedilemedi.');
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('parent_preferences')
        .upsert({
            user_id: user.id,
            email_notifications: preferences.emailNotifications,
            push_notifications: preferences.pushNotifications,
            weekly_report: preferences.weeklyReport,
            selected_child_id: preferences.selectedChildId,
            language: preferences.language,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('Tercihler kaydedilemedi:', error);
        return false;
    }

    return true;
}

/**
 * Veli tercihlerini getir
 */
export async function getParentPreferences(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;
    selectedChildId?: string;
    language: string;
} | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('parent_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) {
        return {
            emailNotifications: true,
            pushNotifications: true,
            weeklyReport: true,
            language: 'tr'
        };
    }

    return {
        emailNotifications: data.email_notifications ?? true,
        pushNotifications: data.push_notifications ?? true,
        weeklyReport: data.weekly_report ?? true,
        selectedChildId: data.selected_child_id,
        language: data.language ?? 'tr'
    };
}

/**
 * Çocuk takip notunu kaydet
 */
export async function saveChildNote(childId: string, note: {
    title: string;
    content: string;
    category?: 'academic' | 'behavior' | 'health' | 'general';
}): Promise<string | null> {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('parent_child_notes')
        .insert({
            user_id: user.id,
            child_id: childId,
            title: note.title,
            content: note.content,
            category: note.category || 'general',
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) {
        console.error('Not kaydedilemedi:', error);
        return null;
    }

    return data?.id || null;
}

/**
 * Veli geri bildirimi gönder
 */
export async function submitParentFeedback(feedback: {
    type: 'suggestion' | 'complaint' | 'praise' | 'question';
    subject: string;
    message: string;
    childId?: string;
}): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('parent_feedback')
        .insert({
            user_id: user.id,
            type: feedback.type,
            subject: feedback.subject,
            message: feedback.message,
            child_id: feedback.childId,
            status: 'pending',
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Geri bildirim gönderilemedi:', error);
        return false;
    }

    return true;
}
