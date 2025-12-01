import React, { useRef, useState } from 'react';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { QuestionConfig } from '../types';

interface DataImportProps {
    questions: QuestionConfig[];
    onImport: (students: any[]) => void;
}

export const DataImport: React.FC<DataImportProps> = ({ questions, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const downloadTemplate = () => {
        // Create CSV header
        // Use semicolon for Excel compatibility in some regions, or comma. 
        // Excel in TR usually expects semicolon.
        const headers = ['Öğrenci Adı', ...questions.map(q => `Soru ${q.id} (Max: ${q.maxScore})`)];
        const csvContent = headers.join(';') + '\n' +
            'Örnek Öğrenci;8;5' + ';'.repeat(questions.length - 2) + '\n';

        // Download with BOM for UTF-8 support in Excel
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sinav_not_sablonu.csv';
        link.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);

                if (lines.length < 2) throw new Error('Dosya boş veya hatalı format.');

                const students = [];
                // Detect delimiter (comma or semicolon)
                const firstLine = lines[0];
                const delimiter = firstLine.includes(';') ? ';' : ',';

                // Skip header
                for (let i = 1; i < lines.length; i++) {
                    const parts = lines[i].split(delimiter);
                    if (parts.length < 2) continue;

                    const name = parts[0].trim();
                    // Remove quotes if present
                    const cleanName = name.replace(/^"|"$/g, '');

                    const scores: Record<number, number> = {};

                    questions.forEach((q, idx) => {
                        if (parts[idx + 1]) {
                            let scoreStr = parts[idx + 1].trim().replace(/^"|"$/g, '');
                            // Handle comma decimal separator
                            scoreStr = scoreStr.replace(',', '.');
                            const score = parseFloat(scoreStr);

                            if (!isNaN(score)) {
                                scores[q.id] = Math.min(score, q.maxScore);
                            }
                        }
                    });

                    students.push({
                        id: (Date.now() + i).toString(), // Generate unique temp ID
                        name: cleanName,
                        scores
                    });
                }

                if (students.length === 0) {
                    setError('Dosyadan öğrenci okunamadı.');
                    return;
                }

                onImport(students);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                alert(`${students.length} öğrenci başarıyla yüklendi.`);
            } catch (err) {
                console.error(err);
                setError('Dosya okunurken hata oluştu. Lütfen şablona uygun CSV dosyası yükleyin.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex gap-2 items-center">
            <button
                onClick={downloadTemplate}
                className="flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors border border-slate-200"
                title="Excel/CSV Şablonu İndir"
            >
                <Download className="w-4 h-4 mr-2" /> Şablon
            </button>

            <div className="relative">
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors border border-green-200"
                >
                    <Upload className="w-4 h-4 mr-2" /> CSV Yükle
                </button>
            </div>

            {error && (
                <div className="flex items-center text-red-600 text-xs bg-red-50 px-2 py-1 rounded border border-red-100">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {error}
                </div>
            )}
        </div>
    );
};
