/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        alabaster: '#F6F5F0',
        sandline: '#E6E4DC',
        obsidian: '#0C0E12',
        charcoal: '#151921',
        slateborder: '#232936',
      },
      boxShadow: {
        bento: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 14px rgba(15, 23, 42, 0.04)',
        'bento-dark': '0 2px 10px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
