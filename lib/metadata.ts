import type { Metadata } from 'next'

interface ToolMetadataParams {
  title: string
  description: string
  keywords?: string[]
  category?: string
  path: string
}

export function generateToolMetadata({
  title,
  description,
  keywords = [],
  category = 'web tools',
  path,
}: ToolMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.dev'
  const fullUrl = `${baseUrl}${path}`
  const fullTitle = `${title} | SuperTool`

  const defaultKeywords = [
    'free online tool',
    'web tool',
    'developer tool',
    'productivity tool',
    'supertool',
  ]

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...defaultKeywords],
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'SuperTool',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    category,
  }
}
