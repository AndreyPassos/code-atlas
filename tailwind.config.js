/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // 'class' (not 'media') so the Design System showcase can offer a manual
  // light/dark switch per the test's recommendation — NativeWind's
  // useColorScheme().setColorScheme() requires this mode to work at all.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: withOpacity('--color-background'),
        surface: {
          DEFAULT: withOpacity('--color-surface'),
          hover: withOpacity('--color-surface-hover'),
        },
        text: {
          DEFAULT: withOpacity('--color-text'),
          secondary: withOpacity('--color-text-secondary'),
          tertiary: withOpacity('--color-text-tertiary'),
        },
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          hover: withOpacity('--color-primary-hover'),
        },
        error: {
          DEFAULT: withOpacity('--color-error'),
          hover: withOpacity('--color-error-hover'),
        },
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        border: {
          DEFAULT: withOpacity('--color-border'),
          hover: withOpacity('--color-border-hover'),
        },
        skeleton: {
          DEFAULT: withOpacity('--color-skeleton'),
          highlight: withOpacity('--color-skeleton-highlight'),
        },
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        xxxl: '48px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '20px',
        xxl: '24px',
        xxxl: '32px',
      },
      height: {
        sm: '32px',
        md: '44px',
        lg: '56px',
      },
    },
  },
  plugins: [],
};
