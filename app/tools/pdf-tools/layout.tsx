import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'PDF Tools Suite (Merge, Split, Compress)',
  description:
    'Free online PDF tools to merge, split, compress, and convert PDF files. Edit PDFs, extract pages, and optimize file size. All processing done securely in your browser with no uploads required.',
  keywords: [
    'pdf tools',
    'pdf merger',
    'pdf splitter',
    'pdf compressor',
    'merge pdf',
    'split pdf',
    'compress pdf',
    'pdf converter',
    'pdf editor',
    'pdf online',
    'combine pdf',
    'reduce pdf size',
  ],
  category: 'utilities',
  path: '/tools/pdf-tools',
})

export default function PDFToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
