import { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

export default function TutorialTooltip() {
  const {
    currentTutorial,
    currentTooltipIndex,
    isShowingTutorial,
    nextTooltip,
    prevTooltip,
    skipTutorial,
  } = useOnboarding();

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const currentTooltip = currentTutorial?.tooltips[currentTooltipIndex];
  const totalTooltips = currentTutorial?.tooltips.length || 0;
  const isLastTooltip = currentTooltipIndex === totalTooltips - 1;

  useEffect(() => {
    if (!isShowingTutorial || !currentTooltip) {
      setIsVisible(false);
      return;
    }

    const positionTooltip = () => {
      const targetElement = document.querySelector(currentTooltip.targetSelector);
      const tooltipElement = tooltipRef.current;

      if (!targetElement || !tooltipElement) {
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 160,
        });
        setIsVisible(true);
        return;
      }

      // Scroll target into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll, then position
      setTimeout(() => {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        const padding = 16;

        let top = 0;
        let left = 0;

        switch (currentTooltip.position || 'bottom') {
          case 'top':
            top = targetRect.top - tooltipRect.height - padding;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = targetRect.bottom + padding;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left - tooltipRect.width - padding;
            break;
          case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + padding;
            break;
        }

        // Keep within viewport
        const vp = 16;
        top = Math.max(vp, Math.min(top, window.innerHeight - tooltipRect.height - vp));
        left = Math.max(vp, Math.min(left, window.innerWidth - tooltipRect.width - vp));

        setPosition({ top, left });

        // Add highlight
        targetElement.classList.add('tutorial-highlight');
        setIsVisible(true);
      }, 400);
    };

    // Small delay for render
    const timer = setTimeout(positionTooltip, 100);

    return () => {
      clearTimeout(timer);
      if (currentTooltip) {
        const el = document.querySelector(currentTooltip.targetSelector);
        el?.classList.remove('tutorial-highlight');
      }
    };
  }, [currentTooltip, isShowingTutorial, currentTooltipIndex]);

  if (!isShowingTutorial || !currentTooltip) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300"
        onClick={skipTutorial}
      />

      {/* Global highlight style */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 9999 !important;
          box-shadow: 0 0 0 4px rgba(214, 40, 40, 0.4), 0 0 20px rgba(214, 40, 40, 0.2);
          border-radius: 1rem;
          transition: box-shadow 0.3s ease;
        }
      `}</style>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ top: position.top, left: position.left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[#D62828] animate-pulse" />
            <span className="text-sm font-bold text-gray-500">
              {currentTooltipIndex + 1} / {totalTooltips}
            </span>
          </div>
          <button
            onClick={skipTutorial}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <h3 className="font-bold text-[#1A1A1A] text-base mb-2">
            {currentTooltip.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentTooltip.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={skipTutorial}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Прескочи
          </button>

          <div className="flex items-center gap-2">
            {currentTooltipIndex > 0 && (
              <button
                onClick={prevTooltip}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
            )}
            <button
              onClick={nextTooltip}
              className="px-4 py-2 bg-[#D62828] text-white rounded-xl font-bold text-sm hover:bg-[#B91F1F] transition-colors flex items-center gap-1"
            >
              {isLastTooltip ? 'Завршите' : 'Даље'}
              {!isLastTooltip && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
