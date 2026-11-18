import type { Config } from "tailwindcss";

/**
 * Design tokens for the "modern research tool" visual system.
 *
 * `ink` is the structural graphite ramp and `accent` is the indigo used for
 * actions and links. On top of those two, event classes get five muted hues
 * defined as CSS custom properties in globals.css (`[data-type]`), along with
 * a small blue / violet / amber palette for the direction axis. Class colour
 * lives in the card frame and metadata only; evidence strength and source
 * tier stay achromatic so a hue never reads as a reliability verdict.
 *
 * Keeping the `ink` / `accent` names stable means existing components pick up
 * the new values without a rename across 30 files.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f7f6f0",
        sheet: "#fefdfa",
        ink: {
          50: "#f4f2eb",
          100: "#eae7df",
          200: "#dad7cd",
          300: "#c0beb6",
          400: "#7b808c",
          500: "#626976",
          600: "#535b6a",
          700: "#414a5b",
          800: "#2b3449",
          900: "#182036",
        },
        accent: {
          50: "#eef2fc",
          100: "#e0e8fb",
          200: "#c5d2f4",
          300: "#a4b8ed",
          400: "#748fda",
          500: "#4a67c2",
          600: "#2949aa",
          700: "#233d88",
          800: "#20336d",
          900: "#172650",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      maxWidth: {
        content: "78rem",
        prose: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
