// =====================================================
// MODÜL 1: PSİKOMETRİK ANALİZ - ANA COMPONENT
// =====================================================

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import {
    AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown,
    HelpCircle, Award, Target, Gauge, FileText, Download
} from 'lucide-react';
import { QuestionConfig, Student } from '../../types';
import { PsychometricResult, PsychometricSummary, QUALITY_CRITERIA } from './types';
import { calculateFullPsychometricAnalysis, analyzeQuestion } from './psychometricCalculations';

interface Props {
    questions: QuestionConfig[];
    students: Student[];
    onExport?: () => void;
}

const QUALITY_COLORS = {
    'Mükemmel': '#22c55e',
    'İyi': '#84cc16',
    'Orta': '#eab308',
    'Zayıf': '#f97316',
    'Revize': '#ef4444'
};

export default function PsychometricAnalysis({ questions, students, onExport }: Props) {
    const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

    // Psikometrik analiz hesapla
    const analysis = useMemo(() => {
        if (questions.length === 0 || students.length === 0) return null;
        return calculateFullPsychometricAnalysis(questions, students);
    }, [questions, students]);

    // Her soru için detaylı analiz
    const questionResults = useMemo(() => {
        if (questions.length === 0 || students.length === 0) return [];

        const totalScores = students.map(s =>
            Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
        );

        return questions.map((q, index) => analyzeQuestion(q, index, students, totalScores));
    }, [questions, students]);

    if (!analysis) {
        return (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center">
                <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Psikometrik Analiz</h3>
                <p className="text-slate-500 mt-2">
                    Analiz için en az 1 soru ve 1 öğrenci gereklidir.
                </p>
            </div>
        );
    }

    // Güçlük-Ayırt Edicilik scatter data
    const scatterData = questionResults.map(r => ({
        x: r.itemDifficulty,
        y: r.itemDiscrimination,
        z: 1,
        name: `Soru ${r.questionNumber}`,
        quality: r.qualityRating
    }));

    // Kalite dağılımı pie data
    const pieData = [
        { name: 'Mükemmel', value: analysis.distribution.excellent, color: QUALITY_COLORS['Mükemmel'] },
        { name: 'İyi', value: analysis.distribution.good, color: QUALITY_COLORS['İyi'] },
        { name: 'Orta', value: analysis.distribution.fair, color: QUALITY_COLORS['Orta'] },
        { name: 'Zayıf', value: analysis.distribution.poor, color: QUALITY_COLORS['Zayıf'] },
        { name: 'Revize', value: analysis.distribution.revise, color: QUALITY_COLORS['Revize'] }
    ].filter(d => d.value > 0);

    // Bar chart data
    const barData = questionResults.map(r => ({
        name: `S${r.questionNumber}`,
        Güçlük: Number((r.itemDifficulty * 100).toFixed(1)),
        AyırtEdicilik: Number((r.itemDiscrimination * 100).toFixed(1)),
        color: QUALITY_COLORS[r.qualityRating]
    }));

    return (
        <div className="space-y-6">
            {/* Başlık ve Özet */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center">
                            <Gauge className="w-7 h-7 mr-3" />
                            Psikometrik Analiz
                        </h2>
                        <p className="text-indigo-100 mt-1">
                            PISA/TIMSS Standartlarında Soru Kalitesi Değerlendirmesi
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black">
                            α = {analysis.reliability.cronbachAlpha.toFixed(2)}
                        </div>
                        <div className={`text-sm ${analysis.reliability.isReliable ? 'text-green-300' : 'text-yellow-300'}`}>
                            {analysis.reliability.interpretation}
                        </div>
                    </div>
                </div>
            </div>

            {/* Özet Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Cronbach's α</span>
                        {analysis.reliability.isReliable
                            ? <CheckCircle className="w-5 h-5 text-green-500" />
                            : <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        }
                    </div>
                    <div className="text-2xl font-bold mt-2 text-slate-800">
                        {analysis.reliability.cronbachAlpha.toFixed(3)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Test Güvenilirliği</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Ort. Güçlük</span>
                        <Target className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold mt-2 text-slate-800">
                        {(analysis.averageDifficulty * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">P-değeri ortalaması</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Ort. Ayırt Edicilik</span>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold mt-2 text-slate-800">
                        {(analysis.averageDiscrimination * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">D-değeri ortalaması</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Kaliteli Soru</span>
                        <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold mt-2 text-slate-800">
                        {analysis.distribution.excellent + analysis.distribution.good} / {analysis.totalQuestions}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Mükemmel + İyi</div>
                </div>
            </div>

            {/* Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Güçlük-Ayırt Edicilik Scatter */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-indigo-600" />
                        Güçlük vs Ayırt Edicilik Haritası
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Güçlük"
                                domain={[0, 1]}
                                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                label={{ value: 'Güçlük (P)', position: 'bottom', offset: 0 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Ayırt Edicilik"
                                domain={[-0.2, 1]}
                                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                label={{ value: 'Ayırt Edicilik (D)', angle: -90, position: 'left' }}
                            />
                            <ZAxis type="number" dataKey="z" range={[100, 100]} />
                            <Tooltip
                                formatter={(value: number, name: string) => [`${(value * 100).toFixed(1)}%`, name]}
                                labelFormatter={(label) => `${scatterData.find(d => d.x === label)?.name || ''}`}
                            />
                            {/* İdeal bölge */}
                            <rect x={0.3} y={0.3} width={0.4} height={0.7} fill="#22c55e" fillOpacity={0.1} />
                            <Scatter data={scatterData} fill="#8884d8">
                                {scatterData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={QUALITY_COLORS[entry.quality as keyof typeof QUALITY_COLORS]}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-slate-500 text-center mt-2">
                        Yeşil bölge: İdeal güçlük (0.30-0.70) ve yüksek ayırt edicilik (&gt;0.30)
                    </div>
                </div>

                {/* Kalite Dağılımı Pie */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-amber-600" />
                        Soru Kalitesi Dağılımı
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {Object.entries(QUALITY_COLORS).map(([name, color]) => (
                            <div key={name} className="flex items-center text-xs">
                                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }} />
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Soru Bazlı Bar Chart */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <BarChart className="w-5 h-5 mr-2 text-indigo-600" />
                    Soru Bazlı Güçlük ve Ayırt Edicilik
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[-20, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                        <Legend />
                        <Bar dataKey="Güçlük" fill="#6366f1" name="Güçlük (P)">
                            <LabelList
                                dataKey="Güçlük"
                                position="top"
                                fontSize={10}
                                formatter={(value: number) => `${Number(value).toFixed(0)}%`}
                            />
                        </Bar>
                        <Bar dataKey="AyırtEdicilik" fill="#22c55e" name="Ayırt Edicilik (D)">
                            <LabelList
                                dataKey="AyırtEdicilik"
                                position="top"
                                fontSize={10}
                                formatter={(value: number) => `${Number(value).toFixed(0)}%`}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detaylı Soru Tablosu */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    Soru Kalitesi Detay Tablosu
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Soru</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Güçlük (P)</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Ayırt Edicilik (D)</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Nokta-Biserial</th>
                                <th className="px-4 py-3 text-center font-bold text-slate-600">Kalite</th>
                                <th className="px-4 py-3 text-left font-bold text-slate-600">Yorum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {questionResults.map((result) => (
                                <tr
                                    key={result.questionId}
                                    className={`hover:bg-slate-50 cursor-pointer ${result.qualityRating === 'Revize' ? 'bg-red-50' : ''
                                        }`}
                                    onClick={() => setSelectedQuestion(result.questionNumber)}
                                >
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        Soru {result.questionNumber}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${result.itemDifficulty >= 0.30 && result.itemDifficulty <= 0.70
                                            ? 'bg-green-100 text-green-700'
                                            : result.itemDifficulty > 0.70
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {(result.itemDifficulty * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${result.itemDiscrimination >= 0.40
                                            ? 'bg-green-100 text-green-700'
                                            : result.itemDiscrimination >= 0.20
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {(result.itemDiscrimination * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-600">
                                        {result.pointBiserial.toFixed(3)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: QUALITY_COLORS[result.qualityRating] }}
                                        >
                                            {result.qualityRating}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">
                                        {result.qualityNotes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Öneriler */}
            <div className={`rounded-xl p-6 border ${analysis.recommendations.length === 1 && analysis.recommendations[0].includes('iyi durumda')
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
                }`}>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Öneriler
                </h3>
                <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                            {rec.includes('iyi durumda') || rec.includes('uygun')
                                ? <CheckCircle className="w-5 h-5 text-green-600 mr-2 shrink-0 mt-0.5" />
                                : <AlertTriangle className="w-5 h-5 text-amber-600 mr-2 shrink-0 mt-0.5" />
                            }
                            <span className="text-slate-700">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
