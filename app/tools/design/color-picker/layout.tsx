import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Color Picker & Palette Generator - HEX, RGB, HSL Converter',
  description:
    'Free color picker and palette generator with instant format conversion. Pick colors, generate complementary, analogous, triadic, and monochromatic palettes. Convert between HEX, RGB, HSL, and HSV formats. Check WCAG contrast ratios for accessibility.',
  keywords: [
    'color picker',
    'palette generator',
    'color converter',
    'hex to rgb',
    'rgb to hsl',
    'color scheme generator',
    'complementary colors',
    'analogous colors',
    'triadic colors',
    'monochromatic palette',
    'color formats',
    'wcag contrast',
    'color tool',
    'hex color picker',
  ],
  category: 'design',
  path: '/tools/color-picker',
})

export default function ColorPickerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
