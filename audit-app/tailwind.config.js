/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- 1. ADD THIS LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}