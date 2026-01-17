/**
 * Firebase Cloud Function for generating payment references
 * Simple 4-digit counter starting from 0100
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Generate next payment reference number
 * Returns a 4-digit number starting from 0100
 * 
 * @returns {Object} - Payment reference number
 */
export const generatePaymentReference = onCall(
  {
    cors: true,
  },
  async (request) => {
    try {
      console.log('🔵 [generatePaymentReference] Generating payment reference...');

      // Verify authentication
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Korisnik nije autentifikovan');
      }

      const db = getFirestore();
      const counterRef = db.collection('system').doc('paymentCounter');

      // Use transaction to safely increment counter
      const paymentRef = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);

        let currentNumber;
        if (!counterDoc.exists) {
          // Initialize counter at 0100
          currentNumber = 100;
          transaction.set(counterRef, { lastNumber: currentNumber });
        } else {
          // Increment counter
          currentNumber = counterDoc.data().lastNumber + 1;
          transaction.update(counterRef, { lastNumber: currentNumber });
        }

        // Format as 4-digit string (0100, 0101, etc.)
        return currentNumber.toString().padStart(4, '0');
      });

      console.log(`✅ [generatePaymentReference] Generated: ${paymentRef}`);

      return {
        success: true,
        paymentReference: paymentRef,
      };

    } catch (error) {
      console.error('❌ [generatePaymentReference] Failed:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', `Greška pri generisanju broja uplate: ${error.message}`);
    }
  }
);
