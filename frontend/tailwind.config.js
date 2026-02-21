/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
