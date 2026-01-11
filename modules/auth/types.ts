// =====================================================
// MODÜL: YETKİLENDİRME - ROL VE İZİN TANIMLARI
// =====================================================

/**
 * Kullanıcı rolleri
 */
export type UserRole =
    | 'owner'        // Kurucu/Sahip - Tam yetki
    | 'admin'        // Yönetici - Geniş yetki
    | 'principal'    // Okul müdürü
    | 'coordinator'  // Bölüm koordinatörü
    | 'teacher'      // Öğretmen
    | 'parent'       // Veli
    | 'student';     // Öğrenci

/**
 * İzin türleri
 */
export type Permission =
    // Sınav yönetimi
    | 'exam:create'
    | 'exam:read'
    | 'exam:update'
    | 'exam:delete'
    | 'exam:analyze'
    | 'exam:export'

    // Öğrenci yönetimi
    | 'student:create'
    | 'student:read'
    | 'student:update'
    | 'student:delete'
    | 'student:view_scores'
    | 'student:view_all'      // Tüm öğrencileri görme
    | 'student:view_own'      // Sadece kendi (öğrenci için)
    | 'student:view_child'    // Sadece çocuğu (veli için)

    // Rapor yönetimi
    | 'report:create'
    | 'report:read'
    | 'report:export'
    | 'report:template_manage'

    // Dashboard
    | 'dashboard:admin'
    | 'dashboard:teacher'
    | 'dashboard:parent'
    | 'dashboard:student'

    // Kullanıcı yönetimi
    | 'user:create'
    | 'user:read'
    | 'user:update'
    | 'user:delete'
    | 'user:assign_role'

    // Sistem ayarları
    | 'settings:read'
    | 'settings:update'
    | 'settings:organization';

/**
 * Rol tanımları ve varsayılan izinler
 */
export const ROLE_DEFINITIONS: Record<UserRole, {
    label: string;
    description: string;
    level: number; // Hiyerarşi seviyesi (yüksek = daha yetkili)
    permissions: Permission[];
    color: string;
    icon: string;
}> = {
    owner: {
        label: 'Kurucu',
        description: 'Tam yetki - Tüm işlemler',
        level: 100,
        permissions: [
            'exam:create', 'exam:read', 'exam:update', 'exam:delete', 'exam:analyze', 'exam:export',
            'student:create', 'student:read', 'student:update', 'student:delete', 'student:view_scores', 'student:view_all',
            'report:create', 'report:read', 'report:export', 'report:template_manage',
            'dashboard:admin', 'dashboard:teacher',
            'user:create', 'user:read', 'user:update', 'user:delete', 'user:assign_role',
            'settings:read', 'settings:update', 'settings:organization'
        ],
        color: '#7C3AED',
        icon: 'Crown'
    },
    admin: {
        label: 'Yönetici',
        description: 'Geniş yetki - Kullanıcı ve sistem yönetimi',
        level: 90,
        permissions: [
            'exam:create', 'exam:read', 'exam:update', 'exam:delete', 'exam:analyze', 'exam:export',
            'student:create', 'student:read', 'student:update', 'student:delete', 'student:view_scores', 'student:view_all',
            'report:create', 'report:read', 'report:export', 'report:template_manage',
            'dashboard:admin', 'dashboard:teacher',
            'user:create', 'user:read', 'user:update', 'user:assign_role',
            'settings:read', 'settings:update'
        ],
        color: '#DC2626',
        icon: 'Shield'
    },
    principal: {
        label: 'Müdür',
        description: 'Okul geneli görüntüleme ve raporlama',
        level: 80,
        permissions: [
            'exam:read', 'exam:analyze', 'exam:export',
            'student:read', 'student:view_scores', 'student:view_all',
            'report:create', 'report:read', 'report:export',
            'dashboard:admin',
            'user:read',
            'settings:read'
        ],
        color: '#0891B2',
        icon: 'Building2'
    },
    coordinator: {
        label: 'Koordinatör',
        description: 'Bölüm/branş bazlı yönetim',
        level: 70,
        permissions: [
            'exam:create', 'exam:read', 'exam:update', 'exam:analyze', 'exam:export',
            'student:read', 'student:view_scores', 'student:view_all',
            'report:create', 'report:read', 'report:export',
            'dashboard:admin', 'dashboard:teacher',
            'user:read'
        ],
        color: '#059669',
        icon: 'Users'
    },
    teacher: {
        label: 'Öğretmen',
        description: 'Kendi sınıflarını yönetme',
        level: 50,
        permissions: [
            'exam:create', 'exam:read', 'exam:update', 'exam:analyze', 'exam:export',
            'student:create', 'student:read', 'student:update', 'student:view_scores',
            'report:create', 'report:read', 'report:export', 'report:template_manage',
            'dashboard:teacher'
        ],
        color: '#2563EB',
        icon: 'GraduationCap'
    },
    parent: {
        label: 'Veli',
        description: 'Sadece kendi çocuğunun verileri',
        level: 20,
        permissions: [
            'exam:read',
            'student:view_child', 'student:view_scores',
            'report:read',
            'dashboard:parent'
        ],
        color: '#D97706',
        icon: 'Heart'
    },
    student: {
        label: 'Öğrenci',
        description: 'Sadece kendi verileri',
        level: 10,
        permissions: [
            'exam:read',
            'student:view_own', 'student:view_scores',
            'report:read',
            'dashboard:student'
        ],
        color: '#10B981',
        icon: 'User'
    }
};

/**
 * Kullanıcı profili ile rol bilgisi
 */
export interface UserWithRole {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: UserRole;
    organization_id?: string;
    permissions: Permission[];
    created_at: string;
    last_login?: string;
}

/**
 * Organizasyon yapısı
 */
export interface Organization {
    id: string;
    name: string;
    type: 'İlkokul' | 'Ortaokul' | 'Lise' | 'Kolej' | 'Dershane';
    logo_url?: string;
    subscription_plan: 'free' | 'starter' | 'pro' | 'enterprise';
    owner_id: string;
    settings: Record<string, unknown>;
    created_at: string;
}

/**
 * Kullanıcı-Organizasyon ilişkisi
 */
export interface UserOrganizationRole {
    id: string;
    user_id: string;
    organization_id: string;
    role: UserRole;
    permissions: Permission[];
    is_active: boolean;
    created_at: string;
}
