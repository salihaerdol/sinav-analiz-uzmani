/**
 * INFOGRAPHIC STYLE PDF Export
 * Modern, Visual, Professional Design
 * Version 6.0 - Turkish Character Support Fixed
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

// Infographic Color Palette
const C = {
    // Primary gradient colors
    gradientStart: [99, 102, 241] as [number, number, number],
    gradientEnd: [139, 92, 246] as [number, number, number],

    // Accent colors
    blue: [59, 130, 246] as [number, number, number],
    green: [16, 185, 129] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
    orange: [249, 115, 22] as [number, number, number],
    yellow: [234, 179, 8] as [number, number, number],
    pink: [236, 72, 153] as [number, number, number],
    cyan: [6, 182, 212] as [number, number, number],

    // Neutral
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    light: [243, 244, 246] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],

    // Status
    success: [34, 197, 94] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number]
};

/**
 * Türkçe karakterleri ASCII karşılıklarına dönüştür
 * jsPDF default fontları Türkçe karakterleri desteklemediği için bu gerekli
 */
const toASCII = (text: string): string => {
    if (!text) return '';
    const map: Record<string, string> = {
        'ş': 's', 'Ş': 'S',
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C',
        'ı': 'i', 'İ': 'I'
    };
    return text.split('').map(c => map[c] || c).join('');
};

/**
 * Metni satır satır böl (word wrap)
 */
const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    if (!text) return [''];

    // Ortalama karakter genişliği (helvetica için yaklaşık)
    const charWidth = fontSize * 0.5;
    const maxChars = Math.floor(maxWidth / charWidth);

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxChars) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
};

// Draw gradient header
const drawGradientHeader = (doc: jsPDF, h: number) => {
    const pw = doc.internal.pageSize.getWidth();
    const steps = 50;
    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.round(C.gradientStart[0] + (C.gradientEnd[0] - C.gradientStart[0]) * ratio);
        const g = Math.round(C.gradientStart[1] + (C.gradientEnd[1] - C.gradientStart[1]) * ratio);
        const b = Math.round(C.gradientStart[2] + (C.gradientEnd[2] - C.gradientStart[2]) * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, (h / steps) * i, pw, h / steps + 1, 'F');
    }
};

// Draw circle icon with emoji (simplified - just colored circle)
const drawCircleIcon = (doc: jsPDF, x: number, y: number, r: number, color: [number, number, number], label: string) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x, y, r, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(r * 0.8);
    doc.setFont('helvetica', 'bold');
    doc.text(label.charAt(0).toUpperCase(), x, y + r * 0.3, { align: 'center' });
};

// Draw horizontal bar
const drawBar = (doc: jsPDF, x: number, y: number, w: number, h: number, pct: number, color: [number, number, number]) => {
    // Background
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
    // Progress
    const pw = (pct / 100) * w;
    if (pw > 0) {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, y, Math.max(pw, h), h, h / 2, h / 2, 'F');
    }
};

// Draw stat block
const drawStatBlock = (doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string, sublabel: string, color: [number, number, number]) => {
    // Background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, w, h, 4, 4, 'F');

    // Left colored bar
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, 4, h, 2, 2, 'F');

    // Icon circle
    drawCircleIcon(doc, x + 18, y + h / 2, 8, color, label);

    // Value
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text(value, x + 32, y + h / 2 - 2);

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.text(toASCII(sublabel), x + 32, y + h / 2 + 6);
};

// Calculate stats
const calcStats = (students: Student[], questions: QuestionConfig[]) => {
    const maxPossible = questions.reduce((s, q) => s + q.maxScore, 0);
    const scores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
    const pcts = scores.map(s => (s / maxPossible) * 100);
    const mean = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
    const sorted = [...pcts].sort((a, b) => a - b);
    const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = pcts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pcts.length;
    return { scores, pcts, maxPossible, mean, median, stdDev: Math.sqrt(variance), max: scores.length ? Math.max(...scores) : 0, min: scores.length ? Math.min(...scores) : 0 };
};

/**
 * INFOGRAPHIC PDF EXPORT
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
    const m = 10;
    const cw = pw - m * 2;

    const stats = calcStats(students, questions);
    const failedOutcomes = analysis.outcomeStats.filter(o => o.isFailed).length;
    const passedOutcomes = analysis.outcomeStats.length - failedOutcomes;

    // ============ PAGE 1: INFOGRAPHIC DASHBOARD ============

    // Gradient Header
    drawGradientHeader(doc, 55);

    // White decorative circles in header
    doc.setFillColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.circle(-10, 30, 40, 'F');
    doc.circle(pw + 20, 15, 35, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SINAV ANALIZ RAPORU', pw / 2, 22, { align: 'center' });

    // Subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(toASCII(metadata.schoolName), pw / 2, 32, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`${toASCII(metadata.className)} | ${toASCII(metadata.subject)} | ${metadata.date}`, pw / 2, 40, { align: 'center' });

    // Big Score Circle
    let y = 65;
    const scoreColor = analysis.classAverage >= 50 ? C.success : C.danger;

    // Large central score display
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.circle(pw / 2, y + 25, 28, 'F');

    // Inner white circle
    doc.setFillColor(255, 255, 255);
    doc.circle(pw / 2, y + 25, 22, 'F');

    // Score text
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`%${analysis.classAverage.toFixed(0)}`, pw / 2, y + 27, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.text('SINIF ORTALAMASI', pw / 2, y + 35, { align: 'center' });

    y += 60;

    // 4 Stat Blocks in a row
    const blockW = (cw - 15) / 4;
    const blockH = 28;
    const blocks = [
        { icon: 'O', value: students.length.toString(), label: 'OGRENCI', color: C.blue },
        { icon: 'S', value: questions.length.toString(), label: 'SORU', color: C.cyan },
        { icon: 'B', value: passedOutcomes.toString(), label: 'BASARILI', color: C.green },
        { icon: 'X', value: failedOutcomes.toString(), label: 'BASARISIZ', color: C.red }
    ];

    blocks.forEach((b, i) => {
        drawStatBlock(doc, m + i * (blockW + 5), y, blockW, blockH, b.icon, b.value, b.label, b.color);
    });

    y += blockH + 12;

    // Charts Section Title
    doc.setFillColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
    doc.roundedRect(m, y, cw, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('GORSEL ANALIZ', m + 5, y + 5.5);

    y += 12;

    // Charts Grid (2x2)
    const chartW = (cw - 6) / 2;
    const chartH = 45;

    // Chart 1: Grade Distribution
    if (chartImages.gradePieChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Not Dagilimi', m + 3, y + 6);
        try { doc.addImage(chartImages.gradePieChart, 'PNG', m + 2, y + 9, chartW - 4, chartH - 12); } catch (e) { }
    }

    // Chart 2: Radar
    if (chartImages.radarChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m + chartW + 6, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Kazanim Haritasi', m + chartW + 9, y + 6);
        try { doc.addImage(chartImages.radarChart, 'PNG', m + chartW + 8, y + 9, chartW - 4, chartH - 12); } catch (e) { }
    }

    y += chartH + 4;

    // Chart 3: Histogram
    if (chartImages.histogramChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Puan Dagilimi', m + 3, y + 6);
        try { doc.addImage(chartImages.histogramChart, 'PNG', m + 2, y + 9, chartW - 4, chartH - 12); } catch (e) { }
    }

    // Chart 4: Question Success
    if (chartImages.questionSuccessChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m + chartW + 6, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Soru Basarisi', m + chartW + 9, y + 6);
        try { doc.addImage(chartImages.questionSuccessChart, 'PNG', m + chartW + 8, y + 9, chartW - 4, chartH - 12); } catch (e) { }
    }

    y = ph - 25;

    // Statistics Footer Bar
    doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.roundedRect(m, y, cw, 18, 3, 3, 'F');

    const statItems = [
        { label: 'Std. Sapma', value: stats.stdDev.toFixed(1) },
        { label: 'Medyan', value: stats.median.toFixed(1) },
        { label: 'En Yuksek', value: stats.max.toString() },
        { label: 'En Dusuk', value: stats.min.toString() }
    ];

    const statW = cw / 4;
    statItems.forEach((s, i) => {
        doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(s.label.toUpperCase(), m + 8 + i * statW, y + 6);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(s.value, m + 8 + i * statW, y + 14);
    });

    // Page number
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(7);
    doc.text('Sayfa 1/3', pw - m, ph - 5, { align: 'right' });

    // ============ PAGE 2: QUESTION & OUTCOME ANALYSIS ============
    doc.addPage();

    // Mini header
    doc.setFillColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
    doc.rect(0, 0, pw, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAYLI ANALIZ', pw / 2, 10, { align: 'center' });

    y = 22;

    // Section: Question Analysis with bars
    doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.roundedRect(m, y, cw, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('SORU BAZLI BASARI', m + 5, y + 5.5);

    y += 12;

    // Question bars (visual)
    analysis.questionStats.slice(0, 10).forEach((q, i) => {
        const barColor = q.successRate < 50 ? C.red : q.successRate < 75 ? C.orange : C.green;

        // Question number circle
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.circle(m + 6, y + 4, 5, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text((i + 1).toString(), m + 6, y + 5.5, { align: 'center' });

        // Outcome code
        doc.setTextColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
        doc.setFontSize(6);
        doc.text(toASCII(q.outcome.code), m + 14, y + 3);

        // Progress bar
        drawBar(doc, m + 14, y + 5, cw - 40, 4, q.successRate, barColor);

        // Percentage
        doc.setTextColor(barColor[0], barColor[1], barColor[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`%${q.successRate.toFixed(0)}`, pw - m - 5, y + 7, { align: 'right' });

        y += 11;
    });

    y += 5;

    // Section: Outcome Status
    doc.setFillColor(C.cyan[0], C.cyan[1], C.cyan[2]);
    doc.roundedRect(m, y, cw, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('KAZANIM DURUMU', m + 5, y + 5.5);

    y += 12;

    // Outcome cards grid
    const outcomeCardW = (cw - 4) / 2;
    const outcomeCardH = 14;

    analysis.outcomeStats.slice(0, 8).forEach((o, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const ox = m + col * (outcomeCardW + 4);
        const oy = y + row * (outcomeCardH + 3);

        const cardColor = o.isFailed ? C.red : C.green;
        const bgColor: [number, number, number] = o.isFailed ? [254, 242, 242] : [240, 253, 244];

        // Card
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(ox, oy, outcomeCardW, outcomeCardH, 2, 2, 'F');

        // Left border
        doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
        doc.roundedRect(ox, oy, 3, outcomeCardH, 1, 1, 'F');

        // Code
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(toASCII(o.code), ox + 6, oy + 5);

        // Description (truncated)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
        const desc = toASCII(o.description);
        doc.text(desc.length > 40 ? desc.substring(0, 40) + '...' : desc, ox + 6, oy + 10);

        // Percentage badge
        doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
        doc.roundedRect(ox + outcomeCardW - 18, oy + 3, 15, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(`%${o.successRate.toFixed(0)}`, ox + outcomeCardW - 10.5, oy + 8.5, { align: 'center' });
    });

    // Page number
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(7);
    doc.text('Sayfa 2/3', pw - m, ph - 5, { align: 'right' });

    // ============ PAGE 3: STUDENT RANKING ============
    doc.addPage();

    // Mini header
    doc.setFillColor(C.gradientEnd[0], C.gradientEnd[1], C.gradientEnd[2]);
    doc.rect(0, 0, pw, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OGRENCI SIRALAMA', pw / 2, 10, { align: 'center' });

    y = 22;

    // Top 3 podium
    const sorted = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((sum: number, v: number) => sum + v, 0);
        const sb = Object.values(b.scores).reduce((sum: number, v: number) => sum + v, 0);
        return sb - sa;
    });

    if (sorted.length >= 3) {
        const podiumColors = [C.yellow, C.gray, C.orange];
        const podiumLabels = ['1.', '2.', '3.'];
        const podiumHeights = [35, 28, 24];
        const podiumX = [pw / 2 - 25, pw / 2 - 70, pw / 2 + 20];

        for (let i = 0; i < 3; i++) {
            if (sorted[i]) {
                const px = podiumX[i];
                const score = Object.values(sorted[i].scores).reduce((sum: number, v: number) => sum + v, 0);
                const pct = (score / stats.maxPossible) * 100;

                // Podium block
                doc.setFillColor(podiumColors[i][0], podiumColors[i][1], podiumColors[i][2]);
                doc.roundedRect(px, y + 40 - podiumHeights[i], 40, podiumHeights[i], 3, 3, 'F');

                // Rank
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(podiumLabels[i], px + 20, y + 48 - podiumHeights[i], { align: 'center' });

                // Name above
                doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
                doc.setFontSize(8);
                const studentName = sorted[i].name.length > 15 ? sorted[i].name.substring(0, 15) : sorted[i].name;
                doc.text(toASCII(studentName), px + 20, y + 25 - podiumHeights[i], { align: 'center' });

                // Score
                doc.setFontSize(7);
                doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
                doc.text(`%${pct.toFixed(0)}`, px + 20, y + 32 - podiumHeights[i], { align: 'center' });
            }
        }
    }

    y += 55;

    // Full student table
    doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.roundedRect(m, y, cw, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('TUM OGRENCILER', m + 5, y + 5.5);

    y += 10;

    const sRows = sorted.map((s, i) => {
        const total = Object.values(s.scores).reduce((sum: number, v: number) => sum + v, 0);
        const pct = (total / stats.maxPossible) * 100;
        return [(i + 1).toString(), toASCII(s.name), total.toString(), `%${pct.toFixed(1)}`];
    });

    autoTable(doc, {
        startY: y,
        head: [['#', 'Ogrenci', 'Puan', 'Basari']],
        body: sRows,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: C.light as [number, number, number], textColor: C.dark as [number, number, number], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: m, right: m },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const v = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                data.cell.styles.textColor = v < 50 ? C.red : v >= 85 ? C.green : C.dark;
            }
            if (data.section === 'body' && data.column.index === 0) {
                const rank = parseInt(data.cell.raw?.toString() || '0');
                if (rank <= 3) data.cell.styles.textColor = C.gradientStart;
            }
        }
    });

    // Footer with signature
    y = ph - 28;
    doc.setFillColor(C.light[0], C.light[1], C.light[2]);
    doc.roundedRect(m, y, cw, 22, 3, 3, 'F');

    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapor Bilgileri', m + 5, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.text(`Hazirlayan: ${toASCII(metadata.teacherName)}`, m + 5, y + 12);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, m + 5, y + 17);

    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text('Imza:', pw - m - 35, y + 12);
    doc.setDrawColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.line(pw - m - 35, y + 17, pw - m - 5, y + 17);

    // Page number
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(7);
    doc.text('Sayfa 3/3', pw - m, ph - 5, { align: 'right' });

    // Save
    const safe = (s: string) => toASCII(s).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    doc.save(`${safe(metadata.className)}_${safe(metadata.subject)}_Infografik.pdf`);
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

// Bilingual
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');
};

// Individual reports
export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    const maxP = questions.reduce((s, q) => s + q.maxScore, 0);

    for (const student of students) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pw = doc.internal.pageSize.getWidth();
        const m = 12;

        const total = Object.values(student.scores).reduce((s: number, v: number) => s + v, 0);
        const pct = (total / maxP) * 100;
        const pass = pct >= 50;

        // Header
        drawGradientHeader(doc, 35);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(toASCII(metadata.schoolName), pw / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`${toASCII(metadata.subject)} - ${toASCII(metadata.className)}`, pw / 2, 25, { align: 'center' });

        let y = 45;

        // Student card
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, pw - 2 * m, 35, 4, 4, 'F');

        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(toASCII(student.name), m + 8, y + 12);

        // Score circle
        const scoreColor = pass ? C.success : C.danger;
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.circle(pw - m - 25, y + 17, 15, 'F');
        doc.setFillColor(255, 255, 255);
        doc.circle(pw - m - 25, y + 17, 11, 'F');

        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.setFontSize(12);
        doc.text(`%${pct.toFixed(0)}`, pw - m - 25, y + 19, { align: 'center' });

        y += 45;

        // Question results
        doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
        doc.roundedRect(m, y, pw - 2 * m, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('SORU SONUCLARI', m + 5, y + 5.5);

        y += 12;

        const qData = analysis.questionStats.map((q, i) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [(i + 1).toString(), toASCII(q.outcome.code), score.toString(), maxQ.toString()];
        });

        autoTable(doc, {
            startY: y,
            head: [['#', 'Kazanim', 'Alinan', 'Maks']],
            body: qData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: C.gradientStart as [number, number, number], textColor: C.white as [number, number, number] },
            margin: { left: m, right: m }
        });

        const safe = (s: string) => toASCII(s).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        doc.save(`${safe(student.name)}_Karne.pdf`);
        await new Promise(r => setTimeout(r, 100));
    }
};

// Get scenarios
export const getExportScenarios = (language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Infografik', description: 'Gorsel rapor' },
        { id: 'executive_summary' as ExportScenario, icon: '📋', name: 'Ozet', description: 'Onemli bilgiler' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Ogrenci', description: 'Detayli liste' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: 'Kazanim', description: 'Kazanim analizi' },
        { id: 'parent_report' as ExportScenario, icon: '👪', name: 'Veli', description: 'Sade format' },
        { id: 'meb_standard' as ExportScenario, icon: '🏛️', name: 'MEB', description: 'Resmi format' }
    ];
};
