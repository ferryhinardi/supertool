import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/data/metadata'

export const metadata: Metadata = {
  title: 'Placeholder Image Generator - Custom Mockup Images | Supertool',
  description:
    'Generate custom placeholder images with custom dimensions, colors, and text overlay. Perfect for mockups, prototypes, wireframes, and design work. Download as SVG or PNG with 30+ preset sizes.',
  keywords: [
    'placeholder image generator',
    'image placeholder',
    'mockup image',
    'placeholder creator',
    'design placeholder',
    'dummy image',
    'placeholder maker',
    'image mockup tool',
    'svg placeholder',
    'png placeholder',
    'custom dimensions',
    'prototype images',
    'wireframe placeholder',
    'placeholder with text',
    'custom background color',
    'social media placeholder',
    'web design mockup',
    'ad banner placeholder',
  ],
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: 'https://supertool.id/tools/design/placeholder-generator',
    title: 'Placeholder Image Generator - Custom Mockup Images',
    description:
      'Generate custom placeholder images with custom dimensions, colors, and text. Download as SVG or PNG. Perfect for mockups and prototypes.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://supertool.id/tools/design/placeholder-generator',
  },
}

export default function PlaceholderGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
