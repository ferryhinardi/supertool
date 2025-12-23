import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Image to PDF Converter - Free Online Tool',
  description:
    'Convert JPG, PNG, WebP, and other images to PDF instantly. Combine multiple images into a single PDF document with customizable page settings. No registration required.',
  keywords: [
    'image to pdf',
    'jpg to pdf',
    'png to pdf',
    'convert image to pdf',
    'merge images to pdf',
    'pdf converter',
    'free pdf tool',
    'online pdf maker',
  ],
  category: 'media',
  path: '/tools/image-to-pdf',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Image to PDF Converter')

const faqs = [
  {
    question: 'How do I convert images to PDF?',
    answer:
      'Simply drag and drop your images (JPG, PNG, WebP, etc.) into the upload zone, or click to select files. Choose your PDF settings like page size and orientation, then click "Generate PDF" to download your PDF file instantly.',
  },
  {
    question: 'Can I combine multiple images into one PDF?',
    answer:
      'Yes! You can upload multiple images and they will be combined into a single PDF document. Each image will be placed on a separate page in the order you uploaded them.',
  },
  {
    question: 'Is my data safe when converting images to PDF?',
    answer:
      'Absolutely. All image processing happens entirely in your browser using client-side JavaScript. Your images never leave your device and are not uploaded to any server, ensuring complete privacy and security.',
  },
  {
    question: 'What image formats are supported?',
    answer:
      'We support all common image formats including JPG, JPEG, PNG, WebP, GIF, and BMP. The tool automatically detects and processes compatible image formats.',
  },
  {
    question: 'What PDF page sizes can I use?',
    answer:
      'You can choose from A4, Letter, Legal, A3, and A5 page sizes in both portrait and landscape orientations. You can also customize margins and choose how images fit within the page.',
  },
]

export default function ImageToPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  )
}
