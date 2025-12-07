/**
 * ============================================
 * SINAV ANALİZ UZMANI - PDF RAPORLAMA SİSTEMİ
 * ============================================
 * 
 * Bu dosya TÜM PDF raporlama işlemlerini yönetir.
 * 5 Farklı Rapor Türü:
 * 
 * 1. full_report        - Tam Rapor (Detaylı, Grafikli)
 * 2. executive_summary  - Yönetici Özeti (Sadece Önemli İstatistikler)
 * 3. student_focused    - Öğrenci Odaklı (Bireysel Performans Listesi)
 * 4. outcome_analysis   - Kazanım Analizi (Detaylı Kazanım Raporu)
 * 5. parent_report      - Veli Raporu (Sade ve Anlaşılır Format)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// ═══════════════════════════════════════════════════════════════════
// TİPLER
// ═══════════════════════════════════════════════════════════════════
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'executive_summary' | 'student_focused' | 'outcome_analysis' | 'parent_report';

// ═══════════════════════════════════════════════════════════════════
// SABİTLER (A4: 210mm x 297mm)
// ═══════════════════════════════════════════════════════════════════
const PAGE = {
    width: 210,
    height: 297,
    margin: 15,
    contentWidth: 180
};

// ═══════════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════
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

// Sayfa Başlığı Çiz
const drawPageHeader = (doc: jsPDF, metadata: ExamMetadata, title: string): number => {
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(metadata.schoolName || 'OKUL ADI', PAGE.width / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');
    doc.text(title, PAGE.width / 2, 22, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${metadata.className} | ${metadata.subject} | ${metadata.examType}`, PAGE.width / 2, 28, { align: 'center' });

    // Çizgi
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(PAGE.margin, 32, PAGE.width - PAGE.margin, 32);

    return 40; // Cursor Y başlangıcı
};

// Sayfa Numarası Ekle
const addPageNumbers = (doc: jsPDF) => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Sayfa ${i} / ${totalPages}`, PAGE.width - PAGE.margin, PAGE.height - 10, { align: 'right' });
        doc.text(new Date().toLocaleDateString('tr-TR'), PAGE.margin, PAGE.height - 10);
    }
};

// ═══════════════════════════════════════════════════════════════════
// 1. TAM RAPOR (Full Report)
// ═══════════════════════════════════════════════════════════════════
const generateFullReport = async (
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any
) => {
    let y = drawPageHeader(doc, metadata, 'SINAV ANALİZ RAPORU');

    // Özet Kutusu
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 20, 2, 2, 'F');
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30);

    const maxScore = Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const minScore = Math.min(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));

    doc.text(`Sınıf Ort: %${analysis.classAverage.toFixed(1)}`, PAGE.margin + 10, y + 8);
    doc.text(`Öğrenci: ${students.length}`, PAGE.margin + 60, y + 8);
    doc.text(`En Yüksek: ${maxScore}`, PAGE.margin + 100, y + 8);
    doc.text(`En Düşük: ${minScore}`, PAGE.margin + 140, y + 8);

    const failedCount = analysis.outcomeStats.filter(o => o.isFailed).length;
    doc.setTextColor(failedCount > 0 ? 220 : 34, failedCount > 0 ? 38 : 197, failedCount > 0 ? 38 : 94);
    doc.text(`Başarısız Kazanım: ${failedCount}`, PAGE.margin + 10, y + 16);

    y += 30;

    // Grafik (varsa)
    if (chartImages?.overview) {
        try {
            doc.addImage(chartImages.overview, 'PNG', PAGE.margin, y, PAGE.contentWidth, 50);
            y += 60;
        } catch (e) { console.error(e); }
    }

    // Tablo 1: Soru Analizi
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text('SORU BAZLI ANALİZ', PAGE.margin, y);
    y += 5;

    const questionData = analysis.questionStats.map(q => [
        q.questionId,
        q.outcome.description,
        questions.find(x => x.id === q.questionId)?.maxScore || 0,
        q.averageScore.toFixed(1),
        `%${q.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: y,
        head: [['No', 'Kazanım', 'Max', 'Ort', 'Başarı']],
        body: questionData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 100 },
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // Sayfa kontrolü
    if (y > 220) { doc.addPage(); y = drawPageHeader(doc, metadata, 'SINAV ANALİZ RAPORU - DEVAM'); }

    // Tablo 2: Kazanım Durumu
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text('KAZANIM BAŞARI DURUMU', PAGE.margin, y);
    y += 5;

    const outcomeData = analysis.outcomeStats.map(o => [
        o.code,
        o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kod', 'Açıklama', 'Başarı', 'Durum']],
        body: outcomeData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 95 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                data.cell.styles.textColor = data.cell.raw === 'GELİŞTİRİLMELİ' ? [220, 38, 38] : [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    // Yeni Sayfa: Öğrenci Listesi
    doc.addPage();
    y = drawPageHeader(doc, metadata, 'ÖĞRENCİ SONUÇ LİSTESİ');

    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
        return sb - sa;
    });

    const studentData = sortedStudents.map((s, i) => {
        const score = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);
        const pct = (score / maxTotal) * 100;
        return [i + 1, s.student_number || '-', s.name, score, `%${pct.toFixed(0)}`, pct >= 50 ? 'GEÇTİ' : 'KALDI'];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
        body: studentData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 70 },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                data.cell.styles.textColor = data.cell.raw === 'KALDI' ? [220, 38, 38] : [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    addPageNumbers(doc);
};

// ═══════════════════════════════════════════════════════════════════
// 2. YÖNETİCİ ÖZETİ (Executive Summary)
// ═══════════════════════════════════════════════════════════════════
const generateExecutiveSummary = async (
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) => {
    let y = drawPageHeader(doc, metadata, 'YÖNETİCİ ÖZETİ');

    // Büyük İstatistik Kartları
    const cardWidth = 40;
    const cardHeight = 30;
    const gap = 10;
    const startX = PAGE.margin + 10;

    const stats = [
        { label: 'Sınıf Ort.', value: `%${analysis.classAverage.toFixed(0)}`, color: analysis.classAverage >= 50 ? [34, 197, 94] : [220, 38, 38] },
        { label: 'Öğrenci', value: students.length.toString(), color: [59, 130, 246] },
        { label: 'Başarısız Kazanım', value: analysis.outcomeStats.filter(o => o.isFailed).length.toString(), color: [239, 68, 68] },
        { label: 'Toplam Soru', value: questions.length.toString(), color: [168, 85, 247] }
    ];

    stats.forEach((stat, i) => {
        const x = startX + i * (cardWidth + gap);
        doc.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255);
        doc.text(stat.value, x + cardWidth / 2, y + 15, { align: 'center' });

        doc.setFontSize(8);
        doc.text(stat.label, x + cardWidth / 2, y + 24, { align: 'center' });
    });

    y += cardHeight + 20;

    // Kritik Kazanımlar (Başarısız Olanlar)
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text('KRİTİK KAZANIMLAR (Başarı < %50)', PAGE.margin, y);
    y += 5;

    const failedOutcomes = analysis.outcomeStats.filter(o => o.isFailed);

    if (failedOutcomes.length === 0) {
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.text('✓ Tüm kazanımlar başarılı seviyede.', PAGE.margin, y + 10);
    } else {
        const failedData = failedOutcomes.map(o => [o.code, o.description, `%${o.successRate.toFixed(1)}`]);

        autoTable(doc, {
            startY: y,
            head: [['Kod', 'Kazanım', 'Başarı']],
            body: failedData,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [239, 68, 68], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 30, fontStyle: 'bold' },
                1: { cellWidth: 120 },
                2: { cellWidth: 25, halign: 'center', textColor: [220, 38, 38] }
            },
            margin: { left: PAGE.margin, right: PAGE.margin }
        });
    }

    addPageNumbers(doc);
};

// ═══════════════════════════════════════════════════════════════════
// 3. ÖĞRENCİ ODAKLI (Student Focused - Performans Listesi)
// ═══════════════════════════════════════════════════════════════════
const generateStudentFocused = async (
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) => {
    let y = drawPageHeader(doc, metadata, 'ÖĞRENCİ PERFORMANS LİSTESİ');

    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);

    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((x, y) => x + y, 0);
        const sb = Object.values(b.scores).reduce((x, y) => x + y, 0);
        return sb - sa;
    });

    const studentData = sortedStudents.map((s, i) => {
        const score = Object.values(s.scores).reduce((a, b) => a + b, 0);
        const pct = (score / maxTotal) * 100;
        let grade = '';
        if (pct >= 85) grade = 'Pekiyi';
        else if (pct >= 70) grade = 'İyi';
        else if (pct >= 55) grade = 'Orta';
        else if (pct >= 45) grade = 'Geçer';
        else grade = 'Başarısız';

        return [i + 1, s.student_number || '-', s.name, `${score}/${maxTotal}`, `%${pct.toFixed(0)}`, grade];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Not']],
        body: studentData,
        theme: 'striped',
        styles: { font: 'Roboto', fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [249, 115, 22], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 70 },
            3: { cellWidth: 25, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const grade = data.cell.raw as string;
                if (grade === 'Başarısız') data.cell.styles.textColor = [220, 38, 38];
                else if (grade === 'Pekiyi') data.cell.styles.textColor = [34, 197, 94];
                else data.cell.styles.textColor = [30, 41, 59];
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    addPageNumbers(doc);
};

// ═══════════════════════════════════════════════════════════════════
// 4. KAZANIM ANALİZİ (Outcome Analysis)
// ═══════════════════════════════════════════════════════════════════
const generateOutcomeAnalysis = async (
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata
) => {
    let y = drawPageHeader(doc, metadata, 'KAZANIM ANALİZ RAPORU');

    // Özet
    const total = analysis.outcomeStats.length;
    const failed = analysis.outcomeStats.filter(o => o.isFailed).length;
    const passed = total - failed;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(`Toplam Kazanım: ${total}  |  `, PAGE.margin, y);
    doc.setTextColor(34, 197, 94);
    doc.text(`Başarılı: ${passed}`, PAGE.margin + 45, y);
    doc.setTextColor(220, 38, 38);
    doc.text(`  |  Geliştirilmeli: ${failed}`, PAGE.margin + 70, y);

    y += 10;

    // Detaylı Tablo
    const outcomeData = analysis.outcomeStats.map(o => [
        o.code,
        o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kazanım Kodu', 'Kazanım Açıklaması', 'Başarı Oranı', 'Durum']],
        body: outcomeData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold' },
            1: { cellWidth: 100 },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                data.cell.styles.textColor = data.cell.raw === 'GELİŞTİRİLMELİ' ? [220, 38, 38] : [34, 197, 94];
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    addPageNumbers(doc);
};

// ═══════════════════════════════════════════════════════════════════
// 5. VELİ RAPORU (Parent Report)
// ═══════════════════════════════════════════════════════════════════
const generateParentReport = async (
    doc: jsPDF,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) => {
    const maxTotal = questions.reduce((a, q) => a + q.maxScore, 0);

    // Her öğrenci için ayrı sayfa (Karne formatı)
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (i > 0) doc.addPage();

        let y = 20;

        // Başlık
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.text(metadata.schoolName || 'OKUL ADI', PAGE.width / 2, y, { align: 'center' });
        y += 7;

        doc.setFontSize(11);
        doc.text('SINAV SONUÇ BİLDİRİMİ', PAGE.width / 2, y, { align: 'center' });
        y += 10;

        // Öğrenci Bilgisi Kutusu
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 25, 3, 3, 'F');
        doc.setDrawColor(200);
        doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 25, 3, 3, 'S');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.text(student.name, PAGE.margin + 5, y + 10);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.text(`Numara: ${student.student_number || '-'}  |  Sınıf: ${metadata.className}  |  Ders: ${metadata.subject}`, PAGE.margin + 5, y + 18);

        // Puan
        const score = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const pct = (score / maxTotal) * 100;

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(pct >= 50 ? 34 : 220, pct >= 50 ? 197 : 38, pct >= 50 ? 94 : 38);
        doc.text(`${score} / ${maxTotal}`, PAGE.width - PAGE.margin - 5, y + 15, { align: 'right' });

        y += 35;

        // Soru Detayları
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30);
        doc.text('SORU BAZLI PERFORMANS', PAGE.margin, y);
        y += 5;

        const questionData = analysis.questionStats.map((q, idx) => {
            const qScore = student.scores[q.questionId] || 0;
            const qMax = questions.find(x => x.id === q.questionId)?.maxScore || 0;
            return [idx + 1, q.outcome.description, `${qScore} / ${qMax}`];
        });

        autoTable(doc, {
            startY: y,
            head: [['Soru', 'Konu', 'Puan']],
            body: questionData,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [16, 185, 129], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 130 },
                2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
            },
            margin: { left: PAGE.margin, right: PAGE.margin }
        });

        y = (doc as any).lastAutoTable.finalY + 15;

        // Değerlendirme
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30);
        doc.text('DEĞERLENDİRME', PAGE.margin, y);
        y += 7;

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70);

        if (pct >= 85) {
            doc.text('Öğrenciniz bu sınavda ÜSTÜN başarı göstermiştir. Tebrikler!', PAGE.margin, y);
        } else if (pct >= 70) {
            doc.text('Öğrenciniz bu sınavda İYİ bir performans sergilemiştir.', PAGE.margin, y);
        } else if (pct >= 50) {
            doc.text('Öğrenciniz bu sınavda ORTA düzeyde başarı göstermiştir. Eksik konuların tekrarı önerilir.', PAGE.margin, y);
        } else {
            doc.text('Öğrencinizin bu sınavdaki performansı beklenenin altındadır. Ek çalışma yapılması önerilir.', PAGE.margin, y);
        }
    }

    addPageNumbers(doc);
};

// ═══════════════════════════════════════════════════════════════════
// ANA EXPORT FONKSİYONU
// ═══════════════════════════════════════════════════════════════════
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr',
    options: any = {}
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    await generateFullReport(doc, analysis, metadata, questions, students, chartImages);

    doc.save(`${safeFileName(metadata.className)}_Tam_Rapor.pdf`);
};

// ═══════════════════════════════════════════════════════════════════
// HIZLI EXPORT (Quick Export)
// ═══════════════════════════════════════════════════════════════════
export const quickExport = async (
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    let fileName = '';

    switch (scenario) {
        case 'full_report':
            await generateFullReport(doc, analysis, metadata, questions, students, chartImages);
            fileName = 'Tam_Rapor';
            break;
        case 'executive_summary':
            await generateExecutiveSummary(doc, analysis, metadata, questions, students);
            fileName = 'Yonetici_Ozeti';
            break;
        case 'student_focused':
            await generateStudentFocused(doc, analysis, metadata, questions, students);
            fileName = 'Ogrenci_Listesi';
            break;
        case 'outcome_analysis':
            await generateOutcomeAnalysis(doc, analysis, metadata);
            fileName = 'Kazanim_Analizi';
            break;
        case 'parent_report':
            await generateParentReport(doc, analysis, metadata, questions, students);
            fileName = 'Veli_Raporu';
            break;
        default:
            await generateFullReport(doc, analysis, metadata, questions, students, chartImages);
            fileName = 'Rapor';
    }

    doc.save(`${safeFileName(metadata.className)}_${fileName}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════
// DİĞER WRAPPER FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════════
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await quickExport('full_report', analysis, metadata, questions, students, chartImages, 'tr');
};

export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    await quickExport('parent_report', analysis, metadata, questions, students, {}, language);
};

// ═══════════════════════════════════════════════════════════════════
// SENARYO LİSTESİ
// ═══════════════════════════════════════════════════════════════════
export const getExportScenarios = (language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Tam Rapor', description: 'Tüm grafikler, tablolar ve öneriler dahil' },
        { id: 'executive_summary' as ExportScenario, icon: '📋', name: 'Yönetici Özeti', description: 'Sadece önemli istatistikler ve öneriler' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Odaklı', description: 'Bireysel öğrenci performans listesi' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: 'Kazanım Analizi', description: 'Detaylı kazanım bazlı rapor' },
        { id: 'parent_report' as ExportScenario, icon: '👪', name: 'Veli Raporu', description: 'Veliler için sade ve anlaşılır format' }
    ];
};
