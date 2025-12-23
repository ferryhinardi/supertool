import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Clipboard Formatter',
  description:
    'Free online clipboard formatter for text formatting. Automatically format pasted text, remove extra whitespace, fix line breaks, convert tabs to spaces, and apply case transformations. Fast, instant, and privacy-focused text cleanup.',
  keywords: [
    'clipboard formatter',
    'text formatter',
    'whitespace remover',
    'line break fixer',
    'tab to space converter',
    'case transformer',
    'text cleanup',
    'format text online',
    'paste formatter',
    'text normalizer',
    'remove whitespace',
    'trim lines',
    'clipboard tool',
    'text transformation',
  ],
  category: 'productivity',
  path: '/tools/clipboard-formatter',
})

export default function ClipboardFormatterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
