import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Split Bill Calculator',
  description:
    'Free bill splitting calculator with receipt scanning and custom tip calculation. Split bills easily among friends, calculate tips, and track who owes what. Perfect for group dinners and shared expenses.',
  keywords: [
    'split bill',
    'bill splitter',
    'tip calculator',
    'receipt scanner',
    'expense split',
    'shared expenses',
    'group payment',
    'bill calculator',
    'split check',
    'divide bill',
    'restaurant bill split',
    'expense sharing',
  ],
  category: 'finance',
  path: '/tools/split-bill',
})

export default function SplitBillLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
