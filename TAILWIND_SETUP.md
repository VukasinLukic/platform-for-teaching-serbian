# Tailwind CSS Setup - Nauči Srpski Platforma

## Pregled

Projekat koristi **Tailwind CSS v3.4.11** sa dodatnim pluginovima i custom konfiguracijom za dizajn sistem platforme.

---

## Instalacija

### 1. Instalacija Dependencies

Navigiraj u `frontend` folder i instaliraj potrebne pakete:

```bash
cd frontend
npm install
```

### 2. Glavni Paketi

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.11",
    "autoprefixer": "^10.4.22",
    "postcss": "^8.5.6",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## Konfiguracija

### 1. PostCSS Konfiguracija (`frontend/postcss.config.js`)

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2. Tailwind Konfiguracija (`frontend/tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(60px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration) linear infinite",
        "fade-in": "fadeIn 1s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 3. CSS Fajl (`frontend/src/index.css`)

Glavni CSS fajl sadrži:
- Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- CSS custom properties (CSS variables) za boje
- Custom komponente (glass cards, buttons, forms)
- Custom animacije
- Scrollbar stilizacija

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Crvena srca boja kao primary (#D62828) */
    --primary: 0 71 50;
    --primary-foreground: 0 0 100;

    /* Tamno siva kao secondary (#1A1A1A) */
    --secondary: 0 0 10;
    --secondary-foreground: 0 0 100;

    /* Background - čista bela (#FFFFFF) */
    --background: 0 0 100;
    --foreground: 0 0 10;

    /* Card - svetlo siva (#F7F7F7) */
    --card: 0 0 97;
    --card-foreground: 0 0 10;

    /* Zlatna akcent boja (#F2C94C) */
    --accent: 45 87 62;
    --accent-foreground: 0 0 10;

    --radius: 1rem;
  }
}
```

---

## Dizajn Sistem - Paletа Boja

| Naziv | Hex | HSL | Upotreba |
|-------|-----|-----|----------|
| **Primary (Crvena Srca)** | `#D62828` | `0 71 50` | Glavni brand color, buttons, links, focus states |
| **Secondary (Tamno Siva)** | `#1A1A1A` | `0 0 10` | Text, headings, dark backgrounds |
| **Accent (Zlatna)** | `#F2C94C` | `45 87 62` | Highlights, badges, special elements |
| **Background (Bela)** | `#FFFFFF` | `0 0 100` | Main background |
| **Card (Svetlo Siva)** | `#F7F7F7` | `0 0 97` | Card backgrounds, subtle sections |

---

## Custom Tailwind Klase

### Glass Morphism Effects
```css
.glass-card         /* Light mode glass effect */
.glass-card-dark    /* Dark mode glass effect */
```

### Text Effects
```css
.text-gradient      /* Gradient text (red → gold → red) */
```

### Buttons
```css
.btn-primary        /* Primary transparent button sa border */
.btn-secondary      /* Secondary white/transparent button */
```

### Forms
```css
.form-input         /* Input field sa glass effect */
```

### Layout
```css
.section-padding    /* Consistent section padding */
.container-custom   /* Max-width container sa responsive padding */
```

### Hover Effects
```css
.hover-lift         /* Lift animation on hover */
.nav-link           /* Navigation link sa underline effect */
```

---

## Animacije

### Tailwind Animate Plugin
- `animate-accordion-down`
- `animate-accordion-up`
- `animate-marquee`
- `animate-fade-in`
- `animate-slide-up`
- `animate-scale-in`

### Custom Animacije (iz index.css)
- `animate-slideUp` - Modal slide up
- `animate-slideInRight` - Toast notification slide in
- `animate-fadeIn` - Fade in backdrop

---

## Dark Mode

Dark mode je podržan preko `class` strategije:

```javascript
darkMode: ["class"]
```

Aktivira se dodavanjem `dark` klase na root element:

```html
<html class="dark">
```

---

## Font Stack

Projekat koristi **Inter** font sa fallback na system fontove:

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
  'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

Font features:
```css
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
```

---

## Koraci za Reinstalaciju (Za Nove Agente)

### 1. Instaliraj dependencies
```bash
cd frontend
npm install
```

### 2. Proveri da li postoje potrebni fajlovi
- ✅ `frontend/tailwind.config.js`
- ✅ `frontend/postcss.config.js`
- ✅ `frontend/src/index.css`

### 3. Import CSS u main entry point
Proveri da `frontend/src/main.jsx` importuje CSS:
```javascript
import './index.css'
```

### 4. Pokreni dev server
```bash
npm run dev
```

### 5. Build za produkciju
```bash
npm run build
```

---

## Troubleshooting

### Problem: Tailwind klase ne rade
**Rešenje:**
1. Proveri da li je `index.css` importovan u `main.jsx`
2. Proveri `content` putanje u `tailwind.config.js`
3. Restartuj dev server

### Problem: Custom boje ne funkcionišu
**Rešenje:**
1. Proveri da li su CSS variables definisane u `:root` u `index.css`
2. Proveri da koristiš `hsl(var(--primary))` format u Tailwind config

### Problem: Animacije ne rade
**Rešenje:**
1. Proveri da li je `tailwindcss-animate` instaliran: `npm install tailwindcss-animate`
2. Proveri da je plugin dodat u `tailwind.config.js`: `plugins: [require("tailwindcss-animate")]`

---

## VSCode Extensions (Preporučeno)

Za bolji developer experience:
- **Tailwind CSS IntelliSense** - Autocomplete za Tailwind klase
- **PostCSS Language Support** - Syntax highlighting za PostCSS

---

## Reference

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Animate Plugin](https://github.com/jamiebuilds/tailwindcss-animate)
- [PostCSS Documentation](https://postcss.org/)
