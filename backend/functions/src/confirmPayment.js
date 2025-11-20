/**
 * Confirm Payment - Admin function to verify and confirm user payments
 * Grants access to course after successful verification
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  sendPaymentConfirmationEmail,
  sendPaymentRejectionEmail,
} from './sendEmail.js';

/**
 * Confirm a pending payment and grant course access
 */
export const confirmPayment = onCall(async (request) => {
  const db = getFirestore();

  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  // Check if user is admin
  const adminDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Samo admin može da potvrđuje uplate');
  }

  const { transactionId, userId, courseId } = request.data;

  if (!transactionId || !userId || !courseId) {
    throw new HttpsError('invalid-argument', 'transactionId, userId i courseId su obavezni');
  }

  try {
    // Get transaction
    const transactionRef = db.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      throw new HttpsError('not-found', 'Transakcija ne postoji');
    }

    const transaction = transactionDoc.data();

    if (transaction.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Transakcija je već ${transaction.status}`);
    }

    // Update transaction status
    await transactionRef.update({
      status: 'confirmed',
      confirmed_at: FieldValue.serverTimestamp(),
      confirmed_by: request.auth.uid,
    });

    // Grant user access to course
    const userCoursesRef = db.collection('user_courses').doc(userId);
    await userCoursesRef.set(
      {
        courses: {
          [courseId]: {
            purchased_at: FieldValue.serverTimestamp(),
            transaction_id: transactionId,
          },
        },
      },
      { merge: true }
    );

    // Send email notification to user
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const courseDoc = await db.collection('courses').doc(courseId).get();

      if (userDoc.exists && courseDoc.exists) {
        const user = userDoc.data();
        const course = courseDoc.data();

        await sendPaymentConfirmationEmail(
          user.email,
          user.ime || user.email.split('@')[0], // Fallback to email username if name not set
          course.title,
          transactionId
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the payment confirmation
      console.error('Failed to send confirmation email:', emailError);
    }

    return {
      success: true,
      message: 'Uplata uspešno potvrđena',
      transactionId,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Greška pri potvrđivanju uplate');
  }
});

/**
 * Reject a pending payment
 */
export const rejectPayment = onCall(async (request) => {
  const db = getFirestore();

  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  // Check if user is admin
  const adminDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!adminDoc.exists || adminDoc.data().role !== 'admin') {
    throw new HttpsError('permission-denied', 'Samo admin može da odbije uplate');
  }

  const { transactionId, reason } = request.data;

  if (!transactionId) {
    throw new HttpsError('invalid-argument', 'transactionId je obavezan');
  }

  try {
    // Get transaction
    const transactionRef = db.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      throw new HttpsError('not-found', 'Transakcija ne postoji');
    }

    const transaction = transactionDoc.data();

    if (transaction.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Transakcija je već ${transaction.status}`);
    }

    // Update transaction status
    await transactionRef.update({
      status: 'rejected',
      rejected_at: FieldValue.serverTimestamp(),
      rejected_by: request.auth.uid,
      rejection_reason: reason || 'Nevalidna uplata',
    });

    // Send email notification to user about rejection
    try {
      const userDoc = await db.collection('users').doc(transaction.user_id).get();
      const courseDoc = await db.collection('courses').doc(transaction.course_id).get();

      if (userDoc.exists && courseDoc.exists) {
        const user = userDoc.data();
        const course = courseDoc.data();

        await sendPaymentRejectionEmail(
          user.email,
          user.ime || user.email.split('@')[0],
          course.title,
          reason || 'Nevalidna uplata. Molimo kontaktirajte administratora za više informacija.'
        );
      }
    } catch (emailError) {
      // Log email error but don't fail the rejection
      console.error('Failed to send rejection email:', emailError);
    }

    return {
      success: true,
      message: 'Uplata odbijena',
      transactionId,
    };
  } catch (error) {
    console.error('Error rejecting payment:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Greška pri odbijanju uplate');
  }
});
