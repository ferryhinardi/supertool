import type { Metadata } from 'next'

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
    title: 'Placeholder Image Generator - Custom Mockup Images',
    description:
      'Generate custom placeholder images with custom dimensions, colors, and text. Download as SVG or PNG. Perfect for mockups and prototypes.',
    type: 'website',
  },
}

export default function PlaceholderGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
