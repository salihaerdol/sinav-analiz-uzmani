// =====================================================
// MODÜL: YÖNETİCİ DASHBOARD - ANA BİLEŞEN
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Users, GraduationCap, FileText, Building2,
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    Target, Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import {
    AdminDashboardData,
    DashboardFilters,
    ClassPerformance,
    RiskStudent
} from './types';
import {
    generateDemoData,
    sortClassesByPerformance,
    getRiskColor,
    getTrendIcon,
    calculatePercentChange
} from './dashboardService';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

/**
 * KPI Kartı Bileşeni
 */
const KPICard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    color: string;
}> = ({ title, value, subtitle, icon, trend, trendValue, color }) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500';

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        {trendValue && <span>{trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%</span>}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <div className="text-3xl font-bold text-slate-800">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{title}</div>
                {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
            </div>
        </div>
    );
};

/**
 * Risk Kartı Bileşeni
 */
const RiskCard: React.FC<{
    label: string;
    count: number;
    color: string;
    bgColor: string;
}> = ({ label, count, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-4 text-center`}>
        <div className={`text-2xl font-bold ${color}`}>{count}</div>
        <div className={`text-xs font-medium ${color} opacity-80`}>{label}</div>
    </div>
);

/**
 * Sınıf Performans Satırı
 */
const ClassPerformanceRow: React.FC<{
    classData: ClassPerformance;
    rank: number;
}> = ({ classData, rank }) => {
    const TrendIcon = classData.trend === 'up' ? TrendingUp : classData.trend === 'down' ? TrendingDown : Minus;
    const trendColor = classData.trend === 'up' ? 'text-emerald-600' : classData.trend === 'down' ? 'text-rose-600' : 'text-slate-500';

    return (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${rank <= 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {rank}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800">{classData.className}</div>
                <div className="text-xs text-slate-500">{classData.teacherName} • {classData.subject}</div>
            </div>
            <div className="text-right">
                <div className="font-bold text-slate-800">%{classData.average.toFixed(1)}</div>
                <div className={`flex items-center justify-end gap-1 text-xs ${trendColor}`}>
                    <TrendIcon className="w-3 h-3" />
                    <span>{classData.trend === 'up' ? '+' : classData.trend === 'down' ? '-' : ''}{Math.abs(classData.average - classData.previousAverage).toFixed(1)}</span>
                </div>
            </div>
            <div className="w-24">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${classData.average >= 70 ? 'bg-emerald-500' : classData.average >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${classData.average}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * Risk Öğrenci Satırı
 */
const RiskStudentRow: React.FC<{
    student: RiskStudent;
}> = ({ student }) => {
    const riskColors = {
        critical: 'bg-rose-100 text-rose-700 border-rose-200',
        high: 'bg-amber-100 text-amber-700 border-amber-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    const riskLabels = { critical: 'Kritik', high: 'Yüksek', medium: 'Orta' };

    return (
        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-l-4"
            style={{ borderLeftColor: getRiskColor(student.riskLevel) }}>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800">{student.name}</div>
                <div className="text-xs text-slate-500">{student.className} • {student.subject}</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium border ${riskColors[student.riskLevel]}`}>
                {riskLabels[student.riskLevel]}
            </div>
            <div className="text-right">
                <div className="font-bold text-slate-800">{student.lastScore} puan</div>
                <div className="text-xs text-slate-500">{student.examCount} sınav</div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD BİLEŞENİ
// ═══════════════════════════════════════════════════════════════

export const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<DashboardFilters>({ dateRange: 'semester' });
    const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'teachers' | 'risks'>('overview');

    useEffect(() => {
        // Demo veri yükle
        const loadData = async () => {
            setLoading(true);
            // Simüle edilmiş yükleme
            await new Promise(resolve => setTimeout(resolve, 500));
            setData(generateDemoData());
            setLoading(false);
        };
        loadData();
    }, [filters.dateRange]);

    const sortedClasses = useMemo(() => {
        if (!data) return [];
        return sortClassesByPerformance(data.classPerformances);
    }, [data]);

    const chartColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Dashboard yükleniyor...</p>
                </div>
            </div>
        );
    }

    const trendChange = calculatePercentChange(data.kpis.schoolAverage, data.kpis.previousAverage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Yönetici Dashboard</h1>
                    <p className="text-slate-500 text-sm">Okul geneli performans analizi</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as DashboardFilters['dateRange'] })}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                        <option value="quarter">Bu Çeyrek</option>
                        <option value="semester">Bu Dönem</option>
                        <option value="year">Bu Yıl</option>
                    </select>
                    <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Filter className="w-5 h-5 text-slate-600" />
                    </button>
                    <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Download className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* KPI Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Okul Ortalaması"
                    value={`%${data.kpis.schoolAverage.toFixed(1)}`}
                    subtitle={`Önceki: %${data.kpis.previousAverage.toFixed(1)}`}
                    icon={<Target className="w-6 h-6 text-indigo-600" />}
                    color="bg-indigo-50"
                    trend={data.kpis.averageTrend}
                    trendValue={trendChange}
                />
                <KPICard
                    title="Toplam Öğrenci"
                    value={data.kpis.totalStudents.toLocaleString()}
                    subtitle={`${data.kpis.totalClasses} sınıf`}
                    icon={<Users className="w-6 h-6 text-emerald-600" />}
                    color="bg-emerald-50"
                />
                <KPICard
                    title="Öğretmen Sayısı"
                    value={data.kpis.totalTeachers}
                    subtitle={`${data.kpis.totalExams} sınav`}
                    icon={<GraduationCap className="w-6 h-6 text-amber-600" />}
                    color="bg-amber-50"
                />
                <KPICard
                    title="Başarı Oranı"
                    value={`%${data.kpis.passRate}`}
                    subtitle={`${data.kpis.highAchievers} yüksek başarılı`}
                    icon={<FileText className="w-6 h-6 text-violet-600" />}
                    color="bg-violet-50"
                />
            </div>

            {/* Risk Durumu */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h2 className="font-bold text-slate-800">Risk Durumu</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <RiskCard label="Kritik Risk" count={data.kpis.criticalRiskCount} color="text-rose-700" bgColor="bg-rose-50" />
                    <RiskCard label="Yüksek Risk" count={data.kpis.highRiskCount} color="text-amber-700" bgColor="bg-amber-50" />
                    <RiskCard label="Orta Risk" count={data.kpis.mediumRiskCount} color="text-yellow-700" bgColor="bg-yellow-50" />
                </div>
            </div>

            {/* Ana İçerik Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sınıf Performans Grafiği */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Sınıf Performansları</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sortedClasses.slice(0, 8)} layout="vertical" margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="className" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => [`%${value.toFixed(1)}`, 'Ortalama']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                />
                                <Bar dataKey="average" radius={[0, 4, 4, 0]}>
                                    {sortedClasses.slice(0, 8).map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.average >= 70 ? '#10B981' : entry.average >= 50 ? '#F59E0B' : '#EF4444'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trend Grafiği */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Performans Trendi</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis domain={[60, 80]} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number) => [`%${value.toFixed(1)}`, '']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name="Ortalama"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    name="Hedef"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sınıf Sıralaması */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Sınıf Sıralaması</h2>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {sortedClasses.map((classData, index) => (
                            <ClassPerformanceRow key={classData.className} classData={classData} rank={index + 1} />
                        ))}
                    </div>
                </div>

                {/* Risk Altındaki Öğrenciler */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-800">Risk Altındaki Öğrenciler</h2>
                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                            {data.riskStudents.length} öğrenci
                        </span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {data.riskStudents.map((student) => (
                            <RiskStudentRow key={student.id} student={student} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Kazanım Kapsamı */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-slate-800">Kazanım Kapsamı</h2>
                        <p className="text-sm text-slate-500">{data.outcomeCoverage.coveredOutcomes} / {data.outcomeCoverage.totalOutcomes} kazanım</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600">%{data.outcomeCoverage.coverage.toFixed(1)}</div>
                        <div className="text-xs text-slate-500">Kapsama Oranı</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                        style={{ width: `${data.outcomeCoverage.coverage}%` }}
                    />
                </div>

                {/* Zayıf Kazanımlar */}
                <h3 className="font-medium text-slate-700 mb-3">Düşük Başarılı Kazanımlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.outcomeCoverage.weakOutcomes.map((outcome) => (
                        <div key={outcome.code} className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                            <div className="flex-1">
                                <div className="text-xs font-mono text-rose-600">{outcome.code}</div>
                                <div className="text-sm text-slate-700">{outcome.description}</div>
                            </div>
                            <div className="text-lg font-bold text-rose-600">%{outcome.coverage}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 py-4">
                Son güncelleme: {new Date(data.lastUpdated).toLocaleString('tr-TR')}
            </div>
        </div>
    );
};

export default AdminDashboard;
