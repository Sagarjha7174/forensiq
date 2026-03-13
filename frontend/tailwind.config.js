/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#0EA5A4',
        accent: '#F59E0B',
        page: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-dark': '#1E293B',
        ink: '#0F172A',
        'ink-dark': '#FFFFFF'
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['Source Sans 3', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 14px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 10px 24px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
