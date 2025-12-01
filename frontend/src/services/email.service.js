import emailjs from '@emailjs/browser';

// Initialize EmailJS
// Replace these with your actual EmailJS User ID (Public Key)
// You can find this in EmailJS Dashboard -> Account -> General -> Public Key
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;

// Template IDs - Create these in EmailJS dashboard
const TEMPLATE_PAYMENT_CONFIRM = import.meta.env.VITE_EMAILJS_TEMPLATE_PAYMENT || 'template_payment';
const TEMPLATE_PAYMENT_REJECT = import.meta.env.VITE_EMAILJS_TEMPLATE_PAYMENT_REJECT || 'template_payment_reject';
const TEMPLATE_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME || 'template_welcome';
const TEMPLATE_CONTACT = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || 'template_contact';

export const initEmailService = () => {
  if (EMAILJS_PUBLIC_KEY) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('EmailJS Public Key not found in environment variables');
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (userEmail, userName, courseTitle, transactionId) => {
  if (!EMAILJS_PUBLIC_KEY) return { success: false, error: 'EmailJS not configured' };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_PAYMENT_CONFIRM,
      {
        to_email: userEmail,
        to_name: userName,
        course_title: courseTitle,
        transaction_id: transactionId,
        dashboard_link: 'https://naucisprski.com/dashboard'
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};

/**
 * Send payment rejection email
 */
export const sendPaymentRejectionEmail = async (userEmail, userName, courseTitle, reason) => {
    if (!EMAILJS_PUBLIC_KEY) return { success: false, error: 'EmailJS not configured' };
  
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        TEMPLATE_PAYMENT_REJECT,
        {
          to_email: userEmail,
          to_name: userName,
          course_title: courseTitle,
          rejection_reason: reason,
          dashboard_link: 'https://naucisprski.com/dashboard'
        }
      );
      return { success: true, response };
    } catch (error) {
      console.error('EmailJS Error:', error);
      return { success: false, error };
    }
  };

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  if (!EMAILJS_PUBLIC_KEY) return { success: false, error: 'EmailJS not configured' };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_WELCOME,
      {
        to_email: userEmail,
        to_name: userName,
        login_link: 'https://naucisprski.com/login'
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};

/**
 * Send contact form email
 */
export const sendContactFormEmail = async (formData) => {
  if (!EMAILJS_PUBLIC_KEY) return { success: false, error: 'EmailJS not configured' };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_CONTACT,
      {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        message: formData.message
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error };
  }
};

