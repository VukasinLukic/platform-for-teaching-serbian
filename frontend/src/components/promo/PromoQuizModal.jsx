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
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Затвори"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
        </button>

        {/* Content - Scrollable */}
        <div className="px-5 py-6 md:px-10 md:py-12 text-center overflow-y-auto">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
            <GraduationCap className="w-7 h-7 md:w-10 md:h-10 text-white" />
          </div>

          <h2 className="text-xl md:text-3xl font-bold text-[#1A1A1A] mb-3 md:mb-4">
            Тестирајте своје знање бесплатно!
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mb-4 md:mb-6 max-w-lg mx-auto leading-relaxed">
            Решите 20 питања из српског језика и књижевности и проверите колико сте спремни за малу матуру.
            На крају добијате код за попуст који можете искористити при уплати курса.
          </p>

          {/* 20% Discount Highlight */}
          <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-xl p-4 md:p-5 mb-5 md:mb-8 max-w-md mx-auto shadow-lg">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-1 md:mb-2">
              <Gift className="w-5 h-5 md:w-7 md:h-7 text-[#F2C94C]" />
              <span className="text-2xl md:text-4xl font-black text-white">20% ПОПУСТ</span>
            </div>
            <p className="text-white/90 text-xs md:text-sm">
              на било који курс ако урадите квиз до краја!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center mb-4">
            <button
              onClick={handleStartQuiz}
              className="px-6 py-3 md:px-8 md:py-4 bg-[#D62828] text-white rounded-lg font-bold hover:bg-[#B91F1F] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base md:text-lg"
            >
              Почни квиз <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 md:px-8 md:py-4 border-2 border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-all text-base"
            >
              Не хвала
            </button>
          </div>

          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Квиз можете покренути касније путем дугмета у доњем левом углу.
          </p>
        </div>
      </div>
    </div>
  );
}
