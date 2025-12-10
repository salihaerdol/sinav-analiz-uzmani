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

// ═══════════════════════════════════════════════════════════════
// TAM RAPOR
// ═══════════════════════════════════════════════════════════════
async function createFullReport(
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) {
    const pageWidth = 210;
    const margin = 15;
    let y = 0;

    // ═══════════════════════════════════════════════════════════════
    // SAYFA 1: ÖZET VE LİSTE
    // ═══════════════════════════════════════════════════════════════

    // Basit Header
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('SINAV SONUÇ ANALİZ RAPORU', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)} | ${toUpperTr(metadata.examType)}`, pageWidth / 2, 22, { align: 'center' });

    // Çizgi
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 28, pageWidth - margin, 28);

    y = 35;

    // ═══════════════════════════════════════════════════════════════
    // ÖZET BİLGİLER KARTI (Zenginleştirilmiş)
    // ═══════════════════════════════════════════════════════════════

    y = 75;
    const cardHeight = 40;

    // Kart arka planı
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 3, 3, 'F');

    // Kart çerçevesi
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 3, 3, 'S');

    // Başlık
    doc.setTextColor(71, 85, 105);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.text('SINIF PERFORMANS ÖZETİ', margin + 5, y + 8);

    // İstatistikler
    const maxScore = Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const minScore = Math.min(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const passCount = students.filter(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
        return (total / maxTotal * 100) >= 50;
    }).length;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    const statsY = y + 20;
    const col1X = margin + 10;
    const col2X = margin + 60;
    const col3X = margin + 110;
    const col4X = margin + 150;

    // Sınıf Ortalaması (Büyük ve Renkli)
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Sınıf Ortalaması', col1X, statsY);

    doc.setFontSize(20);
    doc.setTextColor(analysis.classAverage >= 50 ? 34 : 220, analysis.classAverage >= 50 ? 197 : 53, analysis.classAverage >= 50 ? 94 : 69);
    doc.text(`%${analysis.classAverage.toFixed(1)}`, col1X, statsY + 10);

    // Görsel Bar (Ortalama)
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(col1X + 35, statsY + 2, 40, 6, 2, 2, 'F');
    doc.setFillColor(analysis.classAverage >= 50 ? 34 : 220, analysis.classAverage >= 50 ? 197 : 53, analysis.classAverage >= 50 ? 94 : 69);
    doc.roundedRect(col1X + 35, statsY + 2, 40 * (analysis.classAverage / 100), 6, 2, 2, 'F');

    // Diğer İstatistikler
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    // Başarı Durumu
    doc.text('Başarı Durumu:', col3X, statsY);
    doc.setTextColor(34, 197, 94);
    doc.text(`${passCount} Başarılı`, col3X, statsY + 6);
    doc.setTextColor(239, 68, 68);
    doc.text(`${students.length - passCount} Başarısız`, col3X, statsY + 12);

    // En Yüksek/Düşük
    doc.setTextColor(71, 85, 105);
    doc.text('Puan Aralığı:', col4X, statsY);
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text(`Max: ${maxScore}`, col4X, statsY + 6);
    doc.setTextColor(239, 68, 68);
    doc.text(`Min: ${minScore}`, col4X, statsY + 12);

    // Sayfa 1 Alt Bilgi (Boşluk bırakmak için burada bitiriyoruz)
    // İsteğe bağlı olarak buraya bir grafik veya ek bilgi eklenebilir.

    // ═══════════════════════════════════════════════════════════════
    // ÖĞRENCİ LİSTESİ (Sayfa 1'in devamı veya Sayfa 2)
    // ═══════════════════════════════════════════════════════════════

    y = 120; // Karttan sonra boşluk

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('ÖĞRENCİ SONUÇ LİSTESİ', pageWidth / 2, y, { align: 'center' });
    y += 10;

    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
        return sb - sa;
    });

    const studentRows = sortedStudents.map((s, i) => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const max = questions.reduce((a, q) => a + q.maxScore, 0);
        const pct = (total / max) * 100;
        return [
            String(i + 1),
            toUpperTr(s.name),
            total.toString(),
            `%${pct.toFixed(0)}`,
            pct >= 50 ? 'GEÇTİ' : 'KALDI'
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sıra', 'Adı Soyadı', 'Puan', 'Başarı', 'Durum']],
        body: studentRows,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 20, halign: 'center' },
            4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const val = data.cell.raw as string;
                data.cell.styles.textColor = val === 'GEÇTİ' ? [34, 197, 94] : [220, 53, 69];
            }
        },
        margin: { left: margin, right: margin }
    });

    // Yeni Sayfa: Analizler
    doc.addPage();
    y = 20;

    // Sayfa 2 Header (daha küçük)
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text('DETAYLI ANALİZ RAPORU', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text(`${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)}`, pageWidth / 2, 25, { align: 'center' });

    y = 45;

    // 1. Satır: Yetkinlik Haritası ve Not Dağılımı (Yan Yana)
    const colWidth = (pageWidth - (margin * 3)) / 2;

    // Sol: Yetkinlik Haritası (Tablo Olarak)
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Kazanım Başarı Durumu', margin, y);

    // Sağ: Not Dağılımı
    doc.text('Not Dağılımı', margin + colWidth + margin, y);

    y += 5;

    // Yetkinlik Tablosu
    const outcomeRows = analysis.outcomeStats.map(t => [
        t.description.length > 30 ? t.description.substring(0, 30) + '...' : t.description,
        `%${t.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kazanım', 'Başarı']],
        body: outcomeRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 20, halign: 'center' } },
        margin: { left: margin, right: pageWidth - margin - colWidth },
        tableWidth: colWidth
    });

    const tableFinalY = (doc as any).lastAutoTable.finalY;

    // Not Dağılımı Tablosu (Sağ Taraf)
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
        startY: y,
        head: [['Not Aralığı', 'Öğrenci']],
        body: gradeCounts,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        columnStyles: { 0: { cellWidth: 'auto' }, 1: { cellWidth: 20, halign: 'center' } },
        margin: { left: margin + colWidth + margin, right: margin },
        tableWidth: colWidth
    });

    y = Math.max(tableFinalY, (doc as any).lastAutoTable.finalY) + 10;

    // 2. Satır: Puan Dağılımı (Geniş Bar Grafik - Basit Çizim)
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Puan Dağılımı', margin, y);
    y += 5;

    // Basit Bar Grafik Çizimi
    const chartHeight = 40;
    const chartWidth = pageWidth - (margin * 2);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, chartWidth, chartHeight); // Çerçeve

    // 10'luk dilimler
    const ranges = Array.from({ length: 10 }, (_, i) => ({ min: i * 10, max: (i * 10) + 9 }));
    ranges[9].max = 100;

    const rangeCounts = ranges.map(r => students.filter(s => {
        const score = Object.values(s.scores).reduce((a, b) => a + b, 0);
        return score >= r.min && score <= r.max;
    }).length);

    const maxCount = Math.max(...rangeCounts, 1);
    const barWidth = (chartWidth - 20) / 10;

    rangeCounts.forEach((count, i) => {
        if (count > 0) {
            const barHeight = (count / maxCount) * (chartHeight - 10);
            doc.setFillColor(99, 102, 241);
            doc.rect(margin + 10 + (i * barWidth), y + chartHeight - 5 - barHeight, barWidth - 2, barHeight, 'F');
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(count.toString(), margin + 10 + (i * barWidth) + (barWidth / 2), y + chartHeight - 7 - barHeight, { align: 'center' });
        }
        // X ekseni etiketleri
        doc.setFontSize(6);
        doc.setTextColor(150);
        doc.text(`${ranges[i].min}-${ranges[i].max}`, margin + 10 + (i * barWidth) + (barWidth / 2), y + chartHeight + 3, { align: 'center' });
    });

    y += chartHeight + 10;

    // 3. Satır: Soru Bazlı Analiz (Geniş Tablo)
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Soru Bazlı Analiz', margin, y);
    y += 5;

    const questionStatsRows = analysis.questionStats.map((q, i) => {
        const qConfig = questions.find(x => x.id === q.questionId);
        const maxScore = qConfig?.maxScore || 0;

        // Hesaplamalar
        const correctCount = students.filter(s => (s.scores[q.questionId] || 0) === maxScore).length;
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
        startY: y,
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

    // Öğrenci Listesi (Özetin hemen altına)
    // Özet kartı yüksekliği + margin + biraz boşluk
    const studentListStartY = 75 + 40 + 10;
    await createStudentListPage(doc, analysis, metadata, questions, students, studentListStartY);
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
        doc.text(`${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)}`, pageWidth / 2, 25, { align: 'center' });
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
        return [String(i + 1), s.student_number || '-', s.name, String(total), `%${pct.toFixed(0)}`, pct >= 50 ? 'GEÇTİ' : 'KALDI'];
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
        doc.text(toUpperTr(metadata.schoolName || 'OKUL ADI'), pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(8);
        doc.text(`${toUpperTr(metadata.className)} | ${toUpperTr(metadata.subject)} | ${toUpperTr(metadata.examType)}`, pageWidth / 2, 33, { align: 'center' });

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
        doc.text(`👤 ${student.name}`, margin + 5, y + 10);

        // Öğrenci bilgileri
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Numara: ${student.student_number || '-'}`, margin + 5, y + 18);
        doc.text(`Sınıf: ${metadata.className}`, margin + 5, y + 25);
        doc.text(`Ders: ${metadata.subject}`, margin + 60, y + 25);

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
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: 'Calibri', 'Arial', sans-serif; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 5px; text-align: center; font-size: 11px; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .title { font-size: 16px; font-weight: bold; }
                .subtitle { font-size: 12px; }
                .success { color: green; font-weight: bold; }
                .fail { color: red; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">SINAV SONUÇ ANALİZ RAPORU</div>
                <div class="subtitle">${toUpperTr(metadata.schoolName || '')}</div>
                <div class="subtitle">${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)}</div>
                <div class="subtitle">${toUpperTr(metadata.examType)} | ${metadata.schoolYear || ''}</div>
            </div>

            <h3>1. SINIF ÖZETİ</h3>
            <table>
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
                            <td style="text-align: left;">${toUpperTr(s.name)}</td>
                            <td>${total}</td>
                            <td>%${pct.toFixed(0)}</td>
                            <td class="${pct >= 50 ? 'success' : 'fail'}">${pct >= 50 ? 'GEÇTİ' : 'KALDI'}</td>
                        </tr>
                    `;
    }).join('')}
            </table>

            <h3>3. KAZANIM ANALİZİ</h3>
            <table>
                <tr>
                    <th>Kazanım</th>
                    <th>Soru Sayısı</th>
                    <th>Sınıf Başarısı</th>
                </tr>
                ${analysis.outcomeStats.map(t => `
                    <tr>
                        <td style="text-align: left;">${t.description}</td>
                        <td>-</td>
                        <td>%${t.successRate.toFixed(1)}</td>
                    </tr>
                `).join('')}
            </table>
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

export async function exportToPDFAdvanced(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr',
    options: any = {}
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);
    await createFullReport(doc, analysis, metadata, questions, students);
    doc.save(`${safeName(metadata.className)}_Rapor.pdf`);
}

export async function quickExport(
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    if (scenario === 'student_cards') {
        await createStudentCards(doc, analysis, metadata, questions, students);
        doc.save(`${safeName(metadata.className)}_Karneler.pdf`);
    } else {
        await createFullReport(doc, analysis, metadata, questions, students);
        doc.save(`${safeName(metadata.className)}_Rapor.pdf`);
    }
}

export async function exportBilingualReports(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
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
