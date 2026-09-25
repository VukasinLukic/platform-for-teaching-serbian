# Комплетан аудит и план рада — srpskiusrcu.rs

**Датум аудита:** 4. март 2026.
**Аудитор:** Claude Code (аутоматизована анализа)
**Верзија сајта:** Продукција (Firebase Hosting)

---

## Садржај

1. [Безбедносни аудит](#1-безбедносни-аудит)
2. [SEO анализа](#2-seo-анализа)
3. [GA4 аналитика](#3-ga4-аналитика)
4. [Перформансе](#4-перформансе)
5. [Приоритизован план рада](#5-приоритизован-план-рада)

---

## 1. Безбедносни аудит

### КРИТИЧНО (5 проблема)

#### 1.1 Изложени кредијенцијали у `.env` фајловима
**Ризик:** Потпуни приступ Cloudflare R2 storage-у, Gmail налогу, Firebase пројекту
**Локација:** `functions/.env`, `functions/.env.local`
**Детаљи:**
- R2 API кључеви (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) — приступ свим фајловима у storage-у
- R2 endpoint и bucket name — потпуне информације о инфраструктури
- Gmail корисничко име и лозинка у плејн тексту (`EMAIL_USER`, `EMAIL_PASS`) — приступ email налогу
- Firebase конфигурација (API key, project ID, storage bucket)

**Решење:**
1. **ОДМАХ** ротирати све компромитоване кредијенцијале:
   - Генерисати нове R2 API кључеве у Cloudflare dashboard-у
   - Променити Gmail лозинку и укључити 2FA
   - Прећи на App Password за Gmail SMTP уместо обичне лозинке
2. Уклонити `.env` и `.env.local` из git историје:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch functions/.env functions/.env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Додати у `.gitignore`:
   ```
   functions/.env
   functions/.env.local
   .env
   .env.local
   ```
4. Користити Firebase environment configuration:
   ```bash
   firebase functions:secrets:set R2_ACCESS_KEY_ID
   firebase functions:secrets:set R2_SECRET_ACCESS_KEY
   firebase functions:secrets:set EMAIL_USER
   firebase functions:secrets:set EMAIL_PASS
   ```

#### 1.2 XSS рањивост у BlogPostPage
**Ризик:** Cross-Site Scripting — убацивање малициозног JavaScript кода
**Локација:** `frontend/src/pages/BlogPostPage.jsx`
**Детаљи:** Коришћење `dangerouslySetInnerHTML` за рендеровање блог садржаја без санитизације. Иако је садржај тренутно статички дефинисан у коду, ово представља ризик ако се убудуће садржај учитава из екстерних извора (CMS, Firestore, API).

**Решење:**
1. Инсталирати DOMPurify:
   ```bash
   cd frontend && npm install dompurify
   ```
2. Санитизовати HTML пре рендеровања:
   ```javascript
   import DOMPurify from 'dompurify';

   // Уместо:
   dangerouslySetInnerHTML={{ __html: post.content }}
   // Користити:
   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
   ```

#### 1.3 Превише отворена Firestore правила
**Ризик:** Неовлашћени приступ, брисање и модификација података
**Локација:** `firestore.rules`
**Детаљи:** Правила дозвољавају превише операција без аутентикације или без провере ауторизације. Корисници могу потенцијално:
- Читати туђе податке
- Мењати туђе профиле
- Брисати туђе прогрес

**Решење:** Имплементирати гранулирана правила:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Курсеви — сви могу читати, само админ пише
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';

      match /modules/{moduleId} {
        allow read: if true;
        allow write: if request.auth != null &&
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
    }

    // Корисници — само свој документ
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Прогрес — само свој
    match /progress/{progressId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

#### 1.4 Превише отворена Storage правила
**Ризик:** Неовлашћено отпремање фајлова, злоупотреба storage-а
**Локација:** `storage.rules`
**Детаљи:** Storage правила потенцијално дозвољавају свима да отпремају фајлове.

**Решење:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                      firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### 1.5 Недостајући безбедносни HTTP заглавља
**Ризик:** Clickjacking, MIME sniffing, информације о серверу
**Локација:** `firebase.json`
**Детаљи:** Нема Content-Security-Policy, X-Frame-Options, X-Content-Type-Options заглавља.

**Решење:** Додати у `firebase.json` у `hosting` секцију:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-XSS-Protection", "value": "1; mode=block" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://firestore.googleapis.com https://www.google-analytics.com https://identitytoolkit.googleapis.com https://*.firebaseio.com; frame-src 'self' https://www.youtube.com"
          }
        ]
      }
    ]
  }
}
```

---

### ВИСОКО (3 проблема)

#### 1.6 Недостаје rate limiting на аутентикацију
**Ризик:** Brute-force напад на корисничке налоге
**Детаљи:** Firebase Authentication нема додатну заштиту од brute-force напада осим уграђене Firebase заштите.

**Решење:**
- Укључити Firebase App Check за додатну заштиту
- Имплементирати CAPTCHA на login/register форми (hCaptcha или reCAPTCHA)
- Додати логовање неуспешних покушаја пријаве

#### 1.7 Недостаје валидација уноса на Firebase Functions
**Ризик:** Injection напади, неочекивани подаци
**Локација:** `functions/index.js`

**Решење:**
- Валидирати све улазне параметре на Cloud Functions-у
- Користити библиотеку као `joi` или `zod` за валидацију шема
- Санитизовати email адресе и друге корисничке уносе

#### 1.8 Недостаје HTTPS редирекција у Firebase конфигурацији
**Ризик:** Man-in-the-middle напади на HTTP конекције

**Решење:** Firebase Hosting подразумевано редиректује на HTTPS, али проверити да ли је ово активно у `firebase.json`.

---

### СРЕДЊЕ (4 проблема)

#### 1.9 Firebase API кључ у клијентском коду
**Детаљи:** Firebase конфигурација (API key, project ID) је видљива у клијентском коду. Ово је по дизајну Firebase-а, али треба додати додатну заштиту.

**Решење:**
- Укључити Firebase App Check
- Ограничити API кључ у Google Cloud Console (дозволити само домен srpskiusrcu.rs)
- Поставити Referrer ограничења на API кључ

#### 1.10 Недостаје error boundary
**Детаљи:** Нема глобалног React Error Boundary-ja за хватање грешака у продукцији.

**Решење:** Додати ErrorBoundary компоненту:
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    console.error('Error:', error, info);
  }
  render() {
    if (this.state.hasError) return <h1>Нешто је пошло наопако.</h1>;
    return this.props.children;
  }
}
```

#### 1.11 Dependency аудит
**Детаљи:** npm пакети могу имати познате рањивости.

**Решење:**
```bash
cd frontend && npm audit
cd functions && npm audit
```
Ажурирати пакете са познатим рањивостима.

#### 1.12 Недостаје logout на свим уређајима
**Детаљи:** Када корисник промени лозинку, остали уређаји остају пријављени.

**Решење:** Имплементирати Firebase `signOut()` на свим табовима или користити `onAuthStateChanged` за проверу валидности токена.

---

### НИСКО (3 проблема)

#### 1.13 Console.log у продукцији
**Детаљи:** Debug логови су видљиви у browser конзоли.

**Решење:** Уклонити или условно дозволити `console.log` само у development режиму.

#### 1.14 Source maps у продукцији
**Детаљи:** Vite генерише source maps који откривају изворни код.

**Решење:** У `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    sourcemap: false, // Искључити за продукцију
  }
})
```

#### 1.15 Недостаје `.env.example` фајл
**Детаљи:** Нови програмери немају документацију о потребним environment променљивама.

**Решење:** Креирати `functions/.env.example`:
```
R2_ACCESS_KEY_ID=your_key_here
R2_SECRET_ACCESS_KEY=your_secret_here
R2_ENDPOINT=your_endpoint
R2_BUCKET_NAME=your_bucket
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

---

## 2. SEO анализа

**Укупна оцена: 82/100**

### Позитивно (што већ ради добро)
- SEO скор: 100/100 (мобилни и десктоп)
- JSON-LD структурирани подаци: EducationalOrganization, WebSite, Organization, FAQPage, Blog, BlogPosting
- GA4 praćenje: активно (G-5ZBL4Y3DCJ)
- Sitemap: комплетан са блог URL-овима
- robots.txt: правилно конфигурисан
- Meta тагови: Title, Description, OG тагови на свим страницама
- react-helmet-async: правилно имплементиран

### Проблеми за исправку

#### 2.1 ALL CAPS наслови страница — ВИСОКО
**Проблем:** Неке странице имају наслове у ВЕЛИКИМ СЛОВИМА (нпр. "ФОНЕТИКА", "ГЛАСОВНЕ ПРОМЕНЕ") док друге имају Title Case. Ово ствара дупликате у GA4 извештајима.

**Утицај:** GA4 бележи исту страницу под два различита наслова, што квари аналитику.

**Решење:** Усагласити све наслове у Title Case формат:
- "ФОНЕТИКА" → "Фонетика"
- "ГЛАСОВНЕ ПРОМЕНЕ" → "Гласовне промене"
- Проћи кроз све странице и усагласити `<title>` и `<h1>` тагове

#### 2.2 Недостаје WebP формат слика — ВИСОКО
**Проблем:** Све слике су у PNG формату (велике величине).
**Утицај:** Mobile Performance Score: 68/100 (главни узрок)

**Решење:**
1. Конвертовати све PNG слике у WebP:
   ```bash
   # Користити cwebp или онлајн конвертор
   cwebp input.png -q 80 -o output.webp
   ```
2. Користити `<picture>` елемент за backward compatibility:
   ```html
   <picture>
     <source srcset="image.webp" type="image/webp">
     <img src="image.png" alt="Опис">
   </picture>
   ```
3. Фајлови за конверзију (све слике у `frontend/public/`):
   - Hero секција слике
   - Профилне слике наставника
   - Курс банери
   - Блог слике
   - Лого и иконе

**Очекивано побољшање:** Mobile Performance 68 → 85-90

#### 2.3 Недостаје code splitting / lazy loading — СРЕДЊЕ
**Проблем:** Сав JavaScript се учитава одједном, чак и за странице које корисник не посећује.

**Решење:** Имплементирати React.lazy за route-базиран code splitting:
```javascript
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// У App.jsx:
<Suspense fallback={<div>Учитавање...</div>}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/courses" element={<CoursesPage />} />
    {/* итд. */}
  </Routes>
</Suspense>
```

#### 2.4 Покварен линк `/kursevi` у BlogPostPage — ВИСОКО
**Проблем:** У блог постовима постоји линк ка `/kursevi` који не постоји (правилна рута је `/courses`).
**Локација:** `frontend/src/pages/BlogPostPage.jsx`

**Решење:** Заменити `/kursevi` са `/courses` у свим блог постовима.

#### 2.5 Недостаје JSON-LD на неким страницама — СРЕДЊЕ
**Проблем:** Странице `/courses`, `/quiz`, `/dashboard`, `/contact` немају JSON-LD структуриране податке.

**Решење:** Додати одговарајући JSON-LD:
- `/courses` — `ItemList` + `Course` schema
- `/quiz` — `Quiz` schema
- `/contact` — `ContactPage` schema
- `/dashboard` — не треба (приватна страница)

#### 2.6 Недостаје canonical URL — НИСКО
**Проблем:** Странице немају `<link rel="canonical">` тагове.

**Решење:** Додати у react-helmet-async на свакој страници:
```html
<link rel="canonical" href="https://srpskiusrcu.rs/trenutna-putanja" />
```

#### 2.7 Недостаје Open Graph слика на неким страницама — НИСКО
**Проблем:** Неке странице немају `og:image` мета таг.

**Решење:** Обезбедити да свака страница има `og:image` (може се користити подразумевана слика сајта).

---

## 3. GA4 аналитика

### Стање праћења
- **Tracking ID:** G-5ZBL4Y3DCJ
- **Статус:** Активно

### Уочени проблеми

#### 3.1 Дупли наслови страница
**Проблем:** Исте странице се пријављују под различитим насловима (ALL CAPS vs Title Case), што квари Page Views извештаје.

**Пример:**
| GA4 пријављује | Стварна страница |
|---|---|
| "ФОНЕТИКА" | /quiz/fonetika |
| "Фонетика" | /quiz/fonetika |

**Решење:** Усагласити наслове (видети 2.1).

#### 3.2 Недостаје Enhanced Measurement
**Препорука:** Укључити у GA4 конзоли:
- Scroll tracking
- Outbound clicks
- Site search
- File downloads
- Video engagement (ако постоји YouTube embed)

#### 3.3 Недостају custom events
**Препорука:** Додати праћење кључних акција:
```javascript
// Завршен квиз
gtag('event', 'quiz_complete', {
  quiz_name: 'fonetika',
  score: 8,
  total_questions: 10
});

// Почет курса
gtag('event', 'course_start', {
  course_name: 'Srpski za 7. razred'
});

// Завршена лекција
gtag('event', 'lesson_complete', {
  lesson_name: 'Glasovne promene',
  course_name: 'Srpski za 7. razred'
});

// Регистрација
gtag('event', 'sign_up', {
  method: 'email'
});
```

#### 3.4 Недостаје conversion tracking
**Препорука:** Дефинисати конверзије у GA4:
- Регистрација (sign_up)
- Завршен квиз (quiz_complete)
- Почет курса (course_start)
- Контакт форма (contact_submit)

---

## 4. Перформансе

### Тренутни скорови (Lighthouse)
| Метрика | Мобилни | Десктоп |
|---|---|---|
| Performance | 68 | 98 |
| Accessibility | ~90 | ~90 |
| Best Practices | ~90 | ~90 |
| SEO | 100 | 100 |

### Препоруке за побољшање

#### 4.1 Компресија слика (највећи утицај)
- Конвертовати PNG → WebP (уштеда 50-80% величине)
- Додати `loading="lazy"` на слике испод fold-а
- Оптимизовати димензије (не служити 2000px слику за 400px контејнер)
- Користити `srcset` за responsive слике

#### 4.2 Code splitting
- React.lazy за route-базиран splitting
- Динамички import за тешке компоненте (CourseManager, Dashboard)

#### 4.3 Font оптимизација
- Додати `font-display: swap` за Google Fonts
- Preload критичне фонтове:
  ```html
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
  ```

#### 4.4 Кеширање
- Поставити aggressive cache headers за статичке ресурсе у `firebase.json`:
  ```json
  {
    "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css|eot|otf|ttf|ttc|woff|woff2)",
    "headers": [
      { "key": "Cache-Control", "value": "max-age=31536000, immutable" }
    ]
  }
  ```

---

## 5. Приоритизован план рада

### ХИТНО (урадити у року од 24 сата)
| # | Задатак | Категорија | Процењено време |
|---|---|---|---|
| 1 | Ротирати све компромитоване кредијенцијале (R2, Gmail) | Безбедност | 30 мин |
| 2 | Уклонити .env фајлове из git историје | Безбедност | 15 мин |
| 3 | Додати .env у .gitignore | Безбедност | 5 мин |
| 4 | Прећи на Firebase Secrets за env променљиве | Безбедност | 30 мин |

### ВИСОКО (урадити у року од 7 дана)
| # | Задатак | Категорија | Процењено време |
|---|---|---|---|
| 5 | Инсталирати DOMPurify и санитизовати блог HTML | Безбедност | 15 мин |
| 6 | Ажурирати Firestore security rules | Безбедност | 1 сат |
| 7 | Ажурирати Storage security rules | Безбедност | 30 мин |
| 8 | Додати безбедносна HTTP заглавља у firebase.json | Безбедност | 15 мин |
| 9 | Конвертовати све PNG слике у WebP | Перформансе | 2 сата |
| 10 | Исправити покварен линк /kursevi → /courses | SEO | 10 мин |
| 11 | Усагласити наслове страница (уклонити ALL CAPS) | SEO/GA4 | 30 мин |

### СРЕДЊЕ (урадити у року од 30 дана)
| # | Задатак | Категорија | Процењено време |
|---|---|---|---|
| 12 | Имплементирати code splitting (React.lazy) | Перформансе | 1 сат |
| 13 | Додати JSON-LD на /courses, /quiz, /contact | SEO | 1 сат |
| 14 | Додати canonical URL на све странице | SEO | 30 мин |
| 15 | Имплементирати rate limiting / CAPTCHA на login | Безбедност | 2 сата |
| 16 | Додати Firebase App Check | Безбедност | 1 сат |
| 17 | Додати ErrorBoundary компоненту | Код | 30 мин |
| 18 | Додати custom GA4 events (quiz, course, lesson) | Аналитика | 1 сат |
| 19 | Укључити Enhanced Measurement у GA4 | Аналитика | 15 мин |

### НИСКО (урадити кад буде времена)
| # | Задатак | Категорија | Процењено време |
|---|---|---|---|
| 20 | Уклонити console.log из продукције | Код | 30 мин |
| 21 | Искључити source maps у продукцији | Безбедност | 5 мин |
| 22 | Креирати .env.example фајл | Документација | 10 мин |
| 23 | Додати og:image на све странице | SEO | 30 мин |
| 24 | Оптимизовати фонтове (preload, font-display) | Перформансе | 30 мин |
| 25 | Поставити aggressive cache headers | Перформансе | 15 мин |
| 26 | Покренути npm audit и ажурирати пакете | Безбедност | 30 мин |
| 27 | Дефинисати конверзије у GA4 | Аналитика | 15 мин |

---

## Резиме

| Категорија | Критично | Високо | Средње | Ниско | Укупно |
|---|---|---|---|---|---|
| Безбедност | 5 | 3 | 4 | 3 | 15 |
| SEO | — | 3 | 2 | 2 | 7 |
| Перформансе | — | 1 | 1 | 2 | 4 |
| Аналитика | — | — | 2 | 1 | 3 |
| **Укупно** | **5** | **7** | **9** | **8** | **29** |

**Најважније:** Ротирање кредијенцијала и уклањање .env фајлова из git-а треба урадити ОДМАХ. Остале ставке по приоритету.

---

*Генерисано аутоматизованом анализом. Препоручује се ручна верификација свих налаза пре имплементације.*
