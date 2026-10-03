import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accent2: "rgb(var(--accent2) / <alpha-value>)",
        warm: "rgb(var(--warm) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        cream: "#fdf3e7",
        creamDeep: "#f5e8d4",
        peach: "#ffd4b0",
        terracotta: "#e85a3c",
        hotPink: "#ff3d8b",
        pinkDeep: "#d92668",
        magenta: "#b8276f",
        plum: "#5a1535",
        mustard: "#e8b835",
        deepInk: "#1a0510",
        neonBg: "#050507",
        neonChar: "#14141a",
        neonPink: "#ff007a",
        neonCyan: "#00f0ff",
        neonAcid: "#d4ff00",
        bone: "#f0eee8",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-outfit)", "system-ui", "sans-serif"],
        fat: ["var(--font-bagel)", "cursive"],
        mono: ["var(--font-jetbrains)", "monospace"],
        unbounded: ["var(--font-unbounded)", "sans-serif"],
      },
      boxShadow: {
        pop: "4px 4px 0 rgb(var(--ink))",
        "pop-lg": "6px 6px 0 rgb(var(--ink))",
        "pop-xl": "8px 8px 0 rgb(var(--ink))",
        neon: "0 0 30px rgb(var(--accent) / 0.6)",
        "neon-lg": "0 0 60px rgb(var(--accent) / 0.4)",
      },
      borderRadius: {
        pop: "16px",
        "pop-lg": "24px",
        "pop-xl": "32px",
      },
      keyframes: {
        pulseDot: {
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
        },
        bounceY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
        },
        fall: {
          "0%": { opacity: "0", transform: "translateY(-50px) scale(0) rotate(0)" },
          "20%": { opacity: "1", transform: "translateY(0) scale(1.2) rotate(45deg)" },
          "100%": { opacity: "0", transform: "translateY(400px) scale(0.5) rotate(720deg)" },
        },
        shake: {
          "0%, 100%": { transform: "rotate(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "rotate(-12deg)" },
          "20%, 40%, 60%, 80%": { transform: "rotate(12deg)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 1.5s infinite",
        "bounce-y": "bounceY 1.5s infinite",
        wiggle: "wiggle 3s ease-in-out infinite",
        fall: "fall 2s ease-in forwards",
        shake: "shake 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
