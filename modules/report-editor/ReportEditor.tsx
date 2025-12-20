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
    Check
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ComponentPalette } from './ComponentPalette';
import { ReportCanvas } from './ReportCanvas';
import { ReportComponent, ReportTemplate, ReportComponentType } from './types';
import { reportService } from './reportService';

interface ReportEditorProps {
    exportCanvasId?: string;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ exportCanvasId }) => {
    const [layout, setLayout] = useState<ReportComponent[]>([]);
    const [templateName, setTemplateName] = useState('Yeni Rapor Şablonu');
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await reportService.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Şablonlar yüklenemedi:', err);
        }
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
            alert('Lütfen şablon adı girin');
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
                }
            });
            alert('Şablon başarıyla kaydedildi');
            loadTemplates();
        } catch (err: any) {
            alert('Hata: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const loadTemplate = (template: ReportTemplate) => {
        setLayout(Array.isArray(template.layout) ? template.layout : []);
        setTemplateName(template.name);
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
