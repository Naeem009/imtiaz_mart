/**
 * Design tokens — source: docs/03_UI_UX_DESIGN_SYSTEM.md
 */
export const colors = {
  primary: "#0F172A",
  accent: "#2563EB",
  cta: "#F97316",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
} as const;

export const darkColors = {
  primary: "#F8FAFC",
  accent: "#3B82F6",
  cta: "#FB923C",
  success: "#22C55E",
  warning: "#FBBF24",
  error: "#EF4444",
  background: "#0F172A",
  surface: "#1E293B",
  border: "#334155",
  text: "#F8FAFC",
  muted: "#94A3B8",
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-inter), var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
} as const;

export const spacing = {
  section: "4rem",
  container: "1280px",
} as const;

export const radii = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;
