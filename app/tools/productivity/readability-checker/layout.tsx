import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Readability Score Checker',
  description:
    'Analyze text readability with Flesch-Kincaid, Gunning Fog, and other scoring algorithms. Get grade level estimates, reading time, and suggestions to improve your writing clarity.',
  path: '/tools/productivity/readability-checker',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
