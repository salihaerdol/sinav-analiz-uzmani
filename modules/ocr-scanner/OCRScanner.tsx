import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, FileImage, Loader2, Upload } from 'lucide-react';
import { analyzeImageWithOCR } from './ocrService';
import { OCRScanResult, OCRStatus } from './types';

export default function OCRScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [result, setResult] = useState<OCRScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canAnalyze = useMemo(() => Boolean(file), [file]);

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('processing');
    setError(null);
    setResult(null);

    const response = await analyzeImageWithOCR(file);
    if (!response.success || !response.data) {
      setError(response.error || 'OCR işlemi başarısız oldu.');
      setStatus('failed');
      return;
    }

    setResult(response.data);
    setStatus('completed');
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
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            Yapılandırma Gerekiyor
          </span>
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
                }}
              />
            </label>
            <span className="text-xs text-slate-500">
              JPG, PNG veya PDF yükleyin.
            </span>
          </div>
        </div>

        {previewUrl && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Önizleme</p>
              <div className="aspect-video rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                <img src={previewUrl} alt="OCR preview" className="max-h-full object-contain" />
              </div>
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
          <h4 className="text-md font-bold text-slate-800 mb-3">Çıktı Özeti</h4>
          <p className="text-sm text-slate-500">
            {result.extractedData.students.length} satır tespit edildi. Güven skoru: %{result.confidenceScore.toFixed(1)}
          </p>
        </div>
      )}
    </div>
  );
}
