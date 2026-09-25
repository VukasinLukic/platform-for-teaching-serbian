# SRPSKIUSRCU.RS — Kompletan Growth Plan + Claude Code Akcioni Plan
**Datum analize: April 30, 2026**

---

## SITUACIJA TRENUTNO (iz podataka)

| Metrika | Vrednost | Ocena |
|---|---|---|
| Aktivni korisnici (28 dana) | 198 | Rast ✅ |
| Novi korisnici | 182 (92%) | Zdrav ✅ |
| Vraćajući korisnici | 22 (8%) | ⚠️ Nizak retention |
| Organski Google klikovi | 96 ukupno | Premali ❌ |
| Jedini organski keyword | "srpski u srcu" | Kritično ❌ |
| Qualified leads | 0 | Kritično ❌ |
| Konverzije | 0 | Kritično ❌ |
| Mobile page speed | 78/100 | Popraviti ⚠️ |
| Desktop page speed | 91/100 | OK ✅ |
| Bounce rate (početna) | 80% | Visok ❌ |
| Engagement time | 56s | Premalo ⚠️ |

**Glavni problem:** Saobraćaj raste ali NIKO ne konvertuje. Lead funnel ne postoji.

---

## DEO 1: GROWTH STRATEGIJA — 5 KANALA

---

### KANAL 1: "Probna Mala Matura" Funnel (NAJVEĆI PRIORITET)

Ovo je najmoćniji conversion hack za tvoj sajt. Umesto da odmah tražiš kupovinu, daješ vrednost prvo.

**Kako izgleda:**
```
Landing page: srpskiusrcu.rs/probni-test
↓
"Uradi probnu malu maturu — 20 pitanja, 15 minuta"
↓
[korisnik radi test — BEZ prijave]
↓
Rezultat: "Ti si postigao 11/20. Prosek je 14/20."
↓
"Vidi detaljna objašnjenja i vežbaj još 500 pitanja →"
[Napravi nalog]
```

**Zašto radi:** Korisnik već investirao 15 minuta, dobio personalizovan rezultat, emocionalno je angažovan. Konverzija je 3-5x viša nego direktna ponuda.

**Implementacija:** Stranica `/probni-test` sa 20 pitanja iz srpskog (gramatika + književnost), tajmer, progress bar, prikaz rezultata na kraju sa CTA za registraciju.

---

### KANAL 2: Instagram Reels / TikTok — "Video Kviz" Format

**Najviralniji format za edukaciju u 2026.**

Format koji funkcioniše (30-60 sekundi):
```
Hook (0-3s): "90% učenika pogreši ovo na maloj maturi 😱"
Pitanje (3-10s): [tekst na ekranu] "Koja je razlika između metafore i poređenja?"
Countdown (10-18s): [tajmer 5-4-3-2-1]
Odgovor (18-25s): "Metafora NEMA 'kao' ili 'kao da'!"
Primer (25-40s): "Rosa = suze neba ✅ / Rosa je kao suze ❌"
CTA (40-60s): "Uradi CELI probni test → link u bio"
```

**Realna strategija za @srpskiusrcu:**
- 3-4 reela nedeljno (ne mora svaki dan)
- Teme: greške na ispitu, "da li znaš?", objašnjenja pojmova
- Profesorka Marina treba da bude lice — autentičnost je ključ
- Odgovaraj na SVE komentare u prva 24h (algorithm reward)

**Sadržajni stub — 3 stuba:**
1. "Greška dana" — česta greška iz srpskog
2. "Pitanje sa ispita" — kviz format
3. "Priča iza lektire" — zanimljivi detalji o delima

---

### KANAL 3: SEO Stranice — "Test po Test" Arhitektura

Umesto jedne početne stranice, treba 50-100 specifičnih stranica:

**Struktura:**
```
/srpski-jezik/
  /gramatika/
    /vrste-recenica-test/
    /glagolski-vid-vjezbe/
    /pravopis-test/
  /knjizevnost/
    /lektire-mala-matura/
    /knjizevni-pojmovi-test/
    /analiza-dela-hasanaginica/
  /probni-testovi/
    /probni-test-1/
    /probni-test-2/
    /mala-matura-2025-resenja/
```

Svaka stranica: mini test (5-10 pitanja) + objašnjenja + CTA dugme.

**Target upiti:**
- "vrste rečenica srpski test" — nema konkurencije
- "glagolski vid zadaci sa rešenjima" — visoka namera
- "hasanaginica analiza mala matura" — specifično
- "srpski pravopis vežbanje online" — stalni interes

---

### KANAL 4: WhatsApp / Viber Grupe Roditelja

**Ovo je skriveni kanal koji niko ne koristi a enormno efikasan u Srbiji.**

Roditelji u Srbiji imaju WhatsApp grupe po razredima i školama. Jedna preporuka u takvoj grupi može doneti 20-50 registracija.

**Strategija:**
1. Pitaj postojeće roditelje-korisnike da podele sajt u svojim grupama
2. Pripremi im ready-to-share poruku: "Moje dete koristi ovo za malu maturu i baš mu pomaže — srpskiusrcu.rs"
3. Ponudi popust za onoga ko dovede prijatelja (referral)

---

### KANAL 5: Referral Sistem — "Dovedi Druga"

**Za učenike:**
```
Dovedi 2 druga koji se registruju → dobijaš besplatan probni test
Dovedi 5 drugara → dobijaš pristup bonus lekcijama
```

**Za roditelje:**
```
Preporuči prijatelju → oboje dobijate 10% popusta
```

Ovo kreira viralni loop unutar škola i razreda.

---

## DEO 2: CLAUDE CODE — TEHNIČKI AKCIONI PLAN

### Šta sve treba popraviti i dodati na sajtu

---

#### PRIORITET 1 — Mobile Performance (KRITIČNO, uraditi odmah)

**Problem:** Mobile PageSpeed 78/100, Total Blocking Time 530ms, 14 long tasks.

**Claude Code zadaci:**

```bash
# 1. Audit JS bundle
npx lighthouse https://srpskiusrcu.rs --only-categories=performance --output=json

# 2. Analiza unused JavaScript
npx depcheck
```

**Konkretne promene u kodu:**

```javascript
// PROBLEM: sav JS se učitava odmah
// REŠENJE: lazy loading komponenti

// Umesto:
import HeavyComponent from './HeavyComponent'

// Koristiti:
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Wrapper:
<Suspense fallback={<div>Učitava se...</div>}>
  <HeavyComponent />
</Suspense>
```

```html
<!-- PROBLEM: render-blocking requests (160ms) -->
<!-- REŠENJE: defer/async za skripte -->

<!-- Umesto: -->
<script src="analytics.js"></script>

<!-- Koristiti: -->
<script defer src="analytics.js"></script>

<!-- Za fontove: preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

```css
/* PROBLEM: Cumulative Layout Shift */
/* REŠENJE: eksplicitne dimenzije za slike */

img {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9; /* ili specifične dimenzije */
}
```

---

#### PRIORITET 2 — Schema Markup (dodati odmah, 1-2h posla)

Dodati u `<head>` na početnu stranicu:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Srpski u Srcu",
      "url": "https://srpskiusrcu.rs",
      "logo": "https://srpskiusrcu.rs/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+381-60-493-3680",
        "contactType": "customer service",
        "availableLanguage": "Serbian"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kruševac",
        "addressCountry": "RS"
      },
      "sameAs": [
        "https://www.instagram.com/srpskiusrcu"
      ]
    },
    {
      "@type": "Person",
      "name": "Marina Lukić",
      "jobTitle": "Profesor srpskog jezika",
      "worksFor": {
        "@type": "Organization",
        "name": "Srpski u Srcu"
      },
      "description": "Profesor srpskog jezika sa 27 godina iskustva",
      "knowsAbout": ["Srpski jezik", "Književnost", "Mala matura"]
    },
    {
      "@type": "Course",
      "name": "Priprema za Malu Maturu iz Srpskog",
      "description": "Online kurs srpskog jezika i književnosti za učenike 8. razreda",
      "provider": {
        "@type": "Organization",
        "name": "Srpski u Srcu"
      },
      "courseMode": "online",
      "inLanguage": "sr",
      "educationalLevel": "MiddleSchool"
    }
  ]
}
</script>
```

---

#### PRIORITET 3 — Stranica `/probni-test` (novi feature, ~1 dan posla)

**Komponenta `ProbniTest.jsx`:**

```jsx
import { useState } from 'react'

const pitanja = [
  {
    id: 1,
    pitanje: "Koja figura govora je prisutna u rečenici 'Rosa su suze neba'?",
    odgovori: ["Poređenje", "Metafora", "Personifikacija", "Hiperbola"],
    tacno: 1,
    objasnjenje: "Metafora direktno poistovećuje dve pojave bez reči 'kao' ili 'kao da'. Rosa = suze neba — direktno izjednačavanje."
  },
  // ... još 19 pitanja
]

export default function ProbniTest() {
  const [trenutno, setTrenutno] = useState(0)
  const [odabrano, setOdabrano] = useState(null)
  const [rezultati, setRezultati] = useState([])
  const [faza, setFaza] = useState('test') // 'test' | 'rezultat'
  const [tacnih, setTacnih] = useState(0)

  const odgovori = (idx) => {
    setOdabrano(idx)
    const tacno = idx === pitanja[trenutno].tacno
    if (tacno) setTacnih(t => t + 1)
    setRezultati(r => [...r, { tacno, odabrano: idx }])
    
    setTimeout(() => {
      if (trenutno + 1 < pitanja.length) {
        setTrenutno(t => t + 1)
        setOdabrano(null)
      } else {
        setFaza('rezultat')
      }
    }, 1200)
  }

  if (faza === 'rezultat') {
    const procenat = Math.round((tacnih / pitanja.length) * 100)
    const prosek = 70 // prosečan rezultat na platformi
    
    return (
      <div className="rezultat">
        <h2>Tvoj rezultat: {tacnih}/{pitanja.length} ({procenat}%)</h2>
        <p>Prosek naših učenika: {prosek}%</p>
        {procenat < prosek ? (
          <p>Ima prostora za napredak! Naši kursevi ti mogu pomoći.</p>
        ) : (
          <p>Odlično! Vežbaj dalje da osiguraš odličan rezultat.</p>
        )}
        <a href="/register" className="cta-btn">
          Napravi nalog i vežbaj još 500 pitanja →
        </a>
      </div>
    )
  }

  const p = pitanja[trenutno]
  const progress = ((trenutno) / pitanja.length) * 100

  return (
    <div className="probni-test">
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>
      <span className="brojac">{trenutno + 1} / {pitanja.length}</span>
      
      <h2>{p.pitanje}</h2>
      
      <div className="odgovori">
        {p.odgovori.map((odg, idx) => (
          <button
            key={idx}
            onClick={() => odgovori(idx)}
            disabled={odabrano !== null}
            className={
              odabrano !== null
                ? idx === p.tacno ? 'tacno' : idx === odabrano ? 'netacno' : ''
                : ''
            }
          >
            {odg}
          </button>
        ))}
      </div>
      
      {odabrano !== null && (
        <div className="objasnjenje">
          <p>{p.objasnjenje}</p>
        </div>
      )}
    </div>
  )
}
```

---

#### PRIORITET 4 — SEO Meta tagovi po stranicama

Svaka stranica treba dinamičan `<head>`:

```jsx
// components/SEOHead.jsx
import Head from 'next/head' // ili Helmet za React

export function SEOHead({ title, description, url, image }) {
  return (
    <Head>
      <title>{title} | Srpski u Srcu</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph — za deljenje na društvenim mrežama */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="sr_RS" />
      <meta property="og:type" content="website" />
      
      {/* Twitter/X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  )
}

// Upotreba na svakoj stranici:
// <SEOHead
//   title="Priprema za Malu Maturu iz Srpskog"
//   description="Online kurs srpskog jezika za 8. razred. 120+ video lekcija, probni testovi, priprema za prijemni. Pridruži se 700+ učenika."
//   url="https://srpskiusrcu.rs"
//   image="https://srpskiusrcu.rs/og-image.jpg"
// />
```

**Meta opisi po stranicama:**

| Stranica | Title tag | Meta description |
|---|---|---|
| / | Srpski u Srcu — Online Kurs za Malu Maturu | Online kurs srpskog za 8. razred. 120+ video lekcija, probni testovi, priprema za malu maturu. Pridruži se 700+ učenika. |
| /online-nastava | Online Nastava Srpskog Jezika — Časovi Uživo | Individualni i grupni online časovi srpskog sa iskusnim profesorom. Fleksibilni termini, priprema za malu maturu. |
| /courses | Kursevi Srpskog Jezika za Malu Maturu | Izaberi kurs: gramatika, književnost ili kompletna priprema za malu maturu. HD video lekcije + testovi. |
| /probni-test | Probna Mala Matura iz Srpskog — Uradi Test Odmah | Testiraj znanje iz srpskog! 20 pitanja, 15 minuta. Vidi koliko si spreman za malu maturu. Besplatno. |

---

#### PRIORITET 5 — Blog stranice (generator sadržaja)

Napraviti strukturu za blog:

```
/blog/
  /sta-se-pita-na-maloj-maturi-srpski/
  /knjizevni-pojmovi-mala-matura/
  /gramatika-greske-ispit/
  /kako-se-pripremiti-mala-matura/
```

**Blog post template komponenta:**

```jsx
// app/blog/[slug]/page.jsx (Next.js App Router)
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] }
  }
}

// Schema za blog post:
const blogSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "author": {
    "@type": "Person",
    "name": "Marina Lukić"
  },
  "datePublished": post.date,
  "publisher": {
    "@type": "Organization",
    "name": "Srpski u Srcu"
  }
}
```

---

#### PRIORITET 6 — Canonical URL problem (6 stranica)

Search Console pokazuje 6 stranica sa "Alternate page with proper canonical tag" i problem sa http vs https.

```html
<!-- Dodati na SVAKU stranicu u <head>: -->
<link rel="canonical" href="https://srpskiusrcu.rs/TRENUTNA-STRANICA" />

<!-- Na početnoj: -->
<link rel="canonical" href="https://srpskiusrcu.rs/" />
```

```javascript
// next.config.js — redirect http → https i www → bez www
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.srpskiusrcu.rs' }],
        destination: 'https://srpskiusrcu.rs/:path*',
        permanent: true,
      },
    ]
  },
}
```

---

#### PRIORITET 7 — Accessibility popravke (za Lighthouse skor)

```jsx
// PROBLEM: dialog elementi nemaju accessible name
// REŠENJE:
<dialog aria-label="Prijavljivanje na kurs" aria-modal="true">
  ...
</dialog>

// PROBLEM: linkovi bez teksta (ikone bez labela)
// REŠENJE:
<a href="/instagram" aria-label="Pratite nas na Instagramu">
  <InstagramIcon />
</a>

// PROBLEM: heading hijerarhija
// Svaka stranica mora imati tačno JEDAN <h1>
// Zatim h2, h3 redom — nikad preskakati
```

---

## DEO 3: VREMENSKI PLAN

### Nedelja 1 (odmah) — Tehnika
- [ ] Dodati canonical tagove na sve stranice
- [ ] Dodati schema markup (Organization + Person + Course)
- [ ] Popraviti meta opise na /online-nastava i /courses
- [ ] Defer/async za JS skripte (mobile speed)
- [ ] Eksplicitne dimenzije za sve slike

### Nedelja 2 — Funnel
- [ ] Kreirati stranicu `/probni-test` sa 20 pitanja
- [ ] A/B testirati CTA na rezultatu (registracija vs pogledaj kurs)
- [ ] Postaviti Google Tag Manager za tracking konverzija

### Nedelja 3-4 — Sadržaj
- [ ] Napisati 2 blog posta (mala matura srpski, književni pojmovi)
- [ ] Kreirati prvih 5 Instagram Reels (kviz format)
- [ ] Optimizovati /blog/ stranicu za SEO

### Mesec 2 — Skaliranje
- [ ] 20+ SEO stranica sa mini testovima
- [ ] Referral sistem u kodu
- [ ] Email welcome sekvenca za nove registracije
- [ ] Leaderboard stranica

### Mesec 3 — Automatizacija
- [ ] Claude API integracija za generisanje pitanja
- [ ] Automatski Instagram post pipeline
- [ ] Personalizovani email na osnovu rezultata testa

---

## DEO 4: KPI CILJEVI

| Metrika | Sada | Mesec 1 | Mesec 3 |
|---|---|---|---|
| Organski klikovi/mesec | 96 | 200+ | 500+ |
| Aktivni korisnici | 198 | 400+ | 1000+ |
| Konverzije (registracije) | 0 | 20+ | 100+ |
| Instagram pratitelji | ? | +200 | +1000 |
| Blog postova | 0 | 3 | 12 |
| SEO stranica | 8 | 20 | 60+ |
| Mobile PageSpeed | 78 | 88+ | 90+ |

---

*Plan kreiran na osnovu Google Search Console, Google Analytics 4, i PageSpeed Insights podataka za srpskiusrcu.rs*