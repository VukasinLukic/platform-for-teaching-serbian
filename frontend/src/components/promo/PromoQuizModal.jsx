import { useCallback, useEffect, useRef, useState } from 'react';
import { GraduationCap, ArrowRight, Gift, X, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePromo } from '../../context/PromoContext';
import { useFloatingLayers, isFocusRoute } from '../../context/floatingLayers';
import { useAssistantUiStore } from '../../store/assistantUiStore';

// How long a visitor browses before the promo may open on its own.
const DWELL_MS = 30000;

/**
 * Decides when the promo is allowed to open: only once the visitor has browsed for
 * ~30s or shows exit intent (pointer leaves through the top of the window on desktop),
 * and never while the cookie banner, a tutorial or the assistant is on screen, on
 * focus routes, or on the mock exam page itself.
 */
function usePromoScheduler() {
  const { promoEligible, showPromoQuiz, setShowPromoQuiz } = usePromo();
  const location = useLocation();
  const cookieBannerVisible = useFloatingLayers((s) => s.cookieBannerVisible);
  const tutorialActive = useFloatingLayers((s) => s.tutorialActive);
  const testingActive = useFloatingLayers((s) => s.testingActive);
  const assistantOpen = useAssistantUiStore((s) => s.isOpen);
  const [wantsToOpen, setWantsToOpen] = useState(false);

  const onPromoPage = /^(\/lat)?\/probni-prijemni/.test(location.pathname);
  const blocked =
    cookieBannerVisible ||
    tutorialActive ||
    assistantOpen ||
    onPromoPage ||
    isFocusRoute(location.pathname, { testingActive });

  // Dwell timer + exit intent turn "eligible" into "wants to open".
  useEffect(() => {
    if (!promoEligible || wantsToOpen) return undefined;
    const timer = setTimeout(() => setWantsToOpen(true), DWELL_MS);
    const onMouseOut = (e) => {
      if (!e.relatedTarget && e.clientY <= 0) setWantsToOpen(true);
    };
    document.addEventListener('mouseout', onMouseOut);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [promoEligible, wantsToOpen]);

  // Open only when nothing else is competing for attention.
  useEffect(() => {
    if (promoEligible && wantsToOpen && !blocked && !showPromoQuiz) {
      const t = setTimeout(() => setShowPromoQuiz(true), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [promoEligible, wantsToOpen, blocked, showPromoQuiz, setShowPromoQuiz]);

  // If another layer takes over (e.g. the visitor navigates into a lesson), step aside.
  useEffect(() => {
    if (showPromoQuiz && (cookieBannerVisible || tutorialActive || onPromoPage)) {
      setShowPromoQuiz(false);
    }
  }, [showPromoQuiz, cookieBannerVisible, tutorialActive, onPromoPage, setShowPromoQuiz]);
}

export default function PromoQuizModal() {
  const { showPromoQuiz, setShowPromoQuiz, markPromoSeen } = usePromo();
  const setPromoOpen = useFloatingLayers((s) => s.setPromoOpen);
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const startBtnRef = useRef(null);

  usePromoScheduler();

  useEffect(() => {
    setPromoOpen(showPromoQuiz);
  }, [showPromoQuiz, setPromoOpen]);

  const handleClose = useCallback(() => {
    markPromoSeen('probniPrijemni');
    setShowPromoQuiz(false);
  }, [markPromoSeen, setShowPromoQuiz]);

  // Scroll lock, initial focus, Escape and a simple focus trap while open.
  useEffect(() => {
    if (!showPromoQuiz) return undefined;
    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = setTimeout(() => startBtnRef.current?.focus(), 30);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [showPromoQuiz, handleClose]);

  if (!showPromoQuiz) return null;

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
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 motion-safe:animate-overlay-fade"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-quiz-title"
        className="relative w-full sm:max-w-md md:max-w-3xl max-h-[92dvh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row motion-safe:animate-layer-rise"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-black/5 md:text-white md:hover:bg-white/20 transition-colors z-30"
          aria-label="Затвори"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left / top — free mock exam + discount */}
        <div className="md:w-1/2 px-6 pt-8 pb-7 md:px-8 md:py-10 text-center flex flex-col justify-center">
          <img
            src="/mascot/alano-hero.webp"
            alt=""
            className="w-20 h-20 object-contain mx-auto -mt-2 mb-2 drop-shadow"
            width="80"
            height="80"
          />

          <h2 id="promo-quiz-title" className="text-xl md:text-2xl font-bold text-[#1A1A1A] leading-snug mb-2">
            Тестирај своје знање бесплатно
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            20 питања из српског језика и књижевности — провери колико си спреман за малу матуру.
          </p>

          <div className="bg-gradient-to-r from-[#D62828] to-[#B91F1F] rounded-2xl px-4 py-3 mb-5 shadow-md">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-[#F2C94C] flex-shrink-0" aria-hidden="true" />
              <span className="text-xl md:text-2xl font-black text-white leading-none">20% ПОПУСТ</span>
            </div>
            <p className="text-sm text-white/90 mt-1.5">на било који курс ако урадиш квиз до краја</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              ref={startBtnRef}
              type="button"
              onClick={handleStartQuiz}
              className="flex-1 min-h-[48px] px-4 py-3 bg-[#D62828] text-white rounded-full font-bold hover:bg-[#B91F1F] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
              Почни квиз
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="min-h-[48px] px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition-colors"
            >
              Не, хвала
            </button>
          </div>

          <p className="hidden md:block text-xs text-gray-500 leading-relaxed mt-4">
            Квиз можеш покренути и касније, преко „Пробни тест“ у брзом менију.
          </p>
        </div>

        {/* Right / bottom — initial tests */}
        <div className="relative md:w-1/2 bg-gradient-to-br from-[#D62828] to-[#B91F1F] px-6 pt-9 pb-7 md:px-8 md:py-10 text-center flex flex-col justify-center">
          <div
            className="absolute z-20 left-1/2 -translate-x-1/2 -top-5 md:left-0 md:top-1/2 md:-translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-lg ring-4 ring-white flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-xs md:text-sm font-black text-[#D62828] tracking-wide">ИЛИ</span>
          </div>

          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-white" aria-hidden="true" />
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug mb-2">
            Испробај иницијалне тестове
          </h3>
          <p className="text-sm text-white/90 leading-relaxed mb-5">
            Тестови за 5, 6, 7. и 8. разред. Бесплатно, без пријаве, са тачним одговорима.
          </p>

          <button
            type="button"
            onClick={handleGoToTests}
            className="min-h-[48px] px-5 py-3 bg-white text-[#D62828] rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md inline-flex items-center justify-center gap-2"
          >
            Погледај тестове <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
