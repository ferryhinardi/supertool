import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'URL Shortener & Link Management',
  description:
    'Free URL shortener with custom aliases and analytics. Create short links, track clicks, and manage your shortened URLs. Fast, secure, and privacy-focused link shortener with detailed statistics.',
  keywords: [
    'url shortener',
    'link shortener',
    'short url',
    'shorten link',
    'tiny url',
    'url redirect',
    'link management',
    'short link',
    'custom url',
    'link analytics',
    'url tracker',
    'link statistics',
  ],
  category: 'utilities',
  path: '/tools/url-shortener',
})

export default function URLShortenerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
