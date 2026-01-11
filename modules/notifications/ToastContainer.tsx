// =====================================================
// MODÜL: BİLDİRİM SİSTEMİ - TOAST BİLEŞENLERİ
// =====================================================

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification, NotificationPosition } from './types';
import { useNotifications } from './NotificationContext';

// ═══════════════════════════════════════════════════════════════
// TEK BİLDİRİM
// ═══════════════════════════════════════════════════════════════

const Toast: React.FC<{
    notification: Notification;
    onDismiss: (id: string) => void;
}> = ({ notification, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 200);
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-rose-50 border-rose-200 text-rose-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconStyles = {
        success: 'text-emerald-500',
        error: 'text-rose-500',
        warning: 'text-amber-500',
        info: 'text-blue-500'
    };

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm
                transform transition-all duration-200
                ${styles[notification.type]}
                ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
            `}
            role="alert"
        >
            <span className={iconStyles[notification.type]}>
                {notification.icon || icons[notification.type]}
            </span>

            <div className="flex-1 min-w-0">
                {notification.title && (
                    <div className="font-semibold mb-0.5">{notification.title}</div>
                )}
                <div className="text-sm">{notification.message}</div>

                {notification.action && (
                    <button
                        onClick={() => {
                            notification.action?.onClick();
                            handleDismiss();
                        }}
                        className="mt-2 text-sm font-medium underline hover:no-underline"
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>

            {notification.dismissible && (
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TOAST CONTAINER
// ═══════════════════════════════════════════════════════════════

export const ToastContainer: React.FC = () => {
    const { notifications, dismiss, position } = useNotifications();

    const positionClasses: Record<NotificationPosition, string> = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
    };

    if (notifications.length === 0) return null;

    return (
        <div className={`fixed z-50 ${positionClasses[position]} flex flex-col gap-3`}>
            {notifications.map(notification => (
                <Toast
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismiss}
                />
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// BASİT TOAST FONKSİYONLARI (Context dışı kullanım için)
// ═══════════════════════════════════════════════════════════════

let toastRef: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
} | null = null;

export const setToastRef = (ref: typeof toastRef) => {
    toastRef = ref;
};

export const toast = {
    success: (message: string) => toastRef?.success(message),
    error: (message: string) => toastRef?.error(message),
    warning: (message: string) => toastRef?.warning(message),
    info: (message: string) => toastRef?.info(message)
};

export default ToastContainer;
