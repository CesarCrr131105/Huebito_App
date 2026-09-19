/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Libre Baskerville"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#E27D19',
        'on-primary': '#FFFFFF',
      },
      borderRadius: {
        sm: '20px',
        lg: '30px',
      },
    },
  },
  plugins: [],
}