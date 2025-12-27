import { useState, useCallback } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Потврди',
    cancelText: 'Откажи',
    variant: 'warning',
    onConfirm: () => {},
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Потврдите акцију',
        message: options.message || '',
        confirmText: options.confirmText || 'Потврди',
        cancelText: options.cancelText || 'Откажи',
        variant: options.variant || 'warning',
        onConfirm: () => {
          resolve(true);
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        },
      });
    });
  }, []);

  const ConfirmDialog = useCallback(() => {
    return (
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    );
  }, [confirmState]);

  return { confirm, ConfirmDialog };
};
