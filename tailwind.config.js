/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        // Vos couleurs personnalisées
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
        },
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['var(--font-primary)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'section': 'var(--spacing-section)',
        'container': 'var(--spacing-container)',
      },
      borderRadius: {
        'card': 'var(--radius-card)',
        'button': 'var(--radius-button)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'hover': 'var(--shadow-hover)',
      },
    },
  },
  plugins: [],
}