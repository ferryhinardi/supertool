import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Hash Generator (MD5, SHA, etc.)',
  description:
    'Free online hash generator for MD5, SHA-1, SHA-256, SHA-512, and more. Generate cryptographic hashes from text or files instantly. Secure hash calculation with support for multiple algorithms.',
  keywords: [
    'hash generator',
    'md5 generator',
    'sha256 generator',
    'sha1 generator',
    'sha512 generator',
    'hash calculator',
    'checksum generator',
    'crypto hash',
    'hash function',
    'hash online',
    'file hash',
    'text hash',
  ],
  category: 'security',
  path: '/tools/hash-generator',
})

export default function HashGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
