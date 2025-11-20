/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#BFECC9',      // svetlo zelena
        secondary: '#003366',    // tamno plava/petrol
        accent: '#1E5E8B',       // dodatna plava nijansa
      },
    },
  },
  plugins: [],
}
