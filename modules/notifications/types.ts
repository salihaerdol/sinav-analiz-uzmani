// =====================================================
// MODÜL: BİLDİRİM SİSTEMİ - TYPE TANIMLARI
// =====================================================

import React from 'react';

/**
 * Bildirim türleri
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Bildirim konumu
 */
export type NotificationPosition =
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center';

/**
 * Bildirim veri yapısı
 */
export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;  // ms, 0 = süresiz
    dismissible?: boolean;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    createdAt: number;
}

/**
 * Bildirim oluşturma seçenekleri
 */
export interface NotificationOptions {
    title?: string;
    duration?: number;
    dismissible?: boolean;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

/**
 * Uygulama bildirimi (kalıcı)
 */
export interface AppNotification {
    id: string;
    type: 'message' | 'alert' | 'reminder' | 'announcement';
    title: string;
    body: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

/**
 * Bildirim context değeri
 */
export interface NotificationContextValue {
    notifications: Notification[];

    // Toast bildirimleri
    success: (message: string, options?: NotificationOptions) => string;
    error: (message: string, options?: NotificationOptions) => string;
    warning: (message: string, options?: NotificationOptions) => string;
    info: (message: string, options?: NotificationOptions) => string;

    // Yönetim
    dismiss: (id: string) => void;
    dismissAll: () => void;

    // Ayarlar
    position: NotificationPosition;
    setPosition: (position: NotificationPosition) => void;
}

/**
 * Bildirim merkezi context değeri
 */
export interface NotificationCenterContextValue {
    notifications: AppNotification[];
    unreadCount: number;

    // Yönetim
    add: (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    remove: (id: string) => void;
    clear: () => void;
}
