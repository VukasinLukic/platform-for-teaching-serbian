# Email Verification - Deployment Checklist

## Pre-Deployment Provere

- [x] Sve funkcije imaju `cors: true` i `region` postavke
- [x] Firestore rules ažurirane za `email_verifications` i `rate_limits`
- [x] Frontend import path ispravljen (`../services/firebase`)
- [x] Error handling dodat u Dashboard resend funkciju
- [x] Duplicate variable declaration bug fixed u `confirmPayment.js`

## Deployment Koraci

### 1. Deploy Backend Functions

```bash
cd backend/functions
npm run deploy
```

**Očekivano vreme**: 5-10 minuta

**Funkcije koje će biti deploy-ovane**:
- ✅ `sendVerificationEmailFunction`
- ✅ `verifyEmailToken`
- ✅ `resendVerificationEmail`

### 2. Postavi FRONTEND_URL Environment Variable

```bash
# Za production
firebase functions:config:set frontend.url="https://srpskiusrcu.com"

# Za development (local testing)
firebase functions:config:set frontend.url="http://localhost:5173"

# Redeploy nakon postavljanja config-a
cd backend/functions
npm run deploy
```

### 3. Deploy Firestore Rules

```bash
cd backend
firebase deploy --only firestore:rules
```

### 4. Deploy Frontend (Opciono - ako je već deploy-ovan)

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## Post-Deployment Testiranje

### Test 1: Registracija Novog Korisnika

1. Idi na `https://srpskiusrcu.com/register`
2. Registruj novi nalog
3. **Očekivano**:
   - ✅ Uspešna poruka: "Регистрација успешна! Послали смо вам email..."
   - ✅ Primljen welcome email
   - ✅ Primljen verification email sa dugmetom
   - ✅ Redirect na `/login` nakon 5 sekundi

### Test 2: Email Verifikacija

1. Proveri inbox
2. Otvori verification email
3. Klikni "✅ Verifikuj email" dugme
4. **Očekivano**:
   - ✅ Redirect na `/verify?token=XXXXX`
   - ✅ "Verifikacija u toku..." poruka
   - ✅ "Email Verifikovan!" uspešna poruka
   - ✅ Countdown 5 sekundi
   - ✅ Auto redirect na `/dashboard`

### Test 3: Resend Verification Email

1. Registruj novi nalog ali ne klikni verification link
2. Idi na Dashboard
3. **Očekivano**:
   - ✅ Vidljiv narandžasti banner
   - ✅ "Пошаљи поново" dugme radi
   - ✅ Novi email primljen

### Test 4: CORS Provera

1. Otvori Browser DevTools Console
2. Klikni "Пошаљи поново" na Dashboard-u
3. **Očekivano**:
   - ❌ **NE SME** biti CORS error
   - ✅ Request uspešno završen
   - ✅ Email poslat

## Troubleshooting

### CORS Error

Ako vidiš:
```
Access to fetch at 'https://us-central1-naucisprski.cloudfunctions.net/resendVerificationEmail'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Rešenje**:
1. Proveri da sve funkcije u `emailVerification.js` imaju:
   ```javascript
   export const functionName = onCall({
     cors: true,
     region: 'us-central1'
   }, async (request) => { ... })
   ```

2. Redeploy funkcije:
   ```bash
   cd backend/functions
   npm run deploy
   ```

### Email Nije Primljen

**Proveri**:
1. Gmail credentials u Firebase config:
   ```bash
   firebase functions:config:get
   ```

2. Cloud Functions logs:
   ```bash
   firebase functions:log --only sendVerificationEmailFunction
   ```

3. Spam folder u email-u

### Verification Link Ne Radi

**Proveri**:
1. `FRONTEND_URL` environment variable:
   ```bash
   firebase functions:config:get frontend.url
   ```

2. Token nije istekao (60 minuta)

3. Browser console za errors

### "Permission Denied" na Firestore

**Proveri**:
1. Firestore rules deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. User ima `emailVerified: true` u:
   - Firebase Auth Console
   - Firestore `users/{uid}`

## Monitoring

### Cloud Functions Logs

```bash
# Sve email verification funkcije
firebase functions:log | grep -i "verification"

# Specifična funkcija
firebase functions:log --only sendVerificationEmailFunction

# Real-time logs
firebase functions:log --follow
```

### Firestore Data

Proveri u Firebase Console:
- `email_verifications` collection - tokens
- `users/{uid}` - `emailVerified` flag
- `rate_limits` - rate limiting data

## Rollback Plan

Ako nešto ne radi:

1. **Rollback Backend**:
   ```bash
   # Vrati se na prethodnu verziju
   firebase functions:delete sendVerificationEmailFunction
   firebase functions:delete verifyEmailToken
   firebase functions:delete resendVerificationEmail
   ```

2. **Rollback Frontend**:
   ```bash
   # Vrati staru verziju RegisterPage
   git checkout HEAD~1 frontend/src/pages/RegisterPage.jsx
   git checkout HEAD~1 frontend/src/services/auth.service.js
   ```

3. **Emergency Fix**:
   - Isključi email verification u Firestore rules privremeno:
     ```javascript
     match /user_courses/{userId} {
       // Temporary - bypass email verification
       allow read: if request.auth.uid == userId || isAdmin();
       allow write: if isAdmin();
     }
     ```

## Success Criteria

✅ Deployment je uspešan kada:

1. Korisnik može da se registruje
2. Verification email stiže u roku od 1 minuta
3. Klik na link vodi na `/verify` stranicu
4. Email se uspešno verifikuje
5. Korisnik može pristupiti kursevima nakon verifikacije
6. "Resend" dugme radi bez CORS errora
7. Nema errors u Cloud Functions logs

## Kontakt

Za pomoć: kontakt@srpskiusrcu.com

---

**Poslednje ažurirano**: 2025-12-27
