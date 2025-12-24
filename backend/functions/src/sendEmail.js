import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import nodemailer from 'nodemailer';

// Define parameters (will use Firebase config or env vars)
const gmailUser = defineString('GMAIL_USER', { default: 'vukasin4sports@gmail.com' });
const gmailPassword = defineString('GMAIL_PASSWORD', { default: '' });

/**
 * Gmail + Nodemailer Email Service
 * Replaces EmailJS for sending emails
 * 100% free (up to 500 emails/day)
 */

// Get transporter (created on-demand to avoid issues)
const getTransporter = () => {
  const userEmail = gmailUser.value() || process.env.GMAIL_USER;
  const userPassword = gmailPassword.value() || process.env.GMAIL_APP_PASSWORD;

  if (!userEmail || !userPassword) {
    console.error('Missing Gmail credentials!');
    console.log('GMAIL_USER:', userEmail ? 'SET' : 'MISSING');
    console.log('GMAIL_PASSWORD:', userPassword ? 'SET' : 'MISSING');
    throw new Error('Gmail credentials not configured');
  }

  // Use .createTransport() not .createTransporter()
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: userEmail,
      pass: userPassword,
    },
  });
};

// Email Templates
const emailTemplates = {
  contactForm: ({ name, email, phone, message }) => ({
    subject: `Nova poruka sa kontakt forme - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: #003366; color: white; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { color: #333; line-height: 1.6; }
          .field { margin-bottom: 20px; }
          .field-label { font-weight: bold; color: #003366; margin-bottom: 5px; }
          .field-value { color: #555; background: #F5F3EF; padding: 12px; border-radius: 8px; }
          .message-box { background: #F5F3EF; padding: 20px; border-radius: 12px; border-left: 4px solid #BFECC9; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Nova poruka sa kontakt forme</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Ime i prezime:</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
              <div class="field-label">Telefon:</div>
              <div class="field-value">${phone || 'Nije navedeno'}</div>
            </div>
            <div class="field">
              <div class="field-label">Poruka:</div>
              <div class="message-box">${message}</div>
            </div>
          </div>
          <div class="footer">
            <p>Primljeno preko naucisprski.com kontakt forme</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentConfirmation: ({ userName, userEmail, courseTitle, transactionId }) => ({
    subject: `✅ Vaša uplata je potvrđena - ${courseTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #BFECC9, #9DD6AC); color: #003366; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .check-icon { font-size: 48px; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.6; }
          .info-box { background: #F5F3EF; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E5E5; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #003366; }
          .value { color: #555; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="check-icon">✅</div>
            <h1>Uplata potvrđena!</h1>
          </div>
          <div class="content">
            <p>Poštovani/a <strong>${userName}</strong>,</p>
            <p>Sa zadovoljstvom vas obaveštavamo da je vaša uplata uspešno verifikovana i da imate pristup kursu!</p>

            <div class="info-box">
              <div class="info-row">
                <span class="label">Kurs:</span>
                <span class="value">${courseTitle}</span>
              </div>
              <div class="info-row">
                <span class="label">Broj transakcije:</span>
                <span class="value">${transactionId}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value" style="color: #4CAF50; font-weight: bold;">Potvrđeno</span>
              </div>
            </div>

            <p>Možete odmah započeti učenje! Prijavite se na platformu i pristupite svim lekcijama.</p>

            <center>
              <a href="https://naucisprski.com/dashboard" class="button">Pristupi kursu</a>
            </center>

            <p style="margin-top: 30px;">Srećno učenje! 📚</p>
            <p><strong>Tim Nauči Srpski</strong></p>
          </div>
          <div class="footer">
            <p>Ako imate bilo kakvih pitanja, kontaktirajte nas na kontakt@naucisprski.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentRejection: ({ userName, userEmail, courseTitle, reason }) => ({
    subject: `❌ Obaveštenje o uplati - ${courseTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: #FEE; color: #C33; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px; border: 2px solid #FCC; }
          .header h1 { margin: 0; font-size: 24px; }
          .warning-icon { font-size: 48px; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.6; }
          .reason-box { background: #FEF3F3; padding: 20px; border-radius: 12px; border-left: 4px solid #FF6B6B; margin: 20px 0; }
          .info-box { background: #F5F3EF; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="warning-icon">❌</div>
            <h1>Problem sa verifikacijom uplate</h1>
          </div>
          <div class="content">
            <p>Poštovani/a <strong>${userName}</strong>,</p>
            <p>Nažalost, nismo mogli da verifikujemo vašu uplatu za kurs <strong>${courseTitle}</strong>.</p>

            ${reason ? `<div class="reason-box">
              <strong>Razlog:</strong><br/>
              ${reason}
            </div>` : ''}

            <div class="info-box">
              <p><strong>Šta možete učiniti:</strong></p>
              <ul>
                <li>Proverite da li je iznos tačan</li>
                <li>Proverite da li je broj računa ispravan</li>
                <li>Uverite se da je potvrda o uplati čitljiva</li>
                <li>Kontaktirajte nas za dodatnu pomoć</li>
              </ul>
            </div>

            <p>Možete ponovo otpremiti potvrdu o uplati nakon što ispravite problem.</p>

            <center>
              <a href="https://naucisprski.com/dashboard" class="button">Otpremi ponovo</a>
            </center>

            <p style="margin-top: 30px;">Za dodatna pitanja, slobodno nas kontaktirajte.</p>
            <p><strong>Tim Nauči Srpski</strong></p>
          </div>
          <div class="footer">
            <p>Kontakt: kontakt@naucisprski.com | +381 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: ({ userName, userEmail }) => ({
    subject: '🎉 Dobrodošli na Nauči Srpski platformu!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #BFECC9, #9DD6AC); padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 32px; color: #003366; }
          .emoji { font-size: 64px; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.8; }
          .feature-list { background: #F5F3EF; padding: 25px; border-radius: 12px; margin: 20px 0; }
          .feature-item { padding: 10px 0; display: flex; align-items: center; }
          .feature-icon { font-size: 24px; margin-right: 12px; }
          .button { display: inline-block; background: #FF6B35; color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉</div>
            <h1>Dobrodošli!</h1>
          </div>
          <div class="content">
            <p>Poštovani/a <strong>${userName}</strong>,</p>
            <p>Dobrodošli na <strong>Nauči Srpski</strong> platformu! Drago nam je što ste se pridružili našoj zajednici učenika.</p>

            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">📚</span>
                <span>Pristup kvalitetnim video lekcijama</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎥</span>
                <span>Učite u sopstvenom tempu, 24/7</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👩‍🏫</span>
                <span>15 godina iskustva profesorke Marine Lukić</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📝</span>
                <span>Priprema za malu maturu sa dokazanim rezultatima</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏆</span>
                <span>98% prolaznost naših učenika</span>
              </div>
            </div>

            <p><strong>Kako započeti:</strong></p>
            <ol>
              <li>Prijavite se na svoj nalog</li>
              <li>Pregledajte dostupne kurseve</li>
              <li>Izaberite kurs koji vas interesuje</li>
              <li>Uplatite kurs i započnite učenje</li>
            </ol>

            <center>
              <a href="https://naucisprski.com/courses" class="button">Pregledaj kurseve</a>
            </center>

            <p style="margin-top: 30px;">Srećno učenje i vidimo se u lekcijama! 📖</p>
            <p><strong>Tim Nauči Srpski</strong></p>
          </div>
          <div class="footer">
            <p>Kontakt: kontakt@naucisprski.com | +381 XX XXX XXXX</p>
            <p>&copy; 2025 Nauči Srpski. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Cloud Function: Send Contact Form Email
export const sendContactFormEmail = onCall({ cors: true }, async (request) => {
  const { name, email, phone, message } = request.data;

  if (!name || !email || !message) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.contactForm({ name, email, phone, message });
    const contactEmail = process.env.CONTACT_EMAIL || 'vukasin4sports@gmail.com';

    await transporter.sendMail({
      from: `"Nauči Srpski - Kontakt Forma" <${process.env.GMAIL_USER}>`,
      to: contactEmail,
      replyTo: email,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw new HttpsError('internal', 'Failed to send email');
  }
});

// Cloud Function: Send Payment Confirmation Email
export const sendPaymentConfirmationEmail = onCall({ cors: true }, async (request) => {
  const { userName, userEmail, courseTitle, transactionId } = request.data;

  if (!userName || !userEmail || !courseTitle || !transactionId) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.paymentConfirmation({
      userName,
      userEmail,
      courseTitle,
      transactionId,
    });

    await transporter.sendMail({
      from: `"Nauči Srpski" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw new HttpsError('internal', 'Failed to send email');
  }
});

// Cloud Function: Send Payment Rejection Email
export const sendPaymentRejectionEmail = onCall({ cors: true }, async (request) => {
  const { userName, userEmail, courseTitle, reason } = request.data;

  if (!userName || !userEmail || !courseTitle) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.paymentRejection({
      userName,
      userEmail,
      courseTitle,
      reason,
    });

    await transporter.sendMail({
      from: `"Nauči Srpski" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending payment rejection email:', error);
    throw new HttpsError('internal', 'Failed to send email');
  }
});

// Cloud Function: Send Welcome Email
export const sendWelcomeEmail = onCall({ cors: true }, async (request) => {
  const { userName, userEmail } = request.data;

  if (!userName || !userEmail) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.welcome({ userName, userEmail });

    await transporter.sendMail({
      from: `"Nauči Srpski" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new HttpsError('internal', 'Failed to send email');
  }
});
