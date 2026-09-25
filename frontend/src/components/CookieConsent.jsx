import { useState } from 'react';
import { Link } from 'react-router-dom';

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
 */
export default function CookieConsent() {
  const [choice, setChoice] = useState(readChoice);

  if (choice === 'granted' || choice === 'denied') return null;

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
      role="dialog"
      aria-live="polite"
      aria-label="Колачићи"
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-3xl bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
        <p className="text-sm text-gray-700 flex-1">
          Користимо колачиће за анализу посећености (Google Analytics) како бисмо побољшали сајт.
          Неопходни колачићи за пријаву раде увек. Више у{' '}
          <Link to="/privacy" className="text-[#D62828] underline">политици приватности</Link>.
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => save('denied')}
            className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D62828]"
          >
            Одбиј
          </button>
          <button
            type="button"
            onClick={() => save('granted')}
            className="px-4 py-2 rounded-full bg-[#D62828] text-white text-sm font-semibold hover:bg-[#B91F1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D62828]"
          >
            Прихвати
          </button>
        </div>
      </div>
    </div>
  );
}
