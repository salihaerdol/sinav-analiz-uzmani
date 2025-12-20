export type OCRStatus = 'idle' | 'ready' | 'processing' | 'completed' | 'failed';

export interface OCRStudentRow {
  rowNumber: number;
  studentNumber?: string;
  firstName: string;
  lastName: string;
  confidence: number;
}

export interface OCRScanResult {
  id: string;
  status: OCRStatus;
  confidenceScore: number;
  extractedData: {
    students: OCRStudentRow[];
  };
  rawText?: string;
}
