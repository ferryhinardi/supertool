/**
 * SuperTool design tokens.
 *
 * Source of truth for the Website Revamp palette (Figma Make).
 * Panda semantic colors in `panda.config.ts` read these values so
 * shared UI (buttons, cards, inputs) and feature pages stay in sync.
 */

export const palette = {
  canvas: '#07090e',
  sidebar: '#0b0d13',
  surface: '#11141d',
  surfaceRaised: '#161a25',
  line: '#222735',
  lineSoft: '#1a1f2b',
  ink: '#f7f8fb',
  muted: '#9ea6b7',
  dim: '#70798d',
  violet: '#8b6cff',
  violetBright: '#a894ff',
  violetSoft: '#211b3d',
  violetDeep: '#6652ef',
  mint: '#4ee0ae',
  rose: '#fa7198',
  amber: '#f8bc67',
  cyan: '#5ed6eb',
  blue: '#6ba5ff',
  pink: '#d883ff',
  lime: '#a5dc69',
  white: '#ffffff',
} as const

export const accents = {
  violet: { color: palette.violetBright, background: 'rgba(139, 108, 255, 0.12)' },
  blue: { color: palette.blue, background: 'rgba(107, 165, 255, 0.11)' },
  mint: { color: palette.mint, background: 'rgba(78, 224, 174, 0.1)' },
  amber: { color: palette.amber, background: 'rgba(248, 188, 103, 0.1)' },
  rose: { color: palette.rose, background: 'rgba(250, 113, 152, 0.1)' },
  cyan: { color: palette.cyan, background: 'rgba(94, 214, 235, 0.1)' },
  pink: { color: palette.pink, background: 'rgba(216, 131, 255, 0.1)' },
  lime: { color: palette.lime, background: 'rgba(165, 220, 105, 0.1)' },
  orange: { color: '#fb923c', background: 'rgba(251, 146, 60, 0.12)' },
  emerald: { color: '#34d399', background: 'rgba(52, 211, 153, 0.12)' },
} as const

export type AccentName = keyof typeof accents

export const categoryAccents: Record<string, AccentName> = {
  data: 'violet',
  development: 'blue',
  media: 'mint',
  productivity: 'cyan',
  security: 'amber',
  finance: 'lime',
  design: 'pink',
  all: 'violet',
}

export const fontFamilies = {
  sans: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
  display: 'var(--font-manrope), Manrope, ui-sans-serif, system-ui, sans-serif',
  mono: 'var(--font-dm-mono), "DM Mono", ui-monospace, monospace',
} as const

export const elevation = {
  brandGlow: '0 0 26px rgba(139, 108, 255, 0.28)',
  search: '0 14px 40px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(139, 108, 255, 0.04)',
  searchFocus: '0 14px 40px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(139, 108, 255, 0.11)',
  cardHover: '0 16px 35px rgba(0, 0, 0, 0.2)',
  window: '0 30px 90px rgba(0, 0, 0, 0.48), 0 0 70px rgba(96, 69, 215, 0.08)',
  button: '0 8px 25px rgba(139, 108, 255, 0.2)',
} as const

export function accentForCategory(category: string): AccentName {
  return categoryAccents[category] ?? 'violet'
}
