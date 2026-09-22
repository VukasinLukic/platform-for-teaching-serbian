import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, CircleHelp } from 'lucide-react';
import { useOnboarding, PAGE_TUTORIALS } from '../../context/OnboardingContext';
import { useAssistantUiStore } from '../../store/assistantUiStore';
import './QuickDock.css';

function getPageKeyForPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  return null;
}

/**
 * Jedinstveni sticky "quick dock" — zamenjuje ranije razbacana plutajuća dugmad
 * (probni test, pomoć, Alano launcher) jednim doslednim setom od 3 stavke.
 * Desktop: vertikalna traka uz levu ivicu ekrana. Mobilni: traka na dnu ekrana.
 */
export default function QuickDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startTutorial, resetTutorial, hasSeenTutorial } = useOnboarding();
  const isAssistantOpen = useAssistantUiStore((s) => s.isOpen);
  const setAssistantOpen = useAssistantUiStore((s) => s.setAssistantOpen);

  // Sakrij dok je Alano chat otvoren — panel je preko cele/desne strane ekrana.
  if (isAssistantOpen) return null;

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
    <nav className="quick-dock" aria-label="Брзи приступ">
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
