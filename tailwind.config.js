/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F3801C",
        dark: "#131417",
      },
      fontFamily: {
        Poppins_400Regular: ["Poppins_400Regular"],
        Poppins_500Medium: ["Poppins_500Medium"],
        Poppins_600SemiBold: ["Poppins_600SemiBold"],
        Poppins_700Bold: ["Poppins_700Bold"],
      },
    },
  },
  plugins: [],
};
