/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3498db',
          200: '#66b3d9',
        },
        accent: {
          500: '#f1c40f',
          700: '#f39c12',
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}