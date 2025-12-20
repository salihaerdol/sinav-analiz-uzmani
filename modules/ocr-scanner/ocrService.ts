import { OCRScanResult } from './types';

export interface OCRResponse {
  success: boolean;
  data?: OCRScanResult;
  error?: string;
}

export async function analyzeImageWithOCR(_file: File): Promise<OCRResponse> {
  console.warn('OCR service is not configured yet.');
  return {
    success: false,
    error: 'OCR servisi henüz yapılandırılmadı. API anahtarı ve servis kurulumu gereklidir.'
  };
}
