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
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dfe3ea",
          300: "#c2c9d6",
          400: "#98a2b6",
          500: "#707c93",
          600: "#566075",
          700: "#414a5c",
          800: "#2c3341",
          900: "#161c28",
        },
        accent: {
          50: "#f0f2ff",
          100: "#e2e6ff",
          200: "#c6cdff",
          300: "#9fa9fb",
          400: "#7582f2",
          500: "#5361e6",
          600: "#3b5bdb",
          700: "#3149b8",
          800: "#2a3d93",
          900: "#263474",
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
