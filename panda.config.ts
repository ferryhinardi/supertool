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
          // Base semantic colors for dark theme
          background: { value: 'oklch(0.141 0.005 285.823)' }, // Very dark background
          foreground: { value: 'oklch(0.985 0 0)' }, // Very light text (white)
          card: { value: 'oklch(0.21 0.006 285.885)' }, // Dark card background
          'card-foreground': { value: 'oklch(0.985 0 0)' }, // Light card text
          popover: { value: 'oklch(0.21 0.006 285.885)' }, // Dark popover background
          'popover-foreground': { value: 'oklch(0.985 0 0)' }, // Light popover text
          primary: { value: 'oklch(0.21 0.006 285.885)' }, // Dark button background (swapped)
          'primary-foreground': { value: 'oklch(0.92 0.004 286.32)' }, // Light button text (swapped)
          secondary: { value: 'oklch(0.274 0.006 286.033)' }, // Slightly lighter dark
          'secondary-foreground': { value: 'oklch(0.985 0 0)' }, // Light text
          muted: { value: 'oklch(0.274 0.006 286.033)' }, // Muted background
          'muted-foreground': { value: 'oklch(0.705 0.015 286.067)' }, // Muted text (gray)
          accent: { value: 'oklch(0.274 0.006 286.033)' }, // Accent background
          'accent-foreground': { value: 'oklch(0.985 0 0)' }, // Accent text
          destructive: { value: 'oklch(0.704 0.191 22.216)' }, // Red/destructive color
          'destructive-foreground': { value: '#ffffff' }, // White text on destructive
          border: { value: 'oklch(1 0 0 / 10%)' }, // Subtle border
          input: { value: 'oklch(1 0 0 / 15%)' }, // Input border
          ring: { value: 'oklch(0.552 0.016 285.938)' }, // Focus ring

          // Gray scale for dark theme
          gray: {
            50: { value: '#fafafa' },
            100: { value: '#f5f5f5' },
            200: { value: '#e5e5e5' },
            300: { value: '#d4d4d4' },
            400: { value: '#a3a3a3' },
            500: { value: '#737373' },
            600: { value: '#525252' },
            700: { value: '#404040' },
            800: { value: '#262626' },
            900: { value: '#171717' },
            950: { value: '#0a0a0a' },
          },

          // Brand gradient colors
          purple: {
            300: { value: '#d8b4fe' },
            400: { value: '#c084fc' },
            500: { value: '#a855f7' },
            600: { value: '#9333ea' },
            700: { value: '#7e22ce' },
            800: { value: '#6b21a8' },
            900: { value: '#581c87' },
          },
          pink: {
            300: { value: '#f9a8d4' },
            400: { value: '#f472b6' },
            500: { value: '#ec4899' },
            600: { value: '#db2777' },
            700: { value: '#be185d' },
            800: { value: '#9f1239' },
          },
          blue: {
            300: { value: '#93c5fd' },
            400: { value: '#60a5fa' },
            500: { value: '#3b82f6' },
            600: { value: '#2563eb' },
            700: { value: '#1d4ed8' },
            800: { value: '#1e40af' },
          },
          cyan: {
            300: { value: '#67e8f9' },
            400: { value: '#22d3ee' },
            500: { value: '#06b6d4' },
            600: { value: '#0891b2' },
            700: { value: '#0e7490' },
          },
          emerald: {
            400: { value: '#34d399' },
            500: { value: '#10b981' },
            600: { value: '#059669' },
          },
          orange: {
            400: { value: '#fb923c' },
            500: { value: '#f97316' },
            600: { value: '#ea580c' },
            700: { value: '#c2410c' },
          },
          red: {
            400: { value: '#f87171' },
            500: { value: '#ef4444' },
            600: { value: '#dc2626' },
          },
          yellow: {
            300: { value: '#fde047' },
            400: { value: '#facc15' },
            500: { value: '#eab308' },
            600: { value: '#ca8a04' },
          },
          green: {
            400: { value: '#4ade80' },
            500: { value: '#22c55e' },
            600: { value: '#16a34a' },
          },
          teal: {
            400: { value: '#2dd4bf' },
            500: { value: '#14b8a6' },
            600: { value: '#0d9488' },
          },
          indigo: {
            400: { value: '#818cf8' },
            500: { value: '#6366f1' },
            600: { value: '#4f46e5' },
          },
          fuchsia: {
            400: { value: '#e879f9' },
            500: { value: '#d946ef' },
            600: { value: '#c026d3' },
          },
          rose: {
            400: { value: '#fb7185' },
            500: { value: '#f43f5e' },
            600: { value: '#e11d48' },
          },
        },
        spacing: {
          0: { value: '0' },
          1: { value: '0.25rem' },
          2: { value: '0.5rem' },
          3: { value: '0.75rem' },
          4: { value: '1rem' },
          5: { value: '1.25rem' },
          6: { value: '1.5rem' },
          7: { value: '1.75rem' },
          8: { value: '2rem' },
          9: { value: '2.25rem' },
          10: { value: '2.5rem' },
          11: { value: '2.75rem' },
          12: { value: '3rem' },
          14: { value: '3.5rem' },
          16: { value: '4rem' },
          20: { value: '5rem' },
          24: { value: '6rem' },
          28: { value: '7rem' },
          32: { value: '8rem' },
          36: { value: '9rem' },
          40: { value: '10rem' },
          44: { value: '11rem' },
          48: { value: '12rem' },
          52: { value: '13rem' },
          56: { value: '14rem' },
          60: { value: '15rem' },
          64: { value: '16rem' },
          72: { value: '18rem' },
          80: { value: '20rem' },
          96: { value: '24rem' },
        },
        fontSizes: {
          xs: { value: '0.75rem' },
          sm: { value: '0.875rem' },
          base: { value: '1rem' },
          lg: { value: '1.125rem' },
          xl: { value: '1.25rem' },
          '2xl': { value: '1.5rem' },
          '3xl': { value: '1.875rem' },
          '4xl': { value: '2.25rem' },
          '5xl': { value: '3rem' },
          '6xl': { value: '3.75rem' },
          '7xl': { value: '4.5rem' },
        },
        fontWeights: {
          normal: { value: '400' },
          medium: { value: '500' },
          semibold: { value: '600' },
          bold: { value: '700' },
          extrabold: { value: '800' },
        },
        lineHeights: {
          none: { value: '1' },
          tight: { value: '1.25' },
          snug: { value: '1.375' },
          normal: { value: '1.5' },
          relaxed: { value: '1.625' },
          loose: { value: '2' },
        },
        radii: {
          none: { value: '0' },
          sm: { value: '0.375rem' },
          md: { value: '0.5rem' },
          lg: { value: '0.625rem' },
          xl: { value: '0.75rem' },
          '2xl': { value: '1rem' },
          '3xl': { value: '1.5rem' },
          full: { value: '9999px' },
        },
        shadows: {
          sm: { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
          md: { value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
          lg: { value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
          xl: { value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
          '2xl': { value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
          'glass-sm': {
            value: '0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(59, 130, 246, 0.1)',
          },
          'glass-md': {
            value:
              '0 20px 25px -5px rgba(139, 92, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.15)',
          },
          'glass-lg': {
            value:
              '0 25px 30px -5px rgba(139, 92, 246, 0.2), 0 10px 15px -6px rgba(59, 130, 246, 0.2)',
          },
        },
        zIndex: {
          base: { value: '0' },
          dropdown: { value: '10' },
          sticky: { value: '20' },
          fixed: { value: '30' },
          'modal-backdrop': { value: '40' },
          modal: { value: '50' },
          popover: { value: '60' },
          tooltip: { value: '70' },
          toast: { value: '9999' },
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      recipes,
      // patterns, // Removed - patterns is not a valid theme property
    },
    // Breakpoints for responsive design
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
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
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        animationDuration: '0.01ms !important',
        animationIterationCount: '1 !important',
        transitionDuration: '0.01ms !important',
      },
    },
  },
})
