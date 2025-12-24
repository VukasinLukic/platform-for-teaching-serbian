# 🚀 Nauči Srpski - Deployment Guide

**Last Updated:** 2025-12-23

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Gmail Configuration (OBAVEZNO)
Moraš prvo podesiti Gmail account za nodemailer:

#### Koraci:
1. Napravi Gmail nalog: `naucisrpski@gmail.com` (ili koristi postojeći)
2. Idi na https://myaccount.google.com/security
3. **Uključi 2-Factor Authentication (2FA)**
4. Idi na "App Passwords": https://myaccount.google.com/apppasswords
5. Generiši novi app password za "Mail"
6. Kopiraj 16-character password
7. Update `backend/functions/.env`:
   ```bash
   GMAIL_USER=naucisrpski@gmail.com
   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # Bez razmaka
   ```

---

## 🔑 FIREBASE LOGIN

Prvo se moraš ulogovati u Firebase CLI:

```bash
firebase login
```

Ovo će otvoriti browser gde treba da se uloguješ sa Google nalogom koji ima pristup Firebase projektu `naucisprski`.

**Verify login:**
```bash
firebase projects:list
```

Trebalo bi da vidiš `naucisprski` projekat.

---

## 📦 DEPLOYMENT STEPS

### Step 1: Build Frontend ✅ (Already Done)
```bash
cd frontend
npm run build
cd ..
```

### Step 2: Deploy Firebase Functions
```bash
firebase deploy --only functions
```

**Očekivani output:**
```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing codebase default for deployment
...
✔  Deploy complete!
```

**Functions koji bi trebalo da budu deployovani:**
- `helloWorld` - Test funkcija
- `getVideoUrl` - Cloudflare R2 signed URLs
- `generateInvoice` - PDF invoice generisanje
- `confirmPayment` - Potvrda uplate (trenutno nekorišćen)
- `rejectPayment` - Odbijanje uplate (trenutno nekorišćen)
- `sendContactFormEmail` - Email za kontakt formu
- `sendPaymentConfirmationEmail` - Email za potvrdu uplate
- `sendPaymentRejectionEmail` - Email za odbijanje uplate
- `sendWelcomeEmail` - Welcome email

---

### Step 3: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

### Step 4: Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```

---

### Step 5: Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

---

### Step 6: Deploy Hosting (Frontend)
```bash
firebase deploy --only hosting
```

---

### Step 7: Deploy Everything at Once (Alternative)
```bash
firebase deploy
```

---

## 🧪 POST-DEPLOYMENT TESTING

### Test Firebase Functions

#### 1. Test helloWorld Function
```bash
# U Firebase Console → Functions → helloWorld → Testing
# Ili pozovi direct:
curl https://europe-west1-naucisprski.cloudfunctions.net/helloWorld
```

**Očekivani response:**
```json
{
  "message": "Hello from Online Srpski Kursevi!",
  "timestamp": "2025-12-23T..."
}
```

#### 2. Test Email Functions
U Firebase Console → Functions → sendContactFormEmail → Testing

**Test data:**
```json
{
  "data": {
    "name": "Test Korisnik",
    "email": "test@example.com",
    "phone": "+381 60 123 4567",
    "message": "Test poruka"
  }
}
```

**Proveri:** Da li je email stigao na `kontakt@naucisprski.com`?

---

### Test Frontend

1. Otvori deployed URL (biće prikazan nakon `firebase deploy --only hosting`)
2. Test:
   - [ ] Homepage se učitava
   - [ ] Login/Register forme rade
   - [ ] Courses page prikazuje kurseve
   - [ ] Contact forma šalje email
   - [ ] PaymentModal prikazuje broj računa iz env

---

## 🔧 TROUBLESHOOTING

### Problem: "Error: No currently active project"
**Rešenje:**
```bash
firebase use naucisprski
```

### Problem: "Permission denied" pri deploy
**Rešenje:**
1. Proveri da li si ulogovan: `firebase login:list`
2. Re-login: `firebase logout` pa `firebase login`
3. Proveri pristup projektu u Firebase Console

### Problem: Functions deploy fails
**Rešenje:**
1. Proveri `backend/functions/package.json` - da li su sve dependencies instalirane?
2. Proveri `backend/functions/.env` - da li su sve env variables postavljene?
3. Proveri logs: `firebase functions:log`

### Problem: Email funkcije ne rade
**Rešenje:**
1. Proveri Gmail app password u `.env`
2. Proveri da je 2FA enabled na Gmail account-u
3. Proveri Firebase Functions logs: `firebase functions:log --only sendContactFormEmail`

---

## 📊 VERIFY DEPLOYMENT

### Check Firebase Console
Posle deploya, proveri Firebase Console:

1. **Functions:** https://console.firebase.google.com/project/naucisprski/functions
   - Trebalo bi da vidiš 9 funkcija
   - Status: `Active`

2. **Firestore Rules:** https://console.firebase.google.com/project/naucisprski/firestore/rules
   - Proveri da su rules deployovani

3. **Storage Rules:** https://console.firebase.google.com/project/naucisprski/storage/rules
   - Proveri da su rules deployovani

4. **Hosting:** https://console.firebase.google.com/project/naucisprski/hosting
   - Proveri URL i da li je frontend deployed

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### 1. Create Admin User
U Firebase Console → Authentication:
1. Add user → Email: `admin@naucisprski.com`
2. Set password
3. Kopiraj User UID
4. Idi na Firestore → `users` collection
5. Create document sa UID-om:
   ```json
   {
     "email": "admin@naucisprski.com",
     "ime": "Admin",
     "role": "admin",
     "telefon": "+381 XX XXX XXXX",
     "created_at": (timestamp)
   }
   ```

### 2. Test Admin Panel
1. Login sa admin credentials
2. Idi na `/admin`
3. Test:
   - [ ] Course creation
   - [ ] Lesson upload
   - [ ] Payment verification

### 3. Test Complete Payment Flow
1. Registruj test korisnika
2. "Kupi" kurs → generiše invoice
3. Upload payment confirmation
4. Kao admin, verifikuj uplatu
5. Proveri da li je email stigao

### 4. Monitor Functions
```bash
# Watch logs in real-time
firebase functions:log --only sendContactFormEmail

# Check specific function
firebase functions:log --only generateInvoice --limit 50
```

---

## 🔐 SECURITY REMINDERS

- [ ] `.env` fajlovi su u `.gitignore`
- [ ] Gmail app password nije public
- [ ] Firebase API keys su u `.env` (frontend)
- [ ] R2 credentials su u `.env` (backend)
- [ ] Firestore rules su deployovane (role-based access)
- [ ] Storage rules su deployovane (signed URLs only za video)

---

## 📈 MONITORING

### Firebase Console Links
- **Overview:** https://console.firebase.google.com/project/naucisprski
- **Functions:** https://console.firebase.google.com/project/naucisprski/functions
- **Firestore:** https://console.firebase.google.com/project/naucisprski/firestore
- **Storage:** https://console.firebase.google.com/project/naucisprski/storage
- **Authentication:** https://console.firebase.google.com/project/naucisprski/authentication
- **Hosting:** https://console.firebase.google.com/project/naucisprski/hosting

### Useful Commands
```bash
# List all functions
firebase functions:list

# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only functionName

# Delete specific function
firebase functions:delete functionName

# View hosting releases
firebase hosting:channel:list
```

---

## 🚨 COMMON ERRORS & FIXES

### Error: "Cloud Functions deployment requires the pay-as-you-go (Blaze) plan"
**Rešenje:** Upgrade Firebase plan to Blaze (pay-as-you-go). Ne brini, besplatno je do određenog limita.

### Error: "Build failed" pri Functions deploy
**Rešenje:**
```bash
cd backend/functions
npm install
npm run build  # Ako postoji build script
cd ../..
firebase deploy --only functions
```

### Error: "CORS" kad pozivas Functions sa frontend-a
**Rešenje:** Functions već imaju CORS enabled u kodu (`cors: true`). Ako i dalje ne radi, dodaj:
```javascript
export const myFunction = onCall({ cors: true }, async (request) => {
  // ...
});
```

---

## ✅ DEPLOYMENT CHECKLIST

Pre deploya:
- [x] Frontend build uspešan
- [x] All env variables postavljene
- [x] firebase.json konfigurisan
- [x] .firebaserc kreiran
- [ ] Firebase login complete
- [ ] Gmail app password postavljen

Deployment:
- [ ] Functions deployed
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Firestore indexes deployed
- [ ] Hosting deployed

Post-deployment:
- [ ] Test all functions
- [ ] Create admin user
- [ ] Test payment flow
- [ ] Test email sending
- [ ] Monitor logs for errors

---

**Ready to deploy!** 🚀

Follow steps iznad redom i projekat će biti live!
