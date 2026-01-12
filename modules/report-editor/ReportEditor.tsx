import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    Save,
    FileText,
    Trash2,
    Eye,
    Download,
    Settings,
    ChevronLeft,
    Layout,
    Plus,
    Check,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ComponentPalette } from './ComponentPalette';
import { ReportCanvas } from './ReportCanvas';
import { ReportComponent, ReportTemplate, ReportComponentType, ReportOptions, DEFAULT_REPORT_OPTIONS } from './types';
import { reportService } from './reportService';
import { analysisHistoryService } from '../../services/supabaseHistoryService';
import { SavedAnalysis } from '../../types';
import { useToast } from '../notifications';

interface ReportEditorProps {
    exportCanvasId?: string;
}

/**
 * Rapor Bileşen Seçici Toggle UI Bileşeni
 */
const ReportOptionsPanel: React.FC<{
    options: ReportOptions;
    onChange: (key: keyof ReportOptions, value: boolean) => void;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ options, onChange, isOpen, onToggle }) => {
    const optionGroups = [
        {
            title: '📊 Grafikler',
            items: [
                { key: 'includeBarChart' as keyof ReportOptions, label: 'Sütun Grafik' },
                { key: 'includePieChart' as keyof ReportOptions, label: 'Pasta Grafik' },
                { key: 'includeRadarChart' as keyof ReportOptions, label: 'Radar Grafik' },
            ]
        },
        {
            title: '📋 Tablolar',
            items: [
                { key: 'includeStudentTable' as keyof ReportOptions, label: 'Öğrenci Listesi' },
                { key: 'includeOutcomeTable' as keyof ReportOptions, label: 'Kazanım Tablosu' },
            ]
        },
        {
            title: '🔬 Analizler',
            items: [
                { key: 'includeBloomAnalysis' as keyof ReportOptions, label: 'Bloom Taksonomisi' },
                { key: 'includePsychometric' as keyof ReportOptions, label: 'Psikometrik Analiz' },
                { key: 'includeRiskAnalysis' as keyof ReportOptions, label: 'Risk Analizi' },
            ]
        },
        {
            title: '📝 Diğer',
            items: [
                { key: 'includeSummaryStats' as keyof ReportOptions, label: 'Özet İstatistikler' },
                { key: 'includeAIRecommendations' as keyof ReportOptions, label: 'AI Önerileri' },
                { key: 'includeHeader' as keyof ReportOptions, label: 'Başlık Bloğu' },
                { key: 'includeSignature' as keyof ReportOptions, label: 'İmza Alanı' },
            ]
        }
    ];

    return (
        <div className="border-b border-slate-200 bg-slate-50">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Rapor İçeriği Seçimi</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {Object.values(options).filter(Boolean).length} / {Object.keys(options).length}
                    </span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {optionGroups.map((group) => (
                        <div key={group.title} className="bg-white rounded-lg p-3 border border-slate-200">
                            <h4 className="text-xs font-bold text-slate-500 mb-2">{group.title}</h4>
                            <div className="space-y-2">
                                {group.items.map((item) => (
                                    <label
                                        key={item.key}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={options[item.key]}
                                            onChange={(e) => onChange(item.key, e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">
                                            {item.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ReportEditor: React.FC<ReportEditorProps> = ({ exportCanvasId }) => {
    const [layout, setLayout] = useState<ReportComponent[]>([]);
    const [templateName, setTemplateName] = useState('Yeni Rapor Şablonu');
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [previewAnalysis, setPreviewAnalysis] = useState<SavedAnalysis | null>(null);
    const toast = useToast();

    // Yeni: Bileşen seçim opsiyonları
    const [componentOptions, setComponentOptions] = useState<ReportOptions>(DEFAULT_REPORT_OPTIONS);
    const [showOptionsPanel, setShowOptionsPanel] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        const loadPreviewAnalysis = async () => {
            try {
                const analyses = await analysisHistoryService.getAllAnalyses();
                if (analyses.length > 0) {
                    setPreviewAnalysis(analyses[0]);
                }
            } catch (err) {
                console.warn('Önizleme verisi getirilemedi:', err);
            }
        };

        loadPreviewAnalysis();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await reportService.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Şablonlar yüklenemedi:', err);
        }
    };

    const handleOptionChange = (key: keyof ReportOptions, value: boolean) => {
        setComponentOptions(prev => ({ ...prev, [key]: value }));
    };

    const defaultComponentSettings: Record<ReportComponentType, { width: string; height: string }> = {
        header: { width: 'full', height: 'sm' },
        summary_stats: { width: 'full', height: 'sm' },
        bar_chart: { width: 'full', height: 'lg' },
        pie_chart: { width: 'half', height: 'md' },
        radar_chart: { width: 'half', height: 'md' },
        student_table: { width: 'full', height: 'xl' },
        outcome_table: { width: 'full', height: 'lg' },
        psychometric_table: { width: 'full', height: 'lg' },
        risk_card: { width: 'half', height: 'sm' },
        ai_comment: { width: 'full', height: 'sm' },
        free_text: { width: 'full', height: 'md' },
        signature: { width: 'half', height: 'sm' },
        page_break: { width: 'full', height: 'xs' }
    };

    const handleAddComponent = useCallback((type: ReportComponentType) => {
        const newComponent: ReportComponent = {
            id: uuidv4(),
            type,
            title: '',
            settings: defaultComponentSettings[type] || { width: 'full', height: 'md' },
            order: layout.length
        };
        setLayout(prev => [...prev, newComponent]);
    }, [layout]);

    const handleRemoveComponent = useCallback((id: string) => {
        setLayout(prev => prev.filter(c => c.id !== id));
    }, []);

    const handleMoveComponent = useCallback((dragIndex: number, hoverIndex: number) => {
        setLayout(prev => {
            const newLayout = [...prev];
            const dragItem = newLayout[dragIndex];
            newLayout.splice(dragIndex, 1);
            newLayout.splice(hoverIndex, 0, dragItem);
            return newLayout.map((item, idx) => ({ ...item, order: idx }));
        });
    }, []);

    const handleUpdateSettings = useCallback((id: string, settings: any) => {
        setLayout(prev => prev.map(c => c.id === id ? { ...c, settings: { ...c.settings, ...settings } } : c));
    }, []);

    const handleSave = async () => {
        if (!templateName) {
            toast.warning('Lütfen şablon adı girin');
            return;
        }
        setIsSaving(true);
        try {
            await reportService.saveTemplate({
                name: templateName,
                is_default: false,
                layout,
                settings: {
                    paperSize: 'A4',
                    orientation: 'portrait',
                    margins: { top: 20, bottom: 20, left: 20, right: 20 },
                    fontFamily: 'Inter',
                    primaryColor: '#4f46e5'
                },
                // Yeni: Bileşen opsiyonlarını da kaydet
                componentOptions
            });
            toast.success('Şablon başarıyla kaydedildi');
            loadTemplates();
        } catch (err: any) {
            toast.error('Hata: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const loadTemplate = (template: ReportTemplate) => {
        setLayout(Array.isArray(template.layout) ? template.layout : []);
        setTemplateName(template.name);
        // Yeni: Bileşen opsiyonlarını da yükle
        if (template.componentOptions) {
            setComponentOptions(template.componentOptions);
        }
        setShowTemplates(false);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                {/* Toolbar */}
                <div className="min-h-16 border-b border-slate-200 bg-white px-4 py-2 flex flex-wrap items-center justify-between gap-4 z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="text-lg font-bold text-slate-800 border-none focus:ring-0 p-0 w-full min-w-[150px]"
                            placeholder="Şablon Adı..."
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            <Layout className="w-4 h-4" />
                            <span className="hidden sm:inline">Şablonlarım</span>
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                        <button
                            onClick={() => setIsPreview((prev) => !prev)}
                            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            {isPreview ? <Check className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isPreview ? 'Düzenle' : 'Önizle'}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-all text-sm font-bold shadow-md hover:shadow-indigo-500/30 disabled:opacity-50 whitespace-nowrap"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Kaydet
                        </button>
                    </div>
                </div>

                {/* Yeni: Rapor Bileşen Seçici Panel */}
                <ReportOptionsPanel
                    options={componentOptions}
                    onChange={handleOptionChange}
                    isOpen={showOptionsPanel}
                    onToggle={() => setShowOptionsPanel(!showOptionsPanel)}
                />

                <div className="flex flex-1 overflow-hidden relative">
                    {/* Templates Overlay */}
                    {showTemplates && (
                        <div className="absolute inset-0 z-20 bg-slate-900/10 backdrop-blur-sm flex justify-end">
                            <div className="w-80 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">Kayıtlı Şablonlar</h3>
                                    <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-slate-100 rounded">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2">
                                    {templates.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 text-sm">
                                            Henüz şablon kaydedilmemiş.
                                        </div>
                                    ) : (
                                        templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => loadTemplate(t)}
                                                className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg transition-colors group mb-1 border border-transparent hover:border-indigo-100"
                                            >
                                                <div className="font-medium text-slate-700">{t.name}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">
                                                    {(Array.isArray(t.layout) ? t.layout.length : 0)} bileşen • {new Date(t.updated_at!).toLocaleDateString('tr-TR')}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!isPreview && <ComponentPalette />}

                    <ReportCanvas
                        exportId={exportCanvasId}
                        layout={layout}
                        isPreview={isPreview}
                        previewAnalysis={previewAnalysis}
                        onAddComponent={handleAddComponent}
                        onRemoveComponent={handleRemoveComponent}
                        onMoveComponent={handleMoveComponent}
                        onUpdateSettings={handleUpdateSettings}
                    />
                </div>
            </div>
        </DndProvider>
    );
};
