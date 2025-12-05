/**
 * MEB Senaryo Yönetim Servisi
 * Otomatik senaryo çekme, güncelleme ve yönetim
 */

import { MEB_SCENARIOS_2025_2026_TERM_1, MEBScenario, getScenarioByCode, parseScenarioCode } from '../data/mebScenarios';
import { QuestionConfig } from '../types';

// LocalStorage anahtarları
const STORAGE_KEYS = {
    SCENARIOS: 'meb_scenarios_cache',
    LAST_UPDATE: 'meb_scenarios_last_update',
    USER_SCENARIOS: 'user_custom_scenarios'
};

export interface ScenarioOption {
    code: string;
    label: string;
    subject: string;
    grade: number;
    pdfUrl: string;
    publisher?: string;
}

/**
 * Tüm senaryo seçeneklerini getir (dropdown için)
 */
export function getScenarioOptions(): ScenarioOption[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.map(s => ({
        code: s.code,
        label: `${s.subject} ${s.grade}. Sinif${s.publisher ? ` (${s.publisher})` : ''}`,
        subject: s.subject,
        grade: s.grade,
        pdfUrl: s.pdfUrl,
        publisher: s.publisher
    }));
}

/**
 * Sınıfa göre senaryoları grupla
 */
export function getScenariosByGradeGroup(): Record<string, ScenarioOption[]> {
    const options = getScenarioOptions();
    const groups: Record<string, ScenarioOption[]> = {
        '5. Sinif': [],
        '6. Sinif': [],
        '7. Sinif': [],
        '8. Sinif': [],
        '9. Sinif': [],
        '10. Sinif': [],
        '11. Sinif': [],
        '12. Sinif': []
    };

    options.forEach(opt => {
        const key = `${opt.grade}. Sinif`;
        if (groups[key]) {
            groups[key].push(opt);
        }
    });

    return groups;
}

/**
 * Derse göre senaryoları grupla
 */
export function getScenariosBySubjectGroup(): Record<string, ScenarioOption[]> {
    const options = getScenarioOptions();
    const groups: Record<string, ScenarioOption[]> = {};

    options.forEach(opt => {
        if (!groups[opt.subject]) {
            groups[opt.subject] = [];
        }
        groups[opt.subject].push(opt);
    });

    return groups;
}

/**
 * Senaryo seç ve PDF URL'sini döndür
 */
export function selectScenario(code: string): MEBScenario | null {
    const scenario = getScenarioByCode(code);
    return scenario || null;
}

/**
 * Senaryo kodunu çözümle
 */
export function resolveScenarioCode(code: string): { subject: string; grade: number } | null {
    return parseScenarioCode(code);
}

/**
 * Kullanıcı özel senaryolarını kaydet
 */
export function saveUserScenario(name: string, questions: QuestionConfig[]): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_SCENARIOS);
        const scenarios: Record<string, QuestionConfig[]> = stored ? JSON.parse(stored) : {};
        scenarios[name] = questions;
        localStorage.setItem(STORAGE_KEYS.USER_SCENARIOS, JSON.stringify(scenarios));
        return true;
    } catch (e) {
        console.error('Senaryo kaydedilemedi:', e);
        return false;
    }
}

/**
 * Kullanıcı özel senaryolarını getir
 */
export function getUserScenarios(): Record<string, QuestionConfig[]> {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_SCENARIOS);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
}

/**
 * Kullanıcı senaryosunu sil
 */
export function deleteUserScenario(name: string): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER_SCENARIOS);
        if (!stored) return false;
        const scenarios: Record<string, QuestionConfig[]> = JSON.parse(stored);
        delete scenarios[name];
        localStorage.setItem(STORAGE_KEYS.USER_SCENARIOS, JSON.stringify(scenarios));
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * MEB PDF'ini indir
 */
export async function downloadMEBPDF(code: string): Promise<Blob | null> {
    const scenario = getScenarioByCode(code);
    if (!scenario) return null;

    try {
        const response = await fetch(scenario.pdfUrl);
        if (!response.ok) throw new Error('PDF indirilemedi');
        return await response.blob();
    } catch (e) {
        console.error('PDF indirme hatası:', e);
        return null;
    }
}

/**
 * MEB PDF'ini yeni sekmede aç
 */
export function openMEBPDF(code: string): boolean {
    const scenario = getScenarioByCode(code);
    if (!scenario) return false;
    window.open(scenario.pdfUrl, '_blank');
    return true;
}

/**
 * Senaryo istatistiklerini getir
 */
export function getScenarioStats() {
    const scenarios = MEB_SCENARIOS_2025_2026_TERM_1;
    const subjects = [...new Set(scenarios.map(s => s.subject))];
    const grades = [...new Set(scenarios.map(s => s.grade))].sort((a, b) => a - b);

    return {
        totalScenarios: scenarios.length,
        totalSubjects: subjects.length,
        grades: grades,
        subjects: subjects,
        temelEgitim: scenarios.filter(s => s.level === 'temel').length,
        ortaOgretim: scenarios.filter(s => s.level === 'orta').length,
        academicYear: '2025-2026',
        term: 1,
        lastUpdated: '2025-10-21'
    };
}

/**
 * Senaryo arama
 */
export function searchScenarios(query: string): ScenarioOption[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return getScenarioOptions();

    return getScenarioOptions().filter(opt =>
        opt.code.toLowerCase().includes(normalizedQuery) ||
        opt.subject.toLowerCase().includes(normalizedQuery) ||
        opt.label.toLowerCase().includes(normalizedQuery) ||
        opt.grade.toString().includes(normalizedQuery)
    );
}

/**
 * Senaryo güncelleme kontrolü (gelecek için)
 * MEB'den yeni senaryo olup olmadığını kontrol eder
 */
export async function checkForScenarioUpdates(): Promise<{
    hasUpdates: boolean;
    message: string;
}> {
    // Bu fonksiyon gelecekte MEB sitesini tarayarak
    // yeni senaryo olup olmadığını kontrol edebilir
    const lastUpdate = localStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    const now = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, now);

    return {
        hasUpdates: false,
        message: `Son kontrol: ${new Date().toLocaleDateString('tr-TR')}`
    };
}

/**
 * Senaryo kodu formatını doğrula
 */
export function validateScenarioCode(code: string): boolean {
    const pattern = /^[a-z]+\d{1,2}[a-z]*$/i;
    return pattern.test(code);
}

/**
 * Benzersiz tüm senaryo kodlarını getir
 */
export function getAllScenarioCodes(): string[] {
    return MEB_SCENARIOS_2025_2026_TERM_1.map(s => s.code);
}

export { MEB_SCENARIOS_2025_2026_TERM_1, MEBScenario };
