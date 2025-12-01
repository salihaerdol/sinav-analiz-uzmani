/**
 * Service to fetch achievement codes and scenarios from MEB website
 * URL: https://odsgm.meb.gov.tr/www/1-donem-konu-soru-dagilim-tablolari-2025-2026/icerik/1474
 */

export interface MEBScenario {
    subject: string;
    grade: string;
    pdfUrl: string;
}

// MEB PDF links from the website
export const MEB_SCENARIOS: MEBScenario[] = [
    // Geography
    { subject: 'Coğrafya', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog12.pdf' },

    // History
    { subject: 'Tarih', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar9.pdf' },
    { subject: 'Tarih', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar10.pdf' },
    { subject: 'Tarih', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar11.pdf' },
    { subject: 'T.C. İnkılap Tarihi ve Atatürkçülük', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar12.pdf' },

    // Religious Education
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab9.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab10.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab11.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab12.pdf' },

    // English
    { subject: 'İngilizce', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg9.pdf' },
    { subject: 'İngilizce', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg10.pdf' },
    { subject: 'İngilizce', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg11.pdf' },
    { subject: 'İngilizce', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg12.pdf' },

    // Philosophy
    { subject: 'Felsefe', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel10.pdf' },
    { subject: 'Felsefe', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel11.pdf' },
];

/**
 * Get scenarios by grade level
 */
export function getScenariosByGrade(grade: string): MEBScenario[] {
    return MEB_SCENARIOS.filter(s => s.grade === grade);
}

/**
 * Get scenarios by subject
 */
export function getScenariosBySubject(subject: string): MEBScenario[] {
    return MEB_SCENARIOS.filter(s => s.subject === subject);
}

/**
 * Get scenario by grade and subject
 */
export function getScenario(grade: string, subject: string): MEBScenario | undefined {
    return MEB_SCENARIOS.find(s => s.grade === grade && s.subject === subject);
}

/**
 * Get all unique grades
 */
export function getAllGrades(): string[] {
    return Array.from(new Set(MEB_SCENARIOS.map(s => s.grade))).sort();
}

/**
 * Get all unique subjects
 */
export function getAllSubjects(): string[] {
    return Array.from(new Set(MEB_SCENARIOS.map(s => s.subject))).sort();
}

/**
 * Download PDF file (to be used in browser)
 */
export async function downloadMEBPDF(pdfUrl: string): Promise<Blob> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    return await response.blob();
}

/**
 * Parse achievement codes from PDF content
 * This is a placeholder - actual implementation would require PDF parsing library
 */
export async function extractAchievementsFromPDF(pdfBlob: Blob): Promise<string[]> {
    // TODO: Implement PDF parsing using pdf-parse or similar library
    // For now, return empty array
    console.warn('PDF parsing not yet implemented');
    return [];
}
