import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Notification System
 * Design: Clean toast notifications with Nauči Srpski brand colors
 * Usage:
 *   1. Wrap app with <ToastProvider>
 *   2. Use const { showToast } = useToast() in components
 *   3. Call showToast({ type: 'success', message: 'Uspešno!' })
 */

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    ({ type = 'info', message, duration = 4000, title = null }) => {
      const id = Date.now() + Math.random();
      const newToast = { id, type, message, title };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast = ({ id, type, message, title, onClose }) => {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-[#BFECC9]',
      textColor: 'text-[#003366]',
      iconColor: 'text-[#003366]',
      borderColor: 'border-[#9DD6AC]',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    info: {
      icon: Info,
      bgColor: 'bg-[#42A5F5]/10',
      textColor: 'text-[#003366]',
      iconColor: 'text-[#42A5F5]',
      borderColor: 'border-[#42A5F5]/30',
    },
  };

  const { icon: Icon, bgColor, textColor, iconColor, borderColor } =
    config[type] || config.info;

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-2xl shadow-2xl p-4 flex items-start gap-3 min-w-[320px] animate-slideInRight`}
      role="alert"
    >
      <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        {title && (
          <p className={`font-bold ${textColor} mb-1`}>{title}</p>
        )}
        <p className={`${textColor} text-sm`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 transition-opacity p-1 rounded-full`}
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

// Convenience functions for direct usage
export const toast = {
  success: (message, options = {}) => {
    // This will be used with useToast hook
    console.log('Toast success:', message);
  },
  error: (message, options = {}) => {
    console.log('Toast error:', message);
  },
  warning: (message, options = {}) => {
    console.log('Toast warning:', message);
  },
  info: (message, options = {}) => {
    console.log('Toast info:', message);
  },
};

export default Toast;
