/**
 * Firebase Cloud Functions
 * Entry point for all cloud functions
 */

import { initializeApp } from 'firebase-admin/app';
import { onCall } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';

// Initialize Firebase Admin
initializeApp();

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

/**
 * Test function to verify deployment
 */
export const helloWorld = onCall(async (request) => {
  return {
    message: 'Hello from Online Srpski Kursevi!',
    timestamp: new Date().toISOString(),
  };
});

// Import functions
export { getVideoUrl } from './generateSignedUrl.js';
export { generateInvoice } from './generateInvoice.js';
export { confirmPayment, rejectPayment } from './confirmPayment.js';
export { uploadVideoToR2, deleteVideoFromR2 } from './uploadVideoToR2.js';

// Email functions (replacing EmailJS)
export {
  sendContactFormEmail,
  sendPaymentConfirmationEmail,
  sendPaymentRejectionEmail,
  sendWelcomeEmail,
  sendClassReminderEmail,
} from './sendEmail.js';

// Seed functions
export { seedOnlinePackages } from './seedPackagesFunction.js';

// User management functions
export { deleteUserAuth, bulkDeleteUsersAuth } from './deleteUserAuth.js';

// Scheduled cleanup functions
export { cleanupOldPendingTransactions } from './cleanupTransactions.js';

// Email verification functions
export {
  sendVerificationEmail as sendVerificationEmailFunction,
  verifyEmailToken,
  resendVerificationEmail,
} from './emailVerification.js';
