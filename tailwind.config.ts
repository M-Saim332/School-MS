import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#ffffff",
        "surface-low": "#f8fafc",
        "surface-mid": "#f1f5f9",
        "surface-high": "#e2e8f0",
        primary: "#2563eb",
        "primary-ink": "#1e40af",
        "primary-soft": "#eff6ff",
        tertiary: "#475569",
        "tertiary-soft": "#f8fafc",
        accent: "#06b6d4",
        "accent-soft": "#ecfeff",
        ink: "#0f172a",
        muted: "#64748b",
        outline: "#e2e8f0",
        danger: "#ef4444",
        "danger-soft": "#fef2f2",
        success: "#22c55e",
        "success-soft": "#dcfce7",
        warning: "#f59e0b",
        "warning-soft": "#fffbeb",
        info: "#06b6d4",
        "info-soft": "#ecfeff"
      },
      fontFamily: {
        body: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        display: ["Inter", "Segoe UI", "Arial", "sans-serif"],
        label: ["Inter", "Segoe UI", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
        lift: "0 16px 40px rgba(15, 23, 42, 0.08)",
        button: "0 10px 22px rgba(37, 99, 235, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
