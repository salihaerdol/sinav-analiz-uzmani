import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Trash2, GripVertical, Settings2 } from 'lucide-react';
import { ReportComponent, DRAGGABLE_ITEM_TYPE, AVAILABLE_COMPONENTS, ReportComponentType } from './types';

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

const renderPreviewContent = (type: ReportComponentType) => {
    switch (type) {
        case 'header':
            return (
                <div className="space-y-1">
                    <div className="text-lg font-bold text-slate-800">Sınav Analiz Raporu</div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                        <span>Okul Adı</span>
                        <span>•</span>
                        <span>Şube</span>
                        <span>•</span>
                        <span>Tarih</span>
                    </div>
                </div>
            );
        case 'summary_stats':
            return (
                <div className="grid grid-cols-3 gap-2 h-full">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] text-slate-500">
                            <div className="h-2 w-12 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-8 bg-slate-300 rounded"></div>
                        </div>
                    ))}
                </div>
            );
        case 'bar_chart':
            return (
                <div className="flex items-end gap-2 h-full">
                    <div className="w-1/6 h-1/3 bg-indigo-200 rounded-sm"></div>
                    <div className="w-1/6 h-2/3 bg-indigo-300 rounded-sm"></div>
                    <div className="w-1/6 h-1/2 bg-indigo-200 rounded-sm"></div>
                    <div className="w-1/6 h-3/4 bg-indigo-300 rounded-sm"></div>
                    <div className="w-1/6 h-2/5 bg-indigo-200 rounded-sm"></div>
                </div>
            );
        case 'pie_chart':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 via-emerald-200 to-amber-200"></div>
                </div>
            );
        case 'radar_chart':
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full"></div>
                </div>
            );
        case 'student_table':
        case 'outcome_table':
        case 'psychometric_table':
            return (
                <div className="space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-2 w-full bg-slate-100 rounded"></div>
                    ))}
                </div>
            );
        case 'risk_card':
            return (
                <div className="grid grid-cols-2 gap-2 h-full">
                    <div className="rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[10px] text-rose-600">
                        Yüksek Risk
                    </div>
                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] text-amber-600">
                        Orta Risk
                    </div>
                </div>
            );
        case 'ai_comment':
            return (
                <div className="text-[10px] text-slate-500 italic">
                    AI yorumu burada yer alır.
                </div>
            );
        case 'free_text':
            return (
                <div className="space-y-2">
                    <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                    <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                </div>
            );
        case 'signature':
            return (
                <div className="flex items-end justify-between h-full text-[10px] text-slate-400">
                    <div className="w-1/3 border-t border-slate-300 pt-1">İmza</div>
                    <div className="w-1/3 border-t border-slate-300 pt-1 text-right">Onay</div>
                </div>
            );
        case 'page_break':
            return (
                <div className="w-full flex items-center gap-3 text-[10px] text-slate-400">
                    <div className="flex-1 h-px border-t border-dashed border-slate-200"></div>
                    SAYFA SONU
                    <div className="flex-1 h-px border-t border-dashed border-slate-200"></div>
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
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
    component,
    index,
    onRemove,
    onMove,
    onUpdateSettings,
    isPreview
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
                        {renderPreviewContent(component.type)}
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
    onAddComponent: (type: any) => void;
    onRemoveComponent: (id: string) => void;
    onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
    onUpdateSettings: (id: string, settings: any) => void;
}

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
    exportId,
    layout,
    isPreview = false,
    onAddComponent,
    onRemoveComponent,
    onMoveComponent,
    onUpdateSettings
}) => {
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
