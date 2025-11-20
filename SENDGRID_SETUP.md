# SendGrid Email Setup Guide

## 🎯 Zašto SendGrid?

SendGrid omogućava profesionalno slanje email notifikacija korisnicima nakon potvrde/odbijanja uplate. Implementiran je u `backend/functions/src/sendEmail.js` sa 4 funkcije:

1. **sendPaymentConfirmationEmail** - Poslato nakon što admin potvrdi uplatu
2. **sendPaymentRejectionEmail** - Poslato kada admin odbije uplatu
3. **sendWelcomeEmail** - Dobrodošlica za nove korisnike
4. **sendContactFormEmail** - Contact forma sa sajta

---

## 📋 Korak 1: Kreiranje SendGrid Naloga

1. Idi na https://signup.sendgrid.com/
2. Registruj se sa email adresom `vukasin4sports@gmail.com` (ili koristiti drugu)
3. Potvrdi email adresu
4. Popuni detalje:
   - Company Name: "Nauči Srpski" ili "Marina Lukić"
   - Company Website: https://naucisprski.com (ili trenutno localhost ako još nema domena)
   - I'm a: "Developer"
   - Sending emails for: "Education" ili "Courses/Training"

---

## 🔑 Korak 2: Kreiraj API Key

1. U SendGrid Dashboard-u, idi na **Settings** → **API Keys**
2. Klikni **Create API Key**
3. Ime: `Nauci-Srpski-Production` (ili `Development` za testiranje)
4. Permissions: **Full Access** (ili samo "Mail Send" restricted access)
5. Klikni **Create & View**
6. **VAŽNO**: Kopiraj API ključ ODMAH - neće biti ponovo prikazan!

Izgled API ključa: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 Korak 3: Dodaj API Key u .env

Otvori `backend/functions/.env` i dodaj:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
ADMIN_EMAIL=vukasin4sports@gmail.com
CONTACT_EMAIL=kontakt@naucisprski.com
CONTACT_PHONE=+381 60 123 4567
BANK_ACCOUNT=160-5500000000000-00
```

**Zameni**:
- `SG.your_actual_api_key_here` → Tvoj pravi API ključ
- Email, telefon i bankovni račun ako su drugačiji

---

## ✉️ Korak 4: Verifikuj Sender Email

SendGrid **mora da verifikuje** email adresu sa koje šalješ emailove:

### Opcija A: Single Sender Verification (Brže, za početnike)

1. Idi na **Settings** → **Sender Authentication**
2. Klikni **Verify a Single Sender**
3. Popuni formu:
   - **From Name**: Nauči Srpski
   - **From Email Address**: kontakt@naucisprski.com (ili neki postojeći email koji kontrolišeš)
   - **Reply To**: isti email
   - **Company Address**: Adresa profesorke ili tvoja
4. Klikni **Create**
5. SendGrid će poslati verifikacioni email na `kontakt@naucisprski.com`
6. Otvori email i klikni **Verify Single Sender**

**⚠️ PROBLEM**: Ako ne posjeduješ `kontakt@naucisprski.com`, koristi:
- Gmail koji kontrolišeš: `vukasin4sports@gmail.com`
- Privremeni Mailtrap/Gmail dok ne kupiš domen

Onda u `sendEmail.js` promeni FROM_EMAIL:

```javascript
// Trenutno (linija 8-9):
const FROM_EMAIL = process.env.CONTACT_EMAIL || 'kontakt@naucisprski.com';

// Promeni u:
const FROM_EMAIL = 'vukasin4sports@gmail.com'; // Email koji si verifikovao
```

### Opcija B: Domain Authentication (Profesionalno, za produkciju)

Ako imaš `naucisprski.com` domen:

1. Idi na **Settings** → **Sender Authentication**
2. Klikni **Authenticate Your Domain**
3. Unesi: `naucisprski.com`
4. SendGrid će dati DNS zapise (CNAME, TXT)
5. Dodaj te zapise u DNS podešavanja domena (npr. Namecheap, GoDaddy)
6. Sačekaj 24-48h za DNS propagaciju
7. Verifikuj u SendGrid

---

## 🧪 Korak 5: Testiranje Email Funkcija

### Test 1: Direktno pozivanje funkcije

Otvori `backend/functions/src/sendEmail.js` i dodaj na kraj fajla:

```javascript
// TEST ONLY - obriši posle testiranja
import { config } from 'dotenv';
config();

sendPaymentConfirmationEmail(
  'vukasin4sports@gmail.com',
  'Vukašin',
  'Priprema za malu maturu - Srpski jezik',
  'test-transaction-123'
).then(() => console.log('Email poslat!'))
  .catch(err => console.error('Greška:', err));
```

Pokreni:

```bash
cd backend/functions
node src/sendEmail.js
```

**Očekivani output**: "✅ Confirmation email sent successfully to vukasin4sports@gmail.com"

**Proveri inbox** na `vukasin4sports@gmail.com` - trebalo bi da vidiš profesionalni email sa:
- Zeleni header "Uplata potvrđena! 🎉"
- Detalje kursa i transakcije
- Zeleni button "Pristupi kursu"

### Test 2: Preko Firebase Functions (nakon deploya)

```bash
# U drugom terminalu, startuj Firebase emulator
firebase emulators:start --only functions

# Pozovi confirmPayment funkciju koja će poslati email
curl -X POST http://localhost:5001/naucisprski/europe-west1/confirmPayment \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "test123", "userId": "testUser", "courseId": "testCourse"}'
```

---

## 📊 Korak 6: Monitoring

Nakon slanja emailova, proveri u SendGrid Dashboard-u:

1. **Activity Feed**: Idi na **Email Activity** → vidi sve poslane emailove
2. Filteri:
   - Status: Delivered / Bounced / Deferred
   - Email adresa
   - Datum
3. Klikni na email za detaljne informacije (bounce reason, open rate, click rate)

---

## 🚨 Troubleshooting

### Problem 1: "SendGrid API key not configured"

**Simptom**: Console log pokazuje "Skipping email notification"

**Rešenje**:
1. Proveri da li postoji `SENDGRID_API_KEY` u `.env`
2. Proveri da počinje sa `SG.`
3. Restartuj Firebase Functions emulator

### Problem 2: "The from address does not match a verified Sender Identity"

**Simptom**: Email se ne šalje, error u logu

**Rešenje**:
1. Verifikuj sender email preko SendGrid Dashboard → Sender Authentication
2. Promeni `FROM_EMAIL` u `sendEmail.js` na verifikovani email

### Problem 3: Email stiže u Spam

**Rešenje**:
1. Dodaj Domain Authentication (Opcija B iznad)
2. Dodaj SPF i DKIM zapise u DNS
3. Ne koristi promocione reči u subject-u ("BESPLATNO", "KLIKNI OVDE")

### Problem 4: "Quota exceeded" - SendGrid Free Tier Limit

**Simptom**: Error nakon 100 emailova/dan

**Rešenje**:
- SendGrid Free Tier: **100 emailova/dan**
- Ako treba više, upgrade na Essentials plan ($19.95/mesec za 50,000 emailova)

---

## ✅ Finalna Checklist

Pre deploya u produkciju:

- [ ] SendGrid nalog kreiran
- [ ] API key generisan i dodat u `.env`
- [ ] Sender email verifikovan (Single Sender ili Domain)
- [ ] Test email uspešno poslat (`node src/sendEmail.js`)
- [ ] Email templates izgledaju profesionalno (proveri inbox)
- [ ] FROM_EMAIL i ADMIN_EMAIL su ispravni u `.env`
- [ ] Firebase Functions deploy-ovane (`firebase deploy --only functions`)
- [ ] confirmPayment/rejectPayment testovani end-to-end

---

## 📈 Produkcija - Best Practices

1. **Domain Authentication**: Obavezno za produkciju (smanjuje spam rate)
2. **Monitoring**: Prati bounce rate i spam complaints u SendGrid Activity Feed
3. **Unsubscribe Link**: Dodaj u footer (zakonska obaveza u nekim zemljama)
4. **Rate Limiting**: SendGrid Free = 100/dan, planiraj upgrade ako imaš više korisnika
5. **Backup Plan**: Imaj fallback email servis (Mailgun, AWS SES) ako SendGrid padne

---

## 🔗 Korisni Linkovi

- SendGrid Dashboard: https://app.sendgrid.com/
- API Keys: https://app.sendgrid.com/settings/api_keys
- Sender Authentication: https://app.sendgrid.com/settings/sender_auth
- Email Activity: https://app.sendgrid.com/email_activity
- SendGrid Docs: https://docs.sendgrid.com/

---

## 💡 Alternative: EmailJS (Frontend)

Trenutno NIJE implementiran, ali može se koristiti za **contact formu** na frontendu:

```javascript
// frontend/src/pages/ContactPage.jsx
import emailjs from '@emailjs/browser';

emailjs.send(
  'service_n9h13wd', // Već kreiran u .env
  'template_contact',
  formData,
  'YOUR_PUBLIC_KEY_HERE'
);
```

**Prednosti**: Ne zahteva backend
**Mane**: Manje siguran, limit od 200 emailova/mesec (free tier)

Za produkciju: **Koristi SendGrid** (backend) za sve transakcione emailove.
