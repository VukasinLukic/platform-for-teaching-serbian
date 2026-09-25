/**
 * Initializes the Firebase Admin SDK. Imported first in index.js so the app exists
 * before any module that calls getFirestore()/getAuth() at load time.
 */

import { initializeApp, getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}
