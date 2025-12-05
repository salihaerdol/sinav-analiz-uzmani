/**
 * Advanced Export Service - Professional PDF Generation
 * FIXED: Turkish characters, charts, tables, and layout
 * Version 3.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

// Language support
export type Language = 'tr' | 'en';

// Export scenario types
export type ExportScenario =
    | 'full_report'
    | 'executive_summary'
    | 'student_focused'
    | 'outcome_analysis'
    | 'parent_report'
    | 'meb_standard';

export interface ExportOptions {
    language: Language;
    scenario: ExportScenario;
    includeCharts: boolean;
    includeRecommendations: boolean;
    includeStudentList: boolean;
    compactMode: boolean;
}

const translations = {
    tr: {
        reportTitle: 'SINAV ANALIZ RAPORU',
        examAnalysisReport: 'Sinav Analiz Raporu',
        executiveSummary: 'YONETICI OZETI',
        school: 'Okul',
        teacher: 'Ogretmen',
        class: 'Sinif',
        subject: 'Ders',
        date: 'Tarih',
        term: 'Donem',
        examNumber: 'Sinav No',
        examType: 'Sinav Turu',
        academicYear: 'Akademik Yil',
        classAverage: 'Sinif Ortalamasi',
        totalStudents: 'Ogrenci Sayisi',
        totalQuestions: 'Soru Sayisi',
        visualAnalysis: 'Gorsel Analiz',
        questionAnalysis: 'Soru Bazli Analiz',
        outcomeAnalysis: 'Kazanim Bazli Analiz',
        studentPerformance: 'Ogrenci Performansi',
        recommendations: 'ONERILER',
        questionNo: 'Soru',
        outcomeCode: 'Kazanim Kodu',
        outcomeDesc: 'Kazanim Tanimi',
        avgScore: 'Ort.',
        successRate: 'Basari %',
        status: 'Durum',
        successful: 'BASARILI',
        needsImprovement: 'GELISTIRILMELI',
        studentName: 'Ogrenci Adi',
        totalScore: 'Toplam Puan',
        percentage: 'Yuzde',
        weakAreas: 'Zayif Alanlar',
        strongAreas: 'Guclu Alanlar',
        suggestions: 'Oneriler',
        preparedBy: 'Hazirlayan',
        reportDate: 'Rapor Tarihi',
        signature: 'Imza',
        detailedStatistics: 'Istatistikler',
        stdDev: 'Std. Sapma',
        median: 'Medyan',
        maxScore: 'En Yuksek',
        minScore: 'En Dusuk',
        page: 'Sayfa',
        of: '/',
        confidential: 'GIZLI - KURUMSAL KULLANIM ICIN',
        generatedBy: 'Sinav Analiz Uzmani',
        rank: 'Sira',
        gradeDistribution: 'Not Dagilimi',
        scoreDistribution: 'Puan Dagilimi'
    },
    en: {
        reportTitle: 'EXAM ANALYSIS REPORT',
        examAnalysisReport: 'Exam Analysis Report',
        executiveSummary: 'EXECUTIVE SUMMARY',
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
        questionAnalysis: 'Question Analysis',
        outcomeAnalysis: 'Outcome Analysis',
        studentPerformance: 'Student Performance',
        recommendations: 'RECOMMENDATIONS',
        questionNo: 'Q#',
        outcomeCode: 'Code',
        outcomeDesc: 'Description',
        avgScore: 'Avg',
        successRate: 'Success %',
        status: 'Status',
        successful: 'PASS',
        needsImprovement: 'NEEDS WORK',
        studentName: 'Student Name',
        totalScore: 'Total Score',
        percentage: 'Percentage',
        weakAreas: 'Weak Areas',
        strongAreas: 'Strong Areas',
        suggestions: 'Suggestions',
        preparedBy: 'Prepared By',
        reportDate: 'Report Date',
        signature: 'Signature',
        detailedStatistics: 'Statistics',
        stdDev: 'Std Dev',
        median: 'Median',
        maxScore: 'Highest',
        minScore: 'Lowest',
        page: 'Page',
        of: 'of',
        confidential: 'CONFIDENTIAL',
        generatedBy: 'Exam Analysis Expert',
        rank: 'Rank',
        gradeDistribution: 'Grade Distribution',
        scoreDistribution: 'Score Distribution'
    }
};

// Turkish character converter
const convertTurkish = (text: string): string => {
    if (!text) return '';
    const map: Record<string, string> = {
        'ş': 's', 'Ş': 'S',
        'ğ': 'g', 'Ğ': 'G',
        'ü': 'u', 'Ü': 'U',
        'ö': 'o', 'Ö': 'O',
        'ç': 'c', 'Ç': 'C',
        'ı': 'i', 'İ': 'I'
    };
    return text.replace(/[şŞğĞüÜöÖçÇıİ]/g, (char) => map[char] || char);
};

// Statistics helpers
const calculateStandardDeviation = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    return Math.sqrt(variance);
};

const calculateMedian = (scores: number[]): number => {
    if (scores.length === 0) return 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Generate recommendations
const generateRecommendations = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    lang: Language = 'tr'
) => {
    const weakAreas = analysis.outcomeStats.filter(o => o.isFailed);
    const strongAreas = analysis.outcomeStats.filter(o => o.successRate >= 75);
    const suggestions: string[] = [];

    if (analysis.classAverage < 50) {
        suggestions.push(lang === 'tr'
            ? 'Sinif genelinde temel kazanimlarda eksiklikler gorulmektedir.'
            : 'Deficiencies observed in basic outcomes across the class.');
    } else if (analysis.classAverage >= 75) {
        suggestions.push(lang === 'tr'
            ? 'Sinif duzeyi beklenen seviyenin uzerindedir.'
            : 'Class level is above expected.');
    } else {
        suggestions.push(lang === 'tr'
            ? 'Sinif basarisi orta duzeydedir.'
            : 'Class success is at medium level.');
    }

    if (weakAreas.length > 0) {
        suggestions.push(lang === 'tr'
            ? `${weakAreas.length} adet kazanim icin tekrar oneriliyor.`
            : `Review recommended for ${weakAreas.length} outcomes.`);
    }

    return { weakAreas, strongAreas, suggestions };
};

/**
 * MAIN PDF EXPORT FUNCTION - FIXED VERSION
 */
export const exportToPDFAdvanced = async (
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
        radarChart?: string;
        gradePieChart?: string;
        questionSuccessChart?: string;
        cognitiveChart?: string;
        difficultyChart?: string;
    } = {},
    language: Language = 'tr',
    options: Partial<ExportOptions> = {}
) => {
    const t = translations[language];
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    // Calculate statistics
    const studentScores = students.map(s =>
        Object.values(s.scores).reduce((a: number, b: number) => a + b, 0)
    );
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);
    const studentPercentages = studentScores.map(s => (s / maxPossibleScore) * 100);
    const stdDev = calculateStandardDeviation(studentPercentages);
    const median = calculateMedian(studentPercentages);
    const maxScore = studentScores.length > 0 ? Math.max(...studentScores) : 0;
    const minScore = studentScores.length > 0 ? Math.min(...studentScores) : 0;

    // Recommendations
    const recs = generateRecommendations(analysis, metadata, language);

    // ============== PAGE 1: COVER ==============
    // Blue header section
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 100, 'F');

    // Decorative circles
    doc.setFillColor(52, 152, 219);
    doc.circle(-20, 50, 60, 'F');
    doc.circle(pageWidth + 20, 70, 50, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(convertTurkish(t.reportTitle), pageWidth / 2, 45, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const subtitle = `${metadata.term}. ${convertTurkish(t.term)} - ${metadata.examNumber}. ${convertTurkish(metadata.examType)}`;
    doc.text(subtitle, pageWidth / 2, 60, { align: 'center' });

    // Decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(50, 70, pageWidth - 50, 70);

    // School name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(convertTurkish(metadata.schoolName), pageWidth / 2, 85, { align: 'center' });

    // Info box
    const infoY = 115;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, infoY, contentWidth, 55, 3, 3, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, infoY, contentWidth, 55, 3, 3, 'S');

    // Info content
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    const leftCol = margin + 10;
    const rightCol = pageWidth / 2 + 10;
    let infoLineY = infoY + 12;

    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.class)}:`, leftCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(convertTurkish(metadata.className), leftCol + 25, infoLineY);

    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.subject)}:`, rightCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(convertTurkish(metadata.subject), rightCol + 20, infoLineY);

    // Row 2
    infoLineY += 12;
    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.teacher)}:`, leftCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(convertTurkish(metadata.teacherName), leftCol + 30, infoLineY);

    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.date)}:`, rightCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(metadata.date, rightCol + 20, infoLineY);

    // Row 3
    infoLineY += 12;
    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.totalStudents)}:`, leftCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(students.length.toString(), leftCol + 40, infoLineY);

    doc.setFont('helvetica', 'bold');
    doc.text(`${convertTurkish(t.totalQuestions)}:`, rightCol, infoLineY);
    doc.setFont('helvetica', 'normal');
    doc.text(questions.length.toString(), rightCol + 35, infoLineY);

    // Class Average Box
    const avgBoxY = 185;
    const isSuccess = analysis.classAverage >= 50;
    doc.setFillColor(isSuccess ? 40 : 220, isSuccess ? 167 : 53, isSuccess ? 69 : 69);
    doc.roundedRect(margin, avgBoxY, contentWidth, 35, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`%${analysis.classAverage.toFixed(1)}`, pageWidth / 2, avgBoxY + 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(convertTurkish(t.classAverage).toUpperCase(), pageWidth / 2, avgBoxY + 30, { align: 'center' });

    // Statistics summary
    const statsY = 235;
    const statBoxW = (contentWidth - 15) / 4;

    const statsData = [
        { label: convertTurkish(t.classAverage), value: `%${analysis.classAverage.toFixed(1)}`, color: isSuccess ? [40, 167, 69] : [220, 53, 69] },
        { label: convertTurkish(t.stdDev), value: stdDev.toFixed(1), color: [100, 100, 100] },
        { label: convertTurkish(t.maxScore), value: maxScore.toString(), color: [40, 167, 69] },
        { label: convertTurkish(t.minScore), value: minScore.toString(), color: [220, 53, 69] }
    ];

    statsData.forEach((stat, i) => {
        const x = margin + (i * (statBoxW + 5));
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(x, statsY, statBoxW, 28, 2, 2, 'F');

        doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setLineWidth(0.8);
        doc.line(x, statsY, x + statBoxW, statsY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(stat.label, x + statBoxW / 2, statsY + 10, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value, x + statBoxW / 2, statsY + 22, { align: 'center' });
    });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(convertTurkish(t.generatedBy), pageWidth / 2, pageHeight - 10, { align: 'center' });

    // ============== PAGE 2: QUESTION ANALYSIS ==============
    doc.addPage();
    let currentY = 20;

    // Page header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(convertTurkish(t.questionAnalysis), pageWidth / 2, 8, { align: 'center' });

    // Question table
    currentY = 22;
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`1. ${convertTurkish(t.questionAnalysis)}`, margin, currentY);
    currentY += 8;

    const questionRows = analysis.questionStats.map((q, idx) => [
        (idx + 1).toString(),
        convertTurkish(q.outcome.code),
        convertTurkish(q.outcome.description.length > 40
            ? q.outcome.description.substring(0, 40) + '...'
            : q.outcome.description),
        q.averageScore.toFixed(1),
        `%${q.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[
            convertTurkish(t.questionNo),
            convertTurkish(t.outcomeCode),
            convertTurkish(t.outcomeDesc),
            convertTurkish(t.avgScore),
            convertTurkish(t.successRate)
        ]],
        body: questionRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            font: 'helvetica',
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 25, fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
                else data.cell.styles.textColor = [245, 158, 11];
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Check page break
    if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
    }

    // Outcome table
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`2. ${convertTurkish(t.outcomeAnalysis)}`, margin, currentY);
    currentY += 8;

    const outcomeRows = analysis.outcomeStats.map(stat => [
        convertTurkish(stat.code),
        convertTurkish(stat.description.length > 45
            ? stat.description.substring(0, 45) + '...'
            : stat.description),
        `%${stat.successRate.toFixed(1)}`,
        stat.isFailed ? convertTurkish(t.needsImprovement) : convertTurkish(t.successful)
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [[
            convertTurkish(t.outcomeCode),
            convertTurkish(t.outcomeDesc),
            convertTurkish(t.successRate),
            convertTurkish(t.status)
        ]],
        body: outcomeRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [52, 73, 94],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === convertTurkish(t.needsImprovement)) {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [255, 245, 245];
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fillColor = [245, 255, 245];
                }
            }
        }
    });

    // ============== PAGE 3: STUDENT LIST ==============
    doc.addPage();
    currentY = 20;

    // Page header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(convertTurkish(t.studentPerformance), pageWidth / 2, 8, { align: 'center' });

    currentY = 22;
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`3. ${convertTurkish(t.studentPerformance)}`, margin, currentY);
    currentY += 8;

    // Sort students by score
    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((sum: number, s: number) => sum + s, 0);
        const scoreB = Object.values(b.scores).reduce((sum: number, s: number) => sum + s, 0);
        return scoreB - scoreA;
    });

    const studentRows = sortedStudents.map((s, idx) => {
        const totalScore = Object.values(s.scores).reduce((sum: number, sc: number) => sum + sc, 0);
        const percentage = (totalScore / maxPossibleScore) * 100;
        return [
            (idx + 1).toString(),
            convertTurkish(s.name),
            totalScore.toString(),
            `%${percentage.toFixed(1)}`
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [[
            convertTurkish(t.rank),
            convertTurkish(t.studentName),
            convertTurkish(t.totalScore),
            convertTurkish(t.percentage)
        ]],
        body: studentRows,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            font: 'helvetica'
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [255, 248, 248];
                } else if (val >= 85) {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fillColor = [248, 255, 248];
                }
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // ============== PAGE 4: CHARTS & RECOMMENDATIONS ==============
    // Check if we have charts and enough space
    const hasCharts = chartImages.gradePieChart || chartImages.histogramChart || chartImages.radarChart;

    if (hasCharts) {
        doc.addPage();
        currentY = 20;

        // Page header
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(convertTurkish(t.visualAnalysis), pageWidth / 2, 8, { align: 'center' });

        currentY = 22;
        doc.setTextColor(41, 128, 185);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`4. ${convertTurkish(t.visualAnalysis)}`, margin, currentY);
        currentY += 10;

        const chartWidth = 85;
        const chartHeight = 60;

        // Chart 1 - Grade Distribution
        if (chartImages.gradePieChart) {
            try {
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                doc.text(convertTurkish(t.gradeDistribution), margin, currentY);
                doc.addImage(chartImages.gradePieChart, 'PNG', margin, currentY + 3, chartWidth, chartHeight);
            } catch (e) {
                console.warn('Failed to add grade chart');
            }
        }

        // Chart 2 - Histogram
        if (chartImages.histogramChart) {
            try {
                doc.text(convertTurkish(t.scoreDistribution), pageWidth / 2 + 5, currentY);
                doc.addImage(chartImages.histogramChart, 'PNG', pageWidth / 2 + 5, currentY + 3, chartWidth, chartHeight);
            } catch (e) {
                console.warn('Failed to add histogram');
            }
        }

        currentY += chartHeight + 20;

        // Chart 3 - Radar
        if (chartImages.radarChart && currentY + chartHeight < pageHeight - 40) {
            try {
                doc.setFontSize(9);
                doc.text(convertTurkish(t.outcomeAnalysis), margin, currentY);
                doc.addImage(chartImages.radarChart, 'PNG', margin, currentY + 3, chartWidth, chartHeight);
            } catch (e) {
                console.warn('Failed to add radar chart');
            }
        }

        // Chart 4 - Question Success
        if (chartImages.questionSuccessChart && currentY + chartHeight < pageHeight - 40) {
            try {
                doc.text(convertTurkish(t.questionAnalysis), pageWidth / 2 + 5, currentY);
                doc.addImage(chartImages.questionSuccessChart, 'PNG', pageWidth / 2 + 5, currentY + 3, chartWidth, chartHeight);
            } catch (e) {
                console.warn('Failed to add question chart');
            }
        }
    }

    // Recommendations section (on current page if space, else new page)
    if (recs.suggestions.length > 0) {
        currentY = (doc as any).lastAutoTable?.finalY || currentY;

        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = 20;
        } else {
            currentY += 10;
        }

        doc.setFillColor(245, 250, 255);
        doc.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'F');
        doc.setDrawColor(41, 128, 185);
        doc.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'S');

        doc.setTextColor(41, 128, 185);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(convertTurkish(t.recommendations), margin + 5, currentY + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        recs.suggestions.slice(0, 3).forEach((sugg, idx) => {
            const truncated = sugg.length > 80 ? sugg.substring(0, 80) + '...' : sugg;
            doc.text(`• ${truncated}`, margin + 8, currentY + 22 + (idx * 10));
        });
    }

    // Signature area
    currentY = pageHeight - 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`${convertTurkish(t.preparedBy)}: ${convertTurkish(metadata.teacherName)}`, margin, currentY);
    doc.text(`${convertTurkish(t.reportDate)}: ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`, margin, currentY + 6);

    // Signature line
    doc.text(convertTurkish(t.signature), pageWidth - 45, currentY);
    doc.line(pageWidth - 50, currentY + 12, pageWidth - margin, currentY + 12);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text(convertTurkish(t.confidential), pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save file
    const sanitize = (str: string) => convertTurkish(str).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const filename = `${sanitize(metadata.className)}_${sanitize(metadata.subject)}_Rapor.pdf`;
    doc.save(filename);
};

/**
 * Quick Export with predefined scenarios
 */
export const quickExport = async (
    scenario: ExportScenario,
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {},
    language: Language = 'tr'
) => {
    await exportToPDFAdvanced(
        analysis,
        metadata,
        questions,
        students,
        chartImages,
        language,
        { scenario }
    );
};

/**
 * Export bilingual reports (TR + EN)
 */
export const exportBilingualReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImages: any = {}
) => {
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'tr');
    await new Promise(resolve => setTimeout(resolve, 500));
    await exportToPDFAdvanced(analysis, metadata, questions, students, chartImages, 'en');
};

/**
 * Export individual student reports
 */
export const exportIndividualStudentReports = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    language: Language = 'tr'
) => {
    const t = translations[language];
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    for (const student of students) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        const totalScore = Object.values(student.scores).reduce((sum: number, s: number) => sum + s, 0);
        const percentage = (totalScore / maxPossibleScore) * 100;

        // Header
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(convertTurkish(metadata.schoolName), pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`${convertTurkish(metadata.subject)} - ${convertTurkish(metadata.className)}`, pageWidth / 2, 25, { align: 'center' });

        // Student name
        let y = 50;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${convertTurkish(t.studentName)}: ${convertTurkish(student.name)}`, margin, y);

        // Score box
        y += 15;
        const isPass = percentage >= 50;
        doc.setFillColor(isPass ? 240 : 255, isPass ? 255 : 240, isPass ? 240 : 240);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'F');
        doc.setDrawColor(isPass ? 40 : 220, isPass ? 167 : 53, isPass ? 69 : 69);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'S');

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isPass ? 40 : 220, isPass ? 167 : 53, isPass ? 69 : 69);
        doc.text(`%${percentage.toFixed(1)}`, pageWidth / 2, y + 18, { align: 'center' });

        // Question details
        y += 45;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(convertTurkish(t.questionAnalysis), margin, y);
        y += 8;

        const studentQuestionData = analysis.questionStats.map((q, idx) => {
            const score = student.scores[q.questionId] || 0;
            const maxQ = questions.find(qu => qu.id === q.questionId)?.maxScore || 1;
            return [
                (idx + 1).toString(),
                convertTurkish(q.outcome.code),
                score.toString(),
                maxQ.toString()
            ];
        });

        autoTable(doc, {
            startY: y,
            head: [[convertTurkish(t.questionNo), convertTurkish(t.outcomeCode), 'Puan', 'Maks']],
            body: studentQuestionData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { left: margin, right: margin }
        });

        // Signature
        y = pageHeight - 30;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${convertTurkish(t.preparedBy)}: ${convertTurkish(metadata.teacherName)}`, margin, y);
        doc.text(`${convertTurkish(t.reportDate)}: ${new Date().toLocaleDateString('tr-TR')}`, margin, y + 5);

        doc.text(convertTurkish(t.signature), pageWidth - 45, y);
        doc.line(pageWidth - 50, y + 10, pageWidth - margin, y + 10);

        const sanitize = (str: string) => convertTurkish(str).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
        doc.save(`${sanitize(student.name)}_Karne.pdf`);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
};

/**
 * Get export scenarios list
 */
export const getExportScenarios = (language: Language = 'tr') => {
    const scenarios = [
        { id: 'full_report' as ExportScenario, icon: '📊', name: language === 'tr' ? 'Tam Rapor' : 'Full Report', description: language === 'tr' ? 'Tum detaylar dahil' : 'All details included' },
        { id: 'executive_summary' as ExportScenario, icon: '📋', name: language === 'tr' ? 'Ozet Rapor' : 'Summary', description: language === 'tr' ? 'Sadece onemli bilgiler' : 'Key info only' },
        { id: 'student_focused' as ExportScenario, icon: '👨‍🎓', name: language === 'tr' ? 'Ogrenci Odakli' : 'Student Focus', description: language === 'tr' ? 'Ogrenci listesi detayli' : 'Detailed student list' },
        { id: 'outcome_analysis' as ExportScenario, icon: '🎯', name: language === 'tr' ? 'Kazanim Analizi' : 'Outcomes', description: language === 'tr' ? 'Kazanim detaylari' : 'Outcome details' },
        { id: 'parent_report' as ExportScenario, icon: '👪', name: language === 'tr' ? 'Veli Raporu' : 'Parent Report', description: language === 'tr' ? 'Veli icin sade format' : 'Simple for parents' },
        { id: 'meb_standard' as ExportScenario, icon: '🏛️', name: language === 'tr' ? 'MEB Standart' : 'Official', description: language === 'tr' ? 'Resmi format' : 'Official format' }
    ];
    return scenarios;
};
