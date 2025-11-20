# 🗄️ Firebase Storage Setup - BRZO!

## Problem:
```
Error: Firebase Storage has not been set up on project 'naucisprski'
```

## Rešenje (2 minuta):

### 1. Otvori Firebase Console
https://console.firebase.google.com/project/naucisprski/storage

### 2. Klikni "Get Started"
Trebalo bi da vidiš dugme **"Get Started"** ili **"Započni"**

### 3. Odaberi Security Rules
Izaberi: **"Start in production mode"**
(Ionako imamo custom rules koje ćemo deploy-ovati)

### 4. Odaberi Location
Izaberi: **europe-west3** (Frankfurt) ili **europe-west1** (Belgium)
⚠️ **VAŽNO:** Ova lokacija se ne može promeniti!

### 5. Klikni "Done"
Storage bucket će biti kreiran automatski.

### 6. Verify Bucket Name
Trebalo bi da vidiš:
- Bucket name: `naucisprski.firebasestorage.app` ✅

---

## Nakon što je Storage kreiran:

### Deploy Storage Rules
Vrati se u terminal i uradi:

```bash
cd backend
firebase deploy --only storage:rules
```

Trebalo bi da vidiš:
```
✅ Deploy complete!
```

---

## Provera da li Storage radi:

### Proveri u Firebase Console:
1. Storage → Files tab
2. Trebalo bi da vidiš praznu listu foldera (to je OK)
3. Storage je spreman! ✅

---

## Storage Structure (Automatski će se kreirati):

Kada počneš da koristiš app, Storage će automatski kreirati:

```
naucisprski.firebasestorage.app/
├── invoices/                    # PDF uplatnice
│   └── TRANS-xxxxx.pdf
├── payment-confirmations/       # Slike potvrda o uplati
│   └── TRANS-xxxxx/
│       └── confirmation.jpg
├── videos/                      # Video lekcije
│   └── lesson-xxxxx.mp4
├── course-files/               # Dodatni materijali
│   └── course-xxxxx/
│       └── file.pdf
└── thumbnails/                 # Slike za kurseve
    └── course-xxxxx.jpg
```

---

## Storage Rules (Već spremne!)

Naše storage rules (`backend/storage.rules`) već imaju:

✅ **Invoices** - Svi auth korisnici mogu čitati
✅ **Payment Confirmations** - Users upload, admin čita
✅ **Videos** - Signed URLs only (security)
✅ **Course Files** - Auth users mogu čitati
✅ **Thumbnails** - Javno dostupno

---

## Sledeći Korak:

Nakon Storage setup-a i deploy-a rules, uradi:

```bash
cd backend/functions
npm install
cd ..
firebase deploy --only functions
```

Ovo će deploy-ovati sve Cloud Functions! 🚀

---

## ✅ Success Checklist:

- [ ] Firebase Storage kreiran u Console
- [ ] Location odabran (europe-west3 ili europe-west1)
- [ ] `firebase deploy --only storage:rules` - uspešno
- [ ] Bucket name: `naucisprski.firebasestorage.app` ✅

Kad ovo uradiš, Storage je spreman! 🎉
