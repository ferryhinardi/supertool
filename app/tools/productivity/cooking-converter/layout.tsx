import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Cooking Unit Converter',
  description:
    'Convert cooking measurements between cups, tablespoons, grams, ounces, and more. Scale recipes up or down with ingredient-specific conversions for accurate results.',
  path: '/tools/productivity/cooking-converter',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
