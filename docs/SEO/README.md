# 🚀 SEO IMPLEMENTACIJA - Српски у Срцу

> **Status:** ✅ КОМПЛЕТНО ИМПЛЕМЕНТИРАНО (Фебруар 2025)
> **Platform:** React SPA (Vite + React Router + Firebase)
> **Domain (assumed):** srpskiusrcu.rs

---

## 📦 ШТА ЈЕ УРАЂЕНО

### 1. ✅ react-helmet-async
- Instaliran paket za dinamičke meta tagove u React SPA
- Wrapper component `<HelmetProvider>` dodat u `main.jsx`

### 2. ✅ SEO Komponenta (`/src/components/SEO.jsx`)
Reusable komponenta koja omogućava:
- Per-page title, description, canonical
- Open Graph tagovi (Facebook, Instagram, LinkedIn)
- Twitter Card tagovi
- JSON-LD structured data (Schema.org)
- noindex opcija za privatne stranice

### 3. ✅ Per-Page SEO (Svi javni page-ovi)
Implementirano na:
- ✅ HomePage - WebSite + Organization schema
- ✅ AboutPage - Person schema (Марина Лукић)
- ✅ CoursesPage - ItemList + Course schema (dinamički)
- ✅ CoursePage - Course schema (dinamički po kursu)
- ✅ FAQPage - FAQPage schema (automatski iz FAQ podataka)
- ✅ ContactPage
- ✅ BenefitsPage
- ✅ OnlineNastavaPage
- ✅ LoginPage (noindex)
- ✅ RegisterPage (noindex)
- ✅ PrivacyPage
- ✅ TermsPage

### 4. ✅ index.html - Base SEO
- Postavljeni base meta tagovi
- Open Graph i Twitter Card default tagovi
- JSON-LD EducationalOrganization schema (sitewide)
- Preconnect za Google Fonts
- Theme color, Apple touch icon
- Canonical tag

### 5. ✅ robots.txt (`/public/robots.txt`)
- Dozvoljava sve javne stranice
- Blokira privatne (/dashboard, /admin, /login, /register, itd.)
- Definiše Sitemap lokaciju

### 6. ✅ sitemap.xml (`/public/sitemap.xml`)
- Sve javne stranice sa priority rankingom
- Homepage: 1.0
- Courses, Online nastava: 0.9
- About, Benefits, FAQ: 0.6-0.8
- Privacy, Terms: 0.3

### 7. ✅ Vite Build Optimizacija
- Code splitting (vendor, firebase, ui chunks)
- Terser minifikacija (removes console.log/debugger)
- Chunk size limit na 1000KB

---

## 📁 STRUKTURA FAJLOVA

```
platform-for-teaching-serbian/
├── frontend/
│   ├── public/
│   │   ├── robots.txt                ← SEO: robots file
│   │   ├── sitemap.xml               ← SEO: sitemap
│   │   └── og-image.png              ← ⚠️ NEDOSTAJE - KREIRATI!
│   ├── src/
│   │   ├── components/
│   │   │   └── SEO.jsx               ← SEO component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          ← SEO added
│   │   │   ├── AboutPage.jsx         ← SEO added
│   │   │   ├── CoursesPage.jsx       ← SEO added
│   │   │   ├── CoursePage.jsx        ← SEO added (dynamic)
│   │   │   ├── FAQPage.jsx           ← SEO + FAQPage schema
│   │   │   ├── ContactPage.jsx       ← SEO added
│   │   │   ├── BenefitsPage.jsx      ← SEO added
│   │   │   ├── OnlineNastavaPage.jsx ← SEO added
│   │   │   ├── LoginPage.jsx         ← SEO (noindex)
│   │   │   ├── RegisterPage.jsx      ← SEO (noindex)
│   │   │   └── legal/
│   │   │       ├── PrivacyPage.jsx   ← SEO added
│   │   │       └── TermsPage.jsx     ← SEO added
│   │   └── main.jsx                  ← HelmetProvider wrapper
│   ├── index.html                    ← Base SEO tagovi
│   └── vite.config.js                ← Build optimizacije
└── SEO/                              ← Dokumentacija
    ├── README.md                     ← Ovaj fajl
    ├── keyword-research.md           ← Keyword strategija
    ├── on-page-seo.md                ← On-page SEO details
    ├── content-ideas.md              ← 38 blog post ideja
    ├── technical-seo.md              ← Tehničke preporuke
    ├── action-plan.md                ← 90-day SEO roadmap
    └── og-image-guide.md             ← Kako kreirati OG sliku
```

---

## ⚠️ SLEDECI KORACI (KRITIČNI)

### 1. KREIRATI OG IMAGE
- Lokacija: `/frontend/public/og-image.png`
- Dimenzije: 1200×630px
- **Instrukcije:** Vidi [og-image-guide.md](./og-image-guide.md)

### 2. OPTIMIZOVATI SLIKE (WebP konverzija)
```
heroSekcija3.png (3.4MB) → hero-main.webp (~150KB)
heroSekcija2.png (1.5MB) → hero-alt.webp (~80KB)
slika1BezPozadine.png (1MB) → slika1.webp (~50KB)
slika2BezPozadine.png (1MB) → slika2.webp (~50KB)
slika3BezPozadine.png (1MB) → slika3.webp (~50KB)
```
Alat: https://squoosh.app

### 3. GOOGLE SEARCH CONSOLE
- Dodati property: srpskiusrcu.rs
- Verifikovati domain
- Submitovati sitemap: https://srpskiusrcu.rs/sitemap.xml

### 4. GOOGLE ANALYTICS 4
- Kreirati GA4 property
- Dodati tracking code u index.html
- Setupovati conversion events

### 5. FIREBASE HOSTING CONFIG
- Dodati cache headers u firebase.json (videti technical-seo.md)

---

## 📊 KEYWORDS STRATEGY

**Glavni keyword:** `мала матура српски`
**Sekundarni:** `припрема мале матуре`, `завршни испит 8 разред`, `онлине курсеви српски`

**Detaljno:** Vidi [keyword-research.md](./keyword-research.md)

---

## 📝 CONTENT PLAN

**38 blog post ideja** kategorizovanih u:
1. Припрема за малу матуру (10 članaka)
2. Српски језик - градиво (15 članaka)
3. Савети за родитеље (8 članaka)
4. Online учење (5 članaka)

**Blog nije implementiran u aplikaciji** - treba razviti `/blog` sekciju.

**Detaljno:** Vidi [content-ideas.md](./content-ideas.md)

---

## 🎯 KPI CILJEVI

| Metrika | Mesec 1 | Mesec 3 | Mesec 6 |
|---|---|---|---|
| Organic poseta/mesec | 0 | 500+ | 3,000+ |
| Google rangiranje za "мала матура српски" | - | Top 20 | Top 10 |
| Blog postova | 0 | 8+ | 20+ |
| Backlinks | 0 | 5+ | 20+ |
| Core Web Vitals | ? | Pass | Pass |

---

## 🧰 ALATI ZA MONITORING

| Alat | Besplatno | Svrha |
|---|---|---|
| Google Search Console | ✅ | Rankings, clicks, impressions |
| Google Analytics 4 | ✅ | Traffic, conversions |
| PageSpeed Insights | ✅ | Core Web Vitals |
| Google Rich Results Test | ✅ | Schema validacija |
| Ahrefs Free Tools | ✅ | Backlink analiza |

---

## 📞 PODRŠKA

Za pitanja o implementaciji, otvorite issue ili kontaktirajte developera.

**SEO implementirano od strane:** Claude Sonnet 4.5
**Datum:** Februar 2025
