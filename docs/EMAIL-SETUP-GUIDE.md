# 📧 Email Konfiguracija - Promena sa vukasin4sports na novi email

## ✅ ŠTO JE URAĐENO

1. ✅ **`sendEmail.js` ažuriran** - sada čita iz `.env` fajla umesto hardcoded vrednosti
2. ✅ **dotenv** importovan - automatski učitava `.env` fajl
3. ✅ **`.gitignore`** već sadrži `.env` - neće biti commit-ovan
4. ✅ **`.env` fajl** već postoji u `backend/functions/.env`

---

## 🔧 ŠTA SADA TREBA DA URADIŠ

### **Korak 1: Kreiraj Gmail App Password za novi email**

1. **Otvori Google Account Settings:**
   - Idi na: https://myaccount.google.com/security

2. **Uključi 2-Step Verification (ako već nije):**
   - Security → 2-Step Verification → Get Started
   - Prati korake

3. **Generiši App Password:**
   - Idi na: https://myaccount.google.com/apppasswords
   - **Select app:** Mail
   - **Select device:** Other (Custom name)
   - **Ime:** `Srpski u Srcu Platform`
   - Klikni **Generate**

4. **Kopiraj 16-character password:**
   ```
   Primer: abcd efgh ijkl mnop
   ```
   ⚠️ **VAŽNO:** Prikazuje se samo jednom! Kopiraj odmah.

---

### **Korak 2: Ažuriraj `.env` fajl**

Otvori fajl:
```
backend/functions/.env
```

Promeni ove dve linije:
```env
GMAIL_USER=tvojnovimail@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Zameni sa:**
- `tvojnovimail@gmail.com` - tvoj novi Gmail
- `abcd efgh ijkl mnop` - App Password koji si upravo napravio

**Ostavi ostale linije netaknute** (Cloudflare credentials).

---

### **Korak 3: Testiraj da li radi**

#### Lokalno testiranje (Emulator):
```bash
cd backend/functions
firebase emulators:start --only functions
```

Posle idi u frontend i testiraj contact formu ili email verifikaciju.

#### Provera logs-a:
```bash
firebase functions:log
```

Trebalo bi da vidiš:
```
✅ Using Gmail: tvojnovimail@gmail.com
```

---

### **Korak 4: Deploy na produkciju**

Kad testiraš lokalno i sve radi:

```bash
cd backend/functions
firebase deploy --only functions
```

---

## 🔐 SIGURNOST

- ✅ `.env` fajl je u `.gitignore` → **neće biti pushed na GitHub**
- ✅ App Password je siguran način da aplikacija šalje emailove
- ✅ Možeš opozvati App Password bilo kada: https://myaccount.google.com/apppasswords
- ✅ Gmail limit: **500 emailova dnevno** (besplatno)

---

## 📂 FAJLOVI IZMENJENI

1. `backend/functions/src/sendEmail.js` - sada koristi `process.env.GMAIL_USER` i `process.env.GMAIL_PASSWORD`
2. `backend/functions/.env` - ažuriraj sa novim credentials (instrukcije gore)

---

## ❓ PROBLEM SA SLANJEM EMAILA?

### **Email se ne šalje:**
1. Proveri da li je App Password tačan (bez razmaka)
2. Proveri da li je 2FA uključen na Gmail nalogu
3. Proveri logs: `firebase functions:log`
4. Proveri da li Gmail blokira pristup: https://myaccount.google.com/notifications

### **"Less secure app access":**
- Gmail više NE podržava "less secure apps"
- MORAŠ koristiti **App Password** (koraci gore)

---

## 🎉 GOTOVO!

Posle ovih koraka, sve će raditi sa novim emailom!

**Fajlovi:**
- `backend/functions/.env` - tvoje credentials (NE COMMIT-uj)
- `backend/functions/src/sendEmail.js` - automatski čita iz .env
- `GMAIL-APP-PASSWORD-GUIDE.md` - detaljne instrukcije za App Password

**Bilo šta nejasno?** Pitaj!
