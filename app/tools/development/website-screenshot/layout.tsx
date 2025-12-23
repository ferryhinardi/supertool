import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Website Screenshot Tool',
  description:
    'Free online website screenshot tool to capture full-page screenshots of any URL. Generate high-resolution screenshots with custom viewport sizes. Fast, reliable, and no registration required.',
  keywords: [
    'website screenshot',
    'screenshot tool',
    'capture website',
    'full page screenshot',
    'web screenshot',
    'url to image',
    'screenshot generator',
    'website preview',
    'screenshot online',
    'capture webpage',
    'web capture',
    'site screenshot',
  ],
  category: 'utilities',
  path: '/tools/website-screenshot',
})

export default function WebsiteScreenshotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
