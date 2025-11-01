import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Text Summarizer - AI-Powered Article and Document Summarization',
  description:
    'Summarize long articles, documents, and text with AI. Generate concise bullet points or paragraph summaries with adjustable length. Extract key highlights and main ideas instantly. Perfect for research, content analysis, and quick overviews.',
  keywords: [
    'text summarizer',
    'AI summarizer',
    'article summarizer',
    'document summarizer',
    'text summary generator',
    'AI text summary',
    'automatic summarization',
    'content summarizer',
    'summary generator',
    'bullet point summary',
    'paragraph summary',
    'key highlights extractor',
    'text analysis',
    'content analysis',
    'research tool',
    'AI text processor',
    'long form content',
    'quick summary',
  ],
  category: 'productivity',
  path: '/tools/text-summarizer',
})

export default function TextSummarizerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
