# 📋 Platform for Teaching Serbian - Project Status

**Last Updated:** 2025-12-23
**Status:** 🟡 Active Development - Critical Tasks Remaining

---

## 🔴 KRITIČNI ZADACI (Must-Fix for MVP)

### 1. Email Sistem - NEEDS COMPLETE REPLACEMENT ⚠️
- [ ] **IZBACITI EmailJS:** Potpuno ukloniti `@emailjs/browser` paket i sve EmailJS reference
- [ ] **Gmail + Firebase Functions:** Implementirati nodemailer sa Gmail-om u Firebase Functions
- [ ] **Email Templates:** Kreirati email templates direktno u kodu (HTML)
- [ ] **Email Functions:**
  - `sendContactFormEmail` - Contact forma
  - `sendPaymentConfirmationEmail` - Potvrda uplate
  - `sendPaymentRejectionEmail` - Odbijanje uplate
  - `sendWelcomeEmail` - Welcome email za nove korisnike
- [ ] **Gmail Konfiguracija:** Podesiti Gmail account i app-specific password
- [ ] **Environment Variables:** Dodati `GMAIL_USER` i `GMAIL_APP_PASSWORD` u backend `.env`

**Razlog:** EmailJS ima limit od 200 emailova/mesec na free planu. Gmail + Firebase je 100% besplatno (do 500 emailova/dan).

---

### 2. Hardkodovane Vrednosti → Environment Variables 🚨

#### **KRITIČNO - PaymentModal.jsx**
- [ ] **Broj računa banke:** Trenutno hardkodovan `160-00000000-00` na liniji 10 i 49
  - **Fajl:** `frontend/src/components/payment/PaymentModal.jsx`
  - **Treba:** `VITE_BANK_ACCOUNT` environment variable

#### **Kontakt Informacije - Više Fajlova**
- [ ] **Email adresa:** `kontakt@naucisprski.com` hardkodovan u Privacy i Terms stranama
  - **Treba:** `VITE_CONTACT_EMAIL`
- [ ] **Telefon:** `+381 XX XXX XXXX` pattern u HomePage, ContactPage, AboutPage, BenefitsPage
  - **Treba:** `VITE_CONTACT_PHONE`
- [ ] **Domain URL:** `https://naucisprski.com` hardkodovan u `email.service.js`
  - **Treba:** `VITE_APP_URL`

#### **Dodatne Environment Variables Potrebne:**
```bash
# Frontend .env
VITE_BANK_ACCOUNT=160-00000000000-00
VITE_APP_URL=https://naucisprski.com
VITE_CONTACT_EMAIL=kontakt@naucisprski.com
VITE_CONTACT_PHONE=+381 XX XXX XXXX
VITE_COMPANY_NAME=Nauči Srpski
VITE_COMPANY_ADDRESS=Beograd, Srbija
```

---

### 3. Nedostajuće UI Komponente

#### **ErrorBoundary Component**
- [ ] **Kreirati:** `frontend/src/components/ErrorBoundary.jsx`
- [ ] **Implementacija:** React error boundary za global error handling
- [ ] **Integracija:** Wrap App.jsx sa ErrorBoundary

#### **Spinner/Loader Component**
- [ ] **Kreirati:** `frontend/src/components/ui/Spinner.jsx`
- [ ] **Dizajn:** Mint green spinner sa brendom
- [ ] **Zaменити:** Trenutni custom loading divovi u svim stranama

#### **Toast/Notification Component**
- [ ] **Kreirati:** `frontend/src/components/ui/Toast.jsx`
- [ ] **Zaменити:** Trenutne `alert()` pozive sa profesionalnim toast notifikacijama
- [ ] **Library:** Razmisliti o `react-hot-toast` ili custom implementaciji

#### **Modal Component (Generički)**
- [ ] **Kreirati:** `frontend/src/components/ui/Modal.jsx`
- [ ] **Trenutno:** Samo PaymentModal postoji (specifičan)
- [ ] **Treba:** Generički modal wrapper za sve slučajeve

---

### 4. Backend i Deployment

#### **Firebase Functions - Ready for Deployment ✅ (Ali ne deployan)**
- [ ] **Deploy Functions:** Izvršiti `firebase deploy --only functions`
- [ ] **Testirati Functions:**
  - `helloWorld` - Test funkcija
  - `getVideoUrl` - Cloudflare R2 signed URLs
  - `generateInvoice` - PDF generisanje
  - ~~`confirmPayment`~~ (Trenutno nekorišćen - client-side logika)
  - ~~`rejectPayment`~~ (Trenutno nekorišćen - client-side logika)

#### **Firebase Firestore Rules**
- [ ] **Deploy Rules:** `firebase deploy --only firestore:rules`
- [ ] **Proveriti:** Security rules su napisane, ali nisu deployovane

#### **Firebase Storage Rules**
- [ ] **Deploy Rules:** `firebase deploy --only storage:rules`
- [ ] **Proveriti:** Security rules su napisane, ali nisu deployovane

#### **Firebase Indexes**
- [ ] **Deploy Indexes:** `firebase deploy --only firestore:indexes`
- [ ] **Potrebni indexi:**
  - `transactions`: `user_id ASC`, `created_at DESC`
  - `transactions`: `status ASC`, `created_at DESC`
  - `lessons`: `course_id ASC`, `order ASC`

---

### 5. Admin i Korisnici

#### **Admin Korisnik**
- [ ] **Kreirati Admin:** Ručno kreirati korisnika u Firebase Auth
- [ ] **Dodati Role:** U Firestore `users` collection dodati `role: 'admin'`
- [ ] **Testirati:** Login kao admin i pristup Admin Panel-u

#### **Email Verification Flow**
- [ ] **Implementirati:** Email verification za nove korisnike
- [ ] **Firebase Auth:** Podesiti email verification u Firebase console
- [ ] **UI:** Dodati stranicu za email verification

---

### 6. Video Handling

#### **Video Duration Extraction (TODO u kodu)**
- [ ] **Fajl:** `frontend/src/components/admin/LessonManager.jsx` (linija 124)
- [ ] **Problem:** Video duration je hardkodovan na `0`
- [ ] **Rešenje:** Ekstraktovati pravu trajanje videa iz metadata nakon uploada
- [ ] **Library:** Koristiti `video-metadata` npm paket ili browser API

---

## ⚠️ SREDNJI PRIORITET (Important but not MVP-blocking)

### UI/UX Poboljšanja
- [ ] **404 Not Found Page:** Kreirati dedicated 404 stranicu
- [ ] **Profile Settings Page:** Korisnici ne mogu editovati svoj profil
- [ ] **Course Progress Tracking UI:** Firestore ima `progress` collection ali nema UI
- [ ] **Loading States:** Standardizovati loading states sa novim Spinner komponentom

### Code Quality
- [ ] **Centralizovana Form Validation:** Kreirati reusable validation utilities
- [ ] **Obrisati Backup Fajlove:** `HomePageOld.jsx`, `AdminPage_old.jsx`, itd. (5 backup fajlova)
- [ ] **TypeScript Migration (Opciono):** Dodati TypeScript za type safety

### Payment Flow
- [ ] **QR Code za Plaćanje:** Generisati QR kod za instant payment
- [ ] **Payment Status Tracking:** Real-time updates za korisnike kada admin potvrdi uplatu

---

## 📊 STATISTIKA PROJEKTA

### ✅ Kompletno (Što Radi)
- **Frontend:** 13 public pages + 2 protected pages (15 total)
- **Components:** 14 React komponenti (admin, payment, course, UI)
- **Services:** 6 frontend services + utility functions
- **Firebase Functions:** 4 funkcije napisane (ali ne deployovane)
- **Security Rules:** Firestore i Storage rules napisane
- **Auth Flow:** Login, Register, Logout, Password Reset
- **Payment Flow:** Invoice generation, Upload proof, Admin verification
- **Video Player:** Cloudflare R2 sa signed URLs (1 sat expiry)
- **Responsive Design:** Sve stranice responzivne (mobile, tablet, desktop)
- **Design System:** Konzistentan dizajn sa Mint/Navy/Coral paletom

### 🔴 Nekompletno (Što Fali)
- **Email Sistem:** EmailJS (treba zameniti sa Gmail + nodemailer)
- **Hardcoded Values:** Broj računa, telefon, email, domain
- **UI Components:** ErrorBoundary, Spinner, Toast, Modal (generički)
- **Admin User:** Nema admin korisnika u bazi
- **Firebase Deploy:** Functions, rules, indexes nisu deployovani
- **Video Duration:** Hardkodovan na 0
- **Email Verification:** Nema email verification flow
- **Profile Settings:** Nema stranica za edit profila
- **Progress Tracking:** Nema UI za praćenje progresa

---

## 🎯 PRIORITIZOVAN PLAN AKCIJE

### FAZA 1: Kritične Popravke (Mora se uraditi)
1. **Dan 1-2:**
   - [ ] Zameni EmailJS sa Gmail + nodemailer u Firebase Functions
   - [ ] Pomeri sve hardkodovane vrednosti u `.env` fajlove
   - [ ] Kreiraj ErrorBoundary, Spinner, Toast, Modal komponente

2. **Dan 3:**
   - [ ] Deploy Firebase Functions
   - [ ] Deploy Firestore Rules
   - [ ] Deploy Storage Rules
   - [ ] Deploy Firestore Indexes

3. **Dan 4:**
   - [ ] Kreiraj admin korisnika
   - [ ] Testiraj kompletan payment flow (invoice → upload → verify → email)
   - [ ] Testiraj video access flow (signed URLs)

### FAZA 2: Poboljšanja (Nice to have)
4. **Dan 5-6:**
   - [ ] Implementiraj email verification
   - [ ] Dodaj Profile Settings page
   - [ ] Dodaj Course Progress Tracking UI
   - [ ] Kreiraj 404 page

5. **Dan 7:**
   - [ ] Implementiraj video duration extraction
   - [ ] Dodaj QR code za plaćanje
   - [ ] Obriši backup fajlove

---

## 📞 LINKOVI I RESURSI

- **Firebase Console:** https://console.firebase.google.com/project/naucisprski
- **Cloudflare R2:** https://dash.cloudflare.com/{account_id}/r2
- **Local Dev Server:** http://localhost:3000
- **Firebase Functions Region:** europe-west1

---

## 🔧 TEHNIČKI STACK

| Kategorija | Tehnologija | Verzija | Status |
|------------|------------|---------|--------|
| **Frontend** | React + Vite | 18.3.1 / 5.4.21 | ✅ |
| **Routing** | React Router | 7.9.5 | ✅ |
| **Styling** | Tailwind CSS | 3.4.11 | ✅ |
| **State** | Zustand | 5.0.8 | ✅ |
| **Forms** | React Hook Form + Zod | 7.66.0 / 4.1.12 | ✅ |
| **Icons** | Lucide React | 0.553.0 | ✅ |
| **Video** | Video.js | 8.23.4 | ✅ |
| **Backend** | Firebase (Auth, Firestore, Functions, Storage) | Admin SDK 13.1.0 | ✅ (Not Deployed) |
| **Functions Runtime** | Node.js 20 ES Modules | 20 | ✅ |
| **Email** | ~~EmailJS~~ → Gmail + nodemailer | - | 🔴 TODO |
| **PDF** | PDFKit | 0.15.0 | ✅ |
| **Video Storage** | Cloudflare R2 | - | ✅ |

---

## 📈 PROJECT HEALTH

| Metric | Status | Notes |
|--------|--------|-------|
| **Build** | 🟢 Passing | Vite build uspešan |
| **Dev Server** | 🟢 Running | Port 3000 |
| **Environment** | 🟡 Partial | Frontend OK, Backend missing Gmail config |
| **Database** | 🟢 Connected | Firestore ready |
| **Auth** | 🟢 Working | Firebase Auth ready |
| **Storage** | 🟢 Connected | Firebase Storage + R2 ready |
| **Functions** | 🔴 Not Deployed | Code ready, needs deployment |
| **Email** | 🔴 Broken | EmailJS needs replacement |
| **Security** | 🟡 Partial | Rules written, not deployed |
| **Ready for MVP** | 🔴 No | Critical tasks remaining |

---

**BOTTOM LINE:**
Projekat je 80% kompletan. Backend code je dobar, ali email sistem i hardkodovane vrednosti moraju biti popravljeni pre produkcije. Functions treba deployovati. Admin user treba kreirati. Nakon toga, MVP je spreman za testiranje.

**Next Action:** Zameni EmailJS sa Gmail + nodemailer, pomeri hardcoded values u .env, deplouj Firebase.
