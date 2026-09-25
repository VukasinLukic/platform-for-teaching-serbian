/**
 * Maps Firebase error codes to Serbian (Cyrillic) messages. Cloud Functions now return
 * generic messages, so the UI decides what to show based on the error code.
 */

const FUNCTIONS_MESSAGES = {
  'invalid-argument': 'Проверите унете податке и покушајте поново.',
  'failed-precondition': 'Радња тренутно није могућа.',
  'resource-exhausted': 'Превише покушаја за кратко време. Сачекајте неколико минута и покушајте поново.',
  unauthenticated: 'Сесија је истекла. Пријавите се поново.',
  'permission-denied': 'Немате дозволу за ову радњу.',
  'not-found': 'Тражени податак није пронађен.',
  'already-exists': 'Ово је већ урађено.',
  'deadline-exceeded': 'Захтев је истекао. Покушајте поново.',
  unavailable: 'Сервис тренутно није доступан. Проверите интернет везу и покушајте поново.',
  internal: 'Дошло је до грешке на серверу. Покушајте поново.',
};

const AUTH_MESSAGES = {
  'auth/email-already-in-use': 'Овај имејл је већ регистрован. Пријавите се или ресетујте лозинку.',
  'auth/invalid-email': 'Имејл адреса није исправна.',
  'auth/weak-password': 'Лозинка је преслаба. Користите најмање 8 карактера, слова и бројеве.',
  'auth/user-not-found': 'Погрешан имејл или лозинка.',
  'auth/wrong-password': 'Погрешан имејл или лозинка.',
  'auth/invalid-credential': 'Погрешан имејл или лозинка.',
  'auth/invalid-login-credentials': 'Погрешан имејл или лозинка.',
  'auth/user-disabled': 'Овај налог је деактивиран. Контактирајте подршку.',
  'auth/too-many-requests': 'Превише неуспешних покушаја. Покушајте поново касније.',
  'auth/network-request-failed': 'Нема интернет везе. Проверите везу и покушајте поново.',
  'auth/operation-not-allowed': 'Регистрација тренутно није доступна. Покушајте касније.',
};

/** "functions/resource-exhausted" -> "resource-exhausted" */
export function normalizeCode(error) {
  const code = String(error?.code || '');
  return code.startsWith('functions/') ? code.slice('functions/'.length) : code;
}

const hasCyrillic = (text) => /[Ѐ-ӿ]/.test(text || '');

export function functionsErrorMessage(error, fallback = 'Дошло је до грешке. Покушајте поново.') {
  const code = normalizeCode(error);
  // Server messages written in Cyrillic are meant for the user; show them as-is.
  if (code && code !== 'internal' && hasCyrillic(error?.message)) return error.message;
  return FUNCTIONS_MESSAGES[code] || fallback;
}

export function authErrorMessage(error, fallback = 'Дошло је до грешке. Покушајте поново.') {
  return AUTH_MESSAGES[error?.code] || fallback;
}

/** Messages for the course/package purchase flow. */
export function purchaseErrorMessage(error) {
  const code = normalizeCode(error);
  if (code === 'failed-precondition' && hasCyrillic(error?.message)) return error.message;
  switch (code) {
    case 'already-exists':
      return 'Већ имате приступ овом курсу. Пронађите га на свом панелу.';
    case 'failed-precondition':
      return 'Куповина тренутно није могућа. Потврдите имејл адресу или покушајте касније.';
    case 'resource-exhausted':
      return 'Превише покушаја за кратко време. Сачекајте минут и покушајте поново.';
    case 'unauthenticated':
      return 'Пријавите се да бисте наставили са куповином.';
    case 'not-found':
      return 'Курс није пронађен. Освежите страницу и покушајте поново.';
    default:
      return 'Грешка при креирању уплатнице. Покушајте поново.';
  }
}
