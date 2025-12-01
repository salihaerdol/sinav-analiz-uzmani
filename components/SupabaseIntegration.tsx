import React, { useState } from 'react';
import { Database, FileText, List, X } from 'lucide-react';
import { ClassListManager } from './ClassListManager';
import { ScenarioSelector } from './ScenarioSelector';

interface SupabaseIntegrationProps {
    grade: string;
    subject: string;
    onClose?: () => void;
    onImportAchievements?: (achievements: { code: string; description: string }[]) => void;
}

export function SupabaseIntegration({
    grade,
    subject,
    onClose,
    onImportAchievements
}: SupabaseIntegrationProps) {
    const [activeTab, setActiveTab] = useState<'classes' | 'scenarios'>('scenarios');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Database className="w-8 h-8 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold">Supabase Yönetim Paneli</h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Sınıf listeleri ve MEB senaryolarını yönetin
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="bg-white border-b border-slate-200 px-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('scenarios')}
                            className={`flex items-center gap-2 px-5 py-3 font-bold border-b-2 transition-colors ${activeTab === 'scenarios'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            MEB Senaryoları
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`flex items-center gap-2 px-5 py-3 font-bold border-b-2 transition-colors ${activeTab === 'classes'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <List className="w-5 h-5" />
                            Sınıf Listeleri
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'scenarios' && (
                        <ScenarioSelector
                            grade={grade}
                            subject={subject}
                            onScenarioSelect={(achievements) => {
                                if (onImportAchievements) {
                                    onImportAchievements(achievements);
                                }
                            }}
                        />
                    )}

                    {activeTab === 'classes' && (
                        <ClassListManager />
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-slate-500">
                            Aktif Sınıf: <span className="font-bold text-slate-700">{grade}. Sınıf - {subject}</span>
                        </p>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                            >
                                Kapat
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
