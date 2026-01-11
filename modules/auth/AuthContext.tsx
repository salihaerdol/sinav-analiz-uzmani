// =====================================================
// MODÜL: YETKİLENDİRME - REACT CONTEXT VE HOOKS
// =====================================================

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    UserRole,
    Permission,
    UserWithRole,
    ROLE_DEFINITIONS
} from './types';
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessDashboard,
    canViewStudentData,
    canPerformExamAction,
    canPerformReportAction,
    getAccessibleMenuItems,
    getDefaultDashboardRoute,
    getPermissionDeniedMessage,
    createDemoUser
} from './authService';

// ═══════════════════════════════════════════════════════════════
// CONTEXT TANIMLAMALARI
// ═══════════════════════════════════════════════════════════════

interface AuthContextType {
    // Kullanıcı durumu
    user: UserWithRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Rol ve izin kontrolleri
    hasPermission: (permission: Permission) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
    canAccessDashboard: (dashboardType: 'admin' | 'teacher' | 'parent' | 'student') => boolean;
    canViewStudentData: (studentId: string, guardianIds?: string[]) => boolean;
    canPerformExamAction: (action: 'create' | 'read' | 'update' | 'delete' | 'analyze' | 'export') => boolean;
    canPerformReportAction: (action: 'create' | 'read' | 'export' | 'template_manage') => boolean;

    // Yardımcı fonksiyonlar
    getMenuItems: () => string[];
    getDefaultRoute: () => string;
    getRoleInfo: () => typeof ROLE_DEFINITIONS[UserRole] | null;

    // Demo işlemleri (geliştirme için)
    setDemoRole: (role: UserRole) => void;
    clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER BİLEŞENİ
// ═══════════════════════════════════════════════════════════════

interface AuthProviderProps {
    children: ReactNode;
    initialRole?: UserRole;
}

const DEFAULT_ROLE: UserRole = 'teacher';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialRole }) => {
    const effectiveRole = initialRole || DEFAULT_ROLE;
    const [user, setUser] = useState<UserWithRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // İlk yükleme - demo kullanıcı oluştur
    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                // Gerçek uygulamada Supabase auth kontrolü yapılacak
                // Şimdilik demo kullanıcı oluştur
                const demoUser = createDemoUser(effectiveRole);
                setUser(demoUser);
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [effectiveRole]);

    // İzin kontrol fonksiyonları
    const checkPermission = useCallback((permission: Permission) => {
        return hasPermission(user, permission);
    }, [user]);

    const checkAnyPermission = useCallback((permissions: Permission[]) => {
        return hasAnyPermission(user, permissions);
    }, [user]);

    const checkAllPermissions = useCallback((permissions: Permission[]) => {
        return hasAllPermissions(user, permissions);
    }, [user]);

    const checkDashboardAccess = useCallback((dashboardType: 'admin' | 'teacher' | 'parent' | 'student') => {
        return canAccessDashboard(user, dashboardType);
    }, [user]);

    const checkStudentDataAccess = useCallback((studentId: string, guardianIds?: string[]) => {
        return canViewStudentData(user, studentId, guardianIds);
    }, [user]);

    const checkExamAction = useCallback((action: 'create' | 'read' | 'update' | 'delete' | 'analyze' | 'export') => {
        return canPerformExamAction(user, action);
    }, [user]);

    const checkReportAction = useCallback((action: 'create' | 'read' | 'export' | 'template_manage') => {
        return canPerformReportAction(user, action);
    }, [user]);

    // Yardımcı fonksiyonlar
    const getMenuItems = useCallback(() => {
        return getAccessibleMenuItems(user);
    }, [user]);

    const getDefaultRoute = useCallback(() => {
        if (!user) return '/login';
        return getDefaultDashboardRoute(user.role);
    }, [user]);

    const getRoleInfo = useCallback(() => {
        if (!user) return null;
        return ROLE_DEFINITIONS[user.role];
    }, [user]);

    // Demo rol değiştirme
    const setDemoRole = useCallback((role: UserRole) => {
        const demoUser = createDemoUser(role);
        setUser(demoUser);
    }, []);

    const clearUser = useCallback(() => {
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        hasPermission: checkPermission,
        hasAnyPermission: checkAnyPermission,
        hasAllPermissions: checkAllPermissions,
        canAccessDashboard: checkDashboardAccess,
        canViewStudentData: checkStudentDataAccess,
        canPerformExamAction: checkExamAction,
        canPerformReportAction: checkReportAction,
        getMenuItems,
        getDefaultRoute,
        getRoleInfo,
        setDemoRole,
        clearUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Ana auth hook'u
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Sadece kullanıcı bilgisi için hook
 */
export function useUser(): UserWithRole | null {
    const { user } = useAuth();
    return user;
}

/**
 * Sadece rol bilgisi için hook
 */
export function useRole(): UserRole | null {
    const { user } = useAuth();
    return user?.role || null;
}

/**
 * Belirli bir izin kontrolü için hook
 */
export function usePermission(permission: Permission): boolean {
    const { hasPermission } = useAuth();
    return hasPermission(permission);
}

/**
 * Birden fazla izin kontrolü için hook
 */
export function usePermissions(permissions: Permission[], mode: 'any' | 'all' = 'any'): boolean {
    const { hasAnyPermission, hasAllPermissions } = useAuth();
    return mode === 'any' ? hasAnyPermission(permissions) : hasAllPermissions(permissions);
}

// ═══════════════════════════════════════════════════════════════
// GUARD BİLEŞENLERİ
// ═══════════════════════════════════════════════════════════════

interface PermissionGuardProps {
    children: ReactNode;
    permission?: Permission;
    permissions?: Permission[];
    mode?: 'any' | 'all';
    fallback?: ReactNode;
}

/**
 * İzin bazlı içerik gösterimi
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    permission,
    permissions,
    mode = 'any',
    fallback = null
}) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions) {
        hasAccess = mode === 'any'
            ? hasAnyPermission(permissions)
            : hasAllPermissions(permissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: UserRole[];
    fallback?: ReactNode;
}

/**
 * Rol bazlı içerik gösterimi
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    fallback = null
}) => {
    const { user } = useAuth();

    if (!user || !allowedRoles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

// ═══════════════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════════════════════════════

/**
 * İzin hatası gösterimi için hook
 */
export function usePermissionError(permission: Permission): string {
    return getPermissionDeniedMessage(permission);
}
