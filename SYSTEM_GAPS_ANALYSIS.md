# 🔍 SISTEM - ANALIZA RUPA I NEDOSTATAKA

## 📊 TRENUTNI STATUS: **75% KOMPLETAN ZA MVP**

---

## 🔴 KRITIČNE RUPE (Must-Fix Pre Launcha)

### 1. ❌ Email Notifikacioni Sistem
**Status**: Potpuno nedostaje
**Prioritet**: 🔴 KRITIČNO
**Vreme**: 3-4 sata
**Impact**: Korisnici ne dobijaju potvrde o uplati, registraciji

**Fajlovi koji nedostaju**:
- `backend/functions/src/sendEmail.js`

**Potrebno**:
- SendGrid ili EmailJS integracija
- Email template-i:
  - Potvrda uplate
  - Odbijanje uplate
  - Welcome email
  - Zaboravljena lozinka

**Gde se poziva** (već implementirano ali komentarisano):
- `confirmPayment.js:71` - `// TODO: Send email notification to user`
- `rejectPayment.js:133` - `// TODO: Send email notification`

---

### 2. ❌ Frontend .env.example Fajl
**Status**: Ne postoji
**Prioritet**: 🔴 KRITIČNO
**Vreme**: 5 minuta
**Impact**: Developer onboarding impossible

**Trenutno postoji**: `backend/functions/.env.example` ✅
**Nedostaje**: `frontend/.env.example` ❌

---

### 3. ⚠️ Hardkodovane Vrednosti (Security Risk)

#### Lokacije:
1. **R2 Account ID u .env.example**
   - Fajl: `backend/functions/.env.example:3`
   - Vrednost: `1c7e439f65e12d8262275c91c65ce106`
   - Fix: Zameniti sa `YOUR_R2_ACCOUNT_ID_HERE`

2. **Email adresa**
   - Fajl: `backend/functions/src/generateInvoice.js:343`
   - Vrednost: `profesor@onlinesrpski.com`
   - Fix: Prebaciti u env variable

3. **Broj bankovnog računa**
   - Fajl: `backend/functions/src/generateInvoice.js:264`
   - Vrednost: `160-0000000000000-00`
   - Fix: Prebaciti u env variable

4. **Telefon**
   - Fajl: `backend/functions/src/generateInvoice.js:344`
   - Vrednost: `+381 XX XXX XXXX`
   - Fix: Prebaciti u env variable

---

## 🟡 VISOK PRIORITET (Should-Have Za Bolji UX)

### 4. ❌ Password Reset Page
**Status**: Link postoji ali stranica ne
**Prioritet**: 🟡 HIGH
**Vreme**: 1 sat

**Lokacija linka**: `LoginPage.jsx:78`
```jsx
<Link to="/reset-password">Zaboravili ste lozinku?</Link>
```

**Potrebno**:
- `frontend/src/pages/ResetPasswordPage.jsx`
- Forma za unos email-a
- Poziv `sendPasswordResetEmail(auth, email)`

---

### 5. ⚠️ Video Duration Extraction
**Status**: TODO komentar
**Prioritet**: 🟡 HIGH
**Vreme**: 2 sata

**Lokacija**: `frontend/src/components/admin/LessonManager.jsx:124`
```javascript
// TODO: Extract video duration
```

**Potrebno**:
- Koristiti `URL.createObjectURL` i `<video>` element
- Izvući `duration` property
- Sačuvati u Firestore `lessons` collection

---

### 6. ⚠️ Error Boundaries
**Status**: Ne postoje
**Prioritet**: 🟡 HIGH
**Vreme**: 1 sat

**Potrebno**:
- `frontend/src/components/ErrorBoundary.jsx`
- Wrap oko `<App />` u `main.jsx`
- Fallback UI za greške

---

## 🟢 SREDNJI PRIORITET (Nice-to-Have)

### 7. ⚠️ Progress Tracking UI
**Status**: Backend spremna, frontend delimično
**Prioritet**: 🟢 MEDIUM
**Vreme**: 3 sata

**Šta postoji**:
- Firestore `progress` collection spremna
- VideoPlayer ima hooks za tracking
- SaveProgress funkcija postoji

**Šta nedostaje**:
- UI indikator progresa na lekcijama
- Continue watching feature
- Dashboard statistika

---

### 8. ❌ Reusable UI Components
**Status**: Folder postoji, komponente ne
**Prioritet**: 🟢 MEDIUM
**Vreme**: 4 sata

**Folder**: `frontend/src/components/ui/` (prazan)

**Potrebne komponente**:
- Button.jsx
- Input.jsx
- Card.jsx
- Modal.jsx
- Spinner.jsx
- Alert.jsx

**Trenutno**: Sve inline u page-ovima

---

### 9. ⚠️ Loading States
**Status**: Neki postoje, neki ne
**Prioritet**: 🟢 MEDIUM
**Vreme**: 2 sata

**Gde postoje** ✅:
- HomePage - courses loading
- VideoPlayer - video loading

**Gde nedostaju** ❌:
- RegisterPage - submit button
- LoginPage - submit button
- PaymentConfirmationUpload - upload button
- CourseManager - save button

---

### 10. ❌ Admin Statistics Dashboard
**Status**: Ne postoji
**Prioritet**: 🟢 MEDIUM (Post-MVP)
**Vreme**: 4 sata

**Potrebno**:
- Ukupan broj učenika
- Ukupan prihod
- Broj pending uplata
- Chart sa registracijama

---

## 🔵 NIZAK PRIORITET (Post-MVP / Faza 6)

### 11. ❌ Quiz System
**Status**: Planirano u Fazi 6
**Prioritet**: 🔵 LOW

**Plan postoji u**: `plan.md:1834-1857`

---

### 12. ❌ Google Meet Integration
**Status**: Planirano u Fazi 6
**Prioritet**: 🔵 LOW

**Plan postoji u**: `plan.md:1859-1898`

---

### 13. ❌ Coupon System
**Status**: Planirano u Fazi 6
**Prioritet**: 🔵 LOW

**Plan postoji u**: `plan.md:1900-1948`

---

### 14. ❌ Certificates
**Status**: Planirano u Fazi 6
**Prioritet**: 🔵 LOW

---

### 15. ❌ Analytics Tracking
**Status**: Ne postoji
**Prioritet**: 🔵 LOW

**Potrebno**:
- Google Analytics
- Event tracking (registration, purchase, video watch)

---

## 📦 DEPLOYMENT CHECKLIST

### ✅ ŠTA JE SPREMNO

- [x] Firebase projekat konfigurisan
- [x] Firestore rules napisane i testirane
- [x] Storage rules napisane
- [x] Cloud Functions struktura
- [x] Frontend build konfiguracija
- [x] Backend dependencies instalirane
- [x] Frontend dependencies instalirane

### ❌ ŠTA NEDOSTAJE

- [ ] Firebase Extensions API omogućen
- [ ] Cloud Functions deploy-ovane
- [ ] Storage bucket kreiran
- [ ] Admin user kreiran
- [ ] Email servis konfigurisan
- [ ] Production env variables
- [ ] Custom domain setup
- [ ] SSL sertifikat

---

## 🐛 BUG-OVI I WORKAROUND-OVI

### 1. Firebase CLI Rate Limit
**Problem**: `Error 429 - Quota exceeded`
**Uzrok**: Previše API enable pokušaja
**Rešenje**: Manual enable API-ja kroz Google Cloud Console

### 2. Storage Rules Deploy Error
**Problem**: `Error: Firebase Storage has not been set up`
**Uzrok**: Storage nije inicijalizovan
**Rešenje**: Ručno kreirati bucket u Firebase Console

---

## 📁 FAJLOVI KOJI NEDOSTAJU

### Backend
1. ❌ `backend/functions/src/sendEmail.js`
2. ⚠️ `backend/functions/src/uploadVideoToR2.js` (opciono)

### Frontend
3. ❌ `frontend/.env.example`
4. ❌ `frontend/src/pages/ResetPasswordPage.jsx`
5. ❌ `frontend/src/components/ui/Button.jsx`
6. ❌ `frontend/src/components/ui/Input.jsx`
7. ❌ `frontend/src/components/ui/Modal.jsx`
8. ❌ `frontend/src/components/ui/Spinner.jsx`
9. ❌ `frontend/src/components/ErrorBoundary.jsx`

### Documentation
10. ⚠️ `TESTING_GUIDE.md` (potreban)
11. ⚠️ `ADMIN_MANUAL.md` (potreban)

---

## 🎯 AKCIONI PLAN (Prioritizovano)

### DAN 1 (6-8 sati)

1. **Kreiraj frontend/.env.example** (5min)
2. **Fix hardcoded values** (30min)
   - Email → env
   - Bank account → env
   - Phone → env
3. **Implementiraj sendEmail.js** (3h)
   - SendGrid setup
   - 4 email template-a
   - Integration sa confirmPayment
4. **Kreiraj ResetPasswordPage** (1h)
5. **Add Error Boundaries** (1h)
6. **Test payment flow end-to-end** (2h)

### DAN 2 (4-6 sati)

7. **Add loading states svuda** (2h)
8. **Extract reusable UI components** (2h)
9. **Video duration extraction** (2h)
10. **Deploy na Firebase** (2h)
    - Enable APIs manuelno
    - Deploy functions
    - Deploy storage rules
    - Kreirati admin user

### DAN 3 (2-4 sata)

11. **Testing & Bug Fixing** (3h)
12. **Documentation** (1h)
    - TESTING_GUIDE.md
    - ADMIN_MANUAL.md
    - Update README.md

---

## ✅ SUCCESS METRICS

MVP je spreman kada:
- [ ] Email notifikacije rade
- [ ] Kompletan payment flow funkcioniše
- [ ] Admin može da kreira kurseve i lekcije
- [ ] User može da kupi kurs i gleda videe
- [ ] Sve security rules su deploy-ovane
- [ ] Nema hardkodovanih vrednosti
- [ ] Postoji deployment dokumentacija
- [ ] Admin user je kreiran

---

## 📊 FINALNA PROCENA

| Kategorija | Procenat | Vreme do 100% |
|------------|----------|---------------|
| Backend Functions | 80% | 3-4h |
| Frontend Pages | 90% | 1-2h |
| Frontend Components | 85% | 2-3h |
| Services | 95% | 0-1h |
| Security | 100% | 0h |
| Configuration | 70% | 1h |
| Documentation | 60% | 2-3h |
| Testing | 40% | 3-4h |
| **OVERALL** | **75%** | **15-20h** |

**PROCENJENO VREME DO MVP LAUNCHA: 2-3 RADNA DANA**

---

Kreirao: Claude Code
Datum: 2025-11-19
Projekat: Nauči Srpski - Online Priprema za Malu Maturu
