// =====================================================
// MODÜL: ÖĞRENCİ PORTALI - SERVİS
// =====================================================
import {
    StudentDashboardData,
    Badge,
    StudentGoal,
    StudyPlanItem,
    StrengthWeakness,
    DailyActivity,
    LeaderboardEntry
} from './types';
import { analysisHistoryService } from '../../services/supabaseHistoryService';
import { SavedAnalysis } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

const normalizeName = (value?: string) => (value || '').trim().toLowerCase();

const toDateValue = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
};

const toDateKey = (value?: string) => {
    const date = toDateValue(value);
    return date ? date.toISOString().slice(0, 10) : '';
};

const getExamPercentage = (entry: { percentage?: number; score?: number }) => {
    if (typeof entry.percentage === 'number') return entry.percentage;
    if (typeof entry.score === 'number') return entry.score;
    return 0;
};

const buildExamHistoryFromAnalyses = (analyses: SavedAnalysis[], studentName: string) => {
    const nameKey = normalizeName(studentName);
    const history = analyses.flatMap((analysis) => {
        const student = analysis.students.find(s => normalizeName(s.name) === nameKey);
        if (!student) return [];
        const stat = analysis.analysis.studentStats.find(s => s.studentId === student.id);
        if (!stat) return [];
        const rankMap = new Map(
            [...analysis.analysis.studentStats]
                .sort((a, b) => b.percentage - a.percentage)
                .map((item, index) => [item.studentId, index + 1])
        );
        return [{
            analysisId: analysis.id,
            date: analysis.metadata.date || analysis.createdAt,
            subject: analysis.metadata.subject,
            examType: analysis.metadata.examType,
            score: stat.totalScore,
            percentage: stat.percentage,
            classAverage: analysis.analysis.classAverage,
            rank: rankMap.get(student.id) || 0,
            totalStudents: analysis.students.length
        }];
    });

    return history.sort((a, b) => {
        const aDate = toDateValue(a.date)?.getTime() || 0;
        const bDate = toDateValue(b.date)?.getTime() || 0;
        return aDate - bDate;
    });
};

const buildWeeklyActivity = (examHistory: any[]): DailyActivity[] => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);

    const byDate = new Map<string, number[]>();
    examHistory.forEach(entry => {
        const dateKey = toDateKey(entry.date);
        if (!dateKey) return;
        const dateValue = toDateValue(dateKey);
        if (dateValue && dateValue < start) return;
        const list = byDate.get(dateKey) || [];
        list.push(getExamPercentage(entry));
        byDate.set(dateKey, list);
    });

    const days: DailyActivity[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = date.toISOString().slice(0, 10);
        const scores = byDate.get(key) || [];
        const average = scores.length ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
        const studyMinutes = scores.length ? Math.round(10 + average * 0.6) : 0;
        const earnedPoints = scores.length ? Math.round(average / 2) : 0;
        days.push({
            date: key,
            studyMinutes,
            completedTasks: scores.length,
            earnedPoints
        });
    }
    return days;
};

const buildOutcomeTrendMap = (latest?: SavedAnalysis, previous?: SavedAnalysis) => {
    const prevMap = new Map<string, number>();
    if (previous) {
        previous.analysis.outcomeStats.forEach((o) => {
            prevMap.set(o.code, o.successRate);
        });
    }
    const trendMap = new Map<string, StrengthWeakness['trend']>();
    latest?.analysis.outcomeStats.forEach((o) => {
        const prev = prevMap.get(o.code);
        if (prev === undefined) {
            trendMap.set(o.code, 'stable');
        } else if (o.successRate > prev + 5) {
            trendMap.set(o.code, 'improving');
        } else if (o.successRate < prev - 5) {
            trendMap.set(o.code, 'declining');
        } else {
            trendMap.set(o.code, 'stable');
        }
    });
    return trendMap;
};

/**
 * Öğrenci portalı verilerini Supabase analizlerinden üretir.
 */
export async function loadStudentDashboardData(): Promise<StudentDashboardData | null> {
    const [analyses, progressList] = await Promise.all([
        analysisHistoryService.getAllAnalyses(),
        analysisHistoryService.getAllStudentProgress()
    ]);

    if (!analyses.length && !progressList.length) {
        return null;
    }

    const latestAnalysis = analyses[0];
    const sortedProgress = [...progressList].sort((a, b) => {
        const aExams = a.examHistory?.length || 0;
        const bExams = b.examHistory?.length || 0;
        if (bExams !== aExams) return bExams - aExams;
        return (b.averagePercentage || 0) - (a.averagePercentage || 0);
    });

    const primaryProgress = sortedProgress[0];
    let studentName = primaryProgress?.studentName;
    let studentId = primaryProgress?.studentId;

    if (!studentName && latestAnalysis) {
        const topStat = [...latestAnalysis.analysis.studentStats]
            .sort((a, b) => b.percentage - a.percentage)[0];
        const student = latestAnalysis.students.find(s => s.id === topStat?.studentId) || latestAnalysis.students[0];
        studentName = student?.name;
        studentId = student?.id;
    }

    if (!studentName) {
        return null;
    }

    const normalizedName = normalizeName(studentName);
    const studentRecord = latestAnalysis?.students.find(s => normalizeName(s.name) === normalizedName);
    studentId = studentId || studentRecord?.id || `student-${normalizedName}`;

    const examHistory = (primaryProgress?.examHistory?.length
        ? primaryProgress.examHistory
        : buildExamHistoryFromAnalyses(analyses, studentName)) as any[];

    const sortedHistory = [...examHistory].sort((a, b) => {
        const aDate = toDateValue(a.date)?.getTime() || 0;
        const bDate = toDateValue(b.date)?.getTime() || 0;
        return aDate - bDate;
    });

    const overallAverage = primaryProgress?.averagePercentage
        ?? (sortedHistory.length ? sortedHistory.reduce((sum, item) => sum + getExamPercentage(item), 0) / sortedHistory.length : 0);
    const examCount = sortedHistory.length;

    const activity = buildWeeklyActivity(sortedHistory);
    const weeklyStudyMinutes = activity.reduce((sum, item) => sum + item.studyMinutes, 0);
    const studyStreak = new Set(activity.filter(day => day.studyMinutes > 0).map(day => day.date)).size;

    const rankMap = latestAnalysis
        ? new Map(
            [...latestAnalysis.analysis.studentStats]
                .sort((a, b) => b.percentage - a.percentage)
                .map((item, index) => [item.studentId, index + 1])
        )
        : new Map<string, number>();

    const rank = latestAnalysis && studentRecord
        ? (rankMap.get(studentRecord.id) || 0)
        : 0;
    const totalStudents = latestAnalysis?.students.length || 0;

    const lastThree = sortedHistory.slice(-3).map(getExamPercentage);
    const lastThreeAverage = lastThree.length ? lastThree.reduce((sum, value) => sum + value, 0) / lastThree.length : 0;
    const lastThreeImproving = lastThree.length >= 3
        ? lastThree[2] > lastThree[1] && lastThree[1] > lastThree[0]
        : false;
    const bestScore = sortedHistory.length ? Math.max(...sortedHistory.map(getExamPercentage)) : 0;

    const badges: Badge[] = [
        {
            id: 'b1',
            type: 'star_student',
            name: 'Yıldız Öğrenci',
            description: '3 sınav ortalaması %80 üzeri',
            icon: '⭐',
            points: 100,
            isEarned: lastThreeAverage >= 80,
            progress: Math.min(100, Math.round((lastThreeAverage / 80) * 100))
        },
        {
            id: 'b2',
            type: 'rising_star',
            name: 'Yükselen Yıldız',
            description: 'Arka arkaya gelişim',
            icon: '📈',
            points: 75,
            isEarned: lastThreeImproving,
            progress: lastThreeImproving ? 100 : Math.round((lastThree.length / 3) * 100)
        },
        {
            id: 'b3',
            type: 'hard_worker',
            name: 'Çalışkan Arı',
            description: 'Haftalık 200dk çalışma',
            icon: '🐝',
            points: 30,
            isEarned: weeklyStudyMinutes >= 200,
            progress: Math.min(100, Math.round((weeklyStudyMinutes / 200) * 100))
        },
        {
            id: 'b4',
            type: 'goal_achiever',
            name: 'Hedef Vurucu',
            description: 'Genel ortalama %85',
            icon: '🎯',
            points: 50,
            isEarned: overallAverage >= 85,
            progress: Math.min(100, Math.round((overallAverage / 85) * 100))
        },
        {
            id: 'b5',
            type: 'champion',
            name: 'Şampiyon',
            description: 'Sınıf birincisi',
            icon: '🏆',
            points: 150,
            isEarned: rank === 1,
            progress: rank > 0 ? Math.max(0, 100 - rank * 10) : 0
        },
        {
            id: 'b6',
            type: 'perfect_score',
            name: 'Mükemmel',
            description: 'Bir sınavda %95 üzeri',
            icon: '💯',
            points: 200,
            isEarned: bestScore >= 95,
            progress: Math.min(100, Math.round((bestScore / 95) * 100))
        },
        {
            id: 'b7',
            type: 'streak',
            name: 'Seri Ustası',
            description: 'Haftada 5 gün aktif',
            icon: '🔥',
            points: 60,
            isEarned: studyStreak >= 5,
            progress: Math.min(100, Math.round((studyStreak / 5) * 100))
        }
    ];

    const totalPoints = Math.round(overallAverage * Math.max(1, examCount)) +
        badges.filter(b => b.isEarned).reduce((sum, badge) => sum + badge.points, 0);
    const levelInfo = calculateLevel(totalPoints);

    const goals: StudentGoal[] = [
        {
            id: 'g1',
            title: 'Genel Ortalama',
            description: '%85 ortalamaya ulaş',
            targetValue: 85,
            currentValue: Number(overallAverage.toFixed(1)),
            unit: '%',
            status: overallAverage >= 85 ? 'completed' : 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'g2',
            title: 'Haftalık Çalışma',
            description: '200 dakika çalışma',
            targetValue: 200,
            currentValue: weeklyStudyMinutes,
            unit: 'dk',
            status: weeklyStudyMinutes >= 200 ? 'completed' : 'active',
            createdAt: new Date().toISOString()
        },
        {
            id: 'g3',
            title: 'Sınav Tamamlama',
            description: '8 sınavı tamamla',
            targetValue: 8,
            currentValue: examCount,
            unit: 'sınav',
            status: examCount >= 8 ? 'completed' : 'active',
            createdAt: new Date().toISOString()
        }
    ];

    const latestSubjectKey = latestAnalysis ? `${latestAnalysis.metadata.className}-${latestAnalysis.metadata.subject}` : '';
    const previousAnalysis = latestAnalysis
        ? analyses.find(a => a.id !== latestAnalysis.id && `${a.metadata.className}-${a.metadata.subject}` === latestSubjectKey)
        : undefined;
    const outcomeTrendMap = buildOutcomeTrendMap(latestAnalysis, previousAnalysis);
    const outcomeStats = latestAnalysis?.analysis.outcomeStats || [];
    const sortedOutcomes = [...outcomeStats].sort((a, b) => b.successRate - a.successRate);

    const strengths: StrengthWeakness[] = sortedOutcomes.slice(0, 3).map(o => ({
        subject: latestAnalysis?.metadata.subject || '-',
        topic: o.description,
        type: 'strength',
        score: Math.round(o.successRate),
        examCount,
        trend: outcomeTrendMap.get(o.code) || 'stable'
    }));

    const weaknesses: StrengthWeakness[] = sortedOutcomes.slice(-3).reverse().map(o => ({
        subject: latestAnalysis?.metadata.subject || '-',
        topic: o.description,
        type: 'weakness',
        score: Math.round(o.successRate),
        examCount,
        trend: outcomeTrendMap.get(o.code) || 'stable',
        recommendation: o.successRate < 50 ? 'Ek tekrar yapılması önerilir.' : undefined
    }));

    const studyPlan: StudyPlanItem[] = weaknesses.map((weak, index) => {
        const scheduled = new Date();
        scheduled.setDate(scheduled.getDate() + index);
        const priority = weak.score < 50 ? 'high' : weak.score < 70 ? 'medium' : 'low';
        const duration = weak.score < 50 ? 35 : weak.score < 70 ? 25 : 20;
        return {
            id: `plan-${index + 1}`,
            subject: weak.subject,
            topic: weak.topic,
            description: 'Kazanım tekrar planı',
            duration,
            priority,
            isCompleted: false,
            scheduledFor: scheduled.toISOString().slice(0, 10)
        };
    });

    const leaderboard: LeaderboardEntry[] = latestAnalysis
        ? [...latestAnalysis.analysis.studentStats]
            .sort((a, b) => b.percentage - a.percentage)
            .map((stat, index) => {
                const student = latestAnalysis.students.find(s => s.id === stat.studentId);
                return {
                    rank: index + 1,
                    studentId: stat.studentId,
                    name: student?.name || `Öğrenci ${index + 1}`,
                    points: Math.round(stat.percentage * 10),
                    isCurrentUser: stat.studentId === studentRecord?.id
                };
            })
        : [];

    return {
        student: {
            id: studentId,
            name: studentName,
            className: latestAnalysis?.metadata.className || primaryProgress?.className || '-',
            grade: latestAnalysis?.metadata.grade || '-',
            totalPoints,
            level: levelInfo.level,
            levelProgress: levelInfo.progress
        },
        stats: {
            overallAverage: Number(overallAverage.toFixed(1)),
            examCount,
            studyStreak,
            weeklyStudyMinutes,
            rank,
            totalStudents
        },
        badges,
        earnedBadgesCount: badges.filter(b => b.isEarned).length,
        totalBadgesCount: badges.length,
        goals,
        studyPlan,
        strengths,
        weaknesses,
        weeklyActivity: activity,
        leaderboard
    };
}

/**
 * Seviye hesaplama
 */
export function calculateLevel(points: number): { level: number; progress: number } {
    const pointsPerLevel = 100;
    const level = Math.floor(points / pointsPerLevel) + 1;
    const progress = (points % pointsPerLevel);
    return { level, progress };
}

/**
 * Rozet ikon ve rengi
 */
export function getBadgeStyle(type: Badge['type']): { bgColor: string; borderColor: string } {
    const styles: Record<Badge['type'], { bgColor: string; borderColor: string }> = {
        star_student: { bgColor: 'bg-amber-100', borderColor: 'border-amber-400' },
        rising_star: { bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400' },
        goal_achiever: { bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400' },
        hard_worker: { bgColor: 'bg-orange-100', borderColor: 'border-orange-400' },
        champion: { bgColor: 'bg-violet-100', borderColor: 'border-violet-400' },
        streak: { bgColor: 'bg-rose-100', borderColor: 'border-rose-400' },
        perfect_score: { bgColor: 'bg-cyan-100', borderColor: 'border-cyan-400' }
    };
    return styles[type] || { bgColor: 'bg-slate-100', borderColor: 'border-slate-400' };
}

/**
 * Öncelik rengi
 */
export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
        case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
}

// ═══════════════════════════════════════════════════════════════
// WRITE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Çalışma planı görevini tamamlandı olarak işaretle
 */
export async function markStudyPlanTaskComplete(taskId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
        console.warn('Supabase yapılandırılmamış, görev tamamlanamadı.');
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('student_study_tasks')
        .upsert({
            id: taskId,
            user_id: user.id,
            is_completed: true,
            completed_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (error) {
        console.error('Görev tamamlanamadı:', error);
        return false;
    }

    return true;
}

/**
 * Öğrenci hedefi oluştur
 */
export async function createStudentGoal(goal: {
    title: string;
    description: string;
    targetValue: number;
    unit: string;
}): Promise<string | null> {
    if (!isSupabaseConfigured) {
        console.warn('Supabase yapılandırılmamış, hedef oluşturulamadı.');
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('student_goals')
        .insert({
            user_id: user.id,
            title: goal.title,
            description: goal.description,
            target_value: goal.targetValue,
            current_value: 0,
            unit: goal.unit,
            status: 'active',
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) {
        console.error('Hedef oluşturulamadı:', error);
        return null;
    }

    return data?.id || null;
}

/**
 * Hedef ilerlemesini güncelle
 */
export async function updateGoalProgress(goalId: string, currentValue: number): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
        .from('student_goals')
        .update({
            current_value: currentValue,
            updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

    if (error) {
        console.error('Hedef güncellenemedi:', error);
        return false;
    }

    return true;
}

/**
 * Rozet kazanma durumunu kaydet
 */
export async function saveEarnedBadge(badge: {
    type: Badge['type'];
    earnedAt: string;
    points: number;
}): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('student_badges')
        .upsert({
            user_id: user.id,
            badge_type: badge.type,
            earned_at: badge.earnedAt,
            points: badge.points
        }, { onConflict: 'user_id,badge_type' });

    if (error) {
        console.error('Rozet kaydedilemedi:', error);
        return false;
    }

    return true;
}

/**
 * Günlük çalışma aktivitesi kaydet
 */
export async function logStudyActivity(activity: {
    date: string;
    studyMinutes: number;
    completedTasks: number;
}): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from('student_activity_log')
        .upsert({
            user_id: user.id,
            activity_date: activity.date,
            study_minutes: activity.studyMinutes,
            completed_tasks: activity.completedTasks,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,activity_date' });

    if (error) {
        console.error('Aktivite kaydedilemedi:', error);
        return false;
    }

    return true;
}

