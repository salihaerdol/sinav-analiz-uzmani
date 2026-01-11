// =====================================================
// MODÜL: SORU BANKASI - SERVİS
// =====================================================

import {
    Question,
    QuestionOption,
    QuestionBankFilter,
    QuestionBankStats,
    ExamBuilderSettings,
    GeneratedExam,
    Topic,
    LearningOutcome,
    DifficultyLevel,
    QuestionType
} from './types';
import { BloomLevel } from '../international-benchmark/types';

// ═══════════════════════════════════════════════════════════════
// DEMO VERİLER
// ═══════════════════════════════════════════════════════════════

const DEMO_TOPICS: Topic[] = [
    { id: 't1', subjectId: 'math', name: 'Doğal Sayılar', grade: 5, unitNumber: 1, mebCode: 'M.5.1' },
    { id: 't2', subjectId: 'math', name: 'Kesirler', grade: 5, unitNumber: 2, mebCode: 'M.5.2' },
    { id: 't3', subjectId: 'math', name: 'Ondalık Kesirler', grade: 5, unitNumber: 3, mebCode: 'M.5.3' },
    { id: 't4', subjectId: 'math', name: 'Geometri', grade: 5, unitNumber: 4, mebCode: 'M.5.4' },
    { id: 't5', subjectId: 'turkish', name: 'Okuma Anlama', grade: 5, unitNumber: 1, mebCode: 'T.5.1' },
    { id: 't6', subjectId: 'turkish', name: 'Dil Bilgisi', grade: 5, unitNumber: 2, mebCode: 'T.5.2' },
    { id: 't7', subjectId: 'science', name: 'Canlılar Dünyası', grade: 5, unitNumber: 1, mebCode: 'F.5.1' },
    { id: 't8', subjectId: 'science', name: 'Kuvvet ve Hareket', grade: 5, unitNumber: 2, mebCode: 'F.5.2' },
];

const DEMO_OUTCOMES: LearningOutcome[] = [
    { id: 'o1', topicId: 't1', code: 'M.5.1.1.1', description: 'Doğal sayıları okur ve yazar', bloomLevel: 'Hatırlama', grade: 5, subject: 'Matematik' },
    { id: 'o2', topicId: 't1', code: 'M.5.1.1.2', description: 'Doğal sayıları karşılaştırır', bloomLevel: 'Anlama', grade: 5, subject: 'Matematik' },
    { id: 'o3', topicId: 't1', code: 'M.5.1.2.1', description: 'Dört işlem yapar', bloomLevel: 'Uygulama', grade: 5, subject: 'Matematik' },
    { id: 'o4', topicId: 't2', code: 'M.5.2.1.1', description: 'Kesirleri modelle gösterir', bloomLevel: 'Anlama', grade: 5, subject: 'Matematik' },
    { id: 'o5', topicId: 't2', code: 'M.5.2.2.1', description: 'Kesirlerde toplama çıkarma yapar', bloomLevel: 'Uygulama', grade: 5, subject: 'Matematik' },
];

export function generateDemoQuestions(): Question[] {
    const questions: Question[] = [
        {
            id: 'q1',
            text: '345 + 678 işleminin sonucu kaçtır?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: '1023', isCorrect: true },
                { id: 'b', text: '1013', isCorrect: false },
                { id: 'c', text: '1123', isCorrect: false },
                { id: 'd', text: '923', isCorrect: false },
            ],
            bloomLevel: 'Uygulama',
            difficulty: 'easy',
            topicId: 't1',
            topicName: 'Doğal Sayılar',
            outcomeCode: 'M.5.1.2.1',
            usageCount: 45,
            averageSuccessRate: 82,
            tags: ['toplama', 'dört işlem'],
            createdBy: 'teacher-1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q2',
            text: 'Aşağıdakilerden hangisi 3/4 kesrini doğru gösterir?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: 'Bir bütünün 3 parçaya bölünmüş hali', isCorrect: false },
                { id: 'b', text: 'Bir bütünün 4 parçaya bölünüp 3 parçasının alınması', isCorrect: true },
                { id: 'c', text: '3 bütünün 4\'e bölünmesi', isCorrect: false },
                { id: 'd', text: '4 bütünün 3\'e bölünmesi', isCorrect: false },
            ],
            bloomLevel: 'Anlama',
            difficulty: 'medium',
            topicId: 't2',
            topicName: 'Kesirler',
            outcomeCode: 'M.5.2.1.1',
            usageCount: 38,
            averageSuccessRate: 65,
            tags: ['kesir', 'kavram'],
            createdBy: 'teacher-1',
            createdAt: '2026-01-02',
            updatedAt: '2026-01-02',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q3',
            text: '1/4 + 2/4 işleminin sonucu kaçtır?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: '3/8', isCorrect: false },
                { id: 'b', text: '3/4', isCorrect: true },
                { id: 'c', text: '2/4', isCorrect: false },
                { id: 'd', text: '1/2', isCorrect: false },
            ],
            bloomLevel: 'Uygulama',
            difficulty: 'easy',
            topicId: 't2',
            topicName: 'Kesirler',
            outcomeCode: 'M.5.2.2.1',
            usageCount: 52,
            averageSuccessRate: 78,
            tags: ['kesir', 'toplama'],
            createdBy: 'teacher-1',
            createdAt: '2026-01-03',
            updatedAt: '2026-01-03',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q4',
            text: 'Bir üçgenin iç açıları toplamı kaç derecedir?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: '90°', isCorrect: false },
                { id: 'b', text: '180°', isCorrect: true },
                { id: 'c', text: '270°', isCorrect: false },
                { id: 'd', text: '360°', isCorrect: false },
            ],
            bloomLevel: 'Hatırlama',
            difficulty: 'easy',
            topicId: 't4',
            topicName: 'Geometri',
            outcomeCode: 'M.5.4.1.1',
            usageCount: 67,
            averageSuccessRate: 85,
            tags: ['üçgen', 'açı'],
            createdBy: 'teacher-2',
            createdAt: '2026-01-04',
            updatedAt: '2026-01-04',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q5',
            text: 'Bir market, 3 kg elma 45 TL\'ye satmaktadır. Bu marketten 5 kg elma almak isteyen bir kişi kaç TL ödemelidir?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: '60 TL', isCorrect: false },
                { id: 'b', text: '75 TL', isCorrect: true },
                { id: 'c', text: '90 TL', isCorrect: false },
                { id: 'd', text: '65 TL', isCorrect: false },
            ],
            bloomLevel: 'Analiz',
            difficulty: 'hard',
            topicId: 't1',
            topicName: 'Doğal Sayılar',
            outcomeCode: 'M.5.1.3.1',
            usageCount: 29,
            averageSuccessRate: 52,
            tags: ['problem', 'orantı'],
            createdBy: 'teacher-1',
            createdAt: '2026-01-05',
            updatedAt: '2026-01-05',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q6',
            text: 'Aşağıdaki cümlelerden hangisinde özne belirtilmemiştir?',
            type: 'multiple_choice',
            subject: 'Türkçe',
            grade: 5,
            options: [
                { id: 'a', text: 'Ali okula gitti.', isCorrect: false },
                { id: 'b', text: 'Yarın hava güzel olacak.', isCorrect: true },
                { id: 'c', text: 'Kedim süt içiyor.', isCorrect: false },
                { id: 'd', text: 'Annem yemek yapıyor.', isCorrect: false },
            ],
            bloomLevel: 'Analiz',
            difficulty: 'medium',
            topicId: 't6',
            topicName: 'Dil Bilgisi',
            outcomeCode: 'T.5.2.3.1',
            usageCount: 41,
            averageSuccessRate: 58,
            tags: ['özne', 'cümle'],
            createdBy: 'teacher-3',
            createdAt: '2026-01-06',
            updatedAt: '2026-01-06',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q7',
            text: 'Bitkilerin fotosentez yapabilmesi için aşağıdakilerden hangisi gerekli DEĞİLDİR?',
            type: 'multiple_choice',
            subject: 'Fen Bilimleri',
            grade: 5,
            options: [
                { id: 'a', text: 'Güneş ışığı', isCorrect: false },
                { id: 'b', text: 'Su', isCorrect: false },
                { id: 'c', text: 'Karbondioksit', isCorrect: false },
                { id: 'd', text: 'Oksijen', isCorrect: true },
            ],
            bloomLevel: 'Anlama',
            difficulty: 'medium',
            topicId: 't7',
            topicName: 'Canlılar Dünyası',
            outcomeCode: 'F.5.1.2.1',
            usageCount: 55,
            averageSuccessRate: 62,
            tags: ['fotosentez', 'bitki'],
            createdBy: 'teacher-4',
            createdAt: '2026-01-07',
            updatedAt: '2026-01-07',
            isPublic: true,
            isApproved: true
        },
        {
            id: 'q8',
            text: '0,25 ondalık kesrinin kesir olarak yazılışı hangisidir?',
            type: 'multiple_choice',
            subject: 'Matematik',
            grade: 5,
            options: [
                { id: 'a', text: '1/4', isCorrect: true },
                { id: 'b', text: '1/2', isCorrect: false },
                { id: 'c', text: '2/5', isCorrect: false },
                { id: 'd', text: '1/5', isCorrect: false },
            ],
            bloomLevel: 'Uygulama',
            difficulty: 'medium',
            topicId: 't3',
            topicName: 'Ondalık Kesirler',
            outcomeCode: 'M.5.3.1.1',
            usageCount: 33,
            averageSuccessRate: 68,
            tags: ['ondalık', 'dönüşüm'],
            createdBy: 'teacher-1',
            createdAt: '2026-01-08',
            updatedAt: '2026-01-08',
            isPublic: true,
            isApproved: true
        }
    ];

    return questions;
}

// ═══════════════════════════════════════════════════════════════
// FİLTRELEME VE ARAMA
// ═══════════════════════════════════════════════════════════════

export function filterQuestions(questions: Question[], filter: QuestionBankFilter): Question[] {
    return questions.filter(q => {
        if (filter.subject && q.subject !== filter.subject) return false;
        if (filter.grade && q.grade !== filter.grade) return false;
        if (filter.topicId && q.topicId !== filter.topicId) return false;
        if (filter.bloomLevel && q.bloomLevel !== filter.bloomLevel) return false;
        if (filter.difficulty && q.difficulty !== filter.difficulty) return false;
        if (filter.type && q.type !== filter.type) return false;
        if (filter.isPublic !== undefined && q.isPublic !== filter.isPublic) return false;
        if (filter.createdBy && q.createdBy !== filter.createdBy) return false;
        if (filter.minSuccessRate && (q.averageSuccessRate || 0) < filter.minSuccessRate) return false;
        if (filter.maxSuccessRate && (q.averageSuccessRate || 100) > filter.maxSuccessRate) return false;
        if (filter.searchText) {
            const search = filter.searchText.toLowerCase();
            if (!q.text.toLowerCase().includes(search) &&
                !q.tags.some(t => t.toLowerCase().includes(search))) {
                return false;
            }
        }
        if (filter.tags && filter.tags.length > 0) {
            if (!filter.tags.some(t => q.tags.includes(t))) return false;
        }
        return true;
    });
}

// ═══════════════════════════════════════════════════════════════
// İSTATİSTİKLER
// ═══════════════════════════════════════════════════════════════

export function calculateQuestionBankStats(questions: Question[]): QuestionBankStats {
    const bySubject: Record<string, number> = {};
    const byGrade: Record<number, number> = {};
    const byBloomLevel: Record<BloomLevel, number> = {
        'Hatırlama': 0, 'Anlama': 0, 'Uygulama': 0,
        'Analiz': 0, 'Değerlendirme': 0, 'Yaratma': 0
    };
    const byDifficulty: Record<DifficultyLevel, number> = {
        'very_easy': 0, 'easy': 0, 'medium': 0, 'hard': 0, 'very_hard': 0
    };
    const byType: Record<QuestionType, number> = {
        'multiple_choice': 0, 'true_false': 0, 'short_answer': 0,
        'essay': 0, 'matching': 0, 'fill_blank': 0
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let recentlyAdded = 0;

    questions.forEach(q => {
        bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
        byGrade[q.grade] = (byGrade[q.grade] || 0) + 1;
        byBloomLevel[q.bloomLevel]++;
        byDifficulty[q.difficulty]++;
        byType[q.type]++;

        if (new Date(q.createdAt) >= sevenDaysAgo) {
            recentlyAdded++;
        }
    });

    const mostUsed = [...questions]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);

    return {
        totalQuestions: questions.length,
        bySubject,
        byGrade,
        byBloomLevel,
        byDifficulty,
        byType,
        recentlyAdded,
        mostUsed
    };
}

// ═══════════════════════════════════════════════════════════════
// SINAV OLUŞTURUCU
// ═══════════════════════════════════════════════════════════════

export function generateExam(
    questions: Question[],
    settings: ExamBuilderSettings
): GeneratedExam {
    let filtered = questions.filter(q =>
        q.subject === settings.subject && q.grade === settings.grade
    );

    // Konu filtresi
    if (settings.topicIds && settings.topicIds.length > 0) {
        filtered = filtered.filter(q =>
            q.topicId && settings.topicIds!.includes(q.topicId)
        );
    }

    // Dağılıma göre seçim
    const selected: Question[] = [];
    const remaining = [...filtered];

    // Bloom dağılımına göre seç
    if (settings.bloomDistribution) {
        for (const [level, count] of Object.entries(settings.bloomDistribution)) {
            const levelQuestions = remaining.filter(q => q.bloomLevel === level);
            const toSelect = levelQuestions.slice(0, count);
            selected.push(...toSelect);
            toSelect.forEach(q => {
                const idx = remaining.indexOf(q);
                if (idx > -1) remaining.splice(idx, 1);
            });
        }
    }

    // Kalan ihtiyaç varsa rastgele ekle
    const needed = settings.totalQuestions - selected.length;
    if (needed > 0) {
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        selected.push(...shuffled.slice(0, needed));
    }

    // Karıştır
    let finalQuestions = selected;
    if (settings.shuffleQuestions) {
        finalQuestions = selected.sort(() => Math.random() - 0.5);
    }

    // Seçenekleri karıştır
    if (settings.shuffleOptions) {
        finalQuestions = finalQuestions.map(q => ({
            ...q,
            options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : undefined
        }));
    }

    return {
        id: `exam-${Date.now()}`,
        settings,
        questions: finalQuestions.slice(0, settings.totalQuestions),
        totalPoints: settings.totalQuestions * 5, // Varsayılan 5 puan/soru
        createdAt: new Date().toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

export function getDifficultyLabel(difficulty: DifficultyLevel): string {
    const labels: Record<DifficultyLevel, string> = {
        'very_easy': 'Çok Kolay',
        'easy': 'Kolay',
        'medium': 'Orta',
        'hard': 'Zor',
        'very_hard': 'Çok Zor'
    };
    return labels[difficulty];
}

export function getDifficultyColor(difficulty: DifficultyLevel): string {
    const colors: Record<DifficultyLevel, string> = {
        'very_easy': 'bg-emerald-100 text-emerald-700',
        'easy': 'bg-green-100 text-green-700',
        'medium': 'bg-amber-100 text-amber-700',
        'hard': 'bg-orange-100 text-orange-700',
        'very_hard': 'bg-red-100 text-red-700'
    };
    return colors[difficulty];
}

export function getQuestionTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
        'multiple_choice': 'Çoktan Seçmeli',
        'true_false': 'Doğru/Yanlış',
        'short_answer': 'Kısa Cevap',
        'essay': 'Uzun Cevap',
        'matching': 'Eşleştirme',
        'fill_blank': 'Boşluk Doldurma'
    };
    return labels[type];
}

export function getBloomColor(level: BloomLevel): string {
    const colors: Record<BloomLevel, string> = {
        'Hatırlama': 'bg-slate-100 text-slate-700',
        'Anlama': 'bg-blue-100 text-blue-700',
        'Uygulama': 'bg-emerald-100 text-emerald-700',
        'Analiz': 'bg-amber-100 text-amber-700',
        'Değerlendirme': 'bg-orange-100 text-orange-700',
        'Yaratma': 'bg-violet-100 text-violet-700'
    };
    return colors[level];
}

export { DEMO_TOPICS, DEMO_OUTCOMES };
