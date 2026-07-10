import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#faf9fa",
        surface: "#ffffff",
        "surface-low": "#f5f3f4",
        "surface-mid": "#efedee",
        "surface-high": "#e9e8e9",
        primary: "#3366cc",
        "primary-ink": "#001946",
        "primary-soft": "#d9e2ff",
        tertiary: "#6d5e00",
        "tertiary-soft": "#f9e37a",
        ink: "#1b1c1d",
        muted: "#434653",
        outline: "#c3c6d5",
        danger: "#ba1a1a",
        "danger-soft": "#ffdad6",
        success: "#087f5b",
        "success-soft": "#dcfce7",
        warning: "#a16207",
        "warning-soft": "#fef3c7"
      },
      fontFamily: {
        body: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        display: ["Georgia", "Noto Serif", "serif"],
        label: ["Segoe UI", "Inter", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 36px rgba(27, 28, 29, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
