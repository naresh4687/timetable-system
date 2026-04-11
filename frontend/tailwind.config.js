/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF3B3B',
          dark: '#E03030',
        },
        secondary: {
          DEFAULT: '#FF8C00',
          dark: '#E67E00',
        },
        dark: {
          DEFAULT: '#0F0F0F',
          surface: '#1A1A1A',
        }
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #FF3B3B 0%, #FF8C00 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow': 'glow 2s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 59, 59, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 59, 59, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
