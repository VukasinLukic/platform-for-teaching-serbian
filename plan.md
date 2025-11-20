# PLAN IMPLEMENTACIJE
## Online platforma za kurseve srpskog jezika

---

## 📋 SADRŽAJ
1. [Pregled projekta](#pregled-projekta)
2. [Tehnološki stack](#tehnološki-stack)
3. [Struktura projekta](#struktura-projekta)
4. [Faza 0: Setup i konfiguracija](#faza-0-setup-i-konfiguracija)
5. [Faza 1: Osnovni frontend i autentifikacija](#faza-1-osnovni-frontend-i-autentifikacija)
6. [Faza 2: Video sistem i storage](#faza-2-video-sistem-i-storage)
7. [Faza 3: Sistem za plaćanje](#faza-3-sistem-za-plaćanje)
8. [Faza 4: Admin dashboard](#faza-4-admin-dashboard)
9. [Faza 5: Finalizacija MVP](#faza-5-finalizacija-mvp)
10. [Faza 6: Napredne funkcionalnosti](#faza-6-napredne-funkcionalnosti)
11. [Deployment checklist](#deployment-checklist)

---

## PREGLED PROJEKTA

**Cilj**: Web platforma za online kurseve srpskog jezika sa video lekcijama i uživo časovima.

**Ključne funkcionalnosti MVP**:
- Landing stranica sa kursevima
- Registracija/Login (Firebase Auth)
- Kupovina → generisanje PDF uplatnice
- Upload potvrde o uplati
- Reprodukcija zaštićenih video lekcija
- Admin dashboard za upravljanje

**Dizajn**:
- Bela pozadina (#FFFFFF)
- Primarna: svetlo zelena (#BFECC9)
- Sekundarna: tamno plava/petrol (#003366)
- Minimalistički pristup

**Budžet**: $10-20 mesečno (serverless arhitektura)

---

## TEHNOLOŠKI STACK

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State management**: Zustand (lagan i brz)
- **Forms**: React Hook Form + Zod validacija
- **UI komponente**: shadcn/ui (opciono)
- **Icons**: Lucide React
- **PDF generisanje**: jsPDF ili react-pdf/renderer
- **Video player**: Video.js ili Plyr.js

### Backend (Serverless)
- **Platform**: Firebase (Authentication, Firestore, Storage, Functions)
- **Functions runtime**: Node.js 20
- **PDF generisanje**: PDFKit (u Firebase Functions)
- **Email**: SendGrid Free tier ili EmailJS

### Video Storage
- **Primarno**: Cloudflare R2 (jeftino, bez egress naknada)
- **Alternativa**: Firebase Storage (za manje videe i dokumente)
- **Streaming**: Signed URLs sa ograničenim trajanjem

### Baza podataka
- **Firebase Firestore** (NoSQL)
  - Skalabilna
  - Real-time updates
  - Dobra integracija sa Firebase ekosistemom

### Deployment
- **Frontend**: Vercel (besplatno, automatski CI/CD)
- **Backend**: Firebase Functions (serverless)
- **Domain**: Namecheap ili Google Domains

---

## STRUKTURA PROJEKTA

```
online-srpski/
├── frontend/
│   ├── public/
│   │   ├── logo.svg
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/         # slike, fontovi
│   │   ├── components/
│   │   │   ├── auth/       # Login, Register komponente
│   │   │   ├── course/     # CourseCard, CourseDetail, VideoPlayer
│   │   │   ├── payment/    # PaymentForm, InvoicePDF
│   │   │   ├── admin/      # AdminPanel, CourseManager
│   │   │   └── ui/         # Button, Input, Modal (reusable)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CoursePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── hooks/          # custom React hooks
│   │   ├── services/
│   │   │   ├── firebase.js        # Firebase config
│   │   │   ├── auth.service.js
│   │   │   ├── course.service.js
│   │   │   └── payment.service.js
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── functions/
│   │   ├── src/
│   │   │   ├── index.js               # cloud functions entry
│   │   │   ├── generateInvoice.js     # PDF uplatnica
│   │   │   ├── generateSignedUrl.js   # video pristup
│   │   │   ├── confirmPayment.js      # verifikacija uplate
│   │   │   └── sendEmail.js           # notifikacije
│   │   ├── package.json
│   │   └── .env
│   └── firestore.rules    # security rules za Firestore
│
├── docs/
│   ├── PRD.md             # Product Requirements Document
│   ├── ARCHITECTURE.md    # dijagram arhitekture
│   ├── WIREFRAMES.md      # dizajn skice
│   └── API.md             # dokumentacija endpointa
│
├── storage/
│   ├── test-videos/       # test video fajlovi za development
│   └── sample-pdfs/       # mockovi uplatnica
│
├── .env.example           # template za env varijable
├── .gitignore
├── README.md
├── plan.md                # ovaj fajl
└── package.json           # root package (opciono, za scripts)
```

---

## FAZA 0: SETUP I KONFIGURACIJA
**Trajanje**: 2-3 dana

### 0.1 Inicijalizacija projekta

```bash
# Kreiranje strukture foldera
mkdir -p frontend/src/{components,pages,services,hooks,store,utils}
mkdir -p backend/functions/src
mkdir -p docs storage/test-videos storage/sample-pdfs

# Frontend setup
cd frontend
npm create vite@latest . -- --template react
npm install
npm install firebase react-router-dom zustand react-hook-form zod
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react video.js

# Backend setup
cd ../backend/functions
npm init -y
npm install firebase-admin firebase-functions
npm install pdfkit nodemailer
```


### 0.4 Environment variables

**frontend/.env.local**:
```env
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=online-srpski-kursevi
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
VITE_API_URL=http://localhost:5001/online-srpski-kursevi/us-central1
```

**backend/functions/.env**:
```env
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=online-srpski-videos
SENDGRID_API_KEY=xxxxx
ADMIN_EMAIL=profesor@example.com
```

### 0.5 Git setup

```bash
git init
echo "node_modules
.env
.env.local
*.log
dist
build
.firebase
.DS_Store" > .gitignore

git add .
git commit -m "Initial project setup"
```

---

## FAZA 1: OSNOVNI FRONTEND I AUTENTIFIKACIJA
**Trajanje**: 5-7 dana

### 1.1 Tailwind CSS konfiguracija

**tailwind.config.js**:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#BFECC9',      // svetlo zelena
        secondary: '#003366',    // tamno plava
        accent: '#1E5E8B',
      },
    },
  },
  plugins: [],
}
```

### 1.2 Firebase konfiguracija

**frontend/src/services/firebase.js**:
```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 1.3 Auth service

**frontend/src/services/auth.service.js**:
```js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerUser = async (email, password, ime, telefon) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: ime });

  await setDoc(doc(db, 'users', userCredential.user.uid), {
    ime,
    email,
    telefon,
    role: 'korisnik',
    registrovan_at: new Date().toISOString(),
  });

  return userCredential.user;
};

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};
```

### 1.4 Zustand store za auth

**frontend/src/store/authStore.js**:
```js
import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,

  initAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        set({
          user,
          userProfile: profileDoc.data(),
          loading: false
        });
      } else {
        set({ user: null, userProfile: null, loading: false });
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null });
  },
}));
```

### 1.5 Routing setup

**frontend/src/App.jsx**:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import CoursePage from './pages/CoursePage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userProfile, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && userProfile?.role !== 'admin') return <Navigate to="/" />;

  return children;
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/course/:id" element={<CoursePage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 1.6 Login/Register komponente

**frontend/src/pages/LoginPage.jsx**:
```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Pogrešan email ili lozinka');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Prijavi se</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-secondary py-2 rounded font-semibold hover:bg-opacity-80"
          >
            Uloguj se
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Nemaš nalog? <a href="/register" className="text-secondary underline">Registruj se</a>
        </p>
      </div>
    </div>
  );
}
```

**Zadaci**:
- [ ] Kreirati RegisterPage.jsx (slično kao LoginPage)
- [ ] Dodati validaciju forme sa Zod ili React Hook Form
- [ ] Implementirati "Forgot Password" funkcionalnost

---

## FAZA 2: VIDEO SISTEM I STORAGE
**Trajanje**: 5-7 dana

### 2.1 Firestore struktura

**Collections**:

```
users/
  {uid}/
    - ime: string
    - email: string
    - telefon: string
    - role: "korisnik" | "admin"
    - registrovan_at: timestamp

courses/
  {courseId}/
    - title: string
    - description: string
    - price: number
    - type: "video" | "live"
    - status: "active" | "draft"
    - created_at: timestamp
    - thumbnail_url: string

lessons/
  {lessonId}/
    - course_id: string (reference)
    - title: string
    - description: string
    - video_key: string (R2 object key)
    - duration: number (u sekundama)
    - order: number
    - created_at: timestamp

transactions/
  {transactionId}/
    - user_id: string
    - course_id: string
    - amount: number
    - status: "pending" | "confirmed" | "rejected"
    - payment_ref: string (broj uplatnice)
    - invoice_url: string (PDF link)
    - confirmation_url: string (upload potvrde)
    - created_at: timestamp
    - confirmed_at: timestamp

user_courses/
  {uid}/
    courses: {
      [courseId]: {
        purchased_at: timestamp,
        expires_at: timestamp (opciono)
      }
    }

files/
  {fileId}/
    - course_id: string
    - name: string
    - url: string
    - type: "pdf" | "doc" | "xlsx"
    - created_at: timestamp
```

### 2.2 R2 upload funkcija (Firebase Function)

**backend/functions/src/uploadVideoToR2.js**:
```js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.uploadVideo = async (fileBuffer, fileName) => {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `videos/${fileName}`,
    Body: fileBuffer,
    ContentType: 'video/mp4',
  });

  await s3Client.send(command);
  return `videos/${fileName}`;
};
```

### 2.3 Signed URL generisanje (Firebase Function)

**backend/functions/src/generateSignedUrl.js**:
```js
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

exports.getVideoUrl = functions.https.onCall(async (data, context) => {
  // Provera autentifikacije
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  const { lessonId } = data;
  const userId = context.auth.uid;

  // Provera da li korisnik ima pristup kursu
  const lessonDoc = await admin.firestore().collection('lessons').doc(lessonId).get();
  const lesson = lessonDoc.data();

  const userCoursesDoc = await admin.firestore()
    .collection('user_courses')
    .doc(userId)
    .get();

  const userCourses = userCoursesDoc.data()?.courses || {};

  if (!userCourses[lesson.course_id]) {
    throw new functions.https.HttpsError('permission-denied', 'Nemate pristup ovom kursu');
  }

  // Generisanje signed URL sa trajanjem od 1h
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: lesson.video_key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { url: signedUrl };
});
```

### 2.4 Video Player komponenta

**frontend/src/components/course/VideoPlayer.jsx**:
```jsx
import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

export default function VideoPlayer({ lessonId }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const getVideoUrl = httpsCallable(functions, 'getVideoUrl');
        const result = await getVideoUrl({ lessonId });

        if (playerRef.current) {
          playerRef.current.dispose();
        }

        playerRef.current = videojs(videoRef.current, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          sources: [{
            src: result.data.url,
            type: 'video/mp4'
          }]
        });

        setLoading(false);
      } catch (err) {
        setError('Greška pri učitavanju videa');
        setLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [lessonId]);

  if (loading) return <div>Učitavanje videa...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
}
```

### 2.5 Course service

**frontend/src/services/course.service.js**:
```js
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const getAllCourses = async () => {
  const q = query(collection(db, 'courses'), where('status', '==', 'active'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCourseById = async (courseId) => {
  const docRef = doc(db, 'courses', courseId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error('Kurs ne postoji');

  return { id: docSnap.id, ...docSnap.data() };
};

export const getCourseLessons = async (courseId) => {
  const q = query(
    collection(db, 'lessons'),
    where('course_id', '==', courseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => a.order - b.order);
};

export const checkUserAccess = async (userId, courseId) => {
  const docRef = doc(db, 'user_courses', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return false;

  const courses = docSnap.data().courses || {};
  return !!courses[courseId];
};
```

**Zadaci**:
- [ ] Implementirati admin upload za videe (direktno na R2)
- [ ] Dodati progress tracking za video playback
- [ ] Implementirati "Continue watching" funkcionalnost

---

## FAZA 3: SISTEM ZA PLAĆANJE
**Trajanje**: 5-7 dana

### 3.1 PDF uplatnica generator (Firebase Function)

**backend/functions/src/generateInvoice.js**:
```js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');

exports.generateInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Morate biti ulogovani');
  }

  const { courseId } = data;
  const userId = context.auth.uid;

  // Uzmi kurs i korisnika
  const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
  const userDoc = await admin.firestore().collection('users').doc(userId).get();

  const course = courseDoc.data();
  const user = userDoc.data();

  // Kreiraj transaction zapis
  const transactionRef = await admin.firestore().collection('transactions').add({
    user_id: userId,
    course_id: courseId,
    amount: course.price,
    status: 'pending',
    payment_ref: `KRS-${Date.now()}`,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Generiši PDF
  const doc = new PDFDocument();
  const chunks = [];

  doc.on('data', chunk => chunks.push(chunk));

  doc.fontSize(20).text('UPLATNICA ZA KURS', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Kurs: ${course.title}`);
  doc.text(`Ime: ${user.ime}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Iznos: ${course.price} RSD`);
  doc.text(`Poziv na broj: ${transactionRef.id}`);
  doc.moveDown();
  doc.text('Racun primaoca: 160-XXXX-XX');
  doc.text('Primalac: Online Srpski Kursevi');
  doc.text('Svrha uplate: Uplata za kurs');

  doc.end();

  // Sačekaj da se PDF završi
  await new Promise(resolve => doc.on('end', resolve));

  const pdfBuffer = Buffer.concat(chunks);

  // Upload na Firebase Storage
  const bucket = admin.storage().bucket();
  const fileName = `invoices/${transactionRef.id}.pdf`;
  const file = bucket.file(fileName);

  await file.save(pdfBuffer, {
    contentType: 'application/pdf',
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: transactionRef.id,
      }
    }
  });

  const downloadUrl = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2500',
  });

  // Update transaction sa PDF linkom
  await transactionRef.update({
    invoice_url: downloadUrl[0],
  });

  return {
    transactionId: transactionRef.id,
    invoiceUrl: downloadUrl[0],
    paymentRef: `KRS-${Date.now()}`,
  };
});
```

### 3.2 Payment service

**frontend/src/services/payment.service.js**:
```js
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { functions, storage, db } from './firebase';

export const generateInvoice = async (courseId) => {
  const generateInvoiceFn = httpsCallable(functions, 'generateInvoice');
  const result = await generateInvoiceFn({ courseId });
  return result.data;
};

export const uploadPaymentConfirmation = async (transactionId, file) => {
  const storageRef = ref(storage, `payment-confirmations/${transactionId}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  // Update transaction
  await updateDoc(doc(db, 'transactions', transactionId), {
    confirmation_url: downloadUrl,
  });

  return downloadUrl;
};
```

### 3.3 Payment komponente

**frontend/src/components/payment/InvoiceGenerator.jsx**:
```jsx
import { useState } from 'react';
import { generateInvoice } from '../../services/payment.service';

export default function InvoiceGenerator({ courseId, courseName, price }) {
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateInvoice(courseId);
      setInvoiceData(data);
    } catch (error) {
      alert('Greška pri generisanju uplatnice');
    } finally {
      setLoading(false);
    }
  };

  if (invoiceData) {
    return (
      <div className="border border-primary rounded-lg p-6 bg-primary bg-opacity-10">
        <h3 className="text-xl font-bold mb-4">Uplatnica generisana!</h3>
        <p className="mb-2">Poziv na broj: <strong>{invoiceData.paymentRef}</strong></p>
        <p className="mb-4">Iznos: <strong>{price} RSD</strong></p>

        <a
          href={invoiceData.invoiceUrl}
          download
          className="inline-block bg-secondary text-white px-6 py-2 rounded hover:bg-opacity-90"
        >
          Preuzmi uplatnicu (PDF)
        </a>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Sledeći koraci:</h4>
          <ol className="list-decimal ml-6 space-y-1 text-sm">
            <li>Preuzmi PDF uplatnicu</li>
            <li>Izvrši uplatu u banci ili e-bankingu</li>
            <li>Upload-uj potvrdu o uplati u svom dashboard-u</li>
            <li>Čekaj potvrdu (obično do 24h)</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Kupi kurs: {courseName}</h3>
      <p className="text-2xl font-bold text-secondary mb-6">{price} RSD</p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-opacity-80 disabled:opacity-50"
      >
        {loading ? 'Generisanje...' : 'Generiši uplatnicu'}
      </button>
    </div>
  );
}
```

**frontend/src/components/payment/PaymentConfirmationUpload.jsx**:
```jsx
import { useState } from 'react';
import { uploadPaymentConfirmation } from '../../services/payment.service';

export default function PaymentConfirmationUpload({ transactionId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await uploadPaymentConfirmation(transactionId, file);
      onSuccess();
      alert('Potvrda o uplati je poslata! Uskoro ćemo verifikovati uplatu.');
    } catch (error) {
      alert('Greška pri upload-u');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-bold mb-4">Upload potvrde o uplati</h3>

      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4 w-full"
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-primary text-secondary py-2 rounded hover:bg-opacity-80 disabled:opacity-50"
      >
        {uploading ? 'Upload...' : 'Pošalji potvrdu'}
      </button>
    </div>
  );
}
```

**Zadaci**:
- [ ] Kreirati CoursePage sa InvoiceGenerator komponentom
- [ ] Dodati validaciju file-a (maks 5MB)
- [ ] Kreirati email notifikacije za novu uplatu

---

## FAZA 4: ADMIN DASHBOARD
**Trajanje**: 5-7 dana

### 4.1 Admin panel struktura

**frontend/src/pages/AdminPage.jsx**:
```jsx
import { useState } from 'react';
import CourseManager from '../components/admin/CourseManager';
import LessonManager from '../components/admin/LessonManager';
import PaymentVerifier from '../components/admin/PaymentVerifier';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-secondary">Admin Panel</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded ${activeTab === 'courses' ? 'bg-primary' : 'bg-white'}`}
          >
            Kursevi
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded ${activeTab === 'lessons' ? 'bg-primary' : 'bg-white'}`}
          >
            Lekcije
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded ${activeTab === 'payments' ? 'bg-primary' : 'bg-white'}`}
          >
            Uplate
          </button>
        </div>

        {activeTab === 'courses' && <CourseManager />}
        {activeTab === 'lessons' && <LessonManager />}
        {activeTab === 'payments' && <PaymentVerifier />}
      </div>
    </div>
  );
}
```

### 4.2 Course Manager komponenta

**frontend/src/components/admin/CourseManager.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    type: 'video',
    status: 'draft',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const snapshot = await getDocs(collection(db, 'courses'));
    setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'courses'), {
      ...formData,
      created_at: new Date().toISOString(),
    });
    setShowForm(false);
    setFormData({ title: '', description: '', price: 0, type: 'video', status: 'draft' });
    loadCourses();
  };

  const toggleStatus = async (courseId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    await updateDoc(doc(db, 'courses', courseId), { status: newStatus });
    loadCourses();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upravljanje kursevima</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary px-4 py-2 rounded"
        >
          + Novi kurs
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg mb-6 space-y-4">
          <input
            type="text"
            placeholder="Naziv kursa"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <textarea
            placeholder="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded"
            rows={4}
          />
          <input
            type="number"
            placeholder="Cena (RSD)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="video">Video kurs</option>
            <option value="live">Uživo časovi</option>
          </select>

          <button type="submit" className="bg-secondary text-white px-6 py-2 rounded">
            Sačuvaj
          </button>
        </form>
      )}

      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.price} RSD • {course.type}</p>
            </div>
            <button
              onClick={() => toggleStatus(course.id, course.status)}
              className={`px-4 py-2 rounded ${
                course.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}
            >
              {course.status === 'active' ? 'Aktivan' : 'Draft'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4.3 Payment Verifier komponenta

**frontend/src/components/admin/PaymentVerifier.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function PaymentVerifier() {
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    const q = query(collection(db, 'transactions'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const payments = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const transaction = docSnap.data();

        // Učitaj podatke o korisniku i kursu
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', transaction.user_id)));
        const courseDoc = await getDocs(query(collection(db, 'courses'), where('__name__', '==', transaction.course_id)));

        return {
          id: docSnap.id,
          ...transaction,
          user: userDoc.docs[0]?.data(),
          course: courseDoc.docs[0]?.data(),
        };
      })
    );

    setPendingPayments(payments);
  };

  const confirmPayment = async (transactionId, userId, courseId) => {
    // Potvrdi transakciju
    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    });

    // Dodaj kurs korisniku
    const userCoursesRef = doc(db, 'user_courses', userId);
    await setDoc(userCoursesRef, {
      courses: {
        [courseId]: {
          purchased_at: new Date().toISOString(),
        }
      }
    }, { merge: true });

    // TODO: Pošalji email korisniku

    loadPendingPayments();
  };

  const rejectPayment = async (transactionId) => {
    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'rejected',
    });
    loadPendingPayments();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Verifikacija uplata</h2>

      {pendingPayments.length === 0 ? (
        <p className="text-gray-500">Nema uplata na čekanju</p>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map(payment => (
            <div key={payment.id} className="bg-white p-6 rounded-lg border">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Korisnik</p>
                  <p className="font-semibold">{payment.user?.ime}</p>
                  <p className="text-sm">{payment.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kurs</p>
                  <p className="font-semibold">{payment.course?.title}</p>
                  <p className="text-sm">{payment.amount} RSD</p>
                </div>
              </div>

              {payment.confirmation_url && (
                <div className="mb-4">
                  <a
                    href={payment.confirmation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Pogledaj potvrdu o uplati
                  </a>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => confirmPayment(payment.id, payment.user_id, payment.course_id)}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                >
                  Potvrdi uplatu
                </button>
                <button
                  onClick={() => rejectPayment(payment.id)}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                >
                  Odbij
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4.4 Lesson Manager (video upload)

**frontend/src/components/admin/LessonManager.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';

export default function LessonManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLessons(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    const snapshot = await getDocs(collection(db, 'courses'));
    setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadLessons = async (courseId) => {
    const q = query(collection(db, 'lessons'), where('course_id', '==', courseId));
    const snapshot = await getDocs(q);
    setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!formData.videoFile || !selectedCourse) return;

    setUploading(true);

    // Upload videa na Firebase Storage (za testiranje)
    // U produkciji, koristi R2 preko Firebase Function
    const storageRef = ref(storage, `videos/${Date.now()}_${formData.videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, formData.videoFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Sačuvaj lekciju u Firestore
        await addDoc(collection(db, 'lessons'), {
          course_id: selectedCourse,
          title: formData.title,
          description: formData.description,
          video_key: uploadTask.snapshot.ref.fullPath,
          video_url: downloadURL, // za testiranje
          order: lessons.length + 1,
          created_at: new Date().toISOString(),
        });

        setUploading(false);
        setUploadProgress(0);
        setFormData({ title: '', description: '', videoFile: null });
        loadLessons(selectedCourse);
      }
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Upravljanje lekcijama</h2>

      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-6"
      >
        <option value="">Izaberi kurs</option>
        {courses.map(course => (
          <option key={course.id} value={course.id}>{course.title}</option>
        ))}
      </select>

      {selectedCourse && (
        <>
          <form onSubmit={handleVideoUpload} className="bg-white p-6 rounded-lg mb-6 space-y-4">
            <input
              type="text"
              placeholder="Naziv lekcije"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              required
            />
            <textarea
              placeholder="Opis lekcije"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFormData({ ...formData, videoFile: e.target.files[0] })}
              className="w-full"
              required
            />

            {uploading && (
              <div className="w-full bg-gray-200 rounded">
                <div
                  className="bg-primary h-4 rounded"
                  style={{ width: `${uploadProgress}%` }}
                />
                <p className="text-center text-sm mt-2">{Math.round(uploadProgress)}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="bg-secondary text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {uploading ? 'Upload...' : 'Dodaj lekciju'}
            </button>
          </form>

          <div className="space-y-2">
            <h3 className="font-bold">Lekcije:</h3>
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="bg-white p-4 rounded-lg">
                <p className="font-semibold">{idx + 1}. {lesson.title}</p>
                <p className="text-sm text-gray-600">{lesson.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

**Zadaci**:
- [ ] Implementirati brisanje kurseva i lekcija
- [ ] Dodati drag-and-drop reorder za lekcije
- [ ] Dodati statistiku (broj korisnika po kursu, prihod)

---

## FAZA 5: FINALIZACIJA MVP
**Trajanje**: 3-5 dana

### 5.1 HomePage landing

**frontend/src/pages/HomePage.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/course.service';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const data = await getAllCourses();
    setCourses(data);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero sekcija */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Online kursevi srpskog jezika</h1>
          <p className="text-xl mb-8">Priprema za malu maturu i napredni kursevi</p>
          {!user && (
            <Link
              to="/register"
              className="inline-block bg-white text-secondary px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90"
            >
              Započni besplatno
            </Link>
          )}
        </div>
      </header>

      {/* Kursevi */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Dostupni kursevi</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-primary bg-opacity-20"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-secondary">{course.price} RSD</span>
                  <Link
                    to={`/course/${course.id}`}
                    className="bg-primary px-4 py-2 rounded hover:bg-opacity-80"
                  >
                    Vidi više
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Online Srpski Kursevi. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>
  );
}
```

### 5.2 CoursePage detalj

**frontend/src/pages/CoursePage.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getCourseById, getCourseLessons, checkUserAccess } from '../services/course.service';
import { useAuthStore } from '../store/authStore';
import InvoiceGenerator from '../components/payment/InvoiceGenerator';
import VideoPlayer from '../components/course/VideoPlayer';

export default function CoursePage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [id, user]);

  const loadCourse = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);

      if (user) {
        const access = await checkUserAccess(user.uid, id);
        setHasAccess(access);

        if (access) {
          const lessonsData = await getCourseLessons(id);
          setLessons(lessonsData);
          if (lessonsData.length > 0) {
            setSelectedLesson(lessonsData[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!course) return <div>Kurs ne postoji</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!hasAccess ? (
          // Neautorizovan korisnik ili nema pristup
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-700 mb-6">{course.description}</p>

              <div className="bg-white p-6 rounded-lg border mb-6">
                <h3 className="font-bold mb-4">Šta ćete naučiti:</h3>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Priprema za malu maturu</li>
                  <li>Analiza književnih dela</li>
                  <li>Vežbe iz gramatike</li>
                  <li>Pisanje eseja</li>
                </ul>
              </div>
            </div>

            <div>
              {user ? (
                <InvoiceGenerator
                  courseId={course.id}
                  courseName={course.title}
                  price={course.price}
                />
              ) : (
                <div className="border rounded-lg p-6 bg-white">
                  <p className="mb-4">Morate biti ulogovani da biste kupili kurs.</p>
                  <a href="/login" className="block w-full bg-primary text-center py-3 rounded">
                    Uloguj se
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Korisnik ima pristup - prikaži lekcije
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold mb-4">{course.title}</h1>

              {selectedLesson && (
                <div className="bg-white rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">{selectedLesson.title}</h2>
                  <VideoPlayer lessonId={selectedLesson.id} />
                  <p className="mt-4 text-gray-700">{selectedLesson.description}</p>
                </div>
              )}
            </div>

            <div>
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-bold mb-4">Lekcije</h3>
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-3 rounded ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-primary'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <p className="font-semibold">{idx + 1}. {lesson.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.3 User Dashboard

**frontend/src/pages/DashboardPage.jsx**:
```jsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [myCourses, setMyCourses] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    // Učitaj kurseve korisnika
    const userCoursesDoc = await getDocs(
      query(collection(db, 'user_courses'), where('__name__', '==', user.uid))
    );

    if (userCoursesDoc.docs[0]) {
      const coursesData = userCoursesDoc.docs[0].data().courses || {};
      const courseIds = Object.keys(coursesData);

      const coursesPromises = courseIds.map(async (courseId) => {
        const courseDoc = await getDocs(
          query(collection(db, 'courses'), where('__name__', '==', courseId))
        );
        return courseDoc.docs[0] ? { id: courseDoc.docs[0].id, ...courseDoc.docs[0].data() } : null;
      });

      const courses = await Promise.all(coursesPromises);
      setMyCourses(courses.filter(Boolean));
    }

    // Učitaj transakcije
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.uid)
    );
    const transactionsSnapshot = await getDocs(transactionsQuery);
    setMyTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-secondary">Moj Dashboard</h1>
          <Link to="/" className="text-secondary underline">Nazad na početnu</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Moji kursevi</h2>
          {myCourses.length === 0 ? (
            <p className="text-gray-500">Još uvek nemate kupljene kurseve.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white p-6 rounded-lg border hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Moje uplate</h2>
          <div className="space-y-4">
            {myTransactions.map(transaction => (
              <div key={transaction.id} className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold">Iznos: {transaction.amount} RSD</p>
                    <p className="text-sm text-gray-600">
                      Status: {
                        transaction.status === 'pending' ? 'Na čekanju' :
                        transaction.status === 'confirmed' ? 'Potvrđeno' : 'Odbijeno'
                      }
                    </p>
                  </div>
                  {transaction.invoice_url && (
                    <a
                      href={transaction.invoice_url}
                      download
                      className="text-blue-600 underline"
                    >
                      Preuzmi uplatnicu
                    </a>
                  )}
                </div>

                {transaction.status === 'pending' && !transaction.confirmation_url && (
                  <PaymentConfirmationUpload
                    transactionId={transaction.id}
                    onSuccess={loadUserData}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

### 5.4 Firestore Security Rules

**backend/firestore.rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper funkcija za proveru admina
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users kolekcija
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
    }

    // Courses kolekcija
    match /courses/{courseId} {
      allow read: if true; // Svi mogu čitati aktivne kurseve
      allow write: if isAdmin();
    }

    // Lessons kolekcija
    match /lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Transactions kolekcija
    match /transactions/{transactionId} {
      allow read: if request.auth != null &&
                     (resource.data.user_id == request.auth.uid || isAdmin());
      allow create: if request.auth != null;
      allow update: if isAdmin();
    }

    // User courses kolekcija
    match /user_courses/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if isAdmin();
    }

    // Files kolekcija
    match /files/{fileId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

**Zadaci**:
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Testirati sve security rules
- [ ] Dodati email notifikacije (SendGrid)

---

## FAZA 6: NAPREDNE FUNKCIONALNOSTI
**Trajanje**: 4-6 nedelja (post-MVP)

### 6.1 Email notifikacije

**backend/functions/src/sendEmail.js**:
```js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendPaymentConfirmation = async (userEmail, courseName) => {
  const msg = {
    to: userEmail,
    from: process.env.ADMIN_EMAIL,
    subject: 'Potvrda uplate - Online Srpski Kursevi',
    html: `
      <h1>Vaša uplata je potvrđena!</h1>
      <p>Zdravo,</p>
      <p>Vaša uplata za kurs <strong>${courseName}</strong> je uspešno potvrđena.</p>
      <p>Možete početi sa gledanjem lekcija na svom dashboard-u.</p>
      <p>Srećno učenje!</p>
    `,
  };

  await sgMail.send(msg);
};
```

### 6.2 Video progress tracking

**frontend/src/components/course/VideoPlayer.jsx** (dopuna):
```jsx
// Dodaj u VideoPlayer komponentu
useEffect(() => {
  if (playerRef.current) {
    playerRef.current.on('timeupdate', () => {
      const currentTime = playerRef.current.currentTime();
      const duration = playerRef.current.duration();
      const progress = (currentTime / duration) * 100;

      // Sačuvaj progress u Firestore svake 5 sekundi
      if (Math.floor(currentTime) % 5 === 0) {
        saveProgress(lessonId, progress);
      }
    });
  }
}, [playerRef.current]);

const saveProgress = async (lessonId, progress) => {
  const user = auth.currentUser;
  if (!user) return;

  await setDoc(doc(db, 'progress', `${user.uid}_${lessonId}`), {
    user_id: user.uid,
    lesson_id: lessonId,
    progress,
    last_watched: new Date().toISOString(),
  }, { merge: true });
};
```

### 6.3 Kvizovi i testovi

**Firestore struktura (nova kolekcija)**:
```
quizzes/
  {quizId}/
    - course_id: string
    - title: string
    - questions: [
        {
          question: string,
          options: [string],
          correct_answer: number (index)
        }
      ]

quiz_results/
  {resultId}/
    - user_id: string
    - quiz_id: string
    - score: number
    - answers: [number]
    - completed_at: timestamp
```

### 6.4 Google Meet integracija

**backend/functions/src/createMeetLink.js**:
```js
const { google } = require('googleapis');
const functions = require('firebase-functions');

exports.createMeetLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated');
  }

  // Provera da li je admin
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (userDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied');
  }

  const { title, startTime, duration } = data;

  const calendar = google.calendar('v3');
  const event = {
    summary: title,
    start: {
      dateTime: startTime,
      timeZone: 'Europe/Belgrade',
    },
    end: {
      dateTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
      timeZone: 'Europe/Belgrade',
    },
    conferenceData: {
      createRequest: {
        requestId: `meet-${Date.now()}`,
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    resource: event,
  });

  return {
    meetLink: res.data.hangoutLink,
    eventId: res.data.id,
  };
});
```

### 6.5 Kupon kodovi

**Firestore struktura**:
```
coupons/
  {couponCode}/
    - code: string (uppercase)
    - discount: number (percentage)
    - valid_until: timestamp
    - max_uses: number
    - used_count: number
    - course_id: string (opciono, za specifičan kurs)
```

**Frontend komponenta**:
```jsx
const applyCoupon = async (code, coursePrice) => {
  const couponDoc = await getDoc(doc(db, 'coupons', code.toUpperCase()));

  if (!couponDoc.exists()) {
    throw new Error('Kupon ne postoji');
  }

  const coupon = couponDoc.data();

  if (coupon.used_count >= coupon.max_uses) {
    throw new Error('Kupon je iskorišćen');
  }

  if (new Date(coupon.valid_until) < new Date()) {
    throw new Error('Kupon je istekao');
  }

  const discountedPrice = coursePrice * (1 - coupon.discount / 100);
  return discountedPrice;
};
```

---

## DEPLOYMENT CHECKLIST

### Pre-production checklist

- [ ] **Environment varijable**: Sve production ENV varijable su postavljene
- [ ] **Firebase projekat**: Production Firebase projekat kreiran i konfigurisan
- [ ] **Cloudflare R2**: Production bucket kreiran, API keys postavljeni
- [ ] **SendGrid**: Email templates kreirani, API key postavljen
- [ ] **Domain**: Domen kupljen i podešen (DNS records)
- [ ] **Firebase Auth**: Email/Password provider aktiviran
- [ ] **Firestore**: Security rules deploy-ovani i testirani
- [ ] **Firebase Storage**: Security rules deploy-ovani
- [ ] **Firebase Functions**: Deploy-ovane sve funkcije
- [ ] **Vercel**: Frontend deploy-ovan i povezan sa custom domain-om

### Testing checklist

- [ ] Registracija novog korisnika radi
- [ ] Login/Logout radi
- [ ] Generisanje PDF uplatnice radi
- [ ] Upload potvrde o uplati radi
- [ ] Admin može da potvrdi uplatu
- [ ] Korisnik dobija pristup nakon potvrde
- [ ] Video player učitava videe (signed URLs rade)
- [ ] Admin može da kreira kurseve
- [ ] Admin može da upload-uje lekcije
- [ ] Email notifikacije stižu
- [ ] Mobile responsiveness testiran
- [ ] Performance testiran (Lighthouse score > 80)

### Security checklist

- [ ] Firestore security rules testirani
- [ ] Storage security rules testirani
- [ ] Signed URLs expire nakon 1h
- [ ] Admin panel zaštićen (role-based access)
- [ ] HTTPS svuda
- [ ] Environment varijable nisu commit-ovane u Git
- [ ] Firebase API keys restricted (samo dozvoljeni domeni)
- [ ] Rate limiting postavljen na Firebase Functions

### Deployment komande

```bash
# Frontend (Vercel)
cd frontend
npm run build
vercel --prod

# Backend (Firebase)
cd backend/functions
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## MONITORING I ODRŽAVANJE

### Analytics

- **Google Analytics** - tracking korisnika i konverzija
- **Firebase Analytics** - engagement metrike
- **Sentry** (opciono) - error tracking

### Backup

- **Firestore**: Automatski export svake nedelje
- **Storage**: Sync sa lokalnim backup-om (rclone)

### Cost monitoring

- Firebase Billing Alerts (> $15 mesečno)
- Cloudflare R2 Dashboard (praćenje storage)

---

## DODATNI RESURSI

### Dokumentacija

- Firebase Docs: https://firebase.google.com/docs
- Cloudflare R2 Docs: https://developers.cloudflare.com/r2/
- React Router Docs: https://reactrouter.com/
- Tailwind CSS Docs: https://tailwindcss.com/docs

### Korisni alati

- **Firebase Emulator Suite** - lokalni development
- **Postman** - testiranje Firebase Functions
- **Firestore Rules Playground** - testiranje security rules

---

## ZAKLJUČAK

Ovaj plan pokriva kompletnu implementaciju MVP platforme za online kurseve srpskog jezika. Arhitektura je dizajnirana da bude:

- **Jeftina** ($10-20 mesečno)
- **Skalabilna** (serverless, automatsko skaliranje)
- **Sigurna** (Firebase Auth + Firestore rules)
- **Laka za održavanje** (minimalno server administration)

**Procena vremena**:
- Faza 0-5 (MVP): **4-6 nedelja** (1 developer full-time)
- Faza 6 (Napredne funkcionalnosti): **4-6 nedelja** dodatno

**Sledeći koraci**:
1. Setup Firebase projekat (Faza 0)
2. Započni sa Fazom 1 (Auth + Frontend osnove)
3. Iterativno implementiraj svaku fazu
4. Testiraj kontinuirano
5. Deploy na Vercel + Firebase

Srećno sa implementacijom! 🚀
