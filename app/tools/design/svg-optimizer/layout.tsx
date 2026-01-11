import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'SVG Optimizer - Compress & Clean SVG Files',
  description:
    'Free online SVG optimizer and compressor. Reduce SVG file sizes by up to 90% while maintaining quality. Remove metadata, optimize paths, clean up code, and minify SVG files for faster websites.',
  keywords: [
    'svg optimizer',
    'svg compressor',
    'svg minifier',
    'optimize svg',
    'compress svg',
    'reduce svg size',
    'svg cleaner',
    'svg file optimizer',
    'svgo online',
    'svg minify',
    'svg compression tool',
    'web optimization',
  ],
  category: 'design',
  path: '/tools/design/svg-optimizer',
})

export default function SVGOptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
