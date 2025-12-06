import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Eye, Download } from 'lucide-react';
import { getScenarioByGradeAndSubject, MEBScenario } from '../data/mebScenarios';
import { openMEBPDF } from '../services/mebScenarioService';

interface ScenarioVisualSelectorProps {
    grade: string;
    subject: string;
    selectedScenario: string;
    onSelect: (scenarioNumber: string) => void;
    // scenarios prop removed as we fetch internally
    scenarios?: any[];
}

export function ScenarioVisualSelector({
    grade,
    subject,
    selectedScenario,
    onSelect
}: ScenarioVisualSelectorProps) {

    const [availableScenarios, setAvailableScenarios] = useState<MEBScenario[]>([]);

    useEffect(() => {
        // Fetch scenarios from our new database
        const gradeNum = parseInt(grade);
        if (!isNaN(gradeNum) && subject) {
            const found = getScenarioByGradeAndSubject(gradeNum, subject);
            setAvailableScenarios(found);
        } else {
            setAvailableScenarios([]);
        }
    }, [grade, subject]);

    const handlePreview = (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        openMEBPDF(code);
    };

    // If we have real MEB scenarios, show them. Otherwise show generic placeholders.
    const hasRealScenarios = availableScenarios.length > 0;

    const displayScenarios = hasRealScenarios
        ? availableScenarios.map((s, index) => ({
            id: s.code, // Use the code (e.g., turk5) as ID
            name: `${index + 1}. Senaryo`, // Display name
            description: `${s.subject} ${s.grade}. Sınıf MEB Senaryosu`,
            questionCount: '?', // We don't parse PDF content yet to get exact count
            difficulty: 'Standart',
            distribution: 'MEB Dağılımı',
            isReal: true,
            pdfUrl: s.pdfUrl
        }))
        : [
            {
                id: '1',
                name: '1. Senaryo',
                description: 'Genel değerlendirme ve temel kazanımlar ağırlıklı.',
                questionCount: 10,
                difficulty: 'Orta',
                distribution: '2 Çoktan Seçmeli, 8 Açık Uçlu',
                isReal: false
            },
            {
                id: '2',
                name: '2. Senaryo',
                description: 'Eleştirel düşünme ve analiz odaklı sorular.',
                questionCount: 8,
                difficulty: 'Zor',
                distribution: '4 Çoktan Seçmeli, 4 Açık Uçlu',
                isReal: false
            },
            {
                id: '3',
                name: '3. Senaryo',
                description: 'Uygulama ve pratik becerileri ölçen senaryo.',
                questionCount: 12,
                difficulty: 'Kolay',
                distribution: '6 Çoktan Seçmeli, 6 Açık Uçlu',
                isReal: false
            }
        ];

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

            {hasRealScenarios && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-4 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    MEB tarafından yayınlanan güncel senaryolar bulundu.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayScenarios.map((scenario) => {
                    const isSelected = selectedScenario === scenario.id;

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
                                    <span className="text-xl font-bold text-slate-700">
                                        {scenario.isReal ? scenario.id.toUpperCase() : scenario.id}
                                    </span>
                                </div>
                                {scenario.isReal && (
                                    <button
                                        onClick={(e) => handlePreview(e, scenario.id)}
                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1 bg-white rounded-full shadow-sm border border-slate-100"
                                        title="PDF Görüntüle"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <h4 className="font-bold text-slate-800 mb-1">{scenario.name}</h4>
                            <p className="text-xs text-slate-500 mb-3 h-8 line-clamp-2">{scenario.description}</p>

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
                                                scenario.difficulty === 'Zor' ? 'bg-red-100 text-red-700' :
                                                    'bg-slate-100 text-slate-700'
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
