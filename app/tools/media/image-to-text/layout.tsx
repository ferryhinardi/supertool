import type { Metadata } from 'next'

const title = 'Image to Text Converter - OCR Tool | Extract Text from Images Online'
const description =
  'Convert images to text instantly with our free OCR tool. Extract text from photos, screenshots, and documents. Supports multiple languages including English, Spanish, French, German, and Chinese. Upload PNG, JPEG, or WEBP images and get editable text with one click. Copy or download extracted text easily.'

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'image to text',
    'ocr online',
    'extract text from image',
    'image to text converter',
    'photo to text',
    'screenshot to text',
    'ocr tool',
    'text recognition',
    'optical character recognition',
    'convert image to text',
    'image text extractor',
    'free ocr',
    'online ocr',
    'tesseract ocr',
    'multilingual ocr',
    'document scanner',
    'pdf to text',
    'handwriting recognition',
  ],
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
}

export default function ImageToTextLayout({ children }: { children: React.ReactNode }) {
  return children
}
