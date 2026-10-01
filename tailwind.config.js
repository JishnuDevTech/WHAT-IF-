/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        void: '#080b11',
        panel: '#0e131c',
        line: '#222b3a',
        mist: '#8d98ab',
        stable: '#5fb3a1',
        warning: '#e0a458',
        critical: '#e0605e',
        recovery: '#6aa7e8',
      },
    },
  },
  plugins: [],
}
