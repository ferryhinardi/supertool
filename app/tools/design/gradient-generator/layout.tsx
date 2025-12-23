import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'CSS Gradient Generator',
  description:
    'Free CSS gradient generator with live preview and code export. Create beautiful linear, radial, and conic gradients with custom colors and angles. Copy CSS code instantly for your web projects.',
  keywords: [
    'gradient generator',
    'css gradient',
    'color gradient',
    'gradient maker',
    'linear gradient',
    'radial gradient',
    'gradient tool',
    'css generator',
    'gradient creator',
    'color picker',
    'gradient designer',
    'css online',
  ],
  category: 'design',
  path: '/tools/gradient-generator',
})

export default function GradientGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
