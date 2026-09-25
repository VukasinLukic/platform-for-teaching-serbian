/**
 * Shared security helpers for Cloud Functions
 */

import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Throws unless the caller is signed in and has the `role: admin` custom claim.
 * Custom claims can only be set with the Admin SDK, so users cannot grant them to themselves.
 */
export const requireAdmin = (request, message = 'Samo administrator može da izvrši ovu akciju') => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }
  if (request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', message);
  }
};

/**
 * Escapes a value for safe interpolation into HTML (text and attribute context).
 */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Returns a copy of `params` with every string/number value HTML-escaped.
 */
export const escapeParams = (params = {}) => {
  const escaped = {};
  for (const [key, value] of Object.entries(params)) {
    escaped[key] = value === null || value === undefined ? value : escapeHtml(value);
  }
  return escaped;
};

/**
 * Accepts only absolute https:// URLs; anything else returns null.
 */
export const safeHttpsUrl = (value) => {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

export const SITE_URL = process.env.FRONTEND_URL || 'https://srpskiusrcu.rs';

/**
 * App Check enforcement for public callables. Turn on with ENFORCE_APP_CHECK=true in
 * backend/functions/.env only after App Check is registered in the Firebase console and
 * VITE_RECAPTCHA_ENTERPRISE_SITE_KEY is set in the frontend, otherwise calls will fail.
 */
export const APP_CHECK = process.env.ENFORCE_APP_CHECK === 'true' ? { enforceAppCheck: true } : {};
