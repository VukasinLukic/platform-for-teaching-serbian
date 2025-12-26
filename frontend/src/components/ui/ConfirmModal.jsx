import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, type = 'warning' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-12 h-12 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onCancel}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-[#1A1A1A] py-3 px-6 rounded-full font-bold hover:bg-gray-200 transition-all"
            >
              Откажи
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 text-white py-3 px-6 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#D62828] hover:bg-[#B91F1F]'
              }`}
            >
              Потврди
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
