/**
 * Transaction data model (server side).
 *
 * Canonical camelCase fields for every NEW write:
 *   userId, courseId, packageId, type, amount, status, paymentRef,
 *   createdAt (serverTimestamp), courseName / packageName
 *
 * Legacy mirrors still written for compatibility until the migration
 * (scripts/normalizeTransactions.js) has run and all clients read camelCase:
 *   user_id, course_id, payment_ref, created_at
 * - `user_id` keeps Firestore/Storage rules (`isTransactionOwner`) and older
 *   deployed frontends working; rules accept either field.
 * - `created_at` keeps the existing composite indexes (user_id/status + created_at)
 *   and older admin screens that `orderBy('created_at')` working.
 *
 * Readers must use normalizeTransaction() and never read legacy fields directly.
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Convert Timestamp / Date / ISO string / millis into a Date (or null).
 */
export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'object' && typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Normalize a transaction snapshot or plain object into the canonical shape.
 * Extra fields are preserved.
 */
export const normalizeTransaction = (docOrData) => {
  if (!docOrData) return null;
  const isSnapshot = typeof docOrData.data === 'function';
  const raw = (isSnapshot ? docOrData.data() : docOrData) || {};
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
  };
};

/**
 * Compute the camelCase fields missing from a legacy document (used by the
 * migration script). Never removes or overwrites existing fields.
 * @returns {Object} fields to merge (empty when nothing is missing)
 */
export const missingCanonicalFields = (raw) => {
  const n = normalizeTransaction(raw);
  const patch = {};
  if (!raw.userId && n.userId) patch.userId = n.userId;
  if (!raw.courseId && n.courseId) patch.courseId = n.courseId;
  if (!raw.type) patch.type = n.type;
  if (!raw.paymentRef && n.paymentRef) patch.paymentRef = n.paymentRef;
  if (!raw.createdAt && n.createdAt) patch.createdAt = Timestamp.fromDate(n.createdAt);
  // Keep the legacy mirrors complete too, so rules/indexes keep matching
  if (!raw.user_id && n.userId) patch.user_id = n.userId;
  if (!raw.created_at && n.createdAt) patch.created_at = Timestamp.fromDate(n.createdAt);
  return patch;
};
