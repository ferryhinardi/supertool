import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Code Diff Viewer & Text Comparison',
  description:
    'Free online diff checker to compare text and code files. Side-by-side diff viewer with syntax highlighting, line-by-line comparison, and merge conflicts. Perfect for code reviews and text comparison.',
  keywords: [
    'diff checker',
    'code diff',
    'text comparison',
    'file comparison',
    'compare text',
    'diff viewer',
    'code compare',
    'text diff',
    'file diff',
    'merge conflict',
    'code review',
    'diff tool',
  ],
  category: 'development',
  path: '/tools/diff',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Code Diff Viewer & Text Comparison')

const faqs = [
  {
    question: 'How do I compare two text or code files?',
    answer:
      'Paste your original text in the left panel and modified text in the right panel, then click Compare. The diff viewer will highlight additions in green, deletions in red, and unchanged lines in gray. You can switch between split view (side-by-side) and unified view (single column) for easier comparison.',
  },
  {
    question: 'What is the difference between split view and unified view?',
    answer:
      'Split view displays both texts side-by-side with synchronized scrolling, making it easy to see changes at a glance. Unified view combines both texts in a single column with +/- prefixes (like Git diffs), which is more compact and better for reviewing sequential changes or on smaller screens.',
  },
  {
    question: 'Does this diff tool support syntax highlighting for code?',
    answer:
      'Yes! Our diff viewer automatically detects and applies syntax highlighting for popular programming languages including JavaScript, TypeScript, Python, Java, C++, PHP, Ruby, Go, and many more. This makes code comparison clearer by color-coding keywords, strings, comments, and other syntax elements.',
  },
  {
    question: 'Can I compare JSON files with this tool?',
    answer:
      'Absolutely! The diff tool has special JSON formatting support that beautifies and validates JSON before comparison. This ensures accurate structural comparison even if the original JSON has different formatting or whitespace. It highlights object key changes, value modifications, and array differences.',
  },
  {
    question: 'Is my code or text data safe when using this diff tool?',
    answer:
      'Yes, your data is completely safe. All comparison happens entirely in your browser using JavaScript. No text, code, or files are uploaded to any server or stored anywhere. Your data never leaves your device, ensuring complete privacy and security for sensitive code or confidential information.',
  },
]

const howToSteps = [
  {
    name: 'Paste Your Original Content',
    text: 'Copy and paste your original text or code into the left panel of the diff viewer. This can be any text content, source code in any programming language, JSON data, or configuration files.',
  },
  {
    name: 'Paste Your Modified Content',
    text: 'Copy and paste the modified or updated version of your text or code into the right panel. The diff viewer will automatically detect the programming language for proper syntax highlighting.',
  },
  {
    name: 'Click Compare',
    text: 'Click the "Compare" button to analyze the differences between both texts. The tool will highlight additions in green, deletions in red, and unchanged lines in gray for easy visual comparison.',
  },
  {
    name: 'Review and Switch Views',
    text: 'Review the differences using split view (side-by-side) or unified view (single column). Use the synchronized scrolling to navigate through both texts simultaneously and identify all changes.',
  },
]

export default function DiffLayout({ children }: { children: React.ReactNode }) {
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
      <Script
        id="howto-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateHowToSchema(
              'How to Compare Code and Text Files',
              'Learn how to use our online diff viewer to compare two text or code files. Identify additions, deletions, and modifications with syntax highlighting for easy code review and text comparison.',
              howToSteps,
              baseUrl,
              '/tools/diff'
            )
          ),
        }}
      />
    </>
  )
}
