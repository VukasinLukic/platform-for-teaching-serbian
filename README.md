# Srpski u Srcu

Online platforma za učenje srpskog jezika (priprema za malu maturu) — https://srpskiusrcu.rs

- `frontend/` — React 18 + Vite + Tailwind + Firebase web SDK
- `backend/functions/` — Firebase Cloud Functions v2 (Node 22, ESM), sve funkcije u regionu `europe-west1`
- `backend/firestore.rules`, `backend/storage.rules`, `backend/rules-tests/` — pravila i testovi pravila
- `firebase.json` (koren) — konfiguracija za deploy (hosting, functions, rules)
- `docs/` — uputstva (deploy, email, SEO, plan rada)
- `design-assets/unused-public/` — slike koje se ne koriste na sajtu (čuvaju se, ne deploy-uju se)

## Razvoj i testiranje

### Frontend

```bash
cd frontend
cp .env.example .env        # popuniti Firebase vrednosti
npm ci
npm run dev                 # http://localhost:3000
npm run lint                # ESLint (greške ruše CI, upozorenja ne)
npm run build               # produkcioni build u frontend/dist
npm run assets:unused       # lista fajlova iz public/ koji se nigde ne koriste
```

`npm run build` prepisuje `frontend/public/version.json` — ne commit-ovati tu izmenu.

### Cloud Functions

```bash
cd backend/functions
npm ci
npm run lint
npm run check               # proverava da se svi moduli učitavaju
```

Migracija starih transakcija (dodaje camelCase polja, ništa ne briše):

```bash
GCLOUD_PROJECT=naucisprski node scripts/normalizeTransactions.js          # dry run
GCLOUD_PROJECT=naucisprski node scripts/normalizeTransactions.js --apply  # upis
```

### Testovi Firestore/Storage pravila (potrebna Java 11+)

```bash
cd backend/rules-tests
npm ci
npm test
```

### Deploy

Iz korena repozitorijuma (koristi koreni `firebase.json`):

```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules,firestore:indexes,storage
```

`backend/firebase.json` služi samo za lokalne emulatore i starija uputstva (`cd backend && firebase ...`); za produkciju koristiti koreni `firebase.json`.

### CI

`.github/workflows/ci.yml` na svaki push/PR pokreće: frontend lint + build, functions lint + proveru učitavanja, testove pravila.

### Model transakcija

Kanonska polja: `userId`, `courseId`, `packageId`, `type`, `amount`, `status`, `paymentRef`, `createdAt`, `courseName`/`packageName`. Novi upisi zadržavaju i stara polja (`user_id`, `course_id`, `payment_ref`, `created_at`) radi kompatibilnosti sa pravilima i indeksima. Čitanje uvek preko `normalizeTransaction` (`frontend/src/services/transactions.js`, `backend/functions/src/transactionModel.js`).
