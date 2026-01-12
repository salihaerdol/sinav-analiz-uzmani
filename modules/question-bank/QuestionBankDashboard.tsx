// =====================================================
// MODÜL: SORU BANKASI - DASHBOARD BİLEŞENİ
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Search, Filter, Plus, BookOpen, FileText, BarChart2,
    Tag, CheckCircle, Eye, Edit, Trash2, Copy, Download
} from 'lucide-react';
import {
    Question,
    QuestionBankFilter,
    DifficultyLevel,
    Topic,
    LearningOutcome,
    QuestionFormData,
    QuestionOption,
    QuestionType
} from './types';
import { BloomLevel } from '../international-benchmark/types';
import { useToast } from '../notifications';
import {
    fetchQuestionBankData,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    filterQuestions,
    calculateQuestionBankStats,
    getDifficultyLabel,
    getDifficultyColor,
    getQuestionTypeLabel,
    getBloomColor
} from './questionBankService';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

const DEFAULT_OPTIONS = (): QuestionOption[] => ([
    { id: 'a', text: '', isCorrect: true },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false }
]);

const createEmptyFormData = (subject?: string, grade?: number): QuestionFormData => ({
    text: '',
    type: 'multiple_choice',
    subject: subject || 'Matematik',
    grade: grade || 5,
    options: DEFAULT_OPTIONS(),
    correctAnswer: 'a',
    explanation: '',
    topicId: '',
    outcomeCode: '',
    bloomLevel: 'Anlama',
    difficulty: 'medium',
    tags: [],
    isPublic: false
});

/**
 * İstatistik Kartı
 */
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
}> = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            <div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
            </div>
        </div>
    </div>
);

/**
 * Filtre Paneli
 */
const FilterPanel: React.FC<{
    filter: QuestionBankFilter;
    topics: Topic[];
    onFilterChange: (filter: QuestionBankFilter) => void;
}> = ({ filter, topics, onFilterChange }) => {
    const subjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce'];
    const grades = [5, 6, 7, 8];
    const difficulties: DifficultyLevel[] = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    const bloomLevels: BloomLevel[] = ['Hatırlama', 'Anlama', 'Uygulama', 'Analiz', 'Değerlendirme', 'Yaratma'];

    return (
        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-700">Filtreler</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <select
                    value={filter.subject || ''}
                    onChange={(e) => onFilterChange({ ...filter, subject: e.target.value || undefined })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="">Tüm Dersler</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    value={filter.grade || ''}
                    onChange={(e) => onFilterChange({ ...filter, grade: e.target.value ? Number(e.target.value) : undefined })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="">Tüm Sınıflar</option>
                    {grades.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                </select>

                <select
                    value={filter.difficulty || ''}
                    onChange={(e) => onFilterChange({ ...filter, difficulty: e.target.value as DifficultyLevel || undefined })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="">Tüm Zorluklar</option>
                    {difficulties.map(d => <option key={d} value={d}>{getDifficultyLabel(d)}</option>)}
                </select>

                <select
                    value={filter.bloomLevel || ''}
                    onChange={(e) => onFilterChange({ ...filter, bloomLevel: e.target.value as BloomLevel || undefined })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="">Tüm Bloom Seviyeleri</option>
                    {bloomLevels.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select
                    value={filter.topicId || ''}
                    onChange={(e) => onFilterChange({ ...filter, topicId: e.target.value || undefined })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                    <option value="">Tüm Konular</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={filter.searchText || ''}
                        onChange={(e) => onFilterChange({ ...filter, searchText: e.target.value || undefined })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Soru Kartı
 */
const QuestionCard: React.FC<{
    question: Question;
    onView: () => void;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ question, onView, onCopy, onEdit, onDelete }) => (
    <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <div className="text-sm text-slate-800 line-clamp-2 mb-2">{question.text}</div>
                <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getBloomColor(question.bloomLevel)}`}>
                        {question.bloomLevel}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyLabel(question.difficulty)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {question.subject}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
                <span>Kullanım: {question.usageCount}</span>
                {question.averageSuccessRate !== undefined && (
                    <span>Başarı: %{question.averageSuccessRate}</span>
                )}
            </div>
            <div className="flex items-center gap-1">
                <button onClick={onView} className="p-1.5 hover:bg-slate-100 rounded">
                    <Eye className="w-4 h-4" />
                </button>
                <button onClick={onCopy} className="p-1.5 hover:bg-slate-100 rounded">
                    <Copy className="w-4 h-4" />
                </button>
                <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded">
                    <Edit className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-1.5 hover:bg-slate-100 rounded text-rose-500">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
                {question.tags.map(tag => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                        #{tag}
                    </span>
                ))}
            </div>
        )}
    </div>
);

/**
 * Soru Detay Modal
 */
const QuestionDetailModal: React.FC<{
    question: Question | null;
    onClose: () => void;
}> = ({ question, onClose }) => {
    if (!question) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Soru Detayı</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-slate-800">{question.text}</p>
                        </div>

                        {question.options && (
                            <div className="space-y-2">
                                <div className="font-medium text-slate-700">Seçenekler:</div>
                                {question.options.map((opt, i) => (
                                    <div
                                        key={opt.id}
                                        className={`p-3 rounded-lg border ${opt.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}
                                    >
                                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)})</span>
                                        {opt.text}
                                        {opt.isCorrect && <CheckCircle className="inline-block w-4 h-4 text-emerald-600 ml-2" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-slate-500">Ders:</span> {question.subject}</div>
                            <div><span className="text-slate-500">Sınıf:</span> {question.grade}. Sınıf</div>
                            <div><span className="text-slate-500">Konu:</span> {question.topicName || '-'}</div>
                            <div><span className="text-slate-500">Kazanım:</span> {question.outcomeCode || '-'}</div>
                            <div><span className="text-slate-500">Bloom:</span> {question.bloomLevel}</div>
                            <div><span className="text-slate-500">Zorluk:</span> {getDifficultyLabel(question.difficulty)}</div>
                            <div><span className="text-slate-500">Kullanım:</span> {question.usageCount} kez</div>
                            <div><span className="text-slate-500">Başarı:</span> {question.averageSuccessRate !== undefined ? `%${question.averageSuccessRate}` : '-'}</div>
                        </div>

                        {question.explanation && (
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="font-medium text-amber-800 mb-1">Açıklama:</div>
                                <p className="text-amber-700">{question.explanation}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                            Kapat
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            Sınava Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const QuestionBankDashboard: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
    const [filter, setFilter] = useState<QuestionBankFilter>({});
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [formQuestionId, setFormQuestionId] = useState<string | null>(null);
    const [formData, setFormData] = useState<QuestionFormData>(() => createEmptyFormData());
    const [formOutcomeId, setFormOutcomeId] = useState<string>('');
    const [tagsInput, setTagsInput] = useState('');
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const refreshData = async () => {
        const data = await fetchQuestionBankData();
        setQuestions(data.questions);
        setTopics(data.topics);
        setOutcomes(data.outcomes);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await refreshData();
            setLoading(false);
        };
        loadData();
    }, []);

    const handleNewQuestion = () => {
        const subject = filter.subject || 'Matematik';
        const grade = filter.grade || 5;
        const emptyForm = createEmptyFormData(subject, grade);
        setFormMode('create');
        setFormQuestionId(null);
        setFormOutcomeId('');
        setFormData(emptyForm);
        setTagsInput('');
        setIsFormOpen(true);
    };

    const buildFormFromQuestion = (question: Question): QuestionFormData => {
        const options = question.options && question.options.length > 0
            ? question.options
            : DEFAULT_OPTIONS();
        const correctId = question.correctAnswer || options.find(opt => opt.isCorrect)?.id || options[0]?.id || 'a';
        const normalizedOptions = options.map(opt => ({
            ...opt,
            isCorrect: opt.id === correctId
        }));

        return {
            text: question.text,
            type: question.type,
            subject: question.subject,
            grade: question.grade,
            options: normalizedOptions,
            correctAnswer: correctId,
            explanation: question.explanation || '',
            topicId: question.topicId || '',
            outcomeCode: question.outcomeCode || '',
            bloomLevel: question.bloomLevel,
            difficulty: question.difficulty,
            tags: question.tags || [],
            isPublic: question.isPublic
        };
    };

    const handleEditQuestion = (question: Question) => {
        const outcomeId = question.outcomeId || outcomes.find(o => o.code === question.outcomeCode)?.id || '';
        const form = buildFormFromQuestion(question);
        setFormMode('edit');
        setFormQuestionId(question.id);
        setFormData(form);
        setFormOutcomeId(outcomeId);
        setTagsInput(form.tags.join(', '));
        setIsFormOpen(true);
    };

    const handleCopyQuestion = (question: Question) => {
        const outcomeId = question.outcomeId || outcomes.find(o => o.code === question.outcomeCode)?.id || '';
        const form = buildFormFromQuestion(question);
        setFormMode('create');
        setFormQuestionId(null);
        setFormData({
            ...form,
            text: `${form.text} (Kopya)`
        });
        setFormOutcomeId(outcomeId);
        setTagsInput(form.tags.join(', '));
        setIsFormOpen(true);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Bu soruyu silmek istiyor musunuz?')) return;
        const success = await deleteQuestion(questionId);
        if (success) {
            await refreshData();
        } else {
            toast.error('Soru silinemedi.');
        }
    };

    const handleSaveQuestion = async () => {
        if (!formData.text.trim()) {
            toast.warning('Soru metni boş bırakılamaz.');
            return;
        }

        setSaving(true);
        const tags = tagsInput
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);

        let options = formData.options || [];
        let correctAnswer = formData.correctAnswer;

        if (formData.type === 'multiple_choice') {
            if (options.length === 0) {
                options = DEFAULT_OPTIONS();
            }
            const hasCorrect = options.some(opt => opt.isCorrect);
            if (!hasCorrect && options.length > 0) {
                options = options.map((opt, idx) => ({ ...opt, isCorrect: idx === 0 }));
            }
            correctAnswer = options.find(opt => opt.isCorrect)?.id || options[0]?.id || '';
        }

        const payload = {
            ...formData,
            options: formData.type === 'multiple_choice' ? options : [],
            correctAnswer,
            tags,
            outcomeCode: formData.outcomeCode || (formOutcomeId
                ? outcomes.find(o => o.id === formOutcomeId)?.code || ''
                : ''),
            outcomeId: formOutcomeId || undefined
        };

        const success = formMode === 'edit' && formQuestionId
            ? await updateQuestion(formQuestionId, payload)
            : await createQuestion(payload);

        if (success) {
            await refreshData();
            setIsFormOpen(false);
        } else {
            toast.error('Soru kaydedilemedi.');
        }
        setSaving(false);
    };

    const availableTopics = useMemo(() => {
        return topics.filter(topic =>
            (!formData.subject || topic.subjectId === formData.subject) &&
            (!formData.grade || topic.grade === formData.grade)
        );
    }, [topics, formData.subject, formData.grade]);

    const availableOutcomes = useMemo(() => {
        return outcomes.filter(outcome =>
            (!formData.subject || outcome.subject === formData.subject) &&
            (!formData.grade || outcome.grade === formData.grade) &&
            (!formData.topicId || outcome.topicId === formData.topicId)
        );
    }, [outcomes, formData.subject, formData.grade, formData.topicId]);

    const handleOptionTextChange = (optionId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            options: (prev.options?.length ? prev.options : DEFAULT_OPTIONS()).map(option =>
                option.id === optionId ? { ...option, text: value } : option
            )
        }));
    };

    const handleCorrectOptionChange = (optionId: string) => {
        setFormData(prev => ({
            ...prev,
            correctAnswer: optionId,
            options: (prev.options?.length ? prev.options : DEFAULT_OPTIONS()).map(option => ({
                ...option,
                isCorrect: option.id === optionId
            }))
        }));
    };

    const filteredQuestions = useMemo(() => {
        return filterQuestions(questions, filter);
    }, [questions, filter]);

    const stats = useMemo(() => {
        return calculateQuestionBankStats(questions);
    }, [questions]);

    const subjects = ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce'];
    const grades = [5, 6, 7, 8];
    const difficulties: DifficultyLevel[] = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    const bloomLevels: BloomLevel[] = ['Hatırlama', 'Anlama', 'Uygulama', 'Analiz', 'Değerlendirme', 'Yaratma'];
    const questionTypes: QuestionType[] = ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank'];

    const bloomChartData = useMemo(() => {
        return Object.entries(stats.byBloomLevel).map(([level, count]) => ({
            name: level,
            value: count
        }));
    }, [stats]);

    const COLORS = ['#94A3B8', '#60A5FA', '#34D399', '#FBBF24', '#F97316', '#8B5CF6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Soru Bankası</h1>
                    <p className="text-slate-500">Sorularınızı yönetin ve yeni sınavlar oluşturun</p>
                </div>
                <button
                    onClick={handleNewQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Soru
                </button>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FileText className="w-5 h-5 text-indigo-600" />}
                    label="Toplam Soru"
                    value={stats.totalQuestions}
                    color="bg-indigo-100"
                />
                <StatCard
                    icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
                    label="Ders Sayısı"
                    value={Object.keys(stats.bySubject).length}
                    color="bg-emerald-100"
                />
                <StatCard
                    icon={<Tag className="w-5 h-5 text-amber-600" />}
                    label="Son 7 Gün"
                    value={stats.recentlyAdded}
                    color="bg-amber-100"
                />
                <StatCard
                    icon={<BarChart2 className="w-5 h-5 text-violet-600" />}
                    label="Ortalama Başarı"
                    value={`%${questions.length
                        ? Math.round(questions.reduce((a, q) => a + (q.averageSuccessRate || 0), 0) / questions.length)
                        : 0}`}
                    color="bg-violet-100"
                />
            </div>

            {/* Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Bloom Dağılımı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bloomChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {bloomChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Zorluk Dağılımı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(stats.byDifficulty).map(([d, c]) => ({ name: getDifficultyLabel(d as DifficultyLevel), count: c }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filtreler */}
            <FilterPanel filter={filter} topics={topics} onFilterChange={setFilter} />

            {/* Sonuç Bilgisi */}
            <div className="flex items-center justify-between">
                <span className="text-slate-600">
                    {filteredQuestions.length} soru bulundu
                </span>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200">
                        <Download className="w-4 h-4" />
                        Dışa Aktar
                    </button>
                </div>
            </div>

            {/* Soru Listesi */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredQuestions.map(q => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        onView={() => setSelectedQuestion(q)}
                        onCopy={() => handleCopyQuestion(q)}
                        onEdit={() => handleEditQuestion(q)}
                        onDelete={() => handleDeleteQuestion(q.id)}
                    />
                ))}
            </div>

            {filteredQuestions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Arama kriterlerinize uygun soru bulunamadı</p>
                </div>
            )}

            {/* Detay Modal */}
            <QuestionDetailModal
                question={selectedQuestion}
                onClose={() => setSelectedQuestion(null)}
            />

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">
                                {formMode === 'edit' ? 'Soruyu Düzenle' : 'Yeni Soru'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Soru Metni</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                                    className="w-full h-28 border border-slate-200 rounded-lg p-3 text-sm"
                                    placeholder="Soru metnini giriniz"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ders</label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                subject: e.target.value,
                                                topicId: '',
                                                outcomeCode: ''
                                            }));
                                            setFormOutcomeId('');
                                        }}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf</label>
                                    <select
                                        value={formData.grade}
                                        onChange={(e) => {
                                            const grade = Number(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                grade,
                                                topicId: '',
                                                outcomeCode: ''
                                            }));
                                            setFormOutcomeId('');
                                        }}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        {grades.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Soru Türü</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            const nextType = e.target.value as QuestionType;
                                            setFormData(prev => ({
                                                ...prev,
                                                type: nextType,
                                                options: nextType === 'multiple_choice' && (!prev.options || prev.options.length === 0)
                                                    ? DEFAULT_OPTIONS()
                                                    : prev.options
                                            }));
                                        }}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        {questionTypes.map(type => (
                                            <option key={type} value={type}>{getQuestionTypeLabel(type)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bloom</label>
                                    <select
                                        value={formData.bloomLevel}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            bloomLevel: e.target.value as BloomLevel
                                        }))}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        {bloomLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Zorluk</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            difficulty: e.target.value as DifficultyLevel
                                        }))}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        {difficulties.map(d => <option key={d} value={d}>{getDifficultyLabel(d)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                                    <select
                                        value={formData.topicId}
                                        onChange={(e) => {
                                            const nextTopic = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                topicId: nextTopic,
                                                outcomeCode: ''
                                            }));
                                            setFormOutcomeId('');
                                        }}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        {availableTopics.map(topic => (
                                            <option key={topic.id} value={topic.id}>{topic.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kazanım</label>
                                    <select
                                        value={formOutcomeId}
                                        onChange={(e) => {
                                            const nextOutcomeId = e.target.value;
                                            const outcome = outcomes.find(item => item.id === nextOutcomeId);
                                            setFormOutcomeId(nextOutcomeId);
                                            setFormData(prev => ({
                                                ...prev,
                                                outcomeCode: outcome?.code || ''
                                            }));
                                        }}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    >
                                        <option value="">Seçiniz</option>
                                        {availableOutcomes.map(outcome => (
                                            <option key={outcome.id} value={outcome.id}>
                                                {outcome.code} - {outcome.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler</label>
                                    <input
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                        placeholder="etiket1, etiket2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                                    className="w-full h-20 border border-slate-200 rounded-lg p-3 text-sm"
                                    placeholder="Soru açıklaması (opsiyonel)"
                                />
                            </div>

                            {formData.type === 'multiple_choice' ? (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700">Seçenekler</label>
                                    {(formData.options?.length ? formData.options : DEFAULT_OPTIONS()).map(option => (
                                        <div key={option.id} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="correctOption"
                                                checked={option.isCorrect}
                                                onChange={() => handleCorrectOptionChange(option.id)}
                                            />
                                            <input
                                                value={option.text}
                                                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                                                className="flex-1 border border-slate-200 rounded-lg p-2 text-sm"
                                                placeholder={`${option.id.toUpperCase()} şıkkı`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Doğru Cevap</label>
                                    <input
                                        value={formData.correctAnswer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                                    />
                                </div>
                            )}

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                                />
                                Herkese açık olarak paylaş
                            </label>
                        </div>
                        <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                                İptal
                            </button>
                            <button
                                onClick={handleSaveQuestion}
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBankDashboard;
