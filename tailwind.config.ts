/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./html", "./src/**/*.{html,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6b8afd",
        secondary: "#2e333d",
        dark: "#212328",
        danger: "#eb3330",
        success: "#4aac68",
        chat: "#006654",
      },
    },
  },
  plugins: [],
};
