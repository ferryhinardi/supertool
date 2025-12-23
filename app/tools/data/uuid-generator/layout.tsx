import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'UUID Generator & Validator - Generate v1, v4, v5 UUIDs',
  description:
    'Free online UUID generator and validator. Create unique identifiers (v1, v3, v4, v5) with bulk generation support. Validate UUID format and version instantly. Perfect for database keys, API identifiers, and unique resource naming.',
  keywords: [
    'uuid generator',
    'uuid validator',
    'uuid v4',
    'uuid v1',
    'uuid v5',
    'generate uuid',
    'validate uuid',
    'bulk uuid generator',
    'unique identifier',
    'guid generator',
    'database key generator',
    'api identifier',
  ],
  category: 'data',
  path: '/tools/uuid-generator',
})

export default function UUIDGeneratorLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/' },
      { name: 'UUID Generator', url: '/tools/uuid-generator' },
    ],
    baseUrl
  )

  const faqSchema = generateFAQSchema([
    {
      question: 'What is a UUID and why should I use it?',
      answer:
        'UUID (Universally Unique Identifier) is a 128-bit identifier guaranteed to be unique across all systems. UUIDs are ideal for database primary keys, distributed systems, API identifiers, and session tokens because they can be generated independently without coordination.',
    },
    {
      question: 'What is the difference between UUID v1, v4, and v5?',
      answer:
        'UUID v1 uses timestamp and MAC address (predictable but unique), UUID v4 uses random generation (most common, cryptographically secure), and UUID v5 uses SHA-1 hashing with a namespace (deterministic based on input). For most applications, UUID v4 is recommended for its simplicity and security.',
    },
    {
      question: 'How do I validate if a string is a valid UUID?',
      answer:
        'A valid UUID follows the format xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx where x is a hexadecimal digit (0-9, a-f), M is the version number (1, 3, 4, or 5), and N is the variant. Our validator checks both format and version to ensure your UUID is correctly formed.',
    },
    {
      question: 'Can I generate multiple UUIDs at once?',
      answer:
        'Yes! Our bulk UUID generator allows you to create multiple UUIDs at once (up to 100 at a time). This is perfect when you need to generate many unique identifiers for database seeding, testing, or batch operations.',
    },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
