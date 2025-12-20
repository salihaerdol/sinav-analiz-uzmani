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
    Zap
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
        { icon: BarChart3, text: 'Detaylı Sınav Analizi', color: 'text-emerald-600' },
        { icon: Brain, text: 'Yapay Zeka Destekli Yorumlar', color: 'text-amber-600' },
        { icon: FileText, text: 'Profesyonel PDF Raporları', color: 'text-sky-600' },
        { icon: Users, text: 'Sınıf ve Öğrenci Takibi', color: 'text-orange-600' },
    ];

    const steps = [
        { title: 'Sınıfını Oluştur', text: 'Öğrenci listesini bir kez kaydet.' },
        { title: 'Notları Yükle', text: 'Excel, kopyala-yapıştır veya OCR.' },
        { title: 'Raporu Paylaş', text: 'PDF/Word çıktısı al.' },
    ];

    return (
        <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden login-root">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(251,146,60,0.18),_transparent_55%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.05)_0%,transparent_45%),linear-gradient(60deg,rgba(15,23,42,0.03)_0%,transparent_60%)]"></div>
            <div className="absolute -top-16 left-10 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl float-soft"></div>
            <div className="absolute bottom-[-40px] right-10 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl float-soft delay-2"></div>

            <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
                {/* Left Side - Branding */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl"></div>
                            <div className="relative bg-white border border-emerald-100 p-4 rounded-2xl shadow-lg">
                                <GraduationCap className="w-10 h-10 text-emerald-700" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
                                Sınav Analiz Uzmanı
                            </h1>
                            <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 font-semibold">
                                Akıllı Raporlama
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">
                            Öğretmenlerin kararını hızlandıran
                            <span className="text-emerald-700"> canlı sınav panosu</span>
                        </h2>
                        <p className="text-slate-600 text-lg max-w-xl">
                            MEB müfredatına göre otomatik senaryo, kazanım analizi, öğrenci risk takibi ve profesyonel raporlar.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 bg-white/70 rounded-2xl p-4 border border-white shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                                </div>
                                <span className="text-slate-700 text-sm font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        {steps.map((step, idx) => (
                            <div key={idx} className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-slate-800 font-semibold mt-2">{step.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Login Card */}
                <div className="w-full max-w-md mx-auto">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-emerald-200/60 to-orange-200/60 rounded-[32px] blur-2xl"></div>

                        <div className="relative bg-white/90 backdrop-blur-xl rounded-[28px] p-8 border border-white shadow-2xl">
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-100">
                                    <Sparkles className="w-4 h-4" />
                                    Yeni oturum
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold text-slate-900 text-center mb-2">
                                Hesabınıza giriş yapın
                            </h3>
                            <p className="text-slate-500 text-center mb-8">
                                Analize devam etmek için tek tık yeterli.
                            </p>

                            {error && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className={`w-full flex items-center justify-center gap-3 bg-slate-900 text-white rounded-2xl px-6 py-4 font-semibold text-base hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0] ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoggingIn ? (
                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                {isLoggingIn ? 'Giriş yapılıyor...' : 'Google ile devam et'}
                            </button>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>Ücretsiz kullanım, kart bilgisi gerekmez.</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <Shield className="w-5 h-5 text-slate-700 shrink-0" />
                                    <span>Google güvenli oturum altyapısı.</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm">
                                    <Zap className="w-5 h-5 text-amber-600 shrink-0" />
                                    <span>30 saniyede hazır analiz.</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                                <p className="text-slate-400 text-xs">
                                    Giriş yaparak{' '}
                                    <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors">
                                        Kullanım Koşullarını
                                    </a>{' '}
                                    kabul etmiş olursunuz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
