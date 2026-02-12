# SEO PLAN - Srpski u Srcu

> Poslednje azuriranje: Februar 2026

## FAZA 1 - TI RADIS RUCNO (ova nedelja)

### 1. Optimizuj slike - WebP konverzija
**Ovo je NAJVAZNIJA stvar za mobile performance (trenutni skor: 68/100)**

Slike su prevelike i to je glavni razlog sporog FCP (4.7s) i LCP (5.3s) na mobilnom.

**Alat:** https://squoosh.app (besplatno, radi u browseru)

**Koraci za svaku sliku:**
1. Otvori squoosh.app
2. Prevuci sliku
3. Desna strana: izaberi "WebP", quality 80%
4. Download
5. Zameni staru sliku u `frontend/public/` folderu

**Slike za konverziju:**
```
heroSekcija.png → heroSekcija.webp (cilj: <200KB)
heroSekcija2.png → heroSekcija2.webp (cilj: <100KB)
heroSekcija3.png → heroSekcija3.webp (cilj: <150KB)
slika1BezPozadine.png → slika1BezPozadine.webp (cilj: <50KB)
slika2BezPozadine.png → slika2BezPozadine.webp (cilj: <50KB)
slika3BezPozadine.png → slika3BezPozadine.webp (cilj: <50KB)
```

Nakon konverzije, zameni `.png` sa `.webp` u:
- `HomePage.jsx` (heroSekcija.png)
- `AboutPage.jsx` (slike profesorke)
- Bilo gde drugde gde se koriste ove slike

### 4. Testiraj Rich Results
1. Idi na: https://search.google.com/test/rich-results
2. Unesi: https://srpskiusrcu.rs
3. Proveri da li detektuje: Organization, EducationalOrganization
4. Testiraj i: https://srpskiusrcu.rs/faq (treba da detektuje FAQPage)
5. Testiraj i: https://srpskiusrcu.rs/blog/padezi-u-srpskom-jeziku (treba BlogPosting)

---

## FAZA 2 - JA MOGU DA URADIM (sledeci put kad me pozoves)

### A. Dodavanje novih blog postova (vidi SEO/content-ideas.md)
Prioritet postovi koji jos nisu napisani:
1. "Колико времена треба за припрему мале матуре из српског?" (long-tail keyword)
2. "Мала матура 2026: Датуми, правила и све што треба да знате" (sezonski, HIGH volume)
3. "Шта се тачно полаже на малој матури из српског?" (informativni, HIGH volume)
4. "Лектире за малу матуру: листа и кратке анализе" (HIGH volume)
5. "Реченични чланови: субјекат, предикат, атрибут, апозиција" (gramatika)
6. "Правопис: велика слова, интерпункција" (gramatika)

### F. Internal linking izmedju blog postova
Povezati blog clanke medjusobno (npr. "padezi" clanak linkuje na "glasovne promene", itd.)


## FAZA 3 - TI RADIS (u prvom mesecu)

### 1. Backlink strategija
- Kontaktiraj obrazovne portale i roditelske forume
- Guest postovi na blogovima o obrazovanju
- Registruj se na obrazovne direktorijume (edukacija.rs, itd.)
- Ostavi korisne komentare na forumima sa linkom ka blogu

### 2. Google My Business
- Kreiraj Google Business Profile (radi i za online biznis)
- Kategorija: "Online tutoring service" ili "Education"
- Dodaj slike, radno vreme, opis
- Podstici ucenike/roditelje da ostave recenzije

### 3. Social Media SEO signali
- Instagram: redovni postovi sa hashtagovima (#маламатура #српскијезик #припрема)
- Facebook: deli blog postove
- YouTube: upload preview video lekcija (VideoObject schema ce pomoci)

### 4. Pisi 2 blog posta nedeljno
Pogledaj [SEO/content-ideas.md](./SEO/content-ideas.md) za 38 ideja.
Fokusiraj se na:
- Nedeljа 1-2: Informativni ("sta se polaze", "datumi 2026")
- Nedelja 3-4: Gramatika ("recenični clanovi", "pravopis")
- Mesec 2+: Roditeljski saveti + online ucenje

---

## FAZA 4 - NAPREDNI SEO (mesec 2-3)

### 1. Local SEO landing stranice
Kreirati stranice za kljucne gradove: `/priprema-beograd`, `/priprema-novi-sad`, itd.
Roditelji pretrazuju po gradovima cak i za online usluge.

### 2. AggregateRating schema
Kada skupis dovoljno recenzija (5+), dodati AggregateRating u structured data za zvezdice u Google rezultatima.

### 3. Content hub strategija
Napraviti "pillar page" za "Pripema male mature" koja linkuje na sve blog clanke.
Ovo pokazuje Google-u da si autoritet na tu temu.

### 4. Monitoring i optimizacija
- Google Search Console: prati koje stranice su indeksirane, koje keywords dovode promet
- GA4: prati conversion events (registracija, kupovina kursa)
- PageSpeed: ponovo testiraj nakon WebP konverzije (cilj: 90+ mobile)
- Ahrefs Free: prati backlinks

---
## DOKUMENTACIJA

- [SEO/README.md](./SEO/README.md) - Glavni pregled
- [SEO/keyword-research.md](./SEO/keyword-research.md) - Keyword strategija (150+ keywords)
- [SEO/on-page-seo.md](./SEO/on-page-seo.md) - Per-page SEO detalji
- [SEO/content-ideas.md](./SEO/content-ideas.md) - 38 blog post ideja sa strukturom
- [SEO/technical-seo.md](./SEO/technical-seo.md) - Tehnicke preporuke
- [SEO/action-plan.md](./SEO/action-plan.md) - 90-dnevni roadmap
- [SEO/og-image-guide.md](./SEO/og-image-guide.md) - OG slika uputstva
