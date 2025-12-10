import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import {
    History, TrendingUp, TrendingDown, Minus, Users, BookOpen, Target,
    FileText, ChevronRight, Search, Filter, Calendar, Trash2, Eye, Download,
    ArrowUp, ArrowDown, Award, AlertTriangle, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import {
    SavedAnalysis, StudentProgress, ClassProgress, DashboardSummary
} from '../types';
import analysisHistoryService from '../services/supabaseHistoryService';

interface Props {
    onLoadAnalysis: (analysis: SavedAnalysis) => void;
    onClose: () => void;
}

type ViewMode = 'dashboard' | 'history' | 'student' | 'class';

export const ProgressDashboard: React.FC<Props> = ({ onLoadAnalysis, onClose }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
    const [studentProgressList, setStudentProgressList] = useState<StudentProgress[]>([]);
    const [classProgressList, setClassProgressList] = useState<ClassProgress[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
    const [selectedClass, setSelectedClass] = useState<ClassProgress | null>(null);
    const [searchText, setSearchText] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sum, allAnalyses, students, classes] = await Promise.all([
                analysisHistoryService.getDashboardSummary(),
                analysisHistoryService.getAllAnalyses(),
                analysisHistoryService.getAllStudentProgress(),
                analysisHistoryService.getAllClassProgress()
            ]);

            setSummary(sum);
            setAnalyses(allAnalyses);
            setStudentProgressList(students);
            setClassProgressList(classes);
        } catch (error) {
            console.error('Veri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAnalysis = async (id: string) => {
        if (window.confirm('Bu analizi silmek istediğinizden emin misiniz?')) {
            await analysisHistoryService.deleteAnalysis(id);
            loadData();
        }
    };

    const handleExportData = async () => {
        const data = await analysisHistoryService.exportAllData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sinav_analiz_yedek_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Not: getFilteredAnalyses asenkron olduğu için useEffect içinde veya loadData içinde çağrılmalı
    // Ancak şimdilik client-side filtreleme yapabiliriz veya servisi güncelleyebiliriz.
    // Basitlik için client-side filtreleme yapalım:
    const filteredAnalyses = analyses.filter(a => {
        const matchClass = !filterClass || a.metadata.className === filterClass;
        const matchSubject = !filterSubject || a.metadata.subject === filterSubject;
        const matchSearch = !searchText ||
            a.metadata.className.toLowerCase().includes(searchText.toLowerCase()) ||
            a.metadata.subject.toLowerCase().includes(searchText.toLowerCase());
        return matchClass && matchSubject && matchSearch;
    });

    const getTrendIcon = (trend: 'improving' | 'stable' | 'declining' | 'up' | 'down') => {
        if (trend === 'improving' || trend === 'up') {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        }
        if (trend === 'declining' || trend === 'down') {
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        }
        return <Minus className="w-4 h-4 text-slate-400" />;
    };

    const getTrendColor = (trend: string) => {
        if (trend === 'improving' || trend === 'up') return 'text-green-600 bg-green-50';
        if (trend === 'declining' || trend === 'down') return 'text-red-600 bg-red-50';
        return 'text-slate-600 bg-slate-50';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-2xl flex items-center gap-4">
                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-slate-700 font-medium">Veriler yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <History className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Gelişim Takip Paneli</h2>
                                <p className="text-indigo-100 text-sm">Analiz geçmişi ve öğrenci/sınıf performansları</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mt-6">
                        {[
                            { id: 'dashboard', label: 'Özet', icon: Target },
                            { id: 'history', label: 'Geçmiş', icon: FileText },
                            { id: 'student', label: 'Öğrenci Takibi', icon: Users },
                            { id: 'class', label: 'Sınıf Takibi', icon: BookOpen }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setViewMode(tab.id as ViewMode);
                                    setSelectedStudent(null);
                                    setSelectedClass(null);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === tab.id
                                    ? 'bg-white text-indigo-600 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">

                    {/* Dashboard View */}
                    {viewMode === 'dashboard' && summary && (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 rounded-lg">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">{summary.totalAnalyses}</p>
                                            <p className="text-xs text-slate-500">Toplam Analiz</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">{summary.totalStudents}</p>
                                            <p className="text-xs text-slate-500">Takip Edilen Öğrenci</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">{summary.totalClasses}</p>
                                            <p className="text-xs text-slate-500">Takip Edilen Sınıf</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 rounded-lg">
                                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">{summary.weakOutcomes.length}</p>
                                            <p className="text-xs text-slate-500">Zayıf Kazanım</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Performing Students */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-yellow-500" />
                                            En Başarılı Öğrenciler
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        {summary.topPerformingStudents.length > 0 ? (
                                            <div className="space-y-3">
                                                {summary.topPerformingStudents.map((student, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            const progress = studentProgressList.find(p => p.studentName === student.name);
                                                            if (progress) {
                                                                setSelectedStudent(progress);
                                                                setViewMode('student');
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                                idx === 1 ? 'bg-slate-200 text-slate-700' :
                                                                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {idx + 1}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-slate-800">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.className}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-indigo-600">%{student.averageScore.toFixed(1)}</span>
                                                            {getTrendIcon(student.trend)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-400 py-8">Henüz veri yok</p>
                                        )}
                                    </div>
                                </div>

                                {/* Class Performance */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-indigo-500" />
                                            Sınıf Performansları
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        {summary.classPerformance.length > 0 ? (
                                            <div className="space-y-3">
                                                {summary.classPerformance.map((cls, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-slate-800">{cls.className}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-indigo-600">%{cls.averageScore.toFixed(1)}</span>
                                                                {getTrendIcon(cls.trend)}
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${cls.averageScore >= 70 ? 'bg-green-500' :
                                                                    cls.averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${cls.averageScore}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-slate-400 py-8">Henüz veri yok</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Weak Outcomes */}
                            {summary.weakOutcomes.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-red-50">
                                        <h3 className="font-bold text-red-800 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Geliştirilmesi Gereken Kazanımlar
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {summary.weakOutcomes.map((oc, idx) => (
                                                <div key={idx} className="p-3 border border-red-100 bg-red-50/50 rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className="font-bold text-red-700">{oc.code}</span>
                                                            <p className="text-sm text-slate-600 mt-1">{oc.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-lg font-bold text-red-600">%{oc.averageSuccessRate.toFixed(0)}</span>
                                                            <p className="text-xs text-slate-500">{oc.frequency} sınavda</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Analyses */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-slate-500" />
                                        Son Analizler
                                    </h3>
                                    <button
                                        onClick={() => setViewMode('history')}
                                        className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                                    >
                                        Tümünü Gör <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {summary.recentAnalyses.map(analysis => (
                                        <div
                                            key={analysis.id}
                                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                                            onClick={() => onLoadAnalysis(analysis)}
                                        >
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {analysis.metadata.className} - {analysis.metadata.subject}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {analysis.metadata.examType} | {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${analysis.analysis.classAverage >= 70 ? 'bg-green-100 text-green-700' :
                                                    analysis.analysis.classAverage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    %{analysis.analysis.classAverage.toFixed(1)}
                                                </span>
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History View */}
                    {viewMode === 'history' && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Tüm Sınıflar</option>
                                    {Array.from(new Set(analyses.map(a => a.metadata.className))).sort().map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Tüm Dersler</option>
                                    {Array.from(new Set(analyses.map(a => a.metadata.subject))).sort().map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleExportData}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Yedekle
                                </button>
                            </div>

                            {/* Analysis List */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {filteredAnalyses.length > 0 ? (
                                        filteredAnalyses.map(analysis => (
                                            <div
                                                key={analysis.id}
                                                className="p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => onLoadAnalysis(analysis)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                                <FileText className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-800">
                                                                    {analysis.metadata.className} - {analysis.metadata.subject}
                                                                </p>
                                                                <p className="text-sm text-slate-500">
                                                                    {analysis.metadata.term}. Dönem {analysis.metadata.examNumber}. {analysis.metadata.examType} |{' '}
                                                                    {analysis.students.length} öğrenci | {analysis.questions.length} soru
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <span className={`text-lg font-bold ${analysis.analysis.classAverage >= 70 ? 'text-green-600' :
                                                                analysis.analysis.classAverage >= 50 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`}>
                                                                %{analysis.analysis.classAverage.toFixed(1)}
                                                            </span>
                                                            <p className="text-xs text-slate-500">
                                                                {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteAnalysis(analysis.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center text-slate-400">
                                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Henüz kaydedilmiş analiz yok</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Progress View */}
                    {viewMode === 'student' && (
                        <div className="space-y-4">
                            {!selectedStudent ? (
                                <>
                                    {/* Student List */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                                            <h3 className="font-bold text-slate-800">Öğrenci Seçin</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {studentProgressList.length > 0 ? (
                                                <div className="divide-y divide-slate-100">
                                                    {studentProgressList.map((student, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setSelectedStudent(student)}
                                                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                    <span className="font-bold text-indigo-600">
                                                                        {student.studentName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-800">{student.studentName}</p>
                                                                    <p className="text-sm text-slate-500">{student.className}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <span className="font-bold text-indigo-600">%{student.averagePercentage.toFixed(1)}</span>
                                                                    <p className="text-xs text-slate-500">{student.examHistory.length} sınav</p>
                                                                </div>
                                                                {getTrendIcon(student.overallTrend)}
                                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center text-slate-400">
                                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p>Henüz öğrenci verisi yok</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Student Detail */}
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        ← Öğrenci Listesine Dön
                                    </button>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-white">
                                                        {selectedStudent.studentName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.studentName}</h2>
                                                    <p className="text-slate-500">{selectedStudent.className}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full ${getTrendColor(selectedStudent.overallTrend)} flex items-center gap-2`}>
                                                {getTrendIcon(selectedStudent.overallTrend)}
                                                <span className="font-medium">
                                                    {selectedStudent.overallTrend === 'improving' ? 'Yükseliyor' :
                                                        selectedStudent.overallTrend === 'declining' ? 'Düşüyor' : 'Sabit'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="p-4 bg-indigo-50 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-indigo-600">%{selectedStudent.averagePercentage.toFixed(1)}</p>
                                                <p className="text-xs text-slate-500">Ortalama Başarı</p>
                                            </div>
                                            <div className="p-4 bg-blue-50 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-blue-600">{selectedStudent.examHistory.length}</p>
                                                <p className="text-xs text-slate-500">Toplam Sınav</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {selectedStudent.examHistory.filter(e => e.percentage >= 50).length}
                                                </p>
                                                <p className="text-xs text-slate-500">Başarılı Sınav</p>
                                            </div>
                                        </div>

                                        {/* Progress Chart */}
                                        {selectedStudent.examHistory.length > 1 && (
                                            <div className="h-64 mb-6">
                                                <h4 className="font-bold text-slate-700 mb-4">Performans Grafiği</h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={selectedStudent.examHistory.slice().reverse()}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 11 }}
                                                            tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                                                        />
                                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                        <Tooltip
                                                            formatter={(value: number) => [`%${value.toFixed(1)}`, 'Başarı']}
                                                            labelFormatter={(val) => new Date(val).toLocaleDateString('tr-TR')}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="percentage"
                                                            stroke="#6366f1"
                                                            fill="#c7d2fe"
                                                            strokeWidth={2}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="classAverage"
                                                            stroke="#94a3b8"
                                                            strokeDasharray="5 5"
                                                            name="Sınıf Ort."
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {/* Exam History Table */}
                                        <h4 className="font-bold text-slate-700 mb-4">Sınav Geçmişi</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Tarih</th>
                                                        <th className="px-4 py-3 text-left">Ders</th>
                                                        <th className="px-4 py-3 text-center">Puan</th>
                                                        <th className="px-4 py-3 text-center">Yüzde</th>
                                                        <th className="px-4 py-3 text-center">Sıra</th>
                                                        <th className="px-4 py-3 text-center">Sınıf Ort.</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedStudent.examHistory.map((exam, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3">
                                                                {new Date(exam.date).toLocaleDateString('tr-TR')}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium">{exam.subject}</td>
                                                            <td className="px-4 py-3 text-center">{exam.score}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`font-bold ${exam.percentage >= 70 ? 'text-green-600' :
                                                                    exam.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`}>
                                                                    %{exam.percentage.toFixed(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {exam.rank}/{exam.totalStudents}
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-slate-500">
                                                                %{exam.classAverage.toFixed(1)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Class Progress View */}
                    {viewMode === 'class' && (
                        <div className="space-y-4">
                            {!selectedClass ? (
                                <>
                                    {/* Class List */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                                            <h3 className="font-bold text-slate-800">Sınıf Seçin</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {classProgressList.length > 0 ? (
                                                <div className="divide-y divide-slate-100">
                                                    {classProgressList.map((cls, idx) => {
                                                        const avgScore = cls.examHistory.reduce((sum, e) => sum + e.classAverage, 0) / cls.examHistory.length;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                onClick={() => setSelectedClass(cls)}
                                                                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                                        <BookOpen className="w-5 h-5 text-green-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-slate-800">{cls.className}</p>
                                                                        <p className="text-sm text-slate-500">{cls.subject}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-right">
                                                                        <span className="font-bold text-indigo-600">%{avgScore.toFixed(1)}</span>
                                                                        <p className="text-xs text-slate-500">{cls.examHistory.length} sınav</p>
                                                                    </div>
                                                                    {getTrendIcon(cls.overallTrend)}
                                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-12 text-center text-slate-400">
                                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                    <p>Henüz sınıf verisi yok</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Class Detail */}
                                    <button
                                        onClick={() => setSelectedClass(null)}
                                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        ← Sınıf Listesine Dön
                                    </button>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800">{selectedClass.className}</h2>
                                                <p className="text-slate-500">{selectedClass.subject}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full ${getTrendColor(selectedClass.overallTrend)} flex items-center gap-2`}>
                                                {getTrendIcon(selectedClass.overallTrend)}
                                                <span className="font-medium">
                                                    {selectedClass.overallTrend === 'improving' ? 'Yükseliyor' :
                                                        selectedClass.overallTrend === 'declining' ? 'Düşüyor' : 'Sabit'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Chart */}
                                        {selectedClass.examHistory.length > 1 && (
                                            <div className="h-64 mb-6">
                                                <h4 className="font-bold text-slate-700 mb-4">Sınıf Performans Grafiği</h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={selectedClass.examHistory.slice().reverse()}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 11 }}
                                                            tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                                                        />
                                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                        <Tooltip
                                                            formatter={(value: number) => [`%${value.toFixed(1)}`, '']}
                                                            labelFormatter={(val) => new Date(val).toLocaleDateString('tr-TR')}
                                                        />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="classAverage" stroke="#6366f1" strokeWidth={2} name="Sınıf Ort." />
                                                        <Line type="monotone" dataKey="highestScore" stroke="#22c55e" strokeDasharray="3 3" name="En Yüksek" />
                                                        <Line type="monotone" dataKey="lowestScore" stroke="#ef4444" strokeDasharray="3 3" name="En Düşük" />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}

                                        {/* Exam History */}
                                        <h4 className="font-bold text-slate-700 mb-4">Sınav Geçmişi</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Tarih</th>
                                                        <th className="px-4 py-3 text-left">Sınav</th>
                                                        <th className="px-4 py-3 text-center">Ortalama</th>
                                                        <th className="px-4 py-3 text-center">En Yüksek</th>
                                                        <th className="px-4 py-3 text-center">En Düşük</th>
                                                        <th className="px-4 py-3 text-center">Geçme Oranı</th>
                                                        <th className="px-4 py-3 text-center">Öğrenci</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedClass.examHistory.map((exam, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50">
                                                            <td className="px-4 py-3">
                                                                {new Date(exam.date).toLocaleDateString('tr-TR')}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium">{exam.examType}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`font-bold ${exam.classAverage >= 70 ? 'text-green-600' :
                                                                    exam.classAverage >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                                    }`}>
                                                                    %{exam.classAverage.toFixed(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-green-600">{exam.highestScore}</td>
                                                            <td className="px-4 py-3 text-center text-red-600">{exam.lowestScore}</td>
                                                            <td className="px-4 py-3 text-center">%{exam.passRate.toFixed(0)}</td>
                                                            <td className="px-4 py-3 text-center text-slate-500">{exam.studentCount}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Outcome Progress */}
                                        {selectedClass.outcomeProgress.length > 0 && (
                                            <>
                                                <h4 className="font-bold text-slate-700 mb-4 mt-6">Kazanım Gelişimi</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {selectedClass.outcomeProgress.slice(0, 6).map((oc, idx) => {
                                                        const latestRate = oc.history[oc.history.length - 1]?.successRate || 0;
                                                        return (
                                                            <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="font-bold text-indigo-600">{oc.outcomeCode}</span>
                                                                    <span className={`font-bold ${latestRate >= 70 ? 'text-green-600' :
                                                                        latestRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                                        }`}>
                                                                        %{latestRate.toFixed(0)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 truncate">{oc.outcomeDescription}</p>
                                                                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                                                    <div
                                                                        className={`h-1.5 rounded-full ${latestRate >= 70 ? 'bg-green-500' :
                                                                            latestRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                            }`}
                                                                        style={{ width: `${latestRate}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
