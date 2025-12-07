/**
 * ═══════════════════════════════════════════════════════════════
 * EXCEL SERVICE
 * ═══════════════════════════════════════════════════════════════
 * Excel import/export işlemleri
 */

import * as XLSX from 'xlsx';
import { QuestionConfig, Student, ExamMetadata } from '../types';

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export function exportStudentListToExcel(students: Student[], className: string) {
    const data = [
        ['No', 'Öğrenci No', 'Ad Soyad'],
        ...students.map((s, i) => [i + 1, s.student_number || '', s.name])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenci Listesi');
    XLSX.writeFile(wb, `${className}_Ogrenci_Listesi.xlsx`);
}

export function exportExamScoresTemplate(students: Student[], questions: QuestionConfig[], metadata: ExamMetadata) {
    const headers = ['No', 'Ad Soyad', ...questions.map(q => `S${q.id} (${q.maxScore}p)`), 'Toplam'];
    const data = students.map((s, i) => [i + 1, s.name, ...questions.map(() => ''), '']);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = [{ wch: 5 }, { wch: 30 }, ...questions.map(() => ({ wch: 10 })), { wch: 12 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Not Girişi');
    XLSX.writeFile(wb, `${metadata.className}_Sinav_Sablonu.xlsx`);
}

export function exportAnalysisToExcel(analysis: any, metadata: ExamMetadata, questions: QuestionConfig[], students: any[]) {
    const wb = XLSX.utils.book_new();

    // Özet
    const summaryData = [
        ['SINAV ANALİZ RAPORU'],
        [],
        ['Okul', metadata.schoolName],
        ['Sınıf', metadata.className],
        ['Ders', metadata.subject],
        ['Sınıf Ortalaması', `%${analysis.classAverage.toFixed(1)}`]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Özet');

    // Soru Analizi
    const questionData = [
        ['Soru', 'Kazanım', 'Başarı %'],
        ...analysis.questionStats.map((q: any) => [q.questionId, q.outcome.description, `%${q.successRate.toFixed(0)}`])
    ];
    const wsQuestions = XLSX.utils.aoa_to_sheet(questionData);
    XLSX.utils.book_append_sheet(wb, wsQuestions, 'Soru Analizi');

    // Öğrenci Sonuçları
    const maxTotal = questions.reduce((sum, q) => sum + q.maxScore, 0);
    const studentData = [
        ['Sıra', 'Ad Soyad', 'Puan', 'Yüzde'],
        ...students.map((s: any, i: number) => {
            const total = Object.values(s.scores).reduce((a: any, b: any) => a + b, 0) as number;
            return [i + 1, s.name, total, `%${((total / maxTotal) * 100).toFixed(0)}`];
        })
    ];
    const wsStudents = XLSX.utils.aoa_to_sheet(studentData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Öğrenci Sonuçları');

    XLSX.writeFile(wb, `${metadata.className}_Analiz.xlsx`);
}

// ═══════════════════════════════════════════════════════════════
// IMPORT
// ═══════════════════════════════════════════════════════════════

export async function importStudentListFromExcel(file: File): Promise<Student[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                const students: Student[] = jsonData.slice(1).map((row, i) => ({
                    id: String(i + 1),
                    student_number: row[1]?.toString() || String(i + 1),
                    name: row[2]?.toString() || `Öğrenci ${i + 1}`,
                    scores: {}
                })).filter(s => s.name);

                resolve(students);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsArrayBuffer(file);
    });
}

export async function importExamScoresFromExcel(file: File, questions: QuestionConfig[]): Promise<{ studentName: string; scores: Record<number, number> }[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                const results = jsonData.slice(1).map((row) => {
                    const studentName = row[1]?.toString() || '';
                    const scores: Record<number, number> = {};

                    questions.forEach((q, index) => {
                        const scoreValue = row[2 + index];
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
}

// ═══════════════════════════════════════════════════════════════
// CLIPBOARD
// ═══════════════════════════════════════════════════════════════

export function parseClipboardData(text: string): string[][] {
    return text.split(/\r?\n/).filter(line => line.trim()).map(line => {
        if (line.includes('\t')) return line.split('\t');
        return line.split(',').map(cell => cell.trim());
    });
}

export function parseStudentNamesFromClipboard(text: string): string[] {
    return parseClipboardData(text).map(row => row[0]?.trim()).filter(name => name && name.length > 0);
}

export function parseScoresFromClipboard(text: string, questionCount: number): { studentName: string; scores: number[] }[] {
    return parseClipboardData(text).map(row => ({
        studentName: row[0]?.trim() || '',
        scores: row.slice(1, 1 + questionCount).map(cell => {
            const num = parseFloat(cell);
            return isNaN(num) ? 0 : num;
        })
    })).filter(item => item.studentName);
}

export function downloadStudentListTemplate() {
    const template = [
        ['No', 'Öğrenci No', 'Ad Soyad'],
        ['1', '101', 'Örnek Öğrenci 1'],
        ['2', '102', 'Örnek Öğrenci 2']
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Öğrenci Listesi');
    XLSX.writeFile(wb, 'Ogrenci_Listesi_Sablonu.xlsx');
}
