import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'URL Encoder/Decoder',
  description:
    'Encode and decode URLs with encodeURI, encodeURIComponent, and their decode counterparts. Handle special characters in URLs and query parameters.',
  path: '/tools/development/url-encoder',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
