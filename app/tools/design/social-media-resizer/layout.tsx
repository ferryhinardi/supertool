import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Social Media Image Resizer - Resize for All Platforms',
  description:
    'Free online social media image resizer. Get perfect dimensions for Instagram, Facebook, Twitter/X, LinkedIn, YouTube, TikTok, Pinterest, and Snapchat. Batch resize and download as ZIP. All processing in your browser.',
  keywords: [
    'social media image resizer',
    'instagram image size',
    'facebook cover size',
    'twitter header size',
    'linkedin banner size',
    'youtube thumbnail size',
    'tiktok image size',
    'pinterest pin size',
    'image resizer',
    'batch image resize',
    'social media dimensions',
    'resize image for social media',
    'image resize tool',
    'free image resizer',
  ],
  category: 'design',
  path: '/tools/design/social-media-resizer',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Social Media Image Resizer')

const faqSchema = generateFAQSchema([
  {
    question: 'What are the correct image sizes for social media?',
    answer:
      'Each platform has specific recommended sizes. Instagram posts are 1080x1080 (square), Facebook posts are 1200x630, Twitter posts are 1200x675, LinkedIn posts are 1200x627, and YouTube thumbnails are 1280x720. Our tool includes all standard sizes for 8 platforms.',
  },
  {
    question: 'Can I resize for multiple platforms at once?',
    answer:
      'Yes! Select multiple presets from different platforms and resize them all in one click. You can then download them individually or as a single ZIP file organized by platform.',
  },
  {
    question: 'Is my image uploaded to a server?',
    answer:
      'No. All image processing happens locally in your browser using the Canvas API. Your images never leave your device, ensuring complete privacy.',
  },
  {
    question: 'What image formats are supported?',
    answer:
      'We support PNG, JPEG, WebP, and GIF image formats for upload. All resized images are exported as high-quality PNG files.',
  },
  {
    question: 'How does the resizing work?',
    answer:
      'The tool uses a cover-fit algorithm that scales your image to fill the target dimensions completely, cropping from the center. This ensures your resized images look great without letterboxing.',
  },
  {
    question: 'Can I use custom dimensions?',
    answer:
      'Yes! In addition to platform presets, you can enter custom width and height values up to 4096 pixels for any specific size you need.',
  },
])

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  )
}
