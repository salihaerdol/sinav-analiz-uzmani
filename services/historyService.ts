/**
 * Analiz Geçmişi Servisi
 * LocalStorage/IndexedDB tabanlı analiz kaydetme, yükleme ve gelişim takip sistemi
 */

import {
    SavedAnalysis,
    StudentProgress,
    ClassProgress,
    DashboardSummary,
    AnalysisResult,
    ExamMetadata,
    QuestionConfig,
    Student
} from '../types';

// Storage Keys
const STORAGE_KEYS = {
    ANALYSES: 'sinav_analiz_gecmisi',
    STUDENT_PROGRESS: 'ogrenci_gelisim',
    CLASS_PROGRESS: 'sinif_gelisim',
    SETTINGS: 'uygulama_ayarlar'
};

// UUID Generator
const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ==================== ANALİZ KAYDETME/YÜKLEME ====================

/**
 * Tüm kaydedilmiş analizleri getir
 */
export const getAllAnalyses = (): SavedAnalysis[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.ANALYSES);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('Analizler yüklenirken hata:', error);
        return [];
    }
};

/**
 * Belirli bir analizi getir
 */
export const getAnalysisById = (id: string): SavedAnalysis | null => {
    const analyses = getAllAnalyses();
    return analyses.find(a => a.id === id) || null;
};

/**
 * Yeni analiz kaydet
 */
export const saveAnalysis = (
    metadata: ExamMetadata,
    analysis: AnalysisResult,
    questions: QuestionConfig[],
    students: Student[],
    notes?: string,
    tags?: string[]
): SavedAnalysis => {
    const now = new Date().toISOString();
    const newAnalysis: SavedAnalysis = {
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        metadata,
        analysis,
        questions,
        students,
        notes,
        tags
    };

    const analyses = getAllAnalyses();
    analyses.unshift(newAnalysis); // En yeniyi başa ekle

    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));

    // Öğrenci ve sınıf gelişimlerini güncelle
    updateStudentProgress(newAnalysis);
    updateClassProgress(newAnalysis);

    return newAnalysis;
};

/**
 * Analizi güncelle
 */
export const updateAnalysis = (
    id: string,
    updates: Partial<SavedAnalysis>
): SavedAnalysis | null => {
    const analyses = getAllAnalyses();
    const index = analyses.findIndex(a => a.id === id);

    if (index === -1) return null;

    analyses[index] = {
        ...analyses[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));

    // İstatistikleri de güncellemek gerekebilir ama karmaşık olacağı için şimdilik atlıyoruz
    // Tam güncelleme için updateStudentProgress ve updateClassProgress tekrar çağrılabilir
    // Ancak eski verileri temizlemek gerekir.

    return analyses[index];
};

/**
 * Analizi sil
 */
export const deleteAnalysis = (id: string): boolean => {
    const analyses = getAllAnalyses();
    const filtered = analyses.filter(a => a.id !== id);

    if (filtered.length === analyses.length) return false;

    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(filtered));
    return true;
};

/**
 * Filtrelenmiş analizleri getir
 */
export const getFilteredAnalyses = (filters: {
    className?: string;
    subject?: string;
    startDate?: string;
    endDate?: string;
    searchText?: string;
}): SavedAnalysis[] => {
    let analyses = getAllAnalyses();

    if (filters.className) {
        analyses = analyses.filter(a => a.metadata.className === filters.className);
    }

    if (filters.subject) {
        analyses = analyses.filter(a => a.metadata.subject === filters.subject);
    }

    if (filters.startDate) {
        analyses = analyses.filter(a => a.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
        analyses = analyses.filter(a => a.createdAt <= filters.endDate!);
    }

    if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        analyses = analyses.filter(a =>
            a.metadata.className.toLowerCase().includes(searchLower) ||
            a.metadata.subject.toLowerCase().includes(searchLower) ||
            a.metadata.schoolName.toLowerCase().includes(searchLower) ||
            a.students.some(s => s.name.toLowerCase().includes(searchLower))
        );
    }

    return analyses;
};

// ==================== ÖĞRENCİ GELİŞİM TAKİBİ ====================

/**
 * Öğrenci gelişim verilerini güncelle
 */
const updateStudentProgress = (analysis: SavedAnalysis): void => {
    const progressMap = getStudentProgressMap();
    const maxScore = analysis.questions.reduce((sum, q) => sum + q.maxScore, 0);

    // Sıralama için öğrenci puanlarını hesapla
    const studentScores = analysis.students.map(s => ({
        id: s.id,
        name: s.name,
        score: Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
    })).sort((a, b) => b.score - a.score);

    analysis.students.forEach((student, idx) => {
        const totalScore = Object.values(student.scores).reduce((a: number, b: number) => a + b, 0);
        const percentage = (totalScore / maxScore) * 100;
        const rank = studentScores.findIndex(s => s.id === student.id) + 1;

        const key = `${student.name}_${analysis.metadata.className}`;

        if (!progressMap[key]) {
            progressMap[key] = {
                studentId: student.id,
                studentName: student.name,
                className: analysis.metadata.className,
                examHistory: [],
                outcomeProgress: [],
                overallTrend: 'stable',
                averagePercentage: 0
            };
        }

        // Sınav geçmişi ekle
        progressMap[key].examHistory.push({
            analysisId: analysis.id,
            date: analysis.metadata.date,
            subject: analysis.metadata.subject,
            examType: analysis.metadata.examType,
            score: totalScore,
            percentage,
            classAverage: analysis.analysis.classAverage,
            rank,
            totalStudents: analysis.students.length
        });

        // Kazanım gelişimi güncelle
        analysis.analysis.questionStats.forEach(qs => {
            const studentScore = student.scores[qs.questionId] || 0;
            const questionConfig = analysis.questions.find(q => q.id === qs.questionId);
            const maxQuestionScore = questionConfig?.maxScore || 1;
            const studentSuccessRate = (studentScore / maxQuestionScore) * 100;

            let outcomeProgress = progressMap[key].outcomeProgress.find(
                op => op.outcomeCode === qs.outcome.code
            );

            if (!outcomeProgress) {
                outcomeProgress = {
                    outcomeCode: qs.outcome.code,
                    outcomeDescription: qs.outcome.description,
                    history: []
                };
                progressMap[key].outcomeProgress.push(outcomeProgress);
            }

            outcomeProgress.history.push({
                date: analysis.metadata.date,
                successRate: studentSuccessRate
            });
        });

        // Ortalama ve trend hesapla
        const percentages = progressMap[key].examHistory.map(e => e.percentage);
        progressMap[key].averagePercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
        progressMap[key].overallTrend = calculateTrend(percentages);
    });

    saveStudentProgressMap(progressMap);
};

/**
 * Öğrenci gelişim haritasını getir
 */
const getStudentProgressMap = (): Record<string, StudentProgress> => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.STUDENT_PROGRESS);
        if (!data) return {};
        return JSON.parse(data);
    } catch {
        return {};
    }
};

/**
 * Öğrenci gelişim haritasını kaydet
 */
const saveStudentProgressMap = (map: Record<string, StudentProgress>): void => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROGRESS, JSON.stringify(map));
};

/**
 * Belirli bir öğrencinin gelişimini getir
 */
export const getStudentProgress = (studentName: string, className?: string): StudentProgress | null => {
    const map = getStudentProgressMap();

    if (className) {
        return map[`${studentName}_${className}`] || null;
    }

    // Sınıf belirtilmemişse tüm eşleşenleri birleştir
    const matches = Object.values(map).filter(p => p.studentName === studentName);
    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0];

    // Birden fazla sınıfta varsa hepsini birleştir
    const combined: StudentProgress = {
        studentId: matches[0].studentId,
        studentName,
        className: matches.map(m => m.className).join(', '),
        examHistory: matches.flatMap(m => m.examHistory).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        outcomeProgress: [],
        overallTrend: 'stable',
        averagePercentage: 0
    };

    // Kazanımları birleştir
    matches.forEach(m => {
        m.outcomeProgress.forEach(op => {
            const existing = combined.outcomeProgress.find(e => e.outcomeCode === op.outcomeCode);
            if (existing) {
                existing.history.push(...op.history);
            } else {
                combined.outcomeProgress.push({ ...op });
            }
        });
    });

    // Ortalama ve trend hesapla
    const percentages = combined.examHistory.map(e => e.percentage);
    combined.averagePercentage = percentages.length > 0
        ? percentages.reduce((a, b) => a + b, 0) / percentages.length
        : 0;
    combined.overallTrend = calculateTrend(percentages);

    return combined;
};

/**
 * Tüm öğrenci gelişimlerini getir
 */
export const getAllStudentProgress = (): StudentProgress[] => {
    return Object.values(getStudentProgressMap());
};

// ==================== SINIF GELİŞİM TAKİBİ ====================

/**
 * Sınıf gelişim verilerini güncelle
 */
const updateClassProgress = (analysis: SavedAnalysis): void => {
    const progressMap = getClassProgressMap();
    const maxScore = analysis.questions.reduce((sum, q) => sum + q.maxScore, 0);

    const studentScores = analysis.students.map(s =>
        Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
    );

    const key = `${analysis.metadata.className}_${analysis.metadata.subject}`;

    if (!progressMap[key]) {
        progressMap[key] = {
            className: analysis.metadata.className,
            subject: analysis.metadata.subject,
            examHistory: [],
            outcomeProgress: [],
            overallTrend: 'stable'
        };
    }

    // Sınav geçmişi ekle
    const passRate = (studentScores.filter(s => (s / maxScore) * 100 >= 50).length / studentScores.length) * 100;

    progressMap[key].examHistory.push({
        analysisId: analysis.id,
        date: analysis.metadata.date,
        examType: analysis.metadata.examType,
        classAverage: analysis.analysis.classAverage,
        highestScore: Math.max(...studentScores),
        lowestScore: Math.min(...studentScores),
        passRate,
        studentCount: analysis.students.length
    });

    // Kazanım gelişimi güncelle
    analysis.analysis.outcomeStats.forEach(os => {
        let outcomeProgress = progressMap[key].outcomeProgress.find(
            op => op.outcomeCode === os.code
        );

        if (!outcomeProgress) {
            outcomeProgress = {
                outcomeCode: os.code,
                outcomeDescription: os.description,
                history: []
            };
            progressMap[key].outcomeProgress.push(outcomeProgress);
        }

        outcomeProgress.history.push({
            date: analysis.metadata.date,
            successRate: os.successRate,
            isFailed: os.isFailed
        });
    });

    // Trend hesapla
    const averages = progressMap[key].examHistory.map(e => e.classAverage);
    progressMap[key].overallTrend = calculateTrend(averages);

    saveClassProgressMap(progressMap);
};

/**
 * Sınıf gelişim haritasını getir
 */
const getClassProgressMap = (): Record<string, ClassProgress> => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CLASS_PROGRESS);
        if (!data) return {};
        return JSON.parse(data);
    } catch {
        return {};
    }
};

/**
 * Sınıf gelişim haritasını kaydet
 */
const saveClassProgressMap = (map: Record<string, ClassProgress>): void => {
    localStorage.setItem(STORAGE_KEYS.CLASS_PROGRESS, JSON.stringify(map));
};

/**
 * Belirli bir sınıfın gelişimini getir
 */
export const getClassProgress = (className: string, subject?: string): ClassProgress | null => {
    const map = getClassProgressMap();

    if (subject) {
        return map[`${className}_${subject}`] || null;
    }

    // Ders belirtilmemişse tüm dersleri birleştir
    const matches = Object.values(map).filter(p => p.className === className);
    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0];

    // Birden fazla ders varsa hepsini birleştir
    const combined: ClassProgress = {
        className,
        subject: matches.map(m => m.subject).join(', '),
        examHistory: matches.flatMap(m => m.examHistory).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        outcomeProgress: [],
        overallTrend: 'stable'
    };

    // Trend hesapla
    const averages = combined.examHistory.map(e => e.classAverage);
    combined.overallTrend = calculateTrend(averages);

    return combined;
};

/**
 * Tüm sınıf gelişimlerini getir
 */
export const getAllClassProgress = (): ClassProgress[] => {
    return Object.values(getClassProgressMap());
};

// ==================== DASHBOARD ÖZETİ ====================

/**
 * Dashboard özet verilerini getir
 */
export const getDashboardSummary = (): DashboardSummary => {
    const analyses = getAllAnalyses();
    const studentProgressList = getAllStudentProgress();
    const classProgressList = getAllClassProgress();

    // Benzersiz öğrenci ve sınıf sayısı
    const uniqueStudents = new Set<string>();
    const uniqueClasses = new Set<string>();

    analyses.forEach(a => {
        uniqueClasses.add(a.metadata.className);
        a.students.forEach(s => uniqueStudents.add(`${s.name}_${a.metadata.className}`));
    });

    // En yüksek performanslı öğrenciler
    const topStudents = studentProgressList
        .filter(s => s.examHistory.length > 0)
        .sort((a, b) => b.averagePercentage - a.averagePercentage)
        .slice(0, 5)
        .map(s => ({
            name: s.studentName,
            className: s.className,
            averageScore: s.averagePercentage,
            trend: (s.overallTrend === 'improving' ? 'up' : s.overallTrend === 'declining' ? 'down' : 'stable') as 'up' | 'down' | 'stable'
        }));

    // Sınıf performansları
    const classPerformance = classProgressList
        .filter(c => c.examHistory.length > 0)
        .map(c => {
            const avgScore = c.examHistory.reduce((sum, e) => sum + e.classAverage, 0) / c.examHistory.length;
            return {
                className: `${c.className} - ${c.subject}`,
                averageScore: avgScore,
                trend: (c.overallTrend === 'improving' ? 'up' : c.overallTrend === 'declining' ? 'down' : 'stable') as 'up' | 'down' | 'stable'
            };
        })
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 5);

    // Zayıf kazanımlar
    const outcomeMap = new Map<string, { total: number; count: number; description: string }>();

    analyses.forEach(a => {
        a.analysis.outcomeStats.forEach(os => {
            const existing = outcomeMap.get(os.code);
            if (existing) {
                existing.total += os.successRate;
                existing.count++;
            } else {
                outcomeMap.set(os.code, {
                    total: os.successRate,
                    count: 1,
                    description: os.description
                });
            }
        });
    });

    const weakOutcomes = Array.from(outcomeMap.entries())
        .map(([code, data]) => ({
            code,
            description: data.description,
            averageSuccessRate: data.total / data.count,
            frequency: data.count
        }))
        .filter(o => o.averageSuccessRate < 60)
        .sort((a, b) => a.averageSuccessRate - b.averageSuccessRate)
        .slice(0, 5);

    return {
        totalAnalyses: analyses.length,
        totalStudents: uniqueStudents.size,
        totalClasses: uniqueClasses.size,
        recentAnalyses: analyses.slice(0, 5),
        topPerformingStudents: topStudents,
        classPerformance,
        weakOutcomes
    };
};

// ==================== YARDIMCI FONKSİYONLAR ====================

/**
 * Trend hesapla
 */
const calculateTrend = (values: number[]): 'improving' | 'stable' | 'declining' => {
    if (values.length < 2) return 'stable';

    // Son 3 değeri karşılaştır
    const recent = values.slice(-3);
    if (recent.length < 2) return 'stable';

    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
};

/**
 * Tüm verileri temizle
 */
export const clearAllData = (): void => {
    localStorage.removeItem(STORAGE_KEYS.ANALYSES);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CLASS_PROGRESS);
};

/**
 * Verileri dışa aktar (JSON)
 */
export const exportAllData = (): string => {
    return JSON.stringify({
        analyses: getAllAnalyses(),
        studentProgress: getStudentProgressMap(),
        classProgress: getClassProgressMap(),
        exportDate: new Date().toISOString()
    }, null, 2);
};

/**
 * Verileri içe aktar (JSON)
 */
export const importData = (jsonString: string): boolean => {
    try {
        const data = JSON.parse(jsonString);

        if (data.analyses) {
            localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(data.analyses));
        }
        if (data.studentProgress) {
            localStorage.setItem(STORAGE_KEYS.STUDENT_PROGRESS, JSON.stringify(data.studentProgress));
        }
        if (data.classProgress) {
            localStorage.setItem(STORAGE_KEYS.CLASS_PROGRESS, JSON.stringify(data.classProgress));
        }

        return true;
    } catch (error) {
        console.error('Veri içe aktarma hatası:', error);
        return false;
    }
};

/**
 * Benzersiz sınıf listesi getir
 */
export const getUniqueClasses = (): string[] => {
    const analyses = getAllAnalyses();
    return [...new Set(analyses.map(a => a.metadata.className))];
};

/**
 * Benzersiz ders listesi getir
 */
export const getUniqueSubjects = (): string[] => {
    const analyses = getAllAnalyses();
    return [...new Set(analyses.map(a => a.metadata.subject))];
};

/**
 * Benzersiz öğrenci listesi getir
 */
export const getUniqueStudents = (): { name: string; className: string }[] => {
    const analyses = getAllAnalyses();
    const studentMap = new Map<string, { name: string; className: string }>();

    analyses.forEach(a => {
        a.students.forEach(s => {
            const key = `${s.name}_${a.metadata.className}`;
            if (!studentMap.has(key)) {
                studentMap.set(key, { name: s.name, className: a.metadata.className });
            }
        });
    });

    return Array.from(studentMap.values());
};
