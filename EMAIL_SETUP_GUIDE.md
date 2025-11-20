# 📧 EMAIL SETUP GUIDE - Kontakt Forma i Uplatnice

## 🎯 Šta ćemo podesiti:

1. **Kontakt forma** - Korisnici šalju email profesorki
2. **Email notifikacije za uplate** - Automatski email kada admin potvrdi uplatu
3. **Email potvrda registracije** - Welcome email nakon registracije

---

## 📮 OPCIJA 1: EmailJS (PREPORUČENO - Besplatno i lako)

EmailJS omogućava slanje email-ova direktno iz frontend-a bez backend koda!

### Setup EmailJS:

**1. Kreiraj EmailJS nalog:**
- Idi na https://www.emailjs.com/
- Sign Up (besplatno)
- Verifikuj email

**2. Dodaj Email Service:**
- Dashboard → Email Services → Add New Service
- Odaberi **Gmail** (najlakše)
- Connect sa svojim Gmail nalogom (npr. `profesor.marina@gmail.com`)
- Service ID: `service_xxxxxxx` (zapamti ovo)

**3. Kreiraj Email Templates:**

**A. Template za Kontakt Formu:**
- Dashboard → Email Templates → Create New Template
- Template Name: `contact_form`
- Template ID: `template_contact` (zapamti)

Sadržaj:
```
Subject: Nova poruka sa kontakt forme - {{from_name}}

Ime: {{from_name}}
Email: {{from_email}}
Telefon: {{phone}}

Poruka:
{{message}}

---
Poslato sa Online Srpski Kursevi platforme
```

**B. Template za Potvrdu Uplate:**
- Create New Template
- Template Name: `payment_confirmed`
- Template ID: `template_payment`

Sadržaj:
```
Subject: Vaša uplata je potvrđena! 🎉

Poštovani/a {{user_name}},

Vaša uplata za kurs "{{course_name}}" je uspešno potvrđena!

Sada možete pristupiti svim video lekcijama i materijalima kursa.

Pristup kursu: https://onlinesrpski.com/course/{{course_id}}

Hvala što ste odabrali naše kurseve!

Srećno učenje! 📚

---
Online Srpski Kursevi
Profesorka Marina Lukić
```

**C. Template za Welcome Email:**
- Template Name: `welcome_email`
- Template ID: `template_welcome`

Sadržaj:
```
Subject: Dobrodošli na Online Srpski Kurseve! 🎓

Zdravo {{user_name}}!

Hvala što ste se registrovali na našu platformu!

Sada možete:
✓ Pregledati dostupne kurseve
✓ Kupiti kurs koji vam odgovara
✓ Pratiti svoj napredak

Pogledajte naše kurseve: https://onlinesrpski.com

Srećno učenje!

---
Profesorka Marina Lukić
Online Srpski Kursevi
```

**4. Uzmi API Keys:**
- Dashboard → Account → API Keys
- Public Key: `YOUR_PUBLIC_KEY`
- Private Key (opciono)

---

### Implementacija EmailJS u Frontend:

**1. Install EmailJS:**
```bash
cd frontend
npm install @emailjs/browser
```

**2. Kreiraj Email Service:**

Fajl: `frontend/src/services/email.service.js`

```javascript
import emailjs from '@emailjs/browser';

// EmailJS Config
const EMAILJS_SERVICE_ID = 'service_xxxxxxx'; // Tvoj Service ID
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Tvoj Public Key

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

/**
 * Send contact form email
 */
export const sendContactEmail = async (formData) => {
  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || 'N/A',
      message: formData.message,
      to_email: 'profesor.marina@gmail.com', // Email profesorke
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_contact', // Template ID
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Greška pri slanju email-a');
  }
};

/**
 * Send payment confirmation email to user
 */
export const sendPaymentConfirmationEmail = async (userData, courseData) => {
  try {
    const templateParams = {
      user_name: userData.name,
      user_email: userData.email,
      course_name: courseData.title,
      course_id: courseData.id,
      to_email: userData.email,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_payment',
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Greška pri slanju email-a');
  }
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (userName, userEmail) => {
  try {
    const templateParams = {
      user_name: userName,
      to_email: userEmail,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_welcome',
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('Email send error:', error);
    // Don't throw - welcome email is not critical
    return { success: false, error };
  }
};
```

**3. Dodaj EmailJS keys u .env:**

Fajl: `frontend/.env.local`

```env
# ... existing Firebase config ...

# EmailJS
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
```

Ažuriraj `email.service.js`:
```javascript
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
```

---

### Kreiranje Kontakt Forme:

Fajl: `frontend/src/components/ContactForm.jsx`

```jsx
import { useState } from 'react';
import { sendContactEmail } from '../services/email.service';
import { Mail, User, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      await sendContactEmail(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Greška pri slanju poruke. Pokušajte ponovo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8">
      <h3 className="text-2xl font-bold mb-6">Kontaktirajte nas</h3>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <p className="text-green-700">
            Poruka uspešno poslata! Odgovorićemo vam uskoro.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Ime i prezime
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="Vaše ime"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            <Mail className="inline h-4 w-4 mr-2" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="vas.email@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            <Phone className="inline h-4 w-4 mr-2" />
            Telefon (opciono)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            placeholder="060 123 4567"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            <MessageSquare className="inline h-4 w-4 mr-2" />
            Poruka
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            rows={5}
            placeholder="Vaša poruka..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full disabled:opacity-50"
        >
          {sending ? (
            <>Slanje...</>
          ) : (
            <>
              <Send className="inline h-4 w-4 mr-2" />
              Pošalji poruku
            </>
          )}
        </button>
      </form>
    </div>
  );
}
```

---

### Dodavanje Kontakt Forme na HomePage:

Ažuriraj `frontend/src/pages/HomePage.jsx`:

```jsx
// Na vrhu fajla dodaj import
import ContactForm from '../components/ContactForm';

// U return() bloku, zameni footer sekciju sa:

{/* Contact Section */}
<section id="kontakt" className="section-padding">
  <div className="container-custom">
    <div className="text-center mb-12">
      <h2 className="mb-6">
        Kontaktirajte <span className="text-gradient">nas</span>
      </h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Imate pitanja? Pošaljite nam poruku i odgovorićemo vam uskoro
      </p>
    </div>

    <div className="max-w-2xl mx-auto">
      <ContactForm />
    </div>
  </div>
</section>

{/* Footer ostaje isti */}
```

---

### Email nakon potvrde uplate:

Ažuriraj `frontend/src/components/admin/PaymentVerifier.jsx`:

```jsx
// Na vrhu fajla dodaj import
import { sendPaymentConfirmationEmail } from '../../services/email.service';

// U funkciji confirmPayment(), nakon što se uplata potvrdi, dodaj:

const confirmPayment = async (transactionId, userId, courseId) => {
  // ... existing code ...

  try {
    const confirmPaymentFn = httpsCallable(functions, 'confirmPayment');
    await confirmPaymentFn({ transactionId, userId, courseId });

    // ✅ DODAJ OVO - Pošalji email korisniku
    try {
      await sendPaymentConfirmationEmail(
        {
          name: payment.user?.ime || 'Korisnik',
          email: payment.user?.email,
        },
        {
          title: payment.course?.title || 'Kurs',
          id: courseId,
        }
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne prekidaj flow ako email ne uspe
    }

    await loadPendingPayments();
    alert('Uplata uspešno potvrđena! Email poslat korisniku.');
  } catch (error) {
    // ... existing error handling
  }
};
```

---

### Welcome Email nakon registracije:

Ažuriraj `frontend/src/pages/RegisterPage.jsx`:

```jsx
// Na vrhu dodaj import
import { sendWelcomeEmail } from '../services/email.service';

// U handleSubmit funkciji, nakon uspešne registracije:

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await registerUser(formData.email, formData.password, formData.name, formData.phone);

    // ✅ DODAJ OVO - Pošalji welcome email
    try {
      await sendWelcomeEmail(formData.name, formData.email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Ne prekidaj registraciju ako email ne uspe
    }

    navigate('/dashboard');
  } catch (err) {
    // ... existing error handling
  }
};
```

---

## 📮 OPCIJA 2: SendGrid (Za produkciju sa Firebase Functions)

SendGrid je profesionalniji ali zahteva backend kod.

**Setup:**
1. Kreiraj nalog: https://sendgrid.com (100 email/dan besplatno)
2. Create API Key
3. Dodaj u `backend/functions/.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
   ```

**Backend funkcija:**

Fajl: `backend/functions/src/sendEmail.js`

```javascript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = 'profesor@onlinesrpski.com'; // Verified sender u SendGrid

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const sendPaymentConfirmationEmail = onCall(async (request) => {
  const { userEmail, userName, courseName } = request.data;

  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured');
    return { success: false };
  }

  const msg = {
    to: userEmail,
    from: FROM_EMAIL,
    subject: 'Vaša uplata je potvrđena! 🎉',
    html: `
      <h2>Poštovani/a ${userName},</h2>
      <p>Vaša uplata za kurs <strong>${courseName}</strong> je uspešno potvrđena!</p>
      <p>Sada možete pristupiti svim video lekcijama.</p>
      <p>Hvala što ste odabrali naše kurseve!</p>
      <br>
      <p>Srećno učenje! 📚</p>
      <p>---<br>Profesorka Marina Lukić<br>Online Srpski Kursevi</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new HttpsError('internal', 'Email sending failed');
  }
});
```

---

## 🧪 TESTIRANJE EMAIL FUNKCIONALNOSTI

### Test Kontakt Forme:
1. Idi na HomePage
2. Scroll do "Kontaktirajte nas" sekcije
3. Popuni formu
4. Klikni "Pošalji"
5. Proveri inbox profesorkinog email-a

### Test Payment Email:
1. Admin potvrdi uplatu u Admin panelu
2. Korisnik bi trebalo da dobije email

### Test Welcome Email:
1. Registruj novog korisnika
2. Proveri email inbox

---

## 💡 TIPS

1. **EmailJS besplatni plan:** 200 email-ova mesečno
2. **Gmail SMTP limit:** 500 email-ova dnevno
3. **Za produkciju:** Razmotri SendGrid ili Mailgun
4. **Spam filter:** Dodaj SPF i DKIM records za custom domain

---

## ✅ CHECKLIST

- [ ] EmailJS nalog kreiran
- [ ] Email service povezan (Gmail)
- [ ] 3 email template-a kreirana (contact, payment, welcome)
- [ ] EmailJS installed: `npm install @emailjs/browser`
- [ ] `email.service.js` kreiran
- [ ] API keys dodati u `.env.local`
- [ ] Kontakt forma dodata na HomePage
- [ ] Email nakon potvrde uplate implementiran
- [ ] Welcome email implementiran
- [ ] Testirano slanje email-a

Gotovo! 🎉
