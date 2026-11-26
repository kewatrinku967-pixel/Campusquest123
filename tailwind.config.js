/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chaos: {
          dark: '#090a16',
          navy: '#0e1026',
          panel: '#151838',
          border: '#2a2f5a',
          purple: '#7c3aed',
          purpleLight: '#a855f7',
          pink: '#ec4899',
          pinkLight: '#f43f5e',
          yellow: '#facc15',
          cream: '#fffbeb',
          creamDark: '#fef3c7',
          neonGreen: '#10b981',
          cyan: '#06b6d4',
          badge: '#1e224d'
        }
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace', 'ui-monospace'],
        mono: ['"Courier Prime"', 'Courier', 'monospace', 'ui-monospace'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-purple': '0 0 25px -3px rgba(168, 85, 247, 0.45)',
        'glow-pink': '0 0 25px -3px rgba(236, 72, 153, 0.45)',
        'glow-yellow': '0 0 25px -3px rgba(250, 204, 21, 0.45)',
        'pixel-solid': '4px 4px 0px 0px rgba(0, 0, 0, 0.8)',
        'pixel-purple': '4px 4px 0px 0px #7c3aed',
        'pixel-pink': '4px 4px 0px 0px #ec4899',
        'pixel-yellow': '4px 4px 0px 0px #facc15',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 4s linear infinite',
        'bounce-subtle': 'bounce 2s infinite',
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
