
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "SF Pro", "system-ui", ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
          gradientFrom: "#3b82f6",
          gradientTo: "#2563eb",
        },
        background: {
          DEFAULT: "#111827",
          surface: "#1f2937",
          input: "#374151",
          elevated: "#283548",
        },
        border: {
          light: "#4b5563",
          DEFAULT: "#374151",
          dark: "#1f2937",
        },
        text: {
          primary: "#ffffff",
          secondary: "#d1d5db",
          tertiary: "#9ca3af",
          disabled: "#6b7280",
        },
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#0ea5e9",
        },
        accent: {
          DEFAULT: "#60a5fa",
        },
        card: {
          DEFAULT: "#1f2937",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        round: "100px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "flux-gradient": "linear-gradient(135deg, hsl(272 91% 65%) 0%, hsl(195 95% 45%) 100%)",
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
