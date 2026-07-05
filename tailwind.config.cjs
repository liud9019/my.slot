/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: "#F4F1FB",
          10: "#E8E1F6",
          100: "#E8E1F6",
          200: "#D2C4ED",
          300: "#B59FE0",
          400: "#9277CD",
          500: "#6B4FBB",
          600: "#5A40A8",
          700: "#4A3385",
          800: "#3E2C6E",
          900: "#2A1D4A",
          950: "#1B1133",
        },
        gold: {
          50: "#FBF7EC",
          100: "#F5ECCF",
          400: "#D9B978",
          500: "#C9A961",
          600: "#A88845",
        },
        cream: {
          50: "#FAF8F5",
          100: "#F5F1EB",
          200: "#ECE7F1",
          300: "#E0D9E8",
        },
        ink: {
          900: "#1F1A2E",
          700: "#3D3654",
          500: "#6B6280",
          400: "#8B82A3",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: "12px",
        '2xl': "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(62,44,110,0.06)",
        'card-hover': "0 4px 12px rgba(62,44,110,0.10)",
        brand: "0 6px 16px rgba(107,79,187,0.25)",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'check-pop': 'checkPop 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkPop: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
