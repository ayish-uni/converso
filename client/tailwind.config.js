/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        converso: {
          purple: "var(--converso-purple, #7C3AED)",
          accent: "var(--converso-gold, #F5C86C)",
          gold: "var(--converso-gold, #F5C86C)",
          cyan: "var(--converso-cyan, #06B6D4)",
          night: "var(--converso-night, #020617)",
          surface: "var(--surface, #111827)",
          bubble: "var(--bubble, #1F2937)",
          text: "var(--converso-text, #E7EDF8)",
          subtext: "var(--converso-subtext, #94A3B8)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(158, 176, 255, 0.16), 0 18px 42px rgba(90, 110, 180, 0.18)",
        soft: "0 24px 80px rgba(0,0,0,0.42)",
      },
      backgroundImage: {
        "converso-gradient": "var(--converso-gradient)",
        "converso-light":
          "radial-gradient(circle at 18% 22%, rgba(124,58,237,0.14), transparent 24%), radial-gradient(circle at 80% 78%, rgba(6,182,212,0.12), transparent 24%)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        floaty: "floaty 5s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
