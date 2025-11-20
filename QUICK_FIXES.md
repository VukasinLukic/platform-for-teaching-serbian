# Brze Izmene za HomePage

## 🎯 Dugmići za ažuriranje

### 1. "Prijavite se sada" (linija ~263)
Nađi: `<button className="border-2 border-[#003366] px-6 py-2 rounded-md hover:bg-[#003366] hover:text-white transition inline-flex items-center gap-2">`
  `Prijavite se sada <ArrowRight className="w-4 h-4" />`
`</button>`

Zameni sa:
```jsx
<Link to="/register">
  <button className="border-2 border-[#003366] px-6 py-2 rounded-md hover:bg-[#003366] hover:text-white transition inline-flex items-center gap-2">
    Prijavite se sada <ArrowRight className="w-4 h-4" />
  </button>
</Link>
```

### 2. "Pogledajte sve pogodnosti" (linija ~364)
Nađi: `<button className="bg-[#FF6B35] text-white px-10 py-4 rounded-full hover:bg-[#E55A28] transition text-lg font-semibold shadow-lg inline-flex items-center gap-2">`
  `Pogledajte sve pogodnosti <ArrowRight className="w-5 h-5" />`
`</button>`

Zameni sa:
```jsx
<Link to="/benefits">
  <button className="bg-[#FF6B35] text-white px-10 py-4 rounded-full hover:bg-[#E55A28] transition text-lg font-semibold shadow-lg inline-flex items-center gap-2">
    Pogledajte sve pogodnosti <ArrowRight className="w-5 h-5" />
  </button>
</Link>
```

### 3. "Kontaktiraj profesorku" (linija ~449)
Nađi: `<a href="#kontakt" className="bg-[#FF6B35] text-white px-8 py-3 rounded-full hover:bg-[#E55A28] transition text-center font-semibold shadow-lg">`

Zameni sa:
```jsx
<Link to="/contact" className="bg-[#FF6B35] text-white px-8 py-3 rounded-full hover:bg-[#E55A28] transition text-center font-semibold shadow-lg">
```

### 4. "Pogledaj video uvod" (linija ~457)
Nađi: `<a href="#kursevi"` - Ovo je već OK! ✅

### 5. "Zakažite razgovor" (linija ~607)
Nađi: `<button className="bg-white text-[#003366] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">`
  `Zakažite razgovor <ArrowRight className="w-5 h-5" />`
`</button>`

Zameni sa:
```jsx
<Link to="/contact">
  <button className="bg-white text-[#003366] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">
    Zakažite razgovor <ArrowRight className="w-5 h-5" />
  </button>
</Link>
```

### 6. "Saznajte više" (linija ~625)
Nađi: `<button className="bg-white text-[#FF6B35] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">`
  `Saznajte više <ArrowRight className="w-5 h-5" />`
`</button>`

Zameni sa:
```jsx
<Link to="/about">
  <button className="bg-white text-[#FF6B35] px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold shadow-lg inline-flex items-center gap-2">
    Saznajte više <ArrowRight className="w-5 h-5" />
  </button>
</Link>
```

### 7. Footer linkovi (linija ~680-695)

Nađi:
```jsx
<a href="#" className="hover:text-[#BFECC9] transition">
  Uslovi korišćenja
</a>
```

Zameni sa:
```jsx
<Link to="/terms" className="hover:text-[#BFECC9] transition">
  Uslovi korišćenja
</Link>
```

Nađi:
```jsx
<a href="#" className="hover:text-[#BFECC9] transition">
  Privatnost
</a>
```

Zameni sa:
```jsx
<Link to="/privacy" className="hover:text-[#BFECC9] transition">
  Privatnost
</Link>
```

Nađi:
```jsx
<a href="#" className="hover:text-[#BFECC9] transition">
  Kontakt
</a>
```

Zameni sa:
```jsx
<Link to="/contact" className="hover:text-[#BFECC9] transition">
  Kontakt
</Link>
```

---

## Dashboard → Vaš Panel

### DashboardPage.jsx
Nađi: `<h1 className="text-3xl font-bold text-secondary mb-8">Moj Dashboard</h1>`
Zameni: `<h1 className="text-3xl font-bold text-secondary mb-8">Vaš Panel</h1>`

Nađi: `<h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Dobrodošli, {user}!</h1>`
Zameni: `<h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">Dobrodošli!</h1>`

### Header.jsx
Nađi: `Dashboard` link tekst
Zameni: `Vaš Panel`

---

To je to! Brzo završavanje! 🚀
