import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Screenshot Diff Tool - Visual Comparison & Image Difference',
  description:
    'Free online screenshot diff tool to compare images pixel-by-pixel. Visualize differences between screenshots, UI mockups, and designs. Perfect for QA testing, design reviews, and visual regression testing.',
  keywords: [
    'screenshot diff',
    'image comparison',
    'visual diff',
    'screenshot comparison',
    'image diff',
    'visual regression',
    'UI testing',
    'design comparison',
    'pixel diff',
    'compare screenshots',
    'image difference',
    'visual testing',
    'QA testing',
    'screenshot testing',
  ],
  category: 'development',
  path: '/tools/screenshot-diff',
})

export default function ScreenshotDiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
