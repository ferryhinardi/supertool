import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'CSV to Excel Converter',
  description:
    'Free online CSV to Excel converter with bidirectional support. Convert CSV to XLSX/XLS or Excel to CSV instantly. Supports multiple sheets, preserves formatting, and handles large files. Perfect for data conversion, spreadsheet migration, and format transformation.',
  keywords: [
    'csv to excel',
    'excel to csv',
    'csv converter',
    'excel converter',
    'xlsx converter',
    'xls converter',
    'csv to xlsx',
    'xlsx to csv',
    'convert csv',
    'convert excel',
    'spreadsheet converter',
    'data converter',
    'csv parser',
    'excel parser',
    'csv export',
    'excel export',
    'bidirectional converter',
  ],
  category: 'development',
  path: '/tools/csv-excel',
})

export default function CSVExcelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
