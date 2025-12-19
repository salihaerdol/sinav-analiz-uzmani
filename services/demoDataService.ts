import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

export const DEMO_DATA_6A = {
    metadata: {
        grade: '6',
        subject: 'Matematik',
        scenario: '1',
        schoolName: 'Kalekaya Ortaokulu',
        teacherName: 'Mine Taş',
        academicYear: '2025-2026',
        className: '6A',
        date: '2025-12-10',
        term: '1' as const,
        examNumber: '1',
        examType: 'Yazılı' as const,
    },
    questions: [
        { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.6.1.2', description: 'İşlem önceliğini dikkate alarak doğal sayılarla dört işlem yapar.' } },
        { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.6.1.3', description: 'Doğal sayıların çarpanlarını ve katlarını belirler.' } },
        { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.6.1.4', description: 'Bölünebilme kurallarını anlar ve kullanır.' } },
        { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.6.1.1', description: 'Üslü ifadeleri anlar ve değerini hesaplar.' } },
        { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.6.1.1', description: 'Üslü ifadeleri anlar ve değerini hesaplar.' } },
        { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.6.5.1', description: 'Veri toplamayı gerektiren araştırma soruları oluşturur.' } },
    ] as QuestionConfig[],
    students: [
        { id: 's1', student_number: '28', name: 'Kevser Fatma Biricik', scores: { 1: 15, 2: 11, 3: 15, 4: 20, 5: 15, 6: 20 } },
        { id: 's2', student_number: '36', name: 'Cennet Şahan', scores: { 1: 10, 2: 10, 3: 10, 4: 15, 5: 10, 6: 15 } },
        { id: 's3', student_number: '42', name: 'Hatice Canik', scores: { 1: 12, 2: 8, 3: 12, 4: 18, 5: 12, 6: 18 } },
        { id: 's4', student_number: '55', name: 'Suna Keçikıçlı', scores: { 1: 14, 2: 12, 3: 14, 4: 19, 5: 14, 6: 19 } },
        { id: 's5', student_number: '60', name: 'Yunus Çolak', scores: { 1: 5, 2: 5, 3: 5, 4: 10, 5: 5, 6: 10 } },
        { id: 's6', student_number: '73', name: 'Mehmet Şahan', scores: { 1: 0, 2: 6, 3: 0, 4: 0, 5: 0, 6: 10 } },
        { id: 's7', student_number: '94', name: 'Tayyibe Şahan', scores: { 1: 8, 2: 8, 3: 8, 4: 12, 5: 8, 6: 12 } },
    ] as Student[],
};

export function calculateDemoAnalysis(data: typeof DEMO_DATA_6A): AnalysisResult {
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

    const outcomeStats = Array.from(new Set(questions.map(q => q.outcome.code))).map(code => {
        const relatedQuestions = questions.filter(q => q.outcome.code === code);
        const avgSuccess = relatedQuestions.reduce((sum, q) => {
            const stat = questionStats.find(s => s.questionId === q.id);
            return sum + (stat?.successRate || 0);
        }, 0) / relatedQuestions.length;

        return {
            code,
            description: relatedQuestions[0].outcome.description,
            successRate: avgSuccess,
            isFailed: avgSuccess < 50,
        };
    });

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
