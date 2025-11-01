import type { Metadata } from 'next'

interface ToolMetadataParams {
  title: string
  description: string
  keywords?: string[]
  category?: string
  path: string
  ogImage?: string
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
}: ToolMetadataParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
  const fullUrl = `${baseUrl}${path}`
  const fullTitle = `${title} | SuperTool`
  const imageUrl = ogImage || `${baseUrl}/og-image.png`

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
          url: imageUrl,
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
      images: [imageUrl],
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
