import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 圈子/群组名牌的渐变色是从 lib/badge.ts 拼装的,
  // 即便 content 路径包含了 lib,部分构建链路下 JIT 仍可能漏扫,
  // 这里把这一组动态类显式列入,作为最稳的兜底。
  safelist: [
    { pattern: /(from|to)-(indigo|violet|fuchsia|rose|amber|emerald|cyan|sky|slate|orange)-(400|500|600|700)/ },
    { pattern: /ring-(indigo|violet|fuchsia|rose|amber|emerald|cyan|sky|slate|orange)-500\/30/ },
    { pattern: /bg-(indigo|violet|fuchsia|rose|amber|emerald|cyan|sky|slate|orange)-500\/10/ },
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

