export interface LearningOutcome {
  code: string;
  description: string;
}

export interface QuestionConfig {
  id: number;
  order: number;
  maxScore: number;
  outcome: LearningOutcome;
  cognitiveLevel?: 'Bilgi' | 'Kavrama' | 'Uygulama' | 'Analiz' | 'Sentez' | 'Değerlendirme';
  difficulty?: 'Kolay' | 'Orta' | 'Zor';
}

export interface Student {
  id: string;
  student_number?: string;
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

// ==================== YENİ TIPLER - GELİŞİM TAKİP SİSTEMİ ====================

/**
 * Kaydedilmiş analiz - tüm verileri içerir
 */
export interface SavedAnalysis {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: ExamMetadata;
  analysis: AnalysisResult;
  questions: QuestionConfig[];
  students: Student[];
  aiSummary?: string;
  notes?: string;
  tags?: string[];
}

/**
 * Öğrenci gelişim kaydı
 */
export interface StudentProgress {
  studentId: string;
  studentName: string;
  className: string;
  examHistory: {
    analysisId: string;
    date: string;
    subject: string;
    examType: string;
    score: number;
    percentage: number;
    classAverage: number;
    rank: number;
    totalStudents: number;
  }[];
  outcomeProgress: {
    outcomeCode: string;
    outcomeDescription: string;
    history: {
      date: string;
      successRate: number;
    }[];
  }[];
  overallTrend: 'improving' | 'stable' | 'declining';
  averagePercentage: number;
}

/**
 * Sınıf gelişim kaydı
 */
export interface ClassProgress {
  className: string;
  subject: string;
  examHistory: {
    analysisId: string;
    date: string;
    examType: string;
    classAverage: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    studentCount: number;
  }[];
  outcomeProgress: {
    outcomeCode: string;
    outcomeDescription: string;
    history: {
      date: string;
      successRate: number;
      isFailed: boolean;
    }[];
  }[];
  overallTrend: 'improving' | 'stable' | 'declining';
}

/**
 * Dashboard özet verileri
 */
export interface DashboardSummary {
  totalAnalyses: number;
  totalStudents: number;
  totalClasses: number;
  recentAnalyses: SavedAnalysis[];
  topPerformingStudents: {
    name: string;
    className: string;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  classPerformance: {
    className: string;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  weakOutcomes: {
    code: string;
    description: string;
    averageSuccessRate: number;
    frequency: number;
  }[];
}
