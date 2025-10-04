/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        indigo: {
          500: '#6366f1',
          400: '#818cf8',
        },
      },
      boxShadow: {
        soft: '0 25px 50px -12px rgba(15, 23, 42, 0.45)',
        glow: '0 0 0 3px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
