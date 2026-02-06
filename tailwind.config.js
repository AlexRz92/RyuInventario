/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FAF7ED',
          100: '#F5EEDB',
          200: '#EBDDB7',
          300: '#E1CC93',
          400: '#D7BB6F',
          500: '#D4AF37',
          600: '#B8952A',
          700: '#8A6F1F',
          800: '#5C4A15',
          900: '#2E250A',
        },
      },
    },
  },
  plugins: [],
};
