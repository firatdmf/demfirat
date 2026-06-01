import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--bel-paper)',
        ink: 'var(--bel-ink)',
        accent: 'var(--bel-accent)',
        sage: 'var(--bel-sage)',
      },
      fontFamily: {
        display: ['var(--bel-font-display)'],
        body: ['var(--bel-font-body)'],
        mono: ['var(--bel-font-mono)'],
      },
    },
  },
  plugins: [],
};
export default config;
