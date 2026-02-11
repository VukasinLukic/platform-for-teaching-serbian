# 🖼️ OG IMAGE KREIRANJE - Српски у Срцу

## ⚠️ PRIORITET: KRITIČNO

Open Graph (OG) image је slika koja se prikazuje kad neko podeli link na društvenim mrežama (Facebook, Instagram, LinkedIn, Twitter).

**Trenutno stanje:** Referenca u kodu postoji, ali fajl **ne postoji** → `/frontend/public/og-image.png`

---

## 📐 TEHNIČKI ZAHTEVI

- **Naziv fajla:** `og-image.png` (ili og-image.jpg)
- **Lokacija:** `/frontend/public/og-image.png`
- **Dimenzije:** **1200×630px** (Facebook/Twitter standard)
- **Format:** PNG (za kvalitet) ili JPEG (za manju veličinu)
- **Veličina fajla:** Ispod 300KB (idealno 100-200KB)
- **Aspect ratio:** 1.91:1 (landscape/horizontalno)

---

## 🎨 SADRŽAJ SLIKE

### Elementi koji MORAJU biti:
1. **Logo** - `/public/logoFULL.svg` ili `/public/logoICON.svg`
2. **Naziv platforme** - "Српски у Срцу"
3. **Glavni slogan/vrednost** - "Online Курсеви за Малу Матуру"
4. **Call-to-action/dodatna vrednost** - "27 Година Искуства | 100+ Видео Лекција"

### Stilski pravci (preporuka):
- **Pozadina:** Bela ili svetlo siva (#F7F7F7), ili primarna boja (#D62828) sa text overlay-om
- **Fontovi:** Moderna, čitka tipografija (pošto Playfair Display i Plus Jakarta Sans koristite u aplikaciji, to bi bilo idealno)
- **Boje:** Pridržavati se brand palete:
  - Primarna: #D62828 (crvena)
  - Sekundarna: #1A1A1A (tamno siva)
  - Akcent: #F2C94C (žuta/zlatna)
- **Slike:** Možete dodati sliku nastavnice ili hero sekciju (ali ne svu sliku, samo kao dekorativni element)

---

## 🛠️ ALATI ZA KREIRANJE

### Opcija 1: Canva (Besplatno, preporučeno)
1. Idi na: https://www.canva.com/
2. Kreiraj novi Custom size: 1200×630px
3. Koristi template ili kreiraj od nule
4. Dodaj logo (uploaduj `/public/logoFULL.svg`)
5. Dodaj text: "Српски у Срцу", "Online Курсеви за Малу Матуру", "27 Година Искуства"
6. Export kao PNG (Download → PNG → Download)
7. Sačuvaj kao `og-image.png` u `/frontend/public/`

### Opcija 2: Figma (Profesionalno)
- Isti princip kao Canva, bolje kontrole

### Opcija 3: Adobe Photoshop/Illustrator
- Za napredne korisnike

---

## ✅ PROVERA DA LI RADI

Kada kreiraš i upload-uješ sliku:

### 1. Provera u browseru
Otvorite: `http://localhost:3000/og-image.png` (u dev modu)
Ili: `https://srpskiusrcu.rs/og-image.png` (nakon deploy-a)

Slika treba da se prikaže.

### 2. Provera Open Graph tagova
Koristi alat: **Facebook Sharing Debugger**
- URL: https://developers.facebook.com/tools/debug/
- Unesi: https://srpskiusrcu.rs
- Klikni "Scrape Again" da osvežiš cache
- Proveri da li se prikazuje slika

### 3. Provera na Twitter-u
- URL: https://cards-dev.twitter.com/validator
- Unesi: https://srpskiusrcu.rs
- Proveri Twitter Card preview

---

## 📝 PRIMER DIZAJNA (Opis)

```
+----------------------------------------------------------+
|                                                          |
|   [LOGO IKONA]      СРПСКИ У СРЦУ                       |
|                                                          |
|   Online Курсеви за Малу Матуру из Српског              |
|                                                          |
|   ✓ 27 Година Искуства                                  |
|   ✓ 100+ Видео Лекција                                  |
|   ✓ 24/7 Приступ                                        |
|                                                          |
|   [Dekorativna slika nastavnice ili hero u pozadini]    |
|                                                          |
+----------------------------------------------------------+
```

---

## 🔄 ALTERNATIVE VERSIONS (Opciono)

Kasnije možeš kreirati specifične OG slike za:
- Homepage: og-image.png (glavni)
- Courses page: og-image-courses.png
- About page: og-image-about.png (sa slikom nastavnice)

Ali za početak, **1 glavna OG slika je dovoljna**.

---

## ⏰ PRIORITET: URADI OVO PRE DEPLOY-A

Bez OG slike, linkovi na društvenim mrežama će izgledati neprofesionalno i neće privući klikove.

**Vreme izrade:** 15-30 minuta
**Impact na SEO/marketing:** VISOK
