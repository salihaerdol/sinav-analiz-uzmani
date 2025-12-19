import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

export interface DemoClass {
    metadata: ExamMetadata;
    questions: QuestionConfig[];
    students: Student[];
}

const DEFAULT_QUESTIONS: QuestionConfig[] = [
    { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.6.1.2', description: 'İşlem önceliğini dikkate alarak doğal sayılarla dört işlem yapar.' } },
    { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.6.1.3', description: 'Doğal sayıların çarpanlarını ve katlarını belirler.' } },
    { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.6.1.4', description: 'Bölünebilme kurallarını anlar ve kullanır.' } },
    { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.6.1.1', description: 'Üslü ifadeleri anlar ve değerini hesaplar.' } },
    { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.6.1.1', description: 'Üslü ifadeleri anlar ve değerini hesaplar.' } },
    { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.6.5.1', description: 'Veri toplamayı gerektiren araştırma soruları oluşturur.' } },
];

function generateScores(questions: QuestionConfig[], successBase: number): Record<number, number> {
    const scores: Record<number, number> = {};
    questions.forEach(q => {
        // Random score based on successBase (0.0 to 1.0)
        const factor = Math.min(1, Math.max(0, successBase + (Math.random() * 0.4 - 0.2)));
        scores[q.id] = Math.round(q.maxScore * factor);
    });
    return scores;
}

export const DEMO_CLASSES: Record<string, DemoClass> = {
    '5A': {
        metadata: {
            grade: '5', subject: 'Matematik', scenario: '1', schoolName: 'Kalekaya Ortaokulu',
            teacherName: 'Saliha Erdöl', academicYear: '2025-2026', className: '5A',
            date: '2025-12-15', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: DEFAULT_QUESTIONS,
        students: [
            { id: '5a1', student_number: '9', name: 'Bayram Can', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '5a2', student_number: '15', name: 'Ahmet Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '5a3', student_number: '16', name: 'Ahmet Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '5a4', student_number: '17', name: 'Can Berkan Avcı', scores: generateScores(DEFAULT_QUESTIONS, 0.9) },
            { id: '5a5', student_number: '18', name: 'Cansu Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.75) },
            { id: '5a6', student_number: '19', name: 'Hacı Aksu', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
            { id: '5a7', student_number: '20', name: 'Hatice Torun', scores: generateScores(DEFAULT_QUESTIONS, 0.85) },
            { id: '5a8', student_number: '22', name: 'Durdu Aksu', scores: generateScores(DEFAULT_QUESTIONS, 0.4) },
            { id: '5a9', student_number: '23', name: 'Havvanur Avcı', scores: generateScores(DEFAULT_QUESTIONS, 0.65) },
            { id: '5a10', student_number: '24', name: 'Hüseyin Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '5a11', student_number: '26', name: 'Nuri Çağlar Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.95) },
            { id: '5a12', student_number: '27', name: 'Ömer Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '5a13', student_number: '29', name: 'Rahime Nur Kelleşibüyük', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '5a14', student_number: '30', name: 'Sait Torun', scores: generateScores(DEFAULT_QUESTIONS, 0.55) },
            { id: '5a15', student_number: '32', name: 'Umutcan Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '5a16', student_number: '33', name: 'Yasin Gümüş', scores: generateScores(DEFAULT_QUESTIONS, 0.75) },
            { id: '5a17', student_number: '34', name: 'Yılmaz Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '5a18', student_number: '65', name: 'Battal Hacı Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.45) },
            { id: '5a19', student_number: '66', name: 'Dede Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
            { id: '5a20', student_number: '69', name: 'Ertuğrul Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.9) },
            { id: '5a21', student_number: '78', name: 'Mehmet Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.3) },
            { id: '5a22', student_number: '83', name: 'Durdiye Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '5a23', student_number: '87', name: 'Gamze Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.85) },
            { id: '5a24', student_number: '89', name: 'Hasan Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '5a25', student_number: '92', name: 'Kenan Aksu', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
        ]
    },
    '6A': {
        metadata: {
            grade: '6', subject: 'Matematik', scenario: '1', schoolName: 'Kalekaya Ortaokulu',
            teacherName: 'Ertuğrul Gülter', academicYear: '2025-2026', className: '6A',
            date: '2025-12-10', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: DEFAULT_QUESTIONS,
        students: [
            { id: '6a1', student_number: '28', name: 'Kevser Fatma Biricik', scores: { 1: 15, 2: 11, 3: 15, 4: 20, 5: 15, 6: 20 } },
            { id: '6a2', student_number: '36', name: 'Cennet Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.65) },
            { id: '6a3', student_number: '42', name: 'Hatice Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '6a4', student_number: '55', name: 'Suna Keçikiçli', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '6a5', student_number: '60', name: 'Yunus Çolak', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
            { id: '6a6', student_number: '73', name: 'Mehmet Şahan', scores: { 1: 0, 2: 6, 3: 0, 4: 0, 5: 0, 6: 10 } },
            { id: '6a7', student_number: '94', name: 'Tayyibe Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
        ]
    },
    '7A': {
        metadata: {
            grade: '7', subject: 'Matematik', scenario: '1', schoolName: 'Kalekaya Ortaokulu',
            teacherName: 'Ali Yaltoğil', academicYear: '2025-2026', className: '7A',
            date: '2025-12-12', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: DEFAULT_QUESTIONS,
        students: [
            { id: '7a1', student_number: '11', name: 'Gül Bahar Poyraz', scores: generateScores(DEFAULT_QUESTIONS, 0.85) },
            { id: '7a2', student_number: '12', name: 'Feride Aksu', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '7a3', student_number: '43', name: 'Rabia Aksu', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '7a4', student_number: '45', name: 'Döndü Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.75) },
            { id: '7a5', student_number: '46', name: 'Döndü Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '7a6', student_number: '51', name: 'Ömer Samet Çapar', scores: generateScores(DEFAULT_QUESTIONS, 0.55) },
            { id: '7a7', student_number: '62', name: 'Ayşenur Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.9) },
            { id: '7a8', student_number: '68', name: 'Eda Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.85) },
            { id: '7a9', student_number: '71', name: 'Gülüzar Gümüş', scores: generateScores(DEFAULT_QUESTIONS, 0.65) },
            { id: '7a10', student_number: '72', name: 'Hasan Hüseyin Çapar', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '7a11', student_number: '77', name: 'Barış Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
            { id: '7a12', student_number: '80', name: 'Bünyamin Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '7a13', student_number: '85', name: 'Emine Canik', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '7a14', student_number: '90', name: 'Hüsne Türk', scores: generateScores(DEFAULT_QUESTIONS, 0.75) },
            { id: '7a15', student_number: '96', name: 'Musa Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.4) },
        ]
    },
    '8A': {
        metadata: {
            grade: '8', subject: 'Matematik', scenario: '1', schoolName: 'Kalekaya Ortaokulu',
            teacherName: 'Mine Taş', academicYear: '2025-2026', className: '8A',
            date: '2025-12-14', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: DEFAULT_QUESTIONS,
        students: [
            { id: '8a1', student_number: '8', name: 'Ahmet Kelleşibüyük', scores: generateScores(DEFAULT_QUESTIONS, 0.9) },
            { id: '8a2', student_number: '13', name: 'Halime Gümüş', scores: generateScores(DEFAULT_QUESTIONS, 0.8) },
            { id: '8a3', student_number: '14', name: 'Hacı Mehmet Biricik', scores: generateScores(DEFAULT_QUESTIONS, 0.7) },
            { id: '8a4', student_number: '21', name: 'Melike Gümüş', scores: generateScores(DEFAULT_QUESTIONS, 0.85) },
            { id: '8a5', student_number: '76', name: 'Aysel Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.6) },
            { id: '8a6', student_number: '98', name: 'Uğur Şahan', scores: generateScores(DEFAULT_QUESTIONS, 0.5) },
        ]
    }
};

export function calculateDemoAnalysis(data: DemoClass): AnalysisResult {
    const { questions, students } = data;

    const questionStats = questions.map(q => {
        const totalScore = students.reduce((sum, s) => sum + (s.scores[q.id] || 0), 0);
        const averageScore = totalScore / students.length;
        const successRate = (averageScore / q.maxScore) * 100;
        return {
            questionId: q.id,
            averageScore,
            successRate,
            outcome: q.outcome,
        };
    });

    const outcomeMap = new Map<string, { totalRate: number, count: number, desc: string }>();
    questionStats.forEach(qs => {
        const current = outcomeMap.get(qs.outcome.code) || { totalRate: 0, count: 0, desc: qs.outcome.description };
        outcomeMap.set(qs.outcome.code, {
            totalRate: current.totalRate + qs.successRate,
            count: current.count + 1,
            desc: current.desc
        });
    });

    const outcomeStats = Array.from(outcomeMap.entries()).map(([code, data]) => ({
        code,
        description: data.desc,
        successRate: data.totalRate / data.count,
        isFailed: (data.totalRate / data.count) < 50,
    }));

    const studentStats = students.map(s => {
        const totalScore = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxScore = questions.reduce((a, q) => a + q.maxScore, 0);
        return {
            studentId: s.id,
            totalScore,
            percentage: (totalScore / maxScore) * 100,
        };
    });

    const classAverage = studentStats.reduce((sum, s) => sum + s.percentage, 0) / students.length;

    return {
        questionStats,
        outcomeStats,
        studentStats,
        classAverage,
        totalQuestions: questions.length,
    };
}
