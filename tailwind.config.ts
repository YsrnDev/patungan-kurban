import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        'serif-display': ['var(--font-serif)'],
      },
      colors: {
        sand: '#f7f0e5',
        ember: '#9f3b2f',
        palm: '#3a6b54',
        pine: '#153629',
        ink: '#1d1d1b',
        gold: '#d6aa5f',
      },
      boxShadow: {
        soft: '0 22px 60px rgba(21, 54, 41, 0.10)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top left, rgba(214, 170, 95, 0.28), transparent 35%), radial-gradient(circle at bottom right, rgba(58, 107, 84, 0.18), transparent 30%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeUp: 'fadeUp 700ms ease-out both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
