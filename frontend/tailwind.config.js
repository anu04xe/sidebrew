/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f6f2e8",
        paper: "#fbf8f1",
        ink: "#24211c",
        coffee: "#6f4f37",
        line: "#d7cbb7",
        success: "#5b7a5a",
        warning: "#b16a3d",
      },
      boxShadow: {
        sheet: "0 4px 24px rgba(51, 38, 25, 0.08)",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};
