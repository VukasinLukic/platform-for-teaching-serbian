import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Send payment confirmation email via Firebase Functions
 */
export const sendPaymentConfirmationEmail = async (userEmail, userName, courseTitle, transactionId) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendPaymentConfirmationEmail');
    const response = await sendEmail({
      userEmail,
      userName,
      courseTitle,
      transactionId,
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
};

/**
 * Send payment rejection email via Firebase Functions
 */
export const sendPaymentRejectionEmail = async (userEmail, userName, courseTitle, reason) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendPaymentRejectionEmail');
    const response = await sendEmail({
      userEmail,
      userName,
      courseTitle,
      reason,
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending payment rejection email:', error);
    return { success: false, error };
  }
};

/**
 * Send welcome email via Firebase Functions
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendWelcomeEmail');
    const response = await sendEmail({
      userEmail,
      userName,
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Send contact form email via Firebase Functions
 */
export const sendContactFormEmail = async (formData) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendContactFormEmail');
    const response = await sendEmail({
      name: formData.ime || formData.name,
      email: formData.email,
      phone: formData.telefon || formData.phone,
      message: formData.poruka || formData.message,
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, error };
  }
};
