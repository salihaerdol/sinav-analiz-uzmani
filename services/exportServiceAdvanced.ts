/**
 * Advanced Export Service - Web Site Identical PDF
 * Matches the website design exactly
 * Version 4.0 - Professional Web-like PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

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

// Colors matching website
const COLORS = {
    primary: [41, 128, 185],      // Blue
    primaryLight: [52, 152, 219],
    success: [34, 197, 94],       // Green
    danger: [239, 68, 68],        // Red
    warning: [245, 158, 11],      // Orange
    slate800: [30, 41, 59],
    slate600: [71, 85, 105],
    slate500: [100, 116, 139],
    slate400: [148, 163, 184],
    slate200: [226, 232, 240],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
    indigo600: [79, 70, 229],
    indigo50: [238, 242, 255]
};

// Turkish character safe conversion
const tr = (text: string): string => {
    if (!text) return '';
    const map: Record<string, string> = {
        'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C', 'ı': 'i', 'İ': 'I'
    };
    return text.replace(/[şŞğĞüÜöÖçÇıİ]/g, char => map[char] || char);
};

// Draw rounded rectangle
const drawCard = (doc: jsPDF, x: number, y: number, w: number, h: number, fill: number[], border?: number[]) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    if (border) {
        doc.setDrawColor(border[0], border[1], border[2]);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, w, h, 3, 3, 'S');
    }
};

// Draw colored top border on card
const drawCardTopBorder = (doc: jsPDF, x: number, y: number, w: number, color: number[]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, w, 1.5, 'F');
};

// Calculate statistics
const calcStats = (students: Student[], questions: QuestionConfig[]) => {
    const maxPossible = questions.reduce((sum, q) => sum + q.maxScore, 0);
    const scores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
    const percentages = scores.map(s => (s / maxPossible) * 100);

    const mean = percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;
    const sorted = [...percentages].sort((a, b) => a - b);
    const median = sorted.length % 2 !== 0
        ? sorted[Math.floor(sorted.length / 2)]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = percentages.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / percentages.length;
    const stdDev = Math.sqrt(variance);

    return {
        scores,
        percentages,
        max: scores.length > 0 ? Math.max(...scores) : 0,
        min: scores.length > 0 ? Math.min(...scores) : 0,
        maxPossible,
        mean,
        median,
        stdDev
    };
};

/**
 * Main PDF Export - Website-identical design
 */
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: {
        overview?: string;
        questionChart?: string;
        outcomeChart?: string;
        histogramChart?: string;
        radarChart?: string;
        gradePieChart?: string;
        questionSuccessChart?: string;
        cognitiveChart?: string;
        difficultyChart?: string;
    } = {},
    language: Language = 'tr',
    _options: Partial<ExportOptions> = {}
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 12; // margin
    const cw = pw - (m * 2); // content width

    const stats = calcStats(students, questions);
    const isPass = analysis.classAverage >= 50;

    // ========== PAGE 1: SUMMARY DASHBOARD ==========

    // Header bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pw, 25, 'F');

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SINAV ANALIZ RAPORU', pw / 2, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${tr(metadata.schoolName)} | ${tr(metadata.className)} | ${tr(metadata.subject)}`, pw / 2, 20, { align: 'center' });

    let y = 32;

    // Info row
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate600);
    doc.text(`${tr(metadata.academicYear)} | ${metadata.term}. Donem | ${metadata.examNumber}. Sinav | ${metadata.date}`, m, y);
    doc.text(`Ogretmen: ${tr(metadata.teacherName)}`, pw - m, y, { align: 'right' });

    y += 10;

    // ========== 4 STAT CARDS (like website) ==========
    const cardW = (cw - 9) / 4;
    const cardH = 32;
    const cardColors = [
        isPass ? COLORS.success : COLORS.danger,
        [59, 130, 246], // blue
        COLORS.danger,
        COLORS.success
    ];
    const cardLabels = ['SINIF ORTALAMASI', 'OGRENCI SAYISI', 'BASARISIZ KAZANIM', 'EN YUKSEK PUAN'];
    const cardValues = [
        `%${analysis.classAverage.toFixed(1)}`,
        students.length.toString(),
        analysis.outcomeStats.filter(o => o.isFailed).length.toString(),
        stats.max.toString()
    ];

    for (let i = 0; i < 4; i++) {
        const cx = m + i * (cardW + 3);

        // Card background
        drawCard(doc, cx, y, cardW, cardH, COLORS.white, COLORS.slate200);

        // Top border color
        drawCardTopBorder(doc, cx, y, cardW, cardColors[i]);

        // Label
        doc.setFontSize(6);
        doc.setTextColor(...COLORS.slate500);
        doc.setFont('helvetica', 'bold');
        doc.text(cardLabels[i], cx + cardW / 2, y + 12, { align: 'center' });

        // Value
        doc.setFontSize(16);
        doc.setTextColor(...COLORS.slate800);
        doc.text(cardValues[i], cx + cardW / 2, y + 25, { align: 'center' });
    }

    y += cardH + 10;

    // ========== CHARTS SECTION (2x2 grid) ==========
    const chartW = (cw - 4) / 2;
    const chartH = 50;

    // Row 1
    if (chartImages.gradePieChart || chartImages.radarChart) {
        // Left chart - Grade Distribution
        drawCard(doc, m, y, chartW, chartH + 8, COLORS.white, COLORS.slate200);
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.slate800);
        doc.setFont('helvetica', 'bold');
        doc.text('Not Dagilimi', m + 4, y + 8);

        if (chartImages.gradePieChart) {
            try {
                doc.addImage(chartImages.gradePieChart, 'PNG', m + 2, y + 12, chartW - 4, chartH - 8);
            } catch (e) { console.warn('Chart error'); }
        }

        // Right chart - Radar
        drawCard(doc, m + chartW + 4, y, chartW, chartH + 8, COLORS.white, COLORS.slate200);
        doc.text('Kazanim Haritasi', m + chartW + 8, y + 8);

        if (chartImages.radarChart) {
            try {
                doc.addImage(chartImages.radarChart, 'PNG', m + chartW + 6, y + 12, chartW - 4, chartH - 8);
            } catch (e) { console.warn('Chart error'); }
        }

        y += chartH + 14;
    }

    // Row 2 - Histogram & Question Success
    if (chartImages.histogramChart || chartImages.questionSuccessChart) {
        // Left - Histogram
        drawCard(doc, m, y, chartW, chartH + 8, COLORS.white, COLORS.slate200);
        doc.setFontSize(9);
        doc.text('Puan Dagilimi', m + 4, y + 8);

        if (chartImages.histogramChart) {
            try {
                doc.addImage(chartImages.histogramChart, 'PNG', m + 2, y + 12, chartW - 4, chartH - 8);
            } catch (e) { console.warn('Chart error'); }
        }

        // Right - Question Success
        drawCard(doc, m + chartW + 4, y, chartW, chartH + 8, COLORS.white, COLORS.slate200);
        doc.text('Soru Basari Analizi', m + chartW + 8, y + 8);

        if (chartImages.questionSuccessChart) {
            try {
                doc.addImage(chartImages.questionSuccessChart, 'PNG', m + chartW + 6, y + 12, chartW - 4, chartH - 8);
            } catch (e) { console.warn('Chart error'); }
        }

        y += chartH + 14;
    }

    // ========== STATISTICS CARDS ==========
    y = Math.min(y, ph - 50);

    const statCardW = (cw - 9) / 4;
    const statCardH = 20;
    const statLabels = ['STD. SAPMA', 'MEDYAN', 'EN YUKSEK', 'EN DUSUK'];
    const statValues = [stats.stdDev.toFixed(1), stats.median.toFixed(1), stats.max.toString(), stats.min.toString()];
    const statColors = [COLORS.slate600, COLORS.slate600, COLORS.success, COLORS.danger];

    drawCard(doc, m, y, cw, statCardH + 10, COLORS.slate50, COLORS.slate200);

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slate800);
    doc.setFont('helvetica', 'bold');
    doc.text('Detayli Istatistikler', m + 4, y + 6);

    for (let i = 0; i < 4; i++) {
        const sx = m + 4 + i * (statCardW + 2);

        drawCard(doc, sx, y + 10, statCardW - 2, statCardH - 4, COLORS.white, COLORS.slate200);

        doc.setFontSize(6);
        doc.setTextColor(...COLORS.slate500);
        doc.text(statLabels[i], sx + (statCardW - 2) / 2, y + 16, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(statColors[i][0], statColors[i][1], statColors[i][2]);
        doc.setFont('helvetica', 'bold');
        doc.text(statValues[i], sx + (statCardW - 2) / 2, y + 25, { align: 'center' });
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slate400);
    doc.text('Sinav Analiz Uzmani | Sayfa 1', pw / 2, ph - 6, { align: 'center' });

    // ========== PAGE 2: SORU BAZLI ANALIZ ==========
    doc.addPage();
    y = 15;

    // Section Header
    drawCard(doc, m, y, cw, 12, COLORS.slate50, COLORS.slate200);
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.slate800);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Soru Bazli Analiz', m + 4, y + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.slate500);
    doc.text('Her bir sorunun ortalama puani ve basari yuzdesi', m + 50, y + 8);

    y += 16;

    // Question Table
    const qRows = analysis.questionStats.map((q, idx) => {
        const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
        return [
            (idx + 1).toString(),
            tr(q.outcome.code),
            tr(q.outcome.description.length > 50 ? q.outcome.description.substring(0, 50) + '...' : q.outcome.description),
            maxQ.toString(),
            q.averageScore.toFixed(1),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Soru', 'Kod', 'Kazanim', 'Maks', 'Ort.', 'Basari']],
        body: qRows,
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: COLORS.slate200,
            lineWidth: 0.1,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: COLORS.white,
            textColor: COLORS.slate800,
            fontStyle: 'bold',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: COLORS.slate50
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 22, fontStyle: 'bold', textColor: COLORS.indigo600 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 14, halign: 'center' },
            5: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: m, right: m },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) {
                    data.cell.styles.textColor = COLORS.danger;
                    data.cell.styles.fillColor = [254, 242, 242];
                } else if (val >= 75) {
                    data.cell.styles.textColor = COLORS.success;
                    data.cell.styles.fillColor = [240, 253, 244];
                } else {
                    data.cell.styles.textColor = COLORS.warning;
                }
            }
        }
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ========== KAZANIM BAŞARI DURUMU ==========
    if (y > ph - 60) {
        doc.addPage();
        y = 15;
    }

    drawCard(doc, m, y, cw, 12, COLORS.slate50, COLORS.slate200);
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.slate800);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Kazanim Basari Durumu', m + 4, y + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.slate500);
    doc.text('Kazanimlarin basari durumu ve kritik seviye analizi', m + 60, y + 8);

    y += 16;

    const oRows = analysis.outcomeStats.map(o => [
        tr(o.code),
        tr(o.description.length > 55 ? o.description.substring(0, 55) + '...' : o.description),
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELISTIRILMELI' : 'BASARILI'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kazanim Kodu', 'Aciklama', 'Basari', 'Durum']],
        body: oRows,
        theme: 'plain',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: COLORS.slate200,
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: COLORS.white,
            textColor: COLORS.slate800,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: COLORS.slate50
        },
        columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: m, right: m },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'GELISTIRILMELI') {
                    data.cell.styles.textColor = COLORS.danger;
                    data.cell.styles.fillColor = [254, 242, 242];
                } else {
                    data.cell.styles.textColor = COLORS.success;
                    data.cell.styles.fillColor = [240, 253, 244];
                }
            }
        }
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slate400);
    doc.text('Sinav Analiz Uzmani | Sayfa 2', pw / 2, ph - 6, { align: 'center' });

    // ========== PAGE 3: ÖĞRENCI LİSTESİ ==========
    doc.addPage();
    y = 15;

    drawCard(doc, m, y, cw, 12, COLORS.slate50, COLORS.slate200);
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.slate800);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Ogrenci Performans Tablosu', m + 4, y + 8);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.slate500);
    doc.text('Puana gore siralanmis ogrenci listesi', m + 65, y + 8);

    y += 16;

    // Sort students
    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((sum: number, v: number) => sum + v, 0);
        const sb = Object.values(b.scores).reduce((sum: number, v: number) => sum + v, 0);
        return sb - sa;
    });

    const sRows = sortedStudents.map((s, idx) => {
        const total = Object.values(s.scores).reduce((sum: number, v: number) => sum + v, 0);
        const pct = (total / stats.maxPossible) * 100;
        return [
            (idx + 1).toString(),
            tr(s.name),
            total.toString(),
            `%${pct.toFixed(1)}`
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sira', 'Ogrenci Adi', 'Toplam Puan', 'Basari %']],
        body: sRows,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: COLORS.slate200,
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: COLORS.slate50
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: m, right: m },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) {
                    data.cell.styles.textColor = COLORS.danger;
                    data.cell.styles.fillColor = [254, 242, 242];
                } else if (val >= 85) {
                    data.cell.styles.textColor = COLORS.success;
                    data.cell.styles.fillColor = [240, 253, 244];
                }
            }
        }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // Signature area
    if (y > ph - 40) {
        doc.addPage();
        y = 20;
    }

    drawCard(doc, m, y, cw, 30, COLORS.indigo50);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.slate800);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapor Bilgileri', m + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate600);
    doc.text(`Hazirlayan: ${tr(metadata.teacherName)}`, m + 6, y + 16);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, m + 6, y + 22);

    doc.text('Imza:', pw - m - 40, y + 16);
    doc.setDrawColor(...COLORS.slate400);
    doc.line(pw - m - 40, y + 25, pw - m - 6, y + 25);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slate400);
    doc.text('Sinav Analiz Uzmani | Sayfa 3', pw / 2, ph - 6, { align: 'center' });

    // Save
    const safe = (s: string) => tr(s).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    doc.save(`${safe(metadata.className)}_${safe(metadata.subject)}_Analiz.pdf`);
};

// Quick export
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

// Bilingual export
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');
    await new Promise(r => setTimeout(r, 300));
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'en');
};

// Individual student reports
export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    const maxPossible = questions.reduce((sum, q) => sum + q.maxScore, 0);

    for (const student of students) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pw = doc.internal.pageSize.getWidth();
        const ph = doc.internal.pageSize.getHeight();
        const m = 15;

        const total = Object.values(student.scores).reduce((sum: number, v: number) => sum + v, 0);
        const pct = (total / maxPossible) * 100;
        const isPass = pct >= 50;

        // Header
        doc.setFillColor(...COLORS.primary);
        doc.rect(0, 0, pw, 30, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(tr(metadata.schoolName), pw / 2, 12, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${tr(metadata.subject)} - ${tr(metadata.className)}`, pw / 2, 22, { align: 'center' });

        let y = 40;

        // Student name
        doc.setTextColor(...COLORS.slate800);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Ogrenci: ${tr(student.name)}`, m, y);

        y += 12;

        // Score card
        drawCard(doc, m, y, pw - 2 * m, 25, isPass ? [240, 253, 244] : [254, 242, 242], isPass ? COLORS.success : COLORS.danger);

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isPass ? COLORS.success[0] : COLORS.danger[0], isPass ? COLORS.success[1] : COLORS.danger[1], isPass ? COLORS.success[2] : COLORS.danger[2]);
        doc.text(`%${pct.toFixed(1)}`, pw / 2, y + 16, { align: 'center' });

        y += 35;

        // Question table
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.slate800);
        doc.setFont('helvetica', 'bold');
        doc.text('Soru Bazli Sonuclar', m, y);
        y += 6;

        const qData = analysis.questionStats.map((q, idx) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [(idx + 1).toString(), tr(q.outcome.code), score.toString(), maxQ.toString()];
        });

        autoTable(doc, {
            startY: y,
            head: [['Soru', 'Kazanim', 'Alinan', 'Maks']],
            body: qData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: COLORS.primary, textColor: COLORS.white },
            margin: { left: m, right: m }
        });

        // Footer
        y = ph - 25;
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.slate600);
        doc.text(`Hazirlayan: ${tr(metadata.teacherName)}`, m, y);
        doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, m, y + 5);

        doc.text('Imza:', pw - m - 35, y);
        doc.line(pw - m - 35, y + 8, pw - m, y + 8);

        const safe = (s: string) => tr(s).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        doc.save(`${safe(student.name)}_Karne.pdf`);
        await new Promise(r => setTimeout(r, 150));
    }
};

// Get export scenarios
export const getExportScenarios = (language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: language === 'tr' ? 'Tam Rapor' : 'Full Report', description: language === 'tr' ? 'Tum detaylar' : 'All details' },
        { id: 'executive_summary' as ExportScenario, icon: '📋', name: language === 'tr' ? 'Ozet' : 'Summary', description: language === 'tr' ? 'Onemli bilgiler' : 'Key info' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: language === 'tr' ? 'Ogrenci Odakli' : 'Student Focus', description: language === 'tr' ? 'Detayli liste' : 'Detailed list' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: language === 'tr' ? 'Kazanim' : 'Outcomes', description: language === 'tr' ? 'Kazanim detay' : 'Outcome details' },
        { id: 'parent_report' as ExportScenario, icon: '👪', name: language === 'tr' ? 'Veli Raporu' : 'Parent Report', description: language === 'tr' ? 'Sade format' : 'Simple format' },
        { id: 'meb_standard' as ExportScenario, icon: '🏛️', name: language === 'tr' ? 'MEB' : 'Official', description: language === 'tr' ? 'Resmi format' : 'Official format' }
    ];
};
