// =====================================================
// MODÜL: ULUSLARARASILAŞTIRMA (i18n) - REACT CONTEXT
// =====================================================

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
    SupportedLanguage,
    LanguageInfo,
    Translations,
    I18nContextValue
} from './types';
import { tr, en } from './locales';

// ═══════════════════════════════════════════════════════════════
// DİL BİLGİLERİ
// ═══════════════════════════════════════════════════════════════

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
    tr: {
        code: 'tr',
        name: 'Turkish',
        nativeName: 'Türkçe',
        flag: '🇹🇷',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        numberFormat: { decimal: ',', thousand: '.' }
    },
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇬🇧',
        rtl: false,
        dateFormat: 'MM/DD/YYYY',
        numberFormat: { decimal: '.', thousand: ',' }
    },
    de: {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        rtl: false,
        dateFormat: 'DD.MM.YYYY',
        numberFormat: { decimal: ',', thousand: '.' }
    },
    ar: {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        rtl: true,
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { decimal: '٫', thousand: '٬' }
    }
};

// ═══════════════════════════════════════════════════════════════
// ÇEVİRİ VERİLERİ
// ═══════════════════════════════════════════════════════════════

const translations: Record<SupportedLanguage, Translations> = {
    tr,
    en,
    de: en, // Fallback to English
    ar: en  // Fallback to English
};

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const I18nContext = createContext<I18nContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

interface I18nProviderProps {
    children: React.ReactNode;
    defaultLanguage?: SupportedLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
    children,
    defaultLanguage = 'tr'
}) => {
    const [language, setLanguageState] = useState<SupportedLanguage>(() => {
        // localStorage'dan oku
        const saved = localStorage.getItem('language');
        if (saved && saved in LANGUAGES) {
            return saved as SupportedLanguage;
        }
        // Browser dilini kontrol et
        const browserLang = navigator.language.split('-')[0];
        if (browserLang in LANGUAGES) {
            return browserLang as SupportedLanguage;
        }
        return defaultLanguage;
    });

    // Dil değiştiğinde localStorage'a kaydet ve HTML dil özelliğini güncelle
    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = LANGUAGES[language].rtl ? 'rtl' : 'ltr';
    }, [language]);

    const setLanguage = useCallback((lang: SupportedLanguage) => {
        if (lang in LANGUAGES) {
            setLanguageState(lang);
        }
    }, []);

    // Çeviri fonksiyonu
    const t = useCallback(<K extends keyof Translations>(namespace: K): Translations[K] => {
        return translations[language][namespace];
    }, [language]);

    // Tarih formatla
    const formatDate = useCallback((date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const info = LANGUAGES[language];

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return info.dateFormat
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', String(year));
    }, [language]);

    // Sayı formatla
    const formatNumber = useCallback((num: number, decimals: number = 0): string => {
        const info = LANGUAGES[language];

        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, info.numberFormat.thousand);

        return parts.join(info.numberFormat.decimal);
    }, [language]);

    // Para birimi formatla
    const formatCurrency = useCallback((amount: number): string => {
        const formatted = formatNumber(amount, 2);

        if (language === 'tr') {
            return `${formatted} ₺`;
        } else if (language === 'en') {
            return `$${formatted}`;
        } else if (language === 'de') {
            return `${formatted} €`;
        } else {
            return `${formatted} ﷼`;
        }
    }, [language, formatNumber]);

    const value = useMemo<I18nContextValue>(() => ({
        language,
        setLanguage,
        t,
        formatDate,
        formatNumber,
        formatCurrency,
        languageInfo: LANGUAGES[language],
        availableLanguages: Object.values(LANGUAGES)
    }), [language, setLanguage, t, formatDate, formatNumber, formatCurrency]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Ana i18n hook
 */
export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

/**
 * Sadece çeviri fonksiyonu
 */
export function useTranslation<K extends keyof Translations>(namespace: K): Translations[K] {
    const { t } = useI18n();
    return t(namespace);
}

/**
 * Sadece dil bilgisi
 */
export function useLanguage(): {
    language: SupportedLanguage;
    setLanguage: (lang: SupportedLanguage) => void;
    languageInfo: LanguageInfo;
} {
    const { language, setLanguage, languageInfo } = useI18n();
    return { language, setLanguage, languageInfo };
}

/**
 * Formatlama fonksiyonları
 */
export function useFormatters(): {
    formatDate: (date: Date | string) => string;
    formatNumber: (num: number, decimals?: number) => string;
    formatCurrency: (amount: number) => string;
} {
    const { formatDate, formatNumber, formatCurrency } = useI18n();
    return { formatDate, formatNumber, formatCurrency };
}
