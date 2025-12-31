import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Icon Search & Download Hub | Free SVG Icons',
  description:
    'Search and download 1000+ free Lucide icons. Customize size, color, and stroke. Download as SVG, PNG, or React component. Perfect for web design and development.',
  keywords: [
    'icon search',
    'free icons',
    'svg icons',
    'lucide icons',
    'download icons',
    'react icons',
    'icon library',
    'web icons',
  ],
}

export default function IconSearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
