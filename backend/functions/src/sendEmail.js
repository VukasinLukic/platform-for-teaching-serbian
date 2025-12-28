import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineString } from 'firebase-functions/params';
import nodemailer from 'nodemailer';
import { checkRateLimit } from './rate-limiter.js';

/**
 * Gmail + Nodemailer Email Service
 * Replaces EmailJS for sending emails
 * 100% free (up to 500 emails/day)
 */

// Define environment parameters (new method for Firebase Functions v7+)
const gmailUser = defineString('GMAIL_USER', { default: 'vukasin4sports@gmail.com' });
const gmailPassword = defineString('GMAIL_PASSWORD', { default: 'ltlf ziag mpma chat' });

// Get transporter (created on-demand to avoid issues)
const getTransporter = () => {
  const userEmail = gmailUser.value();
  const userPassword = gmailPassword.value();

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
            <p>Primljeno preko srpskiusrcu.com kontakt forme</p>
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
              <a href="https://srpskiusrcu.com/dashboard" class="button">Pristupi kursu</a>
            </center>

            <p style="margin-top: 30px;">Srećno učenje! 📚</p>
            <p><strong>Tim Srpski u Srcu</strong></p>
          </div>
          <div class="footer">
            <p>Ako imate bilo kakvih pitanja, kontaktirajte nas na kontakt@srpskiusrcu.com</p>
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
              <a href="https://srpskiusrcu.com/dashboard" class="button">Otpremi ponovo</a>
            </center>

            <p style="margin-top: 30px;">Za dodatna pitanja, slobodno nas kontaktirajte.</p>
            <p><strong>Tim Srpski u Srcu</strong></p>
          </div>
          <div class="footer">
            <p>Kontakt: kontakt@srpskiusrcu.com | +381 XX XXX XXXX</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  classReminder: ({ userName, userEmail, className, classDate, classTime, meetLink, groupName }) => ({
    subject: `⏰ Подсетник: Час почиње за 1 сат - ${className}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #FF6B35, #FF8C42); color: white; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .clock-icon { font-size: 64px; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.6; }
          .info-box { background: #FFF3E0; padding: 25px; border-radius: 16px; margin: 20px 0; border: 2px solid #FFB84D; }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #FFE0B2; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #E65100; }
          .value { color: #555; font-weight: 600; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 18px 45px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 25px 0; font-size: 16px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
          .button:hover { background: #45A049; }
          .warning-box { background: #FFF9C4; padding: 20px; border-radius: 12px; border-left: 4px solid #FBC02D; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="clock-icon">⏰</div>
            <h1>Час почиње ускоро!</h1>
          </div>
          <div class="content">
            <p>Поштовани/а <strong>${userName}</strong>,</p>
            <p style="font-size: 18px; color: #E65100;"><strong>Ваш час почиње за 1 сат!</strong></p>

            <div class="info-box">
              <div class="info-row">
                <span class="label">📚 Назив часа:</span>
                <span class="value">${className}</span>
              </div>
              ${groupName ? `<div class="info-row">
                <span class="label">👥 Група:</span>
                <span class="value">${groupName}</span>
              </div>` : ''}
              <div class="info-row">
                <span class="label">📅 Датум:</span>
                <span class="value">${classDate}</span>
              </div>
              <div class="info-row">
                <span class="label">🕐 Време:</span>
                <span class="value">${classTime}</span>
              </div>
            </div>

            <div class="warning-box">
              <p style="margin: 0;"><strong>💡 Савети:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Припремите бележницу и оловку</li>
                <li>Проверите да ли вам ради микрофон и камера</li>
                <li>Пронађите мирно место за час</li>
                <li>Придружите се неколико минута раније</li>
              </ul>
            </div>

            <p style="margin-top: 30px; text-align: center; font-size: 16px;">Кликните на дугме испод да се придружите часу:</p>

            <center>
              <a href="${meetLink || 'https://srpskiusrcu.com/dashboard'}" class="button">🎥 Придружи се часу</a>
            </center>

            <p style="margin-top: 40px; text-align: center;">Видимо се на часу! 📚</p>
            <p style="text-align: center;"><strong>Професорка Марина Лукић</strong></p>
          </div>
          <div class="footer">
            <p>Ако имате техничких проблема, контактирајте нас на kontakt@srpskiusrcu.com</p>
            <p>&copy; 2025 Srpski u Srcu. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: ({ userName, userEmail }) => ({
    subject: '🎉 Dobrodošli na Srpski u Srcu platformu!',
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
            <p>Dobrodošli na <strong>Srpski u Srcu</strong> platformu! Drago nam je što ste se pridružili našoj zajednici učenika.</p>

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
              <a href="https://srpskiusrcu.com/courses" class="button">Pregledaj kurseve</a>
            </center>

            <p style="margin-top: 30px;">Srećno učenje i vidimo se u lekcijama! 📖</p>
            <p><strong>Tim Srpski u Srcu</strong></p>
          </div>
          <div class="footer">
            <p>Kontakt: kontakt@srpskiusrcu.com | +381 XX XXX XXXX</p>
            <p>&copy; 2025 Srpski u Srcu. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  emailVerification: ({ userName, verificationUrl }) => ({
    subject: '✉️ Verifikujte vaš email - Srpski u Srcu',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #F5F3EF; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #003366, #004080); color: white; padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .email-icon { font-size: 64px; margin-bottom: 10px; }
          .content { color: #333; line-height: 1.8; }
          .info-box { background: #E3F2FD; padding: 25px; border-radius: 16px; margin: 25px 0; border-left: 4px solid #2196F3; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 18px 45px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 25px 0; font-size: 18px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
          .button:hover { background: #45A049; }
          .warning { background: #FFF3CD; padding: 15px; border-radius: 12px; border-left: 4px solid #FFC107; margin: 20px 0; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          .security-note { font-size: 12px; color: #666; margin-top: 20px; padding: 15px; background: #F5F5F5; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="email-icon">✉️</div>
            <h1>Verifikujte vašu email adresu</h1>
          </div>
          <div class="content">
            <p>Poštovani/a <strong>${userName}</strong>,</p>
            <p style="font-size: 16px;">Hvala što ste se registrovali na <strong>Srpski u Srcu</strong> platformu!</p>

            <div class="info-box">
              <p style="margin: 0; font-size: 16px;"><strong>📌 Da biste aktivirali vaš nalog, molimo vas da verifikujete vašu email adresu.</strong></p>
            </div>

            <p>Kliknite na dugme ispod da verifikujete vaš nalog:</p>

            <center>
              <a href="${verificationUrl}" class="button">✅ Verifikuj email</a>
            </center>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Važno:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Link za verifikaciju je važeći 60 minuta</li>
                <li>Ako ne verifikujete email, nećete moći pristupiti kursevima</li>
                <li>Ako link ne radi, kopirajte ga i nalepite u browser</li>
              </ul>
            </div>

            <p style="margin-top: 25px;">Ako dugme ne radi, možete kopirati i nalepiti sledeći link u vaš browser:</p>
            <p style="background: #F5F5F5; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 13px; color: #555;">
              ${verificationUrl}
            </p>

            <div class="security-note">
              <p style="margin: 0;"><strong>🔒 Sigurnosna napomena:</strong></p>
              <p style="margin: 5px 0 0 0;">Ako niste vi napravili ovaj nalog, molimo vas ignorišite ovaj email. Vaša email adresa neće biti korišćena bez verifikacije.</p>
            </div>

            <p style="margin-top: 30px;">Vidimo se na platformi!</p>
            <p><strong>Tim Srpski u Srcu</strong></p>
          </div>
          <div class="footer">
            <p>Imate pitanja? Kontaktirajte nas: kontakt@srpskiusrcu.com</p>
            <p>&copy; 2025 Srpski u Srcu. Sva prava zadržana.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Cloud Function: Send Contact Form Email
export const sendContactFormEmail = onCall({ cors: true }, async (request) => {
  console.log('=== sendContactFormEmail called ===');
  console.log('Request data:', JSON.stringify(request.data, null, 2));

  const { name, email, phone, message } = request.data;

  if (!name || !email || !message) {
    console.error('Missing required fields:', { name: !!name, email: !!email, message: !!message });
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  // ✅ Rate limiting - 3 contact form submissions per hour
  const userId = request.auth?.uid || request.rawRequest.ip || 'anonymous';
  await checkRateLimit(userId, 'contact_form', 3, 60);

  try {
    console.log('Creating transporter...');
    const transporter = getTransporter();

    console.log('Generating email template...');
    const template = emailTemplates.contactForm({ name, email, phone, message });

    const userEmail = gmailUser.value();
    const contactEmail = process.env.CONTACT_EMAIL || userEmail;

    console.log('Sending email from:', userEmail, 'to:', contactEmail);

    await transporter.sendMail({
      from: `"Srpski u Srcu - Kontakt Forma" <${userEmail}>`,
      to: contactEmail,
      replyTo: email,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully!');
    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// Cloud Function: Send Payment Confirmation Email
export const sendPaymentConfirmationEmail = onCall({ cors: true }, async (request) => {
  console.log('=== sendPaymentConfirmationEmail called ===');
  console.log('Request data:', JSON.stringify(request.data, null, 2));

  const { userName, userEmail, courseTitle, transactionId } = request.data;

  if (!userName || !userEmail || !courseTitle || !transactionId) {
    console.error('Missing required fields:', { userName: !!userName, userEmail: !!userEmail, courseTitle: !!courseTitle, transactionId: !!transactionId });
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    console.log('Creating transporter...');
    const transporter = getTransporter();

    console.log('Generating email template...');
    const template = emailTemplates.paymentConfirmation({
      userName,
      userEmail,
      courseTitle,
      transactionId,
    });

    const senderEmail = gmailUser.value();
    console.log('Sending email from:', senderEmail, 'to:', userEmail);

    await transporter.sendMail({
      from: `"Srpski u Srcu" <${senderEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully!');
    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw new HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// Cloud Function: Send Payment Rejection Email
export const sendPaymentRejectionEmail = onCall({ cors: true }, async (request) => {
  console.log('=== sendPaymentRejectionEmail called ===');
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
    const senderEmail = gmailUser.value();

    await transporter.sendMail({
      from: `"Srpski u Srcu" <${senderEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully!');
    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending payment rejection email:', error);
    throw new HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// Cloud Function: Send Welcome Email
export const sendWelcomeEmail = onCall({ cors: true }, async (request) => {
  console.log('=== sendWelcomeEmail called ===');
  const { userName, userEmail } = request.data;

  if (!userName || !userEmail) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.welcome({ userName, userEmail });
    const senderEmail = gmailUser.value();

    await transporter.sendMail({
      from: `"Srpski u Srcu" <${senderEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('Email sent successfully!');
    return { success: true, message: 'Email successfully sent' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

// Cloud Function: Send Class Reminder Email (1 hour before class)
export const sendClassReminderEmail = onCall({ cors: true }, async (request) => {
  console.log('=== sendClassReminderEmail called ===');
  const { userName, userEmail, className, classDate, classTime, meetLink, groupName } = request.data;

  if (!userName || !userEmail || !className || !classDate || !classTime) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.classReminder({
      userName,
      userEmail,
      className,
      classDate,
      classTime,
      meetLink,
      groupName,
    });
    const senderEmail = gmailUser.value();

    await transporter.sendMail({
      from: `"Srpski u Srcu - Online Časovi" <${senderEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('Class reminder email sent successfully!');
    return { success: true, message: 'Class reminder email successfully sent' };
  } catch (error) {
    console.error('Error sending class reminder email:', error);
    throw new HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

/**
 * Helper function: Send Email Verification Email
 * Used by emailVerification.js to send verification emails
 * @param {Object} params - Email parameters
 * @param {string} params.userEmail - User's email address
 * @param {string} params.userName - User's name
 * @param {string} params.verificationUrl - Verification URL with token
 */
export const sendVerificationEmail = async ({ userEmail, userName, verificationUrl }) => {
  if (!userEmail || !userName || !verificationUrl) {
    throw new Error('Missing required parameters for verification email');
  }

  try {
    const transporter = getTransporter();
    const template = emailTemplates.emailVerification({
      userName,
      verificationUrl,
    });
    const senderEmail = gmailUser.value();

    await transporter.sendMail({
      from: `"Srpski u Srcu" <${senderEmail}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Verification email sent successfully to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
