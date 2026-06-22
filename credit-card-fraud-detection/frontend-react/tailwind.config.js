/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 Crucial: This scans everything inside the src/ folder recursively
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}