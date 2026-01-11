// =====================================================
// MODÜL: VELİ PORTALI - TYPE TANIMLARI
// =====================================================

/**
 * Veli-Öğrenci ilişkisi
 */
export interface StudentGuardian {
    id: string;
    studentId: string;
    guardianUserId: string;
    relationship: 'Anne' | 'Baba' | 'Veli' | 'Vasi' | 'Diğer';
    isPrimary: boolean;
    canViewScores: boolean;
    canMessageTeacher: boolean;
    createdAt: string;
}

/**
 * Öğrenci özet bilgisi (veli görünümü)
 */
export interface StudentSummary {
    id: string;
    name: string;
    className: string;
    grade: string;
    avatar_url?: string;
    schoolName: string;

    // Performans özeti
    overallAverage: number;
    previousAverage: number;
    trend: 'up' | 'down' | 'stable';
    classRank?: number;
    totalStudentsInClass?: number;

    // Son aktivite
    lastExamDate?: string;
    lastExamScore?: number;
    lastExamSubject?: string;
}

/**
 * Sınav sonucu (veli görünümü)
 */
export interface ExamResult {
    id: string;
    examTitle: string;
    subject: string;
    date: string;
    score: number;
    maxScore: number;
    percentage: number;
    classAverage: number;
    classRank?: number;
    totalStudents?: number;
    status: 'passed' | 'failed' | 'borderline';

    // Detaylar
    correctAnswers?: number;
    wrongAnswers?: number;
    emptyAnswers?: number;
    totalQuestions?: number;
}

/**
 * Konu bazlı performans
 */
export interface SubjectPerformance {
    subject: string;
    examCount: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    strongTopics: string[];
    weakTopics: string[];
    lastScore: number;
}

/**
 * Kazanım analizi (veli görünümü)
 */
export interface OutcomeAnalysis {
    code: string;
    description: string;
    successRate: number;
    status: 'strong' | 'average' | 'weak';
    recommendation?: string;
}

/**
 * AI Önerisi (veli için)
 */
export interface ParentRecommendation {
    id: string;
    type: 'study_tip' | 'activity' | 'resource' | 'meeting';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    subject?: string;
    link?: string;
}

/**
 * Bildirim
 */
export interface ParentNotification {
    id: string;
    type: 'exam_result' | 'report_ready' | 'teacher_message' | 'alert' | 'announcement';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, unknown>;
}

/**
 * Veli dashboard verisi
 */
export interface ParentDashboardData {
    children: StudentSummary[];
    selectedChildId: string;
    recentExams: ExamResult[];
    subjectPerformances: SubjectPerformance[];
    outcomes: OutcomeAnalysis[];
    recommendations: ParentRecommendation[];
    notifications: ParentNotification[];
    unreadCount: number;
}

/**
 * Öğretmen mesajı
 */
export interface TeacherMessage {
    id: string;
    teacherId: string;
    teacherName: string;
    subject: string;
    message: string;
    sentAt: string;
    isRead: boolean;
}
