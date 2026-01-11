// =====================================================
// MODÜL: ULUSLARARASILAŞTIRMA (i18n) - DİL SEÇİCİ BİLEŞENİ
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, LANGUAGES } from './I18nContext';
import { SupportedLanguage } from './types';

// ═══════════════════════════════════════════════════════════════
// DİL SEÇİCİ DROPDOWN
// ═══════════════════════════════════════════════════════════════

export const LanguageSelector: React.FC<{
    variant?: 'default' | 'compact' | 'full';
    className?: string;
}> = ({ variant = 'default', className = '' }) => {
    const { language, setLanguage, languageInfo } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dışarı tıklamayı dinle
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang: SupportedLanguage) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const availableLanguages = Object.values(LANGUAGES);

    if (variant === 'compact') {
        return (
            <div ref={dropdownRef} className={`relative ${className}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
                >
                    <span>{languageInfo.flag}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        {availableLanguages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${language === lang.code ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                                    }`}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.code.toUpperCase()}</span>
                                {language === lang.code && <Check className="w-3 h-3 ml-auto" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (variant === 'full') {
        return (
            <div className={`bg-white rounded-xl p-4 border border-slate-100 ${className}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-slate-800">Dil Seçimi / Language</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {availableLanguages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${language === lang.code
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <div className="text-left">
                                <div className={`font-medium ${language === lang.code ? 'text-indigo-700' : 'text-slate-800'}`}>
                                    {lang.nativeName}
                                </div>
                                <div className="text-xs text-slate-500">{lang.name}</div>
                            </div>
                            {language === lang.code && (
                                <Check className="w-5 h-5 text-indigo-600 ml-auto" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{languageInfo.flag}</span>
                <span className="text-sm text-slate-700">{languageInfo.nativeName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                    {availableLanguages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${language === lang.code ? 'bg-indigo-50' : ''
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="text-left flex-1">
                                <div className={language === lang.code ? 'text-indigo-700 font-medium' : 'text-slate-700'}>
                                    {lang.nativeName}
                                </div>
                            </div>
                            {language === lang.code && <Check className="w-4 h-4 text-indigo-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// DİL BUTONLARI (inline)
// ═══════════════════════════════════════════════════════════════

export const LanguageButtons: React.FC<{
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}> = ({ size = 'md', className = '' }) => {
    const { language, setLanguage } = useLanguage();
    const availableLanguages = Object.values(LANGUAGES);

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {availableLanguages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`${sizeClasses[size]} rounded-lg transition-all ${language === lang.code
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    title={lang.name}
                >
                    {lang.flag}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
