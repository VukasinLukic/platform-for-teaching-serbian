import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';
import { useAuthStore } from '../store/authStore';

const RESEND_COOLDOWN = 60; // seconds
const MAX_RESEND_ATTEMPTS = 5;
const STORAGE_KEY = 'verify_resend';
const RETURN_TO_KEY = 'srpskiusrcu_return_to';

const getRedirectPath = () => {
  const returnTo = localStorage.getItem(RETURN_TO_KEY);
  if (returnTo) {
    localStorage.removeItem(RETURN_TO_KEY);
    return returnTo;
  }
  return '/dashboard';
};

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUserProfile } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, waiting
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const cooldownRef = useRef(null);

  // Load resend state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setAttempts(data.attempts || 0);
      const elapsed = Math.floor((Date.now() - (data.lastSent || 0)) / 1000);
      if (elapsed < RESEND_COOLDOWN) {
        setCooldown(RESEND_COOLDOWN - elapsed);
      }
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      return;
    }
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  // Listen for verification from another tab
  useEffect(() => {
    const channel = new BroadcastChannel('email_verification');

    const handleMessage = (event) => {
      if (event.data?.type === 'verified') {
        const action = event.data?.action;

        if (action === 'redirect_to_login') {
          // Korisnik nije bio ulogovan u drugom tab-u
          setStatus('success');
          setMessage('Email верификован! Преусмеравамо вас на пријаву...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          // Korisnik je bio ulogovan ili default ponašanje
          setStatus('success');
          setMessage('Ваш налог је успешно активиран!');
          setTimeout(() => navigate(getRedirectPath()), 3000);
        }
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [navigate]);

  // Verify token on mount
  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('waiting');
      setMessage('Послали смо вам email са линком за верификацију. Проверите свој inbox и кликните на линк.');
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus('verifying');
        setMessage('Верификујемо ваш email...');

        const verifyEmailToken = httpsCallable(functions, 'verifyEmailToken');
        const result = await verifyEmailToken({ token });

        if (result.data.success) {
          // Proveri da li je korisnik ulogovan
          const currentUser = useAuthStore.getState().user;

          if (!currentUser) {
            // Korisnik NIJE ulogovan - prikaži dugme za login
            setStatus('success_not_logged_in');
            setMessage('Успешно сте верификовали email! Сада се можете пријавити.');

            // Obavesti originalni tab da redirect na /login
            try {
              const channel = new BroadcastChannel('email_verification');
              channel.postMessage({ type: 'verified', action: 'redirect_to_login' });
              // Delay close to ensure message is sent
              setTimeout(() => channel.close(), 100);
            } catch (e) { /* ignore */ }
          } else {
            // Korisnik JE ulogovan - trenutno ponašanje
            setStatus('success');
            setMessage('Ваш налог је успешно активиран!');

            // Obavesti originalni tab da redirect na /dashboard
            try {
              const channel = new BroadcastChannel('email_verification');
              channel.postMessage({ type: 'verified', action: 'redirect_to_dashboard' });
              // Delay close to ensure message is sent
              setTimeout(() => channel.close(), 100);
            } catch (e) { /* ignore */ }

            try {
              await refreshUserProfile();
            } catch (e) { /* ignore */ }

            // Redirect after 3s
            setTimeout(() => navigate(getRedirectPath()), 3000);
          }
        } else {
          setStatus('error');
          setMessage('Грешка приликом верификације. Покушајте поново.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');

        if (error.code === 'not-found') {
          setMessage('Неважећи или истекао токен. Молимо затражите нови email за верификацију.');
        } else if (error.code === 'already-exists') {
          setMessage('Ваш email је већ верификован.');
          setTimeout(() => navigate(getRedirectPath()), 3000);
        } else if (error.code === 'deadline-exceeded') {
          setMessage('Токен је истекао. Молимо затражите нови email за верификацију.');
        } else {
          setMessage(error.message || 'Грешка приликом верификације. Покушајте поново.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (cooldown > 0 || attempts >= MAX_RESEND_ATTEMPTS) return;

    try {
      setStatus('verifying');
      setMessage('Шаљемо нови email за верификацију...');

      const resendVerificationEmail = httpsCallable(functions, 'resendVerificationEmail');
      const result = await resendVerificationEmail();

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setCooldown(RESEND_COOLDOWN);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        attempts: newAttempts,
        lastSent: Date.now(),
      }));

      if (result.data.success) {
        setStatus('waiting');
        setMessage('Нови email за верификацију је послат! Проверите свој inbox.');
      } else {
        setStatus('error');
        setMessage('Грешка приликом слања email-а. Покушајте поново.');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setStatus('error');
      setMessage(error.message || 'Грешка приликом слања email-а.');
    }
  };

  const cooldownPercent = cooldown > 0 ? (cooldown / RESEND_COOLDOWN) * 100 : 0;
  const resendDisabled = cooldown > 0 || attempts >= MAX_RESEND_ATTEMPTS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-accent-light flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10">
        {/* Status Icon */}
        <div className="text-center mb-6">
          {status === 'waiting' && (
            <div className="text-7xl mb-4 animate-pulse">📧</div>
          )}
          {status === 'verifying' && (
            <div className="inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary"></div>
            </div>
          )}
          {status === 'success' && (
            <div className="text-7xl mb-4 animate-bounce">✅</div>
          )}
          {status === 'error' && (
            <div className="text-7xl mb-4">❌</div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-4 text-primary">
          {status === 'waiting' && 'Проверите Ваш Email'}
          {status === 'verifying' && 'Верификација у току...'}
          {status === 'success' && 'Налог активиран!'}
          {status === 'error' && 'Грешка'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-700 mb-6 text-lg">
          {message}
        </p>

        {/* Success Not Logged In - show login button */}
        {status === 'success_not_logged_in' && (
          <div className="text-center mb-6 p-4 bg-green-50 rounded-2xl">
            <p className="text-green-700 text-lg font-semibold mb-2">
              Успешно сте верификовали email!
            </p>
            <p className="text-green-600 text-sm mb-4">
              Ваш налог је активиран. Сада се можете пријавити.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-primary text-white py-4 rounded-2xl font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Пријавите се
            </button>
          </div>
        )}

        {/* Success - redirect info */}
        {status === 'success' && user && (
          <div className="text-center mb-6 p-4 bg-green-50 rounded-2xl">
            <p className="text-green-700 text-sm">
              Ускоро ћете поново унети email и шифру. Приступили сте платформи.
            </p>
            <p className="text-green-800 font-bold text-lg mt-2">Добро дошли!</p>
            <p className="text-gray-500 text-sm mt-2">Преусмеравамо вас на ваш панел...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'waiting' && (
            <>
              {/* Cooldown progress bar */}
              {cooldown > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Сачекајте пре поновног слања</span>
                    <span>{cooldown}с</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${cooldownPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {attempts >= MAX_RESEND_ATTEMPTS ? (
                <div className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-semibold text-center text-sm">
                  Достигнут максималан број покушаја слања. Проверите spam фолдер или контактирајте подршку.
                </div>
              ) : (
                <button
                  onClick={handleResendEmail}
                  disabled={resendDisabled}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    resendDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-accent text-primary hover:bg-accent-dark'
                  }`}
                >
                  {cooldown > 0
                    ? `Пошаљи поново (${cooldown}с)`
                    : `Пошаљи поново email${attempts > 0 ? ` (${attempts}/${MAX_RESEND_ATTEMPTS})` : ''}`
                  }
                </button>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Назад на Пријаву
              </button>
            </>
          )}

          {status === 'success' && (
            <button
              onClick={() => navigate(getRedirectPath())}
              className="w-full bg-primary text-white py-4 rounded-2xl font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Иди на Ваш Панел
            </button>
          )}

          {status === 'error' && (
            <>
              {/* Cooldown progress bar */}
              {cooldown > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Сачекајте пре поновног слања</span>
                    <span>{cooldown}с</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${cooldownPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {attempts >= MAX_RESEND_ATTEMPTS ? (
                <div className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-semibold text-center text-sm">
                  Достигнут максималан број покушаја. Контактирајте подршку.
                </div>
              ) : (
                <button
                  onClick={handleResendEmail}
                  disabled={resendDisabled}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    resendDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-accent text-primary hover:bg-accent-dark'
                  }`}
                >
                  {cooldown > 0
                    ? `Пошаљи нови email (${cooldown}с)`
                    : 'Пошаљи нови email'
                  }
                </button>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Назад на Пријаву
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        {status === 'waiting' && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Савети:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Проверите spam/junk фолдер у вашем email-у</li>
              <li>Email би требало да стигне за 1-2 минута</li>
              <li>Кликните на линк у email-у да верификујете налог</li>
              <li>Након верификације, моћи ћете да приступите платформи</li>
            </ul>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Савети:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>Проверите да ли сте кликнули на најновији линк</li>
              <li>Линк за верификацију истиче након 60 минута</li>
              <li>Затражите нови email ако је линк истекао</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
