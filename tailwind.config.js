/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tertiary-fixed-dim": "#f4b6c6",
        "surface-tint": "#486549",
        "secondary": "#455f87",
        "tertiary": "#7f4e5c",
        "on-secondary-fixed-variant": "#2d486d",
        "tertiary-fixed": "#ffd9e1",
        "secondary-fixed": "#d5e3ff",
        "on-secondary": "#ffffff",
        "inverse-on-surface": "#f0f1f2",
        "secondary-container": "#b5d0fd",
        "on-error": "#ffffff",
        "surface-container-high": "#e7e8e9",
        "surface-dim": "#d9dadb",
        "surface-container-highest": "#e1e3e4",
        "on-primary-fixed-variant": "#314d33",
        "surface-variant": "#e1e3e4",
        "on-tertiary": "#ffffff",
        "on-surface": "#191c1d",
        "on-secondary-fixed": "#001c3b",
        "surface-bright": "#f8f9fa",
        "primary-container": "#5e7c5e",
        "on-primary-container": "#f7fff2",
        "secondary-fixed-dim": "#adc8f5",
        "inverse-surface": "#2e3132",
        "inverse-primary": "#aecfac",
        "surface-container": "#edeeef",
        "surface": "#f8f9fa",
        "on-tertiary-fixed-variant": "#673947",
        "primary-fixed-dim": "#aecfac",
        "primary": "#466347",
        "background": "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#c2c8be",
        "error-container": "#ffdad6",
        "primary-fixed": "#caebc7",
        "on-primary-fixed": "#05210a",
        "on-error-container": "#93000a",
        "outline": "#737970",
        "on-secondary-container": "#3e5980",
        "tertiary-container": "#9a6674",
        "on-primary": "#ffffff",
        "on-tertiary-fixed": "#330f1c",
        "surface-container-low": "#f3f4f5",
        "error": "#ba1a1a",
        "on-tertiary-container": "#fffbff",
        "on-background": "#191c1d",
        "on-surface-variant": "#424841"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "12px",
        "xl": "16px",
        "full": "9999px"
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        manrope: ["Manrope", "sans-serif"]
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
