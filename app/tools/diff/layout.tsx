import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Code Diff Viewer & Text Comparison',
  description:
    'Free online diff checker to compare text and code files. Side-by-side diff viewer with syntax highlighting, line-by-line comparison, and merge conflicts. Perfect for code reviews and text comparison.',
  keywords: [
    'diff checker',
    'code diff',
    'text comparison',
    'file comparison',
    'compare text',
    'diff viewer',
    'code compare',
    'text diff',
    'file diff',
    'merge conflict',
    'code review',
    'diff tool',
  ],
  category: 'development',
  path: '/tools/diff',
})

export default function DiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
