import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Потврдите акцију',
  message,
  confirmText = 'Потврди',
  cancelText = 'Откажи',
  variant = 'warning',
  confirmButtonClass = ''
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'info':
        return <Info className="w-12 h-12 text-blue-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    }
  };

  const getConfirmButtonClass = () => {
    if (confirmButtonClass) return confirmButtonClass;
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">{getIcon()}</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{title}</h2>
            {message && <p className="text-gray-600 whitespace-pre-line">{message}</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 text-[#1A1A1A] rounded-xl font-bold hover:bg-gray-200 transition-all">
              {cancelText}
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className={'flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all ' + getConfirmButtonClass()}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
