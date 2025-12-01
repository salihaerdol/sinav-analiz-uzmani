import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const { signInWithGoogle } = useAuth();

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
                    </div>

                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-6 h-6"
                        />
                        Google ile Giriş Yap
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Güvenli giriş için Google altyapısı kullanılmaktadır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
