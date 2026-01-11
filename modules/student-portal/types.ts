// =====================================================
// MODÜL: ÖĞRENCİ PORTALI - TYPE TANIMLARI
// =====================================================

/**
 * Rozet tipi
 */
export interface Badge {
    id: string;
    type: 'star_student' | 'rising_star' | 'goal_achiever' | 'hard_worker' | 'champion' | 'streak' | 'perfect_score';
    name: string;
    description: string;
    icon: string;
    points: number;
    earnedAt?: string;
    isEarned: boolean;
    progress?: number; // 0-100
}

/**
 * Hedef
 */
export interface StudentGoal {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    deadline?: string;
    status: 'active' | 'completed' | 'failed';
    createdAt: string;
}

/**
 * Çalışma planı öğesi
 */
export interface StudyPlanItem {
    id: string;
    subject: string;
    topic: string;
    description: string;
    duration: number; // dakika
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
    scheduledFor?: string;
}

/**
 * Güçlü/Zayıf yön
 */
export interface StrengthWeakness {
    subject: string;
    topic: string;
    type: 'strength' | 'weakness';
    score: number;
    examCount: number;
    trend: 'improving' | 'declining' | 'stable';
    recommendation?: string;
}

/**
 * Günlük aktivite
 */
export interface DailyActivity {
    date: string;
    studyMinutes: number;
    completedTasks: number;
    earnedPoints: number;
}

/**
 * Liderlik tablosu girişi
 */
export interface LeaderboardEntry {
    rank: number;
    studentId: string;
    name: string;
    avatar?: string;
    points: number;
    isCurrentUser: boolean;
}

/**
 * Öğrenci dashboard verisi
 */
export interface StudentDashboardData {
    // Profil
    student: {
        id: string;
        name: string;
        className: string;
        grade: string;
        avatar_url?: string;
        totalPoints: number;
        level: number;
        levelProgress: number;
    };

    // İstatistikler
    stats: {
        overallAverage: number;
        examCount: number;
        studyStreak: number;
        weeklyStudyMinutes: number;
        rank: number;
        totalStudents: number;
    };

    // Gamification
    badges: Badge[];
    earnedBadgesCount: number;
    totalBadgesCount: number;

    // Hedefler
    goals: StudentGoal[];

    // Çalışma planı
    studyPlan: StudyPlanItem[];

    // Analiz
    strengths: StrengthWeakness[];
    weaknesses: StrengthWeakness[];

    // Aktivite
    weeklyActivity: DailyActivity[];

    // Liderlik
    leaderboard: LeaderboardEntry[];
}
