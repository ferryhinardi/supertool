import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Text Transformer & Case Converter',
  description:
    'Free online text transformer to convert case, remove spaces, and format text. Convert to uppercase, lowercase, title case, camelCase, snake_case, and more. Instant text transformation with multiple options.',
  keywords: [
    'text transformer',
    'case converter',
    'uppercase converter',
    'lowercase converter',
    'title case',
    'camel case',
    'snake case',
    'text formatter',
    'text converter',
    'string transformer',
    'text manipulation',
    'case changer',
  ],
  category: 'utilities',
  path: '/tools/text-transformer',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Text Transformer & Case Converter')

const faqs = [
  {
    question: 'What text transformations are available in this tool?',
    answer:
      'Our tool offers 20+ text transformations including: case conversions (UPPERCASE, lowercase, Title Case, Sentence case), programming formats (camelCase, PascalCase, snake_case, kebab-case), text operations (reverse, remove spaces, trim whitespace), sorting (alphabetical, reverse), duplicate removal, word/character counting, find and replace with regex support, and more.',
  },
  {
    question: 'How do I convert text to camelCase or snake_case?',
    answer:
      'Simply paste your text and select the desired format. For camelCase, spaces and special characters are removed with each word capitalized except the first (e.g., "hello world" becomes "helloWorld"). For snake_case, spaces are replaced with underscores and text is lowercased (e.g., "Hello World" becomes "hello_world"). Perfect for programming variable names.',
  },
  {
    question: 'Can I remove duplicate lines from my text?',
    answer:
      'Yes! Use the "Remove Duplicates" transformation to eliminate duplicate lines while preserving the original order. This is useful for cleaning up lists, removing redundant entries from logs, or deduplicating data exports. The tool performs case-sensitive comparison and preserves the first occurrence of each unique line.',
  },
  {
    question: 'Does the tool support find and replace with regular expressions?',
    answer:
      'Yes, our advanced find and replace feature supports full regex pattern matching. Use regex flags for case-insensitive search, multiline mode, and global replacement. This enables powerful text manipulation like removing patterns, extracting data, or reformatting complex text structures with precision.',
  },
  {
    question: 'Can I see word count and character count for my text?',
    answer:
      'Absolutely! The tool displays real-time statistics including total characters, characters without spaces, word count, line count, and sentence count. This is helpful for writers checking content length, students meeting assignment requirements, or developers analyzing text data before processing.',
  },
]

export default function TextTransformerLayout({ children }: { children: React.ReactNode }) {
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
