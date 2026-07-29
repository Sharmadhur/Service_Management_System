/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f4',
          100: '#d5ebe3',
          200: '#a9d6c6',
          300: '#78bda6',
          400: '#4b9f86',
          500: '#2f8069',
          600: '#236552',
          700: '#1c5142',
          800: '#173f34',
          900: '#12312a',
        },
        accent: {
          400: '#e8a13f',
          500: '#d68a24',
          600: '#b56f18',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
