/**
 * ═══════════════════════════════════════════════════════════════
 * MEB SCRAPER (Basic)
 * ═══════════════════════════════════════════════════════════════
 * MEB senaryolarını yönetir - Basit versiyon
 */

export interface MEBScenario {
    subject: string;
    grade: string;
    pdfUrl: string;
}

export const MEB_SCENARIOS: MEBScenario[] = [
    { subject: 'Coğrafya', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/cog12.pdf' },
    { subject: 'Tarih', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar9.pdf' },
    { subject: 'Tarih', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar10.pdf' },
    { subject: 'Tarih', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar11.pdf' },
    { subject: 'T.C. İnkılap Tarihi ve Atatürkçülük', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/tar12.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab9.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab10.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab11.pdf' },
    { subject: 'Din Kültürü ve Ahlak Bilgisi', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/dkab12.pdf' },
    { subject: 'İngilizce', grade: '9', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg9.pdf' },
    { subject: 'İngilizce', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg10.pdf' },
    { subject: 'İngilizce', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg11.pdf' },
    { subject: 'İngilizce', grade: '12', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/ingg12.pdf' },
    { subject: 'Felsefe', grade: '10', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel10.pdf' },
    { subject: 'Felsefe', grade: '11', pdfUrl: 'https://cdn.eba.gov.tr/yardimcikaynaklar/2025/09/konusoru/fel11.pdf' }
];

export function getScenariosByGrade(grade: string): MEBScenario[] {
    return MEB_SCENARIOS.filter(s => s.grade === grade);
}

export function getScenariosBySubject(subject: string): MEBScenario[] {
    return MEB_SCENARIOS.filter(s => s.subject === subject);
}

export function getScenario(grade: string, subject: string): MEBScenario | undefined {
    return MEB_SCENARIOS.find(s => s.grade === grade && s.subject === subject);
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

export async function extractAchievementsFromPDF(pdfBlob: Blob): Promise<string[]> {
    console.warn('PDF parsing henüz uygulanmadı');
    return [];
}
