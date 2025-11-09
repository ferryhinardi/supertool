import type { Metadata } from 'next'

interface ToolMetadataParams {
  title: string
  description: string
  keywords?: string[]
  category?: string
  path: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  twitterCreator?: string
}

interface BreadcrumbItem {
  name: string
  url: string
}

export function generateToolMetadata({
  title,
  description,
  keywords = [],
  category = 'web tools',
  path,
  ogImage,
  ogTitle,
  ogDescription,
  twitterCreator,
}: ToolMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
  const fullUrl = `${baseUrl}${path}`
  const fullTitle = `${title} | SuperTool`
  const imageUrl = ogImage || `${baseUrl}/og-image.png`

  // Use custom OG title/description if provided, otherwise fall back to defaults
  const openGraphTitle = ogTitle || fullTitle
  const openGraphDescription = ogDescription || description

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
      title: openGraphTitle,
      description: openGraphDescription,
      url: fullUrl,
      siteName: 'SuperTool',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle || title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle || fullTitle,
      description: ogDescription || description,
      images: [imageUrl],
      creator: twitterCreator || '@SuperToolID',
      site: '@SuperToolID',
    },
    alternates: {
      canonical: fullUrl,
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
    category,
  }
}

/**
 * Generate breadcrumb items for a tool page
 * @param toolName - The display name of the tool
 * @param toolPath - Optional URL path of the tool (defaults to empty string)
 * @returns Array of breadcrumb items
 */
export function generateToolBreadcrumbs(toolName: string, toolPath = ''): BreadcrumbItem[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/' },
    { name: toolName, url: toolPath }, // Current page
  ]
}
