/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #0f2b48)',
          hover: 'var(--color-primary-hover, #091b2e)',
          active: 'var(--color-primary-active, #050f1a)',
          light: 'var(--color-primary-light, #1b4975)',
          soft: 'var(--color-primary-soft, #eef4f9)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #c5a059)',
          hover: 'var(--color-secondary-hover, #a68442)',
          active: 'var(--color-secondary-active, #8e6f33)',
          light: 'var(--color-secondary-light, #dfbf7f)',
          soft: 'var(--color-secondary-soft, #fbf7ee)',
        },
        brand: {
          bg: 'var(--color-background, #fdfbf7)',
          surface: 'var(--color-surface, #ffffff)',
          hover: 'var(--color-hover, #a68442)',
          active: 'var(--color-active, #8e6f33)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
