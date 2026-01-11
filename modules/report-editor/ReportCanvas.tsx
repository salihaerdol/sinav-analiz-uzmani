import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Trash2, GripVertical, Settings2 } from 'lucide-react';
import { ReportComponent, DRAGGABLE_ITEM_TYPE, AVAILABLE_COMPONENTS, ReportComponentType } from './types';
import { SavedAnalysis } from '../../types';

const WIDTH_OPTIONS = [
    { value: 'full', label: 'Tam' },
    { value: 'half', label: 'Yarım' },
    { value: 'third', label: '1/3' }
];

const HEIGHT_OPTIONS = [
    { value: 'xs', label: 'XS' },
    { value: 'sm', label: 'S' },
    { value: 'md', label: 'M' },
    { value: 'lg', label: 'L' },
    { value: 'xl', label: 'XL' }
];

const WIDTH_CLASSES: Record<string, string> = {
    full: 'col-span-12',
    half: 'col-span-6',
    third: 'col-span-4'
};

const HEIGHT_CLASSES: Record<string, string> = {
    xs: 'h-16',
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
    xl: 'h-64'
};

const getComponentLabel = (type: ReportComponentType) =>
    AVAILABLE_COMPONENTS.find((item) => item.type === type)?.label || type;

type ReportPreviewData = {
    className: string;
    subject: string;
    schoolName: string;
    teacherName: string;
    date: string;
    examType: string;
    classAverage: number;
    studentCount: number;
    questionCount: number;
    passRate: number;
    highestScore: number;
    lowestScore: number;
    outcomes: { name: string; success: number }[];
    students: { name: string; score: number; status: 'passed' | 'failed' }[];
    riskStudents: { name: string; risk: 'high' | 'medium'; score: number }[];
    aiComment: string;
};

// ═══════════════════════════════════════════════════════════════
// DEMO VERİLER - Önizleme için gerçekçi örnek veriler
// ═══════════════════════════════════════════════════════════════
const DEMO_DATA: ReportPreviewData = {
    className: '5-A',
    subject: 'Matematik',
    schoolName: 'Örnek Ortaokulu',
    teacherName: 'Mehmet Öğretmen',
    date: '2026-01-11',
    examType: '1. Yazılı',
    classAverage: 72.5,
    studentCount: 28,
    questionCount: 10,
    passRate: 82,
    highestScore: 95,
    lowestScore: 35,
    outcomes: [
        { name: 'Doğal Sayıları Toplama', success: 85 },
        { name: 'Kesirlerle İşlemler', success: 68 },
        { name: 'Geometrik Şekiller', success: 75 },
        { name: 'Ondalık Kesirler', success: 62 },
    ],
    students: [
        { name: 'Ali Yılmaz', score: 95, status: 'passed' },
        { name: 'Ayşe Kaya', score: 88, status: 'passed' },
        { name: 'Mehmet Demir', score: 72, status: 'passed' },
        { name: 'Zeynep Ak', score: 45, status: 'failed' },
    ],
    riskStudents: [
        { name: 'Zeynep Ak', risk: 'high', score: 45 },
        { name: 'Emre Çelik', risk: 'medium', score: 52 },
    ],
    aiComment: 'Sınıf genel olarak başarılı performans göstermiştir. Kesirlerle işlemler konusunda ek çalışma yapılması önerilir. Risk altındaki 2 öğrenci için bireysel destek programı oluşturulmalıdır.'
};

/**
 * Zengin önizleme içeriği - Demo verilerle gerçekçi görünüm
 */
const buildPreviewData = (analysis?: SavedAnalysis | null): ReportPreviewData => {
    if (!analysis) {
        return DEMO_DATA;
    }

    const metadata = analysis.metadata || ({} as SavedAnalysis['metadata']);
    const questions = analysis.questions || [];
    const students = analysis.students || [];

    const totalMaxScore = questions.reduce((sum, question) => sum + (Number(question.maxScore) || 0), 0);
    const scoredStudents = students.map((student) => {
        const total = Object.values(student.scores || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
        const percentage = totalMaxScore > 0 ? (total / totalMaxScore) * 100 : 0;
        return { name: student.name, total, percentage };
    });

    const computedAverage = scoredStudents.length > 0
        ? scoredStudents.reduce((sum, item) => sum + item.percentage, 0) / scoredStudents.length
        : 0;
    const classAverage = Number.isFinite(analysis.analysis?.classAverage)
        ? analysis.analysis.classAverage
        : computedAverage;

    const passCount = scoredStudents.filter((item) => item.percentage >= 50).length;
    const passRate = scoredStudents.length > 0
        ? Math.round((passCount / scoredStudents.length) * 100)
        : 0;

    const sortedByScore = [...scoredStudents].sort((a, b) => b.total - a.total);
    const highestScore = sortedByScore.length > 0 ? Math.round(sortedByScore[0].total) : 0;
    const lowestScore = sortedByScore.length > 0 ? Math.round(sortedByScore[sortedByScore.length - 1].total) : 0;

    const previewStudents = sortedByScore.slice(0, 4).map((student) => ({
        name: student.name,
        score: Math.round(student.total),
        status: student.percentage >= 50 ? 'passed' : 'failed'
    }));

    const riskStudents = [...scoredStudents]
        .sort((a, b) => a.percentage - b.percentage)
        .slice(0, 2)
        .map((student) => ({
            name: student.name,
            risk: student.percentage < 50 ? 'high' : 'medium',
            score: Math.round(student.percentage)
        }));

    const outcomes = (analysis.analysis?.outcomeStats || []).slice(0, 4).map((item) => ({
        name: item.description,
        success: Math.round(item.successRate)
    }));

    const examType = metadata.examType
        ? (metadata.examNumber ? `${metadata.examNumber}. ${metadata.examType}` : metadata.examType)
        : '';
    const rawDate = metadata.date || analysis.createdAt || '';
    const date = rawDate ? rawDate.split('T')[0] : '';

    return {
        className: metadata.className || DEMO_DATA.className,
        subject: metadata.subject || DEMO_DATA.subject,
        schoolName: metadata.schoolName || DEMO_DATA.schoolName,
        teacherName: metadata.teacherName || DEMO_DATA.teacherName,
        date: date || DEMO_DATA.date,
        examType: examType || DEMO_DATA.examType,
        classAverage: Number.isFinite(classAverage) ? Number(classAverage.toFixed(1)) : DEMO_DATA.classAverage,
        studentCount: students.length || DEMO_DATA.studentCount,
        questionCount: questions.length || DEMO_DATA.questionCount,
        passRate: Number.isFinite(passRate) ? passRate : DEMO_DATA.passRate,
        highestScore,
        lowestScore,
        outcomes: outcomes.length > 0 ? outcomes : DEMO_DATA.outcomes,
        students: previewStudents.length > 0 ? previewStudents : DEMO_DATA.students,
        riskStudents: riskStudents.length > 0 ? riskStudents : DEMO_DATA.riskStudents,
        aiComment: analysis.aiSummary || DEMO_DATA.aiComment
    };
};

const renderPreviewContent = (type: ReportComponentType, preview: ReportPreviewData) => {
    switch (type) {
        case 'header':
            return (
                <div className="space-y-2">
                    <div className="text-lg font-bold text-slate-800">📊 Sınav Analiz Raporu</div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                        <span className="px-2 py-0.5 bg-indigo-50 rounded">{preview.schoolName}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 rounded">{preview.className}</span>
                        <span className="px-2 py-0.5 bg-amber-50 rounded">{preview.subject}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded">{preview.date}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                        Öğretmen: {preview.teacherName} | {preview.examType}
                    </div>
                </div>
            );
        case 'summary_stats':
            return (
                <div className="grid grid-cols-3 gap-3 h-full">
                    <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-3">
                        <div className="text-[10px] text-indigo-600 font-medium">SINIF ORT.</div>
                        <div className="text-xl font-bold text-indigo-700">%{preview.classAverage}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-3">
                        <div className="text-[10px] text-emerald-600 font-medium">ÖĞRENCİ</div>
                        <div className="text-xl font-bold text-emerald-700">{preview.studentCount}</div>
                    </div>
                    <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3">
                        <div className="text-[10px] text-amber-600 font-medium">BAŞARI</div>
                        <div className="text-xl font-bold text-amber-700">%{preview.passRate}</div>
                    </div>
                </div>
            );
        case 'bar_chart':
            return (
                <div className="h-full flex flex-col">
                    <div className="text-xs font-medium text-slate-600 mb-2">Kazanım Başarı Grafiği</div>
                    <div className="flex-1 flex items-end gap-2">
                        {preview.outcomes.map((o, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className={`w-full rounded-t-sm transition-all ${o.success >= 70 ? 'bg-emerald-400' : o.success >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                    style={{ height: `${o.success}%` }}
                                />
                                <div className="text-[8px] text-slate-500 mt-1 truncate w-full text-center">
                                    {o.name.split(' ')[0]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'pie_chart':
            return (
                <div className="h-full flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-conic from-emerald-400 via-amber-400 to-rose-400 relative">
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-700">%{preview.passRate}</span>
                        </div>
                    </div>
                    <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                            <span>Geçen: {Math.round(preview.studentCount * preview.passRate / 100)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-rose-400 rounded-sm"></div>
                            <span>Kalan: {Math.round(preview.studentCount * (100 - preview.passRate) / 100)}</span>
                        </div>
                    </div>
                </div>
            );
        case 'radar_chart':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-3 border border-slate-100 rounded-full"></div>
                        <div className="absolute inset-6 border border-slate-50 rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                            Kazanım Radar
                        </div>
                    </div>
                </div>
            );
        case 'student_table':
            return (
                <div className="space-y-2 overflow-hidden">
                    <div className="text-xs font-medium text-slate-600">Öğrenci Listesi (İlk 4)</div>
                    <table className="w-full text-[10px]">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="px-2 py-1 text-left">#</th>
                                <th className="px-2 py-1 text-left">Ad Soyad</th>
                                <th className="px-2 py-1 text-center">Puan</th>
                                <th className="px-2 py-1 text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.students.map((s, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-2 py-1">{i + 1}</td>
                                    <td className="px-2 py-1">{s.name}</td>
                                    <td className="px-2 py-1 text-center font-medium">{s.score}</td>
                                    <td className="px-2 py-1 text-center">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] ${s.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {s.status === 'passed' ? 'GEÇTİ' : 'KALDI'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'outcome_table':
            return (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600">Kazanım Tablosu</div>
                    <div className="space-y-1.5">
                        {preview.outcomes.map((o, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="flex-1 text-[10px] text-slate-600 truncate">{o.name}</div>
                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${o.success >= 70 ? 'bg-emerald-400' : o.success >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                        style={{ width: `${o.success}%` }}
                                    />
                                </div>
                                <div className="text-[10px] font-medium w-8 text-right">%{o.success}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'psychometric_table':
            return (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600">Psikometrik Analiz</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="text-slate-500">Güvenilirlik (α)</span>
                            <div className="font-bold text-slate-700">0.82</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="text-slate-500">Ortalama</span>
                            <div className="font-bold text-slate-700">{preview.classAverage}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="text-slate-500">Std. Sapma</span>
                            <div className="font-bold text-slate-700">12.5</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded">
                            <span className="text-slate-500">Ayırt Edicilik</span>
                            <div className="font-bold text-slate-700">0.45</div>
                        </div>
                    </div>
                </div>
            );
        case 'risk_card':
            return (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600">⚠️ Risk Altındaki Öğrenciler</div>
                    <div className="space-y-1.5">
                        {preview.riskStudents.map((s, i) => (
                            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded text-[10px] ${s.risk === 'high' ? 'bg-rose-50 border border-rose-200' : 'bg-amber-50 border border-amber-200'}`}>
                                <span className={s.risk === 'high' ? 'text-rose-700' : 'text-amber-700'}>{s.name}</span>
                                <span className="font-medium">{s.score} puan</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'ai_comment':
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                        <span>🤖</span> AI Değerlendirmesi
                    </div>
                    <div className="text-[10px] text-slate-600 leading-relaxed bg-indigo-50 p-2 rounded border border-indigo-100">
                        {preview.aiComment}
                    </div>
                </div>
            );
        case 'free_text':
            return (
                <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600">📝 Öğretmen Notları</div>
                    <div className="text-[10px] text-slate-500 italic">
                        Bu alana öğretmen kendi notlarını ekleyebilir...
                    </div>
                </div>
            );
        case 'signature':
            return (
                <div className="flex items-end justify-between h-full text-[10px] text-slate-500">
                    <div className="text-center">
                        <div className="w-24 border-t border-slate-300 pt-1">Öğretmen</div>
                        <div className="text-[8px] text-slate-400">{preview.teacherName}</div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 border-t border-slate-300 pt-1">Müdür Onayı</div>
                        <div className="text-[8px] text-slate-400">Tarih: {preview.date}</div>
                    </div>
                </div>
            );
        case 'page_break':
            return (
                <div className="w-full flex items-center gap-3 text-[10px] text-slate-400">
                    <div className="flex-1 h-px border-t border-dashed border-slate-300"></div>
                    ✂️ SAYFA SONU
                    <div className="flex-1 h-px border-t border-dashed border-slate-300"></div>
                </div>
            );
        default:
            return <div className="text-xs text-slate-400">Bileşen önizlemesi</div>;
    }
};


interface DraggableComponentProps {
    component: ReportComponent;
    index: number;
    onRemove: (id: string) => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    onUpdateSettings: (id: string, settings: any) => void;
    isPreview: boolean;
    previewData: ReportPreviewData;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
    component,
    index,
    onRemove,
    onMove,
    onUpdateSettings,
    isPreview,
    previewData
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = React.useState(false);

    const [{ isDragging }, drag] = useDrag({
        type: 'SORTABLE_COMPONENT',
        item: { index },
        canDrag: !isPreview,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'SORTABLE_COMPONENT',
        canDrop: () => !isPreview,
        hover(item: { index: number }, monitor) {
            if (isPreview) return;
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    const widthValue = component.settings?.width || 'full';
    const heightValue = component.settings?.height || 'md';
    const widthClass = WIDTH_CLASSES[widthValue] || WIDTH_CLASSES.full;
    const heightClass = HEIGHT_CLASSES[heightValue] || HEIGHT_CLASSES.md;
    const label = component.title || getComponentLabel(component.type);

    const updateSetting = (field: string, value: string) => {
        onUpdateSettings(component.id, { [field]: value });
    };

    return (
        <div
            ref={ref}
            className={`
        ${widthClass}
        group relative rounded-xl p-4 transition-all
        ${isDragging ? 'opacity-0' : 'opacity-100'}
        ${isPreview ? 'bg-white border border-slate-200 shadow-sm' : 'bg-white border-2 border-dashed hover:border-indigo-300 hover:shadow-md border-slate-200'}
      `}
        >
            {!isPreview && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <div className="p-1 bg-white border border-slate-200 rounded shadow-sm cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {component.type}
                    </span>
                    <h4 className="font-bold text-slate-700">{label}</h4>
                </div>
                {!isPreview && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setShowSettings((prev) => !prev)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onRemove(component.id)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {!isPreview && showSettings && (
                <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Genişlik</span>
                            <select
                                value={widthValue}
                                onChange={(event) => updateSetting('width', event.target.value)}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                            >
                                {WIDTH_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Yükseklik</span>
                            <select
                                value={heightValue}
                                onChange={(event) => updateSetting('height', event.target.value)}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                            >
                                {HEIGHT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            )}

            <div className={`${heightClass} flex ${isPreview ? 'items-start justify-start' : 'items-center justify-center'} bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-xs italic px-3`}>
                {isPreview ? (
                    <div className="w-full h-full text-left text-slate-600 not-italic">
                        {renderPreviewContent(component.type, previewData)}
                    </div>
                ) : (
                    component.type === 'page_break' ? (
                        <div className="w-full flex items-center gap-4 px-4">
                            <div className="flex-1 h-px bg-slate-200 border-t border-dashed"></div>
                            <span>SAYFA SONU</span>
                            <div className="flex-1 h-px bg-slate-200 border-t border-dashed"></div>
                        </div>
                    ) : (
                        `[ ${component.type} Bileşeni Önizlemesi ]`
                    )
                )}
            </div>
        </div>
    );
};

interface ReportCanvasProps {
    exportId?: string;
    layout: ReportComponent[];
    isPreview?: boolean;
    previewAnalysis?: SavedAnalysis | null;
    onAddComponent: (type: any) => void;
    onRemoveComponent: (id: string) => void;
    onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
    onUpdateSettings: (id: string, settings: any) => void;
}

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
    exportId,
    layout,
    isPreview = false,
    previewAnalysis = null,
    onAddComponent,
    onRemoveComponent,
    onMoveComponent,
    onUpdateSettings
}) => {
    const previewData = React.useMemo(() => buildPreviewData(previewAnalysis), [previewAnalysis]);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: DRAGGABLE_ITEM_TYPE,
        canDrop: () => !isPreview,
        drop: (item: { type: any }) => {
            if (!isPreview) {
                onAddComponent(item.type);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver() && !isPreview,
        }),
    }));

    return (
        <div
            id={exportId}
            ref={drop}
            className={`
        flex-1 p-8 overflow-auto bg-slate-100 min-h-full transition-colors
        ${isOver ? 'bg-indigo-50/50' : ''}
      `}
        >
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-[20mm] rounded-sm relative">
                {/* Paper Header Simulation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>

                {layout.length === 0 ? (
                    <div className="h-[200mm] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-3xl">
                        <div className="p-6 bg-slate-50 rounded-full mb-4">
                            <GripVertical className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400">Raporunuz Boş</h3>
                        <p className="text-slate-300 mt-2">Soldaki bileşenleri buraya sürükleyip bırakın</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4 auto-rows-min">
                        {layout.map((comp, index) => (
                            <DraggableComponent
                                key={comp.id}
                                index={index}
                                component={comp}
                                onRemove={onRemoveComponent}
                                onMove={onMoveComponent}
                                onUpdateSettings={onUpdateSettings}
                                isPreview={isPreview}
                                previewData={previewData}
                            />
                        ))}
                    </div>
                )}

                {/* Drop Indicator */}
                {isOver && (
                    <div className="mt-4 p-8 border-4 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 flex items-center justify-center">
                        <span className="text-indigo-400 font-bold">Buraya Bırakın</span>
                    </div>
                )}
            </div>
        </div>
    );
};

