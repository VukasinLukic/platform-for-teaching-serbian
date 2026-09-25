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
      fontFamily: {
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Lora Variable"', 'Lora', 'Georgia', '"Times New Roman"', 'serif'],
        serif: ['"Lora Variable"', 'Lora', 'Georgia', '"Times New Roman"', 'serif'],
      },
      colors: {
        // Brand palette — the single source of truth for colors.
        brand: {
          50: "#FDF3F3",
          100: "#FBE5E5",
          200: "#F7CBCB",
          300: "#F0A3A3",
          400: "#E56B6B",
          500: "#DC4343",
          600: "#D62828",
          DEFAULT: "#D62828",
          700: "#B91F1F",
          800: "#961B1B",
          900: "#781A1A",
          950: "#420A0A",
        },
        ink: {
          50: "#F6F6F6",
          100: "#E7E7E7",
          200: "#D1D1D1",
          300: "#B0B0B0",
          400: "#888888",
          500: "#6D6D6D",
          600: "#5D5D5D",
          700: "#4F4F4F",
          800: "#2D2D2D",
          900: "#1A1A1A",
          DEFAULT: "#1A1A1A",
        },
        gold: {
          50: "#FEFAEC",
          100: "#FDF1C8",
          200: "#FAE38F",
          300: "#F6D66A",
          400: "#F2C94C",
          DEFAULT: "#F2C94C",
          500: "#E3B12F",
          600: "#C68E1C",
          700: "#9E6A17",
          800: "#82541A",
        },
        paper: {
          50: "#FFFDF9",
          DEFAULT: "#FDFAF5",
          100: "#FBF6EE",
          200: "#F5EFE4",
          300: "#EAE1D1",
        },
        surface: "#F7F7F7",
        success: { 50: "#ECFDF3", 100: "#D1FADF", 200: "#A6F4C5", 500: "#1F9D55", DEFAULT: "#1F9D55", 600: "#18864A", 700: "#136C3C" },
        warning: { 50: "#FFF7EB", 100: "#FEEBC8", 500: "#E07B00", DEFAULT: "#E07B00", 600: "#C26A00", 700: "#9A5400" },
        danger: { 50: "#FDF3F3", 100: "#FBE5E5", 500: "#DC4343", DEFAULT: "#B91F1F", 600: "#B91F1F", 700: "#961B1B" },
        info: { 50: "#EFF6FA", 100: "#DCEAF3", 400: "#669BBC", 500: "#4F86A8", DEFAULT: "#3F7394", 600: "#3F7394", 700: "#2F5A76", 900: "#0F2F4F", 950: "#08213A" },
        viber: "#7360F2",
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
      maxWidth: {
        prose: "68ch",
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,26,26,0.04), 0 4px 16px -4px rgba(26,26,26,0.08)",
        lift: "0 2px 4px rgba(26,26,26,0.04), 0 16px 40px -12px rgba(26,26,26,0.18)",
        brand: "0 8px 24px -8px rgba(214,40,40,0.45)",
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
          from: {
            opacity: "0",
            transform: "translateY(60px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideUp: {
          from: {
            opacity: "0",
            transform: "translateY(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleIn: {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        // Layout/navigation motion (unique names so they never clash with index.css classes)
        "overlay-fade": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "drawer-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "dropdown-in": {
          from: { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "layer-rise": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "testimonial-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration) linear infinite",
        "fade-in": "fadeIn 1s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "overlay-fade": "overlay-fade 0.25s ease-out",
        "drawer-in-right": "drawer-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "dropdown-in": "dropdown-in 0.16s ease-out",
        "layer-rise": "layer-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "testimonial-marquee": "testimonial-marquee 60s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
