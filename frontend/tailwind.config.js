/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        deep: '#312E81',
        accent: '#22D3EE',
        surface: '#0F172A',
        'surface-dark': '#020617',
        page: '#f8fafc',
        ink: '#1E293B',
        'ink-dark': '#E2E8F0'
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        glow: '0 18px 45px rgba(15,23,42,0.18)',
        'glow-strong': '0 18px 48px rgba(99,102,241,0.28)',
        'glow-purple': '0 18px 48px rgba(139,92,246,0.28)'
      }
    }
  },
  plugins: []
};
