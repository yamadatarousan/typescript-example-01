/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwindが解析する対象パス
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
