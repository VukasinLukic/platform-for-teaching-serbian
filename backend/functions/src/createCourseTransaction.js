/**
 * Create Course Transaction
 * Creates (or reuses) a pending transaction for a course purchase on the server,
 * so the amount and course always come from the database, never from the client.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit } from './rate-limiter.js';
import { nextPaymentReference } from './generatePaymentReference.js';

export const createCourseTransaction = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }

  const { courseId } = request.data || {};
  const userId = request.auth.uid;

  if (!courseId || typeof courseId !== 'string') {
    throw new HttpsError('invalid-argument', 'courseId je obavezan');
  }

  await checkRateLimit(userId, 'create_transaction', 10, 60);

  try {
    const db = getFirestore();

    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new HttpsError('not-found', 'Kurs ne postoji');
    }
    const course = courseDoc.data();

    if (typeof course.price !== 'number' || course.price <= 0) {
      throw new HttpsError('failed-precondition', 'Kurs trenutno nije dostupan za kupovinu');
    }

    const userCoursesDoc = await db.collection('user_courses').doc(userId).get();
    if (userCoursesDoc.exists && (userCoursesDoc.data().courses || {})[courseId]) {
      throw new HttpsError('already-exists', 'Već imate pristup ovom kursu');
    }

    // Reuse an existing pending transaction for the same course
    const existing = await db.collection('transactions')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existing.empty) {
      const tx = existing.docs[0];
      const data = tx.data();
      return {
        transactionId: tx.id,
        paymentReference: data.payment_ref,
        amount: data.amount,
        courseName: data.courseName || course.title,
      };
    }

    const paymentRef = await nextPaymentReference(db);
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.exists ? userDoc.data() : {};

    const txRef = await db.collection('transactions').add({
      type: 'course',
      userId,
      user_id: userId,
      courseId,
      course_id: courseId,
      courseName: course.title || '',
      amount: course.price,
      status: 'pending',
      payment_ref: paymentRef,
      userName: user.ime || '',
      user_email: user.email || request.auth.token.email || '',
      createdAt: FieldValue.serverTimestamp(),
      created_at: FieldValue.serverTimestamp(),
    });

    return {
      transactionId: txRef.id,
      paymentReference: paymentRef,
      amount: course.price,
      courseName: course.title || '',
    };
  } catch (error) {
    console.error('Error creating course transaction:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Greška pri kreiranju uplate');
  }
});
