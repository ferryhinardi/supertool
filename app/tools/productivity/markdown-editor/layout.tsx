import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Markdown Editor & Live Preview')

const faqs = [
  {
    question: 'What is Markdown and why should I use it?',
    answer:
      "Markdown is a lightweight markup language that uses plain text formatting to create structured documents. It's widely used for README files, documentation, blog posts, and technical writing because it's easy to read, write, and convert to HTML. Markdown allows you to focus on content while maintaining formatting consistency.",
  },
  {
    question: 'Does this editor support GitHub-flavored Markdown (GFM)?',
    answer:
      'Yes! Our editor fully supports GitHub-flavored Markdown including task lists, tables, strikethrough, automatic URL linking, code fencing with syntax highlighting, and emoji shortcuts. This makes it perfect for writing README files, GitHub issues, pull request descriptions, and documentation that will be displayed on GitHub.',
  },
  {
    question: 'Can I export my Markdown to other formats?',
    answer:
      'Yes, you can export your content in multiple formats: save as .md file for Markdown, export as .html for web publishing, or copy the rendered HTML to paste into other applications. The live preview shows exactly how your Markdown will render, making it easy to see the final result before exporting.',
  },
  {
    question: 'How do I create tables in Markdown?',
    answer:
      'Use pipes (|) and hyphens (-) to create tables. Start with a header row, add a separator row with hyphens, then add data rows. Example: | Column 1 | Column 2 | followed by |----------|----------|. Our editor supports table alignment (left, center, right) and renders them with proper formatting in the live preview.',
  },
  {
    question: 'Is my Markdown content saved automatically?',
    answer:
      "Your content is automatically saved to your browser's local storage as you type, so you won't lose work if you accidentally close the tab. However, this is device-specific storage. For permanent backup, use the export feature to download your Markdown file or copy it to a version control system like Git.",
  },
]

export default function MarkdownEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  )
}
