import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PromoContext = createContext(null);

const STORAGE_PREFIX = 'srpskiusrcu_promo_seen_';

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

  const value = {
    promotions,
    loading,
    showPromoQuiz,
    setShowPromoQuiz,
    hasSeenPromo,
    markPromoSeen,
    isPromoActive,
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
