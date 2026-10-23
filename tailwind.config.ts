import type { Config } from "tailwindcss";

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
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e2",
          300: "#b0b8c7",
          400: "#8591a8",
          500: "#66728c",
          600: "#515b73",
          700: "#424a5e",
          800: "#39404f",
          900: "#0f172a",
        },
        accent: {
          50: "#eef4ff",
          100: "#dce7ff",
          200: "#bed2ff",
          300: "#91b3ff",
          400: "#5d89fc",
          500: "#3b66f6",
          600: "#2549eb",
          700: "#1d38d8",
          800: "#1e30af",
          900: "#1e2f8a",
        },
      },
      typography: {},
      maxWidth: {
        content: "78rem",
      },
    },
  },
  plugins: [],
};

export default config;
