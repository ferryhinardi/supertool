import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/data/metadata'

export const metadata: Metadata = {
  title: 'Character Map - Special Characters & Symbols | SuperTool',
  description:
    'Browse and copy special characters, symbols, and Unicode characters. Includes arrows, math symbols, currency signs, Greek letters, punctuation, and more. One-click copy to clipboard.',
  keywords: [
    'character map',
    'special characters',
    'unicode',
    'symbols',
    'arrows',
    'math symbols',
    'currency symbols',
    'greek letters',
    'punctuation',
    'copy symbols',
    'character picker',
    'unicode characters',
  ],
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    url: 'https://supertool.id/tools/productivity/character-map',
    title: 'Character Map - Special Characters & Symbols',
    description:
      'Browse and copy special characters, symbols, and Unicode characters. One-click copy to clipboard.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://supertool.id/tools/productivity/character-map',
  },
}

export default function CharacterMapLayout({ children }: { children: React.ReactNode }) {
  return children
}
