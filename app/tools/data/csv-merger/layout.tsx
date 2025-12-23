import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'CSV Merger & Splitter',
  description:
    'Free online CSV merger and splitter tool. Merge multiple CSV files with column mapping and deduplication, or split large CSV files by row count or filter conditions. Perfect for data processing, file management, and bulk operations.',
  keywords: [
    'csv merger',
    'csv splitter',
    'merge csv',
    'split csv',
    'csv combiner',
    'csv divider',
    'combine csv files',
    'split csv file',
    'csv deduplicate',
    'csv column mapping',
    'csv filter',
    'csv bulk operations',
    'csv data processing',
    'csv file management',
    'merge multiple csv',
    'split large csv',
  ],
  category: 'data',
  path: '/tools/csv-merger',
})

export default function CSVMergerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
