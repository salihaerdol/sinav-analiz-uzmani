/**
 * ═══════════════════════════════════════════════════════════════
 * PDF EXPORT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Basit, temiz, çalışan PDF export servisi.
 * 2 rapor türü: Tam Rapor ve Öğrenci Karneleri
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'student_cards';
type ChartKey = 'overview' | 'questionChart' | 'outcomeChart' | 'histogramChart' | 'radarChart' | 'gradePieChart' | 'questionSuccessChart' | 'cognitiveChart' | 'difficultyChart';
type ChartImages = Partial<Record<ChartKey, string>>;

// Dosya adı güvenliği
// Dosya adı güvenliği
function safeName(text: string): string {
    return text
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/[^a-zA-Z0-9]/g, '_');
}

// Türkçe karakter güvenliği ve büyük harf dönüşümü
function tr(text: string): string {
    if (!text) return '';
    return text;
}

function toUpperTr(text: string): string {
    if (!text) return '';
    return text.toLocaleUpperCase('tr-TR');
}

function toLowerTr(text: string): string {
    if (!text) return '';
    return text.toLocaleLowerCase('tr-TR');
}

function normalizeText(text: string): string {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

function drawChartCard(
    doc: jsPDF,
    options: {
        title: string;
        image?: string;
        x: number;
        y: number;
        width: number;
        height: number;
        hint?: string;
    }
) {
    const { title, image, x, y, width, height, hint } = options;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(title, x + 4, y + 8);

    const availableWidth = width - 10;
    const availableHeight = height - 16;

    if (image) {
        try {
            const props = doc.getImageProperties(image);
            let renderWidth = availableWidth;
            let renderHeight = renderWidth * (props.height / props.width);

            if (renderHeight > availableHeight) {
                renderHeight = availableHeight;
                renderWidth = renderHeight * (props.width / props.height);
            }

            const imgX = x + (width - renderWidth) / 2;
            const imgY = y + height - renderHeight - 4;
            doc.addImage(image, (props as any).fileType || 'PNG', imgX, imgY, renderWidth, renderHeight, undefined, 'FAST');
        } catch (error) {
            doc.setFont('Roboto', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            doc.text('Görsel eklenirken hata oluştu', x + 4, y + height - 6);
        }
    } else {
        doc.setFillColor(248, 250, 252);
        doc.rect(x + 4, y + 10, width - 8, height - 14, 'F');
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('Görsel hazır değil', x + width / 2, y + height / 2, { align: 'center' });
        if (hint) {
            doc.setFontSize(7);
            doc.text(hint, x + width / 2, y + height / 2 + 6, { align: 'center' });
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// TAM RAPOR
// ═══════════════════════════════════════════════════════════════
async function createFullReport(
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {}
) {
    const pageWidth = 210;
    const margin = 15;
    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
    const studentTotals = students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0));
    const maxScore = studentTotals.length ? Math.max(...studentTotals) : 0;
    const minScore = studentTotals.length ? Math.min(...studentTotals) : 0;
    const passCount = students.filter(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        return maxTotal > 0 ? (total / maxTotal * 100) >= 50 : false;
    }).length;

    // Başlık
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('SINAV SONUÇ ANALİZ RAPORU', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${toUpperTr(normalizeText(metadata.className))} - ${toUpperTr(normalizeText(metadata.subject))} | ${toUpperTr(normalizeText(metadata.examType))}`, pageWidth / 2, 22, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 28, pageWidth - margin, 28);

    let y = 32;

    // Metadata
    const infoBoxHeight = 24;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, infoBoxHeight, 2, 2, 'FD');

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Sınav Bilgileri', margin + 3, y + 7);

    // Tarih opsiyonel - sadece doluysa göster
    const infoLeft = [
        { label: 'Okul', value: normalizeText(metadata.schoolName || '-') },
        ...(metadata.date ? [{ label: 'Tarih', value: normalizeText(metadata.date) }] : []),
        { label: 'Öğretmen', value: normalizeText(metadata.teacherName || '-') }
    ];
    const infoRight = [
        { label: 'Ders', value: normalizeText(metadata.subject) },
        { label: 'Dönem/Sınav', value: normalizeText(`${metadata.term}. Dönem | ${metadata.examNumber}. ${metadata.examType}`) },
        { label: 'Sınıf', value: normalizeText(metadata.className) }
    ];

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    infoLeft.forEach((item, idx) => {
        doc.text(`${item.label}: ${toUpperTr(item.value)}`, margin + 3, y + 13 + idx * 5);
    });

    const secondColumnX = margin + ((pageWidth - margin * 2) / 2) + 2;
    infoRight.forEach((item, idx) => {
        doc.text(`${item.label}: ${toUpperTr(item.value)}`, secondColumnX, y + 13 + idx * 5);
    });

    y += infoBoxHeight + 8;

    // Özet kartları
    const cardWidth = (pageWidth - margin * 2 - 10) / 3;
    const cardHeight = 25;

    const stats = [
        { label: 'SINIF ORTALAMASI', value: `%${analysis.classAverage.toFixed(1)}`, color: [79, 70, 229] as [number, number, number] },
        { label: 'TOPLAM ÖĞRENCİ', value: students.length.toString(), color: [16, 185, 129] as [number, number, number] },
        { label: 'SORU SAYISI', value: questions.length.toString(), color: [245, 158, 11] as [number, number, number] }
    ];

    stats.forEach((stat, i) => {
        const curX = margin + i * (cardWidth + 5);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(curX, y, cardWidth, cardHeight, 2, 2, 'FD');

        doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.rect(curX, y, 2, cardHeight, 'F');

        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.setFont('Roboto', 'bold');
        doc.text(stat.label, curX + 6, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text(stat.value, curX + 6, y + 18);
    });

    y += cardHeight + 10;

    // Hızlı genel görünüm
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Sınıf Dağılımı', margin, y);

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Başarılı: ${passCount} | Başarısız: ${students.length - passCount}`, margin, y + 6);
    doc.text(`En yüksek: ${maxScore} | En düşük: ${minScore}`, margin + 90, y + 6);

    y += 14;

    // İlk sayfada görsel özet (Not dağılımı + histogram)
    const chartCardWidth = (pageWidth - margin * 2 - 8) / 2;
    const chartCardHeight = 60;
    drawChartCard(doc, {
        title: 'Not Dağılımı (5\'li Sistem)',
        image: chartImages.gradePieChart,
        x: margin,
        y,
        width: chartCardWidth,
        height: chartCardHeight
    });

    drawChartCard(doc, {
        title: 'Not Dağılımı (Histogram)',
        image: chartImages.histogramChart,
        x: margin + chartCardWidth + 8,
        y,
        width: chartCardWidth,
        height: chartCardHeight
    });

    y += chartCardHeight + 10;

    // Öğrenci listesi - sıralı tablo
    const studentListStartY = Math.max(y, 110);
    await createStudentListPage(doc, analysis, metadata, questions, students, studentListStartY);

    // Yeni Sayfa: Analizler
    doc.addPage();

    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text('DETAYLI ANALİZ RAPORU', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text(`${toUpperTr(normalizeText(metadata.className))} - ${toUpperTr(normalizeText(metadata.subject))}`, pageWidth / 2, 25, { align: 'center' });

    let analysisY = 45;
    const colWidth = (pageWidth - (margin * 3)) / 2;

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Kazanım Başarı Durumu', margin, analysisY);
    doc.text('Not Dağılımı', margin + colWidth + margin, analysisY);

    analysisY += 5;

    const outcomeRows = analysis.outcomeStats.map(t => [
        t.description.length > 30 ? t.description.substring(0, 30) + '...' : t.description,
        `%${t.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: analysisY,
        head: [['Kazanım', 'Başarı']],
        body: outcomeRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 20, halign: 'center' } },
        margin: { left: margin, right: pageWidth - margin - colWidth },
        tableWidth: colWidth
    });

    const outcomeTableY = (doc as any).lastAutoTable.finalY;

    const gradeRanges = [
        { label: 'Pekiyi (85-100)', min: 85, max: 100 },
        { label: 'İyi (70-84)', min: 70, max: 84 },
        { label: 'Orta (50-69)', min: 50, max: 69 },
        { label: 'Geçer (45-49)', min: 45, max: 49 },
        { label: 'Başarısız (0-44)', min: 0, max: 44 }
    ];

    const gradeCounts = gradeRanges.map(range => {
        const count = students.filter(s => {
            const score = Object.values(s.scores).reduce((a, b) => a + b, 0);
            return score >= range.min && score <= range.max;
        }).length;
        return [range.label, count.toString()];
    });

    autoTable(doc, {
        startY: analysisY,
        head: [['Not Aralığı', 'Öğrenci']],
        body: gradeCounts,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 20, halign: 'center' } },
        margin: { left: margin + colWidth + margin, right: margin },
        tableWidth: colWidth
    });

    const gradeTableY = (doc as any).lastAutoTable.finalY;
    analysisY = Math.max(outcomeTableY, gradeTableY) + 12;

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Soru Bazlı Analiz', margin, analysisY);
    analysisY += 5;

    const questionStatsRows = analysis.questionStats.map((q, i) => {
        const qConfig = questions.find(x => x.id === q.questionId);
        const maxScoreForQuestion = qConfig?.maxScore || 0;

        const correctCount = students.filter(s => (s.scores[q.questionId] || 0) === maxScoreForQuestion).length;
        const incorrectCount = students.filter(s => (s.scores[q.questionId] || 0) === 0).length;
        const emptyCount = students.length - correctCount - incorrectCount;

        return [
            (i + 1).toString(),
            q.outcome.description.length > 60 ? q.outcome.description.substring(0, 60) + '...' : q.outcome.description,
            correctCount.toString(),
            incorrectCount.toString(),
            emptyCount.toString(),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: analysisY,
        head: [['Soru', 'Kazanım', 'Doğru', 'Yanlış', 'Boş', 'Başarı']],
        body: questionStatsRows,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [245, 158, 11], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15, halign: 'center', textColor: [34, 197, 94] },
            3: { cellWidth: 15, halign: 'center', textColor: [239, 68, 68] },
            4: { cellWidth: 15, halign: 'center', textColor: [100, 116, 139] },
            5: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });

    const visuals = [
        { title: 'Özet Gösterge Paneli', image: chartImages.overview },
        { title: 'Kazanım Başarı Grafiği', image: chartImages.outcomeChart },
        { title: 'Soru Bazlı Başarı Grafiği', image: chartImages.questionSuccessChart },
        { title: 'Kazanım Radar Haritası', image: chartImages.radarChart },
        { title: 'Bilişsel Düzey Dağılımı', image: chartImages.cognitiveChart },
        { title: 'Güçlük Dağılımı', image: chartImages.difficultyChart }
    ].filter(item => item.image);

    if (visuals.length > 0) {
        doc.addPage();
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Görsel Analizler', margin, 20);

        let visualY = 28;
        const visualCardHeight = 70;

        visuals.forEach((visual, idx) => {
            if (idx % 2 === 0 && idx > 0) {
                visualY += visualCardHeight + 10;
                if (visualY + visualCardHeight > 280) {
                    doc.addPage();
                    visualY = 20;
                }
            }

            const x = margin + (idx % 2) * (chartCardWidth + 8);
            drawChartCard(doc, {
                title: visual.title,
                image: visual.image,
                x,
                y: visualY,
                width: chartCardWidth,
                height: visualCardHeight,
                hint: 'Ekran görüntüsü kullanıldı'
            });
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// ÖĞRENCİ LİSTESİ - YENİ SAYFA
// ═══════════════════════════════════════════════════════════════
async function createStudentListPage(
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    startY?: number
) {
    const pageWidth = 210;
    const margin = 15;

    let y = startY || 0;

    if (!startY) {
        doc.addPage();
        // Sayfa 2 Header (daha küçük)
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.text('👨‍🎓 ÖĞRENCİ SONUÇ LİSTESİ', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('Roboto', 'normal');
        doc.text(`${toUpperTr(normalizeText(metadata.className))} - ${toUpperTr(normalizeText(metadata.subject))}`, pageWidth / 2, 25, { align: 'center' });
        y = 45;
    } else {
        // Aynı sayfada devam ediyorsa başlık
        y += 10;
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('ÖĞRENCİ SONUÇ LİSTESİ', margin, y);
        y += 5;
    }

    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);

    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
        return sb - sa;
    });

    const studentRows = sortedStudents.map((s, i) => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const pct = (total / maxTotal) * 100;
        const studentNumber = normalizeText(s.student_number || '-');
        const studentName = toUpperTr(normalizeText(s.name));
        return [String(i + 1), studentNumber, studentName, String(total), `%${pct.toFixed(0)}`, pct >= 50 ? 'GEÇTİ' : 'KALDI'];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
        body: studentRows,
        theme: 'striped',
        styles: {
            font: 'Roboto',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [103, 58, 183],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        columnStyles: {
            0: { cellWidth: 13, halign: 'center', fontStyle: 'bold', textColor: [71, 85, 105] },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 85 },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [99, 102, 241] },
            4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                if (data.cell.raw === 'KALDI') {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [254, 226, 226];
                } else {
                    data.cell.styles.textColor = [21, 128, 61];
                    data.cell.styles.fillColor = [220, 252, 231];
                }
            }
            if (data.section === 'body' && data.column.index === 4) {
                const value = parseFloat(data.cell.raw.toString().replace('%', ''));
                if (value < 50) {
                    data.cell.styles.textColor = [220, 53, 69];
                } else if (value < 75) {
                    data.cell.styles.textColor = [245, 158, 11];
                } else {
                    data.cell.styles.textColor = [34, 197, 94];
                }
            }
        },
        margin: { left: margin, right: margin }
    });
}

// ═══════════════════════════════════════════════════════════════
// ÖĞRENCİ KARNELERİ
// ═══════════════════════════════════════════════════════════════
async function createStudentCards(
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) {
    const pageWidth = 210;
    const margin = 15;
    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (i > 0) doc.addPage();

        let y = 0;

        // ═══════════════════════════════════════════════════════════════
        // MODERN HEADER (Gradient)
        // ═══════════════════════════════════════════════════════════════

        const total = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const pct = (total / maxTotal) * 100;
        const isPassing = pct >= 50;

        // Header background (yeşil/kırmızı gradient)
        doc.setFillColor(isPassing ? 34 : 220, isPassing ? 197 : 53, isPassing ? 94 : 69);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Dekoratif alt şerit
        doc.setFillColor(isPassing ? 21 : 185, isPassing ? 128 : 28, isPassing ? 61 : 28);
        doc.rect(0, 40, pageWidth, 5, 'F');

        // Başlık
        doc.setTextColor(255, 255, 255);
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.text('SINAV SONUÇ BELGESİ', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('Roboto', 'normal');
        doc.text(toUpperTr(normalizeText(metadata.schoolName || 'OKUL ADI')), pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(8);
        doc.text(`${toUpperTr(normalizeText(metadata.className))} | ${toUpperTr(normalizeText(metadata.subject))} | ${toUpperTr(normalizeText(metadata.examType))}`, pageWidth / 2, 33, { align: 'center' });

        y = 55;

        // ═══════════════════════════════════════════════════════════════
        // ÖĞRENCİ BİLGİ KARTI
        // ═══════════════════════════════════════════════════════════════

        const cardHeight = 35;

        // Kart arka planı
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 3, 3, 'F');

        // Kart çerçevesi
        doc.setDrawColor(isPassing ? 34 : 220, isPassing ? 197 : 53, isPassing ? 94 : 69);
        doc.setLineWidth(1);
        doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 3, 3, 'S');

        // Öğrenci adı
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        doc.text(`👤 ${toUpperTr(normalizeText(student.name))}`, margin + 5, y + 10);

        // Öğrenci bilgileri
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Numara: ${normalizeText(student.student_number || '-')}`, margin + 5, y + 18);
        doc.text(`Sınıf: ${normalizeText(metadata.className)}`, margin + 5, y + 25);
        doc.text(`Ders: ${normalizeText(metadata.subject)}`, margin + 60, y + 25);

        // PUAN KUTUSU (Sağ taraf)
        const scoreBoxX = pageWidth - margin - 45;
        const scoreBoxY = y + 5;
        const scoreBoxW = 40;
        const scoreBoxH = 25;

        doc.setFillColor(isPassing ? 220 : 254, isPassing ? 252 : 226, isPassing ? 231 : 226);
        doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 2, 2, 'F');

        doc.setDrawColor(isPassing ? 34 : 220, isPassing ? 197 : 53, isPassing ? 94 : 69);
        doc.setLineWidth(0.5);
        doc.roundedRect(scoreBoxX, scoreBoxY, scoreBoxW, scoreBoxH, 2, 2, 'S');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(isPassing ? 21 : 185, isPassing ? 128 : 28, isPassing ? 61 : 28);
        doc.text(`${total}`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 12, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`/ ${maxTotal}`, scoreBoxX + scoreBoxW / 2, scoreBoxY + 19, { align: 'center' });

        y += cardHeight + 15;

        // ═══════════════════════════════════════════════════════════════
        // SORU DETAYLARI TABLOSU
        // ═══════════════════════════════════════════════════════════════

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text('📋 SORU BAZLI PERFORMANS', margin, y);
        y += 2;

        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(margin, y, margin + 55, y);
        y += 5;

        const questionRows = analysis.questionStats.map((q, idx) => {
            const qScore = student.scores[q.questionId] || 0;
            const qMax = questions.find(x => x.id === q.questionId)?.maxScore || 0;
            const qPct = qMax > 0 ? (qScore / qMax * 100) : 0;
            return [
                String(idx + 1),
                q.outcome.description.length > 55 ? q.outcome.description.substring(0, 55) + '...' : q.outcome.description,
                `${qScore} / ${qMax}`,
                `%${qPct.toFixed(0)}`
            ];
        });

        autoTable(doc, {
            startY: y,
            head: [['Soru', 'Konu', 'Puan', 'Başarı']],
            body: questionRows,
            theme: 'striped',
            styles: {
                font: 'Roboto',
                fontSize: 8,
                cellPadding: 2.5,
                overflow: 'linebreak',
                lineColor: [226, 232, 240],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: [0, 150, 136],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 13, halign: 'center', fontStyle: 'bold', textColor: [71, 85, 105] },
                1: { cellWidth: 115 },
                2: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: [99, 102, 241] },
                3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    const value = parseFloat(data.cell.raw.toString().replace('%', ''));
                    if (value < 50) {
                        data.cell.styles.textColor = [220, 53, 69];
                    } else if (value < 75) {
                        data.cell.styles.textColor = [245, 158, 11];
                    } else {
                        data.cell.styles.textColor = [34, 197, 94];
                    }
                }
            },
            margin: { left: margin, right: margin }
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// ANA EXPORT FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// WORD EXPORT (HTML tabanlı)
// ═══════════════════════════════════════════════════════════════
export async function exportToWord(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) {
    const title = `${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)} Analiz Raporu`;

    let html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                @page {
                    size: A4;
                    margin: 20mm 16mm;
                }
                body {
                    font-family: 'Calibri', 'Arial', sans-serif;
                    font-size: 11pt;
                    line-height: 1.35;
                    margin: 0;
                    padding: 0;
                    color: #111827;
                }
                .page {
                    width: 100%;
                }
                .header {
                    text-align: center;
                    margin-bottom: 12pt;
                    page-break-inside: avoid;
                }
                .title {
                    font-size: 16pt;
                    font-weight: bold;
                    letter-spacing: 0.2pt;
                }
                .subtitle {
                    font-size: 11pt;
                }
                h3 {
                    margin: 16pt 0 8pt;
                    font-size: 12.5pt;
                    color: #1f2937;
                    page-break-after: avoid;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    table-layout: fixed;
                    margin-bottom: 12pt;
                    word-wrap: break-word;
                    page-break-inside: avoid;
                }
                th, td {
                    border: 1px solid #d1d5db;
                    padding: 6pt;
                    text-align: center;
                    font-size: 10.5pt;
                    vertical-align: top;
                }
                th {
                    background-color: #f3f4f6;
                    font-weight: bold;
                }
                .success {
                    color: #15803d;
                    font-weight: bold;
                }
                .fail {
                    color: #b91c1c;
                    font-weight: bold;
                }
                .text-left {
                    text-align: left;
                }
            </style>
        </head>
        <body>
            <div class="page">
                <div class="header">
                    <div class="title">SINAV SONUÇ ANALİZ RAPORU</div>
                    <div class="subtitle">${toUpperTr(normalizeText(metadata.schoolName || ''))}</div>
                    <div class="subtitle">${toUpperTr(normalizeText(metadata.className))} - ${toUpperTr(normalizeText(metadata.subject))}</div>
                    <div class="subtitle">${toUpperTr(normalizeText(metadata.examType))} | ${normalizeText(metadata.academicYear || '')}</div>
                </div>

                <h3>1. SINIF ÖZETİ</h3>
                <table>
                    <colgroup>
                        <col style="width: 25%" />
                        <col style="width: 25%" />
                        <col style="width: 25%" />
                        <col style="width: 25%" />
                    </colgroup>
                    <tr>
                        <th>Öğrenci Sayısı</th>
                        <th>Sınıf Ortalaması</th>
                        <th>Başarı Oranı</th>
                        <th>En Yüksek Puan</th>
                    </tr>
                    <tr>
                        <td>${students.length}</td>
                        <td>${analysis.classAverage.toFixed(2)}</td>
                        <td>%${analysis.averageSuccess.toFixed(1)}</td>
                        <td>${Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)))}</td>
                    </tr>
                </table>

                <h3>2. ÖĞRENCİ LİSTESİ</h3>
                <table>
                    <colgroup>
                        <col style="width: 8%" />
                        <col style="width: 44%" />
                        <col style="width: 16%" />
                        <col style="width: 14%" />
                        <col style="width: 18%" />
                    </colgroup>
                    <tr>
                        <th>Sıra</th>
                        <th>Adı Soyadı</th>
                        <th>Puan</th>
                        <th>Başarı</th>
                        <th>Durum</th>
                    </tr>
                    ${students.sort((a, b) => {
        const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
        return sb - sa;
    }).map((s, i) => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const max = questions.reduce((a, q) => a + q.maxScore, 0);
        const pct = (total / max) * 100;
        return `
                        <tr>
                            <td>${i + 1}</td>
                            <td class="text-left">${toUpperTr(s.name)}</td>
                            <td>${total}</td>
                            <td>%${pct.toFixed(0)}</td>
                            <td class="${pct >= 50 ? 'success' : 'fail'}">${pct >= 50 ? 'GEÇTİ' : 'KALDI'}</td>
                        </tr>
                    `;
    }).join('')}
                </table>

                <h3>3. KAZANIM ANALİZİ</h3>
                <table>
                    <colgroup>
                        <col style="width: 70%" />
                        <col style="width: 15%" />
                        <col style="width: 15%" />
                    </colgroup>
                    <tr>
                        <th>Kazanım</th>
                        <th>Soru Sayısı</th>
                        <th>Sınıf Başarısı</th>
                    </tr>
                    ${analysis.outcomeStats.map(t => `
                        <tr>
                            <td class="text-left">${t.description}</td>
                            <td>-</td>
                            <td>%${t.successRate.toFixed(1)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    // Link oluştur ve tıkla
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName(metadata.className)}_Analiz.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ═══════════════════════════════════════════════════════════════
// ANA EXPORT FONKSİYONLARI
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// RESMİ FORM (MEB STANDARDI)
// ═══════════════════════════════════════════════════════════════
export async function exportToOfficialForm(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    const pageWidth = 210;
    const margin = 10;
    let y = 10;

    // Header
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text('T.C.', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('KAHRAMANMARAŞ VALİLİĞİ', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text('Onikişubat / Kalekaya Ortaokulu Müdürlüğü', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(11);
    doc.text('SINAV ANALİZİ VE SINIF DEĞERLENDİRMESİ', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Metadata Grid
    doc.setFontSize(8);
    doc.setFont('Roboto', 'normal');

    const col1 = margin;
    const col2 = margin + 45;
    const col3 = margin + 90;
    const col4 = margin + 135;

    doc.text(`Okul: ${toUpperTr(normalizeText(metadata.schoolName || 'KALEKAYA ORTAOKULU'))}`, col1, y);
    doc.text(`Sınıf: ${toUpperTr(normalizeText(metadata.className))}`, col3, y);
    y += 4;
    doc.text(`Öğretim Yılı: ${toUpperTr(normalizeText(metadata.academicYear || '2025-2026'))}`, col1, y);
    doc.text(`Sınav Dönemi: ${metadata.term}. Dönem`, col3, y);
    y += 4;
    doc.text(`Ders: ${toUpperTr(normalizeText(metadata.subject))}`, col1, y);
    doc.text(`Sınav Numarası: ${metadata.examNumber}. Yazılı`, col3, y);
    y += 4;
    doc.text(`Öğretmen: ${toUpperTr(normalizeText(metadata.teacherName))}`, col1, y);
    // Tarih opsiyonel - sadece doluysa göster
    if (metadata.date) {
        doc.text(`Sınav Tarihi: ${normalizeText(metadata.date)}`, col3, y);
    }
    y += 6;

    // Student Scores Table (Grid 1-20 questions)
    const maxQuestions = 20;
    const head = [['SIRA', 'OKU', 'ADI', 'SOYADI', ...Array.from({ length: maxQuestions }, (_, i) => (i + 1).toString()), 'PUAN', 'SONUÇ']];

    const body = students.map((s, i) => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        let result = 'Geçmez';
        if (total >= 85) result = 'Pekiyi';
        else if (total >= 70) result = 'İyi';
        else if (total >= 60) result = 'Orta';
        else if (total >= 50) result = 'Geçer';

        const row = [
            (i + 1).toString(),
            s.student_number || '',
            s.name.split(' ')[0] || '',
            s.name.split(' ').slice(1).join(' ') || '',
            ...questions.map(q => s.scores[q.id]?.toString() || ''),
            ...Array(maxQuestions - questions.length).fill(''),
            total.toString(),
            result
        ];
        return row;
    });

    autoTable(doc, {
        startY: y,
        head: head,
        body: body,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 6, cellPadding: 1, halign: 'center' },
        headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', lineWidth: 0.1 },
        columnStyles: {
            2: { halign: 'left', cellWidth: 20 },
            3: { halign: 'left', cellWidth: 20 },
        },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Charts Row (Drawn with primitives for reliability)
    const chartWidth = 85;
    const chartHeight = 40;

    // 1. Success by Question Chart
    doc.setFontSize(8);
    doc.setFont('Roboto', 'bold');
    doc.text('SORULARA GÖRE BAŞARI YÜZDESİ GRAFİĞİ', margin, y);

    const chartY = y + 5;
    doc.setDrawColor(200);
    doc.line(margin, chartY + chartHeight, margin + chartWidth, chartY + chartHeight); // X axis
    doc.line(margin, chartY, margin, chartY + chartHeight); // Y axis

    const barWidth = (chartWidth - 10) / maxQuestions;
    analysis.questionStats.forEach((qs, i) => {
        const h = (qs.successRate / 100) * chartHeight;
        doc.setFillColor(79, 70, 229);
        doc.rect(margin + 2 + i * barWidth, chartY + chartHeight - h, barWidth - 1, h, 'F');
        doc.setFontSize(5);
        doc.text((i + 1).toString(), margin + 2 + i * barWidth + barWidth / 2, chartY + chartHeight + 3, { align: 'center' });
    });

    // 2. Grade Distribution Table
    const distHead = [['NOT ARALIĞI', 'DERECE', 'SAYI']];
    const dists = [
        { range: '85-100', label: 'Pekiyi', count: students.filter(s => Object.values(s.scores).reduce((a, b) => a + b, 0) >= 85).length },
        { range: '70-84', label: 'İyi', count: students.filter(s => { const t = Object.values(s.scores).reduce((a, b) => a + b, 0); return t >= 70 && t < 85; }).length },
        { range: '60-69', label: 'Orta', count: students.filter(s => { const t = Object.values(s.scores).reduce((a, b) => a + b, 0); return t >= 60 && t < 70; }).length },
        { range: '50-59', label: 'Geçer', count: students.filter(s => { const t = Object.values(s.scores).reduce((a, b) => a + b, 0); return t >= 50 && t < 60; }).length },
        { range: '0-49', label: 'Geçmez', count: students.filter(s => Object.values(s.scores).reduce((a, b) => a + b, 0) < 50).length },
    ];
    const distBody = dists.map(d => [d.range, d.label, d.count.toString()]);

    autoTable(doc, {
        startY: y + 5,
        head: distHead,
        body: distBody,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [240, 240, 240], textColor: 0 },
        margin: { left: margin + chartWidth + 10, right: margin }
    });

    y += chartHeight + 15;

    // Evaluation Boxes
    const boxWidth = (pageWidth - margin * 2 - 5) / 2;
    const boxHeight = 35;

    // Box 1: Sınıf Değerlendirmesi
    doc.setDrawColor(0);
    doc.rect(margin, y, boxWidth, boxHeight);
    doc.setFont('Roboto', 'bold');
    doc.text('SINIF DEĞERLENDİRMESİ', margin + 2, y + 5);
    doc.setFont('Roboto', 'normal');
    doc.text(`Sınıf genelinde %${analysis.classAverage.toFixed(1)} başarıya ulaşılmıştır.`, margin + 2, y + 12, { maxWidth: boxWidth - 4 });

    // Box 2: Sınav Değerlendirmesi
    doc.rect(margin + boxWidth + 5, y, boxWidth, boxHeight);
    doc.setFont('Roboto', 'bold');
    doc.text('SINAV DEĞERLENDİRMESİ', margin + boxWidth + 7, y + 5);
    doc.setFont('Roboto', 'normal');
    const evalText = `Sınav, Ölçme Değerlendirme kriterleri bakımından başarılı kabul edilmektedir. Başarı oranı düşük kazanımlar için ek çalışmalar planlanmıştır.`;
    doc.text(evalText, margin + boxWidth + 7, y + 12, { maxWidth: boxWidth - 4 });

    y += boxHeight + 15;

    // Signatures
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(metadata.teacherName || 'Öğretmen', margin + 30, y, { align: 'center' });
    doc.text('SÜLEYMAN ALİ DALKIRAN', pageWidth - margin - 30, y, { align: 'center' });
    y += 4;
    doc.text('Ders Öğretmeni', margin + 30, y, { align: 'center' });
    doc.text('Okul Müdürü', pageWidth - margin - 30, y, { align: 'center' });

    doc.save(`${safeName(metadata.className)}_Resmi_Analiz.pdf`);
}

export async function exportToPDFAdvanced(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {},
    language: Language = 'tr',
    options: any = {}
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);
    await createFullReport(doc, analysis, metadata, questions, students, chartImages);
    doc.save(`${safeName(metadata.className)}_Rapor.pdf`);
}

export async function quickExport(
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {},
    language: Language = 'tr'
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    if (scenario === 'student_cards') {
        await createStudentCards(doc, analysis, metadata, questions, students);
        doc.save(`${safeName(metadata.className)}_Karneler.pdf`);
    } else {
        await createFullReport(doc, analysis, metadata, questions, students, chartImages);
        doc.save(`${safeName(metadata.className)}_Rapor.pdf`);
    }
}

export async function exportBilingualReports(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {}
) {
    await quickExport('full_report', analysis, metadata, questions, students, chartImages, 'tr');
}

export async function exportIndividualStudentReports(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) {
    await quickExport('student_cards', analysis, metadata, questions, students, {}, language);
}

export function getExportScenarios(language: Language = 'tr') {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Tam Rapor', description: 'Soru analizi, kazanım durumu ve öğrenci listesi' },
        { id: 'student_cards' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Karneleri', description: 'Her öğrenci için ayrı sayfa' }
    ];
}

// ═══════════════════════════════════════════════════════════════
// ŞABLON TABANLI PDF EXPORT
// ═══════════════════════════════════════════════════════════════

import { ReportTemplate, ReportOptions, DEFAULT_REPORT_OPTIONS } from '../modules/report-editor/types';

/**
 * Rapor opsiyonlarına göre PDF oluştur
 * Bu fonksiyon kullanıcının seçtiği bileşenlere göre rapor içeriği oluşturur
 */
export async function exportPDFWithOptions(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {},
    options: ReportOptions = DEFAULT_REPORT_OPTIONS
): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    const pageWidth = 210;
    const margin = 15;
    let y = 15;

    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
    const studentTotals = students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0));
    const maxScore = studentTotals.length ? Math.max(...studentTotals) : 0;
    const minScore = studentTotals.length ? Math.min(...studentTotals) : 0;
    const passCount = students.filter(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        return maxTotal > 0 ? (total / maxTotal * 100) >= 50 : false;
    }).length;

    // Header (eğer seçiliyse)
    if (options.includeHeader) {
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text('SINAV SONUÇ ANALİZ RAPORU', pageWidth / 2, y, { align: 'center' });
        y += 7;

        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${toUpperTr(normalizeText(metadata.className))} - ${toUpperTr(normalizeText(metadata.subject))} | ${toUpperTr(normalizeText(metadata.examType))}`, pageWidth / 2, y, { align: 'center' });
        y += 5;

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        // Metadata box
        const infoBoxHeight = 24;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, pageWidth - margin * 2, infoBoxHeight, 2, 2, 'FD');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text('Sınav Bilgileri', margin + 3, y + 7);

        const infoLeft = [
            { label: 'Okul', value: normalizeText(metadata.schoolName || '-') },
            ...(metadata.date ? [{ label: 'Tarih', value: normalizeText(metadata.date) }] : []),
            { label: 'Öğretmen', value: normalizeText(metadata.teacherName || '-') }
        ];
        const infoRight = [
            { label: 'Ders', value: normalizeText(metadata.subject) },
            { label: 'Dönem/Sınav', value: normalizeText(`${metadata.term}. Dönem | ${metadata.examNumber}. ${metadata.examType}`) },
            { label: 'Sınıf', value: normalizeText(metadata.className) }
        ];

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);

        infoLeft.forEach((item, idx) => {
            doc.text(`${item.label}: ${toUpperTr(item.value)}`, margin + 3, y + 13 + idx * 5);
        });

        const secondColumnX = margin + ((pageWidth - margin * 2) / 2) + 2;
        infoRight.forEach((item, idx) => {
            doc.text(`${item.label}: ${toUpperTr(item.value)}`, secondColumnX, y + 13 + idx * 5);
        });

        y += infoBoxHeight + 10;
    }

    // Özet İstatistikler (eğer seçiliyse)
    if (options.includeSummaryStats) {
        const cardWidth = (pageWidth - margin * 2 - 10) / 3;
        const cardHeight = 25;

        const stats = [
            { label: 'SINIF ORTALAMASI', value: `%${analysis.classAverage.toFixed(1)}`, color: [79, 70, 229] as [number, number, number] },
            { label: 'TOPLAM ÖĞRENCİ', value: students.length.toString(), color: [16, 185, 129] as [number, number, number] },
            { label: 'SORU SAYISI', value: questions.length.toString(), color: [245, 158, 11] as [number, number, number] }
        ];

        stats.forEach((stat, i) => {
            const curX = margin + i * (cardWidth + 5);

            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(curX, y, cardWidth, cardHeight, 2, 2, 'FD');

            doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
            doc.rect(curX, y, 2, cardHeight, 'F');

            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.setFont('Roboto', 'bold');
            doc.text(stat.label, curX + 6, y + 8);

            doc.setFontSize(12);
            doc.setTextColor(30, 41, 59);
            doc.text(stat.value, curX + 6, y + 18);
        });

        y += cardHeight + 10;
    }

    // Grafikler (eğer seçiliyse)
    const chartCardWidth = (pageWidth - margin * 2 - 8) / 2;
    const chartCardHeight = 60;
    let chartCount = 0;

    if (options.includePieChart && chartImages.gradePieChart) {
        drawChartCard(doc, {
            title: 'Not Dağılımı (5\'li Sistem)',
            image: chartImages.gradePieChart,
            x: margin + (chartCount % 2) * (chartCardWidth + 8),
            y: y + Math.floor(chartCount / 2) * (chartCardHeight + 10),
            width: chartCardWidth,
            height: chartCardHeight
        });
        chartCount++;
    }

    if (options.includeBarChart && chartImages.histogramChart) {
        drawChartCard(doc, {
            title: 'Not Dağılımı (Histogram)',
            image: chartImages.histogramChart,
            x: margin + (chartCount % 2) * (chartCardWidth + 8),
            y: y + Math.floor(chartCount / 2) * (chartCardHeight + 10),
            width: chartCardWidth,
            height: chartCardHeight
        });
        chartCount++;
    }

    if (options.includeRadarChart && chartImages.radarChart) {
        drawChartCard(doc, {
            title: 'Kazanım Radar Haritası',
            image: chartImages.radarChart,
            x: margin + (chartCount % 2) * (chartCardWidth + 8),
            y: y + Math.floor(chartCount / 2) * (chartCardHeight + 10),
            width: chartCardWidth,
            height: chartCardHeight
        });
        chartCount++;
    }

    if (chartCount > 0) {
        y += Math.ceil(chartCount / 2) * (chartCardHeight + 10);
    }

    // Öğrenci Listesi (eğer seçiliyse)
    if (options.includeStudentTable) {
        if (y > 200) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('ÖĞRENCİ SONUÇ LİSTESİ', margin, y);
        y += 5;

        const sortedStudents = [...students].sort((a, b) => {
            const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
            const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
            return sb - sa;
        });

        const studentRows = sortedStudents.map((s, i) => {
            const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
            const pct = (total / maxTotal) * 100;
            return [String(i + 1), normalizeText(s.student_number || '-'), toUpperTr(normalizeText(s.name)), String(total), `%${pct.toFixed(0)}`, pct >= 50 ? 'GEÇTİ' : 'KALDI'];
        });

        autoTable(doc, {
            startY: y,
            head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
            body: studentRows,
            theme: 'striped',
            styles: { font: 'Roboto', fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [103, 58, 183], textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'center' },
            columnStyles: {
                0: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 85 },
                3: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [99, 102, 241] },
                4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
                5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    if (data.cell.raw === 'KALDI') {
                        data.cell.styles.textColor = [220, 53, 69];
                        data.cell.styles.fillColor = [254, 226, 226];
                    } else {
                        data.cell.styles.textColor = [21, 128, 61];
                        data.cell.styles.fillColor = [220, 252, 231];
                    }
                }
            },
            margin: { left: margin, right: margin }
        });
    }

    // Kazanım Tablosu (eğer seçiliyse)
    if (options.includeOutcomeTable && analysis.outcomeStats.length > 0) {
        doc.addPage();
        y = 20;

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('KAZANIM ANALİZİ', margin, y);
        y += 5;

        const outcomeRows = analysis.outcomeStats.map(t => [
            t.description.length > 50 ? t.description.substring(0, 50) + '...' : t.description,
            `%${t.successRate.toFixed(0)}`,
            t.isFailed ? 'DÜŞÜK' : 'İYİ'
        ]);

        autoTable(doc, {
            startY: y,
            head: [['Kazanım', 'Başarı', 'Durum']],
            body: outcomeRows,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.raw === 'DÜŞÜK') {
                        data.cell.styles.textColor = [220, 53, 69];
                    } else {
                        data.cell.styles.textColor = [21, 128, 61];
                    }
                }
            },
            margin: { left: margin, right: margin }
        });
    }

    // İmza Alanı (eğer seçiliyse)
    if (options.includeSignature) {
        doc.addPage();
        y = 240;

        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.3);
        doc.line(margin, y, margin + 60, y);
        doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Öğretmen İmzası', margin + 30, y + 5, { align: 'center' });
        doc.text('Müdür Onayı', pageWidth - margin - 30, y + 5, { align: 'center' });
    }

    doc.save(`${safeName(metadata.className)}_Ozel_Rapor.pdf`);
}

/**
 * Şablon temelli PDF oluştur
 * ReportTemplate'in layout ve componentOptions alanlarını kullanır
 */
export async function exportPDFWithTemplate(
    template: ReportTemplate,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: ChartImages = {}
): Promise<void> {
    const options = template.componentOptions || DEFAULT_REPORT_OPTIONS;
    await exportPDFWithOptions(analysis, metadata, questions, students, chartImages, options);
}
