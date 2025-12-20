import { GoogleGenAI, createPartFromBase64 } from '@google/genai';
import { getApiKey } from '../../services/geminiService';
import { userApiKeyService } from '../../services/userApiKeyService';
import { OCRScanResult, OCRStudentRow } from './types';

export interface OCRResponse {
  success: boolean;
  data?: OCRScanResult;
  error?: string;
}

const OCR_MODEL = 'gemini-2.0-flash';

const PROMPT = `
Bir OCR sistemi olarak sadece JSON döndür. Kesinlikle açıklama, markdown veya ek metin ekleme.

Görseldeki öğrenci listesi tablosunu çıkar ve aşağıdaki formatta ver:
{
  "students": [
    {
      "rowNumber": 1,
      "studentNumber": "12345",
      "firstName": "Ayse",
      "lastName": "Yilmaz",
      "confidence": 92
    }
  ]
}

Kurallar:
- "confidence" 0-100 arası sayı olmalı.
- Öğrenci numarası yoksa "studentNumber" alanını boş bırak.
- İsimleri mümkünse doğru biçimde ayır (ad/soyad).
- Tablo dışındaki metinleri dahil etme.
`.trim();

const SUPPORTED_IMAGE_PREFIX = 'image/';

const decodeErrors = [
  'API_KEY_INVALID',
  '401',
  '403',
  'permission',
  'unauthorized'
];

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `ocr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function resolveMimeType(file: File): string {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1);
  }
  if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
    return text.trim();
  }
  return null;
}

function extractStudentRows(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;
    const students = record.students ?? record.rows;
    if (Array.isArray(students)) {
      return students;
    }
    const data = record.data;
    if (data && typeof data === 'object') {
      const dataRecord = data as Record<string, unknown>;
      if (Array.isArray(dataRecord.students)) {
        return dataRecord.students;
      }
    }
  }
  return [];
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(',', '.'));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

function normalizeStudentRow(row: Record<string, unknown>, index: number): OCRStudentRow | null {
  const rowNumberValue = toNumber(row.rowNumber ?? row.row ?? row.index);
  const rowNumber = rowNumberValue ? Math.max(1, Math.round(rowNumberValue)) : index + 1;

  const studentNumberRaw = toText(row.studentNumber ?? row.student_no ?? row.number ?? row.no);
  let firstName = toText(row.firstName ?? row.first_name);
  let lastName = toText(row.lastName ?? row.last_name);

  if (!firstName && !lastName) {
    const fullName = toText(row.fullName ?? row.name ?? row.studentName);
    if (fullName) {
      const parts = fullName.split(/\s+/);
      firstName = parts.shift() || '';
      lastName = parts.join(' ');
    }
  }

  const confidenceRaw = toNumber(row.confidence ?? row.score ?? row.confidenceScore);
  let confidence = confidenceRaw ?? 0;
  if (confidence <= 1) {
    confidence *= 100;
  }
  confidence = Math.max(0, Math.min(100, confidence));

  if (!studentNumberRaw && !firstName && !lastName) {
    return null;
  }

  return {
    rowNumber,
    studentNumber: studentNumberRaw || undefined,
    firstName,
    lastName,
    confidence
  };
}

function computeConfidenceScore(rows: OCRStudentRow[]): number {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + row.confidence, 0);
  return total / rows.length;
}

function parseOCRResponse(text: string): { students: OCRStudentRow[] } | null {
  const jsonBlock = extractJsonBlock(text);
  if (!jsonBlock) return null;
  try {
    const parsed = JSON.parse(jsonBlock) as unknown;
    const rows = extractStudentRows(parsed);
    const normalized = rows
      .map((row, index) => (row && typeof row === 'object' ? normalizeStudentRow(row as Record<string, unknown>, index) : null))
      .filter((row): row is OCRStudentRow => Boolean(row));
    return { students: normalized };
  } catch (error) {
    console.warn('OCR JSON parse failed:', error);
    return null;
  }
}

export async function analyzeImageWithOCR(file: File): Promise<OCRResponse> {
  if (!file) {
    return { success: false, error: 'Dosya bulunamadı.' };
  }

  const mimeType = resolveMimeType(file);
  if (mimeType === 'application/pdf') {
    return { success: false, error: 'PDF desteği henüz eklenmedi. Lütfen görsel yükleyin.' };
  }

  if (!mimeType.startsWith(SUPPORTED_IMAGE_PREFIX)) {
    return { success: false, error: 'Sadece görsel dosyaları destekleniyor.' };
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API anahtarı bulunamadı. Ayarlar bölümünden API anahtarı ekleyin.'
    };
  }

  let base64: string;
  try {
    base64 = await fileToBase64(file);
  } catch (error) {
    console.error('OCR dosya okunamadı:', error);
    return { success: false, error: 'Dosya okunamadı. Lütfen tekrar deneyin.' };
  }

  try {
    await userApiKeyService.incrementAiRequestCount();
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = createPartFromBase64(base64, mimeType);

    const response = await ai.models.generateContent({
      model: OCR_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: PROMPT }, imagePart]
        }
      ]
    });

    const rawText = response.text || '';
    const parsed = parseOCRResponse(rawText);

    if (!parsed) {
      return {
        success: false,
        error: 'OCR yanıtı okunamadı. Görsel netliğini kontrol edip tekrar deneyin.'
      };
    }

    const confidenceScore = computeConfidenceScore(parsed.students);
    return {
      success: true,
      data: {
        id: createId(),
        status: 'completed',
        confidenceScore,
        extractedData: {
          students: parsed.students
        },
        rawText
      }
    };
  } catch (error: any) {
    const message = String(error?.message || error || '');
    const isAuthError = decodeErrors.some((token) => message.toLowerCase().includes(token.toLowerCase()));
    if (isAuthError) {
      return { success: false, error: 'API anahtarı geçersiz veya yetkisiz.' };
    }
    if (message.includes('quota') || message.includes('429')) {
      return { success: false, error: 'API kullanım kotası doldu. Daha sonra tekrar deneyin.' };
    }
    console.error('OCR Gemini error:', error);
    return { success: false, error: 'OCR işlemi sırasında bir hata oluştu.' };
  }
}
