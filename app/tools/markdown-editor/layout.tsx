import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Markdown Editor & Live Preview',
  description:
    'Free online markdown editor with live preview, syntax highlighting, and export options. Write and preview markdown in real-time with support for GitHub-flavored markdown, tables, and code blocks.',
  keywords: [
    'markdown editor',
    'markdown preview',
    'markdown live',
    'md editor',
    'markdown converter',
    'github markdown',
    'markdown to html',
    'markdown formatter',
    'markdown parser',
    'readme editor',
    'markdown writer',
    'online markdown',
  ],
  category: 'development',
  path: '/tools/markdown-editor',
})

export default function MarkdownEditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
