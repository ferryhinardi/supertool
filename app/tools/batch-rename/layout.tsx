import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Batch File Renamer - Rename Multiple Files with Pattern Rules',
  description:
    'Free online batch file renamer. Rename multiple files at once with pattern rules, find & replace, sequential numbering, and case transformations. Add prefix/suffix, use regex patterns, and preview changes before applying. All processing happens locally in your browser.',
  keywords: [
    'batch file renamer',
    'bulk rename files',
    'rename multiple files',
    'file renaming tool',
    'pattern rename',
    'sequential numbering',
    'find and replace filename',
    'regex rename',
    'mass file rename',
    'file name editor',
    'prefix suffix files',
    'case transform files',
  ],
  category: 'productivity',
  path: '/tools/batch-rename',
})

export default function BatchRenameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
