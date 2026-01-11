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

/**
 * Demo veri - Öğrenci portalı için
 */
export function generateStudentDemoData(): StudentDashboardData {
    const badges: Badge[] = [
        { id: 'b1', type: 'star_student', name: 'Yıldız Öğrenci', description: '3 sınav üst üste %80 üstü', icon: '⭐', points: 100, isEarned: true, earnedAt: '2026-01-05' },
        { id: 'b2', type: 'rising_star', name: 'Yükselen Yıldız', description: '3 sınav art arda gelişim', icon: '📈', points: 75, isEarned: true, earnedAt: '2026-01-08' },
        { id: 'b3', type: 'hard_worker', name: 'Çalışkan Arı', description: '7 gün art arda çalışma', icon: '🐝', points: 30, isEarned: false, progress: 71 },
        { id: 'b4', type: 'goal_achiever', name: 'Hedef Vurucu', description: 'Belirlenen hedefe ulaş', icon: '🎯', points: 50, isEarned: false, progress: 85 },
        { id: 'b5', type: 'champion', name: 'Şampiyon', description: 'Sınıf birincisi ol', icon: '🏆', points: 150, isEarned: false, progress: 0 },
        { id: 'b6', type: 'perfect_score', name: 'Mükemmel', description: 'Bir sınavdan 100 puan al', icon: '💯', points: 200, isEarned: false, progress: 0 },
        { id: 'b7', type: 'streak', name: 'Seri Ustası', description: '14 gün çalışma serisi', icon: '🔥', points: 60, isEarned: false, progress: 35 },
    ];

    const goals: StudentGoal[] = [
        { id: 'g1', title: 'Matematik Ortalaması', description: '%80 ortalamaya ulaş', targetValue: 80, currentValue: 75, unit: '%', status: 'active', createdAt: '2026-01-01' },
        { id: 'g2', title: 'Günlük Çalışma', description: 'Haftada 5 gün 30dk çalış', targetValue: 5, currentValue: 4, unit: 'gün', status: 'active', createdAt: '2026-01-01' },
        { id: 'g3', title: 'Kitap Okuma', description: 'Ayda 2 kitap oku', targetValue: 2, currentValue: 1, unit: 'kitap', deadline: '2026-01-31', status: 'active', createdAt: '2026-01-01' },
    ];

    const studyPlan: StudyPlanItem[] = [
        { id: 's1', subject: 'Matematik', topic: 'Ondalık Kesirler', description: 'Toplama çıkarma alıştırmaları', duration: 30, priority: 'high', isCompleted: false, scheduledFor: '2026-01-11' },
        { id: 's2', subject: 'Türkçe', topic: 'Paragraf Analizi', description: 'Konu kavrama soruları', duration: 25, priority: 'medium', isCompleted: false, scheduledFor: '2026-01-11' },
        { id: 's3', subject: 'İngilizce', topic: 'Present Tense', description: 'Gramer tekrarı', duration: 20, priority: 'medium', isCompleted: true, scheduledFor: '2026-01-10' },
        { id: 's4', subject: 'Fen Bilimleri', topic: 'Kuvvet ve Hareket', description: 'Deney videosu izle', duration: 15, priority: 'low', isCompleted: true, scheduledFor: '2026-01-10' },
    ];

    const strengths: StrengthWeakness[] = [
        { subject: 'Matematik', topic: 'Doğal Sayılar', type: 'strength', score: 92, examCount: 4, trend: 'stable' },
        { subject: 'Sosyal Bilgiler', topic: 'Tarih', type: 'strength', score: 88, examCount: 3, trend: 'improving' },
        { subject: 'Türkçe', topic: 'Okuma Anlama', type: 'strength', score: 85, examCount: 4, trend: 'stable' },
    ];

    const weaknesses: StrengthWeakness[] = [
        { subject: 'Matematik', topic: 'Ondalık Kesirler', type: 'weakness', score: 58, examCount: 3, trend: 'improving', recommendation: 'Günlük 15 dakika pratik yap' },
        { subject: 'İngilizce', topic: 'Gramer', type: 'weakness', score: 62, examCount: 4, trend: 'stable', recommendation: 'Video dersler izle' },
        { subject: 'Türkçe', topic: 'Paragraf Analizi', type: 'weakness', score: 65, examCount: 4, trend: 'declining', recommendation: 'Daha fazla kitap oku' },
    ];

    const weeklyActivity: DailyActivity[] = [
        { date: '2026-01-05', studyMinutes: 45, completedTasks: 3, earnedPoints: 15 },
        { date: '2026-01-06', studyMinutes: 30, completedTasks: 2, earnedPoints: 10 },
        { date: '2026-01-07', studyMinutes: 60, completedTasks: 4, earnedPoints: 25 },
        { date: '2026-01-08', studyMinutes: 25, completedTasks: 2, earnedPoints: 8 },
        { date: '2026-01-09', studyMinutes: 50, completedTasks: 3, earnedPoints: 18 },
        { date: '2026-01-10', studyMinutes: 35, completedTasks: 2, earnedPoints: 12 },
        { date: '2026-01-11', studyMinutes: 20, completedTasks: 1, earnedPoints: 5 },
    ];

    const leaderboard: LeaderboardEntry[] = [
        { rank: 1, studentId: 'top1', name: 'Ahmet Y.', points: 1250, isCurrentUser: false },
        { rank: 2, studentId: 'top2', name: 'Zeynep K.', points: 1180, isCurrentUser: false },
        { rank: 3, studentId: 'top3', name: 'Mehmet D.', points: 1120, isCurrentUser: false },
        { rank: 4, studentId: 'top4', name: 'Ayşe S.', points: 1050, isCurrentUser: false },
        { rank: 5, studentId: 'current', name: 'Sen', points: 975, isCurrentUser: true },
        { rank: 6, studentId: 'top6', name: 'Can T.', points: 920, isCurrentUser: false },
    ];

    return {
        student: {
            id: 'student-1',
            name: 'Elif Yılmaz',
            className: '6-A',
            grade: '6',
            totalPoints: 975,
            level: 12,
            levelProgress: 65
        },
        stats: {
            overallAverage: 78.5,
            examCount: 15,
            studyStreak: 5,
            weeklyStudyMinutes: 265,
            rank: 5,
            totalStudents: 28
        },
        badges,
        earnedBadgesCount: badges.filter(b => b.isEarned).length,
        totalBadgesCount: badges.length,
        goals,
        studyPlan,
        strengths,
        weaknesses,
        weeklyActivity,
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
