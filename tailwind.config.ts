import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nebula: {
          blush: "#FFE5EC",
          lavender: "#E8E5FF",
          mint: "#DDF8EE",
          cream: "#FFF8E7",
          lilac: "#C9B6FF",
          plum: "#7A6FAE"
        }
      },
      boxShadow: {
        soft: "0 12px 32px rgba(122, 111, 174, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
