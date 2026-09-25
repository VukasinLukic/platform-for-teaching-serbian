/**
 * Cleanup Old Pending Transactions
 * Scheduled function that runs every 24 hours to expire old pending transactions
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { normalizeTransaction } from './transactionModel.js';

/**
 * Cleanup old pending transactions that are older than 30 days
 * Runs every 24 hours at midnight
 */
export const cleanupOldPendingTransactions = onSchedule(
  {
    schedule: 'every 24 hours',
    timeZone: 'Europe/Belgrade'
  },
  async () => {
    const db = getFirestore();

    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all pending transactions and filter by date in code: legacy docs store
      // the creation date as `created_at` (Timestamp, Date or ISO string) while new
      // ones use `createdAt`, so a single range query would miss some of them.
      // The pending set is small, so this stays cheap and needs no composite index.
      const pendingSnapshot = await db.collection('transactions')
        .where('status', '==', 'pending')
        .get();

      const oldPendingDocs = pendingSnapshot.docs.filter((doc) => {
        const { createdAt } = normalizeTransaction(doc);
        return createdAt && createdAt < thirtyDaysAgo;
      });

      if (oldPendingDocs.length === 0) {
        console.log('No old pending transactions to clean up');
        return null;
      }

      // Batched writes are limited to 500 operations each
      let expiredCount = 0;
      for (let i = 0; i < oldPendingDocs.length; i += 400) {
        const batch = db.batch();
        oldPendingDocs.slice(i, i + 400).forEach((doc) => {
          batch.update(doc.ref, {
            status: 'expired',
            expired_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp()
          });
          expiredCount++;
        });
        await batch.commit();
      }

      console.log(`✅ Successfully expired ${expiredCount} old pending transactions`);
      return { success: true, expiredCount };
    } catch (error) {
      console.error('Error cleaning up old pending transactions:', error);
      throw error;
    }
  }
);
