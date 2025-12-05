import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const { signInWithGoogle, error } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            await signInWithGoogle();
        } finally {
            // If redirect happens, this might not run or matter, but if error occurs, we stop loading
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Sınav Analiz Uzmanı</h1>
                    <p className="text-blue-100">Gelişmiş Raporlama ve Analiz Sistemi</p>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-600">Devam etmek için lütfen giriş yapın.</p>
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isLoggingIn ? (
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            <img
                                src="https://www.google.com/favicon.ico"
                                alt="Google"
                                className="w-6 h-6"
                            />
                        )}
                        {isLoggingIn ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Güvenli giriş için Google altyapısı kullanılmaktadır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
