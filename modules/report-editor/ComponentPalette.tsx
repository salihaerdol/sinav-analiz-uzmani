import React from 'react';
import { useDrag } from 'react-dnd';
import * as Icons from 'lucide-react';
import { AVAILABLE_COMPONENTS, DRAGGABLE_ITEM_TYPE, ReportComponentType } from './types';

interface DraggablePaletteItemProps {
    type: ReportComponentType;
    label: string;
    iconName: string;
}

const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({ type, label, iconName }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DRAGGABLE_ITEM_TYPE,
        item: { type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    // @ts-ignore
    const Icon = Icons[iconName] || Icons.HelpCircle;

    return (
        <div
            ref={drag}
            className={`
        flex items-center gap-3 p-3 mb-2 rounded-lg border border-slate-200 bg-white 
        cursor-grab active:cursor-grabbing transition-all hover:border-indigo-300 hover:shadow-sm
        ${isDragging ? 'opacity-50 border-indigo-500 bg-indigo-50' : ''}
      `}
        >
            <div className="p-2 bg-slate-100 rounded-md text-slate-600">
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>
    );
};

export const ComponentPalette: React.FC = () => {
    return (
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Bileşenler
            </h3>
            <div className="space-y-1">
                {AVAILABLE_COMPONENTS.map((comp) => (
                    <DraggablePaletteItem
                        key={comp.type}
                        type={comp.type}
                        label={comp.label}
                        iconName={comp.icon}
                    />
                ))}
            </div>
            <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-700 leading-relaxed">
                    <strong>İpucu:</strong> Bileşenleri sağdaki alana sürükleyerek raporunuzu oluşturun.
                </p>
            </div>
        </div>
    );
};
