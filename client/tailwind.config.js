/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070b17',
        panel: '#101827',
        accent: '#8b5cf6',
        cyan: '#22d3ee',
        neon: '#38bdf8',
        success: '#34d399',
        warning: '#fbbf24',
      },
      boxShadow: {
        glow: '0 0 30px rgba(139, 92, 246, 0.35)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
