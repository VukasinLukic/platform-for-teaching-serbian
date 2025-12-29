/**
 * Delete User from Firebase Authentication
 * Cloud Function to delete user account from Firebase Authentication
 */

import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Delete user from Firebase Authentication
 * Only admins can call this function
 */
export const deleteUserAuth = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Морате бити пријављени.');
  }

  // ✅ Check if user is admin using custom claims (FAST!)
  if (!request.auth.token.role || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Само администратори могу брисати кориснике.');
  }

  const db = getFirestore();

  const { userId } = request.data;

  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId је обавезан параметар.');
  }

  // Prevent admin from deleting themselves
  if (userId === request.auth.uid) {
    throw new HttpsError('invalid-argument', 'Не можете обрисати сопствени налог.');
  }

  try {
    // Delete user from Firebase Authentication
    await getAuth().deleteUser(userId);

    console.log(`User ${userId} deleted from Firebase Authentication by admin ${request.auth.uid}`);

    return {
      success: true,
      message: 'Корисник је успешно обрисан из Authentication.',
      userId: userId
    };
  } catch (error) {
    console.error('Error deleting user from Authentication:', error);

    // Handle specific error codes
    if (error.code === 'auth/user-not-found') {
      // User doesn't exist in Authentication, but that's okay
      return {
        success: true,
        message: 'Корисник није пронађен у Authentication (можда је већ обрисан).',
        userId: userId
      };
    }

    throw new HttpsError('internal', `Грешка при брисању корисника: ${error.message}`);
  }
});

/**
 * Bulk delete users from Firebase Authentication
 * Deletes multiple users at once
 */
export const bulkDeleteUsersAuth = onCall(async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Морате бити пријављени.');
  }

  // ✅ Check if user is admin using custom claims (FAST!)
  if (!request.auth.token.role || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Само администратори могу брисати кориснике.');
  }

  const db = getFirestore();

  const { userIds } = request.data;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new HttpsError('invalid-argument', 'userIds мора бити непразан низ.');
  }

  // Prevent admin from deleting themselves
  if (userIds.includes(request.auth.uid)) {
    throw new HttpsError('invalid-argument', 'Не можете обрисати сопствени налог.');
  }

  try {
    const auth = getAuth();
    const results = {
      deleted: [],
      notFound: [],
      errors: []
    };

    // Delete users one by one (Firebase doesn't have bulk delete for auth)
    for (const userId of userIds) {
      try {
        await auth.deleteUser(userId);
        results.deleted.push(userId);
        console.log(`User ${userId} deleted from Firebase Authentication`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          results.notFound.push(userId);
        } else {
          results.errors.push({ userId, error: error.message });
        }
      }
    }

    return {
      success: true,
      message: `Обрисано ${results.deleted.length} корисника.`,
      results
    };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    throw new HttpsError('internal', `Грешка при брисању корисника: ${error.message}`);
  }
});
