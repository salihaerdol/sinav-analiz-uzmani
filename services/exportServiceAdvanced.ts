/**
 * PROFESSIONAL EXAM ANALYSIS REPORT
 * Version 8.0 - Enterprise Grade
 * Features: True Turkish Font Support, Professional Layout, MEB Standards
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// --- TYPES ---
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'executive_summary' | 'student_focused' | 'outcome_analysis' | 'parent_report' | 'meb_standard';

export interface ExportOptions {
    language: Language;
    scenario: ExportScenario;
    includeCharts: boolean;
    includeRecommendations: boolean;
    includeStudentList: boolean;
    compactMode: boolean;
}

// --- CONSTANTS & THEME ---
const THEME = {
    primary: [41, 50, 65] as [number, number, number],    // Dark Navy
    secondary: [238, 108, 77] as [number, number, number], // Burnt Orange
    accent: [61, 90, 128] as [number, number, number],     // Muted Blue
    light: [224, 251, 252] as [number, number, number],    // Pale Cyan
    gray: [152, 193, 217] as [number, number, number],     // Light Blue Gray
    text: [30, 30, 30] as [number, number, number],        // Almost Black
    success: [46, 196, 182] as [number, number, number],   // Teal
    warning: [255, 159, 28] as [number, number, number],   // Orange
    danger: [231, 29, 54] as [number, number, number],     // Red
    white: [255, 255, 255] as [number, number, number]
};

// --- HELPER FUNCTIONS ---

/**
 * Dosya adını güvenli hale getirir
 */
const safeFileName = (text: string): string => {
    return text
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_');
};

/**
 * Sayfa başlığı ve altbilgisi ekler
 */
const addPageHeaderFooter = (doc: jsPDF, metadata: ExamMetadata, pageNum: number, totalPages: number) => {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 15;

    // --- HEADER ---
    // Sol: MEB / Okul Bilgisi
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text(metadata.schoolName || 'OKUL ADI GİRİLMEMİŞ', m, 15);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${metadata.academicYear} Eğitim Öğretim Yılı | ${metadata.term}. Dönem ${metadata.examNumber}. ${metadata.subject} Sınavı`, m, 21);

    // Sağ: Tarih ve Sınıf
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text(metadata.className || 'SINIF', pw - m, 15, { align: 'right' });

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(metadata.date, pw - m, 21, { align: 'right' });

    // Çizgi
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(m, 25, pw - m, 25);

    // --- FOOTER ---
    doc.setDrawColor(200, 200, 200);
    doc.line(m, ph - 15, pw - m, ph - 15);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sınav Analiz Uzmanı - Otomatik Raporlama Sistemi', m, ph - 10);

    doc.text(`Sayfa ${pageNum} / ${totalPages}`, pw - m, ph - 10, { align: 'right' });
};

/**
 * İstatistik Hesaplama
 */
const calculateStats = (students: Student[], questions: QuestionConfig[]) => {
    const maxPossible = questions.reduce((s, q) => s + q.maxScore, 0);
    const scores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
    const pcts = scores.map(s => (s / maxPossible) * 100);

    const mean = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
    const sorted = [...pcts].sort((a, b) => a - b);
    const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = pcts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pcts.length;

    return {
        maxPossible,
        mean,
        median: median || 0,
        stdDev: Math.sqrt(variance) || 0,
        max: scores.length ? Math.max(...scores) : 0,
        min: scores.length ? Math.min(...scores) : 0,
        successCount: pcts.filter(p => p >= 50).length,
        failCount: pcts.filter(p => p < 50).length
    };
};

/**
 * MAIN EXPORT FUNCTION
 */
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    _language: Language = 'tr',
    _options: Partial<ExportOptions> = {}
) => {
    // 1. Initialize Document
    const doc = new jsPDF('p', 'mm', 'a4');

    // 2. Load Fonts (CRITICAL STEP)
    await addTurkishFontsToPDF(doc);

    const pw = doc.internal.pageSize.getWidth();
    const m = 15; // Margin
    const cw = pw - m * 2; // Content Width

    const stats = calculateStats(students, questions);

    // ==========================================
    // PAGE 1: EXECUTIVE SUMMARY & VISUALS
    // ==========================================

    addPageHeaderFooter(doc, metadata, 1, 3);

    let y = 35;

    // --- TITLE ---
    doc.setFontSize(24);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('SINAV SONUÇ ANALİZİ', pw / 2, y, { align: 'center' });

    y += 15;

    // --- SCORE CARD (CENTER) ---
    const scoreColor = analysis.classAverage >= 50 ? THEME.success : THEME.danger;

    // Box
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(pw / 2 - 40, y, 80, 35, 3, 3, 'F');

    // Label
    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('SINIF ORTALAMASI', pw / 2, y + 10, { align: 'center' });

    // Score
    doc.setFontSize(32);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`%${analysis.classAverage.toFixed(1)}`, pw / 2, y + 25, { align: 'center' });

    y += 45;

    // --- KEY METRICS GRID ---
    const gridY = y;
    const boxW = (cw - 10) / 3;
    const boxH = 25;

    // Box 1: Students
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m, gridY, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setTextColor(THEME.accent[0], THEME.accent[1], THEME.accent[2]);
    doc.setFont('Roboto', 'bold');
    doc.text(students.length.toString(), m + 10, gridY + 12);
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text('Öğrenci Sayısı', m + 10, gridY + 19);

    // Box 2: Success Rate
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m + boxW + 5, gridY, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setTextColor(THEME.success[0], THEME.success[1], THEME.success[2]);
    doc.setFont('Roboto', 'bold');
    doc.text(stats.successCount.toString(), m + boxW + 15, gridY + 12);
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text('Başarılı Öğrenci', m + boxW + 15, gridY + 19);

    // Box 3: Questions
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m + (boxW + 5) * 2, gridY, boxW, boxH, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setTextColor(THEME.secondary[0], THEME.secondary[1], THEME.secondary[2]);
    doc.setFont('Roboto', 'bold');
    doc.text(questions.length.toString(), m + (boxW + 5) * 2 + 10, gridY + 12);
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text('Soru Sayısı', m + (boxW + 5) * 2 + 10, gridY + 19);

    y += 35;

    // --- CHARTS SECTION ---
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('Görsel Analizler', m, y);

    y += 5;

    // Charts Layout (2x2 Grid)
    const chartW = (cw - 10) / 2;
    const chartH = 50;

    if (chartImages.gradePieChart) {
        try { doc.addImage(chartImages.gradePieChart, 'PNG', m, y, chartW, chartH); } catch (e) { }
    }
    if (chartImages.questionSuccessChart) {
        try { doc.addImage(chartImages.questionSuccessChart, 'PNG', m + chartW + 10, y, chartW, chartH); } catch (e) { }
    }

    y += chartH + 5;

    if (chartImages.histogramChart) {
        try { doc.addImage(chartImages.histogramChart, 'PNG', m, y, chartW, chartH); } catch (e) { }
    }
    if (chartImages.radarChart) {
        try { doc.addImage(chartImages.radarChart, 'PNG', m + chartW + 10, y, chartW, chartH); } catch (e) { }
    }

    // ==========================================
    // PAGE 2: DETAILED ANALYSIS (TABLES)
    // ==========================================
    doc.addPage();
    addPageHeaderFooter(doc, metadata, 2, 3);
    y = 35;

    // --- QUESTION ANALYSIS TABLE ---
    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('Soru ve Kazanım Analizi', m, y);
    y += 5;

    const qTableBody = analysis.questionStats.map((q, i) => {
        const question = questions.find(qu => qu.id === q.questionId);
        return [
            (i + 1).toString(),
            q.outcome.code || '-',
            q.outcome.description || 'Kazanım açıklaması yok',
            question?.maxScore.toString() || '0',
            q.averageScore.toFixed(1),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['No', 'Kod', 'Kazanım', 'Maks', 'Ort', 'Başarı']],
        body: qTableBody,
        theme: 'grid',
        styles: {
            font: 'Roboto',
            fontSize: 9,
            cellPadding: 3,
            textColor: [50, 50, 50],
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: THEME.primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' },
            5: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            // Colorize success rate
            if (data.section === 'body' && data.column.index === 5) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) data.cell.styles.textColor = THEME.danger;
                else if (val >= 80) data.cell.styles.textColor = THEME.success;
            }
        }
    });

    // ==========================================
    // PAGE 3: STUDENT LIST
    // ==========================================
    doc.addPage();
    addPageHeaderFooter(doc, metadata, 3, 3);
    y = 35;

    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('Öğrenci Sonuç Listesi', m, y);
    y += 5;

    // Sort students by score
    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((sum: number, v: number) => sum + v, 0);
        const sb = Object.values(b.scores).reduce((sum: number, v: number) => sum + v, 0);
        return sb - sa;
    });

    const sTableBody = sortedStudents.map((s, i) => {
        const total = Object.values(s.scores).reduce((sum: number, v: number) => sum + v, 0);
        const pct = (total / stats.maxPossible) * 100;
        return [
            (i + 1).toString(),
            s.student_number || '-',
            s.name,
            total.toString(),
            `%${pct.toFixed(0)}`,
            pct >= 50 ? 'Geçti' : 'Kaldı'
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
        body: sTableBody,
        theme: 'striped',
        styles: {
            font: 'Roboto',
            fontSize: 10,
            cellPadding: 4,
            textColor: [40, 40, 40]
        },
        headStyles: {
            fillColor: THEME.accent,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw?.toString();
                if (val === 'Kaldı') {
                    data.cell.styles.textColor = THEME.danger;
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = THEME.success;
                }
            }
        }
    });

    // Save
    const fileName = `${safeFileName(metadata.className)}_${safeFileName(metadata.subject)}_Analiz_Raporu.pdf`;
    doc.save(fileName);
};

// --- EXPORT WRAPPERS ---

export const quickExport = async (
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, language, { scenario });
};

export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');
};

export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    _language: Language = 'tr'
) => {
    const doc = new jsPDF('p', 'mm', 'a5'); // A5 for individual reports
    await addTurkishFontsToPDF(doc);

    const pw = doc.internal.pageSize.getWidth();
    const m = 10;
    const maxP = questions.reduce((s, q) => s + q.maxScore, 0);

    for (const student of students) {
        doc.addPage();
        // Delete first empty page if any (jsPDF quirk)
        if (doc.getNumberOfPages() > 1 && student === students[0]) doc.deletePage(1);

        // Header
        doc.setFontSize(14);
        doc.setFont('Roboto', 'bold');
        doc.text(metadata.schoolName, pw / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.text(`${metadata.subject} Sınav Sonuç Belgesi`, pw / 2, 22, { align: 'center' });

        // Student Info Box
        doc.setDrawColor(0);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(m, 30, pw - 2 * m, 25, 2, 2, 'FD');

        doc.setFontSize(12);
        doc.setFont('Roboto', 'bold');
        doc.text(student.name, m + 5, 40);

        const total = Object.values(student.scores).reduce((s: number, v: number) => s + v, 0);
        const pct = (total / maxP) * 100;

        doc.setFontSize(16);
        doc.setTextColor(pct >= 50 ? THEME.success[0] : THEME.danger[0], 0, 0);
        doc.text(`%${pct.toFixed(0)}`, pw - m - 10, 42, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(pct >= 50 ? 'BAŞARILI' : 'GELİŞTİRİLMELİ', pw - m - 10, 48, { align: 'right' });

        // Table
        const qData = analysis.questionStats.map((q, i) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [(i + 1).toString(), q.outcome.code, `${score} / ${maxQ}`];
        });

        autoTable(doc, {
            startY: 60,
            head: [['Soru', 'Kazanım', 'Puan']],
            body: qData,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 8 },
            headStyles: { fillColor: THEME.primary },
            margin: { left: m, right: m }
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Bu belge otomatik oluşturulmuştur.', pw / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`${safeFileName(metadata.className)}_Ogrenci_Karneleri.pdf`);
};

export const getExportScenarios = (_language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Kurumsal Rapor', description: 'Resmi format' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Karneleri', description: 'Bireysel sonuçlar' }
    ];
};
