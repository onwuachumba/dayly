import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2420",
        muted: "#5B6660",
        primary: "#1E4D3B",
        primaryHover: "#143527",
        gold: "#D9A441",
        golddeep: "#C98F2D",
        ivory: "#FAF7F0",
        cream: "#F5F1E8",
        pine: {
          50: "#EAF1EC",
          100: "#DCE7DF",
          200: "#C4D6C8",
          700: "#1E4D3B",
          900: "#143527",
        },
      },
    },
  },
  plugins: [],
};

export default config;
