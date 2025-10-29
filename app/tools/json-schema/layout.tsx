import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON Schema Generator',
  description:
    'Free online JSON Schema generator that automatically creates schemas from sample JSON data. Instantly generate JSON Schema Draft 2020-12 with type inference, format detection, and validation. Perfect for API documentation, data validation, and contract testing.',
  keywords: [
    'json schema generator',
    'json schema',
    'generate json schema',
    'json schema validator',
    'json schema from json',
    'automatic schema generation',
    'json schema draft 2020-12',
    'json type inference',
    'json validation schema',
    'api schema generator',
    'data contract',
    'json schema tool',
  ],
  category: 'data',
  path: '/tools/json-schema',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('JSON Schema Generator')

const faqs = [
  {
    question: 'What is JSON Schema and why do I need it?',
    answer:
      'JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It defines the structure, data types, and constraints of your JSON data. JSON Schema is essential for API documentation, data validation, contract testing, and ensuring data consistency across systems.',
  },
  {
    question: 'How does the automatic schema generation work?',
    answer:
      'Our JSON Schema generator analyzes your sample JSON data and automatically infers types (string, number, boolean, object, array), detects string formats (email, URI, date-time, UUID), identifies required fields based on non-null values, and handles nested structures. It generates a complete JSON Schema Draft 2020-12 specification from your input.',
  },
  {
    question: 'Is my JSON data private when using this tool?',
    answer:
      'Yes, absolutely. All schema generation happens entirely in your browser using client-side JavaScript. Your JSON data never leaves your device and is not transmitted to any server, ensuring complete privacy and security for sensitive data.',
  },
  {
    question: 'What formats can the tool detect automatically?',
    answer:
      'The generator can automatically detect common string formats including: email addresses, URIs/URLs, ISO 8601 date-time, date, time, and UUID patterns. When detected, these formats are added to the schema for enhanced validation.',
  },
  {
    question: 'Can I customize the generated schema?',
    answer:
      'Yes! You can add a custom title and description to your schema, toggle required field detection, and enable/disable format detection. The generated schema is also fully editable - you can copy it and modify any properties to match your specific requirements.',
  },
]

export default function JSONSchemaLayout({ children }: { children: React.ReactNode }) {
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
