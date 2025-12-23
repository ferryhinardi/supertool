import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Color Contrast Checker - WCAG 2.1 Accessibility Compliance',
  description:
    'Free WCAG 2.1 color contrast checker for accessibility compliance. Test foreground and background color combinations, check AA/AAA ratings, and ensure your designs are readable for everyone. Includes live preview and contrast ratio calculator.',
  keywords: [
    'color contrast checker',
    'WCAG compliance',
    'accessibility checker',
    'contrast ratio calculator',
    'WCAG 2.1',
    'AA compliance',
    'AAA compliance',
    'color accessibility',
    'text contrast',
    'web accessibility',
    'a11y tool',
    'color picker',
  ],
  category: 'design',
  path: '/tools/color-contrast',
})

export default function ColorContrastLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
