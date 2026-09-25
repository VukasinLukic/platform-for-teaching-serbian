import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Generic Modal Component
 * Design: clean modal with backdrop blur, brand tokens
 * Usage: <Modal isOpen={isOpen} onClose={handleClose} title="Modal Title">Content</Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  footer = null,
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  const modalWidth = sizeClasses[size] || sizeClasses.md;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      {...(title ? { 'aria-labelledby': 'modal-title' } : { 'aria-label': 'Дијалог' })}
    >
      <div
        className={`relative w-full ${modalWidth} bg-white rounded-3xl shadow-lift max-h-[90vh] overflow-hidden animate-slideUp`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between z-10">
          {title && (
            <h2
              id="modal-title"
              className="font-display text-xl sm:text-2xl font-bold text-ink"
            >
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-full text-ink-600 hover:bg-ink-50 hover:text-ink transition-colors duration-200"
              aria-label="Затвори прозор"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-paper-50 border-t border-ink-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Variant
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Потврда',
  message,
  confirmText = 'Потврди',
  cancelText = 'Откажи',
  variant = 'primary', // primary, danger, success
}) => {
  const variantClasses = {
    primary: 'bg-brand hover:bg-brand-700',
    danger: 'bg-danger hover:bg-danger-700',
    success: 'bg-success hover:bg-success-700',
  };

  const buttonClass = variantClasses[variant] || variantClasses.primary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-ink-700 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="h-11 px-5 border border-ink-200 rounded-xl font-semibold text-ink hover:bg-ink-50 transition-colors duration-200"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`h-11 px-5 rounded-xl font-semibold text-white shadow-sm transition-colors duration-200 ${buttonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
