/**
 * The single toast system of the app (react-hot-toast; <Toaster /> is rendered
 * once in App.jsx). `components/ui/Toast` (useToast/ToastProvider) is a thin
 * adapter over this module, kept so existing callers keep working.
 */
import toast from 'react-hot-toast';

const base = {
  position: 'top-right',
  style: {
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: 'bold',
  },
};

const withColor = (background, extra = {}) => ({
  ...base,
  ...extra,
  style: { ...base.style, background },
});

export const showToast = {
  success: (message) =>
    toast.success(message, withColor('#10B981', {
      duration: 4000,
      iconTheme: { primary: '#fff', secondary: '#10B981' },
    })),

  error: (message) =>
    toast.error(message, withColor('#EF4444', {
      duration: 5000,
      iconTheme: { primary: '#fff', secondary: '#EF4444' },
    })),

  warning: (message) =>
    toast(message, withColor('#D97706', { duration: 5000, icon: '⚠️' })),

  loading: (message) => toast.loading(message, withColor('#3B82F6')),

  info: (message) =>
    toast(message, withColor('#3B82F6', { duration: 4000, icon: 'ℹ️' })),

  promise: (promise, messages) =>
    toast.promise(
      promise,
      {
        loading: messages.loading || 'Учитавање...',
        success: messages.success || 'Успешно!',
        error: messages.error || 'Грешка!',
      },
      { position: base.position, style: { padding: '16px', borderRadius: '12px', fontWeight: 'bold' } }
    ),

  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
