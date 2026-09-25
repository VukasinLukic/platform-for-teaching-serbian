import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFloatingLayers } from '../context/floatingLayers';

const STORAGE_KEY = 'srpskiusrcu_cookie_consent';

const readChoice = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Cookie banner for Google Analytics (Consent Mode v2).
 * Analytics stays disabled (set in index.html) until the visitor accepts.
 * It is the first floating layer: while it is visible the mobile dock yields,
 * tutorials wait and the promo modal stays closed (see context/floatingLayers.js).
 */
export default function CookieConsent() {
  const [choice, setChoice] = useState(readChoice);
  const setCookieBannerVisible = useFloatingLayers((s) => s.setCookieBannerVisible);
  const visible = choice !== 'granted' && choice !== 'denied';

  useEffect(() => {
    setCookieBannerVisible(visible);
    return () => setCookieBannerVisible(false);
  }, [visible, setCookieBannerVisible]);

  if (!visible) return null;

  const save = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Private mode: the choice lasts only for this page view
    }
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: value });
    }
    setChoice(value);
  };

  return (
    <div
      role="region"
      aria-label="Обавештење о колачићима"
      className="fixed inset-x-0 bottom-0 z-[70] px-3 pt-3 sm:px-6 sm:pt-6 pointer-events-none"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="pointer-events-auto mx-auto max-w-3xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center motion-safe:animate-layer-rise">
        <p className="text-sm text-gray-700 flex-1 leading-relaxed" aria-live="polite">
          Користимо колачиће за анализу посећености (Google Analytics) како бисмо побољшали сајт.
          Неопходни колачићи за пријаву раде увек. Више у{' '}
          <Link to="/privacy" className="text-brand underline underline-offset-2">политици приватности</Link>.
        </p>
        <div className="grid grid-cols-2 sm:flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => save('denied')}
            className="min-h-[44px] px-5 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            Одбиј
          </button>
          <button
            type="button"
            onClick={() => save('granted')}
            className="min-h-[44px] px-5 py-2 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Прихвати
          </button>
        </div>
      </div>
    </div>
  );
}
