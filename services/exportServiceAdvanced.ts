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
    // SAYFA 1: KAPAK VE ÖZET
    // ═══════════════════════════════════════════════════════════════

    // Gradient background (mavi tonları)
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Dekoratif alt dalga
    doc.setFillColor(52, 152, 219);
    doc.rect(0, 55, pageWidth, 5, 'F');

    // Beyaz başlık metni
    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(24);
    y = 20;
    doc.text('SINAV SONUÇ RAPORU', pageWidth / 2, y, { align: 'center' });

    // Dönem bilgisi
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    y += 12;
    doc.text(`${toUpperTr(metadata.className)} - ${toUpperTr(metadata.subject)}`, pageWidth / 2, y, { align: 'center' });

    // Sınav türü ve tarih
    doc.setFontSize(10);
    y += 8;
    const examInfo = `${toUpperTr(metadata.examType)} | ${metadata.schoolYear || '2025-2026 EĞİTİM ÖĞRETİM YILI'}`;
    doc.text(examInfo, pageWidth / 2, y, { align: 'center' });

    // Okul adı (alt kısımda, küçük font)
    doc.setFontSize(9);
    y += 10;
    doc.text(toUpperTr(metadata.schoolName || 'OKUL ADI'), pageWidth / 2, y, { align: 'center' });

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
    // SAYFA 2: DETAYLI ANALİZLER
    // ═══════════════════════════════════════════════════════════════

    doc.addPage();
    y = 15;

    // Sayfa 2 Başlık
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('DETAYLI ANALİZ RAPORU', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // ---------------------------------------------------------------
    // SATIR 1: YETKİNLİK HARİTASI (SOL) | NOT DAĞILIMI (SAĞ)
    // ---------------------------------------------------------------

    const row1Y = y;
    const leftColWidth = (pageWidth - margin * 2) / 2 - 5;
    const rightColX = margin + leftColWidth + 10;

    // --- SOL: YETKİNLİK HARİTASI (Kazanım Tablosu - Özet) ---
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Yetkinlik Haritası', margin, row1Y);

    // Alt çizgi
    doc.setDrawColor(52, 168, 83);
    doc.setLineWidth(0.5);
    doc.line(margin, row1Y + 2, margin + 40, row1Y + 2);

    const outcomeRows = analysis.outcomeStats.slice(0, 10).map(o => [ // İlk 10 kazanım
        o.code,
        `%${o.successRate.toFixed(0)}`,
        o.isFailed ? 'Geliştirilmeli' : 'Başarılı'
    ]);

    autoTable(doc, {
        startY: row1Y + 5,
        head: [['Kod', 'Başarı', 'Durum']],
        body: outcomeRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [52, 168, 83], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                if (data.cell.raw === 'Geliştirilmeli') {
                    data.cell.styles.textColor = [220, 53, 69];
                } else {
                    data.cell.styles.textColor = [21, 128, 61];
                }
            }
        },
        margin: { left: margin },
        tableWidth: leftColWidth
    });

    // --- SAĞ: NOT DAĞILIMI (Tablo/Grafik) ---
    doc.text('Not Dağılımı', rightColX, row1Y);
    doc.setDrawColor(245, 158, 11);
    doc.line(rightColX, row1Y + 2, rightColX + 30, row1Y + 2);

    // Not dağılımını hesapla
    const gradeDist = {
        'Pekiyi (85-100)': 0,
        'İyi (70-84)': 0,
        'Orta (55-69)': 0,
        'Geçer (45-54)': 0,
        'Başarısız (0-44)': 0
    };

    students.forEach(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
        const score = (total / maxTotal) * 100;

        if (score >= 85) gradeDist['Pekiyi (85-100)']++;
        else if (score >= 70) gradeDist['İyi (70-84)']++;
        else if (score >= 55) gradeDist['Orta (55-69)']++;
        else if (score >= 45) gradeDist['Geçer (45-54)']++;
        else gradeDist['Başarısız (0-44)']++;
    });

    const gradeRows = Object.entries(gradeDist).map(([label, count]) => [label, String(count)]);

    autoTable(doc, {
        startY: row1Y + 5,
        head: [['Not Aralığı', 'Öğrenci Sayısı']],
        body: gradeRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: rightColX },
        tableWidth: leftColWidth // Sağ taraf da aynı genişlikte
    });

    // En alt Y pozisyonunu bul
    y = Math.max((doc as any).lastAutoTable.finalY, row1Y + 5 + (outcomeRows.length * 8)) + 15;

    // ---------------------------------------------------------------
    // SATIR 2: PUAN DAĞILIMI (Sayfa Genişliğinde)
    // ---------------------------------------------------------------

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Puan Dağılımı', margin, y);
    doc.setDrawColor(99, 102, 241);
    doc.line(margin, y + 2, margin + 40, y + 2);
    y += 8;

    // Basit bir bar grafik çizimi (Puan aralıkları: 0-10, 10-20, ..., 90-100)
    const scoreRanges = Array(10).fill(0);
    students.forEach(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
        const score = (total / maxTotal) * 100;
        const index = Math.min(Math.floor(score / 10), 9);
        scoreRanges[index]++;
    });

    const maxCount = Math.max(...scoreRanges);
    const chartHeight = 30;
    const barWidth = (pageWidth - margin * 2) / 10 - 2;

    // Grafik alanı
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, chartHeight + 10, 2, 2, 'F');

    scoreRanges.forEach((count, i) => {
        if (count > 0) {
            const barHeight = (count / maxCount) * chartHeight;
            const x = margin + 5 + (i * (barWidth + 2));
            const barY = y + chartHeight - barHeight + 5;

            // Bar
            doc.setFillColor(99, 102, 241);
            doc.rect(x, barY, barWidth, barHeight, 'F');

            // Sayı
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(String(count), x + barWidth / 2, barY - 2, { align: 'center' });
        }

        // Etiket (X ekseni)
        const label = `${i * 10}-${(i + 1) * 10}`;
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin + 5 + (i * (barWidth + 2)) + barWidth / 2, y + chartHeight + 9, { align: 'center' });
    });

    y += chartHeight + 20;

    // ---------------------------------------------------------------
    // SATIR 3: SORU BAZLI ANALİZ (Sayfa Genişliğinde)
    // ---------------------------------------------------------------

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Soru Bazlı Analiz', margin, y);
    doc.setDrawColor(236, 72, 153);
    doc.line(margin, y + 2, margin + 40, y + 2);
    y += 5;

    const questionRows = analysis.questionStats.map(q => {
        const qConfig = questions.find(x => x.id === q.questionId);
        return [
            String(q.questionId),
            q.outcome.description.length > 80 ? q.outcome.description.substring(0, 80) + '...' : q.outcome.description,
            String(qConfig?.maxScore || 0),
            q.averageScore.toFixed(1),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Soru', 'Kazanım', 'Max', 'Ort', 'Başarı']],
        body: questionRows,
        theme: 'striped',
        styles: {
            font: 'Roboto',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [226, 232, 240],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [236, 72, 153],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 110 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const value = parseFloat(data.cell.raw.toString().replace('%', ''));
                if (value < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (value < 75) data.cell.styles.textColor = [245, 158, 11];
                else data.cell.styles.textColor = [34, 197, 94];
            }
        },
        margin: { left: margin, right: margin }
    });

    // Öğrenci Listesi
    await createStudentListPage(doc, analysis, metadata, questions, students);
}

// ═══════════════════════════════════════════════════════════════
// ÖĞRENCİ LİSTESİ - YENİ SAYFA
// ═══════════════════════════════════════════════════════════════
async function createStudentListPage(
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) {
    const pageWidth = 210;
    const margin = 15;
    doc.addPage();
    let y = 0;

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
