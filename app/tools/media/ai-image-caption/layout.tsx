import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Image Caption Generator - Alt Text & SEO Descriptions',
  description:
    'Free AI-powered image caption generator. Generate descriptive alt text, SEO captions, and social media descriptions for images. Improve accessibility (WCAG), search rankings, and engagement with intelligent AI-generated image descriptions powered by OpenAI Vision.',
  keywords: [
    'ai image caption',
    'alt text generator',
    'image description generator',
    'ai alt text',
    'image caption ai',
    'accessibility alt text',
    'seo image description',
    'social media caption',
    'image accessibility',
    'wcag alt text',
    'ai image description',
    'automatic alt text',
    'image caption tool',
    'vision ai',
    'image to text',
  ],
  category: 'media',
  path: '/tools/ai-image-caption',
})

export default function AIImageCaptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
