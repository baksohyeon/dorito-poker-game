/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        poker: {
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#bbf7d0",
            300: "#86efac",
            400: "#4ade80",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
          },
          red: {
            500: "#ef4444",
            600: "#dc2626",
            700: "#b91c1c",
          },
          gold: {
            400: "#facc15",
            500: "#eab308",
            600: "#ca8a04",
          },
          accent: {
            300: "#fbbf24",
            400: "#f59e0b", 
            500: "#d97706",
            600: "#b45309",
            700: "#92400e",
            800: "#78350f",
          },
          dark: {
            800: "#1f2937",
            900: "#111827",
          },
        },
        card: {
          red: "#dc2626",
          black: "#1f2937",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "card-deal": "cardDeal 0.6s ease-out",
        "chip-move": "chipMove 0.8s ease-in-out",
        "pot-win": "potWin 1.2s ease-in-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        cardDeal: {
          "0%": {
            transform: "translateY(-100px) rotate(180deg)",
            opacity: "0",
          },
          "100%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
        },
        chipMove: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1) translateY(-10px)" },
          "100%": { transform: "scale(1)" },
        },
        potWin: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.2)", opacity: "0.8" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        card: "0 4px 8px rgba(0, 0, 0, 0.3)",
        chip: "0 2px 4px rgba(0, 0, 0, 0.4)",
        table: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
