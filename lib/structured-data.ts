interface Tool {
  name: string
  description: string
  url: string
  category: string
  keywords: string[]
}

interface FAQItem {
  question: string
  answer: string
}

interface HowToStep {
  name: string
  text: string
  url?: string
}

export function generateWebApplicationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SuperTool - Modern Developer Toolkit',
    description:
      'Professional toolkit with 40+ free tools for developers and productivity enthusiasts. Fast, secure, and privacy-focused online tools.',
    url: baseUrl,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Works on all modern browsers.',
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
    inLanguage: ['id-ID', 'en-US'],
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
    inLanguage: ['id-ID', 'en-US'],
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
    description:
      'Professional toolkit for developers and productivity enthusiasts. Free, fast, and privacy-focused online tools.',
    sameAs: ['https://github.com/ferryhinardi/supertool'],
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Indonesia',
    },
  }
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  baseUrl: string,
  toolUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: name,
    description: description,
    url: `${baseUrl}${toolUrl}`,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url ? `${baseUrl}${step.url}` : undefined,
    })),
  }
}

export function generateWebSiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SuperTool',
    url: baseUrl,
    description:
      'Professional toolkit with 40+ free tools for developers and productivity enthusiasts',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['id-ID', 'en-US'],
  }
}
