import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PAGE_TUTORIALS = {
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
  const [completedTutorials, setCompletedTutorials] = useState(new Set());
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);
  const [isShowingTutorial, setIsShowingTutorial] = useState(false);

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
      setTimeout(() => startTutorial(pageKey), 800);
    }
  }, [completedTutorials, startTutorial]);

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
