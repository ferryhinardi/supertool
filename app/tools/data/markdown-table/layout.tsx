import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Markdown Table Generator - Create & Edit Tables Visually | SuperTool',
  description:
    'Create and edit Markdown tables visually. Import from CSV or JSON, customize column alignment, and export to Markdown, HTML, JSON, or CSV formats. Free online tool.',
  keywords: [
    'markdown table generator',
    'markdown table editor',
    'csv to markdown',
    'json to markdown table',
    'table alignment',
    'github markdown table',
  ],
  openGraph: {
    title: 'Markdown Table Generator - Visual Table Editor',
    description:
      'Create beautiful Markdown tables visually. Import CSV/JSON, customize alignment, export to multiple formats.',
    type: 'website',
  },
}

export default function MarkdownTableLayout({ children }: { children: React.ReactNode }) {
  return children
}
