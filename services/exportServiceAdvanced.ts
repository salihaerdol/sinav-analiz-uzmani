/**
 * FINAL & ABSOLUTE PDF REPORTING ENGINE
 * 
 * Bu dosya, projedeki TÜM PDF raporlama işlemlerini yöneten TEK yetkili servistir.
 * İçerisinde 3 farklı rapor türü için özelleştirilmiş, milimetrik ayarlı motorlar bulunur.
 * 
 * 1. generateCorporateReport (Kurumsal Rapor)
 * 2. generateOutcomeReport (Kazanım Analiz Raporu)
 * 3. generateStudentCards (Öğrenci Karneleri)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// --- TİPLER ---
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'outcome_analysis' | 'student_focused';

// --- SABİT AYARLAR (A4 Kağıdı: 210mm x 297mm) ---
const PAGE = {
    width: 210,
    height: 297,
    margin: 15,
    contentWidth: 180 // 210 - (15+15)
};

// --- YARDIMCI FONKSİYONLAR ---
const safeFileName = (text: string) => text.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ]/g, '_');

// Header Çizimi (Her Sayfa İçin)
const drawHeader = (doc: jsPDF, metadata: ExamMetadata, title: string) => {
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(50);
    // Sol Üst
    doc.text(metadata.schoolName || 'OKUL ADI', PAGE.margin, 10);
    // Sağ Üst
    doc.text(new Date().toLocaleDateString('tr-TR'), PAGE.width - PAGE.margin, 10, { align: 'right' });

    // Çizgi
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.line(PAGE.margin, 12, PAGE.width - PAGE.margin, 12);

    // Rapor Başlığı (Ortalı)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(title, PAGE.width / 2, 20, { align: 'center' });

    // Alt Bilgi
    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.text(`${metadata.className} - ${metadata.subject} (${metadata.examType})`, PAGE.width / 2, 26, { align: 'center' });

    return 35; // Cursor Y başlangıcı
};

// Footer Çizimi (İmza Sirküleri - Sadece Son Sayfa)
const drawSignatures = (doc: jsPDF) => {
    const y = PAGE.height - 40;
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);

    // Sol İmza
    doc.text('.....................................', 40, y, { align: 'center' });
    doc.text('Ders Öğretmeni', 40, y + 5, { align: 'center' });

    // Sağ İmza
    doc.text('.....................................', PAGE.width - 40, y, { align: 'center' });
    doc.text('Okul Müdürü', PAGE.width - 40, y + 5, { align: 'center' });
};

// --- 1. KURUMSAL RAPOR MOTORU (Full Report) ---
const generateCorporateReport = async (doc: jsPDF, analysis: AnalysisResult, metadata: ExamMetadata, questions: QuestionConfig[], students: Student[], chartImages: any) => {
    let cursorY = drawHeader(doc, metadata, 'SINAV SONUÇ VE ANALİZ RAPORU');

    // Özet Bilgiler
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.setFillColor(245, 247, 250);
    doc.rect(PAGE.margin, cursorY, PAGE.contentWidth, 15, 'F');
    doc.rect(PAGE.margin, cursorY, PAGE.contentWidth, 15, 'S');

    const summary = `Sınıf Ort: ${analysis.classAverage.toFixed(2)}  |  Öğrenci: ${students.length}  |  Başarı: %${((analysis.classAverage / 100) * 100).toFixed(0)}  |  En Yüksek: ${Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)))}`;
    doc.text(summary, PAGE.width / 2, cursorY + 9, { align: 'center' });
    cursorY += 25;

    // Grafik (Varsa)
    if (chartImages.overview) {
        try {
            const imgH = 60;
            doc.addImage(chartImages.overview, 'PNG', PAGE.margin, cursorY, PAGE.contentWidth, imgH);
            cursorY += imgH + 10;
        } catch (e) { console.error(e); }
    }

    // Tablo 1: Soru Analizi
    doc.setFontSize(12);
    doc.text('1. Soru Bazlı Başarı Analizi', PAGE.margin, cursorY);
    cursorY += 5;

    const qData = analysis.questionStats.map(q => [
        q.questionId,
        q.outcome.description,
        questions.find(x => x.id === q.questionId)?.maxScore || 0,
        q.averageScore.toFixed(2),
        `%${q.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['No', 'Kazanım', 'Max', 'Ort', '%']],
        body: qData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 9, cellPadding: 3, lineColor: [200] },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 110 }, // SABİT GENİŞLİK - ASLA TAŞMAZ
            2: { cellWidth: 15, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // Tablo 2: Öğrenci Listesi (Yeni Sayfa Gerekebilir)
    if (cursorY > 200) { doc.addPage(); cursorY = drawHeader(doc, metadata, 'SINAV SONUÇ LİSTESİ'); }

    doc.setFontSize(12);
    doc.text('2. Öğrenci Başarı Listesi', PAGE.margin, cursorY);
    cursorY += 5;

    const sData = students
        .sort((a, b) => (Object.values(b.scores).reduce((x, y) => x + y, 0)) - (Object.values(a.scores).reduce((x, y) => x + y, 0)))
        .map((s, i) => {
            const score = Object.values(s.scores).reduce((a, b) => a + b, 0);
            return [
                i + 1,
                s.student_number || '-',
                s.name,
                score,
                score >= 50 ? 'GEÇTİ' : 'KALDI'
            ];
        });

    autoTable(doc, {
        startY: cursorY,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Durum']],
        body: sData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                data.cell.styles.textColor = data.cell.raw === 'KALDI' ? [231, 76, 60] : [39, 174, 96];
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    drawSignatures(doc);
};

// --- 2. KAZANIM ANALİZ RAPORU MOTORU (Outcome Report) ---
const generateOutcomeReport = async (doc: jsPDF, analysis: AnalysisResult, metadata: ExamMetadata) => {
    let cursorY = drawHeader(doc, metadata, 'KAZANIM ANALİZ RAPORU');

    const oData = analysis.outcomeStats.map(o => [
        o.code,
        o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['Kod', 'Kazanım Açıklaması', 'Başarı', 'Durum']],
        body: oData,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 9, cellPadding: 4, lineColor: [200] },
        headStyles: { fillColor: [142, 68, 173], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold' },
            1: { cellWidth: 90 }, // SABİT GENİŞLİK
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                data.cell.styles.textColor = data.cell.raw === 'GELİŞTİRİLMELİ' ? [231, 76, 60] : [39, 174, 96];
            }
        },
        margin: { left: PAGE.margin, right: PAGE.margin }
    });

    drawSignatures(doc);
};

// --- 3. ÖĞRENCİ KARNELERİ MOTORU (Student Cards) ---
const generateStudentCards = async (doc: jsPDF, analysis: AnalysisResult, metadata: ExamMetadata, questions: QuestionConfig[], students: Student[]) => {
    const maxScore = questions.reduce((a, b) => a + b.maxScore, 0);

    // A5 Boyutunda (Yarım A4) İki Karne Bir Sayfaya
    // Ancak basitlik için her sayfaya 1 karne (A5 Landscape veya A4 Portrait yarısı) yerine
    // Standart A4 sayfasına 2 karne sığdıracağız.

    let yOffset = 0; // 0: Üst, 148: Alt

    for (let i = 0; i < students.length; i++) {
        const student = students[i];

        // Her 2 öğrencide bir sayfa temizle, ama ilk öğrenci hariç
        if (i > 0 && i % 2 === 0) {
            doc.addPage();
            yOffset = 0;
        } else if (i > 0) {
            yOffset = 148; // Sayfanın alt yarısı
            // Ayırıcı Çizgi
            doc.setDrawColor(200);
            doc.setLineDashPattern([2, 2], 0);
            doc.line(10, 148, 200, 148);
            doc.setLineDashPattern([], 0);
        }

        const baseY = yOffset + 10;

        // Karne Başlığı
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.text(metadata.schoolName || 'OKUL ADI', PAGE.width / 2, baseY + 5, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.text(`${metadata.subject} Sınav Sonuç Belgesi`, PAGE.width / 2, baseY + 10, { align: 'center' });

        // Öğrenci Bilgisi
        doc.setFillColor(240, 240, 240);
        doc.rect(PAGE.margin, baseY + 15, PAGE.contentWidth, 15, 'F');
        doc.setFont('Roboto', 'bold');
        doc.text(student.name, PAGE.margin + 5, baseY + 21);
        doc.setFont('Roboto', 'normal');
        doc.text(`No: ${student.student_number || '-'}`, PAGE.margin + 5, baseY + 26);

        // Puan
        const score = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const percent = (score / maxScore) * 100;

        doc.setFontSize(14);
        doc.setFont('Roboto', 'bold');
        doc.setTextColor(percent >= 50 ? 39 : 231, percent >= 50 ? 174 : 76, percent >= 50 ? 96 : 60);
        doc.text(`PUAN: ${score}`, PAGE.width - PAGE.margin - 5, baseY + 24, { align: 'right' });
        doc.setTextColor(0);

        // Detay Tablosu
        const sData = analysis.questionStats.map((q, idx) => [
            idx + 1,
            q.outcome.description,
            `${student.scores[q.questionId] || 0} / ${questions.find(x => x.id === q.questionId)?.maxScore}`
        ]);

        autoTable(doc, {
            startY: baseY + 35,
            head: [['Soru', 'Kazanım', 'Puan']],
            body: sData,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 8, cellPadding: 1 },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: PAGE.margin, right: PAGE.margin }
        });
    }
};

// --- ANA EXPORT FONKSİYONU ---
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr',
    options: any = {} // Ek seçenekler
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    // Varsayılan olarak Full Report
    await generateCorporateReport(doc, analysis, metadata, questions, students, chartImages);

    const fileName = `${safeFileName(metadata.className)}_Raporu.pdf`;
    doc.save(fileName);
};

// --- WRAPPERS (Arayüz Uyumluluğu İçin) ---

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

    if (scenario === 'student_focused') {
        await generateStudentCards(doc, analysis, metadata, questions, students);
        doc.save(`${safeFileName(metadata.className)}_Karneler.pdf`);
    } else if (scenario === 'outcome_analysis') {
        await generateOutcomeReport(doc, analysis, metadata);
        doc.save(`${safeFileName(metadata.className)}_Kazanim_Analizi.pdf`);
    } else {
        // Full Report
        await generateCorporateReport(doc, analysis, metadata, questions, students, chartImages);
        doc.save(`${safeFileName(metadata.className)}_Genel_Rapor.pdf`);
    }
};

export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    // Sadece TR şimdilik
    await quickExport('full_report', analysis, metadata, questions, students, chartImages, 'tr');
};

export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    await quickExport('student_focused', analysis, metadata, questions, students, {}, language);
};

export const getExportScenarios = (language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Genel Sınav Raporu', description: 'Tüm analizleri içeren detaylı rapor' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: 'Kazanım Analiz Raporu', description: 'Sadece kazanım başarı durumları' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Karneleri', description: 'Öğrencilere dağıtılacak sonuç belgeleri' }
    ];
};
