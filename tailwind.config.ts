import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0f172a",
        "surface-light": "#1e293b",
        "surface-border": "#334155",
        primary: {
          DEFAULT: "#f97316", // Flame orange
          hover: "#ea580c",
          glow: "rgba(249, 115, 22, 0.25)",
        },
        alert: {
          red: "#ef4444",
          orange: "#f97316",
          yellow: "#eab308",
          green: "#10b981",
          blue: "#06b6d4",
          purple: "#a855f7",
        },
        navy: {
          950: "#050811",
          900: "#0a0f1d",
          800: "#111827",
          700: "#1f2937",
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        radarScan: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-scan": "radarScan 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
