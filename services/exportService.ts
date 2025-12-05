/**
 * Export Service - PDF & Word Document Generation
 * Professional Grade Educational Reports
 * Version 2.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeadingLevel,
    BorderStyle,
    AlignmentType,
    ShadingType,
    TextRun,
    PageBreak,
    Header,
    Footer,
    ImageRun,
    TableOfContents,
    StyleLevel,
    convertInchesToTwip,
    PageNumber,
    NumberFormat
} from 'docx';
import * as FileSaver from 'file-saver';

// Handle file-saver import compatibility
const saveAs = FileSaver.saveAs || (FileSaver as any).default || (window as any).saveAs;

// Color definitions
const COLORS = {
    primary: '2980B9',      // Blue
    secondary: '34495E',    // Dark gray
    success: '28A745',      // Green
    danger: 'DC3545',       // Red
    warning: 'F59E0B',      // Orange/Yellow
    light: 'F8F9FA',        // Light gray
    white: 'FFFFFF',
    text: '333333',
    muted: '6C757D'
};

// Border style helper
const createBorderStyle = (color: string = 'DDDDDD', size: number = 1) => ({
    top: { style: BorderStyle.SINGLE, size, color },
    bottom: { style: BorderStyle.SINGLE, size, color },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size, color },
});

// Helper function to create styled text
const createStyledText = (
    text: string,
    options: {
        bold?: boolean;
        size?: number;
        color?: string;
        font?: string;
        italics?: boolean;
        underline?: boolean;
    } = {}
) => {
    return new TextRun({
        text,
        bold: options.bold || false,
        size: options.size || 22, // 11pt default
        color: options.color || COLORS.text,
        font: options.font || 'Calibri',
        italics: options.italics || false,
        underline: options.underline ? {} : undefined
    });
};

// Helper function to create a visual progress bar using Unicode blocks
const createProgressBar = (percentage: number): Paragraph => {
    const blocks = Math.round(percentage / 10);
    const filledChar = '█';
    const emptyChar = '░';
    const bar = filledChar.repeat(blocks) + emptyChar.repeat(10 - blocks);
    const color = percentage < 50 ? COLORS.danger : percentage < 75 ? COLORS.warning : COLORS.success;

    return new Paragraph({
        children: [
            new TextRun({ text: bar, color, font: 'Consolas', size: 20 }),
            new TextRun({ text: ` %${percentage.toFixed(0)}`, size: 20, color: COLORS.muted })
        ],
        alignment: AlignmentType.CENTER
    });
};

// Helper function to create section header
const createSectionHeader = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2): Paragraph => {
    return new Paragraph({
        text,
        heading: level,
        spacing: { before: 400, after: 200 },
        border: {
            bottom: { color: COLORS.primary, size: 6, style: BorderStyle.SINGLE }
        },
        shading: {
            fill: COLORS.light,
            type: ShadingType.CLEAR
        },
        indent: { left: 100 }
    });
};

// Helper: Calculate statistics
const calculateStats = (scores: number[]) => {
    if (scores.length === 0) return { mean: 0, stdDev: 0, median: 0, max: 0, min: 0 };

    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return {
        mean,
        stdDev,
        median,
        max: Math.max(...scores),
        min: Math.min(...scores)
    };
};

// Generate recommendations
const generateRecommendations = (analysis: AnalysisResult, metadata: ExamMetadata) => {
    const weakAreas = analysis.outcomeStats.filter(o => o.isFailed);
    const strongAreas = analysis.outcomeStats.filter(o => o.successRate >= 75);

    const suggestions: string[] = [];

    if (analysis.classAverage < 50) {
        suggestions.push('🔴 Sınıf genelinde temel kazanımlarda eksiklikler görülmektedir. Konu tekrarları ve telafi çalışmaları yapılması önerilir.');
    } else if (analysis.classAverage >= 75) {
        suggestions.push('🟢 Sınıf düzeyi beklenen seviyenin üzerindedir. Zenginleştirilmiş etkinlikler planlanabilir.');
    } else {
        suggestions.push('🟡 Sınıf başarısı orta düzeydedir. Bireyselleştirilmiş çalışmalar ile sınıf ortalaması artırılabilir.');
    }

    if (weakAreas.length > 0) {
        suggestions.push(`📊 ${weakAreas.length} adet "Geliştirilmeli" kazanım için konu tekrarı yapılmalıdır.`);
    }

    return { weakAreas, strongAreas, suggestions };
};

// --- PDF EXPORT ---
export const exportToPDF = (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[],
    chartImage?: string
) => {
    const doc = new jsPDF();
    const fontName = "helvetica";
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- COVER PAGE ---
    // Gradient-like effect with two rects
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');

    doc.setFillColor(52, 152, 219);
    doc.circle(-30, 80, 100, 'F');
    doc.circle(pageWidth + 40, 120, 80, 'F');

    doc.setFillColor(255, 255, 255);
    doc.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont(fontName, "bold");
    doc.setFontSize(28);
    doc.text("SINAV SONUÇ", pageWidth / 2, 70, { align: "center" });
    doc.text("ANALİZ RAPORU", pageWidth / 2, 85, { align: "center" });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont(fontName, "normal");
    doc.text(`${metadata.term}. Dönem - ${metadata.examNumber}. ${metadata.examType}`, pageWidth / 2, 105, { align: "center" });

    // Decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(60, 115, pageWidth - 60, 115);

    // School name
    doc.setFontSize(20);
    doc.setFont(fontName, "bold");
    doc.text(metadata.schoolName, pageWidth / 2, 135, { align: "center" });

    // Academic year
    doc.setFontSize(12);
    doc.setFont(fontName, "normal");
    doc.text(`${metadata.academicYear} Eğitim Öğretim Yılı`, pageWidth / 2, 150, { align: "center" });

    // Info box
    const infoBoxY = pageHeight * 0.6 + 15;
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(30, infoBoxY, pageWidth - 60, 50, 3, 3, 'F');

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);

    const leftCol = 45;
    const rightCol = pageWidth / 2 + 15;
    let infoY = infoBoxY + 15;

    doc.setFont(fontName, "bold");
    doc.text("Sınıf:", leftCol, infoY);
    doc.setFont(fontName, "normal");
    doc.text(metadata.className, leftCol + 20, infoY);

    doc.setFont(fontName, "bold");
    doc.text("Ders:", rightCol, infoY);
    doc.setFont(fontName, "normal");
    doc.text(metadata.subject, rightCol + 20, infoY);

    infoY += 12;
    doc.setFont(fontName, "bold");
    doc.text("Öğretmen:", leftCol, infoY);
    doc.setFont(fontName, "normal");
    doc.text(metadata.teacherName, leftCol + 35, infoY);

    doc.setFont(fontName, "bold");
    doc.text("Tarih:", rightCol, infoY);
    doc.setFont(fontName, "normal");
    doc.text(metadata.date, rightCol + 20, infoY);

    // Class average highlight box
    const avgBoxY = infoBoxY + 60;
    const successColor = analysis.classAverage >= 50 ? [40, 167, 69] : [220, 53, 69];
    doc.setFillColor(successColor[0], successColor[1], successColor[2]);
    doc.roundedRect(30, avgBoxY, pageWidth - 60, 30, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(fontName, "bold");
    doc.text(`%${analysis.classAverage.toFixed(1)}`, pageWidth / 2, avgBoxY + 18, { align: "center" });
    doc.setFontSize(10);
    doc.text("SINIF ORTALAMASI", pageWidth / 2, avgBoxY + 27, { align: "center" });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Bu rapor Sınav Analiz Uzmanı tarafından otomatik oluşturulmuştur.", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.addPage();

    // --- CONTENT PAGE ---
    let currentY = 20;

    // Header
    doc.setFont(fontName, "bold");
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text("SINAV ANALİZ DETAYLARI", 14, currentY);
    doc.setDrawColor(41, 128, 185);
    doc.line(14, currentY + 3, pageWidth - 14, currentY + 3);
    currentY += 15;

    // Statistics row
    const stats = calculateStats(students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    const statBoxWidth = 42;
    const statBoxHeight = 22;
    const statsData = [
        { label: 'Ortalama', value: `%${analysis.classAverage.toFixed(1)}`, color: successColor },
        { label: 'Std. Sapma', value: stats.stdDev.toFixed(1), color: [100, 100, 100] },
        { label: 'En Yüksek', value: stats.max.toString(), color: [40, 167, 69] },
        { label: 'En Düşük', value: stats.min.toString(), color: [220, 53, 69] }
    ];

    statsData.forEach((stat, i) => {
        const x = 14 + (i * (statBoxWidth + 5));
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(x, currentY, statBoxWidth, statBoxHeight, 2, 2, 'F');

        doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setLineWidth(0.5);
        doc.line(x, currentY, x + statBoxWidth, currentY);

        doc.setFont(fontName, "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(stat.label, x + statBoxWidth / 2, currentY + 8, { align: 'center' });

        doc.setFont(fontName, "bold");
        doc.setFontSize(12);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value, x + statBoxWidth / 2, currentY + 18, { align: 'center' });
    });

    currentY += statBoxHeight + 15;

    // Visual Dashboard (if provided)
    if (chartImage) {
        doc.setFont(fontName, "bold");
        doc.setFontSize(11);
        doc.setTextColor(41, 128, 185);
        doc.text("1. Görsel Analiz", 14, currentY);
        currentY += 5;

        try {
            const imgProps = doc.getImageProperties(chartImage);
            const maxWidth = pageWidth - 28;
            const imgHeight = Math.min((imgProps.height * maxWidth) / imgProps.width, 80);

            if (currentY + imgHeight > pageHeight - 20) {
                doc.addPage();
                currentY = 20;
            }

            doc.addImage(chartImage, 'PNG', 14, currentY, maxWidth, imgHeight);
            currentY += imgHeight + 10;
        } catch (e) {
            console.warn('Failed to add chart image to PDF');
        }
    }

    // Question Analysis Table
    if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFont(fontName, "bold");
    doc.setFontSize(11);
    doc.setTextColor(41, 128, 185);
    doc.text(chartImage ? "2. Soru Bazlı Analiz" : "1. Soru Bazlı Analiz", 14, currentY);
    currentY += 5;

    const questionRows = analysis.questionStats.map((q, idx) => [
        (idx + 1).toString(),
        q.outcome.code,
        q.outcome.description.length > 50 ? q.outcome.description.substring(0, 50) + '...' : q.outcome.description,
        q.averageScore.toFixed(1),
        `%${q.successRate.toFixed(0)}`
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['#', 'Kazanım Kodu', 'Kazanım Tanımı', 'Ort.', 'Başarı']],
        body: questionRows,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold',
            cellPadding: 3
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 22, fontStyle: 'bold' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) data.cell.styles.textColor = [220, 53, 69];
                else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
                else data.cell.styles.textColor = [245, 158, 11];
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Outcome Analysis Table
    if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFont(fontName, "bold");
    doc.setFontSize(11);
    doc.setTextColor(41, 128, 185);
    doc.text(chartImage ? "3. Kazanım Bazlı Analiz" : "2. Kazanım Bazlı Analiz", 14, currentY);
    currentY += 5;

    const outcomeRows = analysis.outcomeStats.map(stat => [
        stat.code,
        stat.description.length > 55 ? stat.description.substring(0, 55) + '...' : stat.description,
        `%${stat.successRate.toFixed(1)}`,
        stat.isFailed ? "GELİŞTİRİLMELİ" : "BAŞARILI"
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['Kod', 'Kazanım', 'Başarı', 'Durum']],
        body: outcomeRows,
        theme: 'grid',
        headStyles: {
            fillColor: [52, 73, 94],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { cellWidth: 22, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                if (data.cell.raw === "GELİŞTİRİLMELİ") {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fillColor = [255, 240, 240];
                } else {
                    data.cell.styles.textColor = [40, 167, 69];
                    data.cell.styles.fillColor = [240, 255, 240];
                }
            }
        }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Student List
    if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFont(fontName, "bold");
    doc.setFontSize(11);
    doc.setTextColor(41, 128, 185);
    doc.text(chartImage ? "4. Öğrenci Sonuçları" : "3. Öğrenci Sonuçları", 14, currentY);
    currentY += 5;

    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
        const scoreB = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
        return scoreB - scoreA;
    });

    const studentRows = sortedStudents.map((student, index) => {
        const totalScore = Object.values(student.scores).reduce((sum, s) => sum + s, 0);
        const percentage = (totalScore / maxPossibleScore) * 100;
        return [
            (index + 1).toString(),
            student.name,
            totalScore.toString(),
            `%${percentage.toFixed(1)}`
        ];
    });

    autoTable(doc, {
        startY: currentY,
        head: [['Sıra', 'Öğrenci Adı', 'Puan', 'Yüzde']],
        body: studentRows,
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        alternateRowStyles: {
            fillColor: [248, 249, 250]
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 25, fontStyle: 'bold' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = parseFloat(data.cell.raw?.toString().replace('%', '') || '0');
                if (val < 50) {
                    data.cell.styles.textColor = [220, 53, 69];
                } else if (val >= 85) {
                    data.cell.styles.textColor = [40, 167, 69];
                }
            }
        }
    });

    // Signature area
    currentY = (doc as any).lastAutoTable.finalY + 20;
    if (currentY > pageHeight - 30) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFont(fontName, "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Hazırlayan: ${metadata.teacherName}`, 14, currentY);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, currentY + 6);

    doc.text("İmza", pageWidth - 40, currentY);
    doc.line(pageWidth - 50, currentY + 12, pageWidth - 14, currentY + 12);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("GİZLİ - Kurumsal kullanım içindir.", pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const filename = `${sanitize(metadata.className)}_${sanitize(metadata.subject)}_Analiz_Raporu.pdf`;
    doc.save(filename);
};

// --- DOCX EXPORT (Professional Word Document) ---
export const exportToWord = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) => {
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);
    const stats = calculateStats(students.map(s => Object.values(s.scores).reduce((a, b) => a + b, 0)));
    const recs = generateRecommendations(analysis, metadata);

    // Sort students by score
    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
        const scoreB = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
        return scoreB - scoreA;
    });

    const doc = new Document({
        creator: "Sınav Analiz Uzmanı",
        title: `${metadata.className} - ${metadata.subject} Sınav Analizi`,
        description: `${metadata.academicYear} ${metadata.term}. Dönem ${metadata.examNumber}. ${metadata.examType}`,
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22 // 11pt
                    }
                },
                heading1: {
                    run: {
                        font: "Calibri",
                        size: 48,
                        bold: true,
                        color: COLORS.primary
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 }
                    }
                },
                heading2: {
                    run: {
                        font: "Calibri",
                        size: 28,
                        bold: true,
                        color: COLORS.secondary
                    },
                    paragraph: {
                        spacing: { before: 300, after: 150 }
                    }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.75),
                        bottom: convertInchesToTwip(0.75),
                        left: convertInchesToTwip(1),
                        right: convertInchesToTwip(1)
                    }
                }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            children: [
                                createStyledText(`${metadata.schoolName} | ${metadata.className} | ${metadata.subject}`, { size: 18, color: COLORS.muted })
                            ],
                            alignment: AlignmentType.RIGHT,
                            border: {
                                bottom: { color: COLORS.primary, size: 6, style: BorderStyle.SINGLE }
                            }
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            children: [
                                createStyledText("Bu rapor Sınav Analiz Uzmanı tarafından otomatik oluşturulmuştur. | Sayfa ", { size: 16, color: COLORS.muted }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    size: 16,
                                    color: COLORS.muted
                                }),
                                createStyledText(" / ", { size: 16, color: COLORS.muted }),
                                new TextRun({
                                    children: [PageNumber.TOTAL_PAGES],
                                    size: 16,
                                    color: COLORS.muted
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            border: {
                                top: { color: COLORS.light, size: 1, style: BorderStyle.SINGLE }
                            }
                        })
                    ]
                })
            },
            children: [
                // --- COVER PAGE ---
                new Paragraph({
                    children: [createStyledText("SINAV SONUÇ", { size: 72, bold: true, color: COLORS.primary })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000, after: 0 }
                }),
                new Paragraph({
                    children: [createStyledText("ANALİZ RAPORU", { size: 72, bold: true, color: COLORS.primary })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    children: [createStyledText(`${metadata.term}. Dönem - ${metadata.examNumber}. ${metadata.examType}`, { size: 28, color: COLORS.muted })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 }
                }),
                new Paragraph({
                    children: [createStyledText("─".repeat(30), { size: 28, color: COLORS.primary })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 }
                }),
                new Paragraph({
                    children: [createStyledText(metadata.schoolName, { size: 40, bold: true, color: COLORS.secondary })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [createStyledText(`${metadata.academicYear} Eğitim Öğretim Yılı`, { size: 26, color: COLORS.muted })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 }
                }),

                // Info Table
                new Table({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    borders: createBorderStyle(COLORS.light),
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Sınıf:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                                    width: { size: 25, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(metadata.className)] })],
                                    width: { size: 25, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Ders:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                                    width: { size: 25, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(metadata.subject)] })],
                                    width: { size: 25, type: WidthType.PERCENTAGE }
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Öğretmen:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(metadata.teacherName)] })]
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Tarih:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(metadata.date)] })]
                                })
                            ]
                        }),
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Öğrenci Sayısı:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(students.length.toString())] })]
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText("Soru Sayısı:", { bold: true })] })],
                                    shading: { fill: COLORS.light, type: ShadingType.CLEAR }
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(questions.length.toString())] })]
                                })
                            ]
                        })
                    ]
                }),

                // Class Average Box
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Table({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    alignment: AlignmentType.CENTER,
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [createStyledText(`%${analysis.classAverage.toFixed(1)}`, {
                                                size: 56,
                                                bold: true,
                                                color: analysis.classAverage >= 50 ? COLORS.success : COLORS.danger
                                            })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [createStyledText("SINIF ORTALAMASI", {
                                                size: 20,
                                                color: COLORS.muted,
                                                bold: true
                                            })],
                                            alignment: AlignmentType.CENTER
                                        })
                                    ],
                                    shading: {
                                        fill: analysis.classAverage >= 50 ? 'E8F5E9' : 'FFEBEE',
                                        type: ShadingType.CLEAR
                                    },
                                    borders: createBorderStyle(analysis.classAverage >= 50 ? COLORS.success : COLORS.danger, 2)
                                })
                            ]
                        })
                    ]
                }),

                // Page break
                new Paragraph({ children: [new PageBreak()] }),

                // --- CONTENT PAGES ---
                // Section 1: Statistics
                createSectionHeader("1. İstatistiksel Özet"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                { label: "Sınıf Ortalaması", value: `%${analysis.classAverage.toFixed(2)}` },
                                { label: "Standart Sapma", value: stats.stdDev.toFixed(2) },
                                { label: "Medyan", value: stats.median.toFixed(1) },
                                { label: "En Yüksek / En Düşük", value: `${stats.max} / ${stats.min}` }
                            ].map(item => new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [createStyledText(item.label, { size: 18, color: COLORS.muted, bold: true })],
                                        alignment: AlignmentType.CENTER
                                    }),
                                    new Paragraph({
                                        children: [createStyledText(item.value, { size: 28, bold: true, color: COLORS.primary })],
                                        alignment: AlignmentType.CENTER
                                    })
                                ],
                                shading: { fill: COLORS.light, type: ShadingType.CLEAR },
                                borders: createBorderStyle(COLORS.primary, 1),
                                width: { size: 25, type: WidthType.PERCENTAGE }
                            }))
                        })
                    ]
                }),

                new Paragraph({ text: "", spacing: { after: 300 } }),

                // Section 2: Question Analysis
                createSectionHeader("2. Soru Bazlı Analiz"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        // Header row
                        new TableRow({
                            children: ["#", "Kazanım Kodu", "Kazanım Tanımı", "Ort. Puan", "Başarı Grafiği"].map(header =>
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(header, { bold: true, color: COLORS.white, size: 20 })] })],
                                    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                                    borders: createBorderStyle(COLORS.primary)
                                })
                            )
                        }),
                        // Data rows
                        ...analysis.questionStats.map((q, idx) =>
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText((idx + 1).toString(), { bold: true })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 5, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [createStyledText(q.outcome.code, { bold: true, color: COLORS.primary })] })],
                                        borders: createBorderStyle(),
                                        width: { size: 15, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [createStyledText(q.outcome.description, { size: 20 })] })],
                                        borders: createBorderStyle()
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(q.averageScore.toFixed(2), { size: 20 })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 10, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [createProgressBar(q.successRate)],
                                        borders: createBorderStyle(),
                                        width: { size: 20, type: WidthType.PERCENTAGE }
                                    })
                                ]
                            })
                        )
                    ]
                }),

                new Paragraph({ text: "", spacing: { after: 300 } }),

                // Section 3: Outcome Analysis
                createSectionHeader("3. Kazanım Bazlı Analiz"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: ["Kod", "Kazanım Açıklaması", "Başarı %", "Durum"].map(header =>
                                new TableCell({
                                    children: [new Paragraph({ children: [createStyledText(header, { bold: true, color: COLORS.white, size: 20 })] })],
                                    shading: { fill: COLORS.secondary, type: ShadingType.CLEAR },
                                    borders: createBorderStyle(COLORS.secondary)
                                })
                            )
                        }),
                        ...analysis.outcomeStats.map(stat =>
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({ children: [createStyledText(stat.code, { bold: true })] })],
                                        borders: createBorderStyle(),
                                        width: { size: 15, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [createStyledText(stat.description, { size: 20 })] })],
                                        borders: createBorderStyle()
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(`%${stat.successRate.toFixed(1)}`, {
                                                bold: true,
                                                color: stat.isFailed ? COLORS.danger : COLORS.success
                                            })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 12, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(
                                                stat.isFailed ? "⚠ GELİŞTİRİLMELİ" : "✓ BAŞARILI",
                                                { bold: true, color: stat.isFailed ? COLORS.danger : COLORS.success, size: 18 }
                                            )],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        shading: {
                                            fill: stat.isFailed ? 'FFEBEE' : 'E8F5E9',
                                            type: ShadingType.CLEAR
                                        },
                                        width: { size: 18, type: WidthType.PERCENTAGE }
                                    })
                                ]
                            })
                        )
                    ]
                }),

                new Paragraph({ children: [new PageBreak()] }),

                // Section 4: Student List
                createSectionHeader("4. Öğrenci Performans Listesi"),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: ["Sıra", "Öğrenci Adı", "Toplam Puan", "Yüzde", "Durum"].map(header =>
                                new TableCell({
                                    children: [new Paragraph({
                                        children: [createStyledText(header, { bold: true, color: COLORS.white, size: 20 })],
                                        alignment: AlignmentType.CENTER
                                    })],
                                    shading: { fill: COLORS.primary, type: ShadingType.CLEAR },
                                    borders: createBorderStyle(COLORS.primary)
                                })
                            )
                        }),
                        ...sortedStudents.map((student, idx) => {
                            const totalScore = Object.values(student.scores).reduce((sum, s) => sum + s, 0);
                            const percentage = (totalScore / maxPossibleScore) * 100;
                            const isPass = percentage >= 50;
                            const isExcellent = percentage >= 85;

                            return new TableRow({
                                children: [
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText((idx + 1).toString(), { bold: true })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 8, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({ children: [createStyledText(student.name)] })],
                                        borders: createBorderStyle()
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(totalScore.toString(), { bold: true })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 15, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(`%${percentage.toFixed(1)}`, {
                                                bold: true,
                                                color: isExcellent ? COLORS.success : isPass ? COLORS.warning : COLORS.danger
                                            })],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        width: { size: 12, type: WidthType.PERCENTAGE }
                                    }),
                                    new TableCell({
                                        children: [new Paragraph({
                                            children: [createStyledText(
                                                isExcellent ? "★ Mükemmel" : isPass ? "✓ Geçer" : "⚠ Destek Gerekli",
                                                { size: 18, color: isExcellent ? COLORS.success : isPass ? COLORS.warning : COLORS.danger }
                                            )],
                                            alignment: AlignmentType.CENTER
                                        })],
                                        borders: createBorderStyle(),
                                        shading: {
                                            fill: isExcellent ? 'E8F5E9' : isPass ? 'FFF8E1' : 'FFEBEE',
                                            type: ShadingType.CLEAR
                                        },
                                        width: { size: 18, type: WidthType.PERCENTAGE }
                                    })
                                ]
                            });
                        })
                    ]
                }),

                new Paragraph({ text: "", spacing: { after: 400 } }),

                // Section 5: Recommendations
                createSectionHeader("5. Öneriler ve Değerlendirme"),

                // Weak Areas Box
                ...(recs.weakAreas.length > 0 ? [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [createStyledText(`🔴 Geliştirilmesi Gereken Kazanımlar (${recs.weakAreas.length})`, { bold: true, color: COLORS.danger, size: 22 })],
                                                spacing: { after: 100 }
                                            }),
                                            ...recs.weakAreas.map(area => new Paragraph({
                                                children: [createStyledText(`• ${area.code}: ${area.description} (%${area.successRate.toFixed(1)})`, { size: 20 })],
                                                spacing: { before: 50 }
                                            }))
                                        ],
                                        borders: createBorderStyle(COLORS.danger),
                                        shading: { fill: 'FFEBEE', type: ShadingType.CLEAR }
                                    })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({ text: "", spacing: { after: 200 } })
                ] : []),

                // Strong Areas Box
                ...(recs.strongAreas.length > 0 ? [
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [createStyledText(`🟢 Başarılı Kazanımlar (${recs.strongAreas.length})`, { bold: true, color: COLORS.success, size: 22 })],
                                                spacing: { after: 100 }
                                            }),
                                            ...recs.strongAreas.map(area => new Paragraph({
                                                children: [createStyledText(`• ${area.code}: ${area.description} (%${area.successRate.toFixed(1)})`, { size: 20 })],
                                                spacing: { before: 50 }
                                            }))
                                        ],
                                        borders: createBorderStyle(COLORS.success),
                                        shading: { fill: 'E8F5E9', type: ShadingType.CLEAR }
                                    })
                                ]
                            })
                        ]
                    }),
                    new Paragraph({ text: "", spacing: { after: 200 } })
                ] : []),

                // Suggestions Box
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [createStyledText("💡 Öneriler", { bold: true, color: COLORS.primary, size: 22 })],
                                            spacing: { after: 100 }
                                        }),
                                        ...recs.suggestions.map(sugg => new Paragraph({
                                            children: [createStyledText(sugg, { size: 20 })],
                                            spacing: { before: 80 }
                                        }))
                                    ],
                                    borders: createBorderStyle(COLORS.primary),
                                    shading: { fill: 'E3F2FD', type: ShadingType.CLEAR }
                                })
                            ]
                        })
                    ]
                }),

                new Paragraph({ text: "", spacing: { after: 400 } }),

                // Signature Section
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE }
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [createStyledText("Hazırlayan:", { bold: true, size: 20 })] }),
                                        new Paragraph({ children: [createStyledText(metadata.teacherName, { size: 22 })] }),
                                        new Paragraph({ text: "", spacing: { after: 50 } }),
                                        new Paragraph({ children: [createStyledText("Rapor Tarihi:", { bold: true, size: 20 })] }),
                                        new Paragraph({ children: [createStyledText(new Date().toLocaleDateString('tr-TR'), { size: 22 })] })
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [createStyledText("İmza", { bold: true, size: 20 })],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 600 }
                                        }),
                                        new Paragraph({
                                            children: [createStyledText("_____________________", { size: 22 })],
                                            alignment: AlignmentType.CENTER
                                        })
                                    ],
                                    width: { size: 50, type: WidthType.PERCENTAGE }
                                })
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    // Save document
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
    const filename = `${sanitize(metadata.className)}_${sanitize(metadata.subject)}_Analiz_Raporu.docx`;

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, filename);
    });
};