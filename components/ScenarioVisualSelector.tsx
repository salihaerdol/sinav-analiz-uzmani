import React from 'react';
import { FileText, CheckCircle, Download, Eye } from 'lucide-react';
import { MEBScenarioAdvanced, downloadMEBPDFAdvanced } from '../services/mebScraperAdvanced';

interface ScenarioVisualSelectorProps {
    grade: string;
    subject: string;
    selectedScenario: string;
    onSelect: (scenarioNumber: string) => void;
    scenarios: MEBScenarioAdvanced[];
}

export function ScenarioVisualSelector({
    grade,
    subject,
    selectedScenario,
    onSelect,
    scenarios
}: ScenarioVisualSelectorProps) {

    // Mock data for scenarios if not found in scraper (since we have limited data there)
    // In a real app, this would come from the database or scraper
    const displayScenarios = [
        {
            id: '1',
            name: '1. Senaryo',
            description: 'Genel değerlendirme ve temel kazanımlar ağırlıklı.',
            questionCount: 10,
            difficulty: 'Orta',
            distribution: '2 Çoktan Seçmeli, 8 Açık Uçlu'
        },
        {
            id: '2',
            name: '2. Senaryo',
            description: 'Eleştirel düşünme ve analiz odaklı sorular.',
            questionCount: 8,
            difficulty: 'Zor',
            distribution: '4 Çoktan Seçmeli, 4 Açık Uçlu'
        },
        {
            id: '3',
            name: '3. Senaryo',
            description: 'Uygulama ve pratik becerileri ölçen senaryo.',
            questionCount: 12,
            difficulty: 'Kolay',
            distribution: '6 Çoktan Seçmeli, 6 Açık Uçlu'
        }
    ];

    const handlePreview = async (e: React.MouseEvent, scenario: MEBScenarioAdvanced) => {
        e.stopPropagation();
        try {
            const blob = await downloadMEBPDFAdvanced(scenario);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            alert('PDF önizlemesi şu an kullanılamıyor. Lütfen MEB sitesini kontrol edin.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    MEB Senaryo Seçimi
                </h3>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {grade}. Sınıf {subject}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayScenarios.map((scenario) => {
                    const isSelected = selectedScenario === scenario.id;
                    // Find actual PDF data if available
                    const mebData = scenarios.find(s => s.grade === grade && s.subject === subject);

                    return (
                        <div
                            key={scenario.id}
                            onClick={() => onSelect(scenario.id)}
                            className={`
                relative cursor-pointer group transition-all duration-300 border-2 rounded-xl p-5
                ${isSelected
                                    ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                                }
              `}
                        >
                            {isSelected && (
                                <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-200' : 'bg-slate-100 group-hover:bg-indigo-100'} transition-colors`}>
                                    <span className="text-2xl font-bold text-slate-700">{scenario.id}</span>
                                </div>
                                {mebData && (
                                    <button
                                        onClick={(e) => handlePreview(e, mebData)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                                        title="PDF Önizle"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <h4 className="font-bold text-slate-800 mb-1">{scenario.name}</h4>
                            <p className="text-xs text-slate-500 mb-3 h-8">{scenario.description}</p>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Soru Sayısı:</span>
                                    <span className="font-semibold text-slate-700">{scenario.questionCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Zorluk:</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded text-[10px]
                    ${scenario.difficulty === 'Kolay' ? 'bg-green-100 text-green-700' :
                                            scenario.difficulty === 'Orta' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                        }
                  `}>
                                        {scenario.difficulty}
                                    </span>
                                </div>
                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <p className="text-[10px] text-slate-400 text-center">{scenario.distribution}</p>
                                </div>
                            </div>

                            <div className={`mt-4 w-full py-2 rounded-lg text-sm font-medium text-center transition-colors
                ${isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                }
              `}>
                                {isSelected ? 'Seçildi' : 'Seç'}
                            </div>
                        </div>
                    );
                })}

                {/* Custom Scenario Option */}
                <div
                    onClick={() => onSelect('custom')}
                    className={`
            relative cursor-pointer group transition-all duration-300 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center
            ${selectedScenario === 'custom'
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                        }
          `}
                >
                    {selectedScenario === 'custom' && (
                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    )}
                    <div className="p-3 rounded-full bg-slate-100 mb-3 group-hover:bg-indigo-100 transition-colors">
                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-700 mb-1">Özel Senaryo</h4>
                    <p className="text-xs text-slate-500">Kendi soru dağılımınızı oluşturun</p>
                </div>
            </div>
        </div>
    );
}
