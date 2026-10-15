export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#203b3a",
        forest: "#397d73",
        sage: "#dcefeb",
        cream: "#f4faf9",
        coral: "#5b9baa",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 36px rgba(24, 54, 45, .07)",
      },
    },
  },
  plugins: [],
};
