# ⚡ QUICK START GUIDE - Pokreni platformu za 10 minuta

## 🚨 PRE BILO ČEGA - Proveri da li imaš:

- [ ] Node.js 20+ instaliran (`node --version`)
- [ ] Git instaliran
- [ ] Gmail nalog (za EmailJS ili profesorkin email)
- [ ] 10 minuta slobodnog vremena

---

## 📋 SETUP U 10 KORAKA

### 1. Firebase Projekat (2 min)
```
1. Idi na https://console.firebase.google.com/
2. Klikni "Add project" → Ime: online-srpski-kursevi → Create
3. Authentication → Get Started → Email/Password → Enable
4. Firestore → Create Database → Production mode → europe-west3 → Enable
5. Storage → Get Started → Production mode → Done
6. Project Overview → Web icon (</ >) → Registruj app → KOPIRAJ config
```

### 2. Frontend .env (1 min)
```bash
cd frontend
```

Kreiraj `.env.local`:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=online-srpski-kursevi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=online-srpski-kursevi
VITE_FIREBASE_STORAGE_BUCKET=online-srpski-kursevi.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Backend .env (30 sec)
```bash
cd backend/functions
```

Kreiraj `.env` (ostavi prazno):
```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

### 4. Firebase CLI (1 min)
```bash
npm install -g firebase-tools
firebase login
```

### 5. Firebase Init (2 min)
```bash
cd backend
firebase init

# Odaberi:
- Firestore, Functions, Storage
- Use existing project: online-srpski-kursevi
- Firestore rules: firestore.rules (default)
- Functions language: JavaScript
- Install dependencies: Yes
```

### 6. Storage Rules (1 min)

Kreiraj `backend/storage.rules`:
```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /invoices/{invoiceId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /payment-confirmations/{confirmationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. Deploy Rules & Functions (3 min)
```bash
cd backend
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

cd functions
npm install
cd ..
firebase deploy --only functions
```

⏳ Ovaj korak traje 2-3 minuta...

### 8. Pokreni Frontend (1 min)
```bash
cd frontend
npm install
npm run dev
```

Otvori: `http://localhost:5173`

### 9. Kreiraj Admin Nalog (2 min)
```
1. Idi na http://localhost:5173
2. Klikni "Registruj se"
3. Popuni: admin@example.com / admin123 / Admin / 060123456
4. Idi na Firebase Console → Firestore → users → Pronađi admin@example.com
5. Dodaj field: role = "admin" (string)
6. Logout i login ponovo
7. Idi na /admin - Radi! ✅
```

### 10. Test Flow (3 min)
```
1. Admin: /admin → Kursevi → + Novi kurs
   - Naziv: Test Kurs
   - Cena: 1000
   - Status: Aktivan → Sačuvaj

2. Odjavi se → Registruj novi nalog (korisnik@test.com)

3. Klikni na kurs → Generiši uplatnicu → Preuzmi PDF ✅

4. Dashboard → Upload potvrdu o uplati (bilo koja slika) ✅

5. Login kao admin → Uplate → Potvrdi uplatu ✅

6. Login kao korisnik → Dashboard → Vidi "Moji kursevi" ✅
```

---

## 🎉 GOTOVO!

Platforma radi! Sad možeš:
- Dodavati kurseve
- Upload-ovati video lekcije
- Primati uplate
- Verifikovati uplate

---

## 🐛 Problemi?

**"Permission denied"**
→ Proveri da li si deploy-ovao rules: `firebase deploy --only firestore:rules`

**"Config not found"**
→ Proveri `.env.local` u frontend folderu

**"Admin panel ne radi"**
→ Proveri da li si dodao `role: "admin"` u Firestore users kolekciju

**Functions ne rade**
→ Proveri: `firebase functions:log`

---

## 📧 Email Setup (BONUS - 5 min)

Vidi: `EMAIL_SETUP_GUIDE.md`

1. EmailJS nalog → Connect Gmail → 200 email-ova mesečno besplatno
2. Dodaj 3 template-a (contact, payment, welcome)
3. `npm install @emailjs/browser`
4. Dodaj u `.env.local`
5. Implementiraj email.service.js

---

## 🚀 Deploy na Vercel (5 min)

```bash
# Push na GitHub
git add .
git commit -m "Ready for deploy"
git push

# Vercel
1. vercel.com → New Project → Import GitHub repo
2. Framework: Vite
3. Root: frontend
4. Environment Variables: Copy sve iz .env.local
5. Deploy! ✅
```

Firebase Auth domains:
```
Authentication → Settings → Authorized domains
→ Add: your-app.vercel.app
```

---

## 💰 Troškovi

**Development:** $0
**Production (100 korisnika):** ~$10/mesec
- Firebase: $5-10
- Vercel: $0 (Free tier)

---

Srećno! 🚀
