import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: [
          "var(--font-fraunces)",
          "Fraunces",
          "GT Sectra",
          "Georgia",
          "serif",
        ],
        serif: [
          "var(--font-fraunces)",
          "Fraunces",
          "Georgia",
          "Cambria",
          "serif",
        ],
        arabic: ["var(--font-amiri)", "Amiri", "Kitab", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ink: {
          900: "#0E0E0D",
          850: "#111111",
          800: "#1A1A1A",
          750: "#1F1F1E",
          700: "#26241F",
          600: "#3A2E1F",
          500: "#4A4438",
        },
        parchment: {
          100: "#F4EFE6",
          300: "#A9A39A",
          500: "#6E6862",
        },
        gold: {
          300: "#D9B768",
          400: "#C8A24B",
          500: "#B8923A",
        },
        olive: "#7A8B6B",
        terracotta: "#A24B3A",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "12px",
        "3xl": "16px",
        full: "9999px",
      },
      letterSpacing: {
        display: "-0.015em",
        eyebrow: "0.1em",
      },
      maxWidth: {
        measure: "68ch",
        narrow: "860px",
        wide: "1200px",
      },
      boxShadow: {
        lift: "0 16px 48px -12px rgba(0,0,0,.75)",
        "inset-pressed":
          "inset 0 1px 0 rgba(255,255,255,.04), inset 0 -1px 0 rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
