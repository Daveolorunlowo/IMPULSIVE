import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#000000', // Pure Black
        'alabaster': '#FFFFFF', // Pure White (for text)
        'stone': '#1A1A1A', // Very dark gray for subtle contrast
        'bloodred': '#800000', // Maroon (Dull Red)
        'gold': '#5C0000', // Dark Maroon
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"], // Kept as fallback
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
