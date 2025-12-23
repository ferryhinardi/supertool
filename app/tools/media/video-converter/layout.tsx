import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Video Converter & Compressor',
  description:
    'Free online video converter to convert and compress videos. Convert between MP4, WebM, AVI, and more formats. Resize, compress, and optimize videos with custom quality settings. Privacy-focused processing.',
  keywords: [
    'video converter',
    'video compressor',
    'convert video',
    'compress video',
    'video format converter',
    'mp4 converter',
    'webm converter',
    'reduce video size',
    'video optimizer',
    'video encoder',
    'online video converter',
    'free video converter',
  ],
  category: 'media',
  path: '/tools/video-converter',
})

export default function VideoConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
