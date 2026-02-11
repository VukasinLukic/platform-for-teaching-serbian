# ⚙️ TECHNICAL SEO - Српски у Срцу

## A) ШТА ЈЕ IMPLEMENTIRANO ✅

### 1. Meta Tags (react-helmet-async)
- Per-page title, description, canonical
- Open Graph tagovi за sve javne stranice
- Twitter Card tagovi
- Noindex za auth stranice (/login, /register, /dashboard, /admin)

### 2. robots.txt (`/public/robots.txt`)
- Dozvoljava sve javne stranice
- Blokira: /dashboard, /admin, /quizzes, /verify, /uplatnica, /login, /register, /reset-password, /online-class/
- Definiše Sitemap URL

### 3. sitemap.xml (`/public/sitemap.xml`)
- Sve javne stranice sa priority i changefreq
- Homepage: priority 1.0
- Courses, Online Nastava: priority 0.9
- About, Benefits, FAQ, Contact: priority 0.6-0.8

### 4. JSON-LD Structured Data
- `EducationalOrganization` - index.html (svi poseti)
- `WebSite` + `Organization` - Homepage
- `Person` (Марина Лукић) - About page
- `ItemList` - Courses page
- `FAQPage` - FAQ page (dinamički iz FAQ podataka)

### 5. Vite Build Optimizacije
- Code splitting (vendor, firebase, ui chunks)
- Terser minifikacija (uklanjanje console.log/debugger)
- Chunk size warning na 1000KB

### 6. Base HTML (index.html)
- `lang="sr"` atribut
- Canonical tag
- Theme color (#D62828)
- Apple touch icon
- Preconnect za Google Fonts

---

## B) PREOSTALE TEHNIČKE PREPORUKE

### ⚠️ KRITIČNO - Uraditi odmah:

#### 1. OG Image (og-image.png)
```
Kreirati: /public/og-image.png
Dimenzije: 1200x630px
Sadržaj: Logo, naziv platforme, slogan
Alati: Canva, Figma, Adobe Photoshop
```

#### 2. Konverzija slika u WebP
```
Sadašnje stanje:
- heroSekcija3.png = 3.4MB (!!)
- heroSekcija2.png = 1.5MB
- slika1BezPozadine.png = 1MB (×3)

Akcija: Konvertovati sve slike u WebP
Alati: squoosh.app (besplatno, u browseru)
Ušteda: 70-80% veličine fajla

Ciljane veličine:
- Hero slike: max 200KB
- Slike bez pozadine: max 100KB
```

#### 3. Lazy Loading za slike
```jsx
// Dodati loading="lazy" svim <img> tagovima ispod fold-a
<img src="/hero.webp" alt="..." loading="lazy" />
```

#### 4. Google Search Console Setup
1. Idi na search.google.com/search-console
2. Dodaj property: srpskiusrcu.rs
3. Verifikuj domain (DNS TXT rekord ili HTML fajl)
4. Submit sitemap: srpskiusrcu.rs/sitemap.xml
5. Proveri Coverage izveštaj

#### 5. Firebase Hosting Konfiguracija
Dodaj u `firebase.json`:
```json
{
  "hosting": {
    "public": "frontend/dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2)",
        "headers": [{
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }]
      },
      {
        "source": "**/*.@(png|jpg|jpeg|webp|svg)",
        "headers": [{
          "key": "Cache-Control",
          "value": "max-age=86400"
        }]
      },
      {
        "source": "/",
        "headers": [{
          "key": "Cache-Control",
          "value": "no-cache"
        }]
      }
    ]
  }
}
```

---

### 🟡 VAŽNO - Uraditi u roku od mesec dana:

#### 6. Google Analytics 4
```html
<!-- Dodati u index.html pre </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**GA4 Eventy koje treba trackirati:**
- `purchase` - kad korisnik kupi kurs
- `sign_up` - registracija
- `login`
- `video_start` - gledanje video lekcije
- `quiz_complete` - završen kviz
- `contact_form_submit` - kontakt forma

#### 7. Canonical Tagovi
Dodati na sve stranice sa duplim URL-ovima. Već implementirano kroz SEO.jsx.

#### 8. Preloading kritičnih resursa
```html
<!-- u index.html -->
<link rel="preload" href="/logoFULL.svg" as="image" />
```

---

### 🟢 PREPORUČENO - Dugoročno:

#### 9. Blog implementacija
- Kreirati /blog rutu u React Router-u
- Markdown fajlovi za blog postove
- Ili headless CMS (Contentful, Sanity)
- Per-post SEO meta tagovi

#### 10. Prerendering / SSG razmatranje
Za bolje inicijalno učitavanje i SEO crawler-e:
- Opcija A: React Snap (prerender pri buildu)
- Opcija B: Migrovati na Next.js (veća investicija, bolje rezultate)

**Preporuka:** Ostati na Vite/React, dodati react-snap prerender

---

## C) CORE WEB VITALS CILJEVI

| Metric | Cilj | Kako postići |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Optimizovati hero slike, koristiti WebP |
| FID/INP (Interaction to Next Paint) | < 200ms | Smanjiti JS bundle, lazy loading |
| CLS (Cumulative Layout Shift) | < 0.1 | Definisati dimenzije svih slika |

**Alat za merenje:** PageSpeed Insights (pagespeed.web.dev)

---

## D) SITE ARCHITECTURE

```
srpskiusrcu.rs (Homepage - PR: 1.0)
├── /about (PR: 0.8)
├── /courses (PR: 0.9)
│   └── /course/:id (dinamičke stranice)
├── /online-nastava (PR: 0.9)
├── /benefits (PR: 0.7)
├── /faq (PR: 0.7)
├── /contact (PR: 0.6)
├── /privacy (PR: 0.3)
└── /terms (PR: 0.3)

BLOKIRANO (noindex):
├── /login
├── /register
├── /dashboard
├── /admin
├── /quizzes/*
└── /verify
```
