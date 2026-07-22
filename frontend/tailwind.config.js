/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // Angular Material ya trae su propio reset (vía mat.core()). El preflight de
  // Tailwind pisa estilos base de botones/tipografía dentro de componentes
  // mat-*, así que lo desactivamos y dejamos que Material controle su propio
  // reset; las utilidades de Tailwind se usan solo para layout/spacing.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'oklch(0.5 0.15 255)',
          dark: 'oklch(0.32 0.09 255)',
          darker: 'oklch(0.24 0.08 258)',
          bg: 'oklch(0.93 0.03 258)',
          hover: 'oklch(0.4 0.15 255)',
        },
        ink: {
          primary: 'oklch(0.2 0.01 250)',
          secondary: 'oklch(0.5 0.01 250)',
          soft: 'oklch(0.45 0.01 250)',
          muted: 'oklch(0.55 0.01 250)',
        },
        line: {
          DEFAULT: 'oklch(0.92 0.005 250)',
          light: 'oklch(0.94 0.003 250)',
          input: 'oklch(0.85 0.005 250)',
        },
        surface: {
          page: 'oklch(0.97 0.003 250)',
          login: 'oklch(0.98 0.003 250)',
          hover: 'oklch(0.94 0.01 250)',
        },
        success: {
          bg: 'oklch(0.92 0.06 155)',
          text: 'oklch(0.4 0.1 155)',
        },
        warning: {
          bg: 'oklch(0.93 0.08 85)',
          text: 'oklch(0.55 0.13 75)',
        },
        danger: {
          DEFAULT: 'oklch(0.55 0.2 25)',
          bg: 'oklch(0.95 0.04 25)',
          strong: 'oklch(0.5 0.15 25)',
          'strong-bg': 'oklch(0.93 0.08 25)',
        },
      },
      backgroundImage: {
        'login-side': 'linear-gradient(160deg, oklch(0.32 0.09 255), oklch(0.24 0.08 258))',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
