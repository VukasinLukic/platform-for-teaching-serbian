import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PromoContext = createContext(null);

const STORAGE_PREFIX = 'srpskiusrcu_promo_seen_';
const QUIZ_RESULT_KEY = 'srpskiusrcu_promo_quiz_result';

export function PromoProvider({ children }) {
  const [promotions, setPromotions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPromoQuiz, setShowPromoQuiz] = useState(false);

  // Fetch promotions from Firestore
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const promoDoc = await getDoc(doc(db, 'settings', 'promotions'));
        if (promoDoc.exists()) {
          const data = promoDoc.data();
          setPromotions(data);

          // Check if probniPrijemni is active and user hasn't seen it
          if (data.probniPrijemni?.active && !hasSeenPromo('probniPrijemni')) {
            // Small delay so the page loads first
            setTimeout(() => setShowPromoQuiz(true), 1500);
          }
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const hasSeenPromo = useCallback((promoId) => {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}${promoId}`) === 'true';
    } catch {
      return false;
    }
  }, []);

  const markPromoSeen = useCallback((promoId) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${promoId}`, 'true');
    } catch (error) {
      console.error('Error saving promo state:', error);
    }
  }, []);

  const isPromoActive = useCallback((promoId) => {
    return promotions[promoId]?.active === true;
  }, [promotions]);

  const saveQuizResult = useCallback((score, totalQuestions) => {
    try {
      const data = {
        score,
        totalQuestions,
        quizDate: new Date().toISOString(),
        timestamp: Date.now(),
      };
      localStorage.setItem(QUIZ_RESULT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  }, []);

  const getQuizResult = useCallback(() => {
    try {
      const stored = localStorage.getItem(QUIZ_RESULT_KEY);
      if (!stored) return null;
      const data = JSON.parse(stored);
      if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(QUIZ_RESULT_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, []);

  const clearQuizResult = useCallback(() => {
    try {
      localStorage.removeItem(QUIZ_RESULT_KEY);
    } catch (error) {
      console.error('Error clearing quiz result:', error);
    }
  }, []);

  const value = {
    promotions,
    loading,
    showPromoQuiz,
    setShowPromoQuiz,
    hasSeenPromo,
    markPromoSeen,
    isPromoActive,
    saveQuizResult,
    getQuizResult,
    clearQuizResult,
  };

  return (
    <PromoContext.Provider value={value}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
}
