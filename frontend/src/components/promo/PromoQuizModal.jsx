import { useEffect } from 'react';
import { GraduationCap, ArrowRight, Gift, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromo } from '../../context/PromoContext';

export default function PromoQuizModal() {
  const { showPromoQuiz, setShowPromoQuiz, markPromoSeen } = usePromo();
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPromoQuiz) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPromoQuiz]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showPromoQuiz) handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showPromoQuiz]);

  if (!showPromoQuiz) return null;

  const handleClose = () => {
    markPromoSeen('probniPrijemni');
    setShowPromoQuiz(false);
  };

  const handleStartQuiz = () => {
    markPromoSeen('probniPrijemni');
    setShowPromoQuiz(false);
    navigate('/probni-prijemni');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Затвори"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="px-6 py-10 md:px-10 md:py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-3">
            Пробни пријемни 2025/2026
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Тестирајте своје знање бесплатно!
          </p>
          <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            Решите 20 питања из српског језика и књижевности и проверите колико сте спремни за малу матуру.
            На крају добијате код за попуст који можете искористити при уплати курса.
          </p>

          {/* 20% Discount Highlight */}
          <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-xl p-5 mb-8 max-w-md mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Gift className="w-7 h-7 text-[#F2C94C]" />
              <span className="text-3xl md:text-4xl font-black text-white">20% ПОПУСТ</span>
            </div>
            <p className="text-white/90 text-sm">
              на било који курс ако урадите квиз до краја!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xl font-black text-[#D62828]">20</div>
              <div className="text-xs text-gray-500">питања</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xl font-black text-[#D62828]">попуст</div>
              <div className="text-xs text-gray-500">на крају</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleStartQuiz}
              className="px-8 py-4 bg-[#D62828] text-white rounded-lg font-bold hover:bg-[#B91F1F] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
            >
              Почни квиз <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-all"
            >
              Не хвала
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
