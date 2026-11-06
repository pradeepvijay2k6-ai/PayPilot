/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        paypal: {
          blue: '#003087',
          lightBlue: '#0079C1',
          gold: '#FFC439',
        },
        navy: {
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155'
        }
      }
    },
  },
  plugins: [],
}
