import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Date Formatter & Parser',
  description:
    'Free online date formatter and parser powered by Day.js. Convert timestamps between formats, parse dates, calculate differences, convert timezones, and format dates with precision. Support for ISO 8601, Unix timestamps, RFC 2822, and custom formats.',
  keywords: [
    'date formatter',
    'date parser',
    'timestamp converter',
    'timezone converter',
    'date calculator',
    'unix timestamp converter',
    'ISO 8601 converter',
    'date difference calculator',
    'time converter',
    'date format tool',
    'timestamp parser',
    'date utility',
  ],
  category: 'data',
  path: '/tools/date-formatter',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Date Formatter & Parser')

const faqs = [
  {
    question: 'What date formats does the date formatter support?',
    answer:
      'The date formatter supports a wide range of formats including ISO 8601 (YYYY-MM-DDTHH:mm:ss.SSSZ), Unix timestamps (seconds and milliseconds), RFC 2822, US format (MM/DD/YYYY), EU format (DD/MM/YYYY), and many others. It can also parse natural language dates like "January 15, 2024" and custom formats.',
  },
  {
    question: 'How do I convert a Unix timestamp to a readable date?',
    answer:
      "Simply paste your Unix timestamp (e.g., 1704067200) into the date input field. The tool automatically detects whether it's in seconds or milliseconds and converts it to multiple human-readable formats including ISO 8601, long date format, and more.",
  },
  {
    question: 'Can I convert dates between different timezones?',
    answer:
      'Yes! The timezone converter section allows you to convert dates between any timezone. Select your target timezone from the dropdown menu (including UTC, EST, PST, GMT, and many others), and the tool will instantly show the converted time.',
  },
  {
    question: 'How does the date difference calculator work?',
    answer:
      'Enter two dates in any supported format, and the calculator will show the time difference in multiple units (years, months, days, hours, minutes, seconds) as well as totals for each unit. It also provides a human-readable description like "2 years, 3 months, 15 days".',
  },
  {
    question: 'Is my date data secure and private?',
    answer:
      'Yes, absolutely. All date parsing and formatting happens entirely in your browser using client-side JavaScript. No date information is sent to any server, ensuring complete privacy for your data.',
  },
  {
    question: 'What is ISO 8601 format?',
    answer:
      'ISO 8601 is an international standard for representing dates and times. The format is YYYY-MM-DDTHH:mm:ss.SSSZ (e.g., 2024-01-15T12:00:00.000Z). The "T" separates the date from time, and "Z" indicates UTC timezone. This format is widely used in APIs and databases.',
  },
]

export default function DateFormatterLayout({ children }: { children: React.ReactNode }) {
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
