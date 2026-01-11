// =====================================================
// MODÜL: ULUSLARARASI KIYASLAMA - DASHBOARD BİLEŞENİ
// =====================================================

import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import {
    Globe, Award, TrendingUp, TrendingDown, Minus,
    Target, BarChart2, BookOpen, AlertCircle, CheckCircle
} from 'lucide-react';
import {
    BenchmarkResult,
    BloomComparison,
    BenchmarkReport,
    PISALevel,
    TIMSSBenchmark
} from './types';
import {
    generateBenchmarkReport,
    calculateBenchmarkResult,
    getPISALevelDescription,
    getTIMSSBenchmarkDescription,
    PISA_2022_DATA,
    TIMSS_2023_DATA
} from './benchmarkService';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

/**
 * PISA Seviye Göstergesi
 */
const PISALevelIndicator: React.FC<{
    level: PISALevel;
    score: number;
    area: 'Matematik' | 'Okuma' | 'Fen';
}> = ({ level, score, area }) => {
    const colors: Record<PISALevel, string> = {
        6: 'bg-violet-500',
        5: 'bg-indigo-500',
        4: 'bg-blue-500',
        3: 'bg-emerald-500',
        2: 'bg-amber-500',
        1: 'bg-orange-500',
        0: 'bg-red-500'
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">PISA 2022 Kıyaslama</h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl ${colors[level]} flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">{level}</span>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{score} puan</div>
                    <div className="text-sm text-slate-500">PISA Ölçeğinde</div>
                </div>
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {getPISALevelDescription(level, area)}
            </div>

            <div className="mt-4 grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map(l => (
                    <div
                        key={l}
                        className={`h-2 rounded-full ${l <= level ? colors[l as PISALevel] : 'bg-slate-200'}`}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * TIMSS Benchmark Göstergesi
 */
const TIMSSBenchmarkIndicator: React.FC<{
    benchmark: TIMSSBenchmark;
    score: number;
}> = ({ benchmark, score }) => {
    const benchmarkColors: Record<TIMSSBenchmark, { bg: string; text: string }> = {
        Advanced: { bg: 'bg-violet-100', text: 'text-violet-700' },
        High: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
        Intermediate: { bg: 'bg-amber-100', text: 'text-amber-700' },
        Low: { bg: 'bg-orange-100', text: 'text-orange-700' },
        Below: { bg: 'bg-red-100', text: 'text-red-700' }
    };

    const style = benchmarkColors[benchmark];

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-800">TIMSS 2023 Kıyaslama</h3>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-xl ${style.bg}`}>
                    <span className={`text-xl font-bold ${style.text}`}>{benchmark}</span>
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{score} puan</div>
                    <div className="text-sm text-slate-500">TIMSS Ölçeğinde</div>
                </div>
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {getTIMSSBenchmarkDescription(benchmark)}
            </div>
        </div>
    );
};

/**
 * Karşılaştırma Kartı
 */
const ComparisonCard: React.FC<{
    label: string;
    value: number;
    comparison: number;
    comparisonLabel: string;
}> = ({ label, value, comparison, comparisonLabel }) => {
    const isPositive = comparison >= 0;
    const TrendIcon = comparison > 0 ? TrendingUp : comparison < 0 ? TrendingDown : Minus;

    return (
        <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="text-sm text-slate-500 mb-1">{label}</div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendIcon className="w-4 h-4" />
                <span>{isPositive ? '+' : ''}{comparison} {comparisonLabel}</span>
            </div>
        </div>
    );
};

/**
 * Bloom Karşılaştırma Tablosu
 */
const BloomComparisonTable: React.FC<{
    data: BloomComparison[];
}> = ({ data }) => {
    const statusColors: Record<BloomComparison['status'], string> = {
        strong: 'bg-emerald-100 text-emerald-700',
        average: 'bg-amber-100 text-amber-700',
        needs_improvement: 'bg-rose-100 text-rose-700'
    };

    const statusLabels: Record<BloomComparison['status'], string> = {
        strong: 'Güçlü',
        average: 'Ortalama',
        needs_improvement: 'Geliştirilmeli'
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Bloom Seviye Karşılaştırması</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="text-left py-2 font-medium text-slate-600">Seviye</th>
                            <th className="text-center py-2 font-medium text-slate-600">Okul</th>
                            <th className="text-center py-2 font-medium text-slate-600">Türkiye</th>
                            <th className="text-center py-2 font-medium text-slate-600">OECD</th>
                            <th className="text-center py-2 font-medium text-slate-600">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.level} className="border-b border-slate-100">
                                <td className="py-3 font-medium text-slate-800">{row.level}</td>
                                <td className="py-3 text-center font-bold text-indigo-600">%{row.schoolPercentage}</td>
                                <td className="py-3 text-center text-slate-600">%{row.turkeyAverage}</td>
                                <td className="py-3 text-center text-slate-600">%{row.oecdAverage}</td>
                                <td className="py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[row.status]}`}>
                                        {statusLabels[row.status]}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD
// ═══════════════════════════════════════════════════════════════

interface BenchmarkDashboardProps {
    schoolName?: string;
    className?: string;
    subject?: 'Matematik' | 'Fen Bilimleri' | 'Türkçe';
    averageScore?: number;
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
    schoolName = 'Örnek Ortaokulu',
    className = '6-A',
    subject = 'Matematik',
    averageScore = 72.5
}) => {
    const [inputScore, setInputScore] = useState(averageScore);

    const report = useMemo(() => {
        return generateBenchmarkReport({
            schoolName,
            className,
            subject: subject as 'Matematik' | 'Fen Bilimleri' | 'Türkçe',
            examTitle: '1. Dönem 2. Yazılı',
            date: '2026-01-11',
            averageScore: inputScore,
            previousScore: inputScore - 3
        });
    }, [schoolName, className, subject, inputScore]);

    const radarData = useMemo(() => {
        return report.bloomComparison.map(b => ({
            level: b.level,
            Okul: b.schoolPercentage,
            Türkiye: b.turkeyAverage,
            OECD: b.oecdAverage
        }));
    }, [report]);

    const pisaArea = subject === 'Fen Bilimleri' ? 'Fen' : subject === 'Türkçe' ? 'Okuma' : 'Matematik';
    const pisaData = PISA_2022_DATA[pisaArea];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Uluslararası Kıyaslama</h1>
                    <p className="text-slate-500">{schoolName} • {className} • {subject}</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-600">Ortalama Puan:</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={inputScore}
                        onChange={(e) => setInputScore(Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold"
                    />
                </div>
            </div>

            {/* Genel Durum */}
            <div
                className="rounded-2xl p-6 text-white"
                style={{ backgroundColor: report.scoreComparison.statusColor }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-lg font-medium opacity-90">Genel Değerlendirme</div>
                        <div className="text-3xl font-bold mt-1">{report.scoreComparison.statusLabel}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold">%{inputScore}</div>
                        <div className="text-lg opacity-90">Okul Ortalaması</div>
                    </div>
                </div>

                {report.trend && (
                    <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 w-fit">
                        {report.trend.direction === 'up' ? <TrendingUp className="w-5 h-5" /> :
                            report.trend.direction === 'down' ? <TrendingDown className="w-5 h-5" /> :
                                <Minus className="w-5 h-5" />}
                        <span>Önceki dönem: %{report.trend.previousScore} ({report.trend.change > 0 ? '+' : ''}{report.trend.change})</span>
                    </div>
                )}
            </div>

            {/* PISA & TIMSS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PISALevelIndicator
                    level={report.scoreComparison.pisaLevel}
                    score={report.scoreComparison.pisaEquivalent}
                    area={pisaArea}
                />
                <TIMSSBenchmarkIndicator
                    benchmark={report.scoreComparison.timssBenchmark}
                    score={report.scoreComparison.timssEquivalent}
                />
            </div>

            {/* Karşılaştırma Detayları */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ComparisonCard
                    label="PISA - Türkiye'ye Göre"
                    value={report.scoreComparison.pisaEquivalent}
                    comparison={report.scoreComparison.pisaComparison.vsTurkey}
                    comparisonLabel="puan"
                />
                <ComparisonCard
                    label="PISA - OECD'ye Göre"
                    value={report.scoreComparison.pisaEquivalent}
                    comparison={report.scoreComparison.pisaComparison.vsOECD}
                    comparisonLabel="puan"
                />
                <ComparisonCard
                    label="TIMSS - Türkiye'ye Göre"
                    value={report.scoreComparison.timssEquivalent}
                    comparison={report.scoreComparison.timssComparison.vsTurkey}
                    comparisonLabel="puan"
                />
                <ComparisonCard
                    label="Yüzdelik Dilim"
                    value={report.scoreComparison.pisaComparison.percentile}
                    comparison={report.scoreComparison.pisaComparison.percentile - 50}
                    comparisonLabel="(%50'ye göre)"
                />
            </div>

            {/* Bloom Karşılaştırması */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BloomComparisonTable data={report.bloomComparison} />

                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Bilişsel Düzey Radarı</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="level" tick={{ fontSize: 11 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="Okul" dataKey="Okul" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                                <Radar name="Türkiye" dataKey="Türkiye" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                                <Radar name="OECD" dataKey="OECD" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Öneriler */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800">Öneriler</h3>
                </div>
                <div className="space-y-3">
                    {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-indigo-200">
                            <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">{rec}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referans */}
            <div className="text-center text-xs text-slate-400 py-4">
                Veriler: PISA 2022 (OECD), TIMSS 2023 (IEA) • Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </div>
        </div>
    );
};

export default BenchmarkDashboard;
