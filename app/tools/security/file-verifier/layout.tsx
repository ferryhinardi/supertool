import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'File Verifier - Verify File Integrity with Hash Checksums',
  description:
    'Free online file verifier and integrity checker. Verify file integrity using MD5, SHA-1, SHA-256, and SHA-512 checksums. Compare hashes to detect file corruption or tampering. Secure client-side processing.',
  keywords: [
    'file verifier',
    'file integrity checker',
    'hash verifier',
    'checksum verifier',
    'md5 checker',
    'sha256 verifier',
    'file hash verification',
    'verify file integrity',
    'checksum validator',
    'file corruption checker',
    'hash compare tool',
    'security verification',
  ],
  category: 'security',
  path: '/tools/security/file-verifier',
})

export default function FileVerifierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
