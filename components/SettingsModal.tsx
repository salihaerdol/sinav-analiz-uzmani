/**
 * SETTINGS MODAL
 * Kullanıcı ayarları ve API Key yönetimi
 */

import React, { useState, useEffect } from 'react';
import { X, Key, Check, AlertCircle, Loader2, Trash2, ExternalLink, Shield, Zap } from 'lucide-react';
import { userApiKeyService } from '../services/userApiKeyService';
import { checkApiKeyStatus, validateApiKey } from '../services/geminiService';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasExistingKey, setHasExistingKey] = useState(false);
    const [keyStatus, setKeyStatus] = useState<'none' | 'valid' | 'invalid' | 'checking'>('checking');
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [apiStats, setApiStats] = useState<{ total: number; lastUsed: string | null }>({ total: 0, lastUsed: null });

    useEffect(() => {
        loadExistingKey();
    }, []);

    const loadExistingKey = async () => {
        setIsLoading(true);
        try {
            const keys = await userApiKeyService.getApiKeys();
            if (keys?.gemini_api_key) {
                setHasExistingKey(true);
                setApiKey('••••••••••••••••••••••••••••••••');
                setKeyStatus(keys.gemini_api_key_valid ? 'valid' : 'invalid');
                setApiStats({
                    total: keys.total_ai_requests || 0,
                    lastUsed: keys.last_ai_request
                });
            } else {
                // Check env key
                const status = await checkApiKeyStatus();
                if (status.source === 'env' && status.isValid) {
                    setMessage({ type: 'info', text: 'Sistem API anahtarı kullanılmaktadır. Kendi anahtarınızı ekleyebilirsiniz.' });
                }
                setKeyStatus('none');
            }
        } catch (error) {
            console.error('Error loading key:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveKey = async () => {
        if (!apiKey || apiKey.includes('•')) {
            setMessage({ type: 'error', text: 'Lütfen geçerli bir API anahtarı girin.' });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            // Önce doğrula
            const isValid = await validateApiKey(apiKey);
            if (!isValid) {
                setMessage({ type: 'error', text: 'API anahtarı geçersiz. Lütfen kontrol edin.' });
                setKeyStatus('invalid');
                setIsSaving(false);
                return;
            }

            // Kaydet
            const success = await userApiKeyService.saveGeminiApiKey(apiKey);
            if (success) {
                setMessage({ type: 'success', text: 'API anahtarı başarıyla kaydedildi!' });
                setKeyStatus('valid');
                setHasExistingKey(true);
                setApiKey('••••••••••••••••••••••••••••••••');
            } else {
                setMessage({ type: 'error', text: 'API anahtarı kaydedilemedi.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Bir hata oluştu.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteKey = async () => {
        if (!confirm('API anahtarınız silinecek. Emin misiniz?')) return;

        setIsSaving(true);
        try {
            const success = await userApiKeyService.deleteGeminiApiKey();
            if (success) {
                setMessage({ type: 'success', text: 'API anahtarı silindi.' });
                setApiKey('');
                setHasExistingKey(false);
                setKeyStatus('none');
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearInput = () => {
        setApiKey('');
        setKeyStatus('none');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold flex items-center">
                                <Key className="w-6 h-6 mr-2" />
                                API Ayarları
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                Gemini AI için API anahtarınızı yönetin
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <>
                            {/* API Key Status */}
                            <div className={`p-4 rounded-xl border-2 ${keyStatus === 'valid' ? 'bg-green-50 border-green-200' :
                                    keyStatus === 'invalid' ? 'bg-red-50 border-red-200' :
                                        'bg-slate-50 border-slate-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {keyStatus === 'valid' && <Check className="w-5 h-5 text-green-600 mr-2" />}
                                        {keyStatus === 'invalid' && <AlertCircle className="w-5 h-5 text-red-600 mr-2" />}
                                        {keyStatus === 'none' && <Key className="w-5 h-5 text-slate-400 mr-2" />}
                                        <span className={`font-semibold ${keyStatus === 'valid' ? 'text-green-700' :
                                                keyStatus === 'invalid' ? 'text-red-700' :
                                                    'text-slate-600'
                                            }`}>
                                            {keyStatus === 'valid' ? 'API Anahtarı Aktif' :
                                                keyStatus === 'invalid' ? 'API Anahtarı Geçersiz' :
                                                    'API Anahtarı Yok'}
                                        </span>
                                    </div>
                                    {hasExistingKey && apiStats.total > 0 && (
                                        <span className="text-xs text-slate-500">
                                            {apiStats.total} istek yapıldı
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <div className={`p-4 rounded-lg flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800' :
                                        message.type === 'error' ? 'bg-red-50 text-red-800' :
                                            'bg-blue-50 text-blue-800'
                                    }`}>
                                    {message.type === 'success' && <Check className="w-5 h-5 mr-2 shrink-0" />}
                                    {message.type === 'error' && <AlertCircle className="w-5 h-5 mr-2 shrink-0" />}
                                    {message.type === 'info' && <Zap className="w-5 h-5 mr-2 shrink-0" />}
                                    <span className="text-sm">{message.text}</span>
                                </div>
                            )}

                            {/* API Key Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Gemini API Anahtarı
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full p-4 pr-24 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-mono text-sm"
                                        placeholder="AIza..."
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setKeyStatus('none');
                                        }}
                                    />
                                    {hasExistingKey && apiKey.includes('•') && (
                                        <button
                                            onClick={handleClearInput}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Değiştir
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    API anahtarınız güvenli bir şekilde veritabanında saklanır.
                                </p>
                            </div>

                            {/* How to get API Key */}
                            <div className="bg-indigo-50 p-4 rounded-xl">
                                <h4 className="font-semibold text-indigo-800 text-sm mb-2 flex items-center">
                                    <Shield className="w-4 h-4 mr-1" />
                                    API Anahtarı Nasıl Alınır?
                                </h4>
                                <ol className="text-xs text-indigo-700 space-y-1">
                                    <li>1. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-900 inline-flex items-center">Google AI Studio <ExternalLink className="w-3 h-3 ml-0.5" /></a> adresine gidin</li>
                                    <li>2. Google hesabınızla giriş yapın</li>
                                    <li>3. "Create API Key" butonuna tıklayın</li>
                                    <li>4. Oluşturulan anahtarı yukarıya yapıştırın</li>
                                </ol>
                                <p className="text-xs text-indigo-600 mt-2 font-medium">
                                    💡 Ücretsiz hesaplar için günlük 15 istek hakkı bulunmaktadır.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {hasExistingKey && (
                                    <button
                                        onClick={handleDeleteKey}
                                        disabled={isSaving}
                                        className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Sil
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveKey}
                                    disabled={isSaving || !apiKey || apiKey.includes('•')}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2" />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
