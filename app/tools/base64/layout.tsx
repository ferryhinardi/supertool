import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Base64 Encoder & Decoder',
  description:
    'Free online Base64 encoder and decoder for text and files. Encode and decode Base64 strings instantly with support for images, text, and binary data. Fast, secure, and privacy-focused conversion.',
  keywords: [
    'base64 encoder',
    'base64 decoder',
    'base64 converter',
    'encode base64',
    'decode base64',
    'base64 image',
    'base64 to text',
    'text to base64',
    'base64 online',
    'base64 tool',
    'base64 encode decode',
    'base64 conversion',
  ],
  category: 'development',
  path: '/tools/base64',
})

export default function Base64Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
