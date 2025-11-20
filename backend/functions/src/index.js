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
  region: 'europe-west1',
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
