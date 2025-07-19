/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "poker-dark": {
          50: "#f8f9fa",
          100: "#e9ecef",
          200: "#dee2e6",
          300: "#ced4da",
          400: "#adb5bd",
          500: "#6c757d",
          600: "#495057",
          700: "#343a40",
          800: "#212529",
          900: "#0f0f0f",
        },
        "poker-accent": {
          50: "#fef7ed",
          100: "#fedfc4",
          200: "#fdc689",
          300: "#fba94d",
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
        },
        "poker-green": {
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
        "poker-red": {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-light": "bounce 1s infinite",
        "card-deal": "cardDeal 0.5s ease-out",
        "chip-stack": "chipStack 0.3s ease-out",
        "card-flip": "cardFlip 0.6s ease-in-out",
        "pot-collect": "potCollect 1s ease-in-out",
      },
      keyframes: {
        cardDeal: {
          "0%": {
            transform: "translateY(-100px) rotate(-10deg)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0) rotate(0deg)",
            opacity: "1",
          },
        },
        chipStack: {
          "0%": {
            transform: "scale(0) rotate(180deg)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
        },
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        potCollect: {
          "0%": {
            transform: "scale(1) translate(0, 0)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.2) translate(0, -10px)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(0) translate(0, -50px)",
            opacity: "0",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "poker-felt":
          "radial-gradient(ellipse at center, #1a4d3a 0%, #0d2818 100%)",
        "card-back": "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
        "chip-gold":
          "linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)",
        "chip-silver":
          "linear-gradient(135deg, #c0c0c0 0%, #e5e5e5 50%, #c0c0c0 100%)",
        "chip-copper":
          "linear-gradient(135deg, #b87333 0%, #daa520 50%, #b87333 100%)",
      },
      boxShadow: {
        card: "0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15)",
        chip: "0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        table:
          "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        glow: "0 0 20px rgba(217, 119, 6, 0.5)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.5)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.5)",
      },
      fontFamily: {
        poker: ["Inter", "system-ui", "sans-serif"],
        cards: ["Georgia", "serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      backdropBlur: {
        xs: "2px",
      },
      aspectRatio: {
        card: "2.5 / 3.5",
        chip: "1 / 1",
      },
    },
  },
  plugins: [
    // Custom utilities for poker-specific styles
    function ({ addUtilities }) {
      const newUtilities = {
        ".table-felt": {
          background:
            "radial-gradient(ellipse at center, #1a4d3a 0%, #0d2818 100%)",
          position: "relative",
        },
        ".table-felt::before": {
          content: '""',
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background:
            "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
          opacity: "0.1",
          pointerEvents: "none",
        },
        ".playing-card": {
          aspectRatio: "2.5 / 3.5",
          borderRadius: "8px",
          background: "#f8f9fa",
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.24)",
          position: "relative",
          overflow: "hidden",
        },
        ".playing-card.face-down": {
          background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
        },
        ".playing-card.face-down::before": {
          content: '""',
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background:
            "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0px, rgba(255, 255, 255, 0.1) 2px, transparent 2px, transparent 4px)",
        },
        ".poker-chip": {
          borderRadius: "50%",
          position: "relative",
          boxShadow:
            "inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
        },
        ".poker-chip::before": {
          content: '""',
          position: "absolute",
          top: "10%",
          left: "10%",
          right: "10%",
          bottom: "10%",
          border: "2px dashed rgba(255, 255, 255, 0.3)",
          borderRadius: "50%",
        },
        ".btn-poker": {
          backgroundColor: "#d97706",
          color: "white",
          fontWeight: "500",
          padding: "0.5rem 1rem",
          borderRadius: "0.5rem",
          transition: "all 0.2s",
        },
        ".btn-poker:hover": {
          backgroundColor: "#b45309",
        },
        ".btn-poker:disabled": {
          backgroundColor: "#78350f",
          cursor: "not-allowed",
        },
        ".form-input": {
          backgroundColor: "#495057",
          border: "1px solid #b45309",
          borderRadius: "0.5rem",
          color: "white",
          transition: "all 0.2s",
        },
        ".form-input::placeholder": {
          color: "#adb5bd",
        },
        ".form-input:focus": {
          outline: "none",
          borderColor: "#d97706",
          boxShadow: "0 0 0 2px rgba(217, 119, 6, 0.5)",
        },
        ".modal-backdrop": {
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(4px)",
        },
        ".slider": {
          appearance: "none",
          background: "#495057",
          borderRadius: "0.5rem",
          height: "0.5rem",
        },
        ".slider::-webkit-slider-thumb": {
          appearance: "none",
          width: "1.25rem",
          height: "1.25rem",
          background: "#d97706",
          borderRadius: "50%",
          cursor: "pointer",
        },
        ".slider::-moz-range-thumb": {
          width: "1.25rem",
          height: "1.25rem",
          background: "#d97706",
          borderRadius: "50%",
          cursor: "pointer",
          border: "none",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
