import { useCallback, useMemo } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { showToast as appToast } from '../../utils/toast';

/**
 * Compatibility adapter over the app's single toast system (utils/toast.js,
 * react-hot-toast; <Toaster /> lives in App.jsx).
 *
 * Usage (unchanged for existing callers):
 *   const { showToast } = useToast();
 *   showToast({ type: 'success', message: 'Успешно!' });
 *
 * Toasts shown this way are also saved to notificationStore (admin
 * notification history), as before. New code can import `showToast` from
 * utils/toast directly.
 */

const TYPES = ['success', 'error', 'warning', 'info'];

export const useToast = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  const showToast = useCallback(
    ({ type = 'info', message, title = null, saveToHistory = true }) => {
      const kind = TYPES.includes(type) ? type : 'info';
      const text = title ? `${title}: ${message}` : message;
      if (saveToHistory) {
        addNotification({ type: kind, message, title });
      }
      return appToast[kind](text);
    },
    [addNotification]
  );

  const removeToast = useCallback((id) => appToast.dismiss(id), []);

  return useMemo(() => ({ showToast, removeToast }), [showToast, removeToast]);
};

// Kept for backwards compatibility: rendering happens in the global <Toaster />.
export const ToastProvider = ({ children }) => children;

export const toast = {
  success: (message) => appToast.success(message),
  error: (message) => appToast.error(message),
  warning: (message) => appToast.warning(message),
  info: (message) => appToast.info(message),
};

export default ToastProvider;
