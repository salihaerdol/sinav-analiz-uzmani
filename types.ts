export interface LearningOutcome {
  code: string;
  description: string;
}

export interface QuestionConfig {
  id: number;
  order: number;
  maxScore: number;
  outcome: LearningOutcome;
}

export interface Student {
  id: string;
  name: string;
  scores: Record<number, number>; // questionId -> score
}

export interface ExamMetadata {
  grade: string;
  subject: string;
  scenario: string;
  schoolName: string;
  teacherName: string;
  academicYear: string;
  className: string;
  date: string;
  // New fields for professional reporting
  term: '1' | '2'; // Dönem (1. Dönem / 2. Dönem)
  examNumber: string; // Sınav numarası (1, 2, 3, etc.)
  examType: 'Yazılı' | 'Sözlü' | 'Performans' | 'Proje'; // Sınav türü
  district?: string; // İlçe
  province?: string; // İl
  schoolType?: 'İlkokul' | 'Ortaokul' | 'Lise'; // Okul türü
}

export interface AnalysisResult {
  questionStats: {
    questionId: number;
    averageScore: number;
    successRate: number;
    outcome: LearningOutcome;
  }[];
  outcomeStats: {
    code: string;
    description: string;
    successRate: number;
    isFailed: boolean; // e.g. < 50% or 70%
  }[];
  studentStats: {
    studentId: string;
    totalScore: number;
    percentage: number;
  }[];
  classAverage: number;
  totalQuestions: number;
}
