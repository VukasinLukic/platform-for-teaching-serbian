# 📧 Kako napraviti Gmail App Password

## Koraci za kreiranje App Password-a

### 1. **Uloguj se na Google Account**
Idi na: https://myaccount.google.com/

### 2. **Omogući 2-Step Verification (ako već nije)**
- Idi na: Security → 2-Step Verification
- Klikni "Get Started"
- Prati korake da omogućiš 2FA

### 3. **Kreiraj App Password**
- Idi na: https://myaccount.google.com/apppasswords
- Ili: Security → 2-Step Verification → App passwords (scroll down)

### 4. **Generiši novi password**
- Select app: **Mail**
- Select device: **Other (Custom name)**
- Unesi: `Srpski u Srcu Platform` ili `Nodemailer`
- Klikni **Generate**

### 5. **Kopiraj App Password**
Google će pokazati 16-karakterni password (npr: `abcd efgh ijkl mnop`)

**VAŽNO:** Ovaj password se prikazuje **samo jednom**! Kopiraj ga odmah.

### 6. **Ubaci u .env fajl**
```env
GMAIL_USER=tvojnovimail@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## ⚠️ NAPOMENA

- **App Password** je različit od tvog običnog Gmail password-a
- Koristi se za aplikacije koje ne podržavaju 2FA
- Nikada nemoj deliti App Password
- Gmail dozvolјava **500 emailova dnevno** (besplatno)

---

## 🔒 SIGURNOST

- `.env` fajl je u `.gitignore` → **neće biti commit-ovan**
- App Password je siguran način da aplikacija šalje emailove bez pristupa tvom glavnom Google nalogu
- Možeš opozvati App Password bilo kada: https://myaccount.google.com/apppasswords

---

## ✅ POSLE POSTAVLJANJA

1. Restartuj Firebase Emulator (ako radi lokalno)
2. Testuj slanjem test email-a
3. Proveri logs: `firebase functions:log`
