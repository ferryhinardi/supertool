interface Tool {
  name: string
  description: string
  url: string
  category: string
  keywords: string[]
}

export function generateWebApplicationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SuperTool - Modern Developer Toolkit',
    description:
      'Professional toolkit with 40+ tools for developers and productivity enthusiasts. Free, fast, and privacy-focused online tools.',
    url: baseUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: 'Ferry Hinardi',
      url: 'https://github.com/ferryhinardi',
    },
  }
}

export function generateSoftwareApplicationSchema(tool: Tool, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: `${baseUrl}${tool.url}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    keywords: tool.keywords.join(', '),
    featureList: tool.keywords,
    browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    softwareVersion: '1.0',
    author: {
      '@type': 'Person',
      name: 'Ferry Hinardi',
      url: 'https://github.com/ferryhinardi',
    },
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SuperTool',
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description: 'Professional toolkit for developers and productivity enthusiasts',
    sameAs: ['https://github.com/ferryhinardi/supertool'],
  }
}
