import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Unit Converter (Length, Weight, Temperature)',
  description:
    'Free online unit converter for length, weight, temperature, volume, area, and more. Convert between metric and imperial units instantly. Accurate conversion with support for 100+ units across multiple categories.',
  keywords: [
    'unit converter',
    'length converter',
    'weight converter',
    'temperature converter',
    'metric converter',
    'imperial converter',
    'convert units',
    'measurement converter',
    'volume converter',
    'area converter',
    'distance converter',
    'mass converter',
  ],
  category: 'utilities',
  path: '/tools/unit-converter',
})

export default function UnitConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
