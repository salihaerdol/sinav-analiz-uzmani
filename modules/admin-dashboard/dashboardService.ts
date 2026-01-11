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
import { SavedAnalysis } from '../../types';

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

type StudentScoreSnapshot = {
    name: string;
    total: number;
    percentage: number;
};

type AnalysisSnapshot = {
    analysis: SavedAnalysis;
    date: Date | null;
    className: string;
    subject: string;
    teacherName: string;
    grade: string;
    classAverage: number;
    studentScores: StudentScoreSnapshot[];
    passRate: number;
};

const DATE_RANGE_DAYS: Record<DashboardFilters['dateRange'], number> = {
    week: 7,
    month: 30,
    quarter: 90,
    semester: 180,
    year: 365
};

const normalizeText = (value?: string | null, fallback = 'Belirtilmemiş') => {
    const text = value?.trim();
    return text ? text : fallback;
};

const parseAnalysisDate = (analysis: SavedAnalysis): Date | null => {
    const raw = analysis.metadata?.date || analysis.createdAt;
    if (!raw) return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

const computeStudentScores = (analysis: SavedAnalysis): StudentScoreSnapshot[] => {
    const questions = analysis.questions || [];
    const students = analysis.students || [];
    const totalMaxScore = questions.reduce((sum, question) => sum + (Number(question.maxScore) || 0), 0);

    return students.map((student) => {
        const total = Object.values(student.scores || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const percentage = totalMaxScore > 0 ? (total / totalMaxScore) * 100 : 0;
        return { name: student.name, total, percentage };
    });
};

const computeClassAverage = (analysis: SavedAnalysis, studentScores: StudentScoreSnapshot[]) => {
    const fromAnalysis = Number(analysis.analysis?.classAverage);
    if (Number.isFinite(fromAnalysis)) return fromAnalysis;
    if (studentScores.length === 0) return 0;
    const total = studentScores.reduce((sum, student) => sum + student.percentage, 0);
    return total / studentScores.length;
};

const buildSnapshot = (analysis: SavedAnalysis): AnalysisSnapshot => {
    const studentScores = computeStudentScores(analysis);
    const passCount = studentScores.filter((student) => student.percentage >= 50).length;
    const passRate = studentScores.length > 0 ? Math.round((passCount / studentScores.length) * 100) : 0;
    return {
        analysis,
        date: parseAnalysisDate(analysis),
        className: normalizeText(analysis.metadata?.className, 'Sınıf'),
        subject: normalizeText(analysis.metadata?.subject, 'Ders'),
        teacherName: normalizeText(analysis.metadata?.teacherName, 'Belirtilmemiş'),
        grade: normalizeText(analysis.metadata?.grade, '0'),
        classAverage: computeClassAverage(analysis, studentScores),
        studentScores,
        passRate
    };
};

const filterSnapshotsByDate = (snapshots: AnalysisSnapshot[], range: DashboardFilters['dateRange']) => {
    const days = DATE_RANGE_DAYS[range];
    const now = new Date();
    const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - days * 24 * 60 * 60 * 1000);

    const current: AnalysisSnapshot[] = [];
    const previous: AnalysisSnapshot[] = [];

    snapshots.forEach((snapshot) => {
        if (!snapshot.date) {
            current.push(snapshot);
            return;
        }
        if (snapshot.date >= currentStart) {
            current.push(snapshot);
            return;
        }
        if (snapshot.date >= previousStart) {
            previous.push(snapshot);
        }
    });

    return { current, previous, now };
};

const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const formatDate = (date?: Date | null) => (date ? date.toISOString().split('T')[0] : '');

export function createEmptyAdminDashboardData(): AdminDashboardData {
    return {
        kpis: {
            totalStudents: 0,
            totalTeachers: 0,
            totalExams: 0,
            totalClasses: 0,
            schoolAverage: 0,
            previousAverage: 0,
            averageTrend: 'stable',
            passRate: 0,
            highAchievers: 0,
            lowPerformers: 0,
            criticalRiskCount: 0,
            highRiskCount: 0,
            mediumRiskCount: 0
        },
        classPerformances: [],
        trendData: [],
        riskStudents: [],
        outcomeCoverage: {
            totalOutcomes: 0,
            coveredOutcomes: 0,
            coverage: 0,
            weakOutcomes: []
        },
        teacherPerformances: [],
        lastUpdated: new Date().toISOString()
    };
}

export function buildAdminDashboardData(
    analyses: SavedAnalysis[],
    filters: DashboardFilters
): AdminDashboardData {
    if (!analyses.length) {
        return createEmptyAdminDashboardData();
    }

    const snapshots = analyses
        .filter((analysis) => {
            if (filters.subject && analysis.metadata?.subject !== filters.subject) return false;
            if (filters.grade && analysis.metadata?.grade !== filters.grade) return false;
            if (filters.teacher && analysis.metadata?.teacherName !== filters.teacher) return false;
            return true;
        })
        .map((analysis) => buildSnapshot(analysis));

    if (!snapshots.length) {
        return createEmptyAdminDashboardData();
    }

    const { current, previous, now } = filterSnapshotsByDate(snapshots, filters.dateRange);
    const currentSnapshots = current.length ? current : snapshots;
    const previousSnapshots = previous.length ? previous : [];

    const classKeys = new Set(currentSnapshots.map((snapshot) => `${snapshot.className}::${snapshot.subject}`));
    const teacherKeys = new Set(currentSnapshots.map((snapshot) => snapshot.teacherName).filter((name) => name !== 'Belirtilmemiş'));

    const uniqueStudents = new Set<string>();
    const allStudentScores: StudentScoreSnapshot[] = [];

    currentSnapshots.forEach((snapshot) => {
        snapshot.studentScores.forEach((student) => {
            uniqueStudents.add(`${snapshot.className}::${student.name}`);
            allStudentScores.push(student);
        });
    });

    const studentCountForAverage = allStudentScores.length || 1;
    const weightedAverage = currentSnapshots.reduce((sum, snapshot) => {
        return sum + snapshot.classAverage * (snapshot.studentScores.length || 1);
    }, 0);
    const schoolAverage = weightedAverage / studentCountForAverage;

    const previousAverage = previousSnapshots.length
        ? previousSnapshots.reduce((sum, snapshot) => sum + snapshot.classAverage, 0) / previousSnapshots.length
        : schoolAverage;

    const passCount = allStudentScores.filter((student) => student.percentage >= 50).length;
    const passRate = allStudentScores.length > 0 ? Math.round((passCount / allStudentScores.length) * 100) : 0;
    const highAchievers = allStudentScores.filter((student) => student.percentage >= 80).length;
    const lowPerformers = allStudentScores.filter((student) => student.percentage < 50).length;

    const criticalRiskCount = allStudentScores.filter((student) => student.percentage < 45).length;
    const highRiskCount = allStudentScores.filter((student) => student.percentage >= 45 && student.percentage < 60).length;
    const mediumRiskCount = allStudentScores.filter((student) => student.percentage >= 60 && student.percentage < 75).length;

    const kpis: AdminKPIs = {
        totalStudents: uniqueStudents.size,
        totalTeachers: teacherKeys.size || (currentSnapshots.length ? 1 : 0),
        totalExams: currentSnapshots.length,
        totalClasses: classKeys.size,
        schoolAverage: Number.isFinite(schoolAverage) ? Number(schoolAverage.toFixed(1)) : 0,
        previousAverage: Number.isFinite(previousAverage) ? Number(previousAverage.toFixed(1)) : 0,
        averageTrend: calculateTrend(schoolAverage, previousAverage),
        passRate,
        highAchievers,
        lowPerformers,
        criticalRiskCount,
        highRiskCount,
        mediumRiskCount
    };

    const classMap = new Map<string, {
        className: string;
        subject: string;
        teacherName: string;
        grade: string;
        examCount: number;
        studentCount: number;
        history: { date: Date | null; average: number; passRate: number }[];
    }>();

    currentSnapshots.forEach((snapshot) => {
        const key = `${snapshot.className}::${snapshot.subject}`;
        const entry = classMap.get(key) || {
            className: snapshot.className,
            subject: snapshot.subject,
            teacherName: snapshot.teacherName,
            grade: snapshot.grade,
            examCount: 0,
            studentCount: 0,
            history: []
        };

        entry.examCount += 1;
        entry.studentCount = Math.max(entry.studentCount, snapshot.studentScores.length);
        entry.teacherName = snapshot.teacherName || entry.teacherName;
        entry.history.push({ date: snapshot.date, average: snapshot.classAverage, passRate: snapshot.passRate });

        classMap.set(key, entry);
    });

    const classPerformances: ClassPerformance[] = Array.from(classMap.values()).map((entry) => {
        const sorted = [...entry.history].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
        const last = sorted[sorted.length - 1] || { average: 0, passRate: 0, date: null };
        const previous = sorted.length > 1 ? sorted[sorted.length - 2] : last;
        return {
            className: entry.className,
            teacherName: entry.teacherName,
            subject: entry.subject,
            examCount: entry.examCount,
            studentCount: entry.studentCount,
            average: Number.isFinite(last.average) ? Number(last.average.toFixed(1)) : 0,
            previousAverage: Number.isFinite(previous.average) ? Number(previous.average.toFixed(1)) : 0,
            trend: calculateTrend(last.average, previous.average),
            passRate: last.passRate,
            lastExamDate: formatDate(last.date)
        };
    });

    const studentRiskMap = new Map<string, {
        name: string;
        className: string;
        subject: string;
        history: { date: Date | null; percentage: number }[];
    }>();

    currentSnapshots.forEach((snapshot) => {
        snapshot.studentScores.forEach((student) => {
            const key = `${snapshot.className}::${snapshot.subject}::${student.name}`;
            const entry = studentRiskMap.get(key) || {
                name: student.name,
                className: snapshot.className,
                subject: snapshot.subject,
                history: []
            };
            entry.history.push({ date: snapshot.date, percentage: student.percentage });
            studentRiskMap.set(key, entry);
        });
    });

    const riskStudents: RiskStudent[] = Array.from(studentRiskMap.entries()).map(([id, entry]) => {
        const sorted = [...entry.history].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
        const last = sorted[sorted.length - 1];
        const previous = sorted.length > 1 ? sorted[sorted.length - 2] : last;
        const lastScore = Number.isFinite(last?.percentage) ? Math.round(last.percentage) : 0;
        let riskLevel: RiskStudent['riskLevel'] = 'medium';
        if (lastScore < 45) riskLevel = 'critical';
        else if (lastScore < 60) riskLevel = 'high';
        else if (lastScore < 75) riskLevel = 'medium';

        let trend: RiskStudent['trend'] = 'stable';
        if (previous && last) {
            const diff = last.percentage - previous.percentage;
            if (diff > 2) trend = 'up';
            else if (diff < -2) trend = 'down';
        }

        return {
            id,
            name: entry.name,
            className: entry.className,
            subject: entry.subject,
            riskLevel,
            lastScore,
            trend,
            examCount: entry.history.length,
            lastExamDate: formatDate(last?.date)
        };
    }).filter((student) => student.lastScore < 75)
        .sort((a, b) => a.lastScore - b.lastScore);

    const outcomeMap = new Map<string, { code: string; description: string; totalRate: number; count: number }>();
    currentSnapshots.forEach((snapshot) => {
        const outcomes = snapshot.analysis.analysis?.outcomeStats || [];
        outcomes.forEach((outcome) => {
            if (!outcome.code) return;
            const entry = outcomeMap.get(outcome.code) || {
                code: outcome.code,
                description: outcome.description,
                totalRate: 0,
                count: 0
            };
            entry.totalRate += Number(outcome.successRate) || 0;
            entry.count += 1;
            if (!entry.description && outcome.description) {
                entry.description = outcome.description;
            }
            outcomeMap.set(outcome.code, entry);
        });
    });

    const outcomeList = Array.from(outcomeMap.values()).map((entry) => ({
        code: entry.code,
        description: entry.description || entry.code,
        average: entry.count ? entry.totalRate / entry.count : 0
    }));

    const totalOutcomes = outcomeList.length;
    const coveredOutcomes = outcomeList.filter((outcome) => outcome.average >= 50).length;
    const coverage = totalOutcomes ? (coveredOutcomes / totalOutcomes) * 100 : 0;
    const weakOutcomes = [...outcomeList]
        .sort((a, b) => a.average - b.average)
        .slice(0, 4)
        .map((outcome) => ({
            code: outcome.code,
            description: outcome.description,
            coverage: Math.round(outcome.average)
        }));

    const outcomeCoverage: OutcomeCoverage = {
        totalOutcomes,
        coveredOutcomes,
        coverage: Number.isFinite(coverage) ? Number(coverage.toFixed(1)) : 0,
        weakOutcomes
    };

    const teacherMap = new Map<string, {
        teacherName: string;
        classSet: Set<string>;
        studentSet: Set<string>;
        history: { date: Date | null; average: number; passRate: number }[];
    }>();

    currentSnapshots.forEach((snapshot) => {
        const key = snapshot.teacherName;
        const entry = teacherMap.get(key) || {
            teacherName: snapshot.teacherName,
            classSet: new Set<string>(),
            studentSet: new Set<string>(),
            history: []
        };
        entry.classSet.add(`${snapshot.className}::${snapshot.subject}`);
        snapshot.studentScores.forEach((student) => {
            entry.studentSet.add(`${snapshot.className}::${student.name}`);
        });
        entry.history.push({ date: snapshot.date, average: snapshot.classAverage, passRate: snapshot.passRate });
        teacherMap.set(key, entry);
    });

    const teacherPerformances: TeacherPerformance[] = Array.from(teacherMap.values()).map((entry) => {
        const sorted = [...entry.history].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));
        const last = sorted[sorted.length - 1] || { average: 0, passRate: 0, date: null };
        const previous = sorted.length > 1 ? sorted[sorted.length - 2] : last;
        const averageSuccess = sorted.length
            ? sorted.reduce((sum, record) => sum + record.average, 0) / sorted.length
            : 0;
        const averagePassRate = sorted.length
            ? sorted.reduce((sum, record) => sum + record.passRate, 0) / sorted.length
            : 0;
        return {
            teacherId: entry.teacherName.toLowerCase().replace(/\s+/g, '-'),
            teacherName: entry.teacherName,
            classCount: entry.classSet.size,
            studentCount: entry.studentSet.size,
            examCount: entry.history.length,
            averageSuccess: Number.isFinite(averageSuccess) ? Number(averageSuccess.toFixed(1)) : 0,
            passRate: Number.isFinite(averagePassRate) ? Math.round(averagePassRate) : 0,
            trend: calculateTrend(last.average, previous.average)
        };
    });

    const monthBuckets = new Map<string, { label: string; total: number; count: number }>();
    const trendWindow = Array.from({ length: 5 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (4 - index), 1);
        const key = toDateKey(date);
        monthBuckets.set(key, {
            label: date.toLocaleString('tr-TR', { month: 'short' }),
            total: 0,
            count: 0
        });
        return { key, date };
    });

    currentSnapshots.forEach((snapshot) => {
        if (!snapshot.date) return;
        const key = toDateKey(snapshot.date);
        const bucket = monthBuckets.get(key);
        if (!bucket) return;
        bucket.total += snapshot.classAverage;
        bucket.count += 1;
    });

    const targetValue = Math.max(70, Math.round(kpis.schoolAverage || 70));
    const trendData: TrendPoint[] = trendWindow.map(({ key, date }) => {
        const bucket = monthBuckets.get(key);
        const value = bucket && bucket.count > 0 ? bucket.total / bucket.count : 0;
        return {
            date: key,
            label: date.toLocaleString('tr-TR', { month: 'short' }),
            value: Number.isFinite(value) ? Number(value.toFixed(1)) : 0,
            target: targetValue
        };
    });

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
