// =====================================================
// MODÜL: YÖNETİCİ DASHBOARD - VERİ SERVİSİ
// =====================================================

import {
    AdminDashboardData,
    AdminKPIs,
    ClassPerformance,
    TrendPoint,
    RiskStudent,
    OutcomeCoverage,
    TeacherPerformance,
    DashboardFilters
} from './types';

/**
 * Demo veri oluşturucu - Gerçek veri yokken önizleme için
 */
export function generateDemoData(): AdminDashboardData {
    const now = new Date();

    const kpis: AdminKPIs = {
        totalStudents: 1247,
        totalTeachers: 52,
        totalExams: 186,
        totalClasses: 48,
        schoolAverage: 72.5,
        previousAverage: 69.8,
        averageTrend: 'up',
        passRate: 84,
        highAchievers: 312,
        lowPerformers: 89,
        criticalRiskCount: 12,
        highRiskCount: 34,
        mediumRiskCount: 78
    };

    const classPerformances: ClassPerformance[] = [
        { className: '5-A', teacherName: 'Mehmet Öğretmen', subject: 'Matematik', examCount: 4, studentCount: 28, average: 78.5, previousAverage: 72.3, trend: 'up', passRate: 89, lastExamDate: '2026-01-08' },
        { className: '5-B', teacherName: 'Ayşe Öğretmen', subject: 'Matematik', examCount: 4, studentCount: 30, average: 72.1, previousAverage: 74.5, trend: 'down', passRate: 83, lastExamDate: '2026-01-08' },
        { className: '6-A', teacherName: 'Ali Öğretmen', subject: 'Fen Bilimleri', examCount: 3, studentCount: 26, average: 81.2, previousAverage: 79.8, trend: 'up', passRate: 92, lastExamDate: '2026-01-05' },
        { className: '6-B', teacherName: 'Zeynep Öğretmen', subject: 'Fen Bilimleri', examCount: 3, studentCount: 27, average: 68.4, previousAverage: 65.2, trend: 'up', passRate: 78, lastExamDate: '2026-01-05' },
        { className: '7-A', teacherName: 'Mustafa Öğretmen', subject: 'Türkçe', examCount: 5, studentCount: 29, average: 74.8, previousAverage: 74.1, trend: 'stable', passRate: 86, lastExamDate: '2026-01-10' },
        { className: '7-B', teacherName: 'Fatma Öğretmen', subject: 'Türkçe', examCount: 5, studentCount: 31, average: 65.3, previousAverage: 68.9, trend: 'down', passRate: 74, lastExamDate: '2026-01-10' },
        { className: '8-A', teacherName: 'Hasan Öğretmen', subject: 'İngilizce', examCount: 4, studentCount: 25, average: 82.7, previousAverage: 80.2, trend: 'up', passRate: 96, lastExamDate: '2026-01-07' },
        { className: '8-B', teacherName: 'Elif Öğretmen', subject: 'İngilizce', examCount: 4, studentCount: 28, average: 71.9, previousAverage: 73.4, trend: 'down', passRate: 82, lastExamDate: '2026-01-07' },
    ];

    const trendData: TrendPoint[] = [
        { date: '2025-09', label: 'Eylül', value: 68.2, target: 70 },
        { date: '2025-10', label: 'Ekim', value: 69.5, target: 70 },
        { date: '2025-11', label: 'Kasım', value: 71.3, target: 70 },
        { date: '2025-12', label: 'Aralık', value: 70.8, target: 72 },
        { date: '2026-01', label: 'Ocak', value: 72.5, target: 72 },
    ];

    const riskStudents: RiskStudent[] = [
        { id: '1', name: 'Ali Yıldız', className: '5-A', subject: 'Matematik', riskLevel: 'critical', lastScore: 28, trend: 'down', examCount: 4, lastExamDate: '2026-01-08' },
        { id: '2', name: 'Ayşe Demir', className: '6-B', subject: 'Fen Bilimleri', riskLevel: 'critical', lastScore: 32, trend: 'stable', examCount: 3, lastExamDate: '2026-01-05' },
        { id: '3', name: 'Mehmet Kaya', className: '7-B', subject: 'Türkçe', riskLevel: 'high', lastScore: 38, trend: 'down', examCount: 5, lastExamDate: '2026-01-10' },
        { id: '4', name: 'Zeynep Ak', className: '5-B', subject: 'Matematik', riskLevel: 'high', lastScore: 42, trend: 'up', examCount: 4, lastExamDate: '2026-01-08' },
        { id: '5', name: 'Can Yılmaz', className: '8-B', subject: 'İngilizce', riskLevel: 'high', lastScore: 45, trend: 'stable', examCount: 4, lastExamDate: '2026-01-07' },
        { id: '6', name: 'Elif Şahin', className: '6-A', subject: 'Fen Bilimleri', riskLevel: 'medium', lastScore: 48, trend: 'up', examCount: 3, lastExamDate: '2026-01-05' },
    ];

    const outcomeCoverage: OutcomeCoverage = {
        totalOutcomes: 156,
        coveredOutcomes: 134,
        coverage: 85.9,
        weakOutcomes: [
            { code: 'M.5.1.2.5', description: 'Kesirlerle işlemler', coverage: 45 },
            { code: 'F.6.2.1.3', description: 'Kuvvet ve hareket', coverage: 52 },
            { code: 'T.7.3.5.1', description: 'Paragraf analizi', coverage: 58 },
            { code: 'M.8.2.3.4', description: 'Cebirsel ifadeler', coverage: 61 },
        ]
    };

    const teacherPerformances: TeacherPerformance[] = [
        { teacherId: '1', teacherName: 'Hasan Öğretmen', classCount: 2, studentCount: 53, examCount: 8, averageSuccess: 77.3, passRate: 89, trend: 'up' },
        { teacherId: '2', teacherName: 'Ali Öğretmen', classCount: 2, studentCount: 53, examCount: 6, averageSuccess: 74.8, passRate: 85, trend: 'up' },
        { teacherId: '3', teacherName: 'Mehmet Öğretmen', classCount: 2, studentCount: 58, examCount: 8, averageSuccess: 75.3, passRate: 86, trend: 'stable' },
        { teacherId: '4', teacherName: 'Mustafa Öğretmen', classCount: 2, studentCount: 60, examCount: 10, averageSuccess: 70.1, passRate: 80, trend: 'stable' },
        { teacherId: '5', teacherName: 'Ayşe Öğretmen', classCount: 2, studentCount: 58, examCount: 8, averageSuccess: 68.5, passRate: 76, trend: 'down' },
        { teacherId: '6', teacherName: 'Fatma Öğretmen', classCount: 2, studentCount: 60, examCount: 10, averageSuccess: 67.8, passRate: 74, trend: 'down' },
    ];

    return {
        kpis,
        classPerformances,
        trendData,
        riskStudents,
        outcomeCoverage,
        teacherPerformances,
        lastUpdated: now.toISOString()
    };
}

/**
 * Sınıf ortalamalarına göre sıralama
 */
export function sortClassesByPerformance(classes: ClassPerformance[], order: 'asc' | 'desc' = 'desc'): ClassPerformance[] {
    return [...classes].sort((a, b) => order === 'desc' ? b.average - a.average : a.average - b.average);
}

/**
 * Trend hesaplama
 */
export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const diff = current - previous;
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
}

/**
 * Risk seviyesi renkleri
 */
export function getRiskColor(riskLevel: 'critical' | 'high' | 'medium'): string {
    switch (riskLevel) {
        case 'critical': return '#DC2626'; // Kırmızı
        case 'high': return '#F59E0B'; // Turuncu
        case 'medium': return '#EAB308'; // Sarı
        default: return '#6B7280'; // Gri
    }
}

/**
 * Trend ikonu
 */
export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
        case 'up': return '↑';
        case 'down': return '↓';
        case 'stable': return '→';
    }
}

/**
 * Yüzde değişim hesaplama
 */
export function calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

/**
 * Dashboard verilerini filtrele
 */
export function filterDashboardData(
    data: AdminDashboardData,
    filters: DashboardFilters
): AdminDashboardData {
    let filteredClasses = [...data.classPerformances];

    if (filters.subject) {
        filteredClasses = filteredClasses.filter(c => c.subject === filters.subject);
    }

    if (filters.grade) {
        filteredClasses = filteredClasses.filter(c => c.className.startsWith(filters.grade!));
    }

    if (filters.teacher) {
        filteredClasses = filteredClasses.filter(c => c.teacherName === filters.teacher);
    }

    // KPI'ları yeniden hesapla (basitleştirilmiş)
    const recalculatedKPIs: AdminKPIs = {
        ...data.kpis,
        totalClasses: filteredClasses.length,
        schoolAverage: filteredClasses.length > 0
            ? filteredClasses.reduce((sum, c) => sum + c.average, 0) / filteredClasses.length
            : 0
    };

    return {
        ...data,
        kpis: recalculatedKPIs,
        classPerformances: filteredClasses
    };
}
