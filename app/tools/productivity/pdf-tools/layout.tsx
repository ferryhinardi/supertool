import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'PDF Tools Suite - Free PDF Merger, Splitter & Compressor',
  description:
    'Professional PDF tools to merge, split, compress, watermark, and convert PDFs. Extract pages, rotate, convert to grayscale, and optimize file size. 100% secure browser-based processing with no uploads.',
  keywords: [
    'pdf tools',
    'pdf merger',
    'pdf splitter',
    'pdf compressor',
    'merge pdf online',
    'split pdf free',
    'compress pdf',
    'pdf converter',
    'pdf editor online',
    'combine pdf',
    'reduce pdf size',
    'pdf watermark',
    'extract pdf pages',
    'rotate pdf',
    'pdf grayscale converter',
    'convert pdf to grayscale',
    'pdf black and white',
  ],
  category: 'productivity',
  path: '/tools/pdf-tools',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('PDF Tools Suite')

const faqs = [
  {
    question: 'How do I merge multiple PDF files?',
    answer:
      'Upload 2 or more PDF files, select the "Merge PDFs" operation, and click "Process PDFs". The tool will combine all files into a single PDF document that you can download. All processing happens in your browser without uploading files to any server.',
  },
  {
    question: 'Can I split a PDF into multiple files?',
    answer:
      'Yes, upload your PDF, select "Split PDF", specify the page number where you want to split, and process. The tool will create two separate PDF files - one with pages before the split point and another with remaining pages.',
  },
  {
    question: 'Does PDF compression reduce quality?',
    answer:
      'The compression feature optimizes PDF structure and removes redundant data without significantly affecting visual quality. It works best for PDFs with complex structures and can reduce file size by 10-30% in most cases.',
  },
  {
    question: 'How does the grayscale conversion work?',
    answer:
      'The grayscale converter transforms all colored content in your PDF to shades of gray using standard luminance calculations. This is useful for printing, reducing file size, or creating professional black-and-white documents. Each page is converted while maintaining image quality and layout.',
  },
  {
    question: 'Are my PDF files uploaded to a server?',
    answer:
      'No, all PDF processing happens entirely in your browser using JavaScript libraries. Your files never leave your device, ensuring complete privacy and security. This also means the tool works offline once loaded.',
  },
]

export default function PDFToolsLayout({ children }: { children: React.ReactNode }) {
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
