/**
 * Transaction data model helpers.
 *
 * Canonical shape (all NEW writes, see backend createCourseTransaction/generateInvoice):
 *   { userId, courseId, packageId, type, amount, status, paymentRef,
 *     createdAt (serverTimestamp), courseName, packageName }
 *
 * Legacy documents may use snake_case (`user_id`, `course_id`, `created_at`,
 * `payment_ref`) or `paymentReference`, and dates stored as ISO strings, JS Dates
 * or Firestore Timestamps. New writes still mirror `user_id`/`course_id`/
 * `payment_ref`/`created_at` for compatibility (Firestore rules, indexes, older
 * clients) until the migration script has run everywhere.
 *
 * Every reader must go through normalizeTransaction() and use only camelCase fields.
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Convert Firestore Timestamp / Date / ISO string / millis into a Date (or null).
 * @param {*} value
 * @returns {Date|null}
 */
export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6));
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Normalize a transaction document (DocumentSnapshot or plain object) into the
 * canonical camelCase shape. Unknown/extra fields are preserved.
 * @param {import('firebase/firestore').DocumentSnapshot|Object} docOrData
 * @returns {Object|null}
 */
export const normalizeTransaction = (docOrData) => {
  if (!docOrData) return null;
  const isSnapshot = typeof docOrData.data === 'function';
  const raw = isSnapshot ? docOrData.data() || {} : docOrData;
  const id = isSnapshot ? docOrData.id : raw.id;

  return {
    ...raw,
    id,
    type: raw.type || (raw.packageId ? 'online_package' : 'course'),
    userId: raw.userId || raw.user_id || null,
    courseId: raw.courseId || raw.course_id || null,
    packageId: raw.packageId || raw.package_id || null,
    amount: Number(raw.amount) || 0,
    status: raw.status || 'pending',
    paymentRef: raw.paymentRef || raw.payment_ref || raw.paymentReference || null,
    createdAt: toDate(raw.createdAt || raw.created_at),
    courseName: raw.courseName || raw.course_name || null,
    packageName: raw.packageName || raw.package_name || null,
    userEmail: raw.userEmail || raw.user_email || null,
    confirmationUrl: raw.confirmationUrl || raw.confirmation_url || null,
    invoiceUrl: raw.invoiceUrl || raw.invoice_url || null,
  };
};

/**
 * Sort normalized transactions newest first (missing dates last).
 */
export const sortByCreatedAtDesc = (list) =>
  [...list].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

/**
 * Fetch all transaction snapshots for a user, matching both `userId` and the
 * legacy `user_id` field. Returns de-duplicated QueryDocumentSnapshots.
 * @param {string} userId
 */
export const getUserTransactionDocs = async (userId) => {
  const col = collection(db, 'transactions');
  const [camel, snake] = await Promise.all([
    getDocs(query(col, where('userId', '==', userId))),
    getDocs(query(col, where('user_id', '==', userId))),
  ]);
  const byId = new Map();
  [...camel.docs, ...snake.docs].forEach((d) => byId.set(d.id, d));
  return [...byId.values()];
};
