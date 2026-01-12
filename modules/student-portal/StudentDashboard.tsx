// =====================================================
// MODÜL: ÖĞRENCİ PORTALI - DASHBOARD BİLEŞENİ
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Trophy, Target, Flame, BookOpen, Clock, Star,
    CheckCircle, Circle, TrendingUp, TrendingDown, Award
} from 'lucide-react';
import {
    StudentDashboardData,
    Badge,
    StudentGoal,
    StudyPlanItem
} from './types';
import {
    loadStudentDashboardData,
    getBadgeStyle,
    getPriorityColor
} from './studentService';

// ═══════════════════════════════════════════════════════════════
// ALT BİLEŞENLER
// ═══════════════════════════════════════════════════════════════

/**
 * Seviye Göstergesi
 */
const LevelIndicator: React.FC<{
    level: number;
    progress: number;
    totalPoints: number;
}> = ({ level, progress, totalPoints }) => (
    <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{level}</span>
                </div>
                <div>
                    <div className="text-sm text-purple-200">Seviye</div>
                    <div className="font-bold text-xl">Öğrenci</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-3xl font-bold">{totalPoints}</div>
                <div className="text-sm text-purple-200">Toplam Puan</div>
            </div>
        </div>
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
                className="bg-white rounded-full h-full transition-all"
                style={{ width: `${progress}%` }}
            />
        </div>
        <div className="flex justify-between text-xs text-purple-200 mt-1">
            <span>Seviye {level}</span>
            <span>{progress}% → Seviye {level + 1}</span>
        </div>
    </div>
);

/**
 * Rozet Kartı
 */
const BadgeCard: React.FC<{ badge: Badge }> = ({ badge }) => {
    const style = getBadgeStyle(badge.type);

    return (
        <div className={`relative p-4 rounded-xl border-2 ${badge.isEarned ? style.bgColor : 'bg-slate-50'} ${badge.isEarned ? style.borderColor : 'border-slate-200'} ${!badge.isEarned ? 'opacity-60' : ''}`}>
            <div className="text-center">
                <span className="text-4xl">{badge.icon}</span>
                <div className="font-bold text-slate-800 mt-2">{badge.name}</div>
                <div className="text-xs text-slate-500 mt-1">{badge.description}</div>
                <div className="text-sm font-medium text-indigo-600 mt-2">+{badge.points} puan</div>
            </div>
            {!badge.isEarned && badge.progress !== undefined && badge.progress > 0 && (
                <div className="mt-3">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${badge.progress}%` }} />
                    </div>
                    <div className="text-xs text-slate-500 text-center mt-1">{badge.progress}%</div>
                </div>
            )}
            {badge.isEarned && (
                <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
            )}
        </div>
    );
};

/**
 * Hedef Kartı
 */
const GoalCard: React.FC<{ goal: StudentGoal }> = ({ goal }) => {
    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

    return (
        <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="font-bold text-slate-800">{goal.title}</div>
                    <div className="text-xs text-slate-500">{goal.description}</div>
                </div>
                <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="text-sm font-bold text-slate-700">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                </div>
            </div>
        </div>
    );
};

/**
 * Çalışma Planı Öğesi
 */
const StudyPlanRow: React.FC<{
    item: StudyPlanItem;
    onToggle: (id: string) => void;
}> = ({ item, onToggle }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${item.isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
        <button
            onClick={() => onToggle(item.id)}
            className="flex-shrink-0"
        >
            {item.isCompleted
                ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                : <Circle className="w-6 h-6 text-slate-300 hover:text-indigo-500" />
            }
        </button>
        <div className="flex-1 min-w-0">
            <div className={`font-medium ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {item.topic}
            </div>
            <div className="text-xs text-slate-500">{item.subject}</div>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                {item.priority === 'high' ? 'Yüksek' : item.priority === 'medium' ? 'Orta' : 'Düşük'}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />{item.duration}dk
            </span>
        </div>
    </div>
);

/**
 * Liderlik Tablosu Satırı
 */
const LeaderboardRow: React.FC<{
    entry: { rank: number; name: string; points: number; isCurrentUser: boolean };
}> = ({ entry }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${entry.isCurrentUser ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-white border border-slate-100'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
            ${entry.rank === 1 ? 'bg-amber-400 text-white' :
                entry.rank === 2 ? 'bg-slate-400 text-white' :
                    entry.rank === 3 ? 'bg-orange-400 text-white' :
                        'bg-slate-100 text-slate-600'}`}>
            {entry.rank}
        </div>
        <div className="flex-1 font-medium text-slate-800">
            {entry.name} {entry.isCurrentUser && <span className="text-indigo-600">(Sen)</span>}
        </div>
        <div className="font-bold text-indigo-600">{entry.points} puan</div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// ANA DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const StudentDashboard: React.FC = () => {
    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const dashboardData = await loadStudentDashboardData();
            setData(dashboardData);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleToggleTask = (id: string) => {
        if (!data) return;
        setData({
            ...data,
            studyPlan: data.studyPlan.map(item =>
                item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
            )
        });
    };

    const activityChartData = useMemo(() => {
        if (!data) return [];
        return data.weeklyActivity.map(a => ({
            day: new Date(a.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
            dakika: a.studyMinutes,
            puan: a.earnedPoints
        }));
    }, [data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-slate-500">Henüz öğrenci verisi bulunamadı.</p>
                    <p className="text-xs text-slate-400 mt-2">Analiz geçmişi oluşturulduğunda bu ekran otomatik güncellenir.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Merhaba, {data.student.name.split(' ')[0]}! 👋</h1>
                    <p className="text-slate-500">{data.student.className} • {data.stats.studyStreak} günlük çalışma serisi 🔥</p>
                </div>
                <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="font-bold text-orange-600">{data.stats.studyStreak} gün</span>
                </div>
            </div>

            {/* Üst Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Seviye */}
                <LevelIndicator
                    level={data.student.level}
                    progress={data.student.levelProgress}
                    totalPoints={data.student.totalPoints}
                />

                {/* Hızlı İstatistikler */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="text-3xl font-bold text-slate-800">%{data.stats.overallAverage.toFixed(0)}</div>
                        <div className="text-sm text-slate-500">Genel Ortalama</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="text-3xl font-bold text-slate-800">{data.stats.rank}/{data.stats.totalStudents}</div>
                        <div className="text-sm text-slate-500">Sınıf Sırası</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="text-3xl font-bold text-slate-800">{data.stats.examCount}</div>
                        <div className="text-sm text-slate-500">Sınav</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <div className="text-3xl font-bold text-slate-800">{data.earnedBadgesCount}/{data.totalBadgesCount}</div>
                        <div className="text-sm text-slate-500">Rozet</div>
                    </div>
                </div>

                {/* Liderlik */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" /> Liderlik
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {data.leaderboard.slice(0, 5).map(e => (
                            <LeaderboardRow key={e.studentId} entry={e} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Rozetler */}
            <div>
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> Rozetlerim
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {data.badges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
            </div>

            {/* Orta Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hedefler */}
                <div>
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" /> Hedeflerim
                    </h2>
                    <div className="space-y-3">
                        {data.goals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}
                    </div>
                </div>

                {/* Haftalık Aktivite */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h2 className="font-bold text-slate-800 mb-4">Haftalık Çalışma</h2>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="dakika" name="Dakika" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2 text-sm text-slate-500">
                        Bu hafta toplam <span className="font-bold text-violet-600">{data.stats.weeklyStudyMinutes} dakika</span> çalıştın!
                    </div>
                </div>
            </div>

            {/* Günlük Çalışma Planı */}
            <div>
                <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" /> Bugünkü Görevlerin
                </h2>
                <div className="space-y-2">
                    {data.studyPlan.map(item => (
                        <StudyPlanRow key={item.id} item={item} onToggle={handleToggleTask} />
                    ))}
                </div>
            </div>

            {/* Güçlü ve Zayıf Yönler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <h2 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" /> Güçlü Yönlerin
                    </h2>
                    <div className="space-y-3">
                        {data.strengths.map((s, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-emerald-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-slate-800">{s.topic}</div>
                                        <div className="text-xs text-slate-500">{s.subject}</div>
                                    </div>
                                    <div className="text-lg font-bold text-emerald-600">%{s.score}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                    <h2 className="font-bold text-rose-800 mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" /> Geliştirilecek Alanlar
                    </h2>
                    <div className="space-y-3">
                        {data.weaknesses.map((w, i) => (
                            <div key={i} className="bg-white rounded-lg p-3 border border-rose-200">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <div className="font-medium text-slate-800">{w.topic}</div>
                                        <div className="text-xs text-slate-500">{w.subject}</div>
                                    </div>
                                    <div className="text-lg font-bold text-rose-600">%{w.score}</div>
                                </div>
                                {w.recommendation && (
                                    <div className="text-xs text-rose-700 bg-rose-100 p-2 rounded">
                                        💡 {w.recommendation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
