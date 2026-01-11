import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema } from '@/lib/data/structured-data'
import { tools } from '@/lib/data/tools'

const categoryTools = tools.filter((t) => t.category === 'productivity')

export const metadata: Metadata = generateToolMetadata({
  title: 'Productivity Tools',
  description: `Boost your daily workflow and efficiency. ${categoryTools.length}+ free online productivity tools including task manager, note taking, time tracking, and more. Fast, secure, browser-based.`,
  keywords: [
    'productivity tools',
    'task manager',
    'note taking',
    'time tracking',
    'workflow tools',
    'efficiency tools',
    'online productivity',
    'free productivity tools',
    'work tools',
    'time management',
  ],
  category: 'productivity',
  path: '/tools/productivity',
  ogTitle: 'Free Productivity Tools - Boost Your Daily Workflow',
  ogDescription: `${categoryTools.length}+ free online tools to boost your productivity and efficiency. No signup required.`,
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/' },
  { name: 'Productivity', url: '/tools/productivity' },
]

function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Productivity Tools',
    description: 'Collection of free online productivity and workflow tools',
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

export default function ProductivityToolsLayout({ children }: { children: React.ReactNode }) {
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
