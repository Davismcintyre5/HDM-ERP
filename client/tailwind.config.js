/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        secondary: {
          DEFAULT: '#1E3A5F',
          50: '#E8EDF2',
          100: '#C5D3E2',
          200: '#9FB6CF',
          300: '#7999BC',
          400: '#5D83AB',
          500: '#416D9A',
          600: '#1E3A5F',
          700: '#1A2F4D',
          800: '#15243B',
          900: '#101929',
        },
      },
    },
  },
  plugins: [],
};