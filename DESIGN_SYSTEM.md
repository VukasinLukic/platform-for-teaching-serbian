# Design System - Nauči Srpski Platform

## 🎨 Boje (Color Palette)

Kompletna paleta boja korištena širom platforme, inspirisana Edukids dizajnom:

### Primarne boje

```css
/* Glavni brand zelena - koristi se za akcente, hover efekte */
#BFECC9 (RGB: 191, 236, 201) - Svetlo zelena

/* Tamno plava - header, tekst naslova, dugmići */
#003366 (RGB: 0, 51, 102) - Tamno plava

/* Narandžasta/Crvena - CTA dugmići, važni akcenti */
#FF6B35 (RGB: 255, 107, 53) - Narandžasta
#E55A28 (RGB: 229, 90, 40) - Tamnije narandžasta (hover)

/* Zlato - ikonice, trofejni */
#FFD700 (RGB: 255, 215, 0) - Zlato

/* Plava - informativni kartice */
#42A5F5 (RGB: 66, 165, 245) - Plava
```

### Pozadinske boje

```css
/* Glavna pozadina sajta */
#F5F3EF (RGB: 245, 243, 239) - Topla bež

/* Bela za kartice i kontejnere */
#FFFFFF (RGB: 255, 255, 255) - Bela

/* Gradijenti za dark sekcije */
linear-gradient(135deg, #003366 0%, #004488 100%)
```

### Pomoćne boje

```css
/* Uspeh */
Green-50, Green-100, Green-700 - Bootstrap zelene

/* Greška */
Red-50, Red-200, Red-700 - Bootstrap crvene

/* Informacija */
Blue-50, Blue-200, Blue-700 - Bootstrap plave

/* Sive za tekst */
Gray-50 (#F9FAFB)
Gray-100 (#F3F4F6)
Gray-200 (#E5E7EB)
Gray-300 (#D1D5DB)
Gray-400 (#9CA3AF)
Gray-500 (#6B7280)
Gray-600 (#4B5563)
Gray-700 (#374151)
Gray-800 (#1F2937)
Gray-900 (#111827)
```

---

## 📐 Tipografija

### Font Family

```css
/* Serif za naslove */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

/* Za headere koristiti font-serif utility klasu */
.font-serif {
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}
```

### Font Sizes & Weights

```css
/* Naslovi */
h1: text-4xl md:text-5xl lg:text-6xl, font-serif, font-bold
h2: text-3xl md:text-4xl, font-serif, font-bold
h3: text-2xl md:text-3xl, font-bold

/* Paragrafi */
Veliki tekst: text-lg (18px)
Normalan tekst: text-base (16px)
Mali tekst: text-sm (14px)
Extra mali: text-xs (12px)

/* Font weights */
font-bold (700)
font-semibold (600)
font-medium (500)
font-normal (400)
```

---

## 🔘 Komponente

### Buttons

Nalazi se u: `frontend/src/components/ui/Button.jsx`

**Variante:**

```jsx
// Primary - Narandžasto dugme (glavni CTA)
<Button variant="primary">Prijavite se</Button>

// Secondary - Tamno plavo dugme
<Button variant="secondary">Više informacija</Button>

// Outline - Transparent sa bordurom
<Button variant="outline">Pregledaj</Button>

// Outline White - Za tamne pozadine
<Button variant="outlineWhite">Registruj se</Button>

// Green - Zeleno dugme
<Button variant="green">Potvrdi</Button>

// Ghost - Minimalno dugme
<Button variant="ghost">Otkaži</Button>

// Danger - Crveno dugme
<Button variant="danger">Obriši</Button>
```

**Veličine:**

```jsx
<Button size="sm">Mali</Button>
<Button size="md">Srednji</Button>  // Default
<Button size="lg">Veliki</Button>
<Button size="xl">Extra veliki</Button>
```

**Props:**

```jsx
<Button
  variant="primary"
  size="lg"
  loading={true}        // Prikazuje Loader2 ikonu
  disabled={true}       // Disabled stanje
  showArrow={true}      // Prikazuje ArrowRight ikonu
  className="w-full"    // Dodatne Tailwind klase
>
  Tekst dugmeta
</Button>
```

---

### Cards

Nalazi se u: `frontend/src/components/ui/Card.jsx`

**Variante:**

```jsx
// Default - Bela kartica sa senkom
<Card variant="default">
  <CardBody>Sadržaj</CardBody>
</Card>

// Elevated - Jača senka
<Card variant="elevated">
  <CardBody>Sadržaj</CardBody>
</Card>

// Bordered - Sa bordurom
<Card variant="bordered">
  <CardBody>Sadržaj</CardBody>
</Card>

// Gradient - Sa gradijent pozadinom
<Card variant="gradient">
  <CardBody>Sadržaj</CardBody>
</Card>

// Glass - Stakleni efekat
<Card variant="glass">
  <CardBody>Sadržaj</CardBody>
</Card>
```

**Hover efekat:**

```jsx
<Card hover> // Dodaje hover lift efekat
  <CardBody>Sadržaj</CardBody>
</Card>
```

**Delovi kartice:**

```jsx
<Card>
  <CardHeader>Header sadržaj</CardHeader>
  <CardBody>Glavni sadržaj</CardBody>
  <CardFooter>Footer sadržaj</CardFooter>
</Card>
```

---

### Input Fields

Nalazi se u: `frontend/src/components/ui/Input.jsx`

```jsx
<Input
  type="email"
  label="Email adresa"
  placeholder="vas@email.com"
  value={email}
  onChange={handleChange}
  leftIcon={Mail}        // Lucide ikona sa leve strane
  rightIcon={Lock}       // Lucide ikona sa desne strane
  error="Nevažeći email" // Error poruka
  helperText="Pomoćni tekst"
  required={true}
/>
```

**Stanja:**

- Normal: Siva bordera, focus zelena
- Error: Crvena bordera i tekst
- Disabled: Siva pozadina, disabled cursor

---

### Header (Navigacija)

Nalazi se u: `frontend/src/components/ui/Header.jsx`

```jsx
<Header transparent={false} />
```

**Automatski prikazuje:**
- Logo sa linkom na početnu
- Navigacioni linkovi (#kursevi, #profesor, itd.)
- Auth dugmiće (Login/Register ili Dashboard/Logout)
- Admin link (samo za admin korisnike)

---

## 🎭 Dizajn Principi

### 1. Zaobljeni oblici (Rounded Shapes)

Koristimo organske zaobljene oblike širom sajta za playful, ali profesionalan izgled:

```css
/* Standardni border radius */
rounded-xl (12px)
rounded-2xl (16px)
rounded-3xl (24px)

/* Organski oblici za slike (samo na HomePage) */
rounded-[40%_60%_70%_30%]
rounded-[30%_70%_60%_40%]

/* Dugmići - uvek rounded-full */
rounded-full
```

### 2. Simetrija i Grid

- Koristimo `grid` za raspored elemenata
- Grid kolone: 2, 3 ili 4 (responsive)
- Uvek simetričan raspored na desktop verzijama

```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Kartice */}
</div>
```

### 3. Kontrast

**VAŽNO:** Svi elementi moraju imati dovoljan kontrast:

- Svetla pozadina (#F5F3EF) + Tamni tekst (#003366)
- Tamna pozadina (#003366) + Svetli tekst (#FFFFFF ili #BFECC9)
- CTA dugmići (#FF6B35) + Beli tekst (#FFFFFF)

**Nikada:**
- Zeleni tekst (#BFECC9) na beloj pozadini (slab kontrast)
- Žuti tekst (#FFD700) na beloj pozadini (slab kontrast)

### 4. Spacing (Razmaci)

```css
/* Padding unutar komponenti */
p-4 (16px)
p-6 (24px)
p-8 (32px)
p-12 (48px)

/* Margin između sekcija */
mb-6 (24px)
mb-8 (32px)
mb-12 (48px)
mb-16 (64px)

/* Gap između grid elemenata */
gap-4 (16px)
gap-6 (24px)
gap-8 (32px)
```

### 5. Shadows (Senke)

```css
/* Blage senke za kartice */
shadow-xl

/* Jače senke za elevated kartice */
shadow-2xl

/* Hover efekat */
hover:shadow-2xl
```

### 6. Transitions

Sve hover efekte animirati sa:

```css
transition-all duration-300
hover:-translate-y-1  /* Lift efekat */
```

---

## 📄 Stranice

### Dizajnirane stranice:

✅ **HomePage** (`/`)
- Hero sekcija sa organskim oblicima
- Stats bar (500+, 98%, 100+)
- Why Choose Us kartice (Video, Uživo, Priprema)
- What Students Get sekcija
- Professor sekcija
- How It Works sekcija
- Courses grid
- CTA sekcije
- Footer

✅ **LoginPage** (`/login`)
- Centered forma sa dekorativnim pozadinama
- Email i Password input sa ikonama
- Error handling
- Link ka ResetPassword
- Link ka Register

✅ **RegisterPage** (`/register`)
- Proširena forma (Ime, Email, Telefon, Password, Confirm Password)
- Validacija na frontendu
- Error handling
- Link ka Login

✅ **ResetPasswordPage** (`/reset-password`)
- Email input forma
- Success state nakon slanja emaila
- Link nazad na Login

✅ **DashboardPage** (`/dashboard`)
- Hero sa pozdravom korisnika
- "Moji kursevi" sekcija sa grid prikazom
- "Moje uplate" sekcija sa transaction karticama
- Upload payment confirmation
- CTA footer

✅ **CoursePage** (`/course/:id`)
- Course hero sa features
- "Šta ćete naučiti" sekcija
- Lekcije lista (samo ako korisnik ima pristup)
- Purchase sidebar (sticky)
- Access status (zelena kartica ako ima pristup)

---

## 🎯 Ikonice

Koristimo **Lucide React** ikonice:

```jsx
import { Book, Video, CheckCircle, Star, Trophy, Award } from 'lucide-react';

// Standardne veličine
w-4 h-4 (16px) - Mali tekst
w-5 h-5 (20px) - Normalan tekst
w-6 h-6 (24px) - Veliki tekst
w-8 h-8 (32px) - Ikonice u krugovima
w-12 h-12 (48px) - Hero ikonice
```

---

## ✅ Checklist za nove komponente

Kada kreirateš novu komponentu ili stranicu, proveri:

- [ ] Koristi boje iz palete (#BFECC9, #003366, #FF6B35, #FFD700, #F5F3EF)
- [ ] Koristi Button komponentu umesto HTML button elementa
- [ ] Koristi Input komponentu umesto HTML input elementa
- [ ] Koristi Card komponentu za kontejnere
- [ ] Koristi Header komponentu za navigaciju
- [ ] Sve hover efekte animirati (transition-all duration-300)
- [ ] Svi dugmići su rounded-full
- [ ] Sve kartice su rounded-3xl ili rounded-2xl
- [ ] Kontrast između teksta i pozadine je dovoljan (WCAG AA)
- [ ] Responsive dizajn (md:, lg: breakpoints)
- [ ] Loading stanja prikazuju spinner
- [ ] Error stanja prikazuju poruke u crvenim karticama

---

## 🚀 Kako koristiti Design System

### 1. Kreiranje novog dugmeta

```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="lg" showArrow>
  Klikni me
</Button>
```

### 2. Kreiranje nove forme

```jsx
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock } from 'lucide-react';

<form onSubmit={handleSubmit}>
  <Input
    type="email"
    label="Email"
    placeholder="email@example.com"
    leftIcon={Mail}
    required
  />
  <Input
    type="password"
    label="Lozinka"
    placeholder="••••••••"
    leftIcon={Lock}
    required
  />
  <Button type="submit" variant="primary" className="w-full">
    Prijavite se
  </Button>
</form>
```

### 3. Kreiranje nove kartice sa sadržajem

```jsx
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';

<Card variant="elevated" hover>
  <CardHeader>
    <h3 className="text-xl font-bold text-[#003366]">Naslov</h3>
  </CardHeader>
  <CardBody>
    <p className="text-gray-600">Sadržaj kartice...</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Akcija</Button>
  </CardFooter>
</Card>
```

### 4. Dodavanje Header-a na stranicu

```jsx
import Header from '../components/ui/Header';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />
      {/* Ostatak stranice */}
    </div>
  );
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first pristup */
Default: <640px (mobile)
sm: 640px (mali tablet)
md: 768px (tablet)
lg: 1024px (mali desktop)
xl: 1280px (desktop)
2xl: 1536px (veliki desktop)
```

**Primer korišćenja:**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 kolona na mobile, 2 na tablet, 3 na desktop */}
</div>
```

---

## 🎨 Animacije

### Loading Spinner

```jsx
<div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent"></div>
```

### Fade In (već definisano u index.css)

```css
.fade-in {
  animation: fadeIn 1s ease-out;
}
```

### Hover Lift

```css
hover:-translate-y-1
hover:-translate-y-2 (jači efekat)
```

### Scale na hover

```css
hover:scale-105
hover:scale-110
```

---

## 📝 Naming Conventions

### CSS Klase

```css
/* BEM stil za custom komponente */
.card-header
.card-body
.card-footer

/* Utility-first sa Tailwind */
className="flex items-center gap-4"
```

### Komponente

```
PascalCase: Button, Card, Input, Header
```

### Fajlovi

```
PascalCase za komponente: Button.jsx, Card.jsx
PascalCase za stranice: LoginPage.jsx, DashboardPage.jsx
camelCase za utilities: helpers.js, auth.service.js
```

---

## 🔗 Linkovi i Navigacija

### Interni linkovi (React Router)

```jsx
import { Link } from 'react-router-dom';

<Link to="/dashboard">Dashboard</Link>
```

### Anchor linkovi (za sekcije na istoj stranici)

```jsx
<a href="#kursevi">Kursevi</a>
```

### Eksterni linkovi

```jsx
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  Link
</a>
```

---

## ✨ Best Practices

1. **Uvek koristi reusable komponente** umesto kopiranja koda
2. **Koristi Tailwind utility klase** umesto custom CSS-a gde god je moguće
3. **Testiraj responsive dizajn** na svim breakpoint-ima
4. **Proveri kontrast** sa WCAG AA standardom
5. **Optimizuj slike** pre upload-a
6. **Koristi semantic HTML** (header, main, section, article, footer)
7. **Accessibility**: dodaj aria-label za ikonice bez teksta

---

Kraj dokumentacije. Za dodatna pitanja, kontaktiraj dizajnera ili vidi Tailwind CSS dokumentaciju.
