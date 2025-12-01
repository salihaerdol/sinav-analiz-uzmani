/**
 * EXCEL SERVICE - Import/Export functionality
 * Professional Excel handling for exam analysis
 */

import * as XLSX from 'xlsx-js-style'; // We'll use this from CDN
import { QuestionConfig, Student, ExamMetadata } from '../types';

// =====================================================
// EXCEL EXPORT FUNCTIONS
// =====================================================

/**
 * Export student list to Excel
 */
export const exportStudentListToExcel = (students: Student[], className: string) => {
    const worksheet_data = [
        ['No', 'Öğrenci Numarası', 'Ad Soyad', 'Cinsiyet', 'E-posta', 'Veli Telefon', 'Notlar'],
        ...students.map((s, i) => [
            i + 1,
            s.student_number || '',
            s.full_name,
            s.gender || '',
            s.contact_email || '',
            s.parent_phone || '',
            s.notes || ''
        ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheet_data);

    // Styling
    ws['!cols'] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 25 },
        { wch: 10 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenci Listesi');

    XLSX.writeFile(wb, `${className}_Ogrenci_Listesi.xlsx`);
};

/**
 * Export exam scores template
 */
export const exportExamScoresTemplate = (
    students: Student[],
    questions: QuestionConfig[],
    metadata: ExamMetadata
) => {
    const headers = [
        'No',
        'Öğrenci Numarası',
        'Ad Soyad',
        ...questions.map(q => `S${q.id}\n(${q.maxScore}p)`),
        'Toplam',
        'Yüzde %'
    ];

    const data = students.map((s, i) => [
        i + 1,
        s.student_number || i + 1,
        s.full_name,
        ...questions.map(() => ''), // Empty cells for scores
        '', // Total
        '' // Percentage
    ]);

    const worksheet_data = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(worksheet_data);

    // Column widths
    ws['!cols'] = [
        { wch: 5 },
        { wch: 12 },
        { wch: 25 },
        ...questions.map(() => ({ wch: 8 })),
        { wch: 10 },
        { wch: 10 }
    ];

    // Add formulas for total and percentage
    const maxTotal = questions.reduce((sum, q) => sum + q.maxScore, 0);
    students.forEach((_, idx) => {
        const rowNum = idx + 2; // +2 because of header and 0-index
        const firstScoreCol = 'D';
        const lastScoreCol = String.fromCharCode(67 + questions.length); // D + question count

        // Total formula
        const totalCell = `${String.fromCharCode(68 + questions.length)}${rowNum}`;
        ws[totalCell] = {
            f: `SUM(${firstScoreCol}${rowNum}:${lastScoreCol}${rowNum})`,
            t: 'n'
        };

        // Percentage formula
        const pctCell = `${String.fromCharCode(69 + questions.length)}${rowNum}`;
        ws[pctCell] = {
            f: `${totalCell}/${maxTotal}*100`,
            t: 'n',
            z: '0.0'
        };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Not Girişi');

    // Add question details sheet
    const questionData = [
        ['Soru No', 'Kazanım Kodu', 'Kazanım Açıklaması', 'Maks Puan'],
        ...questions.map(q => [q.id, q.outcome.code, q.outcome.description, q.maxScore])
    ];

    const wsQuestions = XLSX.utils.aoa_to_sheet(questionData);
    wsQuestions['!cols'] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 50 },
        { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Soru Detayları');

    XLSX.writeFile(wb, `${metadata.className}_${metadata.subject}_Sinav_Sablonu.xlsx`);
};

/**
 * Export detailed analysis to Excel
 */
export const exportAnalysisToExcel = (
    analysis: any,
    metadata: ExamMetadata,
    questions: QuestionConfig[],
    students: any[]
) => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = [
        ['SINAV ANALİZ RAPORU'],
        [],
        ['Okul', metadata.schoolName],
        ['Öğretmen', metadata.teacherName],
        ['Sınıf', metadata.className],
        ['Ders', metadata.subject],
        ['Tarih', metadata.date],
        [],
        ['Sınıf Ortalaması', `${analysis.classAverage.toFixed(2)}%`],
        ['Öğrenci Sayısı', students.length],
        ['Soru Sayısı', questions.length]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

    // Sheet 2: Question Analysis
    const questionData = [
        ['Soru', 'Kazanım Kodu', 'Kazanım', 'Maks Puan', 'Ort Puan', 'Başarı %', 'Durum'],
        ...analysis.questionStats.map((q: any) => {
            const question = questions.find(qu => qu.id === q.questionId);
            return [
                q.questionId,
                q.outcome.code,
                q.outcome.description,
                question?.maxScore || 0,
                q.averageScore.toFixed(2),
                q.successRate.toFixed(2) + '%',
                q.successRate >= 50 ? 'Başarılı' : 'Geliştirilmeli'
            ];
        })
    ];

    const wsQuestions = XLSX.utils.aoa_to_sheet(questionData);
    wsQuestions['!cols'] = [
        { wch: 8 },
        { wch: 15 },
        { wch: 40 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Soru Analizi');

    // Sheet 3: Student Results
    const studentData = [
        ['Sıra', 'Ad Soyad', 'Toplam Puan', 'Yüzde %'],
        ...students.map((s: any, idx: number) => {
            const total = Object.values(s.scores).reduce((a: any, b: any) => a + b, 0) as number;
            const maxTotal = questions.reduce((sum, q) => sum + q.maxScore, 0);
            const percentage = (total / maxTotal) * 100;

            return [
                idx + 1,
                s.name,
                total,
                percentage.toFixed(2) + '%'
            ];
        }).sort((a: any, b: any) => parseFloat(b[3]) - parseFloat(a[3]))
    ];

    const wsStudents = XLSX.utils.aoa_to_sheet(studentData);
    wsStudents['!cols'] = [
        { wch: 8 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 }
    ];
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Öğrenci Sonuçları');

    // Sheet 4: Outcome Analysis
    const outcomeData = [
        ['Kazanım Kodu', 'Açıklama', 'Başarı %', 'Durum'],
        ...analysis.outcomeStats.map((o: any) => [
            o.code,
            o.description,
            o.successRate.toFixed(2) + '%',
            o.isFailed ? 'Geliştirilmeli' : 'Başarılı'
        ])
    ];

    const wsOutcomes = XLSX.utils.aoa_to_sheet(outcomeData);
    wsOutcomes['!cols'] = [
        { wch: 15 },
        { wch: 50 },
        { wch: 12 },
        { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsOutcomes, 'Kazanım Analizi');

    XLSX.writeFile(wb, `${metadata.className}_${metadata.subject}_Analiz_Detayli.xlsx`);
};

// =====================================================
// EXCEL IMPORT FUNCTIONS
// =====================================================

/**
 * Import student list from Excel
 */
export const importStudentListFromExcel = async (file: File): Promise<Student[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

                // Skip header row
                const students: Student[] = jsonData.slice(1).map((row, index) => ({
                    student_list_id: '', // Will be set later
                    student_number: row[1]?.toString() || (index + 1).toString(),
                    full_name: row[2]?.toString() || `Öğrenci ${index + 1}`,
                    gender: row[3]?.toString() as 'M' | 'F' | 'Other' | undefined,
                    contact_email: row[4]?.toString() || '',
                    parent_phone: row[5]?.toString() || '',
                    notes: row[6]?.toString() || ''
                })).filter(s => s.full_name && s.full_name !== '');

                resolve(students);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Import exam scores from Excel
 */
export const importExamScoresFromExcel = async (
    file: File,
    questions: QuestionConfig[]
): Promise<{ studentName: string; scores: Record<number, number> }[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

                // Skip header row
                const results = jsonData.slice(1).map((row) => {
                    const studentName = row[2]?.toString() || '';
                    const scores: Record<number, number> = {};

                    questions.forEach((q, index) => {
                        const scoreValue = row[3 + index];
                        if (scoreValue !== undefined && scoreValue !== '') {
                            const score = parseFloat(scoreValue.toString());
                            if (!isNaN(score)) {
                                scores[q.id] = Math.min(score, q.maxScore);
                            }
                        }
                    });

                    return { studentName, scores };
                }).filter(r => r.studentName !== '');

                resolve(results);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsArrayBuffer(file);
    });
};

// =====================================================
// CLIPBOARD FUNCTIONS (Paste from Excel/Word)
// =====================================================

/**
 * Parse clipboard data (from Excel/Word)
 */
export const parseClipboardData = (text: string): string[][] => {
    // Split by new lines
    const lines = text.split(/\r?\n/).filter(line => line.trim());

    // Split each line by tab (Excel default) or comma
    return lines.map(line => {
        // Try tab first (Excel format)
        if (line.includes('\t')) {
            return line.split('\t');
        }
        // Try comma (CSV format)
        return line.split(',').map(cell => cell.trim());
    });
};

/**
 * Parse student names from clipboard
 */
export const parseStudentNamesFromClipboard = (text: string): string[] => {
    const data = parseClipboardData(text);

    // Assume first column is student name
    return data
        .map(row => row[0]?.trim())
        .filter(name => name && name.length > 0);
};

/**
 * Parse scores from clipboard
 */
export const parseScoresFromClipboard = (
    text: string,
    questionCount: number
): { studentName: string; scores: number[] }[] => {
    const data = parseClipboardData(text);

    return data.map(row => ({
        studentName: row[0]?.trim() || '',
        scores: row.slice(1, 1 + questionCount)
            .map(cell => {
                const num = parseFloat(cell);
                return isNaN(num) ? 0 : num;
            })
    })).filter(item => item.studentName);
};

/**
 * Download template as Excel
 */
export const downloa dStudentListTemplate = () => {
    const template = [
        ['No', 'Öğrenci No', 'Ad Soyad', 'Cinsiyet (M/F)', 'E-posta', 'Veli Telefon', 'Notlar'],
        ['1', '101', 'Örnek Öğrenci 1', 'M', 'ornek1@email.com', '0555 123 4567', ''],
        ['2', '102', 'Örnek Öğrenci 2', 'F', 'ornek2@email.com', '0555 234 5678', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    ws['!cols'] = [
        { wch: 5 },
        { wch: 12 },
        { wch: 25 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenci Listesi');

    XLSX.writeFile(wb, 'Ogrenci_Listesi_Sablonu.xlsx');
};
