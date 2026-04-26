/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
      },
      colors: {
        brand: {
          50: "#e8faf4",
          100: "#c3f0e1",
          500: "#0ea47a",
          600: "#0a7a5b",
          900: "#065c44",
        },
      },
    },
  },
  plugins: [],
};