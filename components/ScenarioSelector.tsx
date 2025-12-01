import React, { useState, useEffect } from 'react';
import { Download, FileText, Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
    MEB_SCENARIOS,
    MEBScenario,
    getScenariosByGrade,
    downloadMEBPDF
} from '../services/mebScraper';
import { scenarioService, achievementService } from '../services/supabase';

interface ScenarioSelectorProps {
    grade: string;
    subject: string;
    onScenarioSelect: (achievements: { code: string; description: string }[]) => void;
}

export function ScenarioSelector({ grade, subject, onScenarioSelect }: ScenarioSelectorProps) {
    const [scenarios, setScenarios] = useState<MEBScenario[]>([]);
    const [selectedScenario, setSelectedScenario] = useState<MEBScenario | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        // Filter scenarios by grade
        const filtered = MEB_SCENARIOS.filter(s =>
            s.grade === grade && s.subject.toLowerCase().includes(subject.toLowerCase())
        );
        setScenarios(filtered);
    }, [grade, subject]);

    const handleDownloadPDF = async (scenario: MEBScenario) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const blob = await downloadMEBPDF(scenario.pdfUrl);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${scenario.subject}_${scenario.grade}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setSuccess('PDF başarıyla indirildi!');
        } catch (err) {
            setError('PDF indirilemedi. Lütfen tekrar deneyin.');
            console.error('PDF download error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImportScenario = async (scenario: MEBScenario) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setSelectedScenario(scenario);

        try {
            // Try to get achievements from Supabase
            const achievements = await achievementService.getByGradeAndSubject(
                scenario.grade,
                scenario.subject
            );

            if (achievements.length > 0) {
                // Import achievements into the exam
                onScenarioSelect(achievements.map(a => ({
                    code: a.code,
                    description: a.description
                })));
                setSuccess(`${achievements.length} kazanım projeye aktarıldı!`);
            } else {
                setError(`Bu senaryo için henüz kazanım eklenmemiş. PDF'i indirip manuel olarak ekleyebilirsiniz.`);
            }
        } catch (err) {
            setError('Kazanımlar yüklenirken hata oluştu.');
            console.error('Import error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                        MEB Senaryoları
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {grade}. Sınıf - {subject} dersi için mevcut senaryolar
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {scenarios.length === 0 ? (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        Bu sınıf ve ders için MEB senaryosu bulunamadı.
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                        Farklı bir sınıf veya ders seçmeyi deneyin.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {scenarios.map((scenario, index) => (
                        <div
                            key={index}
                            className={`p-4 border-2 rounded-xl transition-all ${selectedScenario === scenario
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 bg-white hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 mb-1">
                                        {scenario.subject} - {scenario.grade}. Sınıf
                                    </h4>
                                    <p className="text-xs text-slate-500">
                                        Kaynak: Milli Eğitim Bakanlığı
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownloadPDF(scenario)}
                                        disabled={loading}
                                        className="flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                        title="PDF İndir"
                                    >
                                        {loading && selectedScenario === scenario ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-1" />
                                                PDF
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleImportScenario(scenario)}
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors shadow-md hover:shadow-indigo-500/30"
                                    >
                                        {loading && selectedScenario === scenario ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                            <FileText className="w-4 h-4 mr-1" />
                                        )}
                                        Projeye Aktar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Bilgi:</strong> Senaryoları projeye aktarmak için önce Supabase'de kazanım
                    verilerinin bulunması gerekir. PDF'leri indirip manuel olarak kazanımları da ekleyebilirsiniz.
                </p>
            </div>
        </div>
    );
}
