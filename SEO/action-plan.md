# 🎯 90-ДНЕВНИ SEO ПЛАН ИМПЛЕМЕНТАЦИЈЕ

## ✅ ФАЗА 0 - ОДМАХ УРАЂЕНО (Februara 2025)

- [x] Инсталиран `react-helmet-async`
- [x] Kreirana `SEO.jsx` komponenta za dinamičke meta tagove
- [x] Ažuriran `index.html` (OG tagovi, Twitter cards, Schema, canonical)
- [x] Per-page SEO za: HomePage, AboutPage, CoursesPage, FAQPage, ContactPage, BenefitsPage, OnlineNastavaPage, LoginPage, RegisterPage
- [x] Kreiran `robots.txt`
- [x] Kreiran `sitemap.xml`
- [x] Optimizovana Vite build konfiguracija (code splitting, minifikacija)
- [x] JSON-LD schema: Organization, EducationalOrganization, Person, FAQPage, ItemList

---

## 📅 ФАЗА 1 - НЕДЕЉА 1-2 (Hitno)

### 1. ⚠️ KREIRATI OG IMAGE
- Dimenzije: 1200×630px
- Sadržaj: Logo + "Припрема Мале Матуре из Српског" + vizuelni identitet
- Sačuvati kao: `/frontend/public/og-image.png`
- Alati: Canva, Figma

### 2. ⚠️ OPTIMIZOVATI SLIKE (WebP konverzija)
```
heroSekcija3.png (3.4MB) → hero-main.webp (~150KB)
heroSekcija2.png (1.5MB) → hero-alt.webp (~80KB)
slika1BezPozadine.png (1MB) → slika1.webp (~50KB)
slika2BezPozadine.png (1MB) → slika2.webp (~50KB)
slika3BezPozadine.png (1MB) → slika3.webp (~50KB)
```
- Alat: https://squoosh.app

### 3. ⚠️ POSTAVI GOOGLE SEARCH CONSOLE
1. Idi na: search.google.com/search-console
2. Add property → `srpskiusrcu.rs`
3. Verifikuj (DNS ili HTML fajl)
4. Submit sitemap: `https://srpskiusrcu.rs/sitemap.xml`
5. Proveri ima li greška

### 4. ⚠️ POSTAVI GOOGLE ANALYTICS 4
- Kreiraj GA4 property za srpskiusrcu.rs
- Dodaj tracking code u index.html
- Podesi Conversion Events (registracija, kupovina kursa)

### 5. DODATI `loading="lazy"` svim slikama ispod fold-a
```jsx
// Pre:
<img src="/slika1.png" alt="..." />
// Posle:
<img src="/slika1.webp" alt="Учење српског језика" loading="lazy" width="500" height="400" />
```

---

## 📅 ФАЗА 2 - НЕДЕЉА 3-4

### 6. FIREBASE HOSTING konfiguracija (Cache headers)
Ažurirati `firebase.json` sa cache headers (videti technical-seo.md)

### 7. AŽURIRATI SITEMAP datume
- Kada se deploy na produkciju, ažurirati lastmod datume u sitemap.xml

### 8. DODATI INSTAGRAM social link u JSON-LD
```json
"sameAs": ["https://www.instagram.com/srpskiusrcu"]
```

### 9. TESTIRATI sa Google Rich Results Test
- https://search.google.com/test/rich-results
- Testirati homepage, courses, faq stranice

### 10. TESTIRATI sa Google PageSpeed Insights
- https://pagespeed.web.dev
- Cilj: 90+ na mobile i desktop

---

## 📅 ФАЗА 3 - МЕСЕЦ 2 (Sadržaj)

### 11. KREIRATI BLOG SEKCIJU
- Dodati `/blog` rutu u App.jsx
- Kreirati BlogPage.jsx i BlogPostPage.jsx
- Implementirati 2 blog posta nedeljno
- Početi sa: "Мала матура 2025: Датуми и правила"

### 12. OPTIMIZOVATI COURSE PAGES
- Dodati per-course schema (`Course` type)
- Dodati `VideoObject` schema za video lekcije
- Kreirati course-specific meta opise

### 13. DODATI BREADCRUMBS
```jsx
// Implementirati BreadcrumbList JSON-LD na unutrašnjim stranicama
```

### 14. LOCAL SEO STRANICE (opciono)
- Kreirati landing pages za gradove: /beograd, /novi-sad, /nis...
- Ili dodati grad-specifičan sadržaj na blog

---

## 📅 ФАЗА 4 - МЕСЕЦ 3 (Off-page SEO)

### 15. BACKLINK GRADE
- Kontaktirati obrazovne portale (škole, roditelji forumi)
- Guest post na obrazovnim blogovima
- Directori: Edukacija.rs, Naobrazovanje.rs...
- PR aktivnosti: press release, mediji

### 16. SOCIAL SIGNALS
- Instagram: redovni postovi sa SEO relevantnim hashtagovima
- Facebook: podeliti blog postove
- YouTube: uploadovati preview video lekcija

### 17. GOOGLE MY BUSINESS
- Kreirati Google Business Profile (čak i za online biznis)
- Kategorija: Online tutoring service
- Pisati posta i odgovarati na recenzije

### 18. REVIEW STRATEGIJA
- Podsticati studente da ostave Google recenzije
- Schema AggregateRating kada skupiš recenzije

---

## 📊 KPI - Ciljevi po mesecima

| Metrika | Mesec 1 | Mesec 3 | Mesec 6 |
|---|---|---|---|
| Organic poseta/mesec | 0 | 500+ | 3000+ |
| Google rangiranje za "мала матура српски" | - | Top 20 | Top 10 |
| Blog postova | 0 | 8+ | 20+ |
| Backlinks | 0 | 5+ | 20+ |
| Core Web Vitals | ? | Pass | Pass |

---

## 🔧 ALATI ZA PRAĆENJE

| Alat | Besplatno | Svrha |
|---|---|---|
| Google Search Console | ✅ | Rankings, clicks, impressions |
| Google Analytics 4 | ✅ | Traffic, conversions |
| PageSpeed Insights | ✅ | Core Web Vitals |
| Google Rich Results Test | ✅ | Schema validacija |
| Ahrefs Free Tools | ✅ | Backlink analiza |
| Ubersuggest | ✅ (limitirano) | Keyword research |
| Screaming Frog | ✅ (max 500 URL) | Technical SEO |
