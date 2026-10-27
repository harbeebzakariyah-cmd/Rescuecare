
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rescue: {
          50: "#fff1f2",
          500: "#e11d48",
          600: "#be123c",
          700: "#9f1239",
        },
      },
    },
  },
  plugins: [],
};
