import type { Config } from "tailwindcss";

/**
 * PawPal theme — sunny, high-energy, joyful.
 * Brand palette:
 *   sunny  #FFEB3B  (yellow)
 *   teal   #00D4C5  (aqua)
 *   coral  #FF6B9D  (pink-coral)
 *   grass  #4CAF50 / #8BC34A (lush greens)
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sunny: {
          DEFAULT: "#FFEB3B",
          light: "#FFF59D",
          dark: "#FBC02D",
        },
        teal: {
          DEFAULT: "#00D4C5",
          light: "#7FFFF4",
          dark: "#00A99D",
        },
        coral: {
          DEFAULT: "#FF6B9D",
          light: "#FFB0CC",
          dark: "#E84B82",
        },
        grass: {
          DEFAULT: "#4CAF50",
          light: "#8BC34A",
          dark: "#388E3C",
        },
        cream: "#FFFDF5",
        ink: "#2D2A45",
      },
      fontFamily: {
        // Friendly, rounded system stack — no webfont needed (keeps it free + fast).
        display: ["var(--font-fredoka)", "Fredoka", "system-ui", "sans-serif"],
        sans: ["var(--font-nunito)", "Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        pop: "0 10px 0 0 rgba(0,0,0,0.08)",
        glow: "0 0 30px -5px rgba(0,212,197,0.55)",
        coral: "0 12px 30px -8px rgba(255,107,157,0.6)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12%)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "tail-wag": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-12deg)" },
          "75%": { transform: "rotate(12deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.6s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1.4s ease-in-out infinite",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        float: "float 4s ease-in-out infinite",
        "tail-wag": "tail-wag 0.5s ease-in-out infinite",
      },
      backgroundImage: {
        "sunny-sky":
          "linear-gradient(160deg, #FFF59D 0%, #7FFFF4 55%, #FFB0CC 100%)",
        "joy-mesh":
          "radial-gradient(at 20% 20%, #FFF59D 0px, transparent 50%), radial-gradient(at 80% 0%, #7FFFF4 0px, transparent 50%), radial-gradient(at 80% 90%, #FFB0CC 0px, transparent 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
