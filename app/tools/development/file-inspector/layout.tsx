import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'File Metadata Inspector - MIME Type, Hash, Size Analysis',
  description:
    'Free online file metadata inspector. Analyze files without uploading - view MIME type, calculate SHA-256/MD5 hash, inspect file size, and check creation date. Secure client-side processing for file verification and debugging.',
  keywords: [
    'file inspector',
    'file metadata viewer',
    'MIME type checker',
    'file hash calculator',
    'SHA-256 hash',
    'MD5 hash',
    'file size analyzer',
    'file verification',
    'file integrity checker',
    'secure file inspector',
    'client-side file analysis',
    'no upload file inspector',
  ],
  category: 'development',
  path: '/tools/file-inspector',
})

export default function FileInspectorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
