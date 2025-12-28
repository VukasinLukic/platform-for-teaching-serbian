/**
 * Confirm Payment - Admin function to verify and confirm user payments
 * Grants access to course after successful verification
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';
import nodemailer from 'nodemailer';

// Gmail credentials
const gmailUser = defineString('GMAIL_USER', { default: 'vukasin4sports@gmail.com' });
const gmailPassword = defineString('GMAIL_PASSWORD', { default: 'ltlf ziag mpma chat' });

// Get email transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser.value(),
      pass: gmailPassword.value(),
    },
  });
};

/**
 * Confirm a pending payment and grant course access
 */
export const confirmPayment = onCall({ region: 'europe-west1' }, async (request) => {
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

    // ✅ IDEMPOTENCY CHECK - Proveri da li je transakcija već potvrđena
    if (transaction.status !== 'pending') {
      throw new HttpsError('failed-precondition', `Transakcija je već ${transaction.status}`);
    }

    // ✅ VALIDATION - Proveri da li userId i courseId odgovaraju transakciji
    const txUserId = transaction.userId || transaction.user_id;
    const txCourseId = transaction.course_id || transaction.courseId;

    if (txUserId !== userId) {
      throw new HttpsError(
        'invalid-argument',
        'userId se ne poklapa sa transakcijom'
      );
    }

    if (txCourseId !== courseId) {
      throw new HttpsError(
        'invalid-argument',
        'courseId se ne poklapa sa transakcijom'
      );
    }

    // ✅ DUPLICATE PAYMENT PREVENTION - Proveri da li korisnik već ima pristup kursu
    const userCoursesRef = db.collection('user_courses').doc(userId);
    const userCoursesDoc = await userCoursesRef.get();

    if (userCoursesDoc.exists()) {
      const courses = userCoursesDoc.data().courses || {};
      if (courses[courseId] && courses[courseId].active) {
        throw new HttpsError(
          'already-exists',
          'Korisnik već ima pristup ovom kursu!'
        );
      }
    }

    // Update transaction status
    await transactionRef.update({
      status: 'confirmed',
      confirmed_at: FieldValue.serverTimestamp(),
      confirmed_by: request.auth.uid,
    });

    // Grant user access to course (reuse userCoursesRef from above)
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

    // Send confirmation email to user
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const courseData = courseDoc.data();

      if (userData && userData.email) {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: `"Srpski u Srcu" <${gmailUser.value()}>`,
          to: userData.email,
          subject: `✅ Vaša uplata je potvrđena - ${courseData?.title || transaction.packageName || 'Kurs'}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #F5F3EF; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px;">
                <div style="background: linear-gradient(135deg, #BFECC9, #9DD6AC); color: #003366; padding: 30px; border-radius: 16px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                  <h1 style="margin: 0; font-size: 28px;">Uplata potvrđena!</h1>
                </div>
                <div style="padding: 30px 0;">
                  <p>Pozdrav <strong>${userData.ime || 'Korisniče'}</strong>,</p>
                  <p>Vaša uplata je uspešno potvrđena! Sada imate pristup kursu:</p>
                  <div style="background: #F5F3EF; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <h3 style="color: #003366; margin-top: 0;">${courseData?.title || transaction.packageName || 'Kurs'}</h3>
                    <p style="color: #666; margin: 5px 0;">ID transakcije: <strong>${transactionId}</strong></p>
                  </div>
                  <p>Možete početi sa učenjem odmah! Prijavite se na platformu i pristupite kursu.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://srpskiusrcu.com/dashboard" style="background: #003366; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: bold;">Idi na Dashboard</a>
                  </div>
                </div>
                <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                  <p>Srpski u Srcu - Online platforma za učenje</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Payment confirmation email sent to ${userData.email}`);
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the whole operation if email fails
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
export const rejectPayment = onCall({ region: 'europe-west1' }, async (request) => {
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

    // ✅ CLEANUP orphaned enrollments - Ako postoji enrollment za ovu transakciju, označi ga kao rejected
    try {
      const enrollmentsSnapshot = await db.collection('online_enrollments')
        .where('transactionId', '==', transactionId)
        .get();

      if (!enrollmentsSnapshot.empty) {
        const enrollmentDoc = enrollmentsSnapshot.docs[0];
        await enrollmentDoc.ref.update({
          status: 'rejected',
          rejectedAt: FieldValue.serverTimestamp(),
          rejectionReason: reason || 'Nevalidna uplata'
        });
        console.log(`Enrollment ${enrollmentDoc.id} marked as rejected`);
      }
    } catch (enrollmentError) {
      console.error('Error updating enrollment:', enrollmentError);
      // Don't fail the whole operation if enrollment update fails
    }

    // Send rejection email to user
    try {
      const userDoc = await db.collection('users').doc(transaction.user_id || transaction.userId).get();
      const userData = userDoc.data();

      if (userData && userData.email) {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: `"Srpski u Srcu" <${gmailUser.value()}>`,
          to: userData.email,
          subject: `❌ Vaša uplata je odbijena - ${transaction.packageName || 'Kurs'}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #F5F3EF; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px;">
                <div style="background: linear-gradient(135deg, #FFB8B8, #FF9090); color: #8B0000; padding: 30px; border-radius: 16px; text-align: center;">
                  <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
                  <h1 style="margin: 0; font-size: 28px;">Uplata odbijena</h1>
                </div>
                <div style="padding: 30px 0;">
                  <p>Pozdrav <strong>${userData.ime || 'Korisniče'}</strong>,</p>
                  <p>Nažalost, vaša uplata za kurs <strong>${transaction.packageName || 'Kurs'}</strong> je odbijena.</p>
                  <div style="background: #FFF3F3; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                    <h4 style="color: #8B0000; margin-top: 0;">Razlog odbijanja:</h4>
                    <p style="color: #666; margin: 5px 0;">${reason || 'Nevalidna uplata'}</p>
                  </div>
                  <p>Molimo vas da proverite detalje uplate i pokušate ponovo. Ukoliko imate pitanja, slobodno nas kontaktirajte.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://srpskiusrcu.com/contact" style="background: #003366; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; display: inline-block; font-weight: bold;">Kontaktirajte nas</a>
                  </div>
                </div>
                <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                  <p>Srpski u Srcu - Online platforma za učenje</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Payment rejection email sent to ${userData.email}`);
      }
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the whole operation if email fails
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
