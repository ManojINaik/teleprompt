/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.1)",
        ring: "rgba(255, 255, 255, 0.3)",
        background: "rgba(0, 0, 0, 0.5)",
        foreground: "rgba(255, 255, 255, 0.9)",
        primary: {
          DEFAULT: "rgba(59, 130, 246, 0.7)",
          foreground: "rgba(255, 255, 255, 0.9)",
        },
        secondary: {
          DEFAULT: "rgba(107, 114, 128, 0.7)",
          foreground: "rgba(255, 255, 255, 0.9)",
        },
        destructive: {
          DEFAULT: "rgba(239, 68, 68, 0.7)",
          foreground: "rgba(255, 255, 255, 0.9)",
        },
        accent: {
          DEFAULT: "rgba(55, 65, 81, 0.5)",
          foreground: "rgba(255, 255, 255, 0.9)",
        },
        card: {
          DEFAULT: "rgba(30, 41, 59, 0.7)",
          foreground: "rgba(255, 255, 255, 0.9)",
        },
        muted: {
          DEFAULT: "rgba(75, 85, 99, 0.5)", 
          foreground: "rgba(209, 213, 219, 0.8)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}
