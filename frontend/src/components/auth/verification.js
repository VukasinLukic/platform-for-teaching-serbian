import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

export const VERIFY_TO_BUY_MESSAGE =
  'Пре куповине потврди имејл адресу. Линк за потврду смо ти послали на имејл — провери и Spam/Промоције. Можеш да затражиш нови линк на свом панелу.';

/** True when the signed-in user has a verified email (Firestore profile or Auth). */
export function isEmailVerified(userProfile, user) {
  return userProfile?.emailVerified === true || user?.emailVerified === true;
}

/**
 * Called before starting a purchase. Reloads the Auth user and refreshes the ID token
 * so the `email_verified` claim is current (verification happens on the server via the
 * Admin SDK, so an old token would still say false).
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
export async function ensureEmailVerifiedForPurchase() {
  const current = auth.currentUser;
  if (!current) return { ok: false, message: 'Пријавите се да бисте наставили са куповином.' };

  try {
    await current.reload();
  } catch {
    /* offline: fall back to cached state */
  }

  let profile = useAuthStore.getState().userProfile;
  if (!profile?.emailVerified && !current.emailVerified) {
    try {
      profile = await useAuthStore.getState().refreshUserProfile();
    } catch {
      /* ignore */
    }
  }

  if (!isEmailVerified(profile, auth.currentUser)) {
    return { ok: false, message: VERIFY_TO_BUY_MESSAGE };
  }

  try {
    const tokenResult = await auth.currentUser.getIdTokenResult();
    if (tokenResult?.claims?.email_verified !== true) {
      await auth.currentUser.getIdToken(true);
    }
  } catch {
    /* the server re-checks anyway */
  }

  return { ok: true };
}

/** Refreshes the ID token after verification so Firestore rules see email_verified. */
export async function refreshVerificationClaims() {
  const current = auth.currentUser;
  if (!current) return;
  try {
    await current.reload();
    await current.getIdToken(true);
  } catch {
    /* ignore */
  }
}
