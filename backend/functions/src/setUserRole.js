/**
 * Set User Role with Custom Claims
 * Admin-only function to set user roles with Firebase Custom Claims
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Set user role (admin-only)
 * Uses Firebase Custom Claims for fast role checking
 */
export const setUserRole = onCall({
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://naucisprski.web.app',
    'https://naucisprski.firebaseapp.com',
    'https://srpskiusrcu.com',
    'https://www.srpskiusrcu.com',
    'https://srpskiusrcu.rs',
    'https://www.srpskiusrcu.rs'
  ],
  region: 'us-central1',
  invoker: 'public'
}, async (request) => {
  console.log('🔵 setUserRole called');

  // Check if user is authenticated
  if (!request.auth) {
    console.error('❌ No authentication');
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }

  // Check if caller is admin (from custom claims)
  if (!request.auth.token.role || request.auth.token.role !== 'admin') {
    console.error('❌ Not admin:', request.auth.uid);
    throw new HttpsError('permission-denied', 'Samo administratori mogu menjati role');
  }

  const { uid, role } = request.data;

  // Validate input
  if (!uid || !role) {
    throw new HttpsError('invalid-argument', 'uid i role su obavezni');
  }

  // Validate role value
  const validRoles = ['admin', 'korisnik'];
  if (!validRoles.includes(role)) {
    throw new HttpsError('invalid-argument', 'Nevažeća rola. Dozvoljeno: admin, korisnik');
  }

  try {
    console.log(`🔵 Setting role "${role}" for user ${uid}`);

    // Set custom claim (THIS IS THE KEY!)
    await getAuth().setCustomUserClaims(uid, { role });
    console.log('✅ Custom claim set');

    // Also update Firestore for consistency and UI display
    await db.collection('users').doc(uid).update({
      role,
      roleUpdatedAt: new Date().toISOString()
    });
    console.log('✅ Firestore updated');

    return {
      success: true,
      message: `Rola "${role}" uspešno postavljena za korisnika ${uid}`
    };
  } catch (error) {
    console.error('Error setting user role:', error);
    throw new HttpsError('internal', 'Greška prilikom postavljanja role');
  }
});
