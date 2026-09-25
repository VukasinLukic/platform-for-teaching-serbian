import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFloatingLayers } from './floatingLayers';

const PAGE_TUTORIALS = {
  home: {
    pageKey: 'home',
    pageName: 'Почетна страна',
    description: 'Кратак водич кроз платформу.',
    tooltips: [
      {
        id: 'home-hero-cta',
        targetSelector: '[data-tour="home-hero-cta"]',
        title: 'Крени одавде',
        description: 'Кликни овде да видиш све курсеве и изабереш онај који ти одговара.',
        position: 'bottom',
      },
      {
        id: 'home-inicijalni-testovi',
        targetSelector: '#inicijalni-testovi',
        title: 'Бесплатни иницијални тестови',
        description: 'Овде можеш бесплатно да урадиш иницијални тест за свој разред, без региструовања.',
        position: 'top',
      },
      {
        id: 'home-how-it-works',
        targetSelector: '#kako-funkcionise',
        title: 'Како функционише',
        description: 'Овде видиш тачно које кораке пролазиш од одабира курса до почетка учења.',
        position: 'top',
      },
    ],
  },
  courses: {
    pageKey: 'courses',
    pageName: 'Курсеви',
    description: 'Како да изабереш и купиш курс.',
    tooltips: [
      {
        id: 'courses-how-it-works',
        targetSelector: '[data-tour="courses-how-it-works"]',
        title: 'Процес у 4 корака',
        description: 'Од одабира курса до почетка учења — овде видиш сваки корак и шта те очекује.',
        position: 'bottom',
      },
      {
        id: 'courses-first-card',
        targetSelector: '[data-tour="courses-first-card"]',
        title: 'Изабери курс',
        description: 'Кликни на картицу курса за детаље, а дугме „Прикажи више" отвара шта тачно добијаш уз курс.',
        position: 'top',
      },
    ],
  },
  dashboard: {
    pageKey: 'dashboard',
    pageName: 'Ваш панел',
    description: 'Преглед ваших курсева, квизова и трансакција.',
    tooltips: [
      {
        id: 'dashboard-welcome',
        targetSelector: '[data-tour="welcome"]',
        title: 'Добро дошли!',
        description: 'Ово је ваш панел где можете пратити све своје курсеве, квизове и уплате на једном месту.',
        position: 'bottom',
      },
      {
        id: 'dashboard-courses',
        targetSelector: '[data-tour="available-courses"]',
        title: 'Доступни курсеви',
        description: 'Овде можете видети курсеве који су вам доступни за куповину. Кликните на курс за више детаља.',
        position: 'bottom',
      },
      {
        id: 'dashboard-my-courses',
        targetSelector: '[data-tour="my-courses"]',
        title: 'Моји курсеви',
        description: 'Након куповине, ваши курсеви ће се појавити овде. Кликните на курс да наставите учење.',
        position: 'top',
      },
      {
        id: 'dashboard-quizzes',
        targetSelector: '[data-tour="quizzes"]',
        title: 'Квизови знања',
        description: 'Тестирајте своје знање кроз интерактивне квизове и пратите свој напредак.',
        position: 'top',
      },
    ],
  },
};

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'srpskiusrcu_completed_tutorials';

export function OnboardingProvider({ children }) {
  // Read synchronously so pages asking for a tutorial on mount see the saved state.
  const [completedTutorials, setCompletedTutorials] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
  const [isShowingTutorial, setIsShowingTutorial] = useState(false);
  // Tutorial requested while another layer (cookie banner, promo modal) was on screen.
  const [pendingTutorial, setPendingTutorial] = useState(null);
  const cookieBannerVisible = useFloatingLayers((st) => st.cookieBannerVisible);
  const promoOpen = useFloatingLayers((st) => st.promoOpen);
  const setTutorialActive = useFloatingLayers((st) => st.setTutorialActive);
  const layerBlocked = cookieBannerVisible || promoOpen;

  // Publish tutorial state so the promo modal never opens on top of it.
  useEffect(() => {
    setTutorialActive(isShowingTutorial);
  }, [isShowingTutorial, setTutorialActive]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedTutorials(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Failed to load tutorial state:', error);
    }
  }, []);

  const saveCompletedTutorials = useCallback((tutorials) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(tutorials)));
    } catch (error) {
      console.error('Failed to save tutorial state:', error);
    }
  }, []);

  const hasSeenTutorial = useCallback((pageKey) => {
    return completedTutorials.has(pageKey);
  }, [completedTutorials]);

  const startTutorial = useCallback((pageKey) => {
    const tutorial = PAGE_TUTORIALS[pageKey];
    if (tutorial) {
      // Filter out tooltips whose target doesn't exist on the page
      const availableTooltips = tutorial.tooltips.filter(
        t => document.querySelector(t.targetSelector)
      );
      if (availableTooltips.length > 0) {
        setCurrentTutorial({ ...tutorial, tooltips: availableTooltips });
        setCurrentTooltipIndex(0);
        setIsShowingTutorial(true);
      }
    }
  }, []);

  const checkAndStartTutorial = useCallback((pageKey) => {
    if (!completedTutorials.has(pageKey) && PAGE_TUTORIALS[pageKey]) {
      // Always queue; the effect below starts it once no other layer is on screen.
      setPendingTutorial(pageKey);
    }
  }, [completedTutorials]);

  useEffect(() => {
    if (!pendingTutorial || layerBlocked) return undefined;
    if (completedTutorials.has(pendingTutorial)) {
      setPendingTutorial(null);
      return undefined;
    }
    const key = pendingTutorial;
    const timer = setTimeout(() => {
      setPendingTutorial(null);
      // startTutorial ignores steps whose targets are gone (visitor left the page).
      startTutorial(key);
    }, 800);
    return () => clearTimeout(timer);
  }, [pendingTutorial, layerBlocked, startTutorial, completedTutorials]);

  const completeTutorial = useCallback(() => {
    if (currentTutorial) {
      const newCompleted = new Set(completedTutorials);
      newCompleted.add(currentTutorial.pageKey);
      setCompletedTutorials(newCompleted);
      saveCompletedTutorials(newCompleted);
    }
    setCurrentTutorial(null);
    setCurrentTooltipIndex(0);
    setIsShowingTutorial(false);
  }, [currentTutorial, completedTutorials, saveCompletedTutorials]);

  const nextTooltip = useCallback(() => {
    if (currentTutorial && currentTooltipIndex < currentTutorial.tooltips.length - 1) {
      setCurrentTooltipIndex(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentTutorial, currentTooltipIndex, completeTutorial]);

  const prevTooltip = useCallback(() => {
    if (currentTooltipIndex > 0) {
      setCurrentTooltipIndex(prev => prev - 1);
    }
  }, [currentTooltipIndex]);

  const skipTutorial = useCallback(() => {
    completeTutorial();
  }, [completeTutorial]);

  const resetTutorial = useCallback((pageKey) => {
    const newCompleted = new Set(completedTutorials);
    newCompleted.delete(pageKey);
    setCompletedTutorials(newCompleted);
    saveCompletedTutorials(newCompleted);
  }, [completedTutorials, saveCompletedTutorials]);

  const value = {
    completedTutorials,
    currentTutorial,
    currentTooltipIndex,
    isShowingTutorial,
    startTutorial,
    nextTooltip,
    prevTooltip,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    hasSeenTutorial,
    checkAndStartTutorial,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export { PAGE_TUTORIALS };
