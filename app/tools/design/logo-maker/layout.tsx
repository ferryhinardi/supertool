import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/data/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'Logo Maker',
  description:
    'Free online logo maker with 1000+ icons, custom fonts, and color palettes. Create professional logos for your brand, startup, or business in minutes. Export as PNG, SVG, or PDF. No design skills required - all processing happens locally in your browser.',
  keywords: [
    'logo maker',
    'logo generator',
    'free logo maker',
    'logo creator',
    'brand logo maker',
    'business logo generator',
    'logo design tool',
    'create logo online',
    'custom logo maker',
    'startup logo',
    'company logo creator',
    'logo builder',
    'icon logo maker',
    'text logo generator',
    'minimalist logo maker',
    'modern logo design',
    'professional logo maker',
    'logo templates',
    'svg logo maker',
    'png logo generator',
  ],
  category: 'design',
  path: '/tools/logo-maker',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('Logo Maker')

const faqSchema = generateFAQSchema([
  {
    question: 'What is a logo maker and how does it work?',
    answer:
      'A logo maker is a design tool that helps you create professional logos without needing graphic design skills. Our logo maker combines icons, text, shapes, and colors to help you build a unique brand identity. Simply choose elements, customize them, and download your logo.',
  },
  {
    question: 'Is this logo maker really free?',
    answer:
      'Yes! Our logo maker is completely free to use. You can create unlimited logos, customize them with icons, fonts, and colors, and download them in PNG or SVG format without any watermarks or restrictions.',
  },
  {
    question: 'What file formats can I download my logo in?',
    answer:
      'You can download your logo in multiple formats: PNG (transparent background, great for web), SVG (vector format, infinitely scalable for print), and PDF (ideal for professional printing). All formats are included free.',
  },
  {
    question: 'Can I use the logos commercially?',
    answer:
      'Yes! All logos created with our tool are yours to use for any purpose, including commercial use. You can use them for your business, products, websites, social media, and marketing materials.',
  },
  {
    question: 'How many icons are available?',
    answer:
      'Our logo maker includes 1000+ professionally designed icons across various categories including business, technology, nature, food, sports, and more. All icons are from the Lucide icon library, which is open source and free to use.',
  },
  {
    question: 'Is my logo saved or uploaded to a server?',
    answer:
      'No! All logo creation happens locally in your browser. Your designs are never uploaded to any server, ensuring complete privacy. However, this means you should download your logo before leaving the page.',
  },
  {
    question: 'Can I edit my logo after creating it?',
    answer:
      'Yes! You can make unlimited changes to your logo design before downloading. Adjust colors, fonts, icon size, layout, and more until you are satisfied with the result.',
  },
  {
    question: 'What makes a good logo?',
    answer:
      'A good logo is simple, memorable, and versatile. It should work well at different sizes, look good in black and white, and represent your brand identity. Our tool helps you create balanced, professional-looking logos with these principles in mind.',
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
