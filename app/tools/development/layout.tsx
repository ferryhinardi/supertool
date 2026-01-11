import type { Metadata } from 'next'
import Script from 'next/script'
import { generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema } from '@/lib/data/structured-data'
import { tools } from '@/lib/data/tools'

const categoryTools = tools.filter((t) => t.category === 'development')

export const metadata: Metadata = generateToolMetadata({
  title: 'Developer Tools',
  description: `Essential utilities for developers. ${categoryTools.length}+ free online tools including code formatter, regex tester, diff viewer, JSON validator, and more. Fast, secure, browser-based.`,
  keywords: [
    'developer tools',
    'code formatter',
    'regex tester',
    'diff viewer',
    'json validator',
    'code beautifier',
    'programming tools',
    'online dev tools',
    'free developer tools',
    'web developer tools',
    'code utilities',
  ],
  category: 'development',
  path: '/tools/development',
  ogTitle: 'Free Developer Tools - Code Formatter, Regex Tester & More',
  ogDescription: `${categoryTools.length}+ essential free online tools for developers. Code formatter, regex tester, diff viewer, and more. No signup required.`,
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Tools', url: '/' },
  { name: 'Developer Tools', url: '/tools/development' },
]

function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Developer Tools',
    description: 'Collection of free online developer tools and utilities',
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

export default function DevelopmentToolsLayout({ children }: { children: React.ReactNode }) {
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
