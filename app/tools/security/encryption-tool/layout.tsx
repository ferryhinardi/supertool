import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Encryption & Decryption Tool',
  description:
    'Free online encryption tool with AES, RSA, and multiple cipher support. Encrypt and decrypt text securely with password protection. Privacy-focused encryption tool with no server-side storage.',
  keywords: [
    'encryption tool',
    'encrypt text',
    'decrypt text',
    'aes encryption',
    'rsa encryption',
    'secure encryption',
    'password encryption',
    'cipher tool',
    'encrypt online',
    'decrypt online',
    'data encryption',
    'cryptography tool',
  ],
  category: 'security',
  path: '/tools/encryption-tool',
})

export default function EncryptionToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
