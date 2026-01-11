// =====================================================
// MODÜL: API SERVİSİ - CORE CLIENT
// =====================================================

import { ApiResponse, ApiErrorCode, PaginationParams } from './types';

// ═══════════════════════════════════════════════════════════════
// KONFİGÜRASYON
// ═══════════════════════════════════════════════════════════════

interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retryCount: number;
    retryDelay: number;
}

const DEFAULT_CONFIG: ApiConfig = {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
    retryCount: 3,
    retryDelay: 1000
};

let config = { ...DEFAULT_CONFIG };

export function setApiConfig(newConfig: Partial<ApiConfig>): void {
    config = { ...config, ...newConfig };
}

export function getApiConfig(): ApiConfig {
    return { ...config };
}

// ═══════════════════════════════════════════════════════════════
// TOKEN YÖNETİMİ
// ═══════════════════════════════════════════════════════════════

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh?: string): void {
    accessToken = access;
    if (refresh) refreshToken = refresh;

    // LocalStorage'a da kaydet
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
}

export function getAccessToken(): string | null {
    if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
    }
    return accessToken;
}

export function clearTokens(): void {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

// ═══════════════════════════════════════════════════════════════
// HTTP CLIENT
// ═══════════════════════════════════════════════════════════════

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
    pagination?: PaginationParams;
}

/**
 * URL parametrelerini yerleştir (örn. /users/:id -> /users/123)
 */
function interpolateUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    if (!params) return url;

    let result = url;
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            result = result.replace(`:${key}`, String(value));
        }
    });
    return result;
}

/**
 * Query string oluştur
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>, pagination?: PaginationParams): string {
    const queryParams = new URLSearchParams();

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && !key.startsWith(':')) {
                queryParams.append(key, String(value));
            }
        });
    }

    if (pagination) {
        queryParams.append('page', String(pagination.page));
        queryParams.append('pageSize', String(pagination.pageSize));
        if (pagination.sortBy) queryParams.append('sortBy', pagination.sortBy);
        if (pagination.sortOrder) queryParams.append('sortOrder', pagination.sortOrder);
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Hata işleme
 */
function handleApiError(status: number, message?: string): { code: ApiErrorCode; message: string } {
    switch (status) {
        case 401:
            return { code: 'UNAUTHORIZED', message: message || 'Oturum süresi doldu' };
        case 403:
            return { code: 'FORBIDDEN', message: message || 'Bu işlem için yetkiniz yok' };
        case 404:
            return { code: 'NOT_FOUND', message: message || 'Kaynak bulunamadı' };
        case 422:
            return { code: 'VALIDATION_ERROR', message: message || 'Doğrulama hatası' };
        case 429:
            return { code: 'RATE_LIMIT_EXCEEDED', message: message || 'Çok fazla istek gönderdiniz' };
        default:
            if (status >= 500) {
                return { code: 'SERVER_ERROR', message: message || 'Sunucu hatası' };
            }
            return { code: 'NETWORK_ERROR', message: message || 'Bağlantı hatası' };
    }
}

/**
 * Ana API istek fonksiyonu
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const {
        method = 'GET',
        body,
        params,
        headers = {},
        requiresAuth = true,
        pagination
    } = options;

    // URL oluştur
    const interpolatedUrl = interpolateUrl(endpoint, params);
    const queryString = buildQueryString(params, pagination);
    const fullUrl = `${config.baseUrl}${interpolatedUrl}${queryString}`;

    // Headers
    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
    };

    // Auth token ekle
    if (requiresAuth) {
        const token = getAccessToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    // Request options
    const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        credentials: 'include'
    };

    if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(fullUrl, fetchOptions);

        // JSON parse et
        let data: T | undefined;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            data = await response.json();
        }

        // Başarılı yanıt
        if (response.ok) {
            return {
                success: true,
                data
            };
        }

        // Hata yanıtı
        const error = handleApiError(response.status, (data as Record<string, string>)?.message);
        return {
            success: false,
            error
        };

    } catch (err) {
        // Ağ hatası
        return {
            success: false,
            error: {
                code: 'NETWORK_ERROR',
                message: err instanceof Error ? err.message : 'Bağlantı hatası'
            }
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// KISA YOL FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

export async function get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: 'GET', params: params as Record<string, string> });
}

export async function post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: 'POST', body });
}

export async function put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: 'PUT', body });
}

export async function patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export function useApi<T>() {
    const [state, setState] = useState<{
        data: T | null;
        loading: boolean;
        error: string | null;
    }>({
        data: null,
        loading: false,
        error: null
    });

    const execute = useCallback(async (
        endpoint: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const response = await apiRequest<T>(endpoint, options);

        if (response.success) {
            setState({ data: response.data || null, loading: false, error: null });
        } else {
            setState({ data: null, loading: false, error: response.error?.message || 'Bir hata oluştu' });
        }

        return response;
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset
    };
}
