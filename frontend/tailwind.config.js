/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custech-maroon': '#591F00', // Deep maroon from the portal
        'custech-gold': '#F4A300',   // Golden orange from the logo
      }
    },
  },
  plugins: [],
}