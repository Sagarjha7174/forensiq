/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f2744',
        secondary: '#1e3a5f',
        accent: '#4f46e5',
        page: '#f1f5f9'
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 45px rgba(15,39,68,0.15)'
      }
    }
  },
  plugins: []
};
