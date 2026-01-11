// =====================================================
// MODÜL: VELİ PORTALI - DASHBOARD BİLEŞENİ
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    User, Bell, TrendingUp, TrendingDown, Minus,
    BookOpen, GraduationCap, Award, AlertCircle,
    ChevronRight, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import {
    ParentDashboardData,
    StudentSummary,
    ExamResult,
    SubjectPerformance,
    ParentNotification
} from './types';
import {
    generateParentDemoData,
    getTrendInfo,
    getStatusColor,
    getNotificationIcon,
    getRecommendationIcon
} from './parentService';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

/**
 * Çocuk Seçici
 */
const ChildSelector: React.FC<{
    children: StudentSummary[];
    selectedId: string;
    onSelect: (id: string) => void;
}> = ({ children, selectedId, onSelect }) => (
    <div className="flex gap-3 overflow-x-auto pb-2">
        {children.map(child => (
            <button
                key={child.id}
                onClick={() => onSelect(child.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap
                    ${selectedId === child.id
                        ? 'bg-indigo-50 border-indigo-500 shadow-md'
                        : 'bg-white border-slate-200 hover:border-indigo-300'}`}
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold">
                    {child.name.charAt(0)}
                </div>
                <div className="text-left">
                    <div className="font-bold text-slate-800">{child.name}</div>
                    <div className="text-xs text-slate-500">{child.className} • {child.schoolName}</div>
                </div>
            </button>
        ))}
    </div>
);

/**
 * Performans Özet Kartı
 */
const PerformanceCard: React.FC<{
    child: StudentSummary;
}> = ({ child }) => {
    const trend = getTrendInfo(child.trend);
    const TrendIcon = child.trend === 'up' ? TrendingUp : child.trend === 'down' ? TrendingDown : Minus;

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold">{child.name}</h2>
                    <p className="text-indigo-200">{child.className} • {child.grade}. Sınıf</p>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                    <GraduationCap className="w-6 h-6" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-3xl font-bold">%{child.overallAverage.toFixed(1)}</div>
                    <div className="text-sm text-indigo-200 flex items-center gap-1">
                        <TrendIcon className="w-4 h-4" />
                        Genel Ortalama
                    </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-3xl font-bold">{child.classRank}/{child.totalStudentsInClass}</div>
                    <div className="text-sm text-indigo-200">Sınıf Sıralaması</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-3xl font-bold">{child.lastExamScore}</div>
                    <div className="text-sm text-indigo-200">Son Sınav</div>
                </div>
            </div>
        </div>
    );
};

/**
 * Sınav Sonuç Kartı
 */
const ExamResultCard: React.FC<{
    exam: ExamResult;
}> = ({ exam }) => {
    const StatusIcon = exam.status === 'passed' ? CheckCircle : XCircle;

    return (
        <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="font-bold text-slate-800">{exam.subject}</div>
                    <div className="text-xs text-slate-500">{exam.examTitle}</div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status === 'passed' ? 'Geçti' : exam.status === 'failed' ? 'Kaldı' : 'Sınırda'}
                </span>
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-3xl font-bold text-slate-800">{exam.score}</div>
                    <div className="text-xs text-slate-500">Puan</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-600">Sınıf Ort: {exam.classAverage}</div>
                    <div className="text-xs text-slate-500">Sıra: {exam.classRank}/{exam.totalStudents}</div>
                </div>
            </div>

            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${exam.percentage >= 70 ? 'bg-emerald-500' : exam.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${exam.percentage}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span><Calendar className="w-3 h-3 inline mr-1" />{exam.date}</span>
                <span>D:{exam.correctAnswers} Y:{exam.wrongAnswers} B:{exam.emptyAnswers}</span>
            </div>
        </div>
    );
};

/**
 * Konu Performans Satırı
 */
const SubjectRow: React.FC<{
    subject: SubjectPerformance;
}> = ({ subject }) => {
    const trend = getTrendInfo(subject.trend);

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{subject.subject}</span>
                    <span className={`text-sm ${trend.color}`}>{trend.icon} {subject.average.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${subject.average >= 70 ? 'bg-emerald-500' : subject.average >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${subject.average}%` }}
                    />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                    {subject.strongTopics.slice(0, 2).map(t => (
                        <span key={t} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">✓ {t}</span>
                    ))}
                    {subject.weakTopics.slice(0, 1).map(t => (
                        <span key={t} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded">✗ {t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Bildirim Kartı
 */
const NotificationCard: React.FC<{
    notification: ParentNotification;
}> = ({ notification }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${notification.isRead ? 'bg-white' : 'bg-indigo-50'}`}>
        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-800">{notification.title}</div>
            <div className="text-sm text-slate-600 truncate">{notification.message}</div>
            <div className="text-xs text-slate-400 mt-1">
                {new Date(notification.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
        {!notification.isRead && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const ParentDashboard: React.FC = () => {
    const [data, setData] = useState<ParentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChildId, setSelectedChildId] = useState<string>('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await new Promise(r => setTimeout(r, 500));
            const demoData = generateParentDemoData();
            setData(demoData);
            setSelectedChildId(demoData.selectedChildId);
            setLoading(false);
        };
        loadData();
    }, []);

    const selectedChild = useMemo(() => {
        if (!data) return null;
        return data.children.find(c => c.id === selectedChildId) || data.children[0];
    }, [data, selectedChildId]);

    const radarData = useMemo(() => {
        if (!data) return [];
        return data.subjectPerformances.map(s => ({
            subject: s.subject,
            average: s.average,
            fullMark: 100
        }));
    }, [data]);

    if (loading || !data || !selectedChild) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Veli Portalı</h1>
                    <p className="text-slate-500">Çocuğunuzun akademik durumu</p>
                </div>
                <button className="relative p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {data.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                            {data.unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Çocuk Seçici */}
            {data.children.length > 1 && (
                <ChildSelector
                    children={data.children}
                    selectedId={selectedChildId}
                    onSelect={setSelectedChildId}
                />
            )}

            {/* Performans Özet */}
            <PerformanceCard child={selectedChild} />

            {/* Ana Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Son Sınavlar */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-slate-800">Son Sınav Sonuçları</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.recentExams.map(exam => (
                            <ExamResultCard key={exam.id} exam={exam} />
                        ))}
                    </div>
                </div>

                {/* Bildirimler */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 h-fit">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-800">Bildirimler</h2>
                        <span className="text-xs text-indigo-600 cursor-pointer">Tümünü Gör</span>
                    </div>
                    <div className="space-y-2">
                        {data.notifications.slice(0, 3).map(n => (
                            <NotificationCard key={n.id} notification={n} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Ders Performansları */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Ders Bazlı Performans</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid strokeDasharray="3 3" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="Ortalama" dataKey="average" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Ders Listesi */}
                <div className="space-y-3">
                    <h2 className="font-bold text-slate-800">Ders Detayları</h2>
                    {data.subjectPerformances.map(s => (
                        <SubjectRow key={s.subject} subject={s} />
                    ))}
                </div>
            </div>

            {/* AI Önerileri */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span>💡</span> Size Özel Öneriler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.recommendations.map(rec => (
                        <div key={rec.id} className="bg-white rounded-xl p-4 border border-amber-200">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
                                <div>
                                    <div className="font-medium text-slate-800">{rec.title}</div>
                                    <div className="text-sm text-slate-600 mt-1">{rec.description}</div>
                                    {rec.subject && (
                                        <span className="inline-block text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mt-2">
                                            {rec.subject}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
