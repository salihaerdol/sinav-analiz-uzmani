import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
    GraduationCap,
    Sparkles,
    CheckCircle2,
    BarChart3,
    FileText,
    Users,
    Brain,
    Shield,
    Zap,
    TrendingUp
} from 'lucide-react';

export const Login: React.FC = () => {
    const { signInWithGoogle, error } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
        } finally {
            setIsLoggingIn(false);
        }
    };

    const features = [
        { icon: BarChart3, text: 'Detaylı Sınav Analizi', color: 'text-blue-500' },
        { icon: Brain, text: 'Yapay Zeka Destekli Yorumlar', color: 'text-purple-500' },
        { icon: FileText, text: 'PDF Rapor Oluşturma', color: 'text-green-500' },
        { icon: Users, text: 'Sınıf Takibi', color: 'text-orange-500' },
    ];

    const stats = [
        { value: '1000+', label: 'Öğretmen' },
        { value: '50K+', label: 'Analiz' },
        { value: '100+', label: 'Okul' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-bounce-slow"></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                {/* Left Side - Branding */}
                <div className="flex-1 text-center lg:text-left space-y-8">
                    {/* Logo */}
                    <div className="flex items-center justify-center lg:justify-start gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-2xl">
                                <GraduationCap className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                                Sınav Analiz
                            </h1>
                            <p className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">
                                Uzmanı
                            </p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="space-y-4">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                            Sınav Analizini
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Yapay Zeka</span> ile Dönüştürün
                        </h2>
                        <p className="text-slate-400 text-lg max-w-md mx-auto lg:mx-0">
                            MEB müfredatına uygun otomatik senaryo seçimi, detaylı kazanım analizi ve AI destekli öneriler.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-indigo-500/50 transition-all hover:bg-white/10 group"
                            >
                                <feature.icon className={`w-5 h-5 ${feature.color} group-hover:scale-110 transition-transform`} />
                                <span className="text-white/80 text-sm font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats - Desktop Only */}
                    <div className="hidden lg:flex items-center gap-8 pt-4">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-2xl font-black text-white">{stat.value}</div>
                                <div className="text-slate-500 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className="w-full max-w-md">
                    <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>

                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                            {/* Welcome Badge */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium border border-indigo-500/30">
                                    <Sparkles className="w-4 h-4" />
                                    Hoş Geldiniz
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white text-center mb-2">
                                Hesabınıza Giriş Yapın
                            </h3>
                            <p className="text-slate-400 text-center mb-8">
                                Hemen analiz yapmaya başlayın
                            </p>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Google Login Button */}
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className={`w-full flex items-center justify-center gap-3 bg-white text-slate-800 rounded-xl px-6 py-4 font-bold text-lg hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoggingIn ? (
                                    <div className="w-6 h-6 border-3 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                {isLoggingIn ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}
                            </button>

                            {/* Benefits */}
                            <div className="mt-8 space-y-3">
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>Ücretsiz kullanım - Kart bilgisi gerekmez</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                                    <span>Google güvenli giriş altyapısı</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
                                    <span>Saniyeler içinde analiz yapmaya başlayın</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                <p className="text-slate-500 text-xs">
                                    Giriş yaparak{' '}
                                    <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Kullanım Koşullarını
                                    </a>{' '}
                                    kabul etmiş olursunuz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 6s ease-in-out infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
};
