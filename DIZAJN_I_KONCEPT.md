# 🎨 Nauči Srpski - Dizajn Sistem i Koncept Projekta

**Verzija:** 1.0
**Datum:** 2025-11-22

---

## 📖 Opis Projekta

**Nauči Srpski** je online platforma za pripremu učenika osmog razreda za malu maturu iz srpskog jezika i književnosti.

### Ciljna Grupa
- Učenici 8. razreda osnovne škole
- Roditelji koji traže kvalitetnu online pripremu
- Učenici koji preferiraju učenje u sopstvenom tempu

### Vrednosna Ponuda
- **Profesorka Marina Lukić** - 15 godina iskustva
- **500+ uspešnih učenika**
- **98% prolaznost** na prijemnom ispitu
- Video lekcije dostupne 24/7
- Individualan pristup

---

## 🎨 Vizuelni Identitet

### Boje (Color Palette)

#### Primarne Boje
```css
#BFECC9  /* Mint Green - Glavna boja, optimizam, rast */
#003366  /* Navy Blue - Poverenje, profesionalnost */
#F5F3EF  /* Cream/Beige - Background, toplina */
```

#### Akcent Boje
```css
#FF6B35  /* Coral Orange - CTA dugmad, važni elementi */
#FFD700  /* Gold - Istaknuti elementi, nagrade */
#42A5F5  /* Sky Blue - Info elementi */
```

#### Neutralne
```css
#FFFFFF  /* White - Kartice, overlay */
#000000  /* Black - Tekst */
Gray 50-700  /* Za tekst i UI elementi */
```

### Značenje Boja

| Boja | Značenje | Upotreba |
|------|----------|----------|
| **Mint Green** | Sveže, obrazovanje, rast | Hover efekti, dekoracije, akcenti |
| **Navy Blue** | Profesionalnost, poverenje | Headeri, footer, važi elementi |
| **Coral Orange** | Akcija, energija | CTA dugmad, važne poruke |
| **Gold** | Uspeh, postignuće | Badge-ovi, sertifikati, trofeje |
| **Cream** | Toplina, pristupačnost | Background, miran izgled |

---

## 🖋️ Tipografija

### Font Familije
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

- **Headings:** Font-serif (elegantno za naslove)
- **Body:** Inter (čitko, moderno, profesionalno)
- **Feature:** Font smoothing za cleaner izgled

### Veličine
```css
h1: 5xl-6xl (48-60px) - Hero naslovi
h2: 4xl-5xl (36-48px) - Section naslovi
h3: 2xl-3xl (24-30px) - Card naslovi
body: base (16px) - Tekst
small: sm (14px) - Dodatne info
```

---

## 🎯 Dizajn Principi

### 1. Prijateljski i Profesionalan
- Topla bež pozadina (#F5F3EF) umesto hladne bele
- Zaobljeni uglovi (rounded-xl, rounded-3xl)
- Soft shadows umesto oštrih

### 2. Vizuelna Hijerarhija
- **Hero sekcija** - Veliki naslovi sa akcentom (coral orange)
- **Icons** - Lucide React icons za konzistentnost
- **Spacing** - Dosta belog prostora (padding: py-16, py-20)

### 3. Interaktivnost
```css
Hover Effects:
- transform: translateY(-12px) - Kartice se podižu
- scale-110 - Ikone rastu
- Transition duration: 300-400ms - Smooth animacije
```

### 4. Dekorativni Elementi
- **SVG ilustracije** (list, bulb) u hero sekciji
- **Badge-ovi** - Za istaknute info (zlatni za trofeje)
- **Gradijenti** - Suptilni za depth

---

## 🧩 Komponente i Struktura

### Layout Pattern
```
Header (Logo + Navigation)
  ↓
Hero Section (Glavni naslov + CTA)
  ↓
Stats/Benefits Cards
  ↓
Course Grid
  ↓
Footer
```

### Card Dizajn
```css
.card {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: transform 0.4s;
}

.card:hover {
  transform: translateY(-12px);
  box-shadow: 0 8px 32px rgba(191,236,201,0.2);
}
```

### Button Style
```css
Primary CTA:
- bg-[#FF6B35] (Coral Orange)
- rounded-full
- px-10 py-4
- shadow-lg
- hover:bg-[#E55A28]

Secondary:
- border-2 border-primary
- transparent background
- hover:bg-primary
```

---

## 📱 Responsive Dizajn

### Breakpoints
```css
sm: 640px   - Mobile landscape
md: 768px   - Tablets
lg: 1024px  - Desktop
xl: 1280px  - Large screens
```

### Grid System
- Mobile: 1 kolona
- Tablet: 2 kolone
- Desktop: 3-4 kolone

---

## 🎭 UI Patterns

### Hero Section Pattern
```jsx
1. Dekorativni SVG elementi (levo i desno)
2. Veliki naslov (5xl-6xl) sa akcentom
3. Benefiti sa checkmark ikonama
4. Prominentan CTA dugme (coral orange)
5. Testimonial ili trust indicators
```

### Feature Cards Pattern
```jsx
1. Ikona u obojenom background-u
2. Naslov (font-bold, text-xl)
3. Kratak opis (2-3 linije)
4. Optional: Link ili CTA
```

### Achievement/Stats Pattern
```jsx
1. Veliki broj (text-4xl, bold, coral)
2. Label ispod (text-sm, gray)
3. Grid layout (2-4 kolone)
```

---

## 🖼️ Vizuelni Elementi

### Ikone (Lucide React)
```jsx
CheckCircle - Benefits, potvrde
Trophy - Postignuća
Book - Kursevi, lekcije
Video - Video sadržaj
Star - Ocene, reviews
Lightbulb - Ideje, tips
Users - Testimonials
Award - Sertifikati
```

### Shapes & Decorations
```jsx
Rounded organic shapes (40%_60%_70%_30%)
SVG illustrations (list, lightbulb)
Badge circles (rounded-full)
Gradient overlays (subtle)
```

---

## 🎬 Animacije i Tranzicije

### Timing
```css
Fast: 200ms - Input focus, mali elementi
Normal: 300-400ms - Card hover, button hover
Slow: 600ms - Page transitions
```

### Easing
```css
cubic-bezier(0.4, 0, 0.2, 1) - Prirodan, smooth
ease-out - Za fade-in efekte
```

### Key Animations
```css
.hover-lift - Podiže element na hover
.fade-in - Fade in on scroll
.text-gradient - Animirani gradijent tekst
```

---

## 🔤 Ton Komunikacije

### Tekstualni Stil
- **Prijateljski ali stručan** - "Ti" forma ali profesionalno
- **Fokus na rezultate** - "98% prolaznost", "500+ učenika"
- **Motivisuće poruke** - "Započni učenje", "Postani bolji"

### Primer Naslova
```
❌ "Priprema za ispit"
✅ "Online priprema za malu maturu uz proverene rezultate"

❌ "Naš kurs"
✅ "Započni učenje uz profesorku sa 15 godina iskustva"
```

---

## 📐 Spacing System

### Padding Scale
```css
px-4  (16px) - Card padding
px-6  (24px) - Container padding
px-10 (40px) - Button padding
py-16 (64px) - Section padding
py-20 (80px) - Hero padding
```

### Margins
```css
mb-4  (16px) - Paragraph spacing
mb-6  (24px) - Section spacing
mb-12 (48px) - Large spacing
```

---

## 🎨 Specijalni Efekti

### Glass Morphism (Opciono)
```css
.glass-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(191,236,201,0.2);
}
```

### Gradient Text
```css
.text-gradient {
  background: linear-gradient(135deg, #BFECC9, #9DD6AC);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## ✅ Design Checklist

### Svaka Stranica Treba:
- [ ] Hero sekcija sa jasnim CTA
- [ ] Konzistentne boje (#BFECC9, #003366, #FF6B35)
- [ ] Hover efekti na interaktivnim elementima
- [ ] Responsive grid (mobile, tablet, desktop)
- [ ] Dekorativni elementi (icons, badges)
- [ ] Bela pozadina (#F5F3EF)
- [ ] Rounded corners (xl-3xl)
- [ ] Proper spacing (py-16, py-20)

---

## 🚀 Branding Elementi

### Logo/Header
- "Nauči Srpski" text logo
- Mint green accent (knjiga ikona)
- Navy blue text

### Footer
- Navy blue background (#003366)
- White text
- Links za socijalne mreže
- Copyright info

---

## 📊 UI Stats

### Komponente
- **Buttons:** 3 varijante (primary, secondary, ghost)
- **Cards:** 2 varijante (default, elevated)
- **Inputs:** Rounded, mint green focus
- **Badges:** Rounded-full sa boji

### Pages
1. Home - Hero + Stats + Course grid
2. About - Teacher bio + achievements
3. Course Detail - Syllabus + Enroll CTA
4. Dashboard - Student progress
5. Admin - Payment verification
6. Contact - Form + Info cards

---

## 📱 Ekrani (Stranice) Aplikacije

### 1. **HomePage** (`/`)
**Sadržaj:**
- Hero sekcija sa glavnim naslovom i CTA dugmetom
- SVG dekorativne ilustracije (list, lightbulb)
- Benefiti sa checkmark ikonama (3x)
- Slika profesorke Marina Lukić
- Stats brojevi (500+ učenika, 98% prolaznost, 15 godina)
- Grid prikaz svih kurseva (kartice)
- Testimonials/Reviews sekcija
- Footer

**Boje:** Cream background, Coral CTA, Navy headeri
**Icons:** CheckCircle, Book, Trophy, Star, Lightbulb

---

### 2. **LoginPage** (`/login`)
**Sadržaj:**
- Logo i naziv "Nauči Srpski"
- Forma za login (email + password)
- Error poruke (crveni tekst)
- "Prijavi se" dugme (primary)
- Link ka Register stranici
- Link ka "Zaboravljena lozinka"
- Dekorativni blur elementi u pozadini

**Boje:** Cream background, Navy card, Coral submit button
**Icons:** Mail, Lock, Book

---

### 3. **RegisterPage** (`/register`)
**Sadržaj:**
- Logo i naziv "Nauči Srpski"
- Forma za registraciju:
  - Ime i prezime (input)
  - Email (input)
  - Telefon (input)
  - Lozinka (input)
  - Potvrdi lozinku (input)
- Validacije (real-time error messages)
- "Registruj se" dugme
- Link ka Login stranici
- Dekorativni elementi

**Boje:** Cream background, Navy card
**Icons:** User, Mail, Phone, Lock, Trophy

---

### 4. **DashboardPage** (`/dashboard`) - Student Panel
**Sadržaj:**
- Hero sa dobrodošlicom: "Dobrodošli, [Ime]!"
- Statistika kartica: Broj aktivnih kurseva
- **"Moji kursevi"** sekcija:
  - Grid sa kursevima koje student ima
  - Progress bar za svaki kurs
  - "Nastavi učenje" dugme
- **"Moje uplate"** sekcija:
  - Tabela transakcija
  - Status ikone (pending/confirmed/rejected)
  - Datum i iznos
- **Upload potvrde o uplati** komponenta (ako nema aktivnih kurseva)

**Boje:** Navy gradient hero, White cards
**Icons:** Book, CheckCircle, Clock, AlertCircle, FileText

---

### 5. **CoursePage** (`/course/:id`) - Detalji Kursa
**Sadržaj:**
- Hero sa nazivom kursa
- Badge sa kategorijom
- Cena kursa (veliki, bold)
- "Kupi kurs" CTA dugme
- **O kursu** sekcija (opis)
- **Šta ćete naučiti** sekcija (lista lekcija sa brojevima)
- **Pogodnosti** grid (3 kartice):
  - Video pristup 24/7
  - Sertifikat po završetku
  - Podrška profesorke
- Zlatni trophy badge (dekoracija)
- Video player (ako je korisnik kupio kurs)

**Boje:** Navy hero, Mint badges, Coral CTA
**Icons:** Play, BookOpen, CheckCircle, Trophy, Award

---

### 6. **AboutPage** (`/about`) - O nama
**Sadržaj:**
- Hero sa naslovom "O nama" i tekstom
- Slika profesorke (u rounded card-u)
- Zlatni trophy badge (dekoracija)
- **Achievements** grid (4 kartice):
  - 500+ učenika
  - 98% prolaznost
  - 15+ godina iskustva
  - 4.9/5 ocena
- **Vrednosti** sekcija (3 kartice):
  - Posvećenost uspehu (Heart icon)
  - Fokus na rezultate (Target icon)
  - Inovativne metode (Lightbulb icon)
- Testimonials
- CTA dugme "Započni učenje"

**Boje:** Navy hero, White cards, Color-coded icons
**Icons:** Award, Users, Trophy, Heart, Target, Lightbulb

---

### 7. **BenefitsPage** (`/benefits`) - Prednosti
**Sadržaj:**
- Hero sekcija
- Grid sa benefitima (6-8 kartica):
  - Fleksibilno učenje
  - Video lekcije
  - Individualna podrška
  - Sertifikat
  - Pristup 24/7
  - Proveren metod
- Svaki benefit ima ikonu i opis
- Poređenje: Tradicionalna nastava vs Online (tabela)
- FAQ sekcija
- CTA dugme

**Boje:** Cream background, Mint accents
**Icons:** Video, Clock, Award, BookOpen, CheckCircle

---

### 8. **ContactPage** (`/contact`) - Kontakt
**Sadržaj:**
- Hero sekcija "Kontaktirajte nas"
- **Kontakt forma:**
  - Ime (input)
  - Email (input)
  - Telefon (input)
  - Poruka (textarea)
  - "Pošalji" dugme
- **Kontakt info kartice** (3x):
  - Email adresa (Sky Blue icon)
  - Telefon (Gold icon)
  - Radno vreme (Coral icon)
- Success/Error poruke nakon slanja
- EmailJS integracija

**Boje:** Cream background, Color-coded contact cards
**Icons:** Mail, Phone, Clock, MessageCircle

---

### 9. **AdminPage** (`/admin`) - Admin Panel
**Sadržaj:**
- Hero sa "Admin Panel" naslovom
- **Stats kartice** (4x):
  - Ukupno kurseva (Mint)
  - Aktivnih učenika (Sky Blue)
  - Na čekanju uplate (Gold)
  - Mesečni prihod (Coral)
- **Tab navigacija** (3 tab-a):
  - **Kursevi** - CRUD za kurseve
  - **Lekcije** - CRUD za lekcije
  - **Uplate** - Verifikacija uplata
- **CourseManager** komponenta (tabela kurseva)
- **LessonManager** komponenta (video upload, R2)
- **PaymentVerifier** komponenta:
  - Lista pending uplata
  - Slika potvrde (preview)
  - "Potvrdi" / "Odbij" dugmad
  - EmailJS notifikacije

**Boje:** Navy hero, Color-coded stats
**Icons:** LayoutDashboard, Video, CreditCard, Users, TrendingUp

---

### 10. **ResetPasswordPage** (`/reset-password`)
**Sadržaj:**
- Logo
- Forma za reset lozinke (email input)
- "Pošalji link" dugme
- Povratak na Login
- Success/Error poruke
- Firebase Auth integracija

**Boje:** Cream background, Navy card
**Icons:** Mail, Lock

---

### 11. **PrivacyPage** (`/privacy`) - Politika Privatnosti
**Sadržaj:**
- Header
- Tekst politike privatnosti
- Sekcije (H2, H3 struktura)
- Footer

---

### 12. **TermsPage** (`/terms`) - Uslovi Korišćenja
**Sadržaj:**
- Header
- Tekst uslova korišćenja
- Sekcije (H2, H3 struktura)
- Footer

---

## 🧩 Zajednički Elementi Svih Stranica

### Header (Navigacija)
- Logo + "Nauči Srpski"
- Navigation links: Početna, Kursevi, O nama, Kontakt
- "Prijavi se" / "Dashboard" dugme
- Logout opcija (kada je korisnik ulogovan)
- Responsive hamburger menu (mobile)

### Footer
- Navy Blue (#003366) background
- White text
- Copyright info
- Socijalne mreže linkovi
- Legal links (Privacy, Terms)

### Loading State
- Spinner (mint green border)
- "Učitavanje..." tekst
- Center screen

### Empty States
- Ikona (gray)
- "Nemate kurseve" poruka
- CTA dugme "Pregledaj kurseve"

---

**Dizajn Filozofija:**
*"Jednostavno, prijateljski, profesionalno. Fokus na učenike i njihov uspeh."*

---

**Color Psychology:**
- 🌿 Mint Green = Rast, Učenje, Svežina
- 🌊 Navy Blue = Poverenje, Stabilnost, Autoritet
- 🔥 Coral = Akcija, Energija, Motivacija
- 🏆 Gold = Uspeh, Postignuće, Kvalitet
