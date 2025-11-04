/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4C52BF",
          50: "#E0E0FF",
          100: "#BFC2FF",
          200: "#3338A6",
          300: "#181B90",
        },
        secondary: {
          DEFAULT: "#33A853",
        },
        background: {
          light: "#FFFFFF",
          dark: "#1B1B1F",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
          200: "#E4E1EC",
          300: "#777680",
          400: "#46464F",
        },
      },
      fontFamily: {
        pthin: ["System", "sans-serif"],
        pextralight: ["System", "sans-serif"],
        plight: ["System", "sans-serif"],
        pregular: ["System", "sans-serif"],
        pmedium: ["System", "sans-serif"],
        psemibold: ["System", "sans-serif"],
        pbold: ["System", "sans-serif"],
        pextrabold: ["System", "sans-serif"],
        pblack: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};


