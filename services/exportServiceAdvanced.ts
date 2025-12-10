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
    // MODERN GRADIENT HEADER
    // ═══════════════════════════════════════════════════════════════

    // Gradient background (mavi tonları)
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 55, 'F');

    // Dekoratif alt dalga
    doc.setFillColor(52, 152, 219);
    doc.rect(0, 50, pageWidth, 5, 'F');

    // Beyaz başlık metni
    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(22);
    y = 18;
    doc.text('SINAV SONUÇ RAPORU', pageWidth / 2, y, { align: 'center' });

    // Dönem bilgisi
    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');
    y += 10;
    doc.text(`${metadata.className} - ${metadata.subject}`, pageWidth / 2, y, { align: 'center' });

    // Sınav türü ve tarih
    doc.setFontSize(9);
    y += 7;
    const examInfo = `${metadata.examType} | ${metadata.schoolYear || '2025-2026 Eğitim Öğretim Yılı'}`;
    doc.text(examInfo, pageWidth / 2, y, { align: 'center' });

    // Okul adı (alt kısımda, küçük font)
    doc.setFontSize(8);
    y += 10;
    doc.text(metadata.schoolName || 'OKUL ADI', pageWidth / 2, y, { align: 'center' });

    // ═══════════════════════════════════════════════════════════════
    // ÖZET BİLGİLER KARTI (Modern Card Design)
    // ═══════════════════════════════════════════════════════════════

    y = 65;
    const cardHeight = 28;

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
    doc.setFontSize(9);
    doc.text('SINIF PERFORMANS ÖZETİ', margin + 5, y + 6);

    // İstatistikler
    const maxScore = Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const minScore = Math.min(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const passCount = students.filter(s => {
        const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
        return (total / maxTotal * 100) >= 50;
    }).length;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const statsY = y + 14;
    const col1X = margin + 8;
    const col2X = margin + 55;
    const col3X = margin + 100;
    const col4X = margin + 145;

    // Sınıf Ortalaması (renkli)
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Sınıf Ort:', col1X, statsY);
    doc.setTextColor(analysis.classAverage >= 50 ? 34 : 220, analysis.classAverage >= 50 ? 197 : 53, analysis.classAverage >= 50 ? 94 : 69);
    doc.setFontSize(11);
    doc.text(`%${analysis.classAverage.toFixed(1)}`, col1X, statsY + 7);

    // Öğrenci Sayısı
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Öğrenci:', col2X, statsY);
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(11);
    doc.text(String(students.length), col2X, statsY + 7);

    // Başarılı Sayısı
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Başarılı:', col3X, statsY);
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(11);
    doc.text(String(passCount), col3X, statsY + 7);

    // En Yüksek/Düşük
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Max/Min:', col4X, statsY);
    doc.setFontSize(9);
    doc.setTextColor(34, 197, 94);
    doc.text(String(maxScore), col4X, statsY + 7);
    doc.setTextColor(239, 68, 68);
    doc.text(` / ${minScore}`, col4X + 8, statsY + 7);

    y += cardHeight + 12;

    // ═══════════════════════════════════════════════════════════════
    // SORU ANALİZİ TABLOSU (Modern Design)
    // ═══════════════════════════════════════════════════════════════

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('📊 SORU BAZLI ANALİZ', margin, y);
    y += 2;

    // Alt çizgi
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 50, y);
    y += 5;

    const questionRows = analysis.questionStats.map(q => {
        const qConfig = questions.find(x => x.id === q.questionId);
        return [
            String(q.questionId),
            q.outcome.description.length > 65 ? q.outcome.description.substring(0, 65) + '...' : q.outcome.description,
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
            overflow: 'linebreak',
            lineColor: [226, 232, 240],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [99, 102, 241],
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
            1: { cellWidth: 108 },
            2: { cellWidth: 13, halign: 'center' },
            3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
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

    y = (doc as any).lastAutoTable.finalY + 12;

    if (y > 200) { doc.addPage(); y = 20; }

    // ═══════════════════════════════════════════════════════════════
    // KAZANIM DURUMU TABLOSU (Enhanced)
    // ═══════════════════════════════════════════════════════════════

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('🎯 KAZANIM BAŞARI DURUMU', margin, y);
    y += 2;

    // Alt çizgi
    doc.setDrawColor(52, 168, 83);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 60, y);
    y += 5;

    const outcomeRows = analysis.outcomeStats.map(o => [
        o.code,
        o.description.length > 60 ? o.description.substring(0, 60) + '...' : o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kod', 'Açıklama', 'Başarı', 'Durum']],
        body: outcomeRows,
        theme: 'striped',
        styles: {
            font: 'Roboto',
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            lineColor: [226, 232, 240],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [52, 168, 83],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold', textColor: [71, 85, 105] },
            1: { cellWidth: 105 },
            2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'GELİŞTİRİLMELİ') {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [254, 226, 226];
                } else {
                    data.cell.styles.textColor = [21, 128, 61];
                    data.cell.styles.fillColor = [220, 252, 231];
                }
            }
            if (data.section === 'body' && data.column.index === 2) {
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

    // ═══════════════════════════════════════════════════════════════
    // ÖĞRENCİ LİSTESİ - YENİ SAYFA
    // ═══════════════════════════════════════════════════════════════

    doc.addPage();
    y = 0;

    // Sayfa 2 Header (daha küçük)
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text('👨‍🎓 ÖĞRENCİ SONUÇ LİSTESİ', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.text(`${metadata.className} - ${metadata.subject}`, pageWidth / 2, 25, { align: 'center' });

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
        doc.text(metadata.schoolName || 'OKUL ADI', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(8);
        doc.text(`${metadata.className} | ${metadata.subject} | ${metadata.examType}`, pageWidth / 2, 33, { align: 'center' });

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
