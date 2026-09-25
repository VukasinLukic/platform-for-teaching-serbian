import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, CircleHelp } from 'lucide-react';
import { useOnboarding, PAGE_TUTORIALS } from '../../context/OnboardingContext';
import { useAssistantUiStore } from '../../store/assistantUiStore';
import { useFloatingLayers, getDockMode } from '../../context/floatingLayers';
import './QuickDock.css';

function getPageKeyForPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  return null;
}

const MOBILE_QUERY = '(max-width: 1023px)';

/**
 * Publishes the space the dock occupies at the bottom of the viewport (mobile only) as
 * `--dock-offset` on <html> and as body bottom padding, so the footer and page CTAs
 * are never hidden behind it. Other floating layers can use the same variable.
 */
function useBottomOffset(ref, active) {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const clear = () => {
      root.style.removeProperty('--dock-offset');
      body.style.removeProperty('padding-bottom');
    };
    if (!active || !ref.current || typeof window === 'undefined') {
      clear();
      return undefined;
    }

    const mql = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
    const update = () => {
      if (!ref.current || (mql && !mql.matches)) {
        clear();
        return;
      }
      const h = Math.ceil(ref.current.getBoundingClientRect().height);
      root.style.setProperty('--dock-offset', `${h}px`);
      body.style.paddingBottom = `${h}px`;
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(ref.current);
    mql?.addEventListener?.('change', update);
    return () => {
      ro?.disconnect();
      mql?.removeEventListener?.('change', update);
      clear();
    };
  }, [ref, active]);
}

/**
 * Single sticky "quick dock" — mock exam, help and the Alano assistant launcher.
 * Desktop: vertical bar on the left edge. Mobile: bar at the bottom of the screen.
 * Visibility follows the rules in context/floatingLayers.js.
 */
export default function QuickDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const dockRef = useRef(null);
  const { startTutorial, resetTutorial, hasSeenTutorial } = useOnboarding();
  const isAssistantOpen = useAssistantUiStore((s) => s.isOpen);
  const setAssistantOpen = useAssistantUiStore((s) => s.setAssistantOpen);
  const cookieBannerVisible = useFloatingLayers((s) => s.cookieBannerVisible);
  const testingActive = useFloatingLayers((s) => s.testingActive);

  const mode = getDockMode(location.pathname, { testingActive });
  // The cookie banner owns the bottom edge until the visitor decides.
  const showFull = mode === 'full' && !isAssistantOpen;
  useBottomOffset(dockRef, showFull && !cookieBannerVisible);

  if (isAssistantOpen || mode === 'hidden') return null;

  if (mode === 'minimized') {
    if (cookieBannerVisible) return null;
    return (
      <button
        type="button"
        className="quick-dock-mini"
        onClick={() => setAssistantOpen(true)}
        aria-label="Отвори Алана, асистента"
        title="Алано — асистент"
      >
        <img src="/mascot/alano-hero.webp" alt="" draggable={false} />
      </button>
    );
  }

  const pageKey = getPageKeyForPath(location.pathname);
  const tutorial = pageKey ? PAGE_TUTORIALS[pageKey] : null;

  const handleHelp = () => {
    if (!tutorial) {
      navigate('/faq');
      return;
    }
    if (hasSeenTutorial(pageKey)) resetTutorial(pageKey);
    setTimeout(() => startTutorial(pageKey), 150);
  };

  return (
    <nav
      ref={dockRef}
      className={`quick-dock ${cookieBannerVisible ? 'is-yielding' : ''}`}
      aria-label="Брзи приступ"
    >
      <button type="button" className="quick-dock-item" onClick={() => navigate('/probni-prijemni')}>
        <span className="quick-dock-icon">
          <GraduationCap size={20} strokeWidth={2.1} />
        </span>
        <span className="quick-dock-label">Пробни тест</span>
      </button>

      <span className="quick-dock-divider" aria-hidden="true" />

      <button type="button" className="quick-dock-item" onClick={handleHelp}>
        <span className="quick-dock-icon">
          <CircleHelp size={20} strokeWidth={2.1} />
        </span>
        <span className="quick-dock-label">Помоћ</span>
      </button>

      <span className="quick-dock-divider" aria-hidden="true" />

      <button
        type="button"
        className="quick-dock-item quick-dock-alano"
        onClick={() => setAssistantOpen(true)}
      >
        <span className="quick-dock-icon quick-dock-mascot">
          <img src="/mascot/alano-hero.webp" alt="" draggable={false} />
        </span>
        <span className="quick-dock-label">
          Алано
          <small>твој асистент</small>
        </span>
      </button>
    </nav>
  );
}
