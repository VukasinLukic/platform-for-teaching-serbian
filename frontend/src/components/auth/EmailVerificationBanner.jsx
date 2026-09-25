import { useEffect, useRef, useState } from 'react';
import { Mail, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useResendVerification } from './useResendVerification';
import { isEmailVerified, refreshVerificationClaims } from './verification';

const POLL_MS = 15000;

/**
 * Persistent, friendly banner for signed-in users whose email is not verified yet.
 * The platform stays usable (dashboard, quizzes); only purchases and paid content
 * require verification. Checks the status periodically and when the tab regains focus.
 */
export default function EmailVerificationBanner({ className = '', variant = 'inline' }) {
  const floating = variant === 'floating';
  const { user, userProfile, refreshUserProfile } = useAuthStore();
  const { resend, sending, sent, error, cooldown, exhausted } = useResendVerification();
  const [justVerified, setJustVerified] = useState(false);
  const [collapsed, setCollapsed] = useState(floating);
  const wasUnverified = useRef(false);

  const verified = isEmailVerified(userProfile, user);
  const shouldWatch = !!user && !!userProfile && !verified;

  useEffect(() => {
    if (shouldWatch) wasUnverified.current = true;
    if (verified && wasUnverified.current) {
      wasUnverified.current = false;
      setJustVerified(true);
      refreshVerificationClaims();
      const t = setTimeout(() => setJustVerified(false), 6000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [shouldWatch, verified]);

  useEffect(() => {
    if (!shouldWatch) return undefined;
    const check = () => {
      if (document.visibilityState === 'visible') {
        refreshUserProfile().catch(() => {});
      }
    };
    const id = setInterval(check, POLL_MS);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [shouldWatch, refreshUserProfile]);

  const wrap = (node) =>
    floating ? (
      <div className="fixed z-40 right-4 left-4 sm:left-auto sm:max-w-md bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 flex justify-end">
        {node}
      </div>
    ) : (
      node
    );

  if (justVerified) {
    return wrap(
      <div role="status" className={`bg-green-50 border border-green-200 text-green-800 rounded-2xl px-4 py-3 flex items-center gap-3 ${className}`}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-semibold">Имејл је потврђен. Сада можеш да купујеш курсеве и гледаш све лекције.</p>
      </div>
    );
  }

  if (!shouldWatch) return null;

  const email = userProfile?.email || user?.email;

  if (collapsed) {
    return wrap(
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={`${floating ? 'shadow-lg' : 'w-full sm:w-auto'} inline-flex items-center gap-2 bg-[#FFF8E1] border border-[#F2C94C] text-[#1A1A1A] rounded-full px-4 py-2 text-sm font-semibold hover:bg-[#FFF1C2] transition-colors ${className}`}
      >
        <Mail className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
        Потврди имејл адресу
      </button>
    );
  }

  let buttonLabel = 'Пошаљи линк поново';
  if (sending) buttonLabel = 'Шаљем...';
  else if (cooldown > 0) buttonLabel = `Поново за ${cooldown} с`;

  return wrap(
    <section
      aria-labelledby="verify-banner-title"
      className={`relative bg-gradient-to-r from-[#FFF8E1] to-[#FFFDF5] border border-[#F2C94C] rounded-2xl p-4 sm:p-5 ${floating ? 'shadow-xl' : 'shadow-sm'} ${className}`}
    >
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-black/5"
        aria-label="Умањи обавештење"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-6">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#F2C94C] flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-[#1A1A1A]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="verify-banner-title" className="font-bold text-[#1A1A1A]">
              Потврди имејл адресу
            </h2>
            <p className="text-sm text-gray-700 mt-0.5">
              Послали смо линк на <span className="font-semibold break-all">{email}</span>. Провери и Spam/Промоције.
              Панел и квизови раде и без потврде — потврда је потребна само за куповину и плаћене лекције.
            </p>
            <div aria-live="polite" className="text-sm mt-1">
              {sent && !error && <p className="text-green-700 font-medium">Нови линк је послат. Важи 24 часа.</p>}
              {error && <p className="text-red-700 font-medium">{error}</p>}
              {exhausted && !error && (
                <p className="text-gray-600">Достигнут је максималан број слања. Пиши нам ако линк није стигао.</p>
              )}
            </div>
          </div>
        </div>
        {!exhausted && (
          <button
            type="button"
            onClick={resend}
            disabled={sending || cooldown > 0}
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} aria-hidden="true" />
            {buttonLabel}
          </button>
        )}
      </div>
    </section>
  );
}
