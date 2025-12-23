import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Keyword Density Analyzer - SEO Content Optimization Tool',
  description:
    'Free keyword density analyzer for SEO optimization. Analyze keyword frequency, track density percentage, identify keyword stuffing, and get SEO recommendations. Track single words, two-word phrases, and three-word phrases in your content.',
  keywords: [
    'keyword density',
    'keyword density analyzer',
    'seo analyzer',
    'keyword frequency',
    'content optimization',
    'seo tool',
    'keyword tracking',
    'keyword stuffing checker',
    'seo content tool',
    'keyword counter',
    'phrase analyzer',
    'content seo checker',
  ],
  category: 'productivity',
  path: '/tools/keyword-density',
})

export default function KeywordDensityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
