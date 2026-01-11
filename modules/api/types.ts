// =====================================================
// MODÜL: API SERVİSİ - TYPE TANIMLARI
// =====================================================

/**
 * API Yanıt wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    meta?: {
        page?: number;
        pageSize?: number;
        totalItems?: number;
        totalPages?: number;
    };
}

/**
 * Sayfalama parametreleri
 */
export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * API istek durumu
 */
export interface ApiRequestState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

/**
 * API endpoint tanımı
 */
export interface ApiEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requiresAuth: boolean;
    rateLimit?: number;  // istek/dakika
}

/**
 * API Hata Kodları
 */
export type ApiErrorCode =
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR';

/**
 * API Endpoint haritası
 */
export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: { path: '/auth/login', method: 'POST' as const, requiresAuth: false },
    AUTH_LOGOUT: { path: '/auth/logout', method: 'POST' as const, requiresAuth: true },
    AUTH_REFRESH: { path: '/auth/refresh', method: 'POST' as const, requiresAuth: false },
    AUTH_ME: { path: '/auth/me', method: 'GET' as const, requiresAuth: true },

    // Users
    USERS_LIST: { path: '/users', method: 'GET' as const, requiresAuth: true },
    USERS_GET: { path: '/users/:id', method: 'GET' as const, requiresAuth: true },
    USERS_CREATE: { path: '/users', method: 'POST' as const, requiresAuth: true },
    USERS_UPDATE: { path: '/users/:id', method: 'PUT' as const, requiresAuth: true },
    USERS_DELETE: { path: '/users/:id', method: 'DELETE' as const, requiresAuth: true },

    // Exams
    EXAMS_LIST: { path: '/exams', method: 'GET' as const, requiresAuth: true },
    EXAMS_GET: { path: '/exams/:id', method: 'GET' as const, requiresAuth: true },
    EXAMS_CREATE: { path: '/exams', method: 'POST' as const, requiresAuth: true },
    EXAMS_UPDATE: { path: '/exams/:id', method: 'PUT' as const, requiresAuth: true },
    EXAMS_DELETE: { path: '/exams/:id', method: 'DELETE' as const, requiresAuth: true },
    EXAMS_ANALYZE: { path: '/exams/:id/analyze', method: 'POST' as const, requiresAuth: true },

    // Questions
    QUESTIONS_LIST: { path: '/questions', method: 'GET' as const, requiresAuth: true },
    QUESTIONS_GET: { path: '/questions/:id', method: 'GET' as const, requiresAuth: true },
    QUESTIONS_CREATE: { path: '/questions', method: 'POST' as const, requiresAuth: true },
    QUESTIONS_UPDATE: { path: '/questions/:id', method: 'PUT' as const, requiresAuth: true },
    QUESTIONS_DELETE: { path: '/questions/:id', method: 'DELETE' as const, requiresAuth: true },
    QUESTIONS_SEARCH: { path: '/questions/search', method: 'POST' as const, requiresAuth: true },

    // Students
    STUDENTS_LIST: { path: '/students', method: 'GET' as const, requiresAuth: true },
    STUDENTS_GET: { path: '/students/:id', method: 'GET' as const, requiresAuth: true },
    STUDENTS_PROGRESS: { path: '/students/:id/progress', method: 'GET' as const, requiresAuth: true },
    STUDENTS_RISK: { path: '/students/:id/risk', method: 'GET' as const, requiresAuth: true },

    // Reports
    REPORTS_LIST: { path: '/reports', method: 'GET' as const, requiresAuth: true },
    REPORTS_GENERATE: { path: '/reports/generate', method: 'POST' as const, requiresAuth: true },
    REPORTS_EXPORT: { path: '/reports/:id/export', method: 'GET' as const, requiresAuth: true },
    REPORTS_TEMPLATES: { path: '/reports/templates', method: 'GET' as const, requiresAuth: true },

    // Analytics
    ANALYTICS_DASHBOARD: { path: '/analytics/dashboard', method: 'GET' as const, requiresAuth: true },
    ANALYTICS_BENCHMARK: { path: '/analytics/benchmark', method: 'GET' as const, requiresAuth: true },
    ANALYTICS_TRENDS: { path: '/analytics/trends', method: 'GET' as const, requiresAuth: true },

    // AI
    AI_ANALYZE: { path: '/ai/analyze', method: 'POST' as const, requiresAuth: true, rateLimit: 10 },
    AI_SUGGESTIONS: { path: '/ai/suggestions', method: 'POST' as const, requiresAuth: true, rateLimit: 20 },
    AI_BLOOM_TAG: { path: '/ai/bloom-tag', method: 'POST' as const, requiresAuth: true, rateLimit: 30 },
} as const;
