import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0a0e1a',
        'bg-surface': '#111827',
        'bg-card': '#1a2236',
        'bg-elevated': '#1f2b3d',
        'felt-green': '#0d4b2e',
        'felt-dark': '#0a3822',
        primary: '#00e5ff',
        'primary-dim': '#0097a7',
        profit: '#00ff87',
        'profit-dim': '#00c853',
        loss: '#ff1744',
        'loss-dim': '#d50000',
        warning: '#ffab00',
        'text-primary': '#e8eaf6',
        'text-secondary': '#90a4ae',
        'text-muted': '#546e7a',
        'text-inverse': '#0a0e1a',
        'suit-spades': '#e8eaf6',
        'suit-hearts': '#ff1744',
        'suit-diamonds': '#2979ff',
        'suit-clubs': '#00c853',
        border: '#263238',
        'border-light': '#37474f',
      },
      boxShadow: {
        'neon-cyan': '0 0 15px 0 rgba(0, 229, 255, 0.4)',
        'neon-green': '0 0 15px 0 rgba(0, 255, 135, 0.4)',
        'neon-red': '0 0 15px 0 rgba(255, 23, 68, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;
