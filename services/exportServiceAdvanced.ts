/**
 * Advanced Export Service with Bilingual Support (Turkish & English)
 * World-class educational reporting system
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

// Language support
type Language = 'tr' | 'en';

const translations = {
    tr: {
        reportTitle: 'SINAV SONUÇ ANALİZ RAPORU',
        examAnalysisReport: 'Sınav Analiz Raporu',
        school: 'Okul',
        teacher: 'Öğretmen',
        class: 'Sınıf',
        subject: 'Ders',
        date: 'Tarih',
        term: 'Dönem',
        examNumber: 'Sınav No',
        examType: 'Sınav Türü',
        academicYear: 'Akademik Yıl',
        classAverage: 'Sınıf Ortalaması',
        totalStudents: 'Öğrenci Sayısı',
        totalQuestions: 'Soru Sayısı',
        visualAnalysis: 'Görsel Analiz',
        questionAnalysis: 'Soru Bazlı Detaylı Analiz',
        outcomeAnalysis: 'Kazanım Bazlı Analiz',
        studentPerformance: 'Öğrenci Performans Tablosu',
        recommendations: 'ÖNERİLER VE DEĞERLENDİRME',
        questionNo: 'Soru',
        outcomeCode: 'Kazanım Kodu',
        outcomeDesc: 'Kazanım Tanımı',
        avgScore: 'Ort. Puan',
        successRate: 'Başarı %',
        status: 'Durum',
        successful: 'BAŞARILI',
        failed: 'BAŞARISIZ',
        studentName: 'Öğrenci Adı',
        totalScore: 'Toplam Puan',
        percentage: 'Yüzde',
        weakAreas: 'Güçlendirilmesi Gereken Kazanımlar',
        strongAreas: 'Başarılı Olunan Kazanımlar',
        generalEvaluation: 'Genel Değerlendirme',
        suggestions: 'Öneriler',
        mebReference: 'MEB Referansı',
        preparedBy: 'Raporu Hazırlayan',
        reportDate: 'Rapor Tarihi',
        signature: 'İmza',
        detailedStatistics: 'Detaylı İstatistikler',
        stdDev: 'Standart Sapma',
        median: 'Medyan (Ortanca)',
        maxScore: 'En Yüksek Puan',
        minScore: 'En Düşük Puan',
        scoreDistribution: 'Puan Dağılımı'
    },
    en: {
        reportTitle: 'EXAM ANALYSIS REPORT',
        examAnalysisReport: 'Exam Analysis Report',
        school: 'School',
        teacher: 'Teacher',
        class: 'Class',
        subject: 'Subject',
        date: 'Date',
        term: 'Term',
        examNumber: 'Exam No',
        examType: 'Exam Type',
        academicYear: 'Academic Year',
        classAverage: 'Class Average',
        totalStudents: 'Total Students',
        totalQuestions: 'Total Questions',
        visualAnalysis: 'Visual Analysis',
        questionAnalysis: 'Detailed Question Analysis',
        outcomeAnalysis: 'Learning Outcome Analysis',
        studentPerformance: 'Student Performance Table',
        recommendations: 'RECOMMENDATIONS AND EVALUATION',
        questionNo: 'Question',
        outcomeCode: 'Outcome Code',
        outcomeDesc: 'Learning Outcome',
        avgScore: 'Avg. Score',
        successRate: 'Success %',
        status: 'Status',
        successful: 'SUCCESSFUL',
        failed: 'NEEDS IMPROVEMENT',
        studentName: 'Student Name',
        totalScore: 'Total Score',
        percentage: 'Percentage',
        weakAreas: 'Areas Needing Improvement',
        strongAreas: 'Strong Areas',
        generalEvaluation: 'General Evaluation',
        suggestions: 'Suggestions',
        mebReference: 'MEB Reference',
        preparedBy: 'Prepared By',
        reportDate: 'Report Date',
        signature: 'Signature',
        detailedStatistics: 'Detailed Statistics',
        stdDev: 'Standard Deviation',
        median: 'Median',
        maxScore: 'Highest Score',
        minScore: 'Lowest Score',
        scoreDistribution: 'Score Distribution'
    }
};

// Helper functions for stats
const calculateStandardDeviation = (scores: number[]) => {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
};

const calculateMedian = (scores: number[]) => {
    if (scores.length === 0) return 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Generate AI-powered recommendations based on analysis
 */
function generateRecommendations(
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    lang: Language = 'tr'
): {
    weakAreas: string[];
    strongAreas: string[];
    generalEvaluation: string;
    suggestions: string[];
} {
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];
    const suggestions: string[] = [];

    // Analyze weak areas (< 50%)
    analysis.outcomeStats.forEach(outcome => {
        if (outcome.isFailed) {
            weakAreas.push(`${outcome.code}: ${outcome.description} (%${outcome.successRate.toFixed(1)})`);
        } else if (outcome.successRate >= 75) {
            strongAreas.push(`${outcome.code}: ${outcome.description} (%${outcome.successRate.toFixed(1)})`);
        }
    });

    // Generate suggestions based on class performance
    if (analysis.classAverage < 50) {
        suggestions.push(
            lang === 'tr'
                ? '🔴 Sınıf ortalaması düşük. Konuların tekrar edilmesi ve ek çalışma yapılması önerilir.'
                : '🔴 Class average is low. Review and additional practice are recommended.'
        );
    } else if (analysis.classAverage >= 75) {
        suggestions.push(
            lang === 'tr'
                ? '🟢 Sınıf başarısı yüksek. Öğrenciler üst düzey becerilere yönlendirilebilir.'
                : '🟢 Class performance is excellent. Students can be guided toward advanced skills.'
        );
    }

    // Weak outcome suggestions
    if (weakAreas.length > 0) {
        suggestions.push(
            lang === 'tr'
                ? `📊 ${weakAreas.length} kazanımda başarı düşük. Bu kazanımlar için ek etkinlikler planlanmalı.`
                : `📊 ${weakAreas.length} outcomes show low achievement. Additional activities should be planned.`
        );
    }

    // Student distribution analysis
    const lowPerformers = analysis.studentStats.filter(s => s.percentage < 50).length;
    const highPerformers = analysis.studentStats.filter(s => s.percentage >= 75).length;

    if (lowPerformers > analysis.studentStats.length / 3) {
        suggestions.push(
            lang === 'tr'
                ? `⚠️ ${lowPerformers} öğrenci düşük performans gösteriyor. Bireysel destek sağlanmalı.`
                : `⚠️ ${lowPerformers} students show low performance. Individual support should be provided.`
        );
    }

    if (highPerformers > analysis.studentStats.length / 2) {
        suggestions.push(
            lang === 'tr'
                ? `✅ Öğrencilerin çoğu yüksek başarı gösteriyor. Zenginleştirme etkinlikleri eklenebilir.`
                : `✅ Most students show high achievement. Enrichment activities can be added.`
        );
    }

    // General evaluation
    const generalEvaluation =
        lang === 'tr'
            ? `${metadata.className} sınıfının ${metadata.subject} dersi ${metadata.term}. Dönem ${metadata.examNumber}. ${metadata.examType} sınav analizi tamamlanmıştır. ` +
            `Sınıf ortalaması %${analysis.classAverage.toFixed(2)} olarak gerçekleşmiştir. ` +
            `${analysis.totalQuestions} sorudan ${weakAreas.length} kazanım başarısız, ${strongAreas.length} kazanım ise yüksek başarı göstermiştir. ` +
            `Bu rapor MEB'in ${metadata.academicYear} yılı ${metadata.term}. dönem müfredat kazanımları referans alınarak hazırlanmıştır.`
            : `Analysis of ${metadata.subject} ${metadata.term}${metadata.term === '1' ? 'st' : 'nd'} Term Exam ${metadata.examNumber} (${metadata.examType}) ` +
            `for class ${metadata.className} has been completed. Class average is ${analysis.classAverage.toFixed(2)}%. ` +
            `Out of ${analysis.totalQuestions} questions, ${weakAreas.length} outcomes need improvement and ${strongAreas.length} show high achievement. ` +
            `This report is based on MEB curriculum outcomes for academic year ${metadata.academicYear}, Term ${metadata.term}.`;

    return {
        weakAreas,
        strongAreas,
        generalEvaluation,
        suggestions
    };
}

/**
 * Advanced PDF Export with Bilingual Support and Graphics
 */
export const exportToPDFAdvanced = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: {
        overview?: string;
        questionChart?: string;
        outcomeChart?: string;
        studentChart?: string;
        histogramChart?: string;
    } = {},
    language: Language = 'tr'
) => {
    const t = translations[language];
    const doc = new jsPDF();
    const fontName = 'helvetica';

    // Helper function for page headers
    const addPageHeader = (pageTitle: string) => {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(pageTitle, 14, 10);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 12, 196, 12);
    };

    // --- COVER PAGE ---
    doc.setFont(fontName, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text(t.reportTitle, 105, 60, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const examTitle = `${metadata.schoolName}`;
    doc.text(examTitle, 105, 80, { align: 'center' });

    doc.setFontSize(14);
    const examDetails = `${metadata.term}. ${t.term} - ${metadata.subject} - ${metadata.examNumber}. ${metadata.examType}`;
    doc.text(examDetails, 105, 95, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t.class}: ${metadata.className}`, 105, 110, { align: 'center' });
    doc.text(`${t.academicYear}: ${metadata.academicYear}`, 105, 120, { align: 'center' });

    // MEB Reference Box
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.rect(40, 140, 130, 25);
    doc.setFontSize(9);
    doc.setTextColor(41, 128, 185);
    doc.text(t.mebReference, 45, 148);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const mebUrl = `MEB ${metadata.academicYear} - ${metadata.term}. Dönem Konu Soru Dağılım Tabloları`;
    doc.text(mebUrl, 45, 155);
    doc.text('Kaynak: odsgm.meb.gov.tr', 45, 161);

    // Footer
    doc.setFont(fontName, 'italic');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${t.preparedBy}: ${metadata.teacherName}`, 105, 260, { align: 'center' });
    doc.text(`${t.reportDate}: ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`, 105, 270, { align: 'center' });

    // --- PAGE 2: EXECUTIVE SUMMARY ---
    doc.addPage();
    addPageHeader(t.reportTitle);

    let currentY = 25;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text(t.generalEvaluation.toUpperCase(), 14, currentY);

    currentY += 10;

    // Executive Summary Box
    doc.setFillColor(245, 247, 250);
    doc.rect(14, currentY, 182, 60, 'F');

    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const leftCol = 20;
    const rightCol = 110;
    const lineH = 7;

    doc.text(`${t.school}:`, leftCol, currentY + 10);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.schoolName, leftCol + 30, currentY + 10);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.teacher}:`, leftCol, currentY + 10 + lineH);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.teacherName, leftCol + 30, currentY + 10 + lineH);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.class}:`, leftCol, currentY + 10 + lineH * 2);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.className, leftCol + 30, currentY + 10 + lineH * 2);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.subject}:`, leftCol, currentY + 10 + lineH * 3);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.subject, leftCol + 30, currentY + 10 + lineH * 3);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.examType}:`, leftCol, currentY + 10 + lineH * 4);
    doc.setFont(fontName, 'bold');
    doc.text(`${metadata.term}. Dönem ${metadata.examNumber}. ${metadata.examType}`, leftCol + 30, currentY + 10 + lineH * 4);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.date}:`, rightCol, currentY + 10);
    doc.setFont(fontName, 'bold');
    doc.text(metadata.date, rightCol + 20, currentY + 10);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.totalStudents}:`, rightCol, currentY + 10 + lineH);
    doc.setFont(fontName, 'bold');
    doc.text(students.length.toString(), rightCol + 30, currentY + 10 + lineH);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.totalQuestions}:`, rightCol, currentY + 10 + lineH * 2);
    doc.setFont(fontName, 'bold');
    doc.text(analysis.totalQuestions.toString(), rightCol + 30, currentY + 10 + lineH * 2);

    doc.setFont(fontName, 'normal');
    doc.text(`${t.classAverage}:`, rightCol, currentY + 10 + lineH * 3);
    doc.setFont(fontName, 'bold');

    if (analysis.classAverage >= 70) doc.setTextColor(40, 167, 69);
    else if (analysis.classAverage >= 50) doc.setTextColor(255, 193, 7);
    else doc.setTextColor(220, 53, 69);

    doc.text(`%${analysis.classAverage.toFixed(2)}`, rightCol + 30, currentY + 10 + lineH * 3);

    currentY += 75;

    // Visual Overview Chart
    if (chartImages.overview) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(t.visualAnalysis, 14, currentY);

        const imgProps = doc.getImageProperties(chartImages.overview);
        const maxWidth = 180;
        const imgHeight = (imgProps.height * maxWidth) / imgProps.width;

        if (currentY + imgHeight > 280) {
            doc.addPage();
            addPageHeader(t.visualAnalysis);
            currentY = 25;
        }

        doc.addImage(chartImages.overview, 'PNG', 15, currentY + 5, maxWidth, imgHeight);
        currentY += imgHeight + 15;
    }

    // --- PAGE 3: QUESTION ANALYSIS ---
    doc.addPage();
    addPageHeader(`${t.questionAnalysis} - ${metadata.className}`);
    currentY = 25;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(t.questionAnalysis, 14, currentY);

    currentY += 5;

    // Question Chart
    if (chartImages.questionChart) {
        const imgProps = doc.getImageProperties(chartImages.questionChart);
        const maxWidth = 180;
        const imgHeight = Math.min((imgProps.height * maxWidth) / imgProps.width, 80);
        doc.addImage(chartImages.questionChart, 'PNG', 15, currentY, maxWidth, imgHeight);
        currentY += imgHeight + 10;
    }

    // Question Table
    const questionRows = analysis.questionStats.map((q, idx) => [
        (idx + 1).toString(),
        q.outcome.code,
        q.outcome.description.substring(0, 50) + (q.outcome.description.length > 50 ? '...' : ''),
        q.averageScore.toFixed(1),
        `%${q.successRate.toFixed(1)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[t.questionNo, t.outcomeCode, t.outcomeDesc, t.avgScore, t.successRate]],
        body: questionRows,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 25 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 22, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const val = parseFloat(data.cell.raw.toString().replace('%', ''));
                if (val < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
                else data.cell.styles.textColor = [255, 193, 7];
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- PAGE 4: OUTCOME ANALYSIS ---
    doc.addPage();
    addPageHeader(`${t.outcomeAnalysis} - ${metadata.className}`);
    currentY = 25;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(t.outcomeAnalysis, 14, currentY);

    currentY += 5;

    // Outcome Chart
    if (chartImages.outcomeChart) {
        const imgProps = doc.getImageProperties(chartImages.outcomeChart);
        const maxWidth = 180;
        const imgHeight = Math.min((imgProps.height * maxWidth) / imgProps.width, 80);
        doc.addImage(chartImages.outcomeChart, 'PNG', 15, currentY, maxWidth, imgHeight);
        currentY += imgHeight + 10;
    }

    // Outcome Table
    const outcomeRows = analysis.outcomeStats.map(stat => [
        stat.code,
        stat.description,
        `%${stat.successRate.toFixed(1)}`,
        stat.isFailed ? t.failed : t.successful
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[t.outcomeCode, t.outcomeDesc, t.successRate, t.status]],
        body: outcomeRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 35, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === t.failed) {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- PAGE 5: DETAILED STATISTICS ---
    doc.addPage();
    addPageHeader(`${t.detailedStatistics} - ${metadata.className}`);
    currentY = 25;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(t.detailedStatistics, 14, currentY);
    currentY += 10;

    // Calculate Stats
    const studentScores = students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0));
    const stdDev = calculateStandardDeviation(studentScores);
    const median = calculateMedian(studentScores);
    const maxScore = studentScores.length > 0 ? Math.max(...studentScores) : 0;
    const minScore = studentScores.length > 0 ? Math.min(...studentScores) : 0;

    // Stats Grid
    const statsData = [
        [t.stdDev, stdDev.toFixed(2)],
        [t.median, median.toFixed(1)],
        [t.maxScore, maxScore.toString()],
        [t.minScore, minScore.toString()]
    ];

    autoTable(doc, {
        startY: currentY,
        head: [[t.detailedStatistics, 'Değer']],
        body: statsData,
        theme: 'grid',
        headStyles: { fillColor: [108, 117, 125], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 80, halign: 'center' }
        },
        margin: { left: 25 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Histogram Chart
    if (chartImages.histogramChart) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(t.scoreDistribution, 14, currentY);

        const imgProps = doc.getImageProperties(chartImages.histogramChart);
        const maxWidth = 180;
        const imgHeight = Math.min((imgProps.height * maxWidth) / imgProps.width, 100);
        doc.addImage(chartImages.histogramChart, 'PNG', 15, currentY + 5, maxWidth, imgHeight);
        currentY += imgHeight + 15;
    }

    // --- PAGE 6: STUDENT PERFORMANCE ---
    doc.addPage();
    addPageHeader(`${t.studentPerformance} - ${metadata.className}`);
    currentY = 25;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(t.studentPerformance, 14, currentY);

    currentY += 5;

    // Student Chart (if any other chart exists for students)
    if (chartImages.studentChart) {
        const imgProps = doc.getImageProperties(chartImages.studentChart);
        const maxWidth = 180;
        const imgHeight = Math.min((imgProps.height * maxWidth) / imgProps.width, 80);
        doc.addImage(chartImages.studentChart, 'PNG', 15, currentY, maxWidth, imgHeight);
        currentY += imgHeight + 10;
    }

    // Student Table (sorted by percentage descending)
    const studentRows = [...students]
        .sort((a, b) => {
            const scoreA = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
            const scoreB = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
            return scoreB - scoreA;
        })
        .map((s, idx) => {
            const totalScore = Object.values(s.scores).reduce((sum, sc) => sum + sc, 0);
            const percentage = (totalScore / (questions.reduce((sum, q) => sum + q.maxScore, 0))) * 100;
            return [
                (idx + 1).toString(),
                s.name,
                totalScore.toString(),
                `%${percentage.toFixed(1)}`
            ];
        });

    autoTable(doc, {
        startY: currentY,
        head: [[t.questionNo, t.studentName, t.totalScore, t.percentage]],
        body: studentRows,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = parseFloat(data.cell.raw.toString().replace('%', ''));
                if (val < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
                else data.cell.styles.textColor = [255, 193, 7];
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- PAGE 7: RECOMMENDATIONS ---
    doc.addPage();
    addPageHeader(`${t.recommendations} - ${metadata.className}`);
    currentY = 25;

    const recs = generateRecommendations(analysis, metadata, language);

    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text(t.recommendations, 14, currentY);

    currentY += 10;

    // General Evaluation
    doc.setFont(fontName, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(t.generalEvaluation, 14, currentY);

    currentY += 6;

    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    const evalLines = doc.splitTextToSize(recs.generalEvaluation, 180);
    doc.text(evalLines, 14, currentY);
    currentY += evalLines.length * 5 + 10;

    // Weak Areas
    if (recs.weakAreas.length > 0) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(220, 53, 69);
        doc.text(`🔴 ${t.weakAreas}:`, 14, currentY);
        currentY += 6;

        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        recs.weakAreas.forEach(area => {
            const lines = doc.splitTextToSize(`• ${area}`, 175);
            doc.text(lines, 18, currentY);
            currentY += lines.length * 5;
        });
        currentY += 5;
    }

    // Strong Areas
    if (recs.strongAreas.length > 0) {
        if (currentY > 250) {
            doc.addPage();
            addPageHeader(t.recommendations);
            currentY = 25;
        }

        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(40, 167, 69);
        doc.text(`🟢 ${t.strongAreas}:`, 14, currentY);
        currentY += 6;

        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        recs.strongAreas.forEach(area => {
            const lines = doc.splitTextToSize(`• ${area}`, 175);
            doc.text(lines, 18, currentY);
            currentY += lines.length * 5;
        });
        currentY += 5;
    }

    // Suggestions
    if (recs.suggestions.length > 0) {
        if (currentY > 240) {
            doc.addPage();
            addPageHeader(t.recommendations);
            currentY = 25;
        }

        doc.setFont(fontName, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(41, 128, 185);
        doc.text(`💡 ${t.suggestions}:`, 14, currentY);
        currentY += 6;

        doc.setFont(fontName, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        recs.suggestions.forEach(sugg => {
            const lines = doc.splitTextToSize(sugg, 175);
            doc.text(lines, 18, currentY);
            currentY += lines.length * 5 + 2;
        });
    }

    // SAVE PDF
    const filename = `${metadata.schoolName}_${metadata.className}_${metadata.subject}_${metadata.term}.Donem_${metadata.examNumber}.Sinav_${language.toUpperCase()}.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.]/g, '');

    doc.save(filename);
};

/**
 * Export both Turkish and English reports
 */
export const exportBilingualReports = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    // Turkish report
    exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');

    // English report
    setTimeout(() => {
        exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'en');
    }, 500);
};

/**
 * Export Individual Student Reports (Bulk PDF)
 */
export const exportIndividualStudentReports = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    const doc = new jsPDF();
    const fontName = 'helvetica';
    const t = translations[language];

    students.forEach((student, index) => {
        if (index > 0) doc.addPage();

        // Header Border
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(1);
        doc.rect(10, 10, 190, 277);

        // Title
        doc.setFont(fontName, 'bold');
        doc.setFontSize(18);
        doc.setTextColor(41, 128, 185);
        doc.text(language === 'tr' ? 'ÖĞRENCİ SINAV SONUÇ KARNESİ' : 'STUDENT EXAM REPORT CARD', 105, 25, { align: 'center' });

        // Student Info Box
        doc.setFillColor(240, 248, 255);
        doc.rect(15, 35, 180, 30, 'F');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.text(`${t.studentName}:`, 20, 45);
        doc.setFont(fontName, 'bold');
        doc.text(student.name, 60, 45);

        doc.setFont(fontName, 'normal');
        doc.text(`${t.class}:`, 20, 55);
        doc.setFont(fontName, 'bold');
        doc.text(metadata.className, 60, 55);

        // Exam Info
        doc.setFont(fontName, 'normal');
        doc.text(`${t.subject}:`, 110, 45);
        doc.setFont(fontName, 'bold');
        doc.text(metadata.subject, 150, 45);

        doc.setFont(fontName, 'normal');
        doc.text(`${t.date}:`, 110, 55);
        doc.setFont(fontName, 'bold');
        doc.text(metadata.date, 150, 55);

        // Score Circle
        const totalScore = Object.values(student.scores).reduce((a, b) => a + b, 0);
        const maxTotal = questions.reduce((a, b) => a + b.maxScore, 0);
        const percentage = (totalScore / maxTotal) * 100;

        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(percentage >= 50 ? 230 : 255, percentage >= 50 ? 255 : 230, 230);
        doc.circle(105, 90, 15, 'F');

        doc.setFontSize(24);
        doc.setTextColor(percentage < 50 ? 220 : 40, percentage < 50 ? 53 : 167, 69);
        doc.text(totalScore.toString(), 105, 93, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(t.totalScore, 105, 110, { align: 'center' });

        // Comparison
        doc.setFontSize(10);
        doc.text(`${t.classAverage}: ${analysis.classAverage.toFixed(1)}`, 105, 120, { align: 'center' });

        // Detailed Table
        const rows = questions.map((q, i) => {
            const studentScore = student.scores[q.id] || 0;
            const success = (studentScore / q.maxScore) * 100;
            return [
                (i + 1).toString(),
                q.outcome.description.substring(0, 60) + (q.outcome.description.length > 60 ? '...' : ''),
                q.maxScore.toString(),
                studentScore.toString(),
                success >= 50 ? (language === 'tr' ? 'Başarılı' : 'Pass') : (language === 'tr' ? 'Geliştirilmeli' : 'Needs Work')
            ];
        });

        autoTable(doc, {
            startY: 130,
            head: [[t.questionNo, t.outcomeDesc, 'Max', 'Puan', t.status]],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 30, halign: 'center' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 4) {
                    if (data.cell.raw === 'Geliştirilmeli' || data.cell.raw === 'Needs Work') {
                        data.cell.styles.textColor = [220, 53, 69];
                        data.cell.styles.fontStyle = 'bold';
                    } else {
                        data.cell.styles.textColor = [40, 167, 69];
                    }
                }
            }
        });

        // Weak Areas Summary
        const weakOutcomes = questions.filter(q => {
            const s = student.scores[q.id] || 0;
            return (s / q.maxScore) < 0.5;
        }).map(q => q.outcome.code + ' - ' + q.outcome.description);

        if (weakOutcomes.length > 0) {
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFont(fontName, 'bold');
            doc.setFontSize(11);
            doc.setTextColor(220, 53, 69);
            doc.text(language === 'tr' ? 'GÜÇLENDİRİLMESİ GEREKEN ALANLAR:' : 'AREAS NEEDING IMPROVEMENT:', 15, finalY);

            doc.setFont(fontName, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            let y = finalY + 7;
            weakOutcomes.forEach(wo => {
                if (y > 270) return;
                const lines = doc.splitTextToSize(`• ${wo}`, 180);
                doc.text(lines, 15, y);
                y += lines.length * 5;
            });
        }

        // Footer Signature
        doc.setFont(fontName, 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(metadata.teacherName, 160, 260, { align: 'center' });
        doc.line(140, 262, 180, 262);
        doc.text(t.teacher, 160, 267, { align: 'center' });
    });

    const filename = `${metadata.className}_Bireysel_Karneler.pdf`
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_.]/g, '');
    doc.save(filename);
};
