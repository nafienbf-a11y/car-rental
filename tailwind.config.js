/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#dc2626',
          blue: '#2563eb',
        },
        theme: {
          DEFAULT: 'var(--border-main)',
          primary: 'var(--text-main)',
          secondary: 'var(--text-muted)',
          tertiary: 'var(--text-light)',
          bg: 'var(--bg-app)',
          sidebar: 'var(--bg-sidebar)',
          topbar: 'var(--bg-topbar)',
          card: 'var(--bg-card)',
          subcard: 'var(--bg-subcard)',
          popover: 'var(--bg-popover)',
          input: 'var(--bg-input)',
          border: 'var(--border-main)',
          'border-muted': 'var(--border-muted)',
        },
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        danger: {
          500: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
