/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — zingbus-style purple
        vbus: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Neutral surface scale
        dark: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(15,23,42,0.04), 0 1px 2px rgba(15,23,42,0.06)',
        'card': '0 4px 20px -2px rgba(15,23,42,0.08), 0 2px 8px -2px rgba(15,23,42,0.04)',
        'lift': '0 12px 32px -8px rgba(124,58,237,0.18), 0 4px 12px -4px rgba(15,23,42,0.08)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow':  'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float:   { '0%,100%': {transform:'translateY(0)'}, '50%': {transform:'translateY(-20px)'} },
        glow:    { from: {boxShadow:'0 0 20px rgba(139,92,246,0.3)'}, to: {boxShadow:'0 0 40px rgba(124,58,237,0.4)'} },
        slideUp: { from: {opacity:0,transform:'translateY(30px)'}, to: {opacity:1,transform:'translateY(0)'} },
        fadeIn:  { from: {opacity:0}, to: {opacity:1} },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #f8fafc 0%, #f5f3ff 45%, #f8fafc 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.03) 100%)',
        'blue-glow':     'radial-gradient(ellipse at center, rgba(139,92,246,0.18) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
