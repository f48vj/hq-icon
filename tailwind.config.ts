import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
      backgroundImage: {
        'grid-glow':
          'radial-gradient(circle at top left, rgba(56, 189, 248, 0.25), transparent 55%), radial-gradient(circle at bottom right, rgba(129, 140, 248, 0.25), transparent 55%)',
      },
    },
  },
  plugins: [],
};

export default config;
