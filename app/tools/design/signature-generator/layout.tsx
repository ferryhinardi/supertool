import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Digital Signature Generator - Create Handwritten Signatures',
  description:
    'Free online digital signature generator. Draw, type, or upload your signature. Export as transparent PNG for documents, contracts, and forms. Customize colors, stroke width, and styles.',
  keywords: [
    'digital signature generator',
    'signature creator',
    'handwritten signature',
    'signature maker',
    'e-signature',
    'electronic signature',
    'signature png',
    'transparent signature',
    'sign documents online',
    'free signature generator',
    'draw signature',
    'type signature',
  ],
  category: 'design',
  path: '/tools/design/signature-generator',
})

export default function SignatureGeneratorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
