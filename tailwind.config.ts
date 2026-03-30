import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "serene-bg": "#0f1115",
        "serene-slate": "#1e2229",
        "serene-ochre": "#d4a373",
        "serene-sage": "#93a8ac",
        "serene-text": "#d1d5db",
        "serene-muted": "#6b7280",
        "serene-border": "#2d343f"
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"]
      },
      boxShadow: {
        serene: "0 24px 80px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
