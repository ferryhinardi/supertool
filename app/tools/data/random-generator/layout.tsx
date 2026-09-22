import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Random Generator',
  description:
    'Generate cryptographically secure random numbers, strings, UUIDs, and passwords. Perfect for testing and development.',
  path: '/tools/data/random-generator',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
