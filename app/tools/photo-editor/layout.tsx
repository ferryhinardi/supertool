import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolBreadcrumbs, generateToolMetadata } from '@/lib/metadata'
import { generateBreadcrumbSchema, generateFAQSchema } from '@/lib/structured-data'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Photo Editor - Free Online Image Editor with AI Generation',
  description:
    'Professional photo editor with AI image generation, advanced filters, and adjustments. Edit photos online for free with brightness, contrast, saturation controls, filters, and AI-powered DALL-E image creation.',
  keywords: [
    'photo editor',
    'image editor',
    'online photo editing',
    'free photo editor',
    'ai image generator',
    'dall-e',
    'picture editor',
    'edit photos online',
    'image filters',
    'photo effects',
    'brightness adjustment',
    'contrast editor',
    'saturation tool',
    'ai photo editor',
  ],
  category: 'design',
  path: '/tools/photo-editor',
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
const breadcrumbs = generateToolBreadcrumbs('AI Photo Editor')

const faqs = [
  {
    question: 'What is the AI Photo Editor?',
    answer:
      'The AI Photo Editor is a free online tool that combines professional photo editing features with AI-powered image generation. Edit existing photos with filters, adjustments, and transformations, or generate new images using AI DALL-E technology. All processing happens in your browser for complete privacy.',
  },
  {
    question: 'Can I generate images with AI?',
    answer:
      'Yes! Our premium AI image generation feature uses OpenAI DALL-E to create images from text descriptions. Simply describe what you want to see, and the AI will generate a unique image that you can then edit with our professional editing tools.',
  },
  {
    question: 'What photo editing features are available?',
    answer:
      'The photo editor includes professional filters (grayscale, sepia, vintage, cool, warm), adjustments (brightness, contrast, saturation), and transform tools (rotate, flip). Premium features include advanced filters and AI generation. All edits are processed locally in your browser.',
  },
  {
    question: 'Is the photo editor free to use?',
    answer:
      'Yes, the basic photo editor is completely free with essential filters and adjustments. Premium features like advanced filters, AI image generation with DALL-E, and unlimited exports are available with a subscription. No registration required for basic features.',
  },
]

export default function PhotoEditorLayout({ children }: { children: React.ReactNode }) {
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
