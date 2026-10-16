/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3', 900: '#1e1b4b' },
      },
      fontFamily: { sans: ['Noto Sans', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'] },
      fontSize: { xs: ['0.8125rem', { lineHeight: '1.25rem' }] },
    },
  },
  plugins: [],
};
