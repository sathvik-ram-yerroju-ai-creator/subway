/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-cyan': '#00f0ff',
        'cyber-magenta': '#ff007f',
        'cyber-yellow': '#ffe600',
        'cyber-gold': '#ffbe0b',
        'cyber-red': '#ff2255',
        'cyber-dark': '#030509',
        'cyber-panel': 'rgba(7, 12, 22, 0.85)',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        tech: ['Chakra Petch', 'monospace', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

