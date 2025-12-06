/**
 * PROFESSIONAL EXAM ANALYSIS REPORT
 * Version 9.0 - Layout & Flow Fixed
 * Features: Auto-pagination, Dynamic Flow, Update Support
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// --- TYPES ---
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'student_focused';

export interface ExportOptions {
    language: Language;
    scenario: ExportScenario;
}

// --- CONSTANTS ---
const THEME = {
    primary: [41, 50, 65] as [number, number, number],    // Dark Navy
    secondary: [238, 108, 77] as [number, number, number], // Burnt Orange
    accent: [61, 90, 128] as [number, number, number],     // Muted Blue
    light: [245, 247, 250] as [number, number, number],    // Off White
    text: [30, 30, 30] as [number, number, number],        // Dark Gray
    success: [46, 196, 182] as [number, number, number],   // Teal
    danger: [231, 29, 54] as [number, number, number]      // Red
};

// --- HELPER FUNCTIONS ---

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

const calculateStats = (students: Student[], questions: QuestionConfig[]) => {
    const maxPossible = questions.reduce((s, q) => s + q.maxScore, 0);
    const scores = students.map(s => Object.values(s.scores).reduce((a: number, b: number) => a + b, 0));
    const pcts = scores.map(s => (s / maxPossible) * 100);
    const successCount = pcts.filter(p => p >= 50).length;

    return {
        maxPossible,
        successCount,
        failCount: students.length - successCount,
        successRate: students.length > 0 ? (successCount / students.length) * 100 : 0
    };
};

/**
 * MAIN EXPORT FUNCTION
 */
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    _language: Language = 'tr',
    _options: Partial<ExportOptions> = {}
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const m = 15; // Margin

    let currentY = m;

    // --- HEADER FUNCTION (Repeats on every page) ---
    const addHeader = (pageNum: number) => {
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
        doc.text(metadata.schoolName || 'OKUL ADI', m, 12);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${metadata.academicYear} | ${metadata.subject} | ${metadata.className}`, m, 17);

        doc.text(new Date().toLocaleDateString('tr-TR'), pw - m, 12, { align: 'right' });

        // Line
        doc.setDrawColor(220, 220, 220);
        doc.line(m, 20, pw - m, 20);
    };

    // --- FOOTER FUNCTION ---
    const addFooter = (pageNum: number, totalPages: number) => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Sayfa ${pageNum} / ${totalPages}`, pw - m, ph - 10, { align: 'right' });
        doc.text('Sınav Analiz Uzmanı', m, ph - 10);
    };

    // Initialize Page 1
    addHeader(1);
    currentY = 30;

    // --- TITLE SECTION ---
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('SINAV ANALİZ RAPORU', pw / 2, currentY, { align: 'center' });
    currentY += 15;

    // --- SUMMARY CARDS ---
    const stats = calculateStats(students, questions);
    const cardW = (pw - 2 * m - 10) / 3;
    const cardH = 25;

    // Card 1: Average
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m, currentY, cardW, cardH, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Sınıf Ortalaması', m + cardW / 2, currentY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text(`%${analysis.classAverage.toFixed(1)}`, m + cardW / 2, currentY + 18, { align: 'center' });

    // Card 2: Success
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m + cardW + 5, currentY, cardW, cardH, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Başarı Oranı', m + cardW + 5 + cardW / 2, currentY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(THEME.success[0], THEME.success[1], THEME.success[2]);
    doc.text(`%${stats.successRate.toFixed(0)}`, m + cardW + 5 + cardW / 2, currentY + 18, { align: 'center' });

    // Card 3: Participation
    doc.setFillColor(THEME.light[0], THEME.light[1], THEME.light[2]);
    doc.roundedRect(m + (cardW + 5) * 2, currentY, cardW, cardH, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Katılım', m + (cardW + 5) * 2 + cardW / 2, currentY + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(THEME.secondary[0], THEME.secondary[1], THEME.secondary[2]);
    doc.text(`${students.length} Öğrenci`, m + (cardW + 5) * 2 + cardW / 2, currentY + 18, { align: 'center' });

    currentY += cardH + 15;

    // --- CHARTS (If available) ---
    // We check space before adding charts
    if (chartImages.gradePieChart || chartImages.questionSuccessChart) {
        doc.setFontSize(12);
        doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
        doc.text('Grafiksel Analiz', m, currentY);
        currentY += 5;

        const chartH = 50;
        const chartW = (pw - 2 * m - 10) / 2;

        if (chartImages.gradePieChart) {
            try { doc.addImage(chartImages.gradePieChart, 'PNG', m, currentY, chartW, chartH); } catch (e) { }
        }
        if (chartImages.questionSuccessChart) {
            try { doc.addImage(chartImages.questionSuccessChart, 'PNG', m + chartW + 10, currentY, chartW, chartH); } catch (e) { }
        }
        currentY += chartH + 10;
    }

    // --- QUESTION ANALYSIS TABLE ---
    doc.setFontSize(12);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('Soru ve Kazanım Analizi', m, currentY);
    currentY += 5;

    const qTableBody = analysis.questionStats.map((q, i) => {
        const question = questions.find(qu => qu.id === q.questionId);
        return [
            (i + 1).toString(),
            q.outcome.code || '-',
            q.outcome.description || '',
            question?.maxScore.toString() || '0',
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['No', 'Kod', 'Kazanım', 'Puan', 'Başarı']],
        body: qTableBody,
        theme: 'grid',
        styles: {
            font: 'Roboto',
            fontSize: 9,
            cellPadding: 3,
            textColor: THEME.text
        },
        headStyles: {
            fillColor: THEME.primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: m, right: m },
        didDrawPage: (data) => {
            addHeader(doc.getNumberOfPages());
            addFooter(doc.getNumberOfPages(), 0); // Total pages will be fixed at save
        }
    });

    // Update currentY to after the table
    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- STUDENT LIST TABLE ---
    // Check if we need a new page
    if (currentY > ph - 50) {
        doc.addPage();
        currentY = 30;
    }

    doc.setFontSize(12);
    doc.setTextColor(THEME.primary[0], THEME.primary[1], THEME.primary[2]);
    doc.text('Öğrenci Sonuç Listesi', m, currentY);
    currentY += 5;

    const sortedStudents = [...students].sort((a, b) => {
        const sa = Object.values(a.scores).reduce((sum, v) => sum + v, 0);
        const sb = Object.values(b.scores).reduce((sum, v) => sum + v, 0);
        return sb - sa;
    });

    const sTableBody = sortedStudents.map((s, i) => {
        const total = Object.values(s.scores).reduce((sum, v) => sum + v, 0);
        const pct = (total / stats.maxPossible) * 100;
        return [
            (i + 1).toString(),
            s.student_number || '-',
            s.name,
            total.toString(),
            `%${pct.toFixed(0)}`,
            pct >= 50 ? 'Geçti' : 'Kaldı'
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Sıra', 'No', 'Ad Soyad', 'Puan', 'Yüzde', 'Durum']],
        body: sTableBody,
        theme: 'striped',
        styles: {
            font: 'Roboto',
            fontSize: 10,
            cellPadding: 3,
            textColor: THEME.text
        },
        headStyles: {
            fillColor: THEME.accent,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
        },
        margin: { left: m, right: m },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw;
                data.cell.styles.textColor = val === 'Kaldı' ? THEME.danger : THEME.success;
                data.cell.styles.fontStyle = 'bold';
            }
        },
        didDrawPage: (data) => {
            // Header is added automatically by the previous table hook if on same page, 
            // but if new page started by this table, we need to ensure header is there.
            // jspdf-autotable handles this via didDrawPage hook per table.
            // We just need to make sure we don't double draw.
            // Actually, simpler to just draw header on every page at the end.
        }
    });

    // Fix Total Pages Number
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        // Redraw footer with correct total pages
        doc.setFillColor(255, 255, 255);
        doc.rect(pw - m - 20, ph - 12, 20, 5, 'F'); // Clear previous page num
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Sayfa ${i} / ${totalPages}`, pw - m, ph - 10, { align: 'right' });
    }

    const fileName = `${safeFileName(metadata.className)}_${safeFileName(metadata.subject)}_Rapor.pdf`;
    doc.save(fileName);
};

// --- EXPORT WRAPPERS ---
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
    const doc = new jsPDF('p', 'mm', 'a5');
    await addTurkishFontsToPDF(doc);
    const pw = doc.internal.pageSize.getWidth();
    const m = 10;
    const maxP = questions.reduce((s, q) => s + q.maxScore, 0);

    for (const student of students) {
        doc.addPage();
        if (doc.getNumberOfPages() > 1 && student === students[0]) doc.deletePage(1);

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(14);
        doc.text(metadata.schoolName, pw / 2, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.text(`${metadata.subject} Sonuç Belgesi`, pw / 2, 22, { align: 'center' });

        doc.setFillColor(250, 250, 250);
        doc.roundedRect(m, 30, pw - 2 * m, 20, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setFont('Roboto', 'bold');
        doc.text(student.name, m + 5, 42);

        const total = Object.values(student.scores).reduce((s, v) => s + v, 0);
        const pct = (total / maxP) * 100;

        doc.text(`%${pct.toFixed(0)}`, pw - m - 10, 42, { align: 'right' });

        const qData = analysis.questionStats.map((q, i) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [(i + 1).toString(), q.outcome.code, `${score} / ${maxQ}`];
        });

        autoTable(doc, {
            startY: 55,
            head: [['Soru', 'Kazanım', 'Puan']],
            body: qData,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 8 },
            headStyles: { fillColor: THEME.primary },
            margin: { left: m, right: m }
        });
    }
    doc.save(`${safeFileName(metadata.className)}_Karneler.pdf`);
};

export const getExportScenarios = (_language: Language = 'tr') => {
    return [
        { id: 'full_report' as ExportScenario, icon: '📊', name: 'Kurumsal Rapor', description: 'Resmi format' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: 'Öğrenci Karneleri', description: 'Bireysel' }
    ];
};
