# 🚀 Deployment Instructions - Pokreni odmah!

## ✅ ŠTA JE VEĆ URADJENO:

1. ✅ Firebase projekat povezan (.firebaserc kreiran)
2. ✅ Storage rules već postoje i spremni su
3. ✅ Firestore rules već postoje i spremni su
4. ✅ Backend .env kreiran
5. ✅ Frontend .env već postoji sa ispravnim podacima

## 🔥 DEPLOJOVANJE (RADI OVO SADA):

### 1. Login u Firebase (1 min)

Otvori terminal u `backend` folderu i uradi:

```bash
cd backend
firebase login
```

Ovo će otvoriti browser gde se loguješ sa svojim Google nalogom.

### 2. Deploy Firestore Rules (30 sec)

```bash
firebase deploy --only firestore:rules
```

Ovo će odmah rešiti sve "Missing or insufficient permissions" greške!

### 3. Deploy Storage Rules (30 sec)

```bash
firebase deploy --only storage:rules
```

### 4. Deploy Cloud Functions (2-3 min)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Ovo će deploy-ovati:
- `generateInvoice` - za generisanje PDF uplatnice
- `confirmPayment` - za potvrđivanje uplate (admin)
- `rejectPayment` - za odbijanje uplate (admin)
- `getVideoUrl` - za generisanje signed URLs

### 5. Pokreni Frontend (1 min)

Novi terminal:

```bash
cd frontend
npm install
npm run dev
```

Otvori: `http://localhost:5173`

---

## 👤 KREIRANJE ADMIN NALOGA (3 min)

### Način 1: Kroz Firebase Console (Preporuceno)

1. Idi na `http://localhost:5173`
2. Klikni **"Registruj se"**
3. Popuni formu:
   - Email: `admin@naucisprski.com` (ili bilo koji email)
   - Password: `Admin123!`
   - Ime: `Admin`
   - Telefon: `060123456`
4. Registruj se

5. **Dodaj admin rolu u Firestore:**
   - Idi na [Firebase Console](https://console.firebase.google.com/)
   - Odaberi projekat: `naucisprski`
   - Firestore Database → Data tab
   - Pronađi kolekciju: `users`
   - Pronađi dokument sa tvojim email-om
   - Klikni **Add Field**:
     - Field: `role`
     - Type: `string`
     - Value: `admin`
   - Save

6. Logout i Login ponovo na `http://localhost:5173`
7. Idi na `/admin` - Trebalo bi da radi! ✅

### Način 2: Direktno u Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → `naucisprski` projekat
2. Authentication → Users → Add user
3. Email: `admin@naucisprski.com`, Password: `Admin123!`
4. Kopiraj User UID
5. Firestore Database → users → Add document:
   ```
   Document ID: [paste UID]
   email: admin@naucisprski.com
   ime: Admin
   telefon: 060123456
   role: admin
   createdAt: [Timestamp - current]
   ```

---

## 🧪 TEST FLOW (5 min)

### Test 1: Admin Panel

1. Login kao admin: `http://localhost:5173/login`
2. Idi na: `http://localhost:5173/admin`
3. Trebalo bi da vidiš 3 taba: **Kursevi**, **Lekcije**, **Uplate**

### Test 2: Kreiranje Kursa

1. Admin panel → **Kursevi** tab
2. Klikni **+ Dodaj novi kurs**
3. Popuni:
   - Naziv: `Test Kurs - Srpski A1`
   - Opis: `Osnovni kurs za početnike`
   - Cena: `5000`
   - Status: `Aktivan`
4. Sačuvaj
5. Trebalo bi da vidiš kurs u listi ✅

### Test 3: Upload Lekcije (Opciono - ako imaš video)

1. Admin panel → **Lekcije** tab
2. Odaberi kurs iz dropdown-a
3. Upload video (maks 100MB)
4. Lekcija bi trebala biti vidljiva

### Test 4: Registracija Korisnika

1. Logout
2. Registruj se sa novim emailom: `korisnik@test.com`
3. Trebalo bi da te redirectuje na Dashboard ✅

### Test 5: Kupovina Kursa (Payment Flow)

1. HomePage → Pronađi "Test Kurs"
2. Klikni na kurs
3. Klikni **"Generiši uplatnicu"**
4. Trebalo bi da se download-uje PDF sa instrukcijama ✅
5. Dashboard → **Uplate** tab
6. Upload potvrdu (bilo koja slika - JPG/PNG)
7. Klikni Upload ✅

### Test 6: Admin Verifikacija Uplate

1. Login kao admin
2. Admin panel → **Uplate** tab
3. Trebalo bi da vidiš pending uplatu
4. Klikni **"Vidi potvrdu"** - otvara se slika
5. Klikni **"Potvrdi uplatu"** ✅
6. Uplata nestaje iz liste

### Test 7: Pristup Kursu

1. Login kao korisnik (`korisnik@test.com`)
2. Dashboard → **Moji kursevi**
3. Trebalo bi da vidiš "Test Kurs" ✅
4. Klikni na kurs → Video lekcije dostupne

---

## ❗ PROBLEMI I REŠENJA

### Problem: "Missing or insufficient permissions"
**Rešenje:** Deploy-uj rules:
```bash
cd backend
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Problem: "No active project"
**Rešenje:** Proveri da li postoji `.firebaserc` u `backend` folderu:
```json
{
  "projects": {
    "default": "naucisprski"
  }
}
```

### Problem: "Admin panel je prazan"
**Rešenje:** Proveri da li si dodao `role: "admin"` u Firestore users dokument.

### Problem: Functions ne rade
**Rešenje:** Proveri logs:
```bash
firebase functions:log
```

### Problem: "Failed to generate invoice"
**Rešenje:** Proveri da li su functions deploy-ovane:
```bash
firebase functions:list
```

Trebalo bi da vidiš:
- `confirmPayment`
- `generateInvoice`
- `getVideoUrl`
- `rejectPayment`

---

## 📊 ŠTA ĆEŠ VIDETI NAKON DEPLOY-a:

1. **Firestore Rules:** ✅ Deployed
   - Users mogu čitati/pisati svoje podatke
   - Admin ima pristup svemu
   - Transactions zaštićene

2. **Storage Rules:** ✅ Deployed
   - Invoices može čitati bilo ko authenticated
   - Payment confirmations može videti samo admin
   - Videos dostupni samo preko signed URLs

3. **Cloud Functions:** ✅ Deployed (4 funkcije)
   - `generateInvoice` - generisanje PDF uplatnice
   - `confirmPayment` - potvrđivanje uplate
   - `rejectPayment` - odbijanje uplate
   - `getVideoUrl` - signed URL za video

---

## 🎯 SLEDEĆI KORACI (Optional)

### 1. Email Setup (EmailJS)
Vidi: [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)
- Kontakt forma
- Email notifikacije za uplate
- Welcome email nakon registracije

### 2. Production Deploy
Vidi: [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md) - sekcija "Deploy na Vercel"

### 3. Video Storage sa R2 (Optional)
- Cloudflare R2 za jeftinije video hosting
- Vidi `.env.example` za konfiguraciju

---

## ✅ SUCCESS CHECKLIST

Pre nego što počneš da testiraš, proveri:

- [ ] `firebase login` - uspešno
- [ ] `firebase deploy --only firestore:rules` - uspešno
- [ ] `firebase deploy --only storage:rules` - uspešno
- [ ] `firebase deploy --only functions` - uspešno (4 funkcije)
- [ ] `npm run dev` u frontend folderu - radi
- [ ] Admin nalog kreiran i `role: "admin"` dodat u Firestore
- [ ] Možeš pristupiti `/admin` sa admin nalogom

Kad sve ovo radi, platforma je spremna za upotrebu! 🎉

---

## 🆘 HELP

Ako nešto ne radi:
1. Proveri Firebase Console logs
2. Proveri browser console za greške
3. Proveri `firebase functions:log`
4. Proveri da li su svi env fajlovi na mestu

**Backend .env location:** `backend/functions/.env`
**Frontend .env location:** `frontend/.env`

Srećno! 🚀
