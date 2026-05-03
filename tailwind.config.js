/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0A0908',
        surface: '#141210',
        paper: '#F2EBD9',
        ink: '#1A1510',
        primary: '#8B6F47',
        accent: '#C4973A',
        text: '#EDE8DF',
        muted: '#9A8F82',
        red: '#7A2020',
        border: '#2A2520',
      },
    },
  },
  plugins: [],
}
