
## 💰 Најјефтинија Опција за Deployment

### **ПРЕПОРУКА: Firebase Hosting + Firebase Functions**

Ово је **НАЈЈЕФТИНИЈА** опција јер је Firebase **потпуно бесплатан** до одређених лимита који су довољни за почетак:

#### Firebase Бесплатан План (Spark):
- ✅ **10GB хостинг storage** (довољно за React апликацију)
- ✅ **360MB/дан bandwidth** за хостинг (~10GB месечно)
- ✅ **125K функција позива месечно** (бесплатно)
- ✅ **40K минута извршавања функција** месечно
- ✅ **1GB Firestore storage** + 50K читања/20K писања дневно
- ✅ **Custom domain** подршка (бесплатно)
- ✅ **SSL сертификат** (аутоматски, бесплатно)

#### Firebase Blaze План (Pay-as-you-go):
- Плаћаш **само оно што користиш**
- Прва 2 милиона функција позива месечно: **БЕСПЛАТНО**
- Након тога: $0.40 по милион позива
- За мале до средње велике сајтове: **$0-10 месечно**

---

## 🌐 Домен

### Где купити домен (најјефтиније опције):

1. **Namecheap** - https://www.namecheap.com
   - `.com` домен: ~$9-13 годишње
   - Бесплатан WHOIS privacy

2. **Porkbun** - https://porkbun.com
   - Најјефтинија опција: $9-10 годишње
   - Бесплатан WHOIS privacy

3. **Cloudflare Registrar** - https://www.cloudflare.com/products/registrar
   - По фабричкој цени (без марже)
   - ~$9 годишње

### Препоручени домен: `srpskiusrcu.com`

**Купи на Porkbun.com** (~$9-10 годишње)

---

## 📦 Deployment Steps

### 1️⃣ Припреми Firebase Пројекат

Firebase пројекат је већ креиран: `online-srpski-kursevi`

```bash
# Инсталирај Firebase CLI
npm install -g firebase-tools

# Логуј се
firebase login

# Провери да ли си на правом пројекту
firebase projects:list
```

---

### 2️⃣ Deploy Frontend на Firebase Hosting

```bash
# Иди у frontend folder
cd frontend

# Креирај production build
npm run build

# Deploy на Firebase Hosting
firebase deploy --only hosting
```

**Твој сајт ће бити live на**: `https://online-srpski-kursevi.web.app`

---

### 3️⃣ Deploy Backend (Cloud Functions)

```bash
# Иди у backend/functions folder
cd backend/functions

# Инсталирај зависности (ако нису)
npm install

# Deploy све Cloud Functions
firebase deploy --only functions

# Или deploy само одређене функције:
firebase deploy --only functions:confirmPayment,functions:sendContactFormEmail
```

**Функције ће бити live на**:
- `https://europe-west1-online-srpski-kursevi.cloudfunctions.net/confirmPayment`
- итд.

---

### 4️⃣ Повежи Custom Domain (srpskiusrcu.com)

#### Корак 1: Купи домен на Porkbun.com
1. Иди на https://porkbun.com
2. Потражи `srpskiusrcu.com`
3. Купи за ~$9-10
4. Заврши checkout

#### Корак 2: Додај домен у Firebase Console
1. Иди на https://console.firebase.google.com
2. Иди на **Hosting** → **Add custom domain**
3. Унеси: `srpskiusrcu.com`
4. Firebase ће ти дати DNS записе које треба да додаш

#### Корак 3: Конфигуриши DNS на Porkbun
1. Логуј се на Porkbun
2. Иди на **Domain Management** → **DNS**
3. Додај DNS записе које Firebase даје:

```
Type: A
Host: @
Value: [IP адреса коју Firebase даје]

Type: A
Host: www
Value: [IP адреса коју Firebase даје]
```

4. Сачекај 5-30 минута за DNS propagation

**Твој сајт ће бити live на**: `https://srpskiusrcu.com` 🎉

---

### 5️⃣ Environment Variables

#### Frontend (.env у `frontend/`)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=online-srpski-kursevi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=online-srpski-kursevi
VITE_FIREBASE_STORAGE_BUCKET=online-srpski-kursevi.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_CONTACT_EMAIL=kontakt@srpskiusrcu.com
```

#### Backend (postavi у Firebase Console)
```bash
# Постави Gmail credentials за слање email-ова
firebase functions:config:set \
  gmail.user="vukasin4sports@gmail.com" \
  gmail.password="ltlf ziag mpma chat"

# Постави Cloudflare R2 credentials
firebase functions:config:set \
  cloudflare.account_id="1c7e439f65e12d8262275c91c65ce106" \
  cloudflare.access_key_id="29e0b69b4390aff8a9b331ca796e6a0c" \
  cloudflare.secret_access_key="13c3e6a96972d2c115f39e7cf24ec69e3fd791a606fe368574aa5ccf6421e2c1" \
  cloudflare.bucket_name="video-kursevi" \
  cloudflare.public_url="https://pub-3f6a8c1a487d41c68cf4816c6b9a5d09.r2.dev"
```

---

## 🔄 CI/CD (Opciono - Automatski Deploy)

### GitHub Actions (БЕСПЛАТНО)

Креирај `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Build Frontend
        run: |
          cd frontend
          npm run build

      - name: Install Backend Dependencies
        run: |
          cd backend/functions
          npm ci

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: online-srpski-kursevi
```

Сада сваки `git push` аутоматски deploy-ује! 🚀

---

## 📊 Monitoring и Analytics

### Firebase Analytics (БЕСПЛАТНО)
- Аутоматски прати посетиоце
- User engagement
- Conversions

### Google Analytics 4 (БЕСПЛАТНО)
- Детаљна аналитика
- Real-time visitors
- Traffic sources

### Firebase Performance Monitoring (БЕСПЛАТНО)
- Page load times
- API response times
- User experience metrics

---

## 💡 Алтернативе (не препоручујем јер су скупље)

### Vercel (скупље за backend)
- ✅ Frontend: **БЕСПЛАТНО**
- ❌ Backend: **Serverless functions** имају лимите
- ❌ Нема Firestore/Auth интеграције
- 💰 За production: **$20+ месечно**

### Netlify (сличан проблем)
- ✅ Frontend: **БЕСПЛАТНО**
- ❌ Serverless functions лимити
- 💰 За production: **$19+ месечно**

### VPS (најскупље)
- ❌ DigitalOcean Droplet: **$6+ месечно**
- ❌ AWS EC2: **$10+ месечно**
- ❌ Захтева Linux знање
- ❌ Мораш ручно конфигурисати све

---

## 🎯 Закључак - Коначна Препорука

### **Користи Firebase Hosting + Functions**

**Трошкови**:
- Домен (Porkbun): **$9/годишње** (~0.75€/месечно)
- Firebase Spark план: **БЕСПЛАТНО** до 125K позива функција
- Firebase Blaze план: **$0-10/месечно** кад пређу лимити
- Email (Gmail): **БЕСПЛАТНО** до 500/дан
- Cloudflare R2: **10GB БЕСПЛАТНО** за видео storage

**УКУПНО**: **~$0.75-11/месечно** ($9-132 годишње)

Ово је **најјефтинија и најбоља** опција за твој use case! 🎉

---

## 🚨 Pre Production Checklist

- [ ] Купи домен `srpskiusrcu.com`
- [ ] Постави custom domain на Firebase
- [ ] Провери да ли све environment variables раде
- [ ] Тестирај све Cloud Functions
- [ ] Провери email слање (Gmail limits)
- [ ] Постави Google Analytics
- [ ] Додај `robots.txt` и `sitemap.xml`
- [ ] Провери SEO meta tags
- [ ] Тестирај payment flow (Firestore transakcije)
- [ ] Backup Firestore базе пре deploy-а

---

## 📞 Support

За deployment питања: **kontakt@srpskiusrcu.com**

**🎊 Srećno sa launch-ом!**
