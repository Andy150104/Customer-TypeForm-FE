/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        "1/5": "20%",
        "2/5": "40%",
        "1/3": "33.333%",
        "1/4": "25%",
      },
      screens: {
        xs: "400px",
        // tên tuỳ bạn, ở đây dùng 'xxl'
        xxl: "2200px",
      },
    },
  },
  plugins: [],
};
