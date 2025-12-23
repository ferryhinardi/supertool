import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/data/structured-data'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.app'

export const metadata: Metadata = generateToolMetadata({
  title: 'AI Text Rewriter - Rewrite Content with Different Tones',
  description:
    'Rewrite any text with AI in different tones and styles. Transform content to be professional, casual, friendly, formal, persuasive, creative, or more. Generate multiple variants with tone adjustment and style control. Free AI-powered text rewriting tool.',
  keywords: [
    'AI text rewriter',
    'text rewriting tool',
    'content rewriter',
    'tone adjustment',
    'writing style changer',
    'text tone converter',
    'professional tone rewriter',
    'casual tone rewriter',
    'AI content rewriting',
    'rewrite text online',
    'text improvement',
    'writing assistant',
    'AI writing tool',
    'content optimization',
    'text transformation',
  ],
  category: 'productivity',
  path: '/tools/ai-text-rewriter',
})

// Structured data for SEO
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/#tools' },
    { name: 'AI Text Rewriter', url: '/tools/ai-text-rewriter' },
  ],
  baseUrl
)

const softwareSchema = generateSoftwareApplicationSchema(
  {
    name: 'AI Text Rewriter',
    description:
      'Rewrite any text with AI in different tones and styles. Generate multiple variants with professional, casual, friendly, formal, persuasive, creative tones and more.',
    url: '/tools/ai-text-rewriter',
    category: 'productivity',
    keywords: [
      'AI text rewriter',
      'content rewriter',
      'tone adjustment',
      'writing style changer',
      'text improvement',
    ],
  },
  baseUrl
)

const faqSchema = generateFAQSchema([
  {
    question: 'What is the AI Text Rewriter tool?',
    answer:
      'The AI Text Rewriter is an AI-powered tool that rewrites your text in different tones and styles. It offers 10 tone options (professional, casual, friendly, formal, persuasive, creative, concise, detailed, humorous, empathetic) and 3 style levels (simple, balanced, advanced) to help you transform your content for any purpose.',
  },
  {
    question: 'How does the AI text rewriting work?',
    answer:
      'Simply paste your text (up to 5000 characters), select your desired tone and style, choose how many variants you want (1-3), and click "Rewrite Text". Our AI will analyze your content and generate rewritten versions that maintain the original meaning while adjusting the tone and style according to your preferences.',
  },
  {
    question: 'What tone options are available?',
    answer:
      'The tool offers 10 tone options: Professional (for business communication), Casual (relaxed and conversational), Friendly (warm and approachable), Formal (corporate and academic), Persuasive (convincing and compelling), Creative (imaginative and unique), Concise (brief and to the point), Detailed (comprehensive and thorough), Humorous (light and entertaining), and Empathetic (understanding and supportive).',
  },
  {
    question: 'Is my text data secure?',
    answer:
      'Yes, your text is processed securely and is not stored on our servers. The data is sent to OpenAI API for rewriting and immediately discarded after processing. We prioritize your privacy and data security.',
  },
  {
    question: 'Can I generate multiple versions of my text?',
    answer:
      'Yes! You can generate 1 to 3 different variants of your rewritten text in a single request. This allows you to compare different versions and choose the one that best fits your needs.',
  },
])

const howToSchema = generateHowToSchema(
  'How to Rewrite Text with AI',
  'Learn how to rewrite and improve your text using AI-powered tone and style adjustment',
  [
    {
      name: 'Enter Your Text',
      text: 'Paste or type your text (up to 5000 characters) into the text area on the AI Text Rewriter page.',
    },
    {
      name: 'Select Tone and Style',
      text: 'Choose from 10 different tones (professional, casual, friendly, etc.) and select your preferred style level (simple, balanced, or advanced).',
    },
    {
      name: 'Set Number of Variants',
      text: 'Use the slider to choose how many rewritten versions you want to generate (1-3 variants).',
    },
    {
      name: 'Rewrite and Review',
      text: 'Click "Rewrite Text" button and review the AI-generated variants with key improvements and suggestions.',
    },
    {
      name: 'Copy Results',
      text: 'Use the copy button to save your preferred rewritten version to your clipboard.',
    },
  ],
  baseUrl,
  '/tools/ai-text-rewriter'
)

export default function AITextRewriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Using JSON.stringify for structured data - safe
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  )
}
