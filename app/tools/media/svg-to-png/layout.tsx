import type { Metadata } from 'next'

const title = 'SVG to PNG Converter - Free Online SVG to PNG Image Converter'
const description =
  'Convert SVG files to PNG images online for free. High-quality conversion with customizable dimensions, background colors, and quality settings. Perfect for web graphics, logos, and icons.'

const keywords = [
  'svg to png',
  'svg to png converter',
  'convert svg to png',
  'svg converter',
  'png converter',
  'image converter',
  'vector to raster',
  'svg export',
  'png export',
  'logo converter',
  'icon converter',
  'web graphics',
  'free svg converter',
  'online svg converter',
  'svg to image',
  'vector converter',
  'graphic converter',
  'transparent png',
]

export const metadata: Metadata = {
  title,
  description,
  keywords,
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function SvgToPngLayout({ children }: { children: React.ReactNode }) {
  return children
}
