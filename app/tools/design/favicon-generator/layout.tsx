import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Favicon Generator',
  description:
    'Free online favicon generator. Convert logos, images, or emojis into favicons for websites. Generate all required sizes (16×16, 32×32, 48×48, 64×64, 128×128, 180×180) and formats (ICO, PNG) with instant preview and download. No upload required - all processing happens locally in your browser.',
  keywords: [
    'favicon generator',
    'ico generator',
    'favicon maker',
    'favicon converter',
    'emoji favicon',
    'apple touch icon',
    'website icon generator',
    'browser icon maker',
    'favicon sizes',
    'favicon formats',
    'png to ico',
    'image to favicon',
    'online favicon tool',
    'free favicon generator',
  ],
  category: 'design',
  path: '/tools/favicon-generator',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Favicon Generator')

const faqSchema = generateFAQSchema([
  {
    question: 'What is a favicon and why do I need one?',
    answer:
      'A favicon (favorite icon) is a small icon that appears in browser tabs, bookmarks, and address bars. It helps users identify your website quickly and makes your site look more professional.',
  },
  {
    question: 'What sizes should my favicon be?',
    answer:
      'Our tool generates all standard sizes: 16×16 and 32×32 for browser tabs, 48×48 and 64×64 for desktop shortcuts, 128×128 for Chrome Web Store, and 180×180 for Apple Touch Icon (iOS home screen).',
  },
  {
    question: 'Can I use an emoji as a favicon?',
    answer:
      "Yes! Our tool allows you to convert any emoji into a favicon. Simply select from popular emojis or paste your own emoji, and we'll generate all the required sizes.",
  },
  {
    question: 'Is my image uploaded to a server?',
    answer:
      'No! All image processing happens locally in your browser. Your images are never uploaded to any server, ensuring complete privacy and security.',
  },
  {
    question: 'What image formats are supported?',
    answer:
      'We support PNG, JPEG, JPG, GIF, SVG, and WebP image formats. The maximum file size is 5MB.',
  },
  {
    question: 'How do I add the favicon to my website?',
    answer:
      "After generating your favicons, copy the HTML code provided by our tool and paste it into the <head> section of your website. Then upload the favicon files to your website's root directory.",
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
