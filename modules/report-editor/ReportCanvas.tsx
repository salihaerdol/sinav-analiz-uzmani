import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Trash2, GripVertical, Settings2, ChevronUp, ChevronDown } from 'lucide-react';
import { ReportComponent, DRAGGABLE_ITEM_TYPE } from './types';

interface DraggableComponentProps {
    component: ReportComponent;
    index: number;
    onRemove: (id: string) => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    onUpdateSettings: (id: string, settings: any) => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
    component,
    index,
    onRemove,
    onMove,
    onUpdateSettings
}) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag({
        type: 'SORTABLE_COMPONENT',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: 'SORTABLE_COMPONENT',
        hover(item: { index: number }, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            onMove(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`
        group relative bg-white border-2 border-dashed rounded-xl p-4 mb-4 transition-all
        ${isDragging ? 'opacity-0' : 'opacity-100'}
        hover:border-indigo-300 hover:shadow-md border-slate-200
      `}
        >
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <div className="p-1 bg-white border border-slate-200 rounded shadow-sm cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {component.type}
                    </span>
                    <h4 className="font-bold text-slate-700">{component.title || component.type}</h4>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onRemove(component.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="min-h-[60px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 text-slate-400 text-xs italic">
                {component.type === 'page_break' ? (
                    <div className="w-full flex items-center gap-4 px-4">
                        <div className="flex-1 h-px bg-slate-200 border-t border-dashed"></div>
                        <span>SAYFA SONU</span>
                        <div className="flex-1 h-px bg-slate-200 border-t border-dashed"></div>
                    </div>
                ) : (
                    `[ ${component.type} Bileşeni Önizlemesi ]`
                )}
            </div>
        </div>
    );
};

interface ReportCanvasProps {
    exportId?: string;
    layout: ReportComponent[];
    onAddComponent: (type: any) => void;
    onRemoveComponent: (id: string) => void;
    onMoveComponent: (dragIndex: number, hoverIndex: number) => void;
    onUpdateSettings: (id: string, settings: any) => void;
}

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
    exportId,
    layout,
    onAddComponent,
    onRemoveComponent,
    onMoveComponent,
    onUpdateSettings
}) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: DRAGGABLE_ITEM_TYPE,
        drop: (item: { type: any }) => onAddComponent(item.type),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
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
                    <div className="space-y-4">
                        {layout.map((comp, index) => (
                            <DraggableComponent
                                key={comp.id}
                                index={index}
                                component={comp}
                                onRemove={onRemoveComponent}
                                onMove={onMoveComponent}
                                onUpdateSettings={onUpdateSettings}
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
