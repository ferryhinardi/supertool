import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Free Background Remover - Remove Image Background Online',
  description:
    'Remove background from images instantly and for free. AI-powered background remover that works 100% in your browser. No upload needed, complete privacy. Perfect for product photos, portraits, logos, and more.',
  keywords: [
    'background remover',
    'remove background',
    'remove bg',
    'background eraser',
    'transparent background',
    'remove image background',
    'background remover free',
    'remove background from image',
    'photo background remover',
    'cut out background',
    'erase background',
    'background removal tool',
    'transparent png maker',
    'product photo background',
    'portrait background remover',
  ],
  category: 'media',
  path: '/tools/media/background-remover',
  ogTitle: 'Free AI Background Remover - Remove Image Background Instantly',
  ogDescription:
    'Remove backgrounds from images in seconds with our free AI-powered tool. Works entirely in your browser for complete privacy. No sign-up required.',
})

export default function BackgroundRemoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
