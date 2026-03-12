import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EDF4FA',
          100: '#D5E8F4',
          200: '#A8D0E8',
          300: '#6BB1D6',
          400: '#3A93C2',
          500: '#1A6FA0',
          600: '#0D3B5E',
          700: '#0A2E49',
          800: '#071F33',
          900: '#04121E',
        },
        accent: {
          500: '#2ECC71',
          600: '#27AE60',
        },
        warn: {
          500: '#F39C12',
          600: '#E67E22',
        },
        danger: {
          500: '#E74C3C',
          600: '#C0392B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      maxWidth: {
        calculator: '720px',
        content: '960px',
        page: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
