import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON Beautifier & Formatter',
  description:
    'Free online JSON formatter and beautifier with syntax highlighting, validation, and minification. Format, validate, and beautify JSON with real-time error detection. Perfect for debugging API responses and configuration files.',
  keywords: [
    'json formatter',
    'json beautifier',
    'json validator',
    'json minifier',
    'format json',
    'beautify json',
    'validate json',
    'json syntax checker',
    'json editor',
    'json pretty print',
    'json parser',
    'json lint',
  ],
  category: 'development',
  path: '/tools/json-beautify',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('JSON Beautifier & Formatter')

const faqs = [
  {
    question: 'What is JSON beautifier and why do I need it?',
    answer:
      'A JSON beautifier formats compressed or minified JSON data into a readable, indented structure. It helps developers debug API responses, review configuration files, and understand complex JSON structures by adding proper indentation, line breaks, and syntax highlighting.',
  },
  {
    question: 'Is my JSON data safe when using this tool?',
    answer:
      'Yes, absolutely. All JSON formatting, validation, and beautification happens entirely in your browser using client-side JavaScript. Your data never leaves your device and is not sent to any server, ensuring complete privacy and security.',
  },
  {
    question: 'Can I validate JSON syntax with this tool?',
    answer:
      'Yes! The JSON beautifier automatically validates your JSON syntax as you type. It will highlight errors and show you exactly where syntax issues occur, making it easy to fix malformed JSON quickly.',
  },
  {
    question: 'What is the difference between beautify and minify?',
    answer:
      'Beautify adds indentation, line breaks, and spacing to make JSON human-readable. Minify does the opposite - it removes all unnecessary whitespace to create the smallest possible file size, which is useful for production environments to reduce bandwidth usage.',
  },
]

export default function JSONBeautifyLayout({ children }: { children: React.ReactNode }) {
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
