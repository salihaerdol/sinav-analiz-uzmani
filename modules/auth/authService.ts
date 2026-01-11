// =====================================================
// MODÜL: YETKİLENDİRME - SERVİS
// =====================================================

import {
    UserRole,
    Permission,
    ROLE_DEFINITIONS,
    UserWithRole,
    UserOrganizationRole
} from './types';

/**
 * Kullanıcının belirli bir izne sahip olup olmadığını kontrol eder
 */
export function hasPermission(user: UserWithRole | null, permission: Permission): boolean {
    if (!user) return false;
    return user.permissions.includes(permission);
}

/**
 * Kullanıcının birden fazla izinden herhangi birine sahip olup olmadığını kontrol eder
 */
export function hasAnyPermission(user: UserWithRole | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.some(p => user.permissions.includes(p));
}

/**
 * Kullanıcının tüm izinlere sahip olup olmadığını kontrol eder
 */
export function hasAllPermissions(user: UserWithRole | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.every(p => user.permissions.includes(p));
}

/**
 * Rol seviyesine göre karşılaştırma (daha yüksek seviye = daha yetkili)
 */
export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
    const userLevel = ROLE_DEFINITIONS[userRole]?.level || 0;
    const requiredLevel = ROLE_DEFINITIONS[requiredRole]?.level || 0;
    return userLevel >= requiredLevel;
}

/**
 * Sadece daha düşük seviyedeki kullanıcıları yönetebilir
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = ROLE_DEFINITIONS[managerRole]?.level || 0;
    const targetLevel = ROLE_DEFINITIONS[targetRole]?.level || 0;
    return managerLevel > targetLevel;
}

/**
 * Rol için varsayılan izinleri getir
 */
export function getDefaultPermissions(role: UserRole): Permission[] {
    return ROLE_DEFINITIONS[role]?.permissions || [];
}

/**
 * Rol bilgilerini getir
 */
export function getRoleInfo(role: UserRole) {
    return ROLE_DEFINITIONS[role] || null;
}

/**
 * Tüm rolleri listele (seviyeye göre sıralı)
 */
export function getAllRoles(): { role: UserRole; info: typeof ROLE_DEFINITIONS[UserRole] }[] {
    return (Object.entries(ROLE_DEFINITIONS) as [UserRole, typeof ROLE_DEFINITIONS[UserRole]][])
        .map(([role, info]) => ({ role, info }))
        .sort((a, b) => b.info.level - a.info.level);
}

/**
 * Kullanıcının atayabileceği rolleri getir
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
    const userLevel = ROLE_DEFINITIONS[userRole]?.level || 0;
    return (Object.entries(ROLE_DEFINITIONS) as [UserRole, typeof ROLE_DEFINITIONS[UserRole]][])
        .filter(([_, info]) => info.level < userLevel)
        .map(([role]) => role);
}

/**
 * Belirli bir dashboard'a erişim kontrolü
 */
export function canAccessDashboard(
    user: UserWithRole | null,
    dashboardType: 'admin' | 'teacher' | 'parent' | 'student'
): boolean {
    if (!user) return false;

    const requiredPermission = `dashboard:${dashboardType}` as Permission;
    return hasPermission(user, requiredPermission);
}

/**
 * Öğrenci verilerine erişim kontrolü
 */
export function canViewStudentData(
    user: UserWithRole | null,
    studentId: string,
    studentGuardianIds?: string[] // Velinin çocukları
): boolean {
    if (!user) return false;

    // Kendi verilerini görüntüleme (öğrenci)
    if (hasPermission(user, 'student:view_own') && user.id === studentId) {
        return true;
    }

    // Çocuğunun verilerini görüntüleme (veli)
    if (hasPermission(user, 'student:view_child') && studentGuardianIds?.includes(user.id)) {
        return true;
    }

    // Tüm öğrencileri görüntüleme (öğretmen, yönetici)
    if (hasPermission(user, 'student:view_all')) {
        return true;
    }

    return false;
}

/**
 * Sınav işlemleri için yetki kontrolü
 */
export function canPerformExamAction(
    user: UserWithRole | null,
    action: 'create' | 'read' | 'update' | 'delete' | 'analyze' | 'export'
): boolean {
    if (!user) return false;
    return hasPermission(user, `exam:${action}` as Permission);
}

/**
 * Rapor işlemleri için yetki kontrolü
 */
export function canPerformReportAction(
    user: UserWithRole | null,
    action: 'create' | 'read' | 'export' | 'template_manage'
): boolean {
    if (!user) return false;
    return hasPermission(user, `report:${action}` as Permission);
}

/**
 * Kullanıcı için erişilebilir menü öğelerini belirle
 */
export function getAccessibleMenuItems(user: UserWithRole | null): string[] {
    if (!user) return [];

    const menuItems: string[] = ['home'];

    // Sınav menüsü
    if (hasAnyPermission(user, ['exam:create', 'exam:read'])) {
        menuItems.push('exams');
    }

    // Öğrenci menüsü
    if (hasAnyPermission(user, ['student:view_all', 'student:view_child', 'student:view_own'])) {
        menuItems.push('students');
    }

    // Rapor menüsü
    if (hasPermission(user, 'report:read')) {
        menuItems.push('reports');
    }

    // Analiz menüsü
    if (hasPermission(user, 'exam:analyze')) {
        menuItems.push('analysis');
    }

    // Admin dashboard
    if (hasPermission(user, 'dashboard:admin')) {
        menuItems.push('admin-dashboard');
    }

    // Ayarlar
    if (hasAnyPermission(user, ['settings:read', 'settings:update'])) {
        menuItems.push('settings');
    }

    // Kullanıcı yönetimi
    if (hasPermission(user, 'user:read')) {
        menuItems.push('users');
    }

    return menuItems;
}

/**
 * Demo kullanıcı oluştur (test için)
 */
export function createDemoUser(role: UserRole, overrides?: Partial<UserWithRole>): UserWithRole {
    const roleInfo = ROLE_DEFINITIONS[role];

    return {
        id: `demo-${role}-${Date.now()}`,
        email: `${role}@demo.com`,
        name: `Demo ${roleInfo.label}`,
        role,
        permissions: roleInfo.permissions,
        created_at: new Date().toISOString(),
        ...overrides
    };
}

/**
 * Kullanıcı rolüne göre varsayılan dashboard yönlendirmesi
 */
export function getDefaultDashboardRoute(role: UserRole): string {
    switch (role) {
        case 'owner':
        case 'admin':
        case 'principal':
            return '/admin-dashboard';
        case 'coordinator':
        case 'teacher':
            return '/dashboard';
        case 'parent':
            return '/parent-dashboard';
        case 'student':
            return '/student-dashboard';
        default:
            return '/';
    }
}

/**
 * Yetki hatası mesajı oluştur
 */
export function getPermissionDeniedMessage(permission: Permission): string {
    const permissionLabels: Record<string, string> = {
        'exam:create': 'sınav oluşturma',
        'exam:read': 'sınav görüntüleme',
        'exam:update': 'sınav güncelleme',
        'exam:delete': 'sınav silme',
        'exam:analyze': 'sınav analizi',
        'exam:export': 'sınav dışa aktarma',
        'student:view_all': 'tüm öğrencileri görme',
        'student:view_scores': 'puanları görme',
        'report:create': 'rapor oluşturma',
        'report:export': 'rapor dışa aktarma',
        'dashboard:admin': 'yönetici paneli',
        'user:create': 'kullanıcı oluşturma',
        'settings:update': 'ayar güncelleme'
    };

    const label = permissionLabels[permission] || permission;
    return `Bu işlem için ${label} yetkiniz bulunmamaktadır.`;
}
