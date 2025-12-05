import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    studentListService,
    examService,
    StudentList,
    Exam
} from '../services/supabase';
import { getAllAnalyses } from '../services/historyService';
import { SavedAnalysis } from '../types';
import { MEB_SCENARIOS_ADVANCED, getCurrentScenarios, getMEBDistributionTableURL } from '../services/mebScraperAdvanced';
import {
    Plus,
    GraduationCap,
    FileText,
    Users,
    Calendar,
    TrendingUp,
    BookOpen,
    ChevronRight,
    Download,
    Eye,
    Sparkles,
    Activity,
    PieChart,
    ArrowUpRight,
    Clock,
    Zap,
    Star,
    Lightbulb,
    Copy,
    ExternalLink,
    BookMarked,
    History,
    Target,
    Award,
    ChevronDown,
    CheckCircle2,
    Play
} from 'lucide-react';

interface DashboardProps {
    onNewAnalysis: () => void;
    onViewExam: (examId: string) => void;
    onManageClass: (listId: string) => void;
    onLoadAnalysis?: (analysis: SavedAnalysis) => void;
}

// MEB Senaryo Tipi
interface QuickScenario {
    id: string;
    grade: string;
    subject: string;
    title: string;
    description: string;
    questionCount: number;
    pdfUrl?: string;
    color: string;
}

// Hızlı İpucu Tipi
interface QuickTip {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    action?: string;
    color: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onNewAnalysis,
    onViewExam,
    onManageClass,
    onLoadAnalysis
}) => {
    const { user } = useAuth();
    const [studentLists, setStudentLists] = useState<StudentList[]>([]);
    const [recentExams, setRecentExams] = useState<Exam[]>([]);
    const [recentAnalyses, setRecentAnalyses] = useState<SavedAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'exams' | 'scenarios'>('overview');
    const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

    // MEB Senaryoları
    const quickScenarios: QuickScenario[] = [
        {
            id: '1',
            grade: '5',
            subject: 'İngilizce',
            title: '5. Sınıf İngilizce - 1. Senaryo',
            description: 'Hello! / My Town / Games and Hobbies ünitelerini kapsar',
            questionCount: 20,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: '2',
            grade: '6',
            subject: 'İngilizce',
            title: '6. Sınıf İngilizce - 1. Senaryo',
            description: 'Life / Yummy Breakfast / Downtown ünitelerini kapsar',
            questionCount: 20,
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: '3',
            grade: '7',
            subject: 'İngilizce',
            title: '7. Sınıf İngilizce - 1. Senaryo',
            description: 'Appearance and Personality / Sports / Biographies ünitelerini kapsar',
            questionCount: 20,
            color: 'from-purple-500 to-violet-500'
        },
        {
            id: '4',
            grade: '8',
            subject: 'İngilizce',
            title: '8. Sınıf İngilizce - 1. Senaryo',
            description: 'Friendship / Teen Life / In the Kitchen ünitelerini kapsar',
            questionCount: 20,
            color: 'from-orange-500 to-red-500'
        }
    ];

    // Hızlı İpuçları
    const quickTips: QuickTip[] = [
        {
            id: 1,
            title: 'Excel ile Hızlı Veri Girişi',
            description: 'Öğrenci listesini ve notlarını Excel\'den kopyala-yapıştır ile aktarabilirsiniz.',
            icon: FileText,
            action: 'Veri İçe Aktar',
            color: 'bg-green-50 border-green-200 text-green-700'
        },
        {
            id: 2,
            title: 'Sınıf Listesini Kaydedin',
            description: 'Sınıf listelerinizi veritabanına kaydederek her seferde tekrar girişi önleyin.',
            icon: Users,
            action: 'Sınıf Kaydet',
            color: 'bg-blue-50 border-blue-200 text-blue-700'
        },
        {
            id: 3,
            title: 'AI Analiz Önerileri',
            description: 'Gemini API anahtarınızı ekleyerek yapay zeka destekli öneriler alın.',
            icon: Sparkles,
            action: 'API Ayarları',
            color: 'bg-purple-50 border-purple-200 text-purple-700'
        },
        {
            id: 4,
            title: 'PDF Rapor Oluşturun',
            description: 'Detaylı analiz sonuçlarını profesyonel PDF raporu olarak indirin.',
            icon: Download,
            action: 'Rapor Oluştur',
            color: 'bg-orange-50 border-orange-200 text-orange-700'
        }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lists, exams] = await Promise.all([
                studentListService.getAll(),
                examService.getAll()
            ]);
            setStudentLists(lists);
            setRecentExams(exams);

            // Yerel geçmiş analizleri yükle
            const localAnalyses = getAllAnalyses();
            setRecentAnalyses(localAnalyses.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Group lists by grade
    const listsByGrade = studentLists.reduce((acc, list) => {
        if (!acc[list.grade]) acc[list.grade] = [];
        acc[list.grade].push(list);
        return acc;
    }, {} as Record<string, StudentList[]>);

    // Statistics
    const stats = {
        totalClasses: studentLists.length,
        totalStudents: studentLists.reduce((sum, list) => sum + (list.total_students || 0), 0),
        totalExams: recentExams.length,
        averageSuccess: recentExams.length > 0
            ? recentExams.reduce((sum, exam) => sum + (exam.class_average || 0), 0) / recentExams.length
            : 0
    };

    // MEB senaryosunu seçip başlatma
    const handleStartWithScenario = (scenario: QuickScenario) => {
        // Metadata'yı localStorage'a kaydet
        const metadata = {
            grade: scenario.grade,
            subject: scenario.subject,
            scenario: scenario.id,
            academicYear: '2025-2026',
            term: '1'
        };

        // Metadata'yı kaydet ve yeni analiz başlat
        localStorage.setItem('quick_start_metadata', JSON.stringify(metadata));
        onNewAnalysis();
    };

    // Kodu kopyalama
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                    </div>
                    <p className="text-slate-500 font-medium mt-4">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Hero Section with Glassmorphism */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/50"></div>

                {/* Floating shapes */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-2 text-indigo-200 mb-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                <span className="font-medium">Sınav Analiz Uzmanı</span>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Hoş geldiniz, {user?.user_metadata?.full_name?.split(' ')[0] || 'Öğretmenim'}!
                            </h1>
                            <p className="text-indigo-100 text-lg max-w-2xl">
                                Bugün sınav analizinizi yapın, öğrenci performanslarını takip edin ve AI destekli öneriler alın.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-delay-1">
                            <button
                                onClick={onNewAnalysis}
                                className="group flex items-center justify-center px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                Yeni Analiz
                            </button>
                            <button
                                onClick={() => setActiveTab('scenarios')}
                                className="flex items-center justify-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all font-medium backdrop-blur-sm"
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                Hızlı Başlat
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Floating Effect */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-delay-2">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-50 group hover:border-indigo-200 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                <ArrowUpRight className="w-3 h-3 mr-1" /> Aktif
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Toplam Sınıf</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalClasses}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-50 group hover:border-indigo-200 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Toplam Öğrenci</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalStudents}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-50 group hover:border-indigo-200 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                Bu Dönem
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Toplam Sınav</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalExams}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-50 group hover:border-indigo-200 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.averageSuccess >= 70 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {stats.averageSuccess >= 70 ? 'Yüksek' : 'Orta'}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Genel Başarı</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">%{stats.averageSuccess.toFixed(1)}</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-delay-3">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${activeTab === 'overview'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                            }`}
                    >
                        <PieChart className="w-4 h-4 mr-2" />
                        Genel Bakış
                    </button>
                    <button
                        onClick={() => setActiveTab('scenarios')}
                        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${activeTab === 'scenarios'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                            }`}
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Hızlı Başlangıç
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${activeTab === 'classes'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                            }`}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Sınıflarım
                    </button>
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center ${activeTab === 'exams'
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Sınavlarım
                    </button>
                </div>

                {/* Scenarios Tab - NEW */}
                {activeTab === 'scenarios' && (
                    <div className="space-y-8">
                        {/* Quick Start Section */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-xl">
                                            <Zap className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        Hızlı Başlangıç
                                    </h2>
                                    <p className="text-slate-600 mt-2">MEB müfredatına uygun hazır senaryolar ile hızlıca başlayın</p>
                                </div>
                                <a
                                    href={getMEBDistributionTableURL()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-white px-4 py-2 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    MEB Resmi Senaryolar
                                </a>
                            </div>

                            {/* Quick Scenario Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickScenarios.map((scenario) => (
                                    <div
                                        key={scenario.id}
                                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
                                    >
                                        <div className={`h-2 bg-gradient-to-r ${scenario.color}`}></div>
                                        <div className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">
                                                            {scenario.grade}. Sınıf
                                                        </span>
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded">
                                                            {scenario.subject}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-slate-800 mb-1">{scenario.title}</h3>
                                                    <p className="text-sm text-slate-500">{scenario.description}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                                        <span className="flex items-center">
                                                            <Target className="w-3 h-3 mr-1" />
                                                            {scenario.questionCount} Soru
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleStartWithScenario(scenario)}
                                                    className="shrink-0 p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all group-hover:scale-105"
                                                    title="Bu senaryo ile başla"
                                                >
                                                    <Play className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips Section */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                Faydalı İpuçları
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickTips.map((tip) => (
                                    <div
                                        key={tip.id}
                                        className={`p-5 rounded-xl border ${tip.color} transition-all hover:shadow-md`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <tip.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold mb-1">{tip.title}</h4>
                                                <p className="text-sm opacity-80">{tip.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Analyses Quick Access */}
                        {recentAnalyses.length > 0 && (
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-600" />
                                    Son Analizleriniz
                                </h3>
                                <div className="space-y-3">
                                    {recentAnalyses.map((analysis) => (
                                        <div
                                            key={analysis.id}
                                            onClick={() => onLoadAnalysis?.(analysis)}
                                            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-indigo-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-indigo-100">
                                                    <FileText className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                        {analysis.metadata.className} - {analysis.metadata.subject}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">
                                                        {analysis.metadata.grade}. Sınıf • {new Date(analysis.createdAt).toLocaleDateString('tr-TR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-indigo-600">%{analysis.analysis.classAverage.toFixed(1)}</p>
                                                    <p className="text-xs text-slate-400">Başarı</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Exams - Takes up 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                                    Son Sınavlar
                                </h3>
                                <button onClick={() => setActiveTab('exams')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    Tümünü Gör
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recentExams.slice(0, 5).map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between"
                                        onClick={() => exam.id && onViewExam(exam.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${exam.class_average && exam.class_average >= 70 ? 'bg-green-50 text-green-600' :
                                                exam.class_average && exam.class_average >= 50 ? 'bg-yellow-50 text-yellow-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{exam.title}</h4>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {exam.subject}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{exam.grade}. Sınıf</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{exam.exam_date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm text-slate-500">Başarı</p>
                                                <p className={`text-xl font-bold ${exam.class_average && exam.class_average >= 70 ? 'text-green-600' :
                                                    exam.class_average && exam.class_average >= 50 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {exam.class_average ? `%${exam.class_average.toFixed(1)}` : '-'}
                                                </p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentExams.length === 0 && (
                                    <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h4 className="text-lg font-medium text-slate-900 mb-2">Henüz sınav bulunmuyor</h4>
                                        <p className="text-slate-500 mb-6">İlk sınav analizini oluşturarak başlayın.</p>
                                        <button
                                            onClick={onNewAnalysis}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                        >
                                            Sınav Oluştur
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions & Class Summary */}
                        <div className="space-y-8">
                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                                <h3 className="text-lg font-bold mb-4 relative z-10">Hızlı İşlemler</h3>
                                <div className="space-y-3 relative z-10">
                                    <button
                                        onClick={onNewAnalysis}
                                        className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                                    >
                                        <span className="flex items-center font-medium"><Plus className="w-4 h-4 mr-2" /> Yeni Analiz</span>
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('scenarios')}
                                        className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                                    >
                                        <span className="flex items-center font-medium"><Zap className="w-4 h-4 mr-2" /> Hızlı Başlat</span>
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                                        <span className="flex items-center font-medium"><Users className="w-4 h-4 mr-2" /> Sınıf Ekle</span>
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                                        <span className="flex items-center font-medium"><Download className="w-4 h-4 mr-2" /> Rapor İndir</span>
                                        <ChevronRight className="w-4 h-4 opacity-70" />
                                    </button>
                                </div>
                            </div>

                            {/* Class Summary */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                    <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                                    Sınıf Dağılımı
                                </h3>
                                <div className="space-y-4">
                                    {(Object.entries(listsByGrade) as [string, StudentList[]][]).map(([grade, lists]) => (
                                        <div key={grade} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-slate-700">{grade}. Sınıflar</span>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                    {lists.length} Şube
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(lists.length / stats.totalClasses) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {lists.map(list => (
                                                    <button
                                                        key={list.id}
                                                        onClick={() => list.id && onManageClass(list.id)}
                                                        className="text-xs px-2 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition-colors"
                                                    >
                                                        {list.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(listsByGrade).length === 0 && (
                                        <p className="text-sm text-slate-500 text-center py-4">Henüz sınıf bulunmuyor.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-slate-800">Tüm Sınıflarım</h3>
                            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                                <Plus className="w-4 h-4 mr-2" />
                                Yeni Sınıf Ekle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studentLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden"
                                    onClick={() => list.id && onManageClass(list.id)}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                {list.grade}. Sınıf
                                            </span>
                                        </div>

                                        <h4 className="font-bold text-xl text-slate-800 mb-1">{list.name}</h4>
                                        <p className="text-sm text-slate-500 mb-4 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" /> {list.academic_year}
                                        </p>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-600 flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-slate-400" />
                                                {list.total_students || 0} Öğrenci
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Tüm Sınavlarım</h3>
                                <p className="text-sm text-slate-500 mt-1">Geçmiş sınav analizleriniz ve raporlarınız</p>
                            </div>
                            <div className="flex gap-2">
                                <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>Tüm Dönemler</option>
                                    <option>2024-2025</option>
                                </select>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    onClick={() => exam.id && onViewExam(exam.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${exam.class_average && exam.class_average >= 70 ? 'bg-green-100 text-green-600' :
                                                exam.class_average && exam.class_average >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-red-100 text-red-600'
                                                }`}>
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{exam.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${exam.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        exam.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {exam.status === 'published' ? 'Yayınlandı' : exam.status === 'draft' ? 'Taslak' : 'Arşiv'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1" /> {exam.subject}</span>
                                                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {exam.grade}. Sınıf</span>
                                                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {exam.exam_date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-500 mb-1">Sınıf Ortalaması</p>
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${exam.class_average && exam.class_average >= 70 ? 'bg-green-500' :
                                                                exam.class_average && exam.class_average >= 50 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                            style={{ width: `${exam.class_average || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-bold text-slate-700">{exam.class_average ? `%${exam.class_average.toFixed(1)}` : '-'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg tooltip" title="Görüntüle">
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg tooltip" title="İndir">
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
