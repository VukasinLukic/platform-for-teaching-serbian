/**
 * One-off migration: add canonical camelCase fields to legacy transaction docs.
 *
 * Adds (only when missing): userId, courseId, type, paymentRef, createdAt
 * (Timestamp), plus the legacy mirrors user_id / created_at so Firestore rules
 * and existing indexes keep matching. Never removes or overwrites fields.
 *
 * Usage (from backend/functions, with Application Default Credentials or
 * GOOGLE_APPLICATION_CREDENTIALS pointing at a service account):
 *   GCLOUD_PROJECT=naucisprski node scripts/normalizeTransactions.js          # dry run
 *   GCLOUD_PROJECT=naucisprski node scripts/normalizeTransactions.js --apply  # write
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { missingCanonicalFields } from '../src/transactionModel.js';

const APPLY = process.argv.includes('--apply');
const BATCH_SIZE = 400;

initializeApp();
const db = getFirestore();

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing changes)' : 'DRY RUN (no writes, pass --apply to write)'}`);

  const snapshot = await db.collection('transactions').get();
  console.log(`Scanned ${snapshot.size} transactions`);

  const updates = [];
  for (const doc of snapshot.docs) {
    const patch = missingCanonicalFields(doc.data());
    if (Object.keys(patch).length > 0) {
      updates.push({ ref: doc.ref, patch });
      const printable = Object.fromEntries(
        Object.entries(patch).map(([k, v]) => [k, v && typeof v.toDate === 'function' ? v.toDate().toISOString() : v])
      );
      console.log(`- ${doc.id}: ${JSON.stringify(printable)}`);
    }
  }

  console.log(`${updates.length} document(s) need new fields`);

  if (!APPLY || updates.length === 0) return;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = db.batch();
    updates.slice(i, i + BATCH_SIZE).forEach(({ ref, patch }) => batch.update(ref, patch));
    await batch.commit();
    console.log(`Committed ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length}`);
  }
  console.log('Done.');
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
