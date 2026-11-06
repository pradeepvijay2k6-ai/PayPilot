/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: 'var(--color-dark-950, #070A12)',
          900: 'var(--color-dark-900, #0B101E)',
          850: 'var(--color-dark-850, #0F172A)',
          800: 'var(--color-dark-800, #141E34)',
          750: 'var(--color-dark-750, #1A2642)',
          700: 'var(--color-dark-700, #223254)',
          600: 'var(--color-dark-600, #334155)',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
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
        accent: {
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
