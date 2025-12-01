import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    studentListService,
    examService,
    StudentList,
    Exam
} from '../services/supabase';
import {
    Plus,
    GraduationCap,
    FileText,
    Users,
    Calendar,
    TrendingUp,
    BookOpen,
    ChevronRight,
    Archive,
    Download,
    Eye
} from 'lucide-react';

interface DashboardProps {
    onNewAnalysis: () => void;
    onViewExam: (examId: string) => void;
    onManageClass: (listId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    onNewAnalysis,
    onViewExam,
    onManageClass
}) => {
    const { user, isAdmin } = useAuth();
    const [studentLists, setStudentLists] = useState<StudentList[]>([]);
    const [recentExams, setRecentExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'exams'>('overview');

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Hoş geldiniz, {user?.user_metadata?.full_name || 'Öğretmen'}
                            </h1>
                            <p className="text-slate-600 mt-1">Sınav analiz platformunuza genel bakış</p>
                        </div>
                        <button
                            onClick={onNewAnalysis}
                            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-lg hover:shadow-indigo-500/30"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Yeni Analiz
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Toplam Sınıf</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalClasses}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <Users className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Toplam Öğrenci</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <GraduationCap className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Toplam Sınav</p>
                                    <p className="text-3xl font-bold mt-2">{stats.totalExams}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <FileText className="w-8 h-8" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Ort. Başarı</p>
                                    <p className="text-3xl font-bold mt-2">%{stats.averageSuccess.toFixed(1)}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <TrendingUp className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-6 border border-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'overview'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Genel Bakış
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'classes'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Sınıflarım ({stats.totalClasses})
                    </button>
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${activeTab === 'exams'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        Sınavlarım ({stats.totalExams})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Exams */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                                Son Sınavlar
                            </h3>
                            <div className="space-y-3">
                                {recentExams.slice(0, 5).map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                        onClick={() => exam.id && onViewExam(exam.id)}
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">{exam.title}</p>
                                            <p className="text-sm text-slate-500">{exam.exam_date}</p>
                                        </div>
                                        <div className="text-right mr-3">
                                            <p className="text-lg font-bold text-indigo-600">
                                                {exam.class_average ? `%${exam.class_average.toFixed(1)}` : 'N/A'}
                                            </p>
                                            <p className="text-xs text-slate-500">{exam.subject}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    </div>
                                ))}
                                {recentExams.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>Henüz sınav bulunmuyor.</p>
                                        <button
                                            onClick={onNewAnalysis}
                                            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            İlk Sınavı Oluştur
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Class Summary by Grade */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                                Sınıflara Genel Bakış
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(listsByGrade).map(([grade, lists]) => (
                                    <div key={grade} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-lg font-bold text-slate-700">{grade}. Sınıf</h4>
                                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                {lists.length} Şube
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {lists.map((list) => (
                                                <button
                                                    key={list.id}
                                                    onClick={() => list.id && onManageClass(list.id)}
                                                    className="text-left p-2 bg-slate-50 rounded hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all"
                                                >
                                                    <p className="font-medium text-slate-700 text-sm">{list.name}</p>
                                                    <p className="text-xs text-slate-500">{list.total_students || 0} öğrenci</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(listsByGrade).length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>Henüz sınıf kaydı bulunmuyor.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">Tüm Sınıflarım</h3>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                                <Plus className="w-4 h-4 mr-2" />
                                Yeni Sınıf
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {studentLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="border border-slate-200 rounded-lg p-5 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group"
                                    onClick={() => list.id && onManageClass(list.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="bg-indigo-100 p-2 rounded-lg">
                                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                                            {list.grade}. Sınıf
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-800 mb-1">{list.name}</h4>
                                    <p className="text-sm text-slate-500 mb-3">{list.academic_year}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {list.total_students || 0} öğrenci
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Tüm Sınavlarım</h3>

                        <div className="space-y-3">
                            {recentExams.map((exam) => (
                                <div
                                    key={exam.id}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                                    onClick={() => exam.id && onViewExam(exam.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-lg text-slate-800">{exam.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exam.status === 'published' ? 'bg-green-100 text-green-700' :
                                                    exam.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {exam.status === 'published' ? 'Yayınlandı' :
                                                    exam.status === 'draft' ? 'Taslak' : 'Arşiv'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>{exam.subject}</span>
                                            <span>•</span>
                                            <span>{exam.grade}. Sınıf</span>
                                            <span>•</span>
                                            <span>{exam.exam_date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {exam.class_average ? `%${exam.class_average.toFixed(1)}` : '-'}
                                            </p>
                                            <p className="text-xs text-slate-500">Ortalama</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                                <Eye className="w-5 h-5 text-indigo-600" />
                                            </button>
                                            <button className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <Download className="w-5 h-5 text-slate-600" />
                                            </button>
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
