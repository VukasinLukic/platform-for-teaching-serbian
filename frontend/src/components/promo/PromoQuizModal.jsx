import { useEffect } from 'react';
import { GraduationCap, ArrowRight, Gift, X, ClipboardList } from 'lucide-react';
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

  const handleGoToTests = () => {
    markPromoSeen('probniPrijemni');
    setShowPromoQuiz(false);
    navigate('/#inicijalni-testovi');
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
      <div className="relative w-full max-w-sm md:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-gray-400 hover:bg-black/5 md:text-white/80 md:hover:bg-white/20 transition-colors z-30"
          aria-label="Затвори"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* ============ LEFT / TOP — WHITE : квиз + попуст ============ */}
        <div className="md:w-1/2 px-5 py-6 md:px-8 md:py-9 text-center flex flex-col justify-center">
          <div className="w-11 h-11 bg-gradient-to-br from-[#D62828] to-[#B91F1F] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <h2 className="text-base md:text-xl font-bold text-[#1A1A1A] leading-snug mb-1.5">
            Тестирај своје знање бесплатно
          </h2>
          <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed mb-3.5">
            20 питања из српског језика и књижевности — провери колико си спреман за малу матуру.
          </p>

          {/* 20% попуст */}
          <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-xl px-3 py-2.5 mb-3.5 shadow-md">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 md:w-5 md:h-5 text-[#F2C94C] flex-shrink-0" />
              <span className="text-lg md:text-2xl font-black text-white leading-none">20% ПОПУСТ</span>
            </div>
            <p className="text-[10px] md:text-[11px] text-white/90 mt-1">
              на било који курс ако урадиш квиз до краја
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleStartQuiz}
              className="flex-1 px-3 py-2.5 bg-[#D62828] text-white rounded-lg font-bold hover:bg-[#B91F1F] transition-all shadow-md flex items-center justify-center gap-1.5 text-sm"
            >
              Почни квиз <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-lg font-bold hover:bg-gray-50 transition-all text-sm"
            >
              Не хвала
            </button>
          </div>

          <p className="hidden md:block text-[11px] text-gray-400 leading-relaxed mt-3">
            Квиз можеш покренути и касније, преко „Пробни тест" у брзом менију.
          </p>
        </div>

        {/* ============ RIGHT / BOTTOM — RED : иницијални тестови ============ */}
        <div className="relative md:w-1/2 bg-gradient-to-br from-[#D62828] to-[#B91F1F] px-5 py-6 md:px-8 md:py-9 text-center flex flex-col justify-center">
          {/* "ИЛИ" — на споју: хоризонтално на мобилном, вертикално на десктопу */}
          <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-4 md:left-0 md:top-1/2 md:-translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-lg ring-4 ring-white flex items-center justify-center">
            <span className="text-[11px] md:text-sm font-black text-[#D62828] tracking-wide">ИЛИ</span>
          </div>

          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>

          <h3 className="text-base md:text-xl font-extrabold text-white leading-snug mb-1.5">
            Испробај иницијалне тестове
          </h3>
          <p className="text-[11px] md:text-xs text-white/85 leading-relaxed mb-4">
            Тестови за 5, 6, 7. и 8. разред. Бесплатно, без пријаве, са тачним одговорима.
          </p>

          <button
            onClick={handleGoToTests}
            className="px-4 py-2.5 bg-white text-[#D62828] rounded-lg font-bold hover:bg-gray-100 transition-all shadow-md hover:scale-[1.02] transform inline-flex items-center justify-center gap-1.5 text-sm"
          >
            Погледај тестове <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
