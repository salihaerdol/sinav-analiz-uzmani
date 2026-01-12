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
    QuestionFormData,
    DifficultyLevel,
    QuestionType
} from './types';
import { BloomLevel } from '../international-benchmark/types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

interface TopicDB {
    id: string;
    user_id: string | null;
    subject: string;
    name: string;
    grade: number;
    unit_number: number | null;
    parent_topic_id: string | null;
    meb_code: string | null;
    description: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

interface OutcomeDB {
    id: string;
    user_id: string | null;
    topic_id: string | null;
    code: string;
    description: string;
    bloom_level: string | null;
    grade: number | null;
    subject: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

interface QuestionDB {
    id: string;
    user_id: string | null;
    text: string;
    type: string;
    subject: string;
    grade: number;
    options: QuestionOption[] | null;
    correct_answer: string | null;
    explanation: string | null;
    image_url: string | null;
    topic_id: string | null;
    outcome_id: string | null;
    outcome_code: string | null;
    bloom_level: string | null;
    difficulty: string | null;
    usage_count: number | null;
    average_success_rate: number | null;
    tags: string[] | null;
    is_public: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

const mapTopic = (db: TopicDB): Topic => ({
    id: db.id,
    subjectId: db.subject,
    name: db.name,
    grade: db.grade,
    unitNumber: db.unit_number || 0,
    parentTopicId: db.parent_topic_id || undefined,
    mebCode: db.meb_code || undefined,
    description: db.description || undefined
});

const mapOutcome = (db: OutcomeDB): LearningOutcome => ({
    id: db.id,
    topicId: db.topic_id || '',
    code: db.code,
    description: db.description,
    bloomLevel: (db.bloom_level as BloomLevel) || 'Anlama',
    grade: db.grade || 0,
    subject: db.subject || ''
});

const mapQuestion = (
    db: QuestionDB,
    topicMap: Map<string, Topic>,
    outcomeMap: Map<string, LearningOutcome>
): Question => {
    const topic = db.topic_id ? topicMap.get(db.topic_id) : undefined;
    const outcome = db.outcome_id ? outcomeMap.get(db.outcome_id) : undefined;
    const bloom = (db.bloom_level as BloomLevel) || outcome?.bloomLevel || 'Anlama';
    const difficulty = (db.difficulty as DifficultyLevel) || 'medium';
    const type = (db.type as QuestionType) || 'multiple_choice';

    return {
        id: db.id,
        text: db.text,
        type,
        subject: db.subject,
        grade: Number(db.grade) || 0,
        options: Array.isArray(db.options) ? db.options : undefined,
        correctAnswer: db.correct_answer || undefined,
        explanation: db.explanation || undefined,
        imageUrl: db.image_url || undefined,
        topicId: db.topic_id || undefined,
        topicName: topic?.name,
        outcomeId: db.outcome_id || outcome?.id,
        outcomeCode: db.outcome_code || outcome?.code,
        bloomLevel: bloom,
        difficulty,
        usageCount: db.usage_count || 0,
        averageSuccessRate: db.average_success_rate ?? undefined,
        tags: db.tags || [],
        createdBy: db.user_id || 'public',
        createdAt: db.created_at,
        updatedAt: db.updated_at,
        isPublic: db.is_public,
        isApproved: db.is_approved
    };
};

export async function fetchQuestionBankData(): Promise<{
    questions: Question[];
    topics: Topic[];
    outcomes: LearningOutcome[];
}> {
    if (!isSupabaseConfigured) {
        return { questions: [], topics: [], outcomes: [] };
    }

    const [topicsResult, outcomesResult, questionsResult] = await Promise.all([
        supabase.from('question_bank_topics').select('*').order('name', { ascending: true }),
        supabase.from('question_bank_outcomes').select('*').order('code', { ascending: true }),
        supabase.from('question_bank_questions').select('*').order('created_at', { ascending: false })
    ]);

    if (topicsResult.error || outcomesResult.error || questionsResult.error) {
        console.error('Soru bankasi verileri getirilemedi:', {
            topicsError: topicsResult.error,
            outcomesError: outcomesResult.error,
            questionsError: questionsResult.error
        });
        return { questions: [], topics: [], outcomes: [] };
    }

    const topics = (topicsResult.data || []).map(mapTopic);
    const outcomes = (outcomesResult.data || []).map(mapOutcome);
    const topicMap = new Map(topics.map(topic => [topic.id, topic]));
    const outcomeMap = new Map(outcomes.map(outcome => [outcome.id, outcome]));

    const questions = (questionsResult.data || []).map((question) =>
        mapQuestion(question as QuestionDB, topicMap, outcomeMap)
    );

    return { questions, topics, outcomes };
}

type QuestionFormInput = QuestionFormData & { outcomeId?: string };

const buildQuestionPayload = (input: QuestionFormInput) => {
    const options = input.type === 'multiple_choice' ? input.options : null;
    const correctAnswer = input.type === 'multiple_choice'
        ? (input.correctAnswer || options?.find(option => option.isCorrect)?.id || null)
        : (input.correctAnswer || null);

    return {
        text: input.text,
        type: input.type,
        subject: input.subject,
        grade: input.grade,
        options,
        correct_answer: correctAnswer,
        explanation: input.explanation || null,
        image_url: null,
        topic_id: input.topicId || null,
        outcome_id: input.outcomeId || null,
        outcome_code: input.outcomeCode || null,
        bloom_level: input.bloomLevel,
        difficulty: input.difficulty,
        tags: input.tags || [],
        is_public: Boolean(input.isPublic),
        is_approved: Boolean(input.isPublic)
    };
};

export async function createQuestion(input: QuestionFormInput): Promise<boolean> {
    if (!isSupabaseConfigured) {
        return false;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return false;
    }

    const payload = {
        ...buildQuestionPayload(input),
        user_id: user.id
    };

    const { error } = await supabase
        .from('question_bank_questions')
        .insert(payload);

    if (error) {
        console.error('Soru eklenemedi:', error);
        return false;
    }

    return true;
}

export async function updateQuestion(id: string, input: QuestionFormInput): Promise<boolean> {
    if (!isSupabaseConfigured) {
        return false;
    }

    const payload = buildQuestionPayload(input);

    const { error } = await supabase
        .from('question_bank_questions')
        .update(payload)
        .eq('id', id);

    if (error) {
        console.error('Soru guncellenemedi:', error);
        return false;
    }

    return true;
}

export async function deleteQuestion(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
        return false;
    }

    const { error } = await supabase
        .from('question_bank_questions')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Soru silinemedi:', error);
        return false;
    }

    return true;
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
        if (byBloomLevel[q.bloomLevel] !== undefined) {
            byBloomLevel[q.bloomLevel] += 1;
        }
        if (byDifficulty[q.difficulty] !== undefined) {
            byDifficulty[q.difficulty] += 1;
        }
        if (byType[q.type] !== undefined) {
            byType[q.type] += 1;
        }

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
