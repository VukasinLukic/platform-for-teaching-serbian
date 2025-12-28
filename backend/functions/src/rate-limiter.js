/**
 * Rate Limiter Utility
 * Prevents abuse by limiting the number of requests per time window
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Check if a user has exceeded rate limit for a specific action
 * @param {string} userId - User ID or IP address
 * @param {string} action - Action name (e.g., 'contact_form', 'invoice_generation')
 * @param {number} maxAttempts - Maximum allowed attempts (default: 5)
 * @param {number} windowMinutes - Time window in minutes (default: 60)
 * @throws {HttpsError} If rate limit is exceeded
 */
export const checkRateLimit = async (userId, action, maxAttempts = 5, windowMinutes = 60) => {
  const db = getFirestore();
  const rateLimitRef = db.collection('rate_limits').doc(`${userId}_${action}`);

  try {
    const doc = await rateLimitRef.get();
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (doc.exists) {
      const data = doc.data();
      const { attempts, windowStart } = data;

      // Check if we're still within the current window
      if (now - windowStart < windowMs) {
        if (attempts >= maxAttempts) {
          throw new HttpsError(
            'resource-exhausted',
            `Previše pokušaja. Pokušajte ponovo za ${windowMinutes} minuta.`
          );
        }

        // Increment attempts within current window
        await rateLimitRef.update({
          attempts: attempts + 1,
          lastAttempt: FieldValue.serverTimestamp()
        });
      } else {
        // Start new window
        await rateLimitRef.set({
          attempts: 1,
          windowStart: now,
          lastAttempt: FieldValue.serverTimestamp()
        });
      }
    } else {
      // First attempt - create document
      await rateLimitRef.set({
        attempts: 1,
        windowStart: now,
        lastAttempt: FieldValue.serverTimestamp(),
        action
      });
    }

    return true;
  } catch (error) {
    // If it's already a rate limit error, rethrow it
    if (error instanceof HttpsError && error.code === 'resource-exhausted') {
      throw error;
    }

    // Log other errors but don't block the request
    console.error('Rate limiter error:', error);
    return true;
  }
};

/**
 * Reset rate limit for a specific user and action
 * Useful for admin operations or testing
 * @param {string} userId - User ID
 * @param {string} action - Action name
 */
export const resetRateLimit = async (userId, action) => {
  const db = getFirestore();
  const rateLimitRef = db.collection('rate_limits').doc(`${userId}_${action}`);

  try {
    await rateLimitRef.delete();
    console.log(`Rate limit reset for ${userId} - ${action}`);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
};

/**
 * Get current rate limit status for a user and action
 * @param {string} userId - User ID
 * @param {string} action - Action name
 * @returns {Promise<Object>} Rate limit status
 */
export const getRateLimitStatus = async (userId, action) => {
  const db = getFirestore();
  const rateLimitRef = db.collection('rate_limits').doc(`${userId}_${action}`);

  try {
    const doc = await rateLimitRef.get();

    if (!doc.exists) {
      return {
        hasLimit: false,
        attempts: 0,
        remainingAttempts: Infinity
      };
    }

    const data = doc.data();
    return {
      hasLimit: true,
      attempts: data.attempts,
      windowStart: data.windowStart,
      lastAttempt: data.lastAttempt
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
};
