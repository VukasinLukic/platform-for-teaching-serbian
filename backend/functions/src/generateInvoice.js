/**
 * Generate Invoice PDF for Course Purchase
 * Creates a PDF invoice and transaction record in Firestore
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import PDFDocument from 'pdfkit';

export const generateInvoice = onCall(async (request) => {
  const db = getFirestore();
  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  const { courseId } = request.data;
  const userId = request.auth.uid;

  if (!courseId) {
    throw new HttpsError('invalid-argument', 'courseId je obavezan');
  }

  try {
    // Get course details
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new HttpsError('not-found', 'Kurs ne postoji');
    }
    const course = courseDoc.data();

    // Get user details
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'Korisnik ne postoji');
    }
    const user = userDoc.data();

    // Check if user already purchased this course
    const userCoursesDoc = await db.collection('user_courses').doc(userId).get();
    if (userCoursesDoc.exists) {
      const userCourses = userCoursesDoc.data().courses || {};
      if (userCourses[courseId]) {
        throw new HttpsError('already-exists', 'Već ste kupili ovaj kurs');
      }
    }

    // Generate unique payment reference
    const paymentRef = `KRS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create transaction record
    const transactionRef = await db.collection('transactions').add({
      user_id: userId,
      course_id: courseId,
      amount: course.price,
      status: 'pending',
      payment_ref: paymentRef,
      created_at: FieldValue.serverTimestamp(),
    });

    // Generate PDF Invoice
    const pdfBuffer = await createInvoicePDF({
      courseTitle: course.title,
      userName: user.ime,
      userEmail: user.email,
      userPhone: user.telefon || 'N/A',
      amount: course.price,
      paymentRef: paymentRef,
      transactionId: transactionRef.id,
    });

    // Upload PDF to Firebase Storage
    const bucket = getStorage().bucket();
    const fileName = `invoices/${transactionRef.id}.pdf`;
    const file = bucket.file(fileName);

    await file.save(pdfBuffer, {
      contentType: 'application/pdf',
      metadata: {
        metadata: {
          transactionId: transactionRef.id,
          userId: userId,
          courseId: courseId,
        },
      },
    });

    // Make file publicly accessible with signed URL (valid for 7 days)
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Update transaction with PDF URL
    await transactionRef.update({
      invoice_url: downloadUrl,
    });

    return {
      success: true,
      transactionId: transactionRef.id,
      invoiceUrl: downloadUrl,
      paymentRef: paymentRef,
      amount: course.price,
    };
  } catch (error) {
    console.error('Error generating invoice:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Greška pri generisanju uplatnice');
  }
});

/**
 * Create PDF Invoice using PDFKit
 */
async function createInvoicePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header - Logo and Title
    doc
      .fontSize(28)
      .fillColor('#003366')
      .font('Helvetica-Bold')
      .text('UPLATNICA ZA KURS', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(12)
      .fillColor('#666666')
      .font('Helvetica')
      .text('Online Srpski Kursevi', { align: 'center' });

    doc.moveDown(2);

    // Divider line
    doc
      .strokeColor('#BFECC9')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // Transaction Details Section
    doc
      .fontSize(14)
      .fillColor('#003366')
      .font('Helvetica-Bold')
      .text('Detalji transakcije', { underline: true });

    doc.moveDown(0.5);

    const detailsY = doc.y;
    const leftColumn = 80;
    const rightColumn = 250;

    // Left column labels
    doc
      .fontSize(11)
      .fillColor('#666666')
      .font('Helvetica')
      .text('Kurs:', leftColumn, detailsY);

    doc.text('Ime i prezime:', leftColumn, detailsY + 30);
    doc.text('Email:', leftColumn, detailsY + 60);
    doc.text('Telefon:', leftColumn, detailsY + 90);

    // Right column values
    doc
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(data.courseTitle, rightColumn, detailsY, { width: 280 });

    doc.text(data.userName, rightColumn, detailsY + 30);
    doc.text(data.userEmail, rightColumn, detailsY + 60);
    doc.text(data.userPhone, rightColumn, detailsY + 90);

    doc.y = detailsY + 130;
    doc.moveDown(1);

    // Amount Section (highlighted)
    doc
      .rect(50, doc.y, 495, 60)
      .fillAndStroke('#BFECC9', '#BFECC9')
      .opacity(0.2);

    doc.opacity(1);

    doc
      .fontSize(12)
      .fillColor('#003366')
      .font('Helvetica')
      .text('Iznos za uplatu:', 70, doc.y + 15);

    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(`${data.amount.toLocaleString('sr-RS')} RSD`, 300, doc.y + 10, {
        align: 'right',
        width: 225,
      });

    doc.y += 80;
    doc.moveDown(1);

    // Payment Reference (highlighted)
    doc
      .rect(50, doc.y, 495, 50)
      .fillAndStroke('#003366', '#003366')
      .opacity(0.1);

    doc.opacity(1);

    doc
      .fontSize(12)
      .fillColor('#003366')
      .font('Helvetica')
      .text('Poziv na broj:', 70, doc.y + 15);

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#003366')
      .text(data.paymentRef, 300, doc.y + 13, { align: 'right', width: 225 });

    doc.y += 70;
    doc.moveDown(1.5);

    // Divider line
    doc
      .strokeColor('#BFECC9')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // Bank Details Section
    doc
      .fontSize(14)
      .fillColor('#003366')
      .font('Helvetica-Bold')
      .text('Instrukcije za uplatu', { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor('#000000')
      .font('Helvetica')
      .text('Račun primaoca:', 80, doc.y)
      .font('Helvetica-Bold')
      .text(process.env.BANK_ACCOUNT || '160-0000000000000-00', 250, doc.y);

    doc.moveDown(0.7);

    doc
      .font('Helvetica')
      .text('Primalac:', 80, doc.y)
      .font('Helvetica-Bold')
      .text('Online Srpski Kursevi', 250, doc.y);

    doc.moveDown(0.7);

    doc
      .font('Helvetica')
      .text('Svrha uplate:', 80, doc.y)
      .font('Helvetica-Bold')
      .text('Uplata za kurs srpskog jezika', 250, doc.y);

    doc.moveDown(2);

    // Instructions box
    doc
      .rect(50, doc.y, 495, 120)
      .fillAndStroke('#f0f0f0', '#cccccc')
      .opacity(0.5);

    doc.opacity(1);

    doc
      .fontSize(12)
      .fillColor('#003366')
      .font('Helvetica-Bold')
      .text('Sledeći koraci:', 70, doc.y + 15);

    doc
      .fontSize(10)
      .fillColor('#000000')
      .font('Helvetica')
      .text('1. Izvršite uplatu u banci ili putem e-banking aplikacije', 70, doc.y + 40, {
        width: 455,
      });

    doc.text(
      '2. Ulogujte se na platformu i idite na Dashboard',
      70,
      doc.y + 58,
      { width: 455 }
    );

    doc.text(
      '3. Upload-ujte potvrdu o uplati (slika ili PDF izvoda)',
      70,
      doc.y + 76,
      { width: 455 }
    );

    doc.text(
      '4. Verifikacija uplate traje do 24h, nakon čega dobijate pristup kursu',
      70,
      doc.y + 94,
      { width: 455 }
    );

    // Footer
    doc.moveDown(4);

    doc
      .fontSize(9)
      .fillColor('#999999')
      .font('Helvetica')
      .text(
        `Generisano: ${new Date().toLocaleDateString('sr-RS')} | ID transakcije: ${data.transactionId}`,
        { align: 'center' }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(8)
      .text(`Za pitanja i podršku: ${process.env.CONTACT_EMAIL || 'kontakt@naucisprski.com'} | ${process.env.CONTACT_PHONE || '+381 XX XXX XXXX'}`, {
        align: 'center',
      });

    doc.end();
  });
}
