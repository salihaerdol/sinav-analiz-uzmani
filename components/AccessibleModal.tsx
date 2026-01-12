// =====================================================
// BİLEŞEN: ERİŞİLEBİLİR MODAL
// WCAG 2.1 AA standartlarına uygun modal bileşeni
// =====================================================

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface AccessibleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnEscape?: boolean;
    closeOnBackdrop?: boolean;
    ariaDescribedBy?: string;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
};

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnEscape = true,
    closeOnBackdrop = true,
    ariaDescribedBy
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // ESC tuşu ile kapatma
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (closeOnEscape && event.key === 'Escape') {
            event.preventDefault();
            onClose();
        }

        // Tab tuşu ile focus trap
        if (event.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement?.focus();
            }
        }
    }, [closeOnEscape, onClose]);

    // Backdrop tıklama
    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose();
        }
    }, [closeOnBackdrop, onClose]);

    // Modal açıldığında focus yönetimi
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';

            // İlk focuslanabilir elemente odaklan
            setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                focusableElements?.[0]?.focus();
            }, 50);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.body.style.overflow = '';
                previousActiveElement.current?.focus();
            };
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={ariaDescribedBy}
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2
                        id={titleId}
                        className="text-lg font-bold text-slate-800"
                    >
                        {title}
                    </h2>
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Modalı kapat"
                            type="button"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Icon-only buton için erişilebilir wrapper
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label: string;
    variant?: 'default' | 'danger' | 'success' | 'primary';
    size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
    default: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
    danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50',
    success: 'text-slate-400 hover:text-green-600 hover:bg-green-50',
    primary: 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
};

const sizeButtonClasses = {
    sm: 'min-w-[36px] min-h-[36px] p-1.5',
    md: 'min-w-[44px] min-h-[44px] p-2',
    lg: 'min-w-[52px] min-h-[52px] p-3'
};

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    label,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    return (
        <button
            {...props}
            className={`
                ${sizeButtonClasses[size]}
                ${variantClasses[variant]}
                rounded-lg transition-colors flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${className}
            `.trim()}
            aria-label={label}
            title={label}
            type="button"
        >
            <span aria-hidden="true">{icon}</span>
        </button>
    );
};

/**
 * Loading durumu için erişilebilir spinner
 */
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const spinnerSizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    label = 'Yükleniyor'
}) => {
    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="flex flex-col items-center justify-center"
        >
            <div
                className={`${spinnerSizes[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}
                aria-hidden="true"
            />
            <span className="sr-only">{label}</span>
        </div>
    );
};

/**
 * Screen reader only text
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="sr-only">{children}</span>
);

/**
 * Bildirim için erişilebilir live region
 */
interface LiveRegionProps {
    message: string;
    type?: 'polite' | 'assertive';
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
    message,
    type = 'polite'
}) => {
    return (
        <div
            role="status"
            aria-live={type}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
};

export default AccessibleModal;
