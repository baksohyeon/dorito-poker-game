/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "poker-green": "#10B981",
        brown: {
          600: "#92400E",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        deal: "dealCard 0.5s ease-out",
        "chip-flip": "chipFlip 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dealCard: {
          "0%": {
            transform: "translateY(-100px) rotate(180deg)",
            opacity: "0",
          },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        chipFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
