/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#4F46E5',
        deep: '#312E81',
        accent: '#8B5CF6',
        page: '#f8fafc',
        ink: '#1E293B',
        'ink-dark': '#E2E8F0'
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        glow: '0 20px 45px rgba(99,102,241,0.18)',
        'glow-strong': '0 10px 30px rgba(99,102,241,0.35)',
        'glow-purple': '0 10px 30px rgba(139,92,246,0.35)'
      }
    }
  },
  plugins: []
};
