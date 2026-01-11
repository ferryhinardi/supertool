import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema } from '@/lib/data/structured-data'
import { tools } from '@/lib/data/tools'

const categoryTools = tools.filter((t) => t.category === 'data')

export const metadata: Metadata = generateToolMetadata({
  title: 'Data Processing Tools',
  description: `Free online data processing tools to transform, convert, and format your data. ${categoryTools.length}+ tools including JSON beautifier, CSV converter, XML formatter, and more. Fast, secure, browser-based.`,
  keywords: [
    'data processing tools',
    'json formatter',
    'json beautifier',
    'csv converter',
    'xml formatter',
    'data converter',
    'data transformer',
    'online data tools',
    'free data tools',
    'json to csv',
    'csv to json',
    'data format',
  ],
  category: 'data processing',
  path: '/tools/data',
  ogTitle: 'Free Data Processing Tools - Transform, Convert & Format Data Online',
  ogDescription: `${categoryTools.length}+ free online tools to transform, convert, and format your data. JSON beautifier, CSV converter, and more. No signup required.`,
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/' },
  { name: 'Data Processing', url: '/tools/data' },
]

function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Data Processing Tools',
    description: 'Collection of free online data processing and transformation tools',
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

export default function DataToolsLayout({ children }: { children: React.ReactNode }) {
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
