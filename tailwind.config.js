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
        },
        // Ghibli-inspired colors
        ghibli: {
          forest: '#2D5016',
          sky: '#87CEEB',
          earth: '#8B7355',
          water: '#4682B4',
          fire: '#FF6347',
          wind: '#E0E5E5',
          spirit: '#DDA0DD',
          moss: '#698B69',
          sunset: '#FFA07A',
          moonlight: '#F0F8FF',
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
        'wind-sway': 'windSway 4s ease-in-out infinite',
        'leaf-fall': 'leafFall 6s linear infinite',
        'spirit-float': 'spiritFloat 5s ease-in-out infinite',
        'ember-rise': 'emberRise 4s ease-out infinite',
        'water-ripple': 'waterRipple 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'mist-drift': 'mistDrift 8s ease-in-out infinite',
        'card-hover': 'cardHover 0.6s ease-out',
        'nature-pulse': 'naturePulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { opacity: '0.5' },
          'to': { opacity: '1' },
        },
        windSway: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(5px) rotate(2deg)' },
          '75%': { transform: 'translateX(-5px) rotate(-2deg)' },
        },
        leafFall: {
          '0%': { transform: 'translateY(-20px) translateX(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) translateX(100px) rotate(360deg)', opacity: '0' },
        },
        spiritFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0.7' },
          '33%': { transform: 'translateY(-30px) translateX(20px) scale(1.1)', opacity: '1' },
          '66%': { transform: 'translateY(-10px) translateX(-20px) scale(0.95)', opacity: '0.8' },
        },
        emberRise: {
          '0%': { transform: 'translateY(100px) scale(0)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: '0' },
        },
        waterRipple: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.2)', opacity: '0.3' },
        },
        twinkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '1' },
        },
        mistDrift: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateX(30px) translateY(-20px)', opacity: '0.6' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '100%': { transform: 'translateY(-5px) rotateX(5deg) rotateY(5deg)' },
        },
        naturePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}