import type { Metadata } from 'next'
import Script from 'next/script'
import type { CategoryHubId } from '@/lib/data/category-hubs'
import { CATEGORY_HUBS, getCategoryTools } from '@/lib/data/category-hubs'
import { generateToolMetadata } from '@/lib/data/metadata'
import { generateBreadcrumbSchema } from '@/lib/data/structured-data'

export function createCategoryHubMetadata(category: CategoryHubId): Metadata {
  const hub = CATEGORY_HUBS[category]
  const count = getCategoryTools(category).length

  return generateToolMetadata({
    title: hub.title,
    description: `${hub.description} ${count}+ free tools. Fast, secure, browser-based.`,
    keywords: hub.keywords,
    category: hub.shortName.toLowerCase(),
    path: hub.path,
    ogTitle: hub.ogTitle,
    ogDescription: hub.ogDescription(count),
  })
}

export function CategoryHubJsonLd({ category }: { category: CategoryHubId }) {
  const hub = CATEGORY_HUBS[category]
  const categoryTools = getCategoryTools(category)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/' },
    { name: hub.shortName, url: hub.path },
  ]

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: hub.title,
    description: hub.description,
    numberOfItems: categoryTools.length,
    itemListElement: categoryTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      description: tool.description,
      url: `${baseUrl}${tool.href}`,
    })),
  }

  return (
    <>
      <Script
        id={`${category}-breadcrumb-schema`}
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs, baseUrl)),
        }}
      />
      <Script
        id={`${category}-itemlist-schema`}
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
    </>
  )
}
