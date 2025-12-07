/**
 * ═══════════════════════════════════════════════════════════════
 * WORD EXPORT SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Basit Word (.docx) export servisi
 */

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
    TextRun
} from 'docx';
import * as FileSaver from 'file-saver';
import { AnalysisResult, ExamMetadata, QuestionConfig, Student } from '../types';

const saveAs = FileSaver.saveAs || (FileSaver as any).default;

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

export const exportToWord = async (
    analysis: AnalysisResult,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: Student[]
) => {
    const maxPossibleScore = questions.reduce((sum, q) => sum + q.maxScore, 0);

    // Öğrencileri puana göre sırala
    const sortedStudents = [...students].sort((a, b) => {
        const scoreA = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
        const scoreB = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
        return scoreB - scoreA;
    });

    const doc = new Document({
        creator: "Sınav Analiz Uzmanı",
        title: `${metadata.className} - ${metadata.subject} Sınav Analizi`,
        sections: [{
            children: [
                // BAŞLIK
                new Paragraph({
                    text: metadata.schoolName,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: 'SINAV ANALİZ RAPORU',
                    heading: HeadingLevel.HEADING_2,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    text: `${metadata.className} - ${metadata.subject} - ${metadata.examType}`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                // ÖZET BİLGİLER
                new Paragraph({
                    text: 'ÖZET BİLGİLER',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Sınıf Ortalaması: %${analysis.classAverage.toFixed(1)}`, bold: true }),
                        new TextRun({ text: `  |  Öğrenci Sayısı: ${students.length}` }),
                        new TextRun({ text: `  |  Soru Sayısı: ${questions.length}` })
                    ]
                }),

                // SORU ANALİZİ
                new Paragraph({
                    text: 'SORU BAZLI ANALİZ',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400 }
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'Soru', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Kazanım' })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Başarı %', alignment: AlignmentType.CENTER })] })
                            ]
                        }),
                        ...analysis.questionStats.map(q => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: String(q.questionId), alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: q.outcome.description })] }),
                                new TableCell({ children: [new Paragraph({ text: `%${q.successRate.toFixed(0)}`, alignment: AlignmentType.CENTER })] })
                            ]
                        }))
                    ]
                }),

                // KAZANIM DURUMU
                new Paragraph({
                    text: 'KAZANIM BAŞARI DURUMU',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400 }
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'Kod' })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Açıklama' })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Başarı %', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Durum', alignment: AlignmentType.CENTER })] })
                            ]
                        }),
                        ...analysis.outcomeStats.map(o => new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: o.code })] }),
                                new TableCell({ children: [new Paragraph({ text: o.description })] }),
                                new TableCell({ children: [new Paragraph({ text: `%${o.successRate.toFixed(0)}`, alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: o.isFailed ? 'GELİŞTİRİLMELİ' : 'BAŞARILI', alignment: AlignmentType.CENTER })] })
                            ]
                        }))
                    ]
                }),

                // ÖĞRENCİ LİSTESİ
                new Paragraph({
                    text: 'ÖĞRENCİ SONUÇ LİSTESİ',
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 400 }
                }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph({ text: 'Sıra', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Ad Soyad' })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Puan', alignment: AlignmentType.CENTER })] }),
                                new TableCell({ children: [new Paragraph({ text: 'Yüzde', alignment: AlignmentType.CENTER })] })
                            ]
                        }),
                        ...sortedStudents.map((s, i) => {
                            const total = Object.values(s.scores).reduce((a, b) => a + b, 0);
                            const pct = (total / maxPossibleScore) * 100;
                            return new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: String(i + 1), alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: s.name })] }),
                                    new TableCell({ children: [new Paragraph({ text: String(total), alignment: AlignmentType.CENTER })] }),
                                    new TableCell({ children: [new Paragraph({ text: `%${pct.toFixed(0)}`, alignment: AlignmentType.CENTER })] })
                                ]
                            });
                        })
                    ]
                }),

                // FOOTER
                new Paragraph({
                    text: `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
                    spacing: { before: 600 }
                }),
                new Paragraph({
                    text: `Hazırlayan: ${metadata.teacherName}`
                })
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${safeName(metadata.className)}_${safeName(metadata.subject)}_Rapor.docx`);
};