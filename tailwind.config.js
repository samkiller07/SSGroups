/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aquarium: {
          dark: '#020b14',
          deep: '#061527',
          surface: '#0b233f',
          border: '#153e6b',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          accent: '#38bdf8',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        kirubai: {
          dark: '#0c0704',
          deep: '#1c1009',
          surface: '#2d1a0e',
          border: '#4a2b16',
          orange: '#ea580c',
          amber: '#f59e0b',
          emerald: '#10b981',
          accent: '#fb923c',
          text: '#fdf4ec',
          muted: '#d6b8a2',
        },
        vision: {
          dark: '#040711',
          deep: '#0a1020',
          surface: '#121d33',
          border: '#1e3052',
          blue: '#2563eb',
          sky: '#38bdf8',
          indigo: '#4f46e5',
          accent: '#60a5fa',
          text: '#f3f4f6',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-jakarta)', 'sans-serif'],
      },
      animation: {
        'wave-slow': 'wave 8s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
