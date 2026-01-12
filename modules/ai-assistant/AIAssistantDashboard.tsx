// =====================================================
// MODÜL: AI ASSISTANT - DASHBOARD BİLEŞENİ
// =====================================================

import React, { useState, useMemo } from 'react';
import {
    Sparkles,
    Send,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    RotateCcw,
    Settings2,
    Wand2,
    BookOpen,
    Target,
    Users,
    TrendingUp,
    FileText,
    Lightbulb,
    Clock,
    Star,
    Filter
} from 'lucide-react';
import {
    AIPromptPreset,
    AICustomRequest,
    AITone,
    AIOutputFormat,
    AI_TONES,
    AI_OUTPUT_FORMATS,
    AI_TARGET_AUDIENCES,
    DEFAULT_CUSTOM_REQUEST
} from './types';
import { AI_PROMPT_PRESETS, AI_FOCUS_AREAS, AI_CATEGORIES } from './presets';
import { generateAdvancedAIAnalysis } from './aiService';
import { AnalysisResult, ExamMetadata, Student, QuestionConfig } from '../../types';
import { useToast } from '../notifications';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

/**
 * Preset Kartı
 */
const PresetCard: React.FC<{
    preset: AIPromptPreset;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ preset, isSelected, onSelect }) => {
    const categoryInfo = AI_CATEGORIES[preset.category as keyof typeof AI_CATEGORIES];

    return (
        <button
            onClick={onSelect}
            className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                }
            `}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{preset.icon}</span>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{preset.name}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{preset.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${categoryInfo?.color || 'slate'}-100 text-${categoryInfo?.color || 'slate'}-700`}>
                            {categoryInfo?.label || preset.category}
                        </span>
                    </div>
                </div>
                {isSelected && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
        </button>
    );
};

/**
 * Kategori Sekmesi
 */
const CategoryTab: React.FC<{
    category: string;
    label: string;
    icon: string;
    isActive: boolean;
    count: number;
    onClick: () => void;
}> = ({ label, icon, isActive, count, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
            ${isActive
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
        `}
    >
        <span>{icon}</span>
        <span>{label}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-200'}`}>
            {count}
        </span>
    </button>
);

/**
 * Odak Alanı Chip
 */
const FocusAreaChip: React.FC<{
    area: typeof AI_FOCUS_AREAS[0];
    isSelected: boolean;
    onToggle: () => void;
}> = ({ area, isSelected, onToggle }) => (
    <button
        onClick={onToggle}
        className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
            ${isSelected
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:border-slate-200'
            }
        `}
    >
        <span>{area.icon}</span>
        <span>{area.label}</span>
    </button>
);

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD
// ═══════════════════════════════════════════════════════════════

interface AIAssistantDashboardProps {
    analysis: AnalysisResult;
    metadata: ExamMetadata;
    students: Student[];
    questions: QuestionConfig[];
    onResponseGenerated?: (response: string) => void;
}

export const AIAssistantDashboard: React.FC<AIAssistantDashboardProps> = ({
    analysis,
    metadata,
    students,
    questions,
    onResponseGenerated
}) => {
    const toast = useToast();

    // State
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedPreset, setSelectedPreset] = useState<AIPromptPreset | null>(null);
    const [customRequest, setCustomRequest] = useState<AICustomRequest>(DEFAULT_CUSTOM_REQUEST);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Kategorilere göre grupla
    const categories = useMemo(() => {
        const cats = [
            { key: 'all', label: 'Tümü', icon: '📋', count: AI_PROMPT_PRESETS.length },
            ...Object.entries(AI_CATEGORIES).map(([key, info]) => ({
                key,
                label: info.label,
                icon: info.icon,
                count: AI_PROMPT_PRESETS.filter(p => p.category === key).length
            }))
        ];
        return cats.filter(c => c.count > 0 || c.key === 'all');
    }, []);

    // Filtrelenmiş preset'ler
    const filteredPresets = useMemo(() => {
        if (activeCategory === 'all') return AI_PROMPT_PRESETS;
        return AI_PROMPT_PRESETS.filter(p => p.category === activeCategory);
    }, [activeCategory]);

    // Odak alanı toggle
    const toggleFocusArea = (areaId: string) => {
        setCustomRequest(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(areaId)
                ? prev.focusAreas.filter(id => id !== areaId)
                : [...prev.focusAreas, areaId]
        }));
    };

    // Analiz oluştur
    const handleGenerate = async () => {
        if (!selectedPreset && !customRequest.customPrompt.trim()) {
            toast.warning('Lütfen bir şablon seçin veya özel istek yazın.');
            return;
        }

        setIsLoading(true);
        setResponse(null);

        try {
            const result = await generateAdvancedAIAnalysis(
                analysis,
                metadata,
                students,
                questions,
                {
                    presetId: selectedPreset?.id,
                    customRequest
                }
            );

            setResponse(result.response);

            if (result.success) {
                toast.success('AI analizi başarıyla oluşturuldu!');
                onResponseGenerated?.(result.response);
            }
        } catch (error) {
            toast.error('Analiz oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    // Kopyala
    const handleCopy = async () => {
        if (response) {
            await navigator.clipboard.writeText(response);
            setCopied(true);
            toast.success('Panoya kopyalandı!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Sıfırla
    const handleReset = () => {
        setSelectedPreset(null);
        setCustomRequest(DEFAULT_CUSTOM_REQUEST);
        setResponse(null);
        setShowAdvancedOptions(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">AI Asistan</h2>
                        <p className="text-sm text-slate-500">Akıllı analiz ve öneriler</p>
                    </div>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">Sıfırla</span>
                </button>
            </div>

            {/* Sınav Bilgisi */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">{metadata.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>{students.length} öğrenci</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span>Ortalama: %{analysis.classAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span>{questions.length} soru</span>
                    </div>
                </div>
            </div>

            {/* Kategori Sekmeleri */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <CategoryTab
                        key={cat.key}
                        category={cat.key}
                        label={cat.label}
                        icon={cat.icon}
                        isActive={activeCategory === cat.key}
                        count={cat.count}
                        onClick={() => setActiveCategory(cat.key)}
                    />
                ))}
            </div>

            {/* Preset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresets.map(preset => (
                    <PresetCard
                        key={preset.id}
                        preset={preset}
                        isSelected={selectedPreset?.id === preset.id}
                        onSelect={() => setSelectedPreset(
                            selectedPreset?.id === preset.id ? null : preset
                        )}
                    />
                ))}
            </div>

            {/* Özel İstek Alanı */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-medium text-slate-700">
                        <Wand2 className="w-4 h-4 text-indigo-600" />
                        Özel İstek (Opsiyonel)
                    </label>
                    <span className="text-xs text-slate-400">
                        Şablona ek olarak özel isteklerinizi yazabilirsiniz
                    </span>
                </div>
                <textarea
                    value={customRequest.customPrompt}
                    onChange={(e) => setCustomRequest(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="Örn: Özellikle matematik alt kazanımlarına odaklan, velilere gönderilebilecek bir özet de ekle..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
            </div>

            {/* Odak Alanları */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-slate-700">Odak Alanları</span>
                    <span className="text-xs text-slate-400">(Birden fazla seçebilirsiniz)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {AI_FOCUS_AREAS.map(area => (
                        <FocusAreaChip
                            key={area.id}
                            area={area}
                            isSelected={customRequest.focusAreas.includes(area.id)}
                            onToggle={() => toggleFocusArea(area.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Gelişmiş Seçenekler */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-700">Gelişmiş Seçenekler</span>
                    </div>
                    {showAdvancedOptions ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </button>

                {showAdvancedOptions && (
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Hedef Kitle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Hedef Kitle
                                </label>
                                <select
                                    value={customRequest.targetAudience}
                                    onChange={(e) => setCustomRequest(prev => ({
                                        ...prev,
                                        targetAudience: e.target.value as AICustomRequest['targetAudience']
                                    }))}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    {AI_TARGET_AUDIENCES.map(a => (
                                        <option key={a.value} value={a.value}>
                                            {a.icon} {a.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ton */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Yazım Tonu
                                </label>
                                <select
                                    value={customRequest.tone}
                                    onChange={(e) => setCustomRequest(prev => ({
                                        ...prev,
                                        tone: e.target.value as AITone
                                    }))}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    {AI_TONES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Format */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Çıktı Formatı
                                </label>
                                <select
                                    value={customRequest.outputFormat}
                                    onChange={(e) => setCustomRequest(prev => ({
                                        ...prev,
                                        outputFormat: e.target.value as AIOutputFormat
                                    }))}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    {AI_OUTPUT_FORMATS.map(f => (
                                        <option key={f.value} value={f.value}>
                                            {f.icon} {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ek Seçenekler */}
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={customRequest.includeStudentNames}
                                    onChange={(e) => setCustomRequest(prev => ({
                                        ...prev,
                                        includeStudentNames: e.target.checked
                                    }))}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm text-slate-700">Öğrenci isimlerini dahil et</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={customRequest.includeActionPlan}
                                    onChange={(e) => setCustomRequest(prev => ({
                                        ...prev,
                                        includeActionPlan: e.target.checked
                                    }))}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm text-slate-700">Eylem planı ekle</span>
                            </label>
                        </div>

                        {/* Ek Bağlam */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Ek Bağlam Bilgisi (Opsiyonel)
                            </label>
                            <textarea
                                value={customRequest.additionalContext || ''}
                                onChange={(e) => setCustomRequest(prev => ({
                                    ...prev,
                                    additionalContext: e.target.value
                                }))}
                                placeholder="Örn: Bu sınıf geçen dönem düşük performans gösterdi, bu dönem iyileşme bekleniyor..."
                                className="w-full h-20 p-3 border border-slate-200 rounded-lg text-sm resize-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Oluştur Butonu */}
            <button
                onClick={handleGenerate}
                disabled={isLoading || (!selectedPreset && !customRequest.customPrompt.trim())}
                className={`
                    w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all
                    ${isLoading || (!selectedPreset && !customRequest.customPrompt.trim())
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-0.5'
                    }
                `}
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>AI Analiz Oluşturuluyor...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        <span>AI Analizi Oluştur</span>
                        <Send className="w-5 h-5" />
                    </>
                )}
            </button>

            {/* Sonuç Alanı */}
            {response && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <span className="font-bold text-slate-800">AI Analiz Sonucu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Kopyalandı!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Kopyala</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="p-6 prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                            {response}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistantDashboard;
