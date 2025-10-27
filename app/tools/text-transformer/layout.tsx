import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

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

export default function TextTransformerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
