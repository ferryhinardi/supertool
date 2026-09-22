import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Case Converter',
  description:
    'Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Preview all case formats at once.',
  path: '/tools/productivity/case-converter',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
