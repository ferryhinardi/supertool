import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Meme Generator - Create Custom Memes Online',
  description:
    'Free online meme generator. Upload images or choose from popular templates. Add customizable text, adjust fonts, colors, and positions. Download high-quality memes for social media sharing.',
  keywords: [
    'meme generator',
    'meme maker',
    'create meme online',
    'meme creator',
    'custom meme',
    'meme template',
    'image meme generator',
    'funny meme maker',
    'meme editor',
    'add text to image',
    'social media meme',
    'free meme generator',
  ],
  category: 'media',
  path: '/tools/media/meme-generator',
})

export default function MemeGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
