/**
 * Email Verification System
 * Handles custom email verification flow with tokens
 */

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { sendVerificationEmail as sendEmail, sendWelcomeEmailInternal } from './sendEmail.js';
import crypto from 'crypto';

const db = getFirestore();

/**
 * Generate a unique verification token
 * @returns {string} Random verification token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send welcome email after successful verification
 */
async function sendWelcomeEmailAfterVerification(userEmail, userName) {
  try {
    await sendWelcomeEmailInternal({ userEmail, userName });
    console.log(`✅ Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${userEmail}:`, error);
  }
}

/**
 * Send verification email with custom token
 * Called after user registration
 * CORS enabled for cross-origin requests
 */
export const sendVerificationEmail = onCall({
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://naucisprski.web.app',
    'https://naucisprski.firebaseapp.com',
    'https://srpskiusrcu.com',
    'https://www.srpskiusrcu.com',
    'https://srpskiusrcu.rs',
    'https://www.srpskiusrcu.rs'
  ],
  region: 'us-central1',
  invoker: 'public'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }

  const userId = request.auth.uid;

  try {
    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Korisnik ne postoji');
    }

    const userData = userDoc.data();

    // Check if already verified
    if (userData.emailVerified) {
      throw new HttpsError('already-exists', 'Email je već verifikovan');
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60); // Token expires in 60 minutes

    // Store verification token in database
    await db.collection('email_verifications').doc(token).set({
      userId: userId,
      email: userData.email,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      verified: false
    });

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;

    await sendEmail({
      userEmail: userData.email,
      userName: userData.ime,
      verificationUrl: verificationUrl
    });

    console.log(`✅ Verification email sent to ${userData.email}`);

    return {
      success: true,
      message: 'Email za verifikaciju je poslat. Proverite svoj inbox.'
    };

  } catch (error) {
    console.error('Error sending verification email:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Greška prilikom slanja email-a');
  }
});

/**
 * Verify email using token from URL
 * Called when user clicks verification link
 * CORS enabled for cross-origin requests
 */
export const verifyEmailToken = onCall({
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://naucisprski.web.app',
    'https://naucisprski.firebaseapp.com',
    'https://srpskiusrcu.com',
    'https://www.srpskiusrcu.com',
    'https://srpskiusrcu.rs',
    'https://www.srpskiusrcu.rs'
  ],
  region: 'us-central1',
  invoker: 'public'
}, async (request) => {
  const { token } = request.data;

  if (!token) {
    throw new HttpsError('invalid-argument', 'Token nije prosleđen');
  }

  try {
    // Get verification document
    const verificationDoc = await db.collection('email_verifications').doc(token).get();

    if (!verificationDoc.exists) {
      throw new HttpsError('not-found', 'Nevažeći ili istekao token');
    }

    const verificationData = verificationDoc.data();

    // Check if already verified
    if (verificationData.verified) {
      throw new HttpsError('already-exists', 'Ovaj token je već iskorišćen');
    }

    // Check if token expired
    const now = new Date();
    const expiresAt = verificationData.expiresAt.toDate();

    if (now > expiresAt) {
      // Delete expired token
      await db.collection('email_verifications').doc(token).delete();
      throw new HttpsError('deadline-exceeded', 'Token je istekao. Molimo zatražite novi email.');
    }

    const userId = verificationData.userId;

    // Update user document - mark email as verified
    await db.collection('users').doc(userId).update({
      emailVerified: true,
      verifiedAt: FieldValue.serverTimestamp()
    });

    // Update Firebase Auth email verification status
    await getAuth().updateUser(userId, {
      emailVerified: true
    });

    // Mark token as used
    await db.collection('email_verifications').doc(token).update({
      verified: true,
      verifiedAt: FieldValue.serverTimestamp()
    });

    console.log(`✅ Email verified for user ${userId}`);

    // Get user data to send welcome email
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    // Send welcome email after successful verification
    await sendWelcomeEmailAfterVerification(verificationData.email, userData.ime);

    return {
      success: true,
      message: 'Email uspešno verifikovan! Možete koristiti aplikaciju.'
    };

  } catch (error) {
    console.error('Error verifying email token:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Greška prilikom verifikacije');
  }
});

/**
 * Resend verification email
 * Allows user to request new verification email if previous one expired
 * CORS enabled for cross-origin requests
 */
export const resendVerificationEmail = onCall({
  cors: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://naucisprski.web.app',
    'https://naucisprski.firebaseapp.com',
    'https://srpskiusrcu.com',
    'https://www.srpskiusrcu.com',
    'https://srpskiusrcu.rs',
    'https://www.srpskiusrcu.rs'
  ],
  region: 'us-central1',
  invoker: 'public'
}, async (request) => {
  console.log('🔵 resendVerificationEmail called');
  console.log('🔵 Request auth:', request.auth ? 'Authenticated' : 'Not authenticated');
  console.log('🔵 Request data:', request.data);

  if (!request.auth) {
    console.error('❌ No authentication found');
    throw new HttpsError('unauthenticated', 'Morate biti prijavljeni');
  }

  const userId = request.auth.uid;
  console.log('🔵 User ID:', userId);

  try {
    // Get user data
    console.log('🔵 Fetching user document...');
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Korisnik ne postoji');
    }

    const userData = userDoc.data();
    console.log('🔵 User data found:', userData.email);

    // Check if already verified
    if (userData.emailVerified) {
      console.log('⚠️ Email already verified');
      throw new HttpsError('already-exists', 'Email je već verifikovan');
    }

    // Delete any existing verification tokens for this user
    console.log('🔵 Deleting old tokens...');
    const existingTokens = await db.collection('email_verifications')
      .where('userId', '==', userId)
      .where('verified', '==', false)
      .get();

    const batch = db.batch();
    existingTokens.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`🔵 Deleted ${existingTokens.docs.length} old tokens`);

    // Generate new verification token
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);
    console.log('🔵 Generated new token:', token.substring(0, 10) + '...');

    // Store new verification token
    await db.collection('email_verifications').doc(token).set({
      userId: userId,
      email: userData.email,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      verified: false
    });
    console.log('🔵 Token stored in database');

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;
    console.log('🔵 Sending email to:', userData.email);

    await sendEmail({
      userEmail: userData.email,
      userName: userData.ime,
      verificationUrl: verificationUrl
    });

    console.log(`✅ Verification email resent to ${userData.email}`);

    return {
      success: true,
      message: 'Novi email za verifikaciju je poslat.'
    };

  } catch (error) {
    console.error('Error resending verification email:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Greška prilikom slanja email-a');
  }
});
