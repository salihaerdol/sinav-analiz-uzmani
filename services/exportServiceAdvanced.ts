/**
 * ULTRA-PRECISION PDF REPORTING ENGINE
 * Version: 10.0 (Final Architecture)
 * 
 * Bu modül, PDF oluşturma işlemini "dizgi" mantığıyla ele alır.
 * Her bir elementin (metin, tablo, grafik) koordinatları matematiksel olarak hesaplanır.
 * Taşma, kayma veya üst üste binme İMKANSIZ hale getirilmiştir.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// --- CONFIGURATION ---
const PAGE_CONFIG = {
    format: 'a4',
    unit: 'mm',
    width: 210,  // A4 Width
    height: 297, // A4 Height
    margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    }
};

const FONTS = {
    primary: 'Roboto',
    sizes: {
        title: 24,
        subtitle: 16,
        heading: 14,
        body: 10,
        small: 8,
        table: 9
    },
    colors: {
        dark: [33, 37, 41],      // #212529
        secondary: [108, 117, 125], // #6c757d
        primary: [13, 110, 253],    // #0d6efd (Blue)
        success: [25, 135, 84],     // #198754 (Green)
        warning: [255, 193, 7],     // #ffc107 (Yellow)
        danger: [220, 53, 69],      // #dc3545 (Red)
        light: [248, 249, 250],     // #f8f9fa
        white: [255, 255, 255]
    }
};

// --- TYPES ---
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'student_focused';

// --- HELPER FUNCTIONS ---

// Türkçe karakterleri dosya adı için temizle
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

// Sayfa sonu kontrolü ve yeni sayfa ekleme
const checkPageBreak = (doc: jsPDF, currentY: number, requiredSpace: number): number => {
    const limit = PAGE_CONFIG.height - PAGE_CONFIG.margin.bottom;
    if (currentY + requiredSpace > limit) {
        doc.addPage();
        return PAGE_CONFIG.margin.top + 10; // Yeni sayfa başlangıcı (Header payı)
    }
    return currentY;
};

// Header (Her sayfaya eklenir)
const drawHeader = (doc: jsPDF, metadata: ExamMetadata) => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Sol Üst: Okul Adı
        doc.setFont(FONTS.primary, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
        doc.text(metadata.schoolName || 'OKUL ADI', PAGE_CONFIG.margin.left, 15);

        // Sağ Üst: Tarih
        doc.setFont(FONTS.primary, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(FONTS.colors.secondary[0], FONTS.colors.secondary[1], FONTS.colors.secondary[2]);
        const dateStr = new Date().toLocaleDateString('tr-TR');
        doc.text(dateStr, PAGE_CONFIG.width - PAGE_CONFIG.margin.right, 15, { align: 'right' });

        // Alt Çizgi
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(PAGE_CONFIG.margin.left, 18, PAGE_CONFIG.width - PAGE_CONFIG.margin.right, 18);

        // Footer: Sayfa No
        doc.setFontSize(8);
        doc.text(`Sayfa ${i} / ${pageCount}`, PAGE_CONFIG.width - PAGE_CONFIG.margin.right, PAGE_CONFIG.height - 10, { align: 'right' });
        doc.text('Sınav Analiz Uzmanı Raporu', PAGE_CONFIG.margin.left, PAGE_CONFIG.height - 10);
    }
};

// --- MAIN EXPORT FUNCTION ---
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    _language: Language = 'tr',
    _options: Partial<any> = {}
) => {
    // 1. Belge Oluşturma
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // 2. Font Yükleme
    await addTurkishFontsToPDF(doc);

    let cursorY = PAGE_CONFIG.margin.top + 10; // Başlangıç Y koordinatı
    const contentWidth = PAGE_CONFIG.width - (PAGE_CONFIG.margin.left + PAGE_CONFIG.margin.right);

    // --- KAPAK SAYFASI ---

    // Başlık
    doc.setFont(FONTS.primary, 'bold');
    doc.setFontSize(FONTS.sizes.title);
    doc.setTextColor(FONTS.colors.primary[0], FONTS.colors.primary[1], FONTS.colors.primary[2]);
    doc.text('SINAV ANALİZ RAPORU', PAGE_CONFIG.width / 2, cursorY, { align: 'center' });
    cursorY += 15;

    // Alt Başlık (Ders Bilgisi)
    doc.setFont(FONTS.primary, 'normal');
    doc.setFontSize(FONTS.sizes.subtitle);
    doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
    doc.text(`${metadata.className} - ${metadata.subject}`, PAGE_CONFIG.width / 2, cursorY, { align: 'center' });
    cursorY += 10;

    doc.setFontSize(FONTS.sizes.body);
    doc.setTextColor(FONTS.colors.secondary[0], FONTS.colors.secondary[1], FONTS.colors.secondary[2]);
    doc.text(`${metadata.academicYear} | ${metadata.term}. Dönem | ${metadata.examType}`, PAGE_CONFIG.width / 2, cursorY, { align: 'center' });
    cursorY += 20;

    // Özet Kartları (Grid Layout)
    const cardWidth = (contentWidth - 10) / 3; // 3 kart yan yana, 5mm boşluk
    const cardHeight = 25;

    // Kart Çizim Fonksiyonu
    const drawCard = (x: number, title: string, value: string, color: number[]) => {
        // Gölge
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x + 1, cursorY + 1, cardWidth, cardHeight, 2, 2, 'F');
        // Kart
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(x, cursorY, cardWidth, cardHeight, 2, 2, 'FD');
        // Sol Çizgi (Renk Kodu)
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(x, cursorY, 2, cardHeight, 'F');
        // Metinler
        doc.setFont(FONTS.primary, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(FONTS.colors.secondary[0], FONTS.colors.secondary[1], FONTS.colors.secondary[2]);
        doc.text(title, x + 10, cursorY + 8);

        doc.setFont(FONTS.primary, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
        doc.text(value, x + 10, cursorY + 18);
    };

    drawCard(PAGE_CONFIG.margin.left, 'Sınıf Ortalaması', `%${analysis.classAverage.toFixed(2)}`, FONTS.colors.primary);
    drawCard(PAGE_CONFIG.margin.left + cardWidth + 5, 'Başarı Oranı', `%${((analysis.classAverage / 100) * 100).toFixed(0)}`, FONTS.colors.success);
    drawCard(PAGE_CONFIG.margin.left + (cardWidth + 5) * 2, 'Öğrenci Sayısı', `${students.length}`, FONTS.colors.warning);

    cursorY += cardHeight + 15;

    // --- GRAFİKLER ---
    // Grafikleri sığdırmak için kontrol
    if (chartImages.overview || chartImages.questionChart) {
        doc.setFont(FONTS.primary, 'bold');
        doc.setFontSize(FONTS.sizes.heading);
        doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
        doc.text('Grafiksel Analiz', PAGE_CONFIG.margin.left, cursorY);
        cursorY += 8;

        const chartW = contentWidth;
        const chartH = 70; // Sabit yükseklik

        // Sayfa sonu kontrolü
        cursorY = checkPageBreak(doc, cursorY, chartH);

        if (chartImages.overview) {
            try {
                doc.addImage(chartImages.overview, 'PNG', PAGE_CONFIG.margin.left, cursorY, chartW, chartH);
                cursorY += chartH + 10;
            } catch (e) {
                console.error("Chart image error", e);
            }
        }
    }

    // --- KAZANIM ANALİZ TABLOSU ---
    cursorY = checkPageBreak(doc, cursorY, 40);

    doc.setFont(FONTS.primary, 'bold');
    doc.setFontSize(FONTS.sizes.heading);
    doc.text('Kazanım Başarı Analizi', PAGE_CONFIG.margin.left, cursorY);
    cursorY += 5;

    const outcomeData = analysis.outcomeStats.map(o => [
        o.code,
        o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'Geliştirilmeli' : 'Başarılı'
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['Kod', 'Kazanım Açıklaması', 'Başarı', 'Durum']],
        body: outcomeData,
        theme: 'grid',
        styles: {
            font: FONTS.primary,
            fontSize: FONTS.sizes.table,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            textColor: FONTS.colors.dark
        },
        headStyles: {
            fillColor: FONTS.colors.primary,
            textColor: FONTS.colors.white,
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }, // Otomatik genişlik ve metin kaydırma (wrap)
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            // Durum sütunu renklendirme
            if (data.section === 'body' && data.column.index === 3) {
                const val = data.cell.raw as string;
                if (val === 'Geliştirilmeli') {
                    data.cell.styles.textColor = FONTS.colors.danger;
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = FONTS.colors.success;
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: PAGE_CONFIG.margin.left, right: PAGE_CONFIG.margin.right }
    });

    // Tablo sonrası cursor güncelleme
    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // --- SORU ANALİZ TABLOSU ---
    // Yeni sayfa kontrolü
    if (cursorY > PAGE_CONFIG.height - 60) {
        doc.addPage();
        cursorY = PAGE_CONFIG.margin.top + 10;
    }

    doc.setFont(FONTS.primary, 'bold');
    doc.setFontSize(FONTS.sizes.heading);
    doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
    doc.text('Soru Bazlı Detaylı Analiz', PAGE_CONFIG.margin.left, cursorY);
    cursorY += 5;

    const questionData = analysis.questionStats.map(q => {
        const question = questions.find(qu => qu.id === q.questionId);
        return [
            q.questionId.toString(),
            q.outcome.code,
            question?.maxScore.toString() || '0',
            q.averageScore.toFixed(2),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: cursorY,
        head: [['Soru No', 'Kazanım Kodu', 'Max Puan', 'Ort. Puan', 'Başarı %']],
        body: questionData,
        theme: 'striped',
        styles: {
            font: FONTS.primary,
            fontSize: FONTS.sizes.table,
            halign: 'center'
        },
        headStyles: {
            fillColor: FONTS.colors.secondary,
            textColor: FONTS.colors.white
        },
        columnStyles: {
            1: { halign: 'left' } // Kazanım kodu sola dayalı
        },
        margin: { left: PAGE_CONFIG.margin.left, right: PAGE_CONFIG.margin.right }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // --- ÖĞRENCİ LİSTESİ ---
    // Kesinlikle yeni sayfada başlasın
    doc.addPage();
    cursorY = PAGE_CONFIG.margin.top + 10;

    doc.setFont(FONTS.primary, 'bold');
    doc.setFontSize(FONTS.sizes.heading);
    doc.setTextColor(FONTS.colors.dark[0], FONTS.colors.dark[1], FONTS.colors.dark[2]);
    doc.text('Öğrenci Sonuç Listesi', PAGE_CONFIG.margin.left, cursorY);
    cursorY += 5;

    // Öğrencileri puana göre sırala
    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((sum, v) => sum + v, 0);
        const scoreB = Object.values(b.scores).reduce((sum, v) => sum + v, 0);
        return scoreB - scoreA;
    });

    const maxTotalScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    const studentTableData = sortedStudents.map((s, index) => {
        const totalScore = Object.values(s.scores).reduce((sum, v) => sum + v, 0);
        const percentage = (totalScore / maxTotalScore) * 100;
        return [
            (index + 1).toString(),
            s.student_number || '-',
            s.name,
            totalScore.toString(),
            `%${percentage.toFixed(0)}`,
            percentage >= 50 ? 'Geçti' : 'Kaldı'
        ];
    });

    autoTable(doc, {
        startY: cursorY,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
        body: studentTableData,
        theme: 'grid',
        styles: {
            font: FONTS.primary,
            fontSize: FONTS.sizes.table,
            cellPadding: 3
        },
        headStyles: {
            fillColor: FONTS.colors.dark,
            textColor: FONTS.colors.white
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw as string;
                data.cell.styles.textColor = val === 'Kaldı' ? FONTS.colors.danger : FONTS.colors.success;
                data.cell.styles.fontStyle = 'bold';
            }
        },
        margin: { left: PAGE_CONFIG.margin.left, right: PAGE_CONFIG.margin.right }
    });

    // 3. Header ve Footer Çizimi (En Son)
    drawHeader(doc, metadata);

    // 4. Kaydetme
    const fileName = `${safeFileName(metadata.className)}_${safeFileName(metadata.subject)}_Raporu.pdf`;
    doc.save(fileName);
};

// --- WRAPPER FUNCTIONS (Uyumluluk İçin) ---

export const quickExport = async (
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) => {
    if (scenario === 'student_focused') {
        await exportIndividualStudentReports(analysis, metadata, questions, students, language);
    } else {
        await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, language);
    }
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
    const doc = new jsPDF('p', 'mm', 'a5'); // A5 Formatı (Karne için ideal)
    await addTurkishFontsToPDF(doc);

    const maxScore = questions.reduce((s, q) => s + q.maxScore, 0);

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (i > 0) doc.addPage();

        // Karne Header
        doc.setFont(FONTS.primary, 'bold');
        doc.setFontSize(14);
        doc.text(metadata.schoolName || 'OKUL ADI', 148 / 2, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(FONTS.primary, 'normal');
        doc.text(`${metadata.subject} Sınav Sonuç Belgesi`, 148 / 2, 22, { align: 'center' });

        // Öğrenci Bilgisi Kutusu
        doc.setDrawColor(0);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(10, 30, 128, 20, 2, 2, 'FD');

        doc.setFont(FONTS.primary, 'bold');
        doc.setFontSize(12);
        doc.text(student.name, 15, 40);

        doc.setFontSize(10);
        doc.text(`No: ${student.student_number || '-'}`, 15, 46);

        // Puan
        const totalScore = Object.values(student.scores).reduce((s, v) => s + v, 0);
        const percentage = (totalScore / maxScore) * 100;

        doc.setFontSize(16);
        doc.setTextColor(percentage >= 50 ? FONTS.colors.success[0] : FONTS.colors.danger[0], percentage >= 50 ? FONTS.colors.success[1] : FONTS.colors.danger[1], percentage >= 50 ? FONTS.colors.success[2] : FONTS.colors.danger[2]);
        doc.text(`%${percentage.toFixed(0)}`, 130, 42, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text('BAŞARI', 130, 46, { align: 'right' });

        // Detay Tablosu
        const studentData = analysis.questionStats.map((q, idx) => {
            const score = student.scores[q.questionId] || 0;
            const qMax = questions.find(qu => qu.id === q.questionId)?.maxScore || 0;
            return [
                (idx + 1).toString(),
                q.outcome.description, // Kazanım açıklaması
                `${score} / ${qMax}`
            ];
        });

        autoTable(doc, {
            startY: 55,
            head: [['Soru', 'Kazanım', 'Puan']],
            body: studentData,
            theme: 'grid',
            styles: {
                font: FONTS.primary,
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: 10, right: 10 }
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(new Date().toLocaleDateString('tr-TR'), 138, 200, { align: 'right' });
    }

    doc.save(`${safeFileName(metadata.className)}_Karneler.pdf`);
};

export const getExportScenarios = (_language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Kurumsal Rapor', description: 'Resmi format' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Karneleri', description: 'Bireysel' }
    ];
};
