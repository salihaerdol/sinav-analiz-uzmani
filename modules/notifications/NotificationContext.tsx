// =====================================================
// MODÜL: BİLDİRİM SİSTEMİ - TOAST CONTEXT
// =====================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
    Notification,
    NotificationOptions,
    NotificationType,
    NotificationPosition,
    NotificationContextValue
} from './types';

// ═══════════════════════════════════════════════════════════════
// VARSAYILAN DEĞERLER
// ═══════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 5000; // 5 saniye
const MAX_NOTIFICATIONS = 5;

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

interface NotificationProviderProps {
    children: React.ReactNode;
    defaultPosition?: NotificationPosition;
    maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    defaultPosition = 'top-right',
    maxNotifications = MAX_NOTIFICATIONS
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [position, setPosition] = useState<NotificationPosition>(defaultPosition);

    // ID oluşturucu
    const generateId = useCallback(() => {
        return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Bildirim ekle
    const addNotification = useCallback((
        type: NotificationType,
        message: string,
        options?: NotificationOptions
    ): string => {
        const id = generateId();

        const notification: Notification = {
            id,
            type,
            message,
            title: options?.title,
            duration: options?.duration ?? DEFAULT_DURATION,
            dismissible: options?.dismissible ?? true,
            icon: options?.icon,
            action: options?.action,
            createdAt: Date.now()
        };

        setNotifications(prev => {
            const newNotifications = [notification, ...prev];
            // Maksimum sayıyı aşanları kaldır
            return newNotifications.slice(0, maxNotifications);
        });

        // Otomatik kaldırma
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, notification.duration);
        }

        return id;
    }, [generateId, maxNotifications]);

    // Kaldır
    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Tümünü kaldır
    const dismissAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Kısayol fonksiyonlar
    const success = useCallback((message: string, options?: NotificationOptions) => {
        return addNotification('success', message, options);
    }, [addNotification]);

    const error = useCallback((message: string, options?: NotificationOptions) => {
        return addNotification('error', message, { duration: 8000, ...options });
    }, [addNotification]);

    const warning = useCallback((message: string, options?: NotificationOptions) => {
        return addNotification('warning', message, { duration: 6000, ...options });
    }, [addNotification]);

    const info = useCallback((message: string, options?: NotificationOptions) => {
        return addNotification('info', message, options);
    }, [addNotification]);

    const value = useMemo<NotificationContextValue>(() => ({
        notifications,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll,
        position,
        setPosition
    }), [notifications, success, error, warning, info, dismiss, dismissAll, position]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useNotifications(): NotificationContextValue {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

/**
 * Kısayol hook - sadece toast fonksiyonları
 */
export function useToast() {
    const { success, error, warning, info, dismiss, dismissAll } = useNotifications();
    return { success, error, warning, info, dismiss, dismissAll };
}
