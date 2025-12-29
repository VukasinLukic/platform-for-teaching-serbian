/**
 * Initialize Admin Custom Claim
 * One-time function to set custom claim for the first admin user
 * SECURITY: This function should be removed or secured after initial setup!
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

/**
 * Initialize admin custom claim for a user
 * ONLY USE ONCE during initial setup!
 */
export const initializeAdminClaim = onCall({
  cors: true,
  region: 'us-central1'
}, async (request) => {
  const { email } = request.data;

  if (!email) {
    throw new HttpsError('invalid-argument', 'email je obavezan');
  }

  // SECURITY: You can add a secret key check here
  // if (request.data.secret !== 'your-secret-key') {
  //   throw new HttpsError('permission-denied', 'Invalid secret');
  // }

  try {
    const auth = getAuth();

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid} - ${userRecord.email}`);

    // Set custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
    console.log('✅ Custom claim "role: admin" set');

    // Update Firestore
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      roleUpdatedAt: new Date().toISOString()
    });
    console.log('✅ Firestore role updated');

    return {
      success: true,
      message: `Admin custom claim set for ${email}. User must log out and log back in.`,
      userId: userRecord.uid
    };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new HttpsError('internal', `Greška: ${error.message}`);
  }
});
