// =====================================================
// MODÜL: API SERVİSİ - İŞ MANTIĞI SERVİSLERİ
// =====================================================

import { apiRequest, get, post, put, del } from './apiClient';
import { ApiResponse, API_ENDPOINTS, PaginationParams } from './types';

// ═══════════════════════════════════════════════════════════════
// AUTH SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
        post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN.path, data),

    logout: (): Promise<ApiResponse<void>> =>
        post<void>(API_ENDPOINTS.AUTH_LOGOUT.path),

    me: (): Promise<ApiResponse<LoginResponse['user']>> =>
        get<LoginResponse['user']>(API_ENDPOINTS.AUTH_ME.path),

    refresh: (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> =>
        post<{ accessToken: string }>(API_ENDPOINTS.AUTH_REFRESH.path, { refreshToken })
};

// ═══════════════════════════════════════════════════════════════
// SINAV SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface Exam {
    id: string;
    title: string;
    subject: string;
    grade: number;
    date: string;
    questionCount: number;
    studentCount: number;
    averageScore?: number;
    status: 'draft' | 'active' | 'completed';
}

export interface ExamDetail extends Exam {
    questions: Array<{
        id: string;
        text: string;
        correctAnswer: string;
        points: number;
    }>;
    scores: Array<{
        studentId: string;
        studentName: string;
        score: number;
        answers: number[];
    }>;
}

export interface CreateExamRequest {
    title: string;
    subject: string;
    grade: number;
    date?: string;
    questions: Array<{
        text: string;
        correctAnswer: string;
        points: number;
    }>;
}

export const examService = {
    list: (pagination?: PaginationParams): Promise<ApiResponse<Exam[]>> =>
        apiRequest<Exam[]>(API_ENDPOINTS.EXAMS_LIST.path, { pagination }),

    get: (id: string): Promise<ApiResponse<ExamDetail>> =>
        get<ExamDetail>(API_ENDPOINTS.EXAMS_GET.path, { id }),

    create: (data: CreateExamRequest): Promise<ApiResponse<Exam>> =>
        post<Exam>(API_ENDPOINTS.EXAMS_CREATE.path, data),

    update: (id: string, data: Partial<CreateExamRequest>): Promise<ApiResponse<Exam>> =>
        put<Exam>(API_ENDPOINTS.EXAMS_UPDATE.path.replace(':id', id), data),

    delete: (id: string): Promise<ApiResponse<void>> =>
        del<void>(API_ENDPOINTS.EXAMS_DELETE.path.replace(':id', id)),

    analyze: (id: string): Promise<ApiResponse<{ analysisId: string }>> =>
        post<{ analysisId: string }>(API_ENDPOINTS.EXAMS_ANALYZE.path.replace(':id', id))
};

// ═══════════════════════════════════════════════════════════════
// SORU SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface Question {
    id: string;
    text: string;
    type: string;
    subject: string;
    grade: number;
    bloomLevel: string;
    difficulty: string;
    tags: string[];
    usageCount: number;
    averageSuccessRate?: number;
}

export interface QuestionSearchRequest {
    subject?: string;
    grade?: number;
    bloomLevel?: string;
    difficulty?: string;
    tags?: string[];
    searchText?: string;
}

export const questionService = {
    list: (pagination?: PaginationParams): Promise<ApiResponse<Question[]>> =>
        apiRequest<Question[]>(API_ENDPOINTS.QUESTIONS_LIST.path, { pagination }),

    get: (id: string): Promise<ApiResponse<Question>> =>
        get<Question>(API_ENDPOINTS.QUESTIONS_GET.path, { id }),

    create: (data: Omit<Question, 'id' | 'usageCount' | 'averageSuccessRate'>): Promise<ApiResponse<Question>> =>
        post<Question>(API_ENDPOINTS.QUESTIONS_CREATE.path, data),

    update: (id: string, data: Partial<Question>): Promise<ApiResponse<Question>> =>
        put<Question>(API_ENDPOINTS.QUESTIONS_UPDATE.path.replace(':id', id), data),

    delete: (id: string): Promise<ApiResponse<void>> =>
        del<void>(API_ENDPOINTS.QUESTIONS_DELETE.path.replace(':id', id)),

    search: (filters: QuestionSearchRequest): Promise<ApiResponse<Question[]>> =>
        post<Question[]>(API_ENDPOINTS.QUESTIONS_SEARCH.path, filters)
};

// ═══════════════════════════════════════════════════════════════
// ÖĞRENCİ SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface Student {
    id: string;
    name: string;
    studentNumber: string;
    className: string;
    grade: number;
    averageScore: number;
    examCount: number;
}

export interface StudentProgress {
    studentId: string;
    examHistory: Array<{
        examId: string;
        examTitle: string;
        date: string;
        score: number;
    }>;
    subjectScores: Record<string, number>;
    trend: 'up' | 'down' | 'stable';
}

export interface StudentRisk {
    studentId: string;
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    factors: string[];
    recommendations: string[];
}

export const studentService = {
    list: (pagination?: PaginationParams): Promise<ApiResponse<Student[]>> =>
        apiRequest<Student[]>(API_ENDPOINTS.STUDENTS_LIST.path, { pagination }),

    get: (id: string): Promise<ApiResponse<Student>> =>
        get<Student>(API_ENDPOINTS.STUDENTS_GET.path, { id }),

    getProgress: (id: string): Promise<ApiResponse<StudentProgress>> =>
        get<StudentProgress>(API_ENDPOINTS.STUDENTS_PROGRESS.path.replace(':id', id)),

    getRisk: (id: string): Promise<ApiResponse<StudentRisk>> =>
        get<StudentRisk>(API_ENDPOINTS.STUDENTS_RISK.path.replace(':id', id))
};

// ═══════════════════════════════════════════════════════════════
// RAPOR SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface Report {
    id: string;
    title: string;
    type: string;
    examId?: string;
    createdAt: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface ReportGenerateRequest {
    examId: string;
    templateId?: string;
    options?: Record<string, boolean>;
}

export const reportService = {
    list: (pagination?: PaginationParams): Promise<ApiResponse<Report[]>> =>
        apiRequest<Report[]>(API_ENDPOINTS.REPORTS_LIST.path, { pagination }),

    generate: (data: ReportGenerateRequest): Promise<ApiResponse<Report>> =>
        post<Report>(API_ENDPOINTS.REPORTS_GENERATE.path, data),

    export: (id: string, format: 'pdf' | 'docx' | 'xlsx'): Promise<ApiResponse<{ url: string }>> =>
        get<{ url: string }>(API_ENDPOINTS.REPORTS_EXPORT.path.replace(':id', id), { format }),

    getTemplates: (): Promise<ApiResponse<Array<{ id: string; name: string }>>> =>
        get<Array<{ id: string; name: string }>>(API_ENDPOINTS.REPORTS_TEMPLATES.path)
};

// ═══════════════════════════════════════════════════════════════
// ANALİTİK SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface DashboardData {
    kpis: {
        totalStudents: number;
        totalExams: number;
        averageScore: number;
        passRate: number;
    };
    recentExams: Exam[];
    topPerformers: Student[];
    riskStudents: Student[];
}

export interface BenchmarkData {
    schoolScore: number;
    nationalAverage: number;
    pisaLevel: number;
    timssBenchmark: string;
}

export const analyticsService = {
    getDashboard: (): Promise<ApiResponse<DashboardData>> =>
        get<DashboardData>(API_ENDPOINTS.ANALYTICS_DASHBOARD.path),

    getBenchmark: (examId?: string): Promise<ApiResponse<BenchmarkData>> =>
        get<BenchmarkData>(API_ENDPOINTS.ANALYTICS_BENCHMARK.path, { examId }),

    getTrends: (period: 'week' | 'month' | 'year'): Promise<ApiResponse<Array<{ date: string; value: number }>>> =>
        get<Array<{ date: string; value: number }>>(API_ENDPOINTS.ANALYTICS_TRENDS.path, { period })
};

// ═══════════════════════════════════════════════════════════════
// AI SERVİSİ
// ═══════════════════════════════════════════════════════════════

export interface AIAnalysisRequest {
    examId: string;
    options?: {
        includeRecommendations?: boolean;
        includeRiskAnalysis?: boolean;
        language?: 'tr' | 'en';
    };
}

export interface AIAnalysisResponse {
    summary: string;
    insights: string[];
    recommendations: string[];
    riskStudents?: Array<{ id: string; name: string; risk: string }>;
}

export const aiService = {
    analyze: (data: AIAnalysisRequest): Promise<ApiResponse<AIAnalysisResponse>> =>
        post<AIAnalysisResponse>(API_ENDPOINTS.AI_ANALYZE.path, data),

    getSuggestions: (context: string): Promise<ApiResponse<string[]>> =>
        post<string[]>(API_ENDPOINTS.AI_SUGGESTIONS.path, { context }),

    tagBloom: (questionText: string): Promise<ApiResponse<{ level: string; confidence: number }>> =>
        post<{ level: string; confidence: number }>(API_ENDPOINTS.AI_BLOOM_TAG.path, { text: questionText })
};
