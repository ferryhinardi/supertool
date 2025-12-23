import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'JSON to CSV Converter',
  description:
    'Free online JSON to CSV converter with custom field mapping and nested object support. Convert JSON arrays to CSV/Excel format instantly. Perfect for data export, analysis, and spreadsheet conversion.',
  keywords: [
    'json to csv',
    'json converter',
    'csv converter',
    'json to excel',
    'convert json',
    'json to spreadsheet',
    'json parser',
    'json data converter',
    'json export',
    'csv export',
    'data converter',
    'json transformation',
  ],
  category: 'development',
  path: '/tools/json-to-csv',
})

export default function JSONToCSVLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
