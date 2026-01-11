// =====================================================
// MODÜL: YÖNETİCİ DASHBOARD - TYPE TANIMLARI
// =====================================================

/**
 * Yönetici dashboard için özet KPI'lar
 */
export interface AdminKPIs {
    // Genel metrikler
    totalStudents: number;
    totalTeachers: number;
    totalExams: number;
    totalClasses: number;

    // Performans metrikleri
    schoolAverage: number;
    previousAverage: number;
    averageTrend: 'up' | 'down' | 'stable';

    // Başarı oranları
    passRate: number;
    highAchievers: number; // %80 üstü
    lowPerformers: number; // %50 altı

    // Risk metrikleri
    criticalRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
}

/**
 * Sınıf performans özeti
 */
export interface ClassPerformance {
    className: string;
    teacherName: string;
    subject: string;
    examCount: number;
    studentCount: number;
    average: number;
    previousAverage: number;
    trend: 'up' | 'down' | 'stable';
    passRate: number;
    lastExamDate?: string;
}

/**
 * Trend veri noktası
 */
export interface TrendPoint {
    date: string;
    label: string;
    value: number;
    target?: number;
}

/**
 * Risk altındaki öğrenci özeti
 */
export interface RiskStudent {
    id: string;
    name: string;
    className: string;
    subject: string;
    riskLevel: 'critical' | 'high' | 'medium';
    lastScore: number;
    trend: 'up' | 'down' | 'stable';
    examCount: number;
    lastExamDate: string;
}

/**
 * Kazanım kapsama analizi
 */
export interface OutcomeCoverage {
    totalOutcomes: number;
    coveredOutcomes: number;
    coverage: number; // yüzde
    weakOutcomes: { code: string; description: string; coverage: number }[];
}

/**
 * Öğretmen performans özeti
 */
export interface TeacherPerformance {
    teacherId: string;
    teacherName: string;
    classCount: number;
    studentCount: number;
    examCount: number;
    averageSuccess: number;
    passRate: number;
    trend: 'up' | 'down' | 'stable';
}

/**
 * Dashboard veri yapısı
 */
export interface AdminDashboardData {
    kpis: AdminKPIs;
    classPerformances: ClassPerformance[];
    trendData: TrendPoint[];
    riskStudents: RiskStudent[];
    outcomeCoverage: OutcomeCoverage;
    teacherPerformances: TeacherPerformance[];
    lastUpdated: string;
}

/**
 * Dashboard filtre seçenekleri
 */
export interface DashboardFilters {
    dateRange: 'week' | 'month' | 'quarter' | 'semester' | 'year';
    subject?: string;
    grade?: string;
    teacher?: string;
}

/**
 * Dashboard widget türleri
 */
export type DashboardWidgetType =
    | 'kpi_cards'
    | 'class_performance_chart'
    | 'trend_chart'
    | 'risk_table'
    | 'outcome_ring'
    | 'teacher_heatmap'
    | 'quick_stats';
