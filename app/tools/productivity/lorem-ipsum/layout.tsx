import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - Placeholder Text Generator | SuperTool',
  description:
    'Generate Lorem Ipsum placeholder text for your designs and mockups. Create paragraphs, sentences, or words with customizable count. Perfect for web designers, developers, and content creators.',
  keywords: [
    'lorem ipsum generator',
    'placeholder text',
    'dummy text generator',
    'lorem ipsum',
    'filler text',
    'sample text',
    'text generator',
    'design placeholder',
    'mockup text',
    'web design tools',
    'developer tools',
    'content placeholder',
  ],
  openGraph: {
    url: 'https://supertool.id/tools/productivity/lorem-ipsum',
    title: 'Lorem Ipsum Generator - Placeholder Text Generator',
    description:
      'Generate Lorem Ipsum placeholder text for your designs and mockups. Create paragraphs, sentences, or words instantly.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://supertool.id/tools/productivity/lorem-ipsum',
  },
}

export default function LoremIpsumLayout({ children }: { children: React.ReactNode }) {
  return children
}
