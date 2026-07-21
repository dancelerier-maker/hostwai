import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF8",
        surface: "#FFFFFF",
        line: "#EBEAE5",
        ink: "#14120F",
        inkSoft: "#75726A",
        coral: "#2E5EFF",
        amber: "#6C4DFF",
        emerald: "#16A34A",
        emeraldSoft: "#EAF7EE",
      },
      keyframes: {
        ringExpand: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
      animation: {
        ringExpand: "ringExpand 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
