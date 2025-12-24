import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Generic Modal Component
 * Design: Clean modal with backdrop blur, following Nauči Srpski design system
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`relative w-full ${modalWidth} bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden animate-slideUp`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          {title && (
            <h2
              id="modal-title"
              className="text-2xl font-bold text-[#003366]"
            >
              {title}
            </h2>
          )}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
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
  title = 'Potvrda',
  message,
  confirmText = 'Potvrdi',
  cancelText = 'Otkaži',
  variant = 'primary', // primary, danger, success
}) => {
  const variantClasses = {
    primary: 'bg-[#FF6B35] hover:bg-[#E55A28]',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-[#BFECC9] hover:bg-[#9DD6AC] text-[#003366]',
  };

  const buttonClass = variantClasses[variant] || variantClasses.primary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-2.5 rounded-full font-semibold text-white shadow-lg transition-all duration-200 ${buttonClass}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
