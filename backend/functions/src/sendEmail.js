/**
 * Email Notification System using SendGrid
 * Sends various email notifications to users
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.CONTACT_EMAIL || 'kontakt@naucisprski.com';
const FROM_NAME = 'Nauči Srpski';

/**
 * Send payment confirmation email to user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} courseTitle - Course name
 * @param {string} transactionId - Transaction ID for reference
 */
export async function sendPaymentConfirmationEmail(userEmail, userName, courseTitle, transactionId) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email notification.');
    return { success: false, message: 'Email service not configured' };
  }

  const msg = {
    to: userEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'Potvrda uplate - Nauči Srpski 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #F5F3EF;
          }
          .container {
            background-color: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #BFECC9 0%, #003366 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 20px 0;
          }
          .success-icon {
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
          }
          .course-box {
            background-color: #BFECC9;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .course-box h3 {
            margin: 0 0 10px 0;
            color: #003366;
          }
          .button {
            display: inline-block;
            background-color: #FF6B35;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #F5F3EF;
            color: #666;
            font-size: 14px;
          }
          .info-list {
            list-style: none;
            padding: 0;
          }
          .info-list li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-list li:before {
            content: "✓ ";
            color: #BFECC9;
            font-weight: bold;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Nauči Srpski</h1>
          </div>

          <div class="success-icon">🎉</div>

          <div class="content">
            <h2>Zdravo ${userName}!</h2>

            <p><strong>Vaša uplata je uspešno potvrđena!</strong></p>

            <div class="course-box">
              <h3>Kurs: ${courseTitle}</h3>
              <p>Sada imate pun pristup svim lekcijama i materijalima.</p>
            </div>

            <p>Šta možete uraditi sada:</p>
            <ul class="info-list">
              <li>Pristupite video lekcijama bilo kada</li>
              <li>Preuzmite sve PDF materijale</li>
              <li>Prijavite se na nedeljne online časove</li>
              <li>Pratite svoj napredak</li>
            </ul>

            <div style="text-align: center;">
              <a href="https://naucisprski.com/dashboard" class="button">
                Idi na Dashboard →
              </a>
            </div>

            <p style="margin-top: 30px;">
              Želimo vam uspešno učenje i sve najbolje na pripremama za malu maturu!
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Broj transakcije:</strong> ${transactionId}
            </p>
          </div>

          <div class="footer">
            <p>Nauči Srpski - Online priprema za malu maturu</p>
            <p>
              <a href="${FROM_EMAIL}" style="color: #FF6B35;">${FROM_EMAIL}</a> |
              ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
            </p>
            <p style="font-size: 12px; color: #999;">
              © 2025 Nauči Srpski. Sva prava zadržana.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Zdravo ${userName}!

Vaša uplata je uspešno potvrđena!

Kurs: ${courseTitle}

Sada imate pun pristup svim lekcijama i materijalima.

Šta možete uraditi sada:
- Pristupite video lekcijama bilo kada
- Preuzmite sve PDF materijale
- Prijavite se na nedeljne online časove
- Pratite svoj napredak

Idite na: https://naucisprski.com/dashboard

Želimo vam uspešno učenje!

---
Broj transakcije: ${transactionId}
Nauči Srpski - Online priprema za malu maturu
${FROM_EMAIL} | ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Payment confirmation email sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
    return { success: false, message: error.message };
  }
}

/**
 * Send payment rejection email to user
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} courseTitle - Course name
 * @param {string} reason - Rejection reason (optional)
 */
export async function sendPaymentRejectionEmail(userEmail, userName, courseTitle, reason = '') {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email notification.');
    return { success: false, message: 'Email service not configured' };
  }

  const msg = {
    to: userEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'Obaveštenje o uplati - Nauči Srpski',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #F5F3EF;
          }
          .container {
            background-color: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #003366 0%, #BFECC9 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
          }
          .warning-box {
            background-color: #FFF3CD;
            border-left: 4px solid #FFC107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background-color: #FF6B35;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #F5F3EF;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Nauči Srpski</h1>
          </div>

          <div class="content">
            <h2>Zdravo ${userName},</h2>

            <p>Obaveštavamo Vas da nismo mogli da potvrdimo Vašu uplatu za kurs:</p>

            <div class="warning-box">
              <strong>Kurs:</strong> ${courseTitle}
              ${reason ? `<br><strong>Razlog:</strong> ${reason}` : ''}
            </div>

            <p>Molimo Vas da:</p>
            <ol>
              <li>Proverite da li ste izvršili uplatu na ispravan račun</li>
              <li>Upload-ujte novu potvrdu o uplati sa jasno vidljivim podacima</li>
              <li>Kontaktirajte nas ako imate bilo kakvih pitanja</li>
            </ol>

            <div style="text-align: center;">
              <a href="https://naucisprski.com/dashboard" class="button">
                Upload novu potvrdu →
              </a>
            </div>

            <p style="margin-top: 30px;">
              Ukoliko mislite da je greška u pitanju ili imate dodatnih pitanja, slobodno nas kontaktirajte.
            </p>
          </div>

          <div class="footer">
            <p>Nauči Srpski - Online priprema za malu maturu</p>
            <p>
              <a href="mailto:${FROM_EMAIL}" style="color: #FF6B35;">${FROM_EMAIL}</a> |
              ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Zdravo ${userName},

Obaveštavamo Vas da nismo mogli da potvrdimo Vašu uplatu za kurs: ${courseTitle}
${reason ? `Razlog: ${reason}` : ''}

Molimo Vas da:
1. Proverite da li ste izvršili uplatu na ispravan račun
2. Upload-ujte novu potvrdu o uplati sa jasno vidljivim podacima
3. Kontaktirajte nas ako imate bilo kakvih pitanja

Idite na: https://naucisprski.com/dashboard

---
Nauči Srpski - Online priprema za malu maturu
${FROM_EMAIL} | ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Payment rejection email sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending payment rejection email:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send welcome email after user registration
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 */
export async function sendWelcomeEmail(userEmail, userName) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email notification.');
    return { success: false, message: 'Email service not configured' };
  }

  const msg = {
    to: userEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'Dobrodošli na Nauči Srpski! 🎓',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #F5F3EF;
          }
          .container {
            background-color: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #BFECC9 0%, #003366 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .welcome-icon {
            text-align: center;
            font-size: 64px;
            margin: 20px 0;
          }
          .feature-box {
            background-color: #F5F3EF;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
          }
          .feature-box h4 {
            color: #003366;
            margin: 0 0 10px 0;
          }
          .button {
            display: inline-block;
            background-color: #FF6B35;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #F5F3EF;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Dobrodošli!</h1>
          </div>

          <div class="welcome-icon">👋</div>

          <div class="content">
            <h2>Zdravo ${userName}!</h2>

            <p>Dobrodošli na <strong>Nauči Srpski</strong> - vašu online platformu za pripremu za malu maturu!</p>

            <p>Drago nam je što ste se pridružili stotinama učenika koji već uče srpski jezik uz profesorku Marinu Lukić.</p>

            <h3 style="color: #003366; margin-top: 30px;">Šta možete sada:</h3>

            <div class="feature-box">
              <h4>📚 Pregledajte dostupne kurseve</h4>
              <p>Istražite našu ponudu kurseva i pronađite onaj koji Vam odgovara.</p>
            </div>

            <div class="feature-box">
              <h4>👩‍🏫 Upoznajte profesorku Marinu</h4>
              <p>Saznajte više o 15+ godina iskustva i 98% uspešnosti naših učenika.</p>
            </div>

            <div class="feature-box">
              <h4>🎥 Video lekcije 24/7</h4>
              <p>Pristupite lekcijama bilo kada, sa neograničenim ponavljanjem.</p>
            </div>

            <div style="text-align: center;">
              <a href="https://naucisprski.com/dashboard" class="button">
                Idite na Dashboard →
              </a>
            </div>

            <p style="margin-top: 30px;">
              Ukoliko imate bilo kakvih pitanja, slobodno nas kontaktirajte!
            </p>
          </div>

          <div class="footer">
            <p><strong>Nauči Srpski</strong> - Online priprema za malu maturu</p>
            <p>
              <a href="mailto:${FROM_EMAIL}" style="color: #FF6B35;">${FROM_EMAIL}</a> |
              ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
            </p>
            <p style="font-size: 12px; color: #999;">
              © 2025 Nauči Srpski. Sva prava zadržana.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Zdravo ${userName}!

Dobrodošli na Nauči Srpski - vašu online platformu za pripremu za malu maturu!

Drago nam je što ste se pridružili stotinama učenika koji već uče srpski jezik uz profesorku Marinu Lukić.

Šta možete sada:

📚 Pregledajte dostupne kurseve
👩‍🏫 Upoznajte profesorku Marinu
🎥 Video lekcije 24/7

Idite na: https://naucisprski.com/dashboard

Ukoliko imate bilo kakvih pitanja, slobodno nas kontaktirajte!

---
Nauči Srpski - Online priprema za malu maturu
${FROM_EMAIL} | ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${userEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send contact form email to admin
 * @param {Object} formData - Form data from contact form
 */
export async function sendContactFormEmail(formData) {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Skipping email notification.');
    return { success: false, message: 'Email service not configured' };
  }

  const { name, email, phone, message } = formData;
  const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;

  const msg = {
    to: adminEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    replyTo: email,
    subject: `Nova poruka sa kontakt forme - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 30px;
            margin-top: 20px;
            border-radius: 5px;
          }
          .field {
            margin-bottom: 20px;
          }
          .label {
            font-weight: bold;
            color: #003366;
          }
          .message-box {
            background-color: #F5F3EF;
            padding: 15px;
            border-left: 4px solid #BFECC9;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nova Poruka sa Kontakt Forme</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Ime:</span> ${name}
            </div>
            <div class="field">
              <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="field">
              <span class="label">Telefon:</span> ${phone || 'Nije navedeno'}
            </div>
            <div class="field">
              <span class="label">Poruka:</span>
              <div class="message-box">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Vreme prijema: ${new Date().toLocaleString('sr-RS')}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Nova poruka sa kontakt forme

Ime: ${name}
Email: ${email}
Telefon: ${phone || 'Nije navedeno'}

Poruka:
${message}

---
Vreme prijema: ${new Date().toLocaleString('sr-RS')}
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Contact form email sent to admin`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, message: error.message };
  }
}
