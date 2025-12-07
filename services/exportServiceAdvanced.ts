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
    let y = 20;

    // BAŞLIK
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(metadata.schoolName || 'OKUL ADI', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12);
    doc.text('SINAV ANALİZ RAPORU', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(10);
    doc.text(`${metadata.className} - ${metadata.subject} - ${metadata.examType}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ÖZET
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(10);
    const maxScore = Math.max(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const minScore = Math.min(...students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    doc.text(`Sınıf Ort: %${analysis.classAverage.toFixed(1)}  |  Öğrenci: ${students.length}  |  Max: ${maxScore}  |  Min: ${minScore}`, margin, y);
    y += 12;

    // SORU ANALİZİ TABLOSU
    doc.setFontSize(11);
    doc.text('SORU BAZLI ANALİZ', margin, y);
    y += 3;

    const questionRows = analysis.questionStats.map(q => {
        const qConfig = questions.find(x => x.id === q.questionId);
        return [
            String(q.questionId),
            q.outcome.description.length > 60 ? q.outcome.description.substring(0, 60) + '...' : q.outcome.description,
            String(qConfig?.maxScore || 0),
            q.averageScore.toFixed(1),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [['Soru', 'Kazanım', 'Max', 'Ort', 'Başarı']],
        body: questionRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [66, 133, 244], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 105 },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' }
        },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    if (y > 200) { doc.addPage(); y = 20; }

    // KAZANIM DURUMU TABLOSU
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(11);
    doc.text('KAZANIM BAŞARI DURUMU', margin, y);
    y += 3;

    const outcomeRows = analysis.outcomeStats.map(o => [
        o.code,
        o.description.length > 55 ? o.description.substring(0, 55) + '...' : o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Kod', 'Açıklama', 'Başarı', 'Durum']],
        body: outcomeRows,
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [52, 168, 83], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 100 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 25, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === 'GELİŞTİRİLMELİ') {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: margin, right: margin }
    });

    // ÖĞRENCİ LİSTESİ - YENİ SAYFA
    doc.addPage();
    y = 20;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.text('ÖĞRENCİ SONUÇ LİSTESİ', pageWidth / 2, y, { align: 'center' });
    y += 10;

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
        theme: 'grid',
        styles: { font: 'Roboto', fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [103, 58, 183], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 80 },
            3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                if (data.cell.raw === 'KALDI') {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fontStyle = 'bold';
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

        let y = 20;

        // BAŞLIK
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(14);
        doc.text(metadata.schoolName || 'OKUL ADI', pageWidth / 2, y, { align: 'center' });
        y += 7;

        doc.setFontSize(11);
        doc.text('SINAV SONUÇ BELGESİ', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // ÖĞRENCİ BİLGİSİ
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, pageWidth - margin * 2, 20, 'F');
        doc.setDrawColor(200);
        doc.rect(margin, y, pageWidth - margin * 2, 20, 'S');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(student.name, margin + 5, y + 8);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(10);
        doc.text(`No: ${student.student_number || '-'}  |  Sınıf: ${metadata.className}  |  Ders: ${metadata.subject}`, margin + 5, y + 15);

        // PUAN
        const total = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const pct = (total / maxTotal) * 100;

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(pct >= 50 ? 40 : 220, pct >= 50 ? 167 : 53, pct >= 50 ? 69 : 69);
        doc.text(`${total} / ${maxTotal}`, pageWidth - margin - 5, y + 12, { align: 'right' });

        y += 28;

        // SORU DETAYLARI
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text('SORU BAZLI PERFORMANS', margin, y);
        y += 3;

        const questionRows = analysis.questionStats.map((q, idx) => {
            const qScore = student.scores[q.questionId] || 0;
            const qMax = questions.find(x => x.id === q.questionId)?.maxScore || 0;
            return [String(idx + 1), q.outcome.description.length > 50 ? q.outcome.description.substring(0, 50) + '...' : q.outcome.description, `${qScore} / ${qMax}`];
        });

        autoTable(doc, {
            startY: y,
            head: [['Soru', 'Konu', 'Puan']],
            body: questionRows,
            theme: 'grid',
            styles: { font: 'Roboto', fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
            headStyles: { fillColor: [0, 150, 136], textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 12, halign: 'center' },
                1: { cellWidth: 130 },
                2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
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
