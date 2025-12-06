/**
 * INFOGRAPHIC STYLE PDF Export
 * Modern, Visual, Professional Design
 * Version 7.0 - Complete Turkish Character Fix
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
    gradientStart: [99, 102, 241] as [number, number, number],
    gradientEnd: [139, 92, 246] as [number, number, number],
    blue: [59, 130, 246] as [number, number, number],
    green: [16, 185, 129] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
    orange: [249, 115, 22] as [number, number, number],
    yellow: [234, 179, 8] as [number, number, number],
    pink: [236, 72, 153] as [number, number, number],
    cyan: [6, 182, 212] as [number, number, number],
    dark: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    light: [243, 244, 246] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number]
};

/**
 * TURKCE KARAKTER DONUSTURUCU
 * Tum Turkce ozel karakterleri ASCII karsiliklarına cevirir
 * Bu fonksiyon HER ZAMAN kullanilmali
 */
const tr = (text: string | undefined | null): string => {
    if (!text) return '';

    // String'e donustur
    const str = String(text);

    // Karakter esleme tablosu
    const charMap: { [key: string]: string } = {
        'ş': 's', 'Ş': 'S',
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C',
        'ı': 'i', 'İ': 'I',
        'é': 'e', 'É': 'E',
        'â': 'a', 'Â': 'A',
        'î': 'i', 'Î': 'I',
        'û': 'u', 'Û': 'U'
    };

    // Her karakteri kontrol et ve donustur
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        result += charMap[char] || char;
    }

    return result;
};

/**
 * Dosya adi icin guvenli string olustur
 */
const safeFileName = (text: string): string => {
    return tr(text)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
};

// Gradient header ciz
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

// Yatay bar ciz
const drawBar = (doc: jsPDF, x: number, y: number, w: number, h: number, pct: number, color: [number, number, number]) => {
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
    const pw = (pct / 100) * w;
    if (pw > 0) {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(x, y, Math.max(pw, h), h, h / 2, h / 2, 'F');
    }
};

// Istatistik hesapla
const calcStats = (students: Student[], questions: QuestionConfig[]) => {
    const maxPossible = questions.reduce((s, q) => s + q.maxScore, 0);
    const scores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
    const pcts = scores.map(s => (s / maxPossible) * 100);
    const mean = pcts.length > 0 ? pcts.reduce((a, b) => a + b, 0) / pcts.length : 0;
    const sorted = [...pcts].sort((a, b) => a - b);
    const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = pcts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pcts.length;
    return {
        scores,
        pcts,
        maxPossible,
        mean,
        median: median || 0,
        stdDev: Math.sqrt(variance) || 0,
        max: scores.length ? Math.max(...scores) : 0,
        min: scores.length ? Math.min(...scores) : 0
    };
};

/**
 * ANA PDF EXPORT FONKSIYONU
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
    const m = 10; // margin
    const cw = pw - m * 2; // content width

    const stats = calcStats(students, questions);
    const failedOutcomes = analysis.outcomeStats.filter(o => o.isFailed).length;
    const passedOutcomes = analysis.outcomeStats.length - failedOutcomes;

    // ============ SAYFA 1: DASHBOARD ============

    // Gradient Header
    drawGradientHeader(doc, 50);

    // Baslik
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SINAV ANALIZ RAPORU', pw / 2, 20, { align: 'center' });

    // Alt baslik - TURKCE KARAKTERLER DONUSTURULDU
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(tr(metadata.schoolName), pw / 2, 30, { align: 'center' });

    doc.setFontSize(9);
    const subTitle = `${tr(metadata.className)} - ${tr(metadata.subject)} - ${metadata.date}`;
    doc.text(subTitle, pw / 2, 38, { align: 'center' });

    // Buyuk Skor Dairesi
    let y = 60;
    const scoreColor = analysis.classAverage >= 50 ? C.success : C.danger;

    // Dis daire
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.circle(pw / 2, y + 22, 26, 'F');

    // Ic beyaz daire
    doc.setFillColor(255, 255, 255);
    doc.circle(pw / 2, y + 22, 20, 'F');

    // Skor yazisi
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('%' + analysis.classAverage.toFixed(0), pw / 2, y + 25, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.text('SINIF ORTALAMASI', pw / 2, y + 33, { align: 'center' });

    y += 55;

    // 4 Istatistik Kutusu
    const boxW = (cw - 12) / 4;
    const boxH = 24;
    const boxData = [
        { label: 'OGRENCI', value: String(students.length), color: C.blue },
        { label: 'SORU', value: String(questions.length), color: C.cyan },
        { label: 'BASARILI', value: String(passedOutcomes), color: C.green },
        { label: 'BASARISIZ', value: String(failedOutcomes), color: C.red }
    ];

    boxData.forEach((box, i) => {
        const bx = m + i * (boxW + 4);

        // Kutu arkaplan
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(bx, y, boxW, boxH, 3, 3, 'F');

        // Sol renkli serit
        doc.setFillColor(box.color[0], box.color[1], box.color[2]);
        doc.roundedRect(bx, y, 3, boxH, 1.5, 1.5, 'F');

        // Deger
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(box.value, bx + 12, y + 10);

        // Etiket
        doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(box.label, bx + 12, y + 18);
    });

    y += boxH + 10;

    // Grafik Bolumu Basligi
    doc.setFillColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
    doc.roundedRect(m, y, cw, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('GORSEL ANALIZ', m + 4, y + 5);

    y += 10;

    // Grafik Grid (2x2)
    const chartW = (cw - 6) / 2;
    const chartH = 42;

    // Grafik 1: Not Dagilimi
    if (chartImages.gradePieChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Not Dagilimi', m + 3, y + 5);
        try { doc.addImage(chartImages.gradePieChart, 'PNG', m + 2, y + 8, chartW - 4, chartH - 11); } catch (e) { }
    }

    // Grafik 2: Radar
    if (chartImages.radarChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m + chartW + 6, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Kazanim Haritasi', m + chartW + 9, y + 5);
        try { doc.addImage(chartImages.radarChart, 'PNG', m + chartW + 8, y + 8, chartW - 4, chartH - 11); } catch (e) { }
    }

    y += chartH + 3;

    // Grafik 3: Histogram
    if (chartImages.histogramChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Puan Dagilimi', m + 3, y + 5);
        try { doc.addImage(chartImages.histogramChart, 'PNG', m + 2, y + 8, chartW - 4, chartH - 11); } catch (e) { }
    }

    // Grafik 4: Soru Basarisi
    if (chartImages.questionSuccessChart) {
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m + chartW + 6, y, chartW, chartH, 3, 3, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Soru Basarisi', m + chartW + 9, y + 5);
        try { doc.addImage(chartImages.questionSuccessChart, 'PNG', m + chartW + 8, y + 8, chartW - 4, chartH - 11); } catch (e) { }
    }

    // Alt Istatistik Cubugu
    y = ph - 22;
    doc.setFillColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.roundedRect(m, y, cw, 16, 3, 3, 'F');

    const footerStats = [
        { label: 'STD. SAPMA', value: stats.stdDev.toFixed(1) },
        { label: 'MEDYAN', value: stats.median.toFixed(1) },
        { label: 'EN YUKSEK', value: String(stats.max) },
        { label: 'EN DUSUK', value: String(stats.min) }
    ];

    const fsW = cw / 4;
    footerStats.forEach((fs, i) => {
        doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.text(fs.label, m + 6 + i * fsW, y + 5);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(fs.value, m + 6 + i * fsW, y + 12);
    });

    // Sayfa numarasi
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(6);
    doc.text('Sayfa 1/3', pw - m, ph - 4, { align: 'right' });

    // ============ SAYFA 2: SORU VE KAZANIM ANALIZI ============
    doc.addPage();

    // Mini header
    doc.setFillColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAYLI ANALIZ', pw / 2, 9, { align: 'center' });

    y = 20;

    // Soru Analizi Bolumu
    doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.roundedRect(m, y, cw, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('SORU BAZLI BASARI', m + 4, y + 5);

    y += 10;

    // Soru cubuk grafikleri
    analysis.questionStats.slice(0, 10).forEach((q, i) => {
        const barColor = q.successRate < 50 ? C.red : q.successRate < 75 ? C.orange : C.green;

        // Soru numarasi dairesi
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.circle(m + 5, y + 3, 4, 'F');
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(String(i + 1), m + 5, y + 4.5, { align: 'center' });

        // Kazanim kodu - TURKCE DONUSTURULDU
        doc.setTextColor(C.gradientStart[0], C.gradientStart[1], C.gradientStart[2]);
        doc.setFontSize(5);
        doc.text(tr(q.outcome.code), m + 12, y + 2);

        // Ilerleme cubugu
        drawBar(doc, m + 12, y + 4, cw - 38, 3, q.successRate, barColor);

        // Yuzde
        doc.setTextColor(barColor[0], barColor[1], barColor[2]);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('%' + q.successRate.toFixed(0), pw - m - 4, y + 5, { align: 'right' });

        y += 10;
    });

    y += 3;

    // Kazanim Durumu Bolumu
    doc.setFillColor(C.cyan[0], C.cyan[1], C.cyan[2]);
    doc.roundedRect(m, y, cw, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('KAZANIM DURUMU', m + 4, y + 5);

    y += 10;

    // Kazanim kartlari
    const cardW = (cw - 4) / 2;
    const cardH = 12;

    analysis.outcomeStats.slice(0, 8).forEach((o, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = m + col * (cardW + 4);
        const cy = y + row * (cardH + 2);

        const cardColor = o.isFailed ? C.red : C.green;
        const bgColor: [number, number, number] = o.isFailed ? [254, 242, 242] : [240, 253, 244];

        // Kart arkaplan
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'F');

        // Sol kenar
        doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
        doc.roundedRect(cx, cy, 2.5, cardH, 1, 1, 'F');

        // Kod - TURKCE DONUSTURULDU
        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(tr(o.code), cx + 5, cy + 4);

        // Aciklama - TURKCE DONUSTURULDU
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(4);
        doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
        const desc = tr(o.description);
        doc.text(desc.length > 45 ? desc.substring(0, 45) + '...' : desc, cx + 5, cy + 8.5);

        // Yuzde rozeti
        doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
        doc.roundedRect(cx + cardW - 15, cy + 2, 13, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(5);
        doc.setFont('helvetica', 'bold');
        doc.text('%' + o.successRate.toFixed(0), cx + cardW - 8.5, cy + 6.5, { align: 'center' });
    });

    // Sayfa numarasi
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(6);
    doc.text('Sayfa 2/3', pw - m, ph - 4, { align: 'right' });

    // ============ SAYFA 3: OGRENCI SIRALAMASI ============
    doc.addPage();

    // Mini header
    doc.setFillColor(C.gradientEnd[0], C.gradientEnd[1], C.gradientEnd[2]);
    doc.rect(0, 0, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OGRENCI SIRALAMA', pw / 2, 9, { align: 'center' });

    y = 20;

    // Ogrencileri sirala
    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((sum: number, v: number) => sum + v, 0);
        const sb = Object.values(b.scores).reduce((sum: number, v: number) => sum + v, 0);
        return sb - sa;
    });

    // Podyum (ilk 3)
    if (sortedStudents.length >= 3) {
        const podiumColors = [C.yellow, C.gray, C.orange];
        const podiumLabels = ['1.', '2.', '3.'];
        const podiumHeights = [32, 26, 22];
        const podiumX = [pw / 2 - 22, pw / 2 - 62, pw / 2 + 18];

        for (let i = 0; i < 3; i++) {
            if (sortedStudents[i]) {
                const px = podiumX[i];
                const ph_i = podiumHeights[i];
                const score = Object.values(sortedStudents[i].scores).reduce((sum: number, v: number) => sum + v, 0);
                const pct = (score / stats.maxPossible) * 100;

                // Podyum blogu
                doc.setFillColor(podiumColors[i][0], podiumColors[i][1], podiumColors[i][2]);
                doc.roundedRect(px, y + 38 - ph_i, 38, ph_i, 3, 3, 'F');

                // Siralama
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(podiumLabels[i], px + 19, y + 46 - ph_i, { align: 'center' });

                // Isim - TURKCE DONUSTURULDU
                doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
                doc.setFontSize(7);
                const name = tr(sortedStudents[i].name);
                const displayName = name.length > 14 ? name.substring(0, 14) + '..' : name;
                doc.text(displayName, px + 19, y + 22 - ph_i, { align: 'center' });

                // Puan
                doc.setFontSize(6);
                doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
                doc.text('%' + pct.toFixed(0), px + 19, y + 28 - ph_i, { align: 'center' });
            }
        }
    }

    y += 52;

    // Ogrenci Tablosu Basligi
    doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
    doc.roundedRect(m, y, cw, 7, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('TUM OGRENCILER', m + 4, y + 5);

    y += 9;

    // Ogrenci tablosu verileri - TURKCE DONUSTURULDU
    const tableRows = sortedStudents.map((s, i) => {
        const total = Object.values(s.scores).reduce((sum: number, v: number) => sum + v, 0);
        const pct = (total / stats.maxPossible) * 100;
        return [String(i + 1), tr(s.name), String(total), '%' + pct.toFixed(1)];
    });

    autoTable(doc, {
        startY: y,
        head: [['#', 'Ogrenci', 'Puan', 'Basari']],
        body: tableRows,
        theme: 'plain',
        styles: {
            fontSize: 7,
            cellPadding: 2,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: C.light as [number, number, number],
            textColor: C.dark as [number, number, number],
            fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
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

    // Altbilgi
    const footerY = ph - 24;
    doc.setFillColor(C.light[0], C.light[1], C.light[2]);
    doc.roundedRect(m, footerY, cw, 18, 3, 3, 'F');

    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapor Bilgileri', m + 4, footerY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.text('Hazirlayan: ' + tr(metadata.teacherName), m + 4, footerY + 10);
    doc.text('Tarih: ' + new Date().toLocaleDateString('tr-TR'), m + 4, footerY + 14);

    doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
    doc.text('Imza:', pw - m - 30, footerY + 10);
    doc.setDrawColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.line(pw - m - 30, footerY + 14, pw - m - 4, footerY + 14);

    // Sayfa numarasi
    doc.setTextColor(C.gray[0], C.gray[1], C.gray[2]);
    doc.setFontSize(6);
    doc.text('Sayfa 3/3', pw - m, ph - 4, { align: 'right' });

    // DOSYA KAYDET - GUVENLI DOSYA ADI
    const fileName = `${safeFileName(metadata.className)}_${safeFileName(metadata.subject)}_Rapor.pdf`;
    doc.save(fileName);
};

// Hizli export
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

// Iki dilli export
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');
};

// Bireysel ogrenci raporlari
export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    _language: Language = 'tr'
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
        doc.text(tr(metadata.schoolName), pw / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text(tr(metadata.subject) + ' - ' + tr(metadata.className), pw / 2, 25, { align: 'center' });

        let y = 45;

        // Ogrenci karti
        doc.setFillColor(C.light[0], C.light[1], C.light[2]);
        doc.roundedRect(m, y, pw - 2 * m, 32, 4, 4, 'F');

        doc.setTextColor(C.dark[0], C.dark[1], C.dark[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(tr(student.name), m + 8, y + 12);

        // Skor dairesi
        const scoreColor = pass ? C.success : C.danger;
        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.circle(pw - m - 22, y + 16, 14, 'F');
        doc.setFillColor(255, 255, 255);
        doc.circle(pw - m - 22, y + 16, 10, 'F');

        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.setFontSize(11);
        doc.text('%' + pct.toFixed(0), pw - m - 22, y + 18, { align: 'center' });

        y += 42;

        // Soru sonuclari
        doc.setFillColor(C.blue[0], C.blue[1], C.blue[2]);
        doc.roundedRect(m, y, pw - 2 * m, 7, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('SORU SONUCLARI', m + 4, y + 5);

        y += 10;

        // Tablo verileri - TURKCE DONUSTURULDU
        const qData = analysis.questionStats.map((q, i) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [String(i + 1), tr(q.outcome.code), String(score), String(maxQ)];
        });

        autoTable(doc, {
            startY: y,
            head: [['#', 'Kazanim', 'Alinan', 'Maks']],
            body: qData,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2.5, font: 'helvetica' },
            headStyles: {
                fillColor: C.gradientStart as [number, number, number],
                textColor: C.white as [number, number, number]
            },
            margin: { left: m, right: m }
        });

        // Kaydet - GUVENLI DOSYA ADI
        const studentFileName = `${safeFileName(student.name)}_Karne.pdf`;
        doc.save(studentFileName);
        await new Promise(r => setTimeout(r, 100));
    }
};

// Export senaryolari listesi
export const getExportScenarios = (_language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Infografik', description: 'Gorsel rapor' },
        { id: 'executive_summary' as ExportScenario, icon: '📋', name: 'Ozet', description: 'Onemli bilgiler' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Ogrenci', description: 'Detayli liste' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: 'Kazanim', description: 'Kazanim analizi' },
        { id: 'parent_report' as ExportScenario, icon: '👪', name: 'Veli', description: 'Sade format' },
        { id: 'meb_standard' as ExportScenario, icon: '🏛️', name: 'MEB', description: 'Resmi format' }
    ];
};
