import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Word Counter Pro - Free Online Text Statistics Tool | SuperTool',
  description:
    'Free online word counter and character counter tool. Count words, characters, sentences, paragraphs. Get reading time estimates, keyword density analysis, and detailed text statistics instantly.',
  keywords: [
    'word counter',
    'character counter',
    'text counter',
    'word count',
    'character count',
    'reading time calculator',
    'keyword density',
    'text statistics',
    'sentence counter',
    'paragraph counter',
    'text analysis',
    'writing tool',
  ],
  openGraph: {
    title: 'Word Counter Pro - Free Online Text Statistics Tool',
    description:
      'Count words, characters, sentences, paragraphs. Get reading time estimates and keyword density analysis instantly.',
    type: 'website',
  },
}

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  return children
}
