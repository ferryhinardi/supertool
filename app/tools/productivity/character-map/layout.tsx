import type { Metadata } from 'next'

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
    title: 'Character Map - Special Characters & Symbols',
    description:
      'Browse and copy special characters, symbols, and Unicode characters. One-click copy to clipboard.',
    type: 'website',
  },
}

export default function CharacterMapLayout({ children }: { children: React.ReactNode }) {
  return children
}
