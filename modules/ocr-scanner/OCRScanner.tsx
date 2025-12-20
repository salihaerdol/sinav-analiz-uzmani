import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Download, FileImage, Loader2, Save, Upload } from 'lucide-react';
import { analyzeImageWithOCR } from './ocrService';
import { getApiKey } from '../../services/geminiService';
import { OCRScanResult, OCRStatus, OCRStudentRow } from './types';
import { classListService } from '../../services/supabase';
import { Student } from '../../types';
import { getPdfPageCount } from './pdfUtils';

interface OCRScannerProps {
  defaultClassName?: string;
  defaultGrade?: string;
  defaultSubject?: string;
  defaultAcademicYear?: string;
  defaultSchoolName?: string;
  defaultTeacherName?: string;
  onApplyStudents?: (students: Student[], options?: { preserveScores?: boolean }) => void;
  onAppendStudents?: (students: Student[], options?: { preserveScores?: boolean }) => void;
  onClose?: () => void;
}

type SaveNotice = { type: 'success' | 'error'; message: string } | null;
type ApplyNotice = { type: 'success' | 'error'; message: string } | null;

const getDefaultAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
};

const normalizeStudentNumber = (value?: string) => (value || '').replace(/\s+/g, '').trim();

const mergeStudentRows = (a: OCRStudentRow, b: OCRStudentRow): OCRStudentRow => {
  const primary = a.confidence >= b.confidence ? a : b;
  const secondary = primary === a ? b : a;

  return {
    rowNumber: Math.min(a.rowNumber, b.rowNumber),
    studentNumber: primary.studentNumber || secondary.studentNumber,
    firstName: primary.firstName || secondary.firstName,
    lastName: primary.lastName || secondary.lastName,
    confidence: Math.max(a.confidence, b.confidence)
  };
};

const dedupeRowsByStudentNumber = (data: OCRStudentRow[]): OCRStudentRow[] => {
  const map = new Map<string, { row: OCRStudentRow; index: number }>();
  const output: OCRStudentRow[] = [];

  data.forEach((row) => {
    const key = normalizeStudentNumber(row.studentNumber);
    if (!key) {
      output.push(row);
      return;
    }

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { row, index: output.length });
      output.push(row);
      return;
    }

    const merged = mergeStudentRows(existing.row, row);
    map.set(key, { row: merged, index: existing.index });
    output[existing.index] = merged;
  });

  return output;
};

export default function OCRScanner({
  defaultClassName,
  defaultGrade,
  defaultSubject,
  defaultAcademicYear,
  defaultSchoolName,
  defaultTeacherName,
  onApplyStudents,
  onAppendStudents,
  onClose
}: OCRScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [result, setResult] = useState<OCRScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [savingClass, setSavingClass] = useState(false);
  const [saveNotice, setSaveNotice] = useState<SaveNotice>(null);
  const [applyNotice, setApplyNotice] = useState<ApplyNotice>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [loadingPdfInfo, setLoadingPdfInfo] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [preserveScores, setPreserveScores] = useState(true);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    let active = true;
    getApiKey()
      .then((key) => {
        if (active) {
          setHasApiKey(Boolean(key));
        }
      })
      .catch(() => {
        if (active) {
          setHasApiKey(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setClassName((prev) => prev || defaultClassName || '');
    setGrade((prev) => prev || defaultGrade || '');
    setSubject((prev) => prev || defaultSubject || '');
    setAcademicYear((prev) => prev || defaultAcademicYear || '');
    setSchoolName((prev) => prev || defaultSchoolName || '');
    setTeacherName((prev) => prev || defaultTeacherName || '');
  }, [defaultClassName, defaultGrade, defaultSubject, defaultAcademicYear, defaultSchoolName, defaultTeacherName]);

  const canAnalyze = useMemo(
    () => Boolean(file) && (!isPdf || !loadingPdfInfo),
    [file, isPdf, loadingPdfInfo]
  );
  const rows = result?.extractedData.students ?? [];
  const isPdf = file?.type === 'application/pdf' || file?.name?.toLowerCase().endsWith('.pdf');
  const visibleRows = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index }))
        .filter((item) => (showSelectedOnly ? selectedRows.has(item.index) : true)),
    [rows, selectedRows, showSelectedOnly]
  );

  useEffect(() => {
    if (!file || !isPdf) {
      setPdfPageCount(null);
      setPdfPage(1);
      setLoadingPdfInfo(false);
      return;
    }

    let active = true;
    setLoadingPdfInfo(true);
    getPdfPageCount(file)
      .then((count) => {
        if (!active) return;
        setPdfPageCount(count);
        setPdfPage(1);
      })
      .catch((pdfError) => {
        console.error('PDF sayfa sayisi okunamadi:', pdfError);
        if (!active) return;
        setPdfPageCount(null);
      })
      .finally(() => {
        if (active) setLoadingPdfInfo(false);
      });

    return () => {
      active = false;
    };
  }, [file, isPdf]);

  useEffect(() => {
    if (!rows.length) {
      setSelectedRows(new Set());
      return;
    }
    const all = new Set<number>();
    rows.forEach((_, index) => all.add(index));
    setSelectedRows(all);
  }, [rows]);

  const csvData = useMemo(() => {
    if (!rows.length) return '';
    const header = ['Row', 'StudentNumber', 'FirstName', 'LastName', 'Confidence'];
    const escapeCsv = (value: string | number | undefined) => {
      const text = value === undefined ? '' : String(value);
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };
    const lines = rows.map((row) => [
      escapeCsv(row.rowNumber),
      escapeCsv(row.studentNumber),
      escapeCsv(row.firstName),
      escapeCsv(row.lastName),
      escapeCsv(row.confidence.toFixed(1))
    ]);
    return [header, ...lines].map((line) => line.join(',')).join('\n');
  }, [rows]);

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('processing');
    setError(null);
    setResult(null);
    setApplyNotice(null);

    const response = await analyzeImageWithOCR(file, isPdf ? { pdfPage } : undefined);
    if (!response.success || !response.data) {
      setError(response.error || 'OCR işlemi başarısız oldu.');
      setStatus('failed');
      return;
    }

    setResult(response.data);
    setStatus('completed');
  };

  const buildStudentsFromRows = (data: OCRStudentRow[]): Student[] =>
    dedupeRowsByStudentNumber(data)
      .sort((a, b) => a.rowNumber - b.rowNumber)
      .map((row, index) => {
        const fullName = `${row.firstName} ${row.lastName}`.trim();
        const name = fullName || row.studentNumber || `Öğrenci ${row.rowNumber || index + 1}`;
        return {
          id: `${Date.now()}-${index}`,
          name,
          scores: {},
          student_number: row.studentNumber
        };
      });

  const getSelectedRows = () => rows.filter((_, index) => selectedRows.has(index));

  const toggleRowSelection = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!rows.length) return;
    setSelectedRows((prev) => {
      if (prev.size === rows.length) {
        return new Set();
      }
      const next = new Set<number>();
      rows.forEach((_, index) => next.add(index));
      return next;
    });
  };

  const handleSaveClass = async () => {
    if (!result) return;
    const selected = getSelectedRows();
    const students = buildStudentsFromRows(selected).map((student) => student.name);

    if (!className.trim()) {
      setSaveNotice({ type: 'error', message: 'Sınıf adı boş olamaz.' });
      return;
    }
    if (!grade.trim()) {
      setSaveNotice({ type: 'error', message: 'Sınıf kademesi seçilmelidir.' });
      return;
    }
    if (!subject.trim()) {
      setSaveNotice({ type: 'error', message: 'Ders seçilmelidir.' });
      return;
    }
    if (students.length === 0) {
      setSaveNotice({ type: 'error', message: 'Kaydedilecek öğrenci bulunamadı.' });
      return;
    }

    setSavingClass(true);
    setSaveNotice(null);
    try {
      const saved = await classListService.create({
        grade: grade.trim(),
        subject: subject.trim(),
        className: className.trim(),
        schoolName: schoolName.trim(),
        teacherName: teacherName.trim(),
        academicYear: academicYear.trim() || getDefaultAcademicYear(),
        students
      });

      if (saved?.source === 'local') {
        setSaveNotice({
          type: 'success',
          message: 'Sınıf listesi tarayıcıya kaydedildi. İnternet geldiğinde veritabanına aktarılabilir.'
        });
      } else if (saved) {
        setSaveNotice({ type: 'success', message: 'Sınıf listesi başarıyla kaydedildi.' });
      } else {
        setSaveNotice({ type: 'error', message: 'Sınıf listesi kaydedilemedi.' });
      }
    } catch (saveError) {
      console.error('OCR sınıf kaydetme hatası:', saveError);
      setSaveNotice({ type: 'error', message: 'Sınıf listesi kaydedilirken hata oluştu.' });
    } finally {
      setSavingClass(false);
    }
  };

  const handleApplyToStudents = () => {
    if (!onApplyStudents) {
      setApplyNotice({ type: 'error', message: 'Öğrenci listesine uygulama desteği bulunamadı.' });
      return;
    }
    const selected = getSelectedRows();
    if (selected.length === 0) {
      setApplyNotice({ type: 'error', message: 'Seçili öğrenci bulunamadı.' });
      return;
    }
    const mapped = buildStudentsFromRows(selected);
    onApplyStudents(mapped, { preserveScores });
    setApplyNotice({ type: 'success', message: 'Öğrenci listesi uygulandı.' });
    onClose?.();
  };

  const handleAppendSelected = () => {
    if (!onAppendStudents) {
      setApplyNotice({ type: 'error', message: 'Öğrenci ekleme desteği bulunamadı.' });
      return;
    }
    const selected = getSelectedRows();
    if (selected.length === 0) {
      setApplyNotice({ type: 'error', message: 'Seçili öğrenci bulunamadı.' });
      return;
    }
    const mapped = buildStudentsFromRows(selected);
    onAppendStudents(mapped, { preserveScores });
    setApplyNotice({ type: 'success', message: 'Seçili öğrenciler eklendi.' });
    onClose?.();
  };

  const handleDownloadCsv = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-extract-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">OCR Tarama (Beta)</h3>
            <p className="text-sm text-slate-500 mt-1">
              Optik okuma ile sınıf listesi ve notları otomatik tanımlama.
            </p>
          </div>
          {hasApiKey === null && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
              Kontrol ediliyor
            </span>
          )}
          {hasApiKey === false && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
              Gemini API gerekli
            </span>
          )}
          {hasApiKey === true && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
              Hazır
            </span>
          )}
        </div>

        <div className="mt-6 border-2 border-dashed border-slate-200 rounded-xl p-6">
          <label className="block text-sm font-bold text-slate-600 mb-2">
            Tarama Görseli Yükle
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors text-sm font-medium">
              <Upload className="w-4 h-4" />
              Dosya Seç
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                  setStatus(selected ? 'ready' : 'idle');
                  setError(null);
                  setResult(null);
                  setSaveNotice(null);
                  setApplyNotice(null);
                }}
              />
            </label>
            <span className="text-xs text-slate-500">
              JPG, PNG veya PDF yükleyin.
            </span>
          </div>
          {isPdf && (
            <p className="mt-3 text-xs text-slate-500">
              PDF taramasında seçilen sayfa analiz edilir.
            </p>
          )}
        </div>

        {previewUrl && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Önizleme</p>
                <div className="aspect-video rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                  {isPdf ? (
                    <object data={previewUrl} type="application/pdf" className="w-full h-full">
                      <p className="text-xs text-slate-500">PDF önizleme desteklenmiyor.</p>
                    </object>
                  ) : (
                  <img src={previewUrl} alt="OCR preview" className="max-h-full object-contain" />
                )}
              </div>
              {isPdf && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span>Sayfa</span>
                  {loadingPdfInfo && <span>yükleniyor...</span>}
                  {!loadingPdfInfo && pdfPageCount && (
                    <>
                      <select
                        value={pdfPage}
                        onChange={(e) => setPdfPage(Number(e.target.value))}
                        className="border border-slate-200 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                      >
                        {Array.from({ length: pdfPageCount }, (_, index) => (
                          <option key={`page-${index + 1}`} value={index + 1}>
                            {index + 1}
                          </option>
                        ))}
                      </select>
                      <span>/ {pdfPageCount}</span>
                    </>
                  )}
                  {!loadingPdfInfo && !pdfPageCount && (
                    <span>Sayfa sayisi okunamadi</span>
                  )}
                </div>
              )}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Durum</p>
                {status === 'processing' && (
                  <div className="flex items-center text-slate-600 text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    OCR işleniyor...
                  </div>
                )}
                {status === 'completed' && (
                  <div className="flex items-center text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    OCR tamamlandı.
                  </div>
                )}
                {status === 'failed' && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    OCR başarısız.
                  </div>
                )}
                {status === 'ready' && (
                  <div className="flex items-center text-indigo-600 text-sm">
                    <FileImage className="w-4 h-4 mr-2" />
                    Dosya hazır.
                  </div>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || status === 'processing'}
                className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'processing' ? 'Analiz Ediliyor...' : 'OCR Analizi Başlat'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start">
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-md font-bold text-slate-800">Çıktı Özeti</h4>
              <p className="text-sm text-slate-500">
                {rows.length} satır tespit edildi. Seçili: {selectedRows.size}. Güven skoru: %{result.confidenceScore.toFixed(1)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Yeni eklenen öğrencilerin notları boş kalır.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleApplyToStudents}
                disabled={selectedRows.size === 0 || !onApplyStudents}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Öğrenci Listesine Uygula
              </button>
              <button
                onClick={handleAppendSelected}
                disabled={selectedRows.size === 0 || !onAppendStudents}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Seçilenleri Ekle
              </button>
              <button
                onClick={handleDownloadCsv}
                disabled={!rows.length}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                CSV İndir
              </button>
            </div>
          </div>
          {applyNotice && (
            <div
              className={`mt-3 text-xs font-semibold px-3 py-2 rounded-lg border ${
                applyNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {applyNotice.message}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preserveScores}
                onChange={(e) => setPreserveScores(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Mevcut notları koru (eşleşen öğrencilerde)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSelectedOnly}
                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Sadece seçilenleri göster
            </label>
          </div>
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
            {rows.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">
                Tablo satırı tespit edilemedi. Görsel netliğini kontrol edin.
              </div>
            ) : (
              <div className="max-h-72 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">
                        <input
                          type="checkbox"
                          checked={rows.length > 0 && selectedRows.size === rows.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          aria-label="Tümünü seç"
                        />
                      </th>
                      <th className="px-4 py-2 text-left font-semibold">Satır</th>
                      <th className="px-4 py-2 text-left font-semibold">Öğrenci No</th>
                      <th className="px-4 py-2 text-left font-semibold">Ad</th>
                      <th className="px-4 py-2 text-left font-semibold">Soyad</th>
                      <th className="px-4 py-2 text-left font-semibold">Güven</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-slate-500" colSpan={6}>
                          Seçili kayıt bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      visibleRows.map(({ row, index }) => (
                        <tr key={`${row.rowNumber}-${row.studentNumber ?? index}`}>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(index)}
                              onChange={() => toggleRowSelection(index)}
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              aria-label={`Satır ${row.rowNumber} seç`}
                            />
                          </td>
                          <td className="px-4 py-2">{row.rowNumber}</td>
                          <td className="px-4 py-2">{row.studentNumber || '-'}</td>
                          <td className="px-4 py-2">{row.firstName || '-'}</td>
                          <td className="px-4 py-2">{row.lastName || '-'}</td>
                          <td className="px-4 py-2">%{row.confidence.toFixed(1)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
            <div>
              <h5 className="text-sm font-bold text-slate-700">Sınıf Listesi Kaydet</h5>
              <p className="text-xs text-slate-500">OCR ile yakalanan öğrenci listesini sınıf olarak saklayın.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Sınıf Adı</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  placeholder="Örn: 5/A"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Akademik Yıl</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  placeholder="2025-2026"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Sınıf Kademesi</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="5">5. Sınıf</option>
                  <option value="6">6. Sınıf</option>
                  <option value="7">7. Sınıf</option>
                  <option value="8">8. Sınıf</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Ders</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="İngilizce">İngilizce</option>
                  <option value="Matematik">Matematik</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="Fen Bilimleri">Fen Bilimleri</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Okul Adı</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  placeholder="Okul adı"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Öğretmen Adı</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  placeholder="Öğretmen adı"
                />
              </div>
            </div>
            {saveNotice && (
              <div
                className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
                  saveNotice.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {saveNotice.message}
              </div>
            )}
            <button
              onClick={handleSaveClass}
              disabled={savingClass || rows.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {savingClass ? 'Kaydediliyor...' : 'Sınıf Listesini Kaydet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
