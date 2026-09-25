import { useCallback, useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { functionsErrorMessage } from './errorMessages';

// Shared with VerifyEmailPage so the cooldown is the same everywhere.
export const RESEND_COOLDOWN = 60; // seconds
export const MAX_RESEND_ATTEMPTS = 5;
const STORAGE_KEY = 'verify_resend';

function readState() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { attempts: data.attempts || 0, lastSent: data.lastSent || 0 };
  } catch {
    return { attempts: 0, lastSent: 0 };
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function remainingCooldown(lastSent) {
  const elapsed = Math.floor((Date.now() - lastSent) / 1000);
  return elapsed < RESEND_COOLDOWN ? RESEND_COOLDOWN - elapsed : 0;
}

/**
 * Resend-verification-email logic (calls the `resendVerificationEmail` function)
 * with a 60 s cooldown and a max number of attempts persisted in localStorage.
 */
export function useResendVerification() {
  const [attempts, setAttempts] = useState(() => readState().attempts);
  const [cooldown, setCooldown] = useState(() => remainingCooldown(readState().lastSent));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setInterval(() => {
      setCooldown(remainingCooldown(readState().lastSent));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const exhausted = attempts >= MAX_RESEND_ATTEMPTS;

  const resend = useCallback(async () => {
    if (sending || cooldown > 0 || exhausted) return false;
    setSending(true);
    setError('');
    try {
      const resendVerificationEmail = httpsCallable(functions, 'resendVerificationEmail');
      await resendVerificationEmail();
      const next = { attempts: attempts + 1, lastSent: Date.now() };
      writeState(next);
      setAttempts(next.attempts);
      setCooldown(RESEND_COOLDOWN);
      setSent(true);
      return true;
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError(functionsErrorMessage(err, 'Слање имејла није успело. Покушај поново за минут.'));
      return false;
    } finally {
      setSending(false);
    }
  }, [attempts, cooldown, exhausted, sending]);

  return { resend, sending, sent, error, cooldown, exhausted };
}
