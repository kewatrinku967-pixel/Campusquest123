/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        detective: {
          dark: '#08090d',
          card: '#11141e',
          panel: '#161b26',
          border: '#232b3d',
          gold: '#f59e0b',
          amber: '#d97706',
          crimson: '#ef4444',
          neon: '#10b981',
          cyan: '#06b6d4',
          badge: '#1e293b'
        }
      },
      fontFamily: {
        mono: ['"Courier Prime"', 'Courier', 'monospace', 'ui-monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
