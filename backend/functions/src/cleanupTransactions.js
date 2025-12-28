/**
 * Cleanup Old Pending Transactions
 * Scheduled function that runs every 24 hours to expire old pending transactions
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Cleanup old pending transactions that are older than 30 days
 * Runs every 24 hours at midnight
 */
export const cleanupOldPendingTransactions = onSchedule(
  {
    schedule: 'every 24 hours',
    region: 'europe-west1',
    timeZone: 'Europe/Belgrade'
  },
  async (event) => {
    const db = getFirestore();

    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

      // Query old pending transactions
      const oldPendingQuery = db.collection('transactions')
        .where('status', '==', 'pending')
        .where('created_at', '<', thirtyDaysAgoTimestamp);

      const oldPendingSnapshot = await oldPendingQuery.get();

      if (oldPendingSnapshot.empty) {
        console.log('No old pending transactions to clean up');
        return null;
      }

      // Use batch write for atomic operation
      const batch = db.batch();
      let expiredCount = 0;

      oldPendingSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'expired',
          expired_at: FieldValue.serverTimestamp(),
          updated_at: FieldValue.serverTimestamp()
        });
        expiredCount++;
      });

      // Commit batch
      await batch.commit();

      console.log(`✅ Successfully expired ${expiredCount} old pending transactions`);
      return { success: true, expiredCount };
    } catch (error) {
      console.error('Error cleaning up old pending transactions:', error);
      throw error;
    }
  }
);
