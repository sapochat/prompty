
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
        // Editorial typography pairing
        display: ["Crimson Pro", "Georgia", ...fontFamily.serif],
        sans: ["DM Sans", "system-ui", ...fontFamily.sans],
      },
      colors: {
        // Warm editorial palette
        primary: {
          DEFAULT: "#d4a574", // Warm amber/gold
          light: "#e8c9a8",
          dark: "#b8895a",
          muted: "rgba(212, 165, 116, 0.15)",
        },
        background: {
          DEFAULT: "#141414", // Rich charcoal
          surface: "#1c1c1c",
          elevated: "#242424",
          card: "#1a1a1a",
        },
        foreground: {
          DEFAULT: "#f5f0e8", // Warm cream
          muted: "#a8a29e",
          subtle: "#78716c",
        },
        border: {
          DEFAULT: "rgba(245, 240, 232, 0.08)",
          light: "rgba(245, 240, 232, 0.12)",
          accent: "rgba(212, 165, 116, 0.25)",
        },
        accent: {
          DEFAULT: "#d4a574",
          warm: "#e8c9a8",
          cream: "#f5f0e8",
        },
        destructive: {
          DEFAULT: "#c45c5c",
          foreground: "#f5f0e8",
        },
        muted: {
          DEFAULT: "#292524",
          foreground: "#a8a29e",
        },
        card: {
          DEFAULT: "#1a1a1a",
          foreground: "#f5f0e8",
        },
        popover: {
          DEFAULT: "#1c1c1c",
          foreground: "#f5f0e8",
        },
        input: "#242424",
        ring: "#d4a574",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        "editorial": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        "editorial-lg": "0 4px 16px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)",
        "editorial-xl": "0 8px 32px rgba(0,0,0,0.25), 0 4px 8px rgba(0,0,0,0.15)",
        "warm-glow": "0 0 24px rgba(212, 165, 116, 0.15)",
        "inner-glow": "inset 0 1px 0 rgba(245, 240, 232, 0.05)",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-slow": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-slow": "fade-in-slow 0.6s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#a8a29e",
            "--tw-prose-headings": "#f5f0e8",
          },
        },
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
