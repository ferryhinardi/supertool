import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Image Optimizer & Compressor',
  description:
    'Free online image optimizer to compress and resize images. Reduce file size without losing quality. Supports JPG, PNG, WebP, and AVIF with batch processing. Fast, secure, and privacy-focused.',
  keywords: [
    'image optimizer',
    'image compressor',
    'compress image',
    'resize image',
    'reduce image size',
    'image converter',
    'optimize image',
    'image compression',
    'photo optimizer',
    'webp converter',
    'bulk image resize',
    'image quality',
  ],
  category: 'media',
  path: '/tools/image-optimizer',
})

export default function ImageOptimizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
