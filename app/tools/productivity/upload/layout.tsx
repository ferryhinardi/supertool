import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Cloud File Upload & Sharing',
  description:
    'Free cloud file upload and sharing service. Upload files up to 100MB, get shareable links, and manage your uploads. Fast, secure, and privacy-focused file hosting with no registration required.',
  keywords: [
    'file upload',
    'cloud storage',
    'file sharing',
    'upload file',
    'share files',
    'file host',
    'temporary file storage',
    'file transfer',
    'send files',
    'upload images',
    'free file hosting',
    'file storage',
  ],
  category: 'utilities',
  path: '/tools/upload',
})

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
