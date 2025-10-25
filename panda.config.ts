import { defineConfig } from '@pandacss/dev'
import { recipes } from './panda.recipes'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: 'styled-system',

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          // Base colors from globals.css
          background: { value: 'oklch(0.141 0.005 285.823)' },
          foreground: { value: 'oklch(0.985 0 0)' },
          card: { value: 'oklch(0.21 0.006 285.885)' },
          'card-foreground': { value: 'oklch(0.985 0 0)' },
          popover: { value: 'oklch(0.21 0.006 285.885)' },
          'popover-foreground': { value: 'oklch(0.985 0 0)' },
          primary: { value: 'oklch(0.92 0.004 286.32)' },
          'primary-foreground': { value: 'oklch(0.21 0.006 285.885)' },
          secondary: { value: 'oklch(0.274 0.006 286.033)' },
          'secondary-foreground': { value: 'oklch(0.985 0 0)' },
          muted: { value: 'oklch(0.274 0.006 286.033)' },
          'muted-foreground': { value: 'oklch(0.705 0.015 286.067)' },
          accent: { value: 'oklch(0.274 0.006 286.033)' },
          'accent-foreground': { value: 'oklch(0.985 0 0)' },
          destructive: { value: 'oklch(0.704 0.191 22.216)' },
          border: { value: 'oklch(1 0 0 / 10%)' },
          input: { value: 'oklch(1 0 0 / 15%)' },
          ring: { value: 'oklch(0.552 0.016 285.938)' },

          // Gradient colors
          purple: {
            500: { value: '#a855f7' },
            600: { value: '#9333ea' },
            700: { value: '#7e22ce' },
          },
          pink: {
            500: { value: '#ec4899' },
            600: { value: '#db2777' },
          },
          blue: {
            500: { value: '#3b82f6' },
            600: { value: '#2563eb' },
          },
          cyan: {
            500: { value: '#06b6d4' },
          },
          emerald: {
            500: { value: '#10b981' },
          },
          orange: {
            500: { value: '#f97316' },
          },
          red: {
            500: { value: '#ef4444' },
          },
          yellow: {
            500: { value: '#eab308' },
          },
          green: {
            500: { value: '#22c55e' },
          },
          teal: {
            500: { value: '#14b8a6' },
          },
          indigo: {
            500: { value: '#6366f1' },
          },
          fuchsia: {
            500: { value: '#d946ef' },
          },
          rose: {
            500: { value: '#f43f5e' },
          },
        },
        radii: {
          sm: { value: 'calc(0.625rem - 4px)' },
          md: { value: 'calc(0.625rem - 2px)' },
          lg: { value: '0.625rem' },
          xl: { value: 'calc(0.625rem + 4px)' },
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-rotate': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' },
        },
      },
      recipes,
    },
  },

  // Conditions for responsive and interactive styles
  conditions: {
    extend: {
      dark: '.dark &',
      light: '.light &',
    },
  },

  // Global CSS
  globalCss: {
    '*': {
      borderColor: 'border',
      outlineColor: 'ring',
      outlineWidth: '1px',
      outlineOffset: '2px',
    },
    body: {
      bg: 'background',
      color: 'foreground',
    },
    a: {
      textDecoration: 'none !important',
      _hover: {
        textDecoration: 'none !important',
      },
    },
  },
})
