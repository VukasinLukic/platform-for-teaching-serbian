/**
 * Payment Service
 * Handles invoice generation and payment confirmation uploads
 */

import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { functions, storage, db } from './firebase';
import { normalizeTransaction, getUserTransactionDocs, sortByCreatedAtDesc } from './transactions';

/**
 * Generate invoice PDF for course purchase
 * @param {string} courseId
 * @returns {Promise<Object>} { transactionId, invoiceUrl, paymentRef }
 */
export const generateInvoice = async (courseId) => {
  try {
    const generateInvoiceFn = httpsCallable(functions, 'generateInvoice');
    const result = await generateInvoiceFn({ courseId });
    return result.data;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

/**
 * Upload payment confirmation file
 * @param {string} transactionId
 * @param {File} file
 * @returns {Promise<string>} Download URL
 */
export const uploadPaymentConfirmation = async (transactionId, file) => {
  try {
    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Фајл је превелик. Максимална величина је 5MB.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Дозвољен је само JPEG, PNG, WebP или PDF формат.');
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `payment-confirmations/${transactionId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // Update transaction document
    await updateDoc(doc(db, 'transactions', transactionId), {
      confirmationUrl: downloadUrl,
      confirmationUploadedAt: new Date().toISOString(),
      status: 'pending', // Set to pending when confirmation is uploaded
    });

    return downloadUrl;
  } catch (error) {
    console.error('Error uploading payment confirmation:', error);
    throw error;
  }
};

/**
 * Get user's transactions
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserTransactions = async (userId) => {
  try {
    // Matches both `userId` and legacy `user_id` documents
    const docs = await getUserTransactionDocs(userId);

    // Load course data for course transactions
    const transactionsWithData = await Promise.all(
      docs.map(async (docSnap) => {
        const tx = normalizeTransaction(docSnap);

        let course = null;
        let courseName = tx.courseName;

        if (tx.type === 'course' && tx.courseId) {
          const courseDoc = await getDoc(doc(db, 'courses', tx.courseId));
          if (courseDoc.exists()) {
            course = courseDoc.data();
            courseName = course.title || courseName;
          }
        } else if (tx.type === 'online_package') {
          courseName = tx.packageName || 'Online пакет';
        }

        return { ...tx, courseName, course };
      })
    );

    return sortByCreatedAtDesc(transactionsWithData);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Get transaction by ID
 * @param {string} transactionId
 * @returns {Promise<Object>}
 */
export const getTransactionById = async (transactionId) => {
  try {
    const docRef = doc(db, 'transactions', transactionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Transakcija ne postoji');
    }

    return normalizeTransaction(docSnap);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};
