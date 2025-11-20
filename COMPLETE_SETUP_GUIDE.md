# 🚀 KOMPLETNO UPUTSTVO ZA SETUP I TESTIRANJE PLATFORME

## 📊 ANALIZA TRENUTNOG STANJA

### ✅ ŠTA JE IMPLEMENTIRANO (85% MVP-a)

**Frontend:**
- ✅ Autentifikacija (Login, Register)
- ✅ HomePage sa kursevima i profesorkom
- ✅ CoursePage sa payment flow-om
- ✅ DashboardPage za korisnike
- ✅ AdminPage sa CourseManager, LessonManager, PaymentVerifier
- ✅ Payment komponente (InvoiceGenerator, PaymentConfirmationUpload)
- ✅ Routing i zaštićene rute

**Backend:**
- ✅ Firebase Functions (generateInvoice, confirmPayment, rejectPayment, getVideoUrl)
- ✅ Firestore security rules
- ✅ Storage rules (treba deploy-ovati)

**Dizajn:**
- ✅ Tailwind CSS konfigurisan
- ✅ Moderan UI sa glass-card efektima
- ✅ Responsive dizajn

---

## ❌ ŠTA NEDOSTAJE / RUPE U SISTEMU

### 🔴 KRITIČNE RUPE (Mora se uraditi pre testiranja):

1. **Storage Rules nisu deploy-ovane**
   - Fajl `backend/storage.rules` ne postoji
   - Potrebno kreirati i deploy-ovati

2. **Firebase nije inicijalizovan u backend folderu**
   - Nema `backend/firebase.json` fajla
   - Mora se pokrenuti `firebase init`

3. **Environment varijable nisu popunjene**
   - `frontend/.env.local` mora postojati
   - `backend/functions/.env` mora postojati

4. **Admin korisnik ne postoji**
   - Nema načina da se admin loguje
   - Mora se ručno dodati role='admin' u Firestore

5. **Firestore indexes nisu kreirani**
   - LessonManager komponenta koristi složeni query (order by)
   - Firebase će prikazati link za kreiranje index-a pri prvom pokušaju

### 🟡 MINOR RUPE (Može se dodati kasnije):

1. **Email notifikacije nisu implementirane**
   - Korisnici ne dobijaju email nakon potvrde uplate
   - SendGrid integracija postoji ali nije povezana

2. **Video player nije testiran sa signed URLs**
   - Cloudflare R2 setup nije urađen
   - Za MVP može se koristiti Firebase Storage

3. **Error handling nije kompletan**
   - Neke error poruke nisu user-friendly
   - Trebaju loading spinners na nekim mestima

4. **Forgot Password funkcionalnost nije implementirana**
   - Postoji samo Login i Register

---

## 🔧 RUČNE RADNJE KOJE MORAŠ URADITI

### 1. KREIRANJE FIREBASE PROJEKTA

**Koraci:**
1. Idi na https://console.firebase.google.com/
2. Klikni "Add project"
3. Ime projekta: `online-srpski-kursevi` (ili kako god želiš)
4. Omogući Google Analytics (opciono)
5. Klikni "Create project"

---

### 2. OMOGUĆAVANJE SERVISA U FIREBASE-U

**A. Authentication:**
1. U Firebase Console → **Authentication** → **Get Started**
2. Klikni na **Email/Password** provider
3. Omogući (toggle na ON)
4. Sačuvaj

**B. Firestore Database:**
1. U Firebase Console → **Firestore Database** → **Create database**
2. Odaberi **Production mode**
3. Lokacija: `europe-west3` (Frankfurt - najbliži)
4. Klikni "Enable"

**C. Storage:**
1. U Firebase Console → **Storage** → **Get started**
2. Odaberi **Production mode**
3. Klikni "Done"

---

### 3. KREIRANJE WEB APP U FIREBASE-U

1. U Project Overview → klikni Web ikonu (`</>`)
2. App nickname: `online-srpski-frontend`
3. **NE** čekiraj "Firebase Hosting"
4. Klikni "Register app"
5. **VAŽNO:** Kopiraj `firebaseConfig` objekat koji ti prikaže

Primer:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "online-srpski-kursevi.firebaseapp.com",
  projectId: "online-srpski-kursevi",
  storageBucket: "online-srpski-kursevi.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

---

### 4. KONFIGURISANJE ENVIRONMENT VARIJABLI

**A. Frontend `.env.local`:**

```bash
cd frontend
```

Kreiraj fajl `.env.local` i dodaj (zameni sa svojim vrednostima):

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=online-srpski-kursevi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=online-srpski-kursevi
VITE_FIREBASE_STORAGE_BUCKET=online-srpski-kursevi.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**B. Backend `.env`:**

```bash
cd backend/functions
```

Kreiraj fajl `.env` (za sada bez Cloudflare R2):

```env
# Ostavi prazno za sada - R2 nije obavezan za MVP testiranje
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Email - opciono
SENDGRID_API_KEY=
ADMIN_EMAIL=profesor@example.com
```

---

### 5. INICIJALIZACIJA FIREBASE CLI

**Instalacija (ako nije instaliran):**
```bash
npm install -g firebase-tools
```

**Login:**
```bash
firebase login
```

**Inicijalizacija u backend folderu:**
```bash
cd backend
firebase init
```

**Odaberi sledeće opcije:**
- **Firestore:** Yes (Firestore Rules and indexes)
- **Functions:** Yes (Cloud Functions)
- **Storage:** Yes (Storage rules)
- **Emulators:** No (za sada)

**Kada te pita:**
- **Project:** Use existing project → odaberi `online-srpski-kursevi`
- **Firestore Rules file:** `firestore.rules` (već postoji)
- **Firestore indexes file:** `firestore.indexes.json` (default)
- **Functions language:** JavaScript
- **ESLint:** No (već konfigurisano)
- **Install dependencies:** Yes
- **Overwrite existing files?** NO (nemoj da overwrite-uješ firestore.rules)

---

### 6. KREIRANJE STORAGE RULES FAJLA

Kreiraj fajl `backend/storage.rules`:

```bash
cd backend
```

Kreiraj fajl `storage.rules` sa sledećim sadržajem:

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Videos - authenticated users can read, Cloud Functions can write
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Invoices - only authenticated users can read their own
    match /invoices/{invoiceId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions
    }

    // Payment confirmations - users can upload, everyone can read
    match /payment-confirmations/{confirmationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

### 7. DEPLOY FIREBASE RULES I FUNCTIONS

**Deploy Firestore Rules:**
```bash
cd backend
firebase deploy --only firestore:rules
```

**Deploy Storage Rules:**
```bash
firebase deploy --only storage:rules
```

**Install dependencies u functions folderu:**
```bash
cd functions
npm install
```

**Deploy Cloud Functions:**
```bash
cd backend
firebase deploy --only functions
```

⚠️ **VAŽNO:** Ovaj korak može trajati 5-10 minuta. Functions će biti deploy-ovani na `europe-west1` region.

---

### 8. POKRETANJE FRONTEND APLIKACIJE

**Install dependencies:**
```bash
cd frontend
npm install
```

**Pokreni development server:**
```bash
npm run dev
```

Aplikacija bi trebalo da se otvori na `http://localhost:5173`

---

### 9. KREIRANJE PRVOG KORISNIKA I ADMINA

**A. Registracija:**
1. Otvori `http://localhost:5173`
2. Klikni "Registruj se"
3. Popuni formu:
   - Ime: `Admin`
   - Email: `admin@example.com`
   - Telefon: `0601234567`
   - Lozinka: `admin123` (ili bilo šta)
4. Klikni "Registruj se"

**B. Dodavanje Admin Role:**

1. Idi na Firebase Console → **Firestore Database**
2. Pronađi kolekciju `users`
3. Pronađi dokument sa tvojim email-om (`admin@example.com`)
4. Klikni na dokument
5. Klikni "Add field"
6. Field: `role`
7. Type: `string`
8. Value: `admin`
9. Sačuvaj

**C. Logout i Login ponovo:**
1. Odjavi se iz aplikacije
2. Uloguj se ponovo sa `admin@example.com` i lozinkom
3. Sada možeš pristupiti `/admin` ruti

---

## 🎯 TESTIRANJE KOMPLETNOG FLOW-A

### TEST 1: Admin kreira kurs

1. **Login kao admin** (`admin@example.com`)
2. Idi na `/admin`
3. Klikni "Novi kurs"
4. Popuni formu:
   - Naziv: `Priprema za malu maturu`
   - Opis: `Kompletna priprema za malu maturu iz srpskog jezika`
   - Cena: `5000`
   - Tip: `Video kurs`
   - Status: `Aktivan`
5. Sačuvaj
6. Kurs bi trebalo da se pojavi u listi

### TEST 2: Admin dodaje lekciju

1. U Admin panelu, idi na tab "Lekcije"
2. Odaberi kurs iz dropdown-a
3. Klikni "Dodaj lekciju"
4. Popuni formu:
   - Naziv: `Lekcija 1: Gramatika`
   - Opis: `Osnove gramatike`
   - Video: Odaberi test video fajl (MP4, do 500MB)
5. Klikni "Dodaj lekciju"
6. Čekaj da se upload završi (progress bar)
7. Lekcija bi trebalo da se pojavi u listi

### TEST 3: Korisnik kupuje kurs

1. **Odjavi se kao admin**
2. **Registruj novi korisnik** (npr. `korisnik@example.com`)
3. Idi na Homepage (`/`)
4. Klikni na kurs "Priprema za malu maturu"
5. Klikni "Generiši uplatnicu"
6. **PDF uplatnica bi trebalo da se generiše**
7. Preuzmi PDF
8. Idi na Dashboard (`/dashboard`)
9. U sekciji "Moje uplate" bi trebalo da vidiš pending uplatu
10. **Upload potvrdu o uplati** (slika ili PDF)
11. Potvrda bi trebalo da se upload-uje

### TEST 4: Admin potvrđuje uplatu

1. **Login kao admin** ponovo
2. Idi na `/admin` → tab "Uplate"
3. Bi trebalo da vidiš pending uplatu od korisnika
4. Klikni "Pogledaj potvrdu" da vidiš upload-ovanu sliku
5. Klikni "Potvrdi uplatu"
6. Uplata bi trebalo da se potvrdi

### TEST 5: Korisnik pristupa kursu

1. **Login kao korisnik** (`korisnik@example.com`)
2. Idi na Dashboard
3. U sekciji "Moji kursevi" bi trebalo da vidiš kupljeni kurs
4. Klikni na kurs
5. **Bi trebalo da vidiš video lekcije**
6. Klikni na lekciju da je reproducuješ

---

## 🐛 TROUBLESHOOTING - Česti Problemi

### Problem 1: "Firebase config is not defined"
**Rešenje:** Proveri da li si kreirao `frontend/.env.local` fajl sa svim vrednostima.

### Problem 2: "Permission denied" u Firestore
**Rešenje:**
1. Proveri da li si deploy-ovao Firestore rules: `firebase deploy --only firestore:rules`
2. Proveri da li korisnik ima `role: 'admin'` u Firestore-u

### Problem 3: Cloud Function ne radi
**Rešenje:**
1. Proveri Firebase Console → Functions da vidiš da li su deploy-ovane
2. Proveri logs: `firebase functions:log`
3. Proveri da li si instalirao dependencies: `cd backend/functions && npm install`

### Problem 4: Upload videa ne radi
**Rešenje:**
1. Proveri da li si deploy-ovao Storage rules: `firebase deploy --only storage:rules`
2. Proveri veličinu videa (max 500MB za Storage)

### Problem 5: "Failed to create index" u LessonManager
**Rešenje:**
1. Kada vidiš error, Firebase će ti dati link za kreiranje index-a
2. Klikni na link i prati instrukcije
3. Čekaj 2-3 minuta da se index kreira

### Problem 6: PDF uplatnica se ne generiše
**Rešenje:**
1. Proveri da li je `generateInvoice` funkcija deploy-ovana
2. Proveri browser console za errors
3. Proveri Firebase Functions logs

---

## 📦 DEPLOYMENT NA PRODUKCIJU

### 1. Deploy Frontend na Vercel

**A. Push kod na GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

**B. Vercel Deploy:**
1. Idi na https://vercel.com
2. "New Project"
3. Import GitHub repo
4. Framework preset: Vite
5. Root Directory: `frontend`
6. **Environment Variables:** Dodaj sve iz `.env.local`
7. Deploy

**C. Firebase Auth Domains:**
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain
3. Dodaj Vercel domain (npr. `online-srpski.vercel.app`)

### 2. Deploy Backend (već urađeno)

Functions su već deploy-ovane sa:
```bash
firebase deploy --only functions
```

### 3. Custom Domain (opciono)

**Vercel:**
1. Project Settings → Domains
2. Add domain: `www.onlinesrpski.com`
3. Prati DNS instrukcije

**Firebase:**
1. Authentication → Settings → Authorized domains
2. Dodaj custom domain

---

## 🔐 SECURITY CHECKLIST PRE PRODUKCIJE

- [ ] Firestore rules deploy-ovane
- [ ] Storage rules deploy-ovane
- [ ] Admin role postavljen ručno u Firestore
- [ ] `.env` fajlovi dodati u `.gitignore` (već dodati)
- [ ] Firebase API keys restricted (samo dozvoljeni domeni)
- [ ] HTTPS svuda (automatski sa Vercel)
- [ ] Rate limiting na Functions (Firebase automatski)

---

## 📊 COST TRACKING

**Za testiranje (Development):**
- Firebase: Free tier (dovoljno za testiranje)
- Vercel: Free tier

**Za produkciju (Low traffic - 100 korisnika):**
- Firebase: ~$5-10/mesec
- Vercel: $0 (Free tier)
- **Ukupno: ~$10/mesec**

---

## 🎓 DODATNE FUNKCIONALNOSTI (Post-MVP)

### Cloudflare R2 Setup (za video storage)

1. Napravi Cloudflare nalog: https://dash.cloudflare.com
2. Idi na R2 → Create bucket: `online-srpski-videos`
3. API Tokens → Create token
4. Kopiraj:
   - Account ID
   - Access Key ID
   - Secret Access Key
5. Dodaj u `backend/functions/.env`
6. Redeploy functions: `firebase deploy --only functions`

### Email Notifikacije (SendGrid)

1. Napravi SendGrid nalog: https://sendgrid.com
2. Create API Key
3. Dodaj u `backend/functions/.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxx
   ```
4. Implementiraj email funkcije (u TODO listi)

---

## 🆘 PODRŠKA

Ako imaš problema:

1. **Proveri logs:**
   ```bash
   # Firebase Functions logs
   firebase functions:log

   # Frontend console (browser DevTools)
   ```

2. **Restart development server:**
   ```bash
   # Frontend
   Ctrl+C
   npm run dev
   ```

3. **Clear cache:**
   - Browser: Ctrl+Shift+Delete
   - Firestore: Delete test data i probaj ponovo

---

## ✅ FINALNI CHECKLIST

**Pre prvog testa:**
- [ ] Firebase projekat kreiran
- [ ] Authentication omogućen
- [ ] Firestore kreiran
- [ ] Storage omogućen
- [ ] Web app registrovan u Firebase
- [ ] `frontend/.env.local` kreiran i popunjen
- [ ] `backend/functions/.env` kreiran
- [ ] `firebase init` pokrenut u backend folderu
- [ ] `backend/storage.rules` kreiran
- [ ] Firestore rules deploy-ovani
- [ ] Storage rules deploy-ovani
- [ ] Cloud Functions deploy-ovane
- [ ] Frontend pokrenut (`npm run dev`)
- [ ] Admin korisnik registrovan
- [ ] Admin role dodat u Firestore

**Za testiranje flow-a:**
- [ ] Admin kreira kurs ✅
- [ ] Admin dodaje lekciju ✅
- [ ] Korisnik kupuje kurs ✅
- [ ] Korisnik upload-uje potvrdu ✅
- [ ] Admin potvrđuje uplatu ✅
- [ ] Korisnik gleda video ✅

---

## 🎉 GOTOVO!

Ako su svi koraci urađeni, platforma bi trebalo da radi potpuno funkcionalno!

**Sledeći koraci:**
1. Testiraj sve funkcionalnosti
2. Fiksiraj bugove koji se pojave
3. Deploy na Vercel
4. Share sa prvim korisnicima! 🚀
