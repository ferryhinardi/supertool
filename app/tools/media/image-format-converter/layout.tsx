import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Format Converter - Convert PNG, JPG, WEBP, GIF | Supertool',
  description:
    'Convert images between PNG, JPEG, WEBP, and GIF formats instantly. Adjust quality, preview results, compare file sizes, and download converted images. Free online image converter with no upload limits.',
  keywords: [
    'image format converter',
    'convert image format',
    'png to jpg',
    'jpg to png',
    'webp converter',
    'image converter',
    'convert png to jpeg',
    'convert jpg to webp',
    'image format changer',
    'png to webp',
    'jpeg to png',
    'gif converter',
    'image optimization',
    'compress image',
    'image quality adjuster',
    'batch image converter',
    'online image converter',
    'free image converter',
  ],
  openGraph: {
    title: 'Image Format Converter - Convert PNG, JPG, WEBP, GIF',
    description:
      'Convert images between formats instantly. Adjust quality, preview results, and compare file sizes. Free online tool.',
    type: 'website',
  },
}

export default function ImageFormatConverterLayout({ children }: { children: React.ReactNode }) {
  return children
}
