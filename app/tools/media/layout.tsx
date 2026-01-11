import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema } from '@/lib/data/structured-data'
import { tools } from '@/lib/data/tools'

const categoryTools = tools.filter((t) => t.category === 'media')

export const metadata: Metadata = generateToolMetadata({
  title: 'Media Tools',
  description: `Optimize, convert, and enhance your media files. ${categoryTools.length}+ free online tools including image optimizer, video converter, PDF tools, and more. Fast, secure, browser-based.`,
  keywords: [
    'media tools',
    'image optimizer',
    'video converter',
    'pdf tools',
    'image compressor',
    'video compressor',
    'media converter',
    'online media tools',
    'free media tools',
    'image editor',
    'video editor',
  ],
  category: 'media',
  path: '/tools/media',
  ogTitle: 'Free Media Tools - Image Optimizer, Video Converter & More',
  ogDescription: `${categoryTools.length}+ free online tools to optimize, convert, and enhance your media files. No signup required.`,
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/' },
  { name: 'Media Tools', url: '/tools/media' },
]

function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Media Tools',
    description: 'Collection of free online media processing and optimization tools',
    numberOfItems: categoryTools.length,
    itemListElement: categoryTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      description: tool.description,
      url: `${baseUrl}${tool.href}`,
    })),
  }
}

export default function MediaToolsLayout({ children }: { children: React.ReactNode }) {
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
        id="itemlist-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateItemListSchema()),
        }}
      />
    </>
  )
}
