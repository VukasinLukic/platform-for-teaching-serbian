# Online Srpski Kursevi

Online platforma za kurseve srpskog jezika - priprema za malu maturu i video lekcije.

## 📋 Opis projekta

Web aplikacija koja omogućava:
- Kupovinu online kurseva srpskog jezika
- Gledanje video lekcija
- Praćenje napretka
- Admin panel za upravljanje kursevima i uplatama

## 🎨 Dizajn

- **Primarna boja**: Svetlo zelena (#BFECC9)
- **Sekundarna boja**: Tamno plava/petrol (#003366)
- **Stil**: Minimalistički, bela pozadina

## 🛠️ Tehnologije

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- Firebase SDK

### Backend
- Firebase Authentication
- Firebase Firestore
- Firebase Functions (serverless)
- Firebase Storage
- Cloudflare R2 (video storage)

### Deployment
- Frontend: Vercel
- Backend: Firebase
- Video: Cloudflare R2

## 📁 Struktura projekta

```
online-srpski/
├── frontend/          # React aplikacija
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── functions/     # Firebase Cloud Functions
│   ├── firestore.rules
│   └── storage.rules
├── docs/              # Dokumentacija
├── storage/           # Lokalni test fajlovi
└── plan.md            # Detaljan plan implementacije
```

## 🚀 Pokretanje projekta

### Prerequisites

- Node.js 20+
- npm ili yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Setup

1. **Kloniraj repo**
   ```bash
   git clone <repo-url>
   cd online-srpski
   ```

2. **Frontend setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Popuni .env.local sa Firebase config
   ```

3. **Backend setup**
   ```bash
   cd backend/functions
   npm install
   cp .env.example .env
   # Popuni .env sa API keys
   ```

4. **Firebase login**
   ```bash
   firebase login
   firebase use --add  # Izaberi Firebase projekat
   ```

### Development

**Frontend (port 3000)**
```bash
cd frontend
npm run dev
```

**Backend (Firebase Emulators - opciono)**
```bash
cd backend
firebase emulators:start
```

### Build

**Frontend**
```bash
cd frontend
npm run build
```

**Backend deployment**
```bash
cd backend
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 📝 Environment Variables

### Frontend (.env.local)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend Functions (.env)

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
SENDGRID_API_KEY=...
ADMIN_EMAIL=...
```

## 🔐 Firestore struktura

- **users/** - Profili korisnika
- **courses/** - Kursevi
- **lessons/** - Video lekcije
- **transactions/** - Uplate
- **user_courses/** - Kupljeni kursevi po korisniku
- **files/** - Dodatni materijali

## 📦 Glavne funkcionalnosti

### MVP (Faza 1-5)
- ✅ Registracija/Login korisnika
- ✅ Pregled dostupnih kurseva
- ✅ Generisanje PDF uplatnice
- ✅ Upload potvrde o uplati
- ✅ Reprodukcija video lekcija (zaštićene signed URLs)
- ✅ Admin dashboard

### Post-MVP (Faza 6)
- Email notifikacije
- Kvizovi i testovi
- Progress tracking za videe
- Google Meet integracija za uživo časove
- Kupon kodovi
- Sertifikati

## 💰 Procena troškova

- Vercel: $0 (Free tier)
- Firebase: $5-10/mesec (Free tier + malo više)
- Cloudflare R2: $2-3/mesec (100GB storage)
- SendGrid: $0 (Free tier)
- **Ukupno: ~$10-20/mesec**

## 📖 Dokumentacija

Vidi `plan.md` za detaljan plan implementacije po fazama.

## 🤝 Doprinos

Projekat trenutno u razvoju. Za pitanja kontaktiraj tim.

## 📄 Licenca

Sva prava zadržana © 2025 Online Srpski Kursevi

---

**Status**: 🚧 U razvoju (Faza 0 završena)
