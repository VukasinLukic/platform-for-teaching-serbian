# ⚡ SEO QUICK START - SLEDEĆI KORACI

> **✅ Все је имплементирано!** Ево шта треба урадити одмах пре launch-a.



### 2. ⚠️ OPTIMIZUJ SLIKE - WebP Konverzija (30 min)

**Problem:** Slike su PREVELIKE (heroSekcija3.png = 3.4MB!)

**Rešenje:** Konvertuj u WebP format → 70-80% manja veličina

**Alat:** https://squoosh.app

**Koje slike optimizovati:**
```
frontend/public/heroSekcija3.png (3.4MB) → hero-main.webp (~150KB)
frontend/public/heroSekcija2.png (1.5MB) → hero-alt.webp (~80KB)
frontend/public/slika1BezPozadine.png (1MB) → slika1.webp (~50KB)
frontend/public/slika2BezPozadine.png (1MB) → slika2.webp (~50KB)
frontend/public/slika3BezPozadine.png (1MB) → slika3.webp (~50KB)
```

**Koraci:**
1. Idi na https://squoosh.app
2. Upload sliku (drag & drop)
3. Desno: Izaberi "WebP" format
4. Quality: 80-85%
5. Download → Preimenuj (npr. `hero-main.webp`)
6. Zameni referenciraj u React komponentama (npr. HomePage.jsx)

---

### 3. ⚠️ DODAJ LAZY LOADING na slike (10 min)

U komponentama (HomePage.jsx, AboutPage.jsx, itd.), dodaj `loading="lazy"` atribut:

```jsx
// BEFORE:
<img src="/slika1.webp" alt="..." />

// AFTER:
<img src="/slika1.webp" alt="Учење српског језика" loading="lazy" width="500" height="400" />
```

---

## 🟡 ВАЖНО - Урадити у првој недељи

### 4. Google Search Console (15 min)
1. Idi na: https://search.google.com/search-console
2. Klikni "Add Property"
3. Unesi: `srpskiusrcu.rs` (ili tvoj domen)
4. Verifikuj domain (DNS TXT rekord ili HTML file upload)
5. Submit Sitemap: `https://srpskiusrcu.rs/sitemap.xml`

### 5. Google Analytics 4 (20 min)
1. Idi na: https://analytics.google.com
2. Kreiraj novi property: "Српски у Срцу"
3. Kopiraj Measurement ID (G-XXXXXXXXX)
4. Dodaj tracking code u `frontend/index.html` pre `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX');
</script>
```

### 6. Firebase Hosting Cache Headers (5 min)
Ažuriraj `firebase.json` sa cache headers - vidi [SEO/technical-seo.md](./SEO/technical-seo.md) sekcija B.5.

---

## 🟢 PREPORUČENO - U prvom mesecu

### 7. Kreiraj Blog Sekciju
- Dodaj `/blog` rutu u App.jsx
- Kreiraj BlogPage.jsx i BlogPostPage.jsx
- Piši 2 posta nedeljno
- Ideje: vidi [SEO/content-ideas.md](./SEO/content-ideas.md)

### 8. Backlink Strategija
- Kontaktiraj lokalne škole, obrazovne portale
- Guest postovi na roditeljskim forumima
- Registruj se na obrazovne direktoriume

### 9. Google My Business
- Kreirati GMB profil (čak i za online biznis)
- Kategorija: "Online tutoring service"

---

## 📊 PROVERA DA LI RADI

### Test 1: Meta Tagovi
```bash
# Dev mode
npm run dev
# Otvori http://localhost:3000 → View Page Source → Traži "<meta property="
```

### Test 2: Structured Data
```
Idi na: https://search.google.com/test/rich-results
Unesi: https://srpskiusrcu.rs
Proveri: Organization, FAQPage schemas
```

### Test 3: Open Graph
```
Idi na: https://developers.facebook.com/tools/debug/
Unesi: https://srpskiusrcu.rs
Klikni "Scrape Again"
Proveri da li se prikazuje og-image.png
```

### Test 4: Core Web Vitals
```
Idi na: https://pagespeed.web.dev
Unesi: https://srpskiusrcu.rs
Cilj: 90+Score na mobile i desktop
```

---

## 📁 DOKUMENTACIJA

Detaljnije informacije:
- **[SEO/README.md](./SEO/README.md)** - Glavni pregled
- **[SEO/keyword-research.md](./SEO/keyword-research.md)** - Keyword strategija
- **[SEO/on-page-seo.md](./SEO/on-page-seo.md)** - Per-page SEO details
- **[SEO/content-ideas.md](./SEO/content-ideas.md)** - 38 blog post ideja
- **[SEO/technical-seo.md](./SEO/technical-seo.md)** - Tehničke preporuke
- **[SEO/action-plan.md](./SEO/action-plan.md)** - 90-day roadmap
- **[SEO/og-image-guide.md](./SEO/og-image-guide.md)** - OG slika uputstva

---

## ✅ CHECKLIST

- [ ] Kreirana OG slika (og-image.png)
- [ ] Slike konvertovane u WebP
- [ ] Dodato `loading="lazy"` na slike
- [ ] Google Search Console setup + sitemap submitted
- [ ] Google Analytics 4 tracking dodat
- [ ] Firebase cache headers ažurirani
- [ ] Testirano sa Google Rich Results Test
- [ ] Testirano sa PageSpeed Insights
- [ ] Testirano sa Facebook Sharing Debugger

---

## 🎯 CILJEVI (Mesečno praćenje)

| Mesec | Organic Traffic | Top Keyword Ranking | Blog Postova |
|---|---|---|---|
| 1 | 0-100 | - | 0-4 |
| 3 | 500+ | Top 20 | 8+ |
| 6 | 3,000+ | Top 10 | 20+ |

**Alati za praćenje:** Google Search Console, Google Analytics 4, Ahrefs (free tools)

---

## 📞 PITANJA?

Sve je implementirano! Jednostavno prati ovaj checklist i biće odlično. 🚀

**Implementirano:** Februar 2025
