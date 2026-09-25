/**
 * Firebase Cloud Functions
 * Entry point for all cloud functions
 */

// Must stay the first import: initializes Firebase Admin before other modules load
import './initAdmin.js';
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Import functions
export { getVideoUrl, getMaterialUrl } from './generateSignedUrl.js';
export { createCourseTransaction } from './createCourseTransaction.js';
export { generateInvoice } from './generateInvoice.js';
export { confirmPayment, rejectPayment } from './confirmPayment.js';
export { generateUploadUrl, uploadVideoToR2, deleteVideoFromR2 } from './uploadVideoToR2.js';
export { generatePaymentReference } from './generatePaymentReference.js';

// Email functions (replacing EmailJS)
export {
  sendContactFormEmail,
  sendPaymentConfirmationEmail,
  sendPaymentRejectionEmail,
  sendWelcomeEmail,
  sendClassReminderEmail,
} from './sendEmail.js';

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

// Алано — AI асистент (OpenRouter)
export { askAsistent } from './assistant.js';

// User role management with custom claims
export { setUserRole } from './setUserRole.js';

// NOTE: initializeAdminClaim and seedOnlinePackages were removed because they were
// callable by anyone. Use scripts/setAdminClaim.js (run locally) to grant admin.
