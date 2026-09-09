/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream:        "#F6F0E7",
        paper:        "#FFFDF9",
        latte:        "#E9D8C5",
        beige:        "#D5BCA5",
        caramel:      "#B97950",
        espresso:     "#4A3026",
        roast:        "#2B1B16",
        sage:         "#7D9077",
        "sage-light": "#DDE4D7",
        terra:        "#B7654D",
        "terra-light":"#F0D9D1",
        // legacy aliases
        ivory:   "#F6F0E7",
        paper2:  "#FFFDF9",
        ink:     "#4A3026",
        coffee:  "#B97950",
        line:    "#E9D8C5",
        success: "#7D9077",
        warning: "#B7654D",
        oat:     "#D5BCA5",
      },
      boxShadow: {
        sheet:       "0 2px 20px rgba(43, 27, 22, 0.07), 0 1px 3px rgba(43, 27, 22, 0.05)",
        card:        "0 1px 3px rgba(43, 27, 22, 0.06)",
        "card-hover":"0 3px 14px rgba(43, 27, 22, 0.11)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};
