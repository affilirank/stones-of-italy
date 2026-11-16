import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#121212',
        alabaster: '#F8F7F4',
        gold: '#C5A059',
        'gold-hover': '#B08C45',
        slate: '#2A2A2A',
        'slate-light': '#3A3A3A'
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
};
export default config;
