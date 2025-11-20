/**
 * Payment Service
 * Handles invoice generation and payment confirmation uploads
 */

import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { functions, storage, db } from './firebase';

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
      throw new Error('Fajl je prevelik. Maksimalna veličina je 5MB.');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Dozvoljen je samo JPEG, PNG ili PDF format.');
    }

    // Upload to Firebase Storage
    const storageRef = ref(storage, `payment-confirmations/${transactionId}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    // Update transaction document
    await updateDoc(doc(db, 'transactions', transactionId), {
      confirmation_url: downloadUrl,
      confirmation_uploaded_at: new Date().toISOString(),
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
    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
};
