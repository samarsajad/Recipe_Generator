/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        cardForeground: "var(--card-foreground)",
        primary: "var(--primary)",
        primaryForeground: "var(--primary-foreground)",
        secondary: "var(--secondary)",
        secondaryForeground: "var(--secondary-foreground)",
        accent: "var(--accent)",
        accentForeground: "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
    },
  },
  plugins: [],
};
