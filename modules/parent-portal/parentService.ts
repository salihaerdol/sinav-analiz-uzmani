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

/**
 * Demo veri - Veli portalı için
 */
export function generateParentDemoData(): ParentDashboardData {
    const children: StudentSummary[] = [
        {
            id: 'child-1',
            name: 'Elif Yılmaz',
            className: '6-A',
            grade: '6',
            schoolName: 'Örnek Ortaokulu',
            overallAverage: 78.5,
            previousAverage: 74.2,
            trend: 'up',
            classRank: 8,
            totalStudentsInClass: 28,
            lastExamDate: '2026-01-08',
            lastExamScore: 82,
            lastExamSubject: 'Matematik'
        },
        {
            id: 'child-2',
            name: 'Can Yılmaz',
            className: '4-B',
            grade: '4',
            schoolName: 'Örnek İlkokulu',
            overallAverage: 85.2,
            previousAverage: 83.1,
            trend: 'up',
            classRank: 3,
            totalStudentsInClass: 25,
            lastExamDate: '2026-01-10',
            lastExamScore: 90,
            lastExamSubject: 'Türkçe'
        }
    ];

    const recentExams: ExamResult[] = [
        {
            id: 'exam-1',
            examTitle: '1. Dönem 2. Yazılı',
            subject: 'Matematik',
            date: '2026-01-08',
            score: 82,
            maxScore: 100,
            percentage: 82,
            classAverage: 68.5,
            classRank: 5,
            totalStudents: 28,
            status: 'passed',
            correctAnswers: 16,
            wrongAnswers: 3,
            emptyAnswers: 1,
            totalQuestions: 20
        },
        {
            id: 'exam-2',
            examTitle: '1. Dönem 2. Yazılı',
            subject: 'Türkçe',
            date: '2026-01-05',
            score: 75,
            maxScore: 100,
            percentage: 75,
            classAverage: 72.1,
            classRank: 10,
            totalStudents: 28,
            status: 'passed',
            correctAnswers: 15,
            wrongAnswers: 4,
            emptyAnswers: 1,
            totalQuestions: 20
        },
        {
            id: 'exam-3',
            examTitle: '1. Dönem 2. Yazılı',
            subject: 'Fen Bilimleri',
            date: '2026-01-03',
            score: 68,
            maxScore: 100,
            percentage: 68,
            classAverage: 65.8,
            classRank: 12,
            totalStudents: 28,
            status: 'passed',
            correctAnswers: 17,
            wrongAnswers: 6,
            emptyAnswers: 2,
            totalQuestions: 25
        }
    ];

    const subjectPerformances: SubjectPerformance[] = [
        {
            subject: 'Matematik',
            examCount: 4,
            average: 79.5,
            trend: 'up',
            strongTopics: ['Doğal Sayılar', 'Kesirler'],
            weakTopics: ['Ondalık Kesirler'],
            lastScore: 82
        },
        {
            subject: 'Türkçe',
            examCount: 4,
            average: 76.2,
            trend: 'stable',
            strongTopics: ['Okuma Anlama', 'Dil Bilgisi'],
            weakTopics: ['Paragraf Analizi'],
            lastScore: 75
        },
        {
            subject: 'Fen Bilimleri',
            examCount: 3,
            average: 71.8,
            trend: 'up',
            strongTopics: ['Canlılar', 'Madde ve Değişim'],
            weakTopics: ['Kuvvet ve Hareket'],
            lastScore: 68
        },
        {
            subject: 'Sosyal Bilgiler',
            examCount: 3,
            average: 82.3,
            trend: 'up',
            strongTopics: ['Tarih', 'Coğrafya'],
            weakTopics: [],
            lastScore: 85
        },
        {
            subject: 'İngilizce',
            examCount: 4,
            average: 74.8,
            trend: 'down',
            strongTopics: ['Kelime Bilgisi'],
            weakTopics: ['Gramer', 'Yazma'],
            lastScore: 70
        }
    ];

    const outcomes: OutcomeAnalysis[] = [
        {
            code: 'M.6.1.2.3',
            description: 'Doğal sayılarla dört işlem yapar',
            successRate: 92,
            status: 'strong'
        },
        {
            code: 'M.6.1.5.2',
            description: 'Kesirleri karşılaştırır ve sıralar',
            successRate: 85,
            status: 'strong'
        },
        {
            code: 'M.6.1.6.4',
            description: 'Ondalık kesirlerde toplama çıkarma yapar',
            successRate: 58,
            status: 'weak',
            recommendation: 'Günlük 15 dakika ondalık kesir çalışması yapılması önerilir'
        },
        {
            code: 'T.6.3.5.1',
            description: 'Paragrafın konusunu belirler',
            successRate: 65,
            status: 'average',
            recommendation: 'Hikaye kitabı okuma sayısı artırılabilir'
        }
    ];

    const recommendations: ParentRecommendation[] = [
        {
            id: 'rec-1',
            type: 'study_tip',
            title: 'Ondalık Kesirler için Günlük Pratik',
            description: 'Elif\'in ondalık kesirler konusunda zorlandığı tespit edildi. Günlük 15 dakika market alışverişi hesaplama oyunu oynamanızı öneriyoruz.',
            priority: 'high',
            subject: 'Matematik'
        },
        {
            id: 'rec-2',
            type: 'activity',
            title: 'Birlikte Kitap Okuma',
            description: 'Paragraf anlama becerisini geliştirmek için haftada 2-3 kez birlikte kitap okuma seansları düzenleyin.',
            priority: 'medium',
            subject: 'Türkçe'
        },
        {
            id: 'rec-3',
            type: 'resource',
            title: 'İngilizce Gramer Videoları',
            description: 'İngilizce gramer konularını pekiştirmek için eğlenceli video içerikler izletilebilir.',
            priority: 'medium',
            subject: 'İngilizce'
        },
        {
            id: 'rec-4',
            type: 'meeting',
            title: 'Öğretmen Görüşmesi Önerisi',
            description: 'Matematik öğretmeninizle bir görüşme planlamanızı öneriyoruz.',
            priority: 'low',
            subject: 'Matematik'
        }
    ];

    const notifications: ParentNotification[] = [
        {
            id: 'notif-1',
            type: 'exam_result',
            title: 'Matematik Sınavı Sonucu',
            message: 'Elif\'in Matematik 1. Dönem 2. Yazılı sonucu açıklandı: 82 puan',
            isRead: false,
            createdAt: '2026-01-08T15:30:00Z'
        },
        {
            id: 'notif-2',
            type: 'report_ready',
            title: 'Dönem Raporu Hazır',
            message: 'Elif\'in 1. dönem karne raporu görüntülemeye hazır.',
            isRead: false,
            createdAt: '2026-01-07T10:00:00Z'
        },
        {
            id: 'notif-3',
            type: 'announcement',
            title: 'Veli Toplantısı',
            message: '15 Ocak Çarşamba günü saat 18:00\'de veli toplantısı yapılacaktır.',
            isRead: true,
            createdAt: '2026-01-05T09:00:00Z'
        }
    ];

    return {
        children,
        selectedChildId: 'child-1',
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
