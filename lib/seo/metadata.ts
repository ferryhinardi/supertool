import type { Metadata } from 'next'

export interface ToolMetadataConfig {
  title: string
  description: string
  keywords: string[]
  category: string
  path: string
  features?: string[]
  ogImagePath?: string
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

/**
 * Generate comprehensive metadata for a tool page
 * Includes title, description, keywords, Open Graph, and Twitter Card data
 */
export function generateToolMetadata(config: ToolMetadataConfig): Metadata {
  const { title, description, keywords, category, path, features = [], ogImagePath } = config

  // Ensure description is within optimal length (155-160 chars)
  const metaDescription =
    description.length > 160 ? `${description.substring(0, 157)}...` : description

  // Construct full page title with brand
  const fullTitle = `${title} - Free Online ${category} Tool | SuperTool`

  // Generate Open Graph image URL
  const ogImage = ogImagePath
    ? `${baseUrl}${ogImagePath}`
    : `${baseUrl}/og-images/${path.split('/').pop()}.png`

  // Combine default keywords with tool-specific keywords
  const allKeywords = [
    ...keywords,
    'free online tool',
    'no signup required',
    'privacy focused',
    'developer tools',
    'web tools',
    category.toLowerCase(),
  ]

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: allKeywords,
    authors: [{ name: 'Ferry Hinardi', url: 'https://github.com/ferryhinardi' }],
    creator: 'SuperTool',
    publisher: 'SuperTool',
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      alternateLocale: ['en_US'],
      url: `${baseUrl}${path}`,
      title: fullTitle,
      description: metaDescription,
      siteName: 'SuperTool',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - SuperTool`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      creator: '@ferryhinardi',
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // Additional metadata for better SEO
    other: {
      'application-name': 'SuperTool',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': 'SuperTool',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#000000',
      'msapplication-tap-highlight': 'no',
      ...(features.length > 0 && { 'tool-features': features.join(', ') }),
    },
  }
}

/**
 * Common FAQ items that can be reused across similar tools
 */
export const commonFAQs = {
  isItFree: {
    question: 'Is this tool completely free to use?',
    answer:
      'Yes, this tool is 100% free with no hidden costs. You can use all features without creating an account or providing payment information.',
  },
  dataPrivacy: {
    question: 'Is my data safe? Do you store my files?',
    answer:
      'Your privacy is our priority. All processing happens in your browser (client-side). We never upload or store your files on our servers. Your data never leaves your device.',
  },
  noSignup: {
    question: 'Do I need to sign up or create an account?',
    answer:
      'No signup required! You can start using the tool immediately without any registration. We believe in friction-free access to productivity tools.',
  },
  browserCompatibility: {
    question: 'Which browsers are supported?',
    answer:
      'This tool works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. For the best experience, we recommend using the latest version of your browser.',
  },
  mobileSupport: {
    question: 'Can I use this tool on mobile devices?',
    answer:
      'Yes! This tool is fully responsive and works perfectly on smartphones and tablets. You can use it on any device with a modern web browser.',
  },
  limitationsAndRestrictions: {
    question: 'Are there any limitations or file size restrictions?',
    answer:
      'Since processing happens in your browser, limitations depend on your device capabilities. Most modern devices can handle files up to several hundred megabytes without issues.',
  },
  offlineUsage: {
    question: 'Can I use this tool offline?',
    answer:
      'Once the page loads, many features work offline since processing happens in your browser. However, you need an initial internet connection to access the tool.',
  },
  supportContact: {
    question: 'How can I report issues or request features?',
    answer:
      'We love feedback! You can report issues or suggest features through our GitHub repository or contact us directly through the feedback form on our website.',
  },
}

/**
 * Generate SEO-friendly FAQ section with schema markup
 */
export interface FAQItem {
  question: string
  answer: string
}

export function generateFAQsForTool(
  toolSpecificFAQs: FAQItem[],
  includeCommon: Array<keyof typeof commonFAQs> = [
    'isItFree',
    'dataPrivacy',
    'noSignup',
    'browserCompatibility',
  ]
): FAQItem[] {
  const commonItems = includeCommon.map((key) => commonFAQs[key])
  return [...toolSpecificFAQs, ...commonItems]
}

/**
 * Generate "How It Works" steps for structured data
 */
export interface HowToStep {
  name: string
  text: string
  image?: string
}

export function generateHowToSteps(steps: HowToStep[]): HowToStep[] {
  return steps.map((step, index) => ({
    ...step,
    name: `${index + 1}. ${step.name}`,
  }))
}

/**
 * Keyword templates for different tool categories
 */
export const categoryKeywords = {
  data: [
    'data formatter',
    'data converter',
    'data parser',
    'online data tool',
    'free data utility',
  ],
  media: ['image tool', 'video tool', 'media converter', 'online media editor', 'free media tool'],
  development: [
    'developer tool',
    'coding tool',
    'programming utility',
    'dev tool online',
    'code helper',
  ],
  productivity: [
    'productivity tool',
    'work efficiency',
    'business tool',
    'online utility',
    'time saver',
  ],
  security: [
    'security tool',
    'encryption tool',
    'privacy tool',
    'secure online tool',
    'safety utility',
  ],
  finance: ['finance tool', 'calculator', 'financial utility', 'money tool', 'budget helper'],
  design: ['design tool', 'creative tool', 'graphic tool', 'design utility', 'visual editor'],
}

/**
 * Get category-specific keywords
 */
export function getCategoryKeywords(category: keyof typeof categoryKeywords): string[] {
  return categoryKeywords[category] || []
}
