/**
 * ═══════════════════════════════════════════════════════════════
 * MEB SCRAPER (Advanced)
 * ═══════════════════════════════════════════════════════════════
 * MEB konu-soru dağılım tablolarını yönetir
 */

export interface MEBScenario {
    subject: string;
    grade: string;
    pdfUrl: string;
    academicYear: string;
    term: '1' | '2';
}

export const CURRENT_ACADEMIC_YEAR = '2025-2026';
export const CURRENT_TERM = '1';

export const MEB_SCENARIOS: MEBScenario[] = [
    // İngilizce
    { subject: 'İngilizce', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg9.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'İngilizce', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg10.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'İngilizce', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg11.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'İngilizce', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg12.pdf', academicYear: '2025-2026', term: '1' },

    // Tarih
    { subject: 'Tarih', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar9.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Tarih', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar10.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Tarih', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar11.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'T.C. İnkılap Tarihi ve Atatürkçülük', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar12.pdf', academicYear: '2025-2026', term: '1' },

    // Din Kültürü
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab9.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab10.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab11.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab12.pdf', academicYear: '2025-2026', term: '1' },

    // Felsefe
    { subject: 'Felsefe', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel10.pdf', academicYear: '2025-2026', term: '1' },
    { subject: 'Felsefe', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel11.pdf', academicYear: '2025-2026', term: '1' },

    // Coğrafya
    { subject: 'Coğrafya', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog12.pdf', academicYear: '2025-2026', term: '1' }
];

export function getCurrentScenarios(): MEBScenario[] {
    return MEB_SCENARIOS.filter(s => s.academicYear === CURRENT_ACADEMIC_YEAR && s.term === CURRENT_TERM);
}

export function getScenarioByGradeAndSubject(grade: string, subject: string): MEBScenario | undefined {
    return getCurrentScenarios().find(s => s.grade === grade && s.subject.toLowerCase().includes(subject.toLowerCase()));
}

export function getScenariosByGrade(grade: string): MEBScenario[] {
    return getCurrentScenarios().filter(s => s.grade === grade);
}

export function getScenariosBySubject(subject: string): MEBScenario[] {
    return getCurrentScenarios().filter(s => s.subject === subject);
}

export function getAllGrades(): string[] {
    return Array.from(new Set(MEB_SCENARIOS.map(s => s.grade))).sort();
}

export function getAllSubjects(): string[] {
    return Array.from(new Set(MEB_SCENARIOS.map(s => s.subject))).sort();
}

export async function downloadMEBPDF(pdfUrl: string): Promise<Blob> {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`PDF indirilemedi: ${response.statusText}`);
    return await response.blob();
}
