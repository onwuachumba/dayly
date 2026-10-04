import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        muted: "#334155",
        primary: "#4F46E5",
        primaryHover: "#4338CA",
      },
    },
  },
  plugins: [],
};

export default config;
