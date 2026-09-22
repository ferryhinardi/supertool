import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Hashtag Generator',
  description:
    'Generate relevant hashtags for your social media posts. Get trending suggestions, niche-specific tags, and platform-optimized recommendations to boost your reach.',
  path: '/tools/productivity/hashtag-generator',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
