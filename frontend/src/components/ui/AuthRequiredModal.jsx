import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthRequiredModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔐</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-ink mb-3">
            Потребна је пријава
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message || 'Молимо вас да се пријавите или направите налог како бисте наставили.'}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full bg-gradient-to-r from-brand to-brand-700 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all font-bold text-base"
            >
              Пријави се
            </Link>
            <Link
              to="/register"
              className="w-full bg-white border-2 border-brand text-brand px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-bold text-base"
            >
              Направи налог
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-sm text-gray-500 mt-6">
            Региструј се за само 30 секунди! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
