/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Your original vibrant color palette
        discord: {
          // Backgrounds - Rich Blues
          dark: '#1a2332',
          darker: '#1e2936',
          darkest: '#0f1419',
          hover: '#253142',
          input: '#1a2332',
          
          // Text
          primary: '#ffffff',
          secondary: '#d1d5db',
          muted: '#9ca3af',
          timestamp: '#9ca3af',
          
          // Accents - Your Gold/Orange
          gold: '#f59e0b',
          goldHover: '#eab308',
          mention: '#f59e0b',
          link: '#f59e0b',
          
          // Borders - Gold tinted
          border: 'rgba(245, 158, 11, 0.2)',
          divider: 'rgba(245, 158, 11, 0.15)',
        },
      },
    },
  },
  plugins: [],
};
