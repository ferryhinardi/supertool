import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Citation Generator',
  description:
    'Generate properly formatted citations in APA, MLA, Chicago, Harvard, and IEEE styles. Support for books, journals, websites, and more. Copy or export your bibliography.',
  path: '/tools/productivity/citation-generator',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
