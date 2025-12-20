import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

export interface DemoClass {
    metadata: ExamMetadata;
    questions: QuestionConfig[];
    students: Student[];
}

const QUESTIONS_5: QuestionConfig[] = [
    { id: 1, order: 1, maxScore: 10, outcome: { code: 'M.5.1.1', description: 'En çok dokuz basamaklı doğal sayıları okur ve yazar.' } },
    { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.5.1.2', description: 'En çok dokuz basamaklı doğal sayıların bölüklerini, basamaklarını ve rakamların basamak değerlerini belirtir.' } },
    { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.5.1.3', description: 'Kuralı verilen sayı ve şekil örüntülerinin istenen adımlarını oluşturur.' } },
    { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.5.1.4', description: 'En çok beş basamaklı doğal sayılarla toplama ve çıkarma işlemi yapar.' } },
    { id: 5, order: 5, maxScore: 20, outcome: { code: 'M.5.1.5', description: 'Doğal sayılarla toplama ve çıkarma işlemlerinin sonuçlarını tahmin eder.' } },
    { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.5.1.6', description: 'Zihinden toplama ve çıkarma işlemleri yapar.' } },
];

const QUESTIONS_6: QuestionConfig[] = [
    { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.6.1.1', description: 'Üslü ifadeleri anlar ve değerini hesaplar.' } },
    { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.6.1.2', description: 'İşlem önceliğini dikkate alarak doğal sayılarla dört işlem yapar.' } },
    { id: 3, order: 3, maxScore: 15, outcome: { code: 'M.6.1.3', description: 'Doğal sayıların çarpanlarını ve katlarını belirler.' } },
    { id: 4, order: 4, maxScore: 20, outcome: { code: 'M.6.1.4', description: 'Bölünebilme kurallarını anlar ve kullanır.' } },
    { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.6.1.5', description: 'Asal sayıları özellikleriyle belirler.' } },
    { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.6.1.6', description: 'Doğal sayıların ortak çarpanlarını ve ortak katlarını belirler.' } },
];

const QUESTIONS_7: QuestionConfig[] = [
    { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.7.1.1', description: 'Tam sayılarla toplama ve çıkarma işlemlerini yapar.' } },
    { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.7.1.2', description: 'Tam sayılarla çarpma ve bölme işlemlerini yapar.' } },
    { id: 3, order: 3, maxScore: 20, outcome: { code: 'M.7.1.3', description: 'Tam sayıların kendileri ile tekrarlı çarpımını üslü nicelik olarak ifade eder.' } },
    { id: 4, order: 4, maxScore: 15, outcome: { code: 'M.7.1.4', description: 'Rasyonel sayıları tanır ve sayı doğrusunda gösterir.' } },
    { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.7.1.5', description: 'Rasyonel sayıları ondalık gösterimle ifade eder.' } },
    { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.7.2.1', description: 'Birinci dereceden bir bilinmeyenli denklemleri çözer.' } },
];

const QUESTIONS_8: QuestionConfig[] = [
    { id: 1, order: 1, maxScore: 15, outcome: { code: 'M.8.1.1', description: 'Verilen pozitif tam sayıların pozitif tam sayı çarpanlarını bulur.' } },
    { id: 2, order: 2, maxScore: 15, outcome: { code: 'M.8.1.2', description: 'Tam sayıların, tam sayı kuvvetlerini hesaplar.' } },
    { id: 3, order: 3, maxScore: 20, outcome: { code: 'M.8.1.3', description: 'Üslü ifadelerle ilgili temel kuralları anlar ve işlemler yapar.' } },
    { id: 4, order: 4, maxScore: 15, outcome: { code: 'M.8.1.4', description: 'Tam kare pozitif tam sayılarla bu sayıların karekökleri arasındaki ilişkiyi belirler.' } },
    { id: 5, order: 5, maxScore: 15, outcome: { code: 'M.8.1.5', description: 'Tam kare olmayan kareköklü bir sayının hangi iki doğal sayı arasında olduğunu belirler.' } },
    { id: 6, order: 6, maxScore: 20, outcome: { code: 'M.8.2.1', description: 'Cebirsel ifadeleri çarpanlara ayırır.' } },
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

const FIRST_NAMES = [
    'Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Zeynep', 'Mustafa', 'Emine', 'Hüseyin', 'Hatice',
    'Can', 'Ece', 'Burak', 'Selin', 'Mert', 'Derya', 'Deniz', 'Ömer', 'Elif', 'Yusuf',
    'Arda', 'Buse', 'Cem', 'Damla', 'Enes', 'Gizem', 'Hakan', 'İrem', 'Kaan', 'Lale'
];

const LAST_NAMES = [
    'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan',
    'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat',
    'Özcan', 'Korkmaz', 'Çakır', 'Erdoğan', 'Yavuz', 'Aksoy', 'Sarı', 'Avcı', 'Güler', 'Güneş'
];

function getRandomName() {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${fn} ${ln}`;
}

export const DEMO_CLASSES: Record<string, DemoClass> = {
    '5A': {
        metadata: {
            grade: '5', subject: 'Matematik', scenario: '1', schoolName: 'Cumhuriyet Ortaokulu',
            teacherName: 'Saliha Erdöl', academicYear: '2025-2026', className: '5A',
            date: '2025-12-15', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: QUESTIONS_5,
        students: Array.from({ length: 25 }, (_, i) => ({
            id: `5a${i + 1}`,
            student_number: `${100 + i}`,
            name: getRandomName(),
            scores: generateScores(QUESTIONS_5, 0.4 + Math.random() * 0.5)
        }))
    },
    '6A': {
        metadata: {
            grade: '6', subject: 'Matematik', scenario: '1', schoolName: 'Atatürk Ortaokulu',
            teacherName: 'Ertuğrul Gülter', academicYear: '2025-2026', className: '6A',
            date: '2025-12-10', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: QUESTIONS_6,
        students: Array.from({ length: 20 }, (_, i) => ({
            id: `6a${i + 1}`,
            student_number: `${200 + i}`,
            name: getRandomName(),
            scores: generateScores(QUESTIONS_6, 0.5 + Math.random() * 0.4)
        }))
    },
    '7A': {
        metadata: {
            grade: '7', subject: 'Matematik', scenario: '1', schoolName: 'Fatih Ortaokulu',
            teacherName: 'Ali Yaltoğil', academicYear: '2025-2026', className: '7A',
            date: '2025-12-12', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: QUESTIONS_7,
        students: Array.from({ length: 22 }, (_, i) => ({
            id: `7a${i + 1}`,
            student_number: `${300 + i}`,
            name: getRandomName(),
            scores: generateScores(QUESTIONS_7, 0.3 + Math.random() * 0.6)
        }))
    },
    '8A': {
        metadata: {
            grade: '8', subject: 'Matematik', scenario: '1', schoolName: 'Mevlana Ortaokulu',
            teacherName: 'Mine Taş', academicYear: '2025-2026', className: '8A',
            date: '2025-12-14', term: '1', examNumber: '1', examType: 'Yazılı'
        },
        questions: QUESTIONS_8,
        students: Array.from({ length: 18 }, (_, i) => ({
            id: `8a${i + 1}`,
            student_number: `${400 + i}`,
            name: getRandomName(),
            scores: generateScores(QUESTIONS_8, 0.6 + Math.random() * 0.3)
        }))
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
        averageSuccess: classAverage, // For demo purposes, they are the same
        totalQuestions: questions.length,
    };
}
