/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neural Elegance Color Palette
        neural: {
          dark: '#0A0E1A',
          darker: '#060810',
          light: '#1A1F2E',
          accent: '#4A5568',
        },
        electric: {
          blue: '#3B82F6',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          pink: '#EC4899',
        },
        glow: {
          blue: 'rgba(59, 130, 246, 0.5)',
          cyan: 'rgba(6, 182, 212, 0.5)',
          purple: 'rgba(139, 92, 246, 0.5)',
        },
        surface: {
          primary: '#111827',
          secondary: '#1F2937',
          tertiary: '#374151',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#E5E7EB',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neural': '0 0 20px rgba(59, 130, 246, 0.3)',
        'neural-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'glow': '0 0 10px rgba(139, 92, 246, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { opacity: '0.5' },
          'to': { opacity: '1' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}