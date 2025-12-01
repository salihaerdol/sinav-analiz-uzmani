import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel, BorderStyle, AlignmentType, ShadingType, TextRun } from 'docx';
import * as FileSaver from 'file-saver';

// Handle file-saver import compatibility
const saveAs = FileSaver.saveAs || (FileSaver as any).default || (window as any).saveAs;

// --- PDF EXPORT ---
export const exportToPDF = (
  analysis: AnalysisResult,
  metadata: ExamMetadata,
  questions: QuestionConfig[],
  students: Student[],
  chartImage?: string // Optional base64 image of the dashboard
) => {
  const doc = new jsPDF();
  const fontName = "helvetica"; 

  // --- Header ---
  doc.setFont(fontName, "bold");
  doc.setFontSize(18);
  doc.setTextColor(41, 128, 185);
  doc.text("SINAV SONUÇ ANALİZ RAPORU", 105, 20, { align: "center" });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 25, 196, 25);

  // --- Metadata Section ---
  doc.setFont(fontName, "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const leftX = 14;
  const rightX = 120;
  let startY = 35;
  const lineHeight = 6;

  doc.text(`Okul: ${metadata.schoolName}`, leftX, startY);
  doc.text(`Tarih: ${metadata.date}`, rightX, startY);
  
  doc.text(`Öğretmen: ${metadata.teacherName}`, leftX, startY + lineHeight);
  doc.text(`Sınıf: ${metadata.className}`, rightX, startY + lineHeight);
  
  doc.text(`Ders: ${metadata.subject}`, leftX, startY + lineHeight * 2);
  doc.text(`Senaryo: ${metadata.scenario}. Senaryo`, rightX, startY + lineHeight * 2);

  // Class Average Highlight
  doc.setFont(fontName, "bold");
  doc.setTextColor(41, 128, 185);
  doc.text(`Sınıf Ortalaması: ${analysis.classAverage.toFixed(2)}`, rightX, startY + lineHeight * 3);
  doc.setTextColor(0, 0, 0);

  let currentY = startY + lineHeight * 5;

  // --- 1. VISUAL DASHBOARD (SCREENSHOT) ---
  // Replaces the manual bar chart if image is provided
  if (chartImage) {
      doc.setFont(fontName, "bold");
      doc.setFontSize(12);
      doc.text("1. Görsel Analiz Özeti", 14, currentY);
      
      const pageWidth = 210;
      const margin = 14;
      const maxWidth = pageWidth - (margin * 2);
      
      // Calculate aspect ratio
      // Assuming a standard capture, we fit it to width
      const imgProps = doc.getImageProperties(chartImage);
      const imgHeight = (imgProps.height * maxWidth) / imgProps.width;
      
      // If image is too tall for remaining page, add new page
      if (currentY + imgHeight > 280) {
          doc.addPage();
          currentY = 20;
          doc.text("1. Görsel Analiz Özeti (Devam)", 14, currentY);
      }
      
      doc.addImage(chartImage, 'PNG', margin, currentY + 5, maxWidth, imgHeight);
      currentY += imgHeight + 15;
  } else {
      // Fallback: Leave space or skip
      currentY += 5;
  }

  // If we are too far down, new page for tables
  if (currentY > 250) {
      doc.addPage();
      currentY = 20;
  }

  // --- 2. Question Analysis Table ---
  doc.setFont(fontName, "bold");
  doc.setFontSize(12);
  doc.text(chartImage ? "2. Soru Bazlı Detaylı Analiz" : "1. Soru Bazlı Analiz", 14, currentY);

  const questionRows = analysis.questionStats.map(q => [
    q.questionId,
    q.outcome.code,
    q.outcome.description.substring(0, 60) + (q.outcome.description.length > 60 ? '...' : ''),
    q.averageScore.toFixed(1),
    `%${q.successRate.toFixed(1)}`
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Soru', 'Kazanım Kodu', 'Kazanım Tanımı', 'Ort. Puan', 'Başarı %']],
    body: questionRows,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 9 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: { 
      0: { cellWidth: 15, halign: 'center' }, 
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
            const val = parseFloat(data.cell.raw.toString().replace('%',''));
            if (val < 50) data.cell.styles.textColor = [220, 53, 69];
            else if (val >= 75) data.cell.styles.textColor = [40, 167, 69];
        }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- 3. Outcome Analysis Table ---
  // Check page break
  if (currentY > 260) {
      doc.addPage();
      currentY = 20;
  }

  doc.setFont(fontName, "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(chartImage ? "3. Kazanım Bazlı Analiz" : "2. Kazanım Bazlı Analiz", 14, currentY);
  
  const outcomeRows = analysis.outcomeStats.map(stat => [
    stat.code,
    stat.description,
    `%${stat.successRate.toFixed(1)}`,
    stat.isFailed ? "BAŞARISIZ" : "BAŞARILI"
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Kod', 'Kazanım', 'Başarı %', 'Durum']],
    body: outcomeRows,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 8 },
    columnStyles: { 
      0: { cellWidth: 25 }, 
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
            if (data.cell.raw === "BAŞARISIZ") {
                data.cell.styles.textColor = [220, 53, 69];
                data.cell.styles.fontStyle = 'bold';
            } else {
                data.cell.styles.textColor = [40, 167, 69];
            }
        }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- 4. Student List ---
   if (currentY > 260) {
      doc.addPage();
      currentY = 20;
  }

  doc.setFont(fontName, "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(chartImage ? "4. Öğrenci Sonuçları" : "3. Öğrenci Sonuçları", 14, currentY);

  const studentRows = analysis.studentStats.map((stat, index) => {
    const student = students.find(s => s.id === stat.studentId);
    return [
      index + 1,
      student?.name || "Bilinmiyor",
      stat.totalScore,
      `%${stat.percentage.toFixed(1)}`
    ];
  });

  autoTable(doc, {
    startY: currentY + 5,
    head: [['Sıra', 'Öğrenci Adı', 'Puan', 'Başarı %']],
    body: studentRows,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
    styles: { fontSize: 9 },
  });

  doc.save(`${metadata.className}_Analiz_Raporu.pdf`);
};

// --- DOCX EXPORT ---
export const exportToWord = async (
  analysis: AnalysisResult,
  metadata: ExamMetadata,
  questions: QuestionConfig[],
  students: Student[]
) => {
  const borderStyle = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };

  const headerBackground = "F5F5F5";

  // Helper function to create a visual bar in cell
  const createVisualBar = (percentage: number) => {
      const blocks = Math.round(percentage / 10); // 0-10 blocks
      const filledChar = "■"; 
      const emptyChar = "□";
      const bar = filledChar.repeat(blocks) + emptyChar.repeat(10 - blocks);
      const color = percentage < 50 ? "D32F2F" : percentage < 75 ? "F57C00" : "2E7D32";
      return new Paragraph({
          children: [
              new TextRun({ text: bar, color: color, font: "Courier New" }), // Monospace for alignment
              new TextRun({ text: ` %${percentage.toFixed(0)}`, size: 20 })
          ]
      });
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "SINAV SONUÇ ANALİZ RAPORU",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          run: { color: "2E86C1" }
        }),
        
        // Metadata
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: "EEEEEE" },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideH: { style: BorderStyle.NONE },
                insideV: { style: BorderStyle.NONE }
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: `Okul: ${metadata.schoolName}`, bold: true })] }),
                        new TableCell({ children: [new Paragraph({ text: `Tarih: ${metadata.date}`, alignment: AlignmentType.RIGHT })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(`Öğretmen: ${metadata.teacherName}`)] }),
                        new TableCell({ children: [new Paragraph({ text: `Sınıf: ${metadata.className}`, alignment: AlignmentType.RIGHT })] })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(`Ders: ${metadata.subject}`)] }),
                        new TableCell({ children: [new Paragraph({ text: `Ortalama: ${analysis.classAverage.toFixed(2)}`, bold: true, color: "2E7D32", alignment: AlignmentType.RIGHT })] })
                    ]
                })
            ]
        }),

        new Paragraph({ text: "", spacing: { after: 300 } }),

        // 1. Question Analysis
        new Paragraph({ text: "1. Soru Bazlı Analiz ve Başarı Grafiği", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: ["Soru", "Kazanım Kodu", "Ort. Puan", "Başarı Grafiği"].map(header => 
                        new TableCell({
                            children: [new Paragraph({ text: header, bold: true })],
                            shading: { fill: headerBackground, type: ShadingType.CLEAR },
                            borders: borderStyle
                        })
                    )
                }),
                ...analysis.questionStats.map(q => 
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(q.questionId.toString())], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(q.outcome.code)], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(q.averageScore.toFixed(2))], borders: borderStyle }),
                            new TableCell({ 
                                children: [createVisualBar(q.successRate)], 
                                borders: borderStyle 
                            }),
                        ]
                    })
                )
            ]
        }),

        new Paragraph({ text: "", spacing: { after: 300 } }),

        // 2. Outcome Analysis
        new Paragraph({ text: "2. Kazanım Bazlı Analiz", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: ["Kod", "Kazanım Açıklaması", "Başarı %", "Durum"].map(header => 
                        new TableCell({
                            children: [new Paragraph({ text: header, bold: true })],
                            shading: { fill: headerBackground, type: ShadingType.CLEAR },
                            borders: borderStyle
                        })
                    )
                }),
                ...analysis.outcomeStats.map(stat => 
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(stat.code)], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(stat.description)], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(`%${stat.successRate.toFixed(1)}`)], borders: borderStyle }),
                            new TableCell({ 
                                children: [new Paragraph({ 
                                    text: stat.isFailed ? "BAŞARISIZ" : "BAŞARILI",
                                    color: stat.isFailed ? "D32F2F" : "2E7D32",
                                    bold: true
                                })], 
                                borders: borderStyle 
                            }),
                        ]
                    })
                )
            ]
        }),

        new Paragraph({ text: "", spacing: { after: 300 } }),

        // 3. Student List
        new Paragraph({ text: "3. Öğrenci Listesi", heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: ["Sıra", "Öğrenci Adı", "Toplam Puan", "Yüzde"].map(header => 
                        new TableCell({
                            children: [new Paragraph({ text: header, bold: true })],
                            shading: { fill: headerBackground, type: ShadingType.CLEAR },
                            borders: borderStyle
                        })
                    )
                }),
                ...analysis.studentStats.map((stat, idx) => {
                    const student = students.find(s => s.id === stat.studentId);
                    return new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph(`${idx + 1}`)], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(student?.name || "-")], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(stat.totalScore.toString())], borders: borderStyle }),
                            new TableCell({ children: [new Paragraph(`%${stat.percentage.toFixed(1)}`)], borders: borderStyle }),
                        ]
                    });
                })
            ]
        })
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${metadata.className}_Analiz_Raporu.docx`);
  });
};