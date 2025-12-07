/**
 * CLEAN & ROBUST PDF EXPORT SERVICE
 * User Request: "Make it look exactly like the website, simple and clean."
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { addTurkishFontsToPDF } from './fontService';

// --- TYPES ---
export type Language = 'tr' | 'en';
export type ExportScenario = 'full_report' | 'student_focused';

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

// --- MAIN EXPORT FUNCTION ---
export const exportToPDFAdvanced = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    _language: Language = 'tr'
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    await addTurkishFontsToPDF(doc);

    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let cursorY = 20;

    // --- HEADER ---
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    doc.text(metadata.schoolName || 'OKUL ADI', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 8;

    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    doc.text(`${metadata.academicYear} - ${metadata.term}. Dönem ${metadata.examType} Analiz Raporu`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 7;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${metadata.className} - ${metadata.subject}`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 15;

    // --- ÖZET KARTLARI (Basit Metin Olarak) ---
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('Roboto', 'bold');
    
    const summaryText = `Sınıf Ortalaması: %${analysis.classAverage.toFixed(2)}   |   Öğrenci Sayısı: ${students.length}   |   Başarı Oranı: %${((analysis.classAverage / 100) * 100).toFixed(0)}`;
    doc.text(summaryText, pageWidth / 2, cursorY, { align: 'center' });
    
    // Altına çizgi çek
    cursorY += 3;
    doc.setDrawColor(200);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 10;

    // --- GRAFİKLER ---
    // Grafikleri ekrandaki gibi yan yana veya alt alta koyalım
    if (chartImages.overview) {
        try {
            const imgHeight = 60;
            doc.addImage(chartImages.overview, 'PNG', margin, cursorY, pageWidth - (margin * 2), imgHeight);
            cursorY += imgHeight + 10;
        } catch (e) {
            console.error("Chart error:", e);
        }
    }

    // --- 1. SORU BAZLI ANALİZ TABLOSU ---
    // Ekrandaki tablonun aynısı
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('1. Soru Bazlı Analiz', margin, cursorY);
    cursorY += 5;

    const questionData = analysis.questionStats.map(q => {
        const question = questions.find(qu => qu.id === q.questionId);
        return [
            q.questionId.toString(),
            q.outcome.description, // Kazanım açıklaması (Uzun metin)
            question?.maxScore.toString() || '0',
            q.averageScore.toFixed(2),
            `%${q.successRate.toFixed(0)}`
        ];
    });

    autoTable(doc, {
        startY: cursorY,
        head: [['Soru', 'İlgili Kazanım', 'Maks Puan', 'Ort. Puan', 'Başarı %']],
        body: questionData,
        theme: 'grid', // En temiz, Excel benzeri görünüm
        styles: {
            font: 'Roboto',
            fontSize: 9,
            textColor: [50, 50, 50],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            cellPadding: 3,
            overflow: 'linebreak' // Metin kaydırma (Taşmayı önler)
        },
        headStyles: {
            fillColor: [245, 245, 245], // Açık gri başlık (Sade)
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' }, // Soru No
            1: { cellWidth: 'auto' }, // Kazanım (Esnek genişlik)
            2: { cellWidth: 20, halign: 'center' }, // Puan
            3: { cellWidth: 20, halign: 'center' }, // Ort
            4: { cellWidth: 20, halign: 'center' }  // Başarı
        },
        margin: { left: margin, right: margin }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // --- 2. KAZANIM BAŞARI DURUMU ---
    // Sayfa sonu kontrolü
    if (cursorY > 250) {
        doc.addPage();
        cursorY = 20;
    }

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(12);
    doc.text('2. Kazanım Başarı Durumu', margin, cursorY);
    cursorY += 5;

    const outcomeData = analysis.outcomeStats.map(o => [
        o.code,
        o.description,
        `%${o.successRate.toFixed(1)}`,
        o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI'
    ]);

    autoTable(doc, {
        startY: cursorY,
        head: [['Kod', 'Kazanım Açıklaması', 'Başarı Oranı', 'Durum']],
        body: outcomeData,
        theme: 'grid',
        styles: {
            font: 'Roboto',
            fontSize: 9,
            textColor: [50, 50, 50],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 25, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = data.cell.raw as string;
                data.cell.styles.textColor = val === 'GELİŞTİRİLMELİ' ? [220, 53, 69] : [25, 135, 84];
            }
        },
        margin: { left: margin, right: margin }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 15;

    // --- 3. ÖĞRENCİ LİSTESİ ---
    doc.addPage();
    cursorY = 20;

    doc.setFont('Roboto', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Öğrenci Sonuç Listesi', margin, cursorY);
    cursorY += 5;

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
            font: 'Roboto',
            fontSize: 9,
            textColor: [50, 50, 50],
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
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
                data.cell.styles.textColor = val === 'Kaldı' ? [220, 53, 69] : [25, 135, 84];
            }
        },
        margin: { left: margin, right: margin }
    });

    const fileName = `${safeFileName(metadata.className)}_${safeFileName(metadata.subject)}_Raporu.pdf`;
    doc.save(fileName);
};

// --- WRAPPERS ---
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
    const doc = new jsPDF('p', 'mm', 'a5');
    await addTurkishFontsToPDF(doc);

    const maxScore = questions.reduce((s, q) => s + q.maxScore, 0);

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        if (i > 0) doc.addPage();

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(14);
        doc.text(metadata.schoolName || 'OKUL ADI', 148 / 2, 15, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('Roboto', 'normal');
        doc.text(`${metadata.subject} Sınav Sonuç Belgesi`, 148 / 2, 22, { align: 'center' });

        doc.setDrawColor(0);
        doc.setFillColor(250, 250, 250);
        doc.rect(10, 30, 128, 20, 'F');
        doc.rect(10, 30, 128, 20, 'S');

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.text(student.name, 15, 40);
        doc.setFontSize(10);
        doc.text(`No: ${student.student_number || '-'}`, 15, 46);

        const totalScore = Object.values(student.scores).reduce((s, v) => s + v, 0);
        const percentage = (totalScore / maxScore) * 100;

        doc.setFontSize(16);
        doc.text(`%${percentage.toFixed(0)}`, 130, 42, { align: 'right' });

        const studentData = analysis.questionStats.map((q, idx) => {
            const score = student.scores[q.questionId] || 0;
            const qMax = questions.find(qu => qu.id === q.questionId)?.maxScore || 0;
            return [
                (idx + 1).toString(),
                q.outcome.description,
                `${score} / ${qMax}`
            ];
        });

        autoTable(doc, {
            startY: 55,
            head: [['Soru', 'Kazanım', 'Puan']],
            body: studentData,
            theme: 'grid',
            styles: {
                font: 'Roboto',
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 20, halign: 'center' }
            },
            margin: { left: 10, right: 10 }
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
