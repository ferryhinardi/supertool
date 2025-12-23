import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/data/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const toolPath = '/tools/steganography'

export const metadata: Metadata = generateToolMetadata({
  title: 'Text Steganography Tool - Hide Secret Messages',
  description:
    'Free online text steganography tool using zero-width characters. Hide and encode secret messages invisibly within plain text. Decode hidden messages with our secure browser-based tool.',
  keywords: [
    'text steganography',
    'hide message in text',
    'zero-width characters',
    'invisible text',
    'encode hidden message',
    'decode secret message',
    'steganography tool',
    'digital watermarking',
    'covert communication',
    'unicode steganography',
    'hidden text encoder',
    'secret message decoder',
  ],
  category: 'security',
  path: toolPath,
})

// Breadcrumb structured data
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/' },
    { name: 'Text Steganography Tool', url: toolPath },
  ],
  baseUrl
)

// Software application structured data
const softwareSchema = generateSoftwareApplicationSchema(
  {
    name: 'Text Steganography Tool',
    description:
      'Free online text steganography tool using zero-width characters. Hide and encode secret messages invisibly within plain text.',
    url: toolPath,
    category: 'Security Tool',
    keywords: [
      'Zero-Width Encoding',
      'Invisible Text',
      'Hide Secret Messages',
      'Decode Hidden Messages',
      'Unicode Steganography',
      'Digital Watermarking',
      'Secure Communication',
      'Browser-Based Tool',
    ],
  },
  baseUrl
)

// FAQ structured data
const faqSchema = generateFAQSchema([
  {
    question: 'What is text steganography?',
    answer:
      'Text steganography is the practice of hiding secret information within plain text using invisible characters. Our tool uses zero-width Unicode characters that are invisible to the naked eye but can encode binary data to hide messages.',
  },
  {
    question: 'How does zero-width character encoding work?',
    answer:
      'Zero-width characters are special Unicode characters that take up no visible space. Our tool converts your secret message to binary code and encodes it using zero-width space (U+200B), zero-width non-joiner (U+200C), and zero-width joiner (U+200D) characters. The result looks like normal text but contains hidden data.',
  },
  {
    question: 'Is text steganography secure?',
    answer:
      'Text steganography provides obfuscation rather than encryption. The message is hidden but not encrypted. For truly secure communication, combine steganography with encryption. All processing happens locally in your browser - no data is sent to our servers.',
  },
  {
    question: 'Can anyone detect hidden messages?',
    answer:
      'Hidden messages encoded with zero-width characters are invisible in most text displays and messaging apps. However, they can be detected by examining the Unicode characters in the text or using specialized tools. Our tool can detect and decode these hidden messages.',
  },
  {
    question: 'What are the use cases for text steganography?',
    answer:
      'Text steganography can be used for digital watermarking, secure communication, tracking document leaks, embedding metadata in text, and covert data transmission. It is also useful for protecting intellectual property and verifying document authenticity.',
  },
  {
    question: 'Does text steganography work in all applications?',
    answer:
      'Most modern applications that support Unicode will preserve zero-width characters, including messaging apps, email clients, and text editors. However, some platforms may strip or normalize these characters, so always test in your target application first.',
  },
  {
    question: 'Is my data private when using this tool?',
    answer:
      'Yes! All encoding and decoding happens entirely in your browser using JavaScript. Your cover text and secret messages never leave your device or get sent to any server. The tool works completely offline once loaded.',
  },
  {
    question: 'How much text can I hide?',
    answer:
      'You can hide any amount of text, but keep in mind that longer secret messages will create more zero-width characters. Very long hidden messages might be detected by character count analysis. For best results, keep your secret messages concise.',
  },
])

export default function SteganographyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="software-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
