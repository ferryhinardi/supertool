import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON to Markdown Table Converter - Format & Export',
  description:
    'Free online JSON to Markdown table converter. Convert JSON arrays to beautifully formatted Markdown tables instantly. Customize column headers, alignment, and formatting. Perfect for documentation, README files, and GitHub. Copy and download options available.',
  keywords: [
    'json to markdown',
    'markdown table generator',
    'json table converter',
    'markdown formatter',
    'json array to table',
    'documentation tool',
    'readme table generator',
    'github markdown',
    'markdown table alignment',
    'json converter',
    'table formatter',
    'markdown documentation',
    'json to table',
    'custom headers',
    'markdown export',
    'table generator',
    'documentation generator',
    'readme tool',
  ],
  category: 'productivity',
  path: '/tools/json-markdown-table',
})

export default function JSONToMarkdownTableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
