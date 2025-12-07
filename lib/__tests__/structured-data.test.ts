import { describe, expect, it } from 'vitest'
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateOrganizationSchema,
  generateSoftwareApplicationSchema,
  generateToolWithRatingSchema,
  generateWebApplicationSchema,
  generateWebSiteSchema,
} from '../structured-data'

describe('Structured Data Schemas', () => {
  const baseUrl = 'https://supertool.id'

  describe('generateWebApplicationSchema()', () => {
    it('should generate valid WebApplication schema', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebApplication')
      expect(schema.name).toBe('SuperTool - Modern Developer Toolkit')
      expect(schema.url).toBe(baseUrl)
    })

    it('should include application category', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.applicationCategory).toBe('DeveloperApplication')
      expect(schema.operatingSystem).toBe('Any')
    })

    it('should include free pricing offer', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.offers).toEqual({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      })
    })

    it('should include aggregate rating', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.aggregateRating).toEqual({
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      })
    })

    it('should include author information', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Ferry Hinardi',
        url: 'https://github.com/ferryhinardi',
      })
    })

    it('should support multiple languages', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.inLanguage).toEqual(['id-ID', 'en-US'])
    })

    it('should include browser requirements', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.browserRequirements).toContain('JavaScript')
      expect(schema.browserRequirements).toContain('modern browsers')
    })
  })

  describe('generateSoftwareApplicationSchema()', () => {
    const tool = {
      name: 'JSON Beautifier',
      description: 'Format and validate JSON with syntax highlighting',
      url: '/tools/json-beautifier',
      category: 'Developer Tools',
      keywords: ['json', 'formatter', 'validator', 'beautifier'],
    }

    it('should generate valid SoftwareApplication schema', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('SoftwareApplication')
      expect(schema.name).toBe('JSON Beautifier')
      expect(schema.description).toBe('Format and validate JSON with syntax highlighting')
    })

    it('should construct full URL from baseUrl and tool path', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.url).toBe(`${baseUrl}/tools/json-beautifier`)
    })

    it('should include keywords as comma-separated string', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.keywords).toBe('json, formatter, validator, beautifier')
    })

    it('should include keywords as feature list array', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.featureList).toEqual(['json', 'formatter', 'validator', 'beautifier'])
    })

    it('should include free pricing offer', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.offers).toEqual({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      })
    })

    it('should set software version', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.softwareVersion).toBe('1.0')
    })

    it('should include author information', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Ferry Hinardi',
        url: 'https://github.com/ferryhinardi',
      })
    })

    it('should support multiple languages', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.inLanguage).toEqual(['id-ID', 'en-US'])
    })

    it('should handle empty keywords array', () => {
      const toolWithoutKeywords = { ...tool, keywords: [] }
      const schema = generateSoftwareApplicationSchema(toolWithoutKeywords, baseUrl)

      expect(schema.keywords).toBe('')
      expect(schema.featureList).toEqual([])
    })
  })

  describe('generateBreadcrumbSchema()', () => {
    it('should generate valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/tools' },
        { name: 'JSON Beautifier', url: '/tools/json-beautifier' },
      ]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BreadcrumbList')
    })

    it('should create itemListElement with correct positions', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/tools' },
      ]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[1].position).toBe(2)
    })

    it('should construct full URLs for each item', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/tools' },
      ]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement[0].item).toBe(`${baseUrl}/`)
      expect(schema.itemListElement[1].item).toBe(`${baseUrl}/tools`)
    })

    it('should preserve item names', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Developer Tools', url: '/tools' },
      ]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[1].name).toBe('Developer Tools')
    })

    it('should handle single item', () => {
      const items = [{ name: 'Home', url: '/' }]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement).toHaveLength(1)
      expect(schema.itemListElement[0].position).toBe(1)
    })

    it('should handle empty items array', () => {
      const schema = generateBreadcrumbSchema([], baseUrl)

      expect(schema.itemListElement).toEqual([])
    })

    it('should set correct @type for each item', () => {
      const items = [{ name: 'Home', url: '/' }]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement[0]['@type']).toBe('ListItem')
    })
  })

  describe('generateOrganizationSchema()', () => {
    it('should generate valid Organization schema', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Organization')
      expect(schema.name).toBe('SuperTool')
      expect(schema.url).toBe(baseUrl)
    })

    it('should include logo URL', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.logo).toBe(`${baseUrl}/icon.png`)
    })

    it('should include description', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.description).toContain('Professional toolkit')
      expect(schema.description).toContain('developers')
    })

    it('should include social media links', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.sameAs).toEqual(['https://github.com/ferryhinardi/supertool'])
    })

    it('should include founding date', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.foundingDate).toBe('2024')
    })

    it('should include founding location', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.foundingLocation).toEqual({
        '@type': 'Place',
        name: 'Indonesia',
      })
    })
  })

  describe('generateFAQSchema()', () => {
    const faqs = [
      {
        question: 'What is SuperTool?',
        answer: 'SuperTool is a collection of free online tools for developers.',
      },
      {
        question: 'Is it free to use?',
        answer: 'Yes, all tools are completely free.',
      },
    ]

    it('should generate valid FAQPage schema', () => {
      const schema = generateFAQSchema(faqs)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('FAQPage')
    })

    it('should create Question entities for each FAQ', () => {
      const schema = generateFAQSchema(faqs)

      expect(schema.mainEntity).toHaveLength(2)
      expect(schema.mainEntity[0]['@type']).toBe('Question')
      expect(schema.mainEntity[1]['@type']).toBe('Question')
    })

    it('should preserve question text', () => {
      const schema = generateFAQSchema(faqs)

      expect(schema.mainEntity[0].name).toBe('What is SuperTool?')
      expect(schema.mainEntity[1].name).toBe('Is it free to use?')
    })

    it('should create Answer entities with correct text', () => {
      const schema = generateFAQSchema(faqs)

      expect(schema.mainEntity[0].acceptedAnswer).toEqual({
        '@type': 'Answer',
        text: 'SuperTool is a collection of free online tools for developers.',
      })

      expect(schema.mainEntity[1].acceptedAnswer).toEqual({
        '@type': 'Answer',
        text: 'Yes, all tools are completely free.',
      })
    })

    it('should handle empty FAQ array', () => {
      const schema = generateFAQSchema([])

      expect(schema.mainEntity).toEqual([])
    })

    it('should handle single FAQ', () => {
      const singleFaq = [{ question: 'Is it free?', answer: 'Yes' }]

      const schema = generateFAQSchema(singleFaq)

      expect(schema.mainEntity).toHaveLength(1)
    })
  })

  describe('generateHowToSchema()', () => {
    const steps = [
      { name: 'Step 1', text: 'Open the tool' },
      { name: 'Step 2', text: 'Enter your data' },
      { name: 'Step 3', text: 'Click generate', url: '/tools/json' },
    ]

    it('should generate valid HowTo schema', () => {
      const schema = generateHowToSchema(
        'How to use JSON Beautifier',
        'Learn how to format JSON',
        steps,
        baseUrl,
        '/tools/json-beautifier'
      )

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('HowTo')
    })

    it('should include name and description', () => {
      const schema = generateHowToSchema(
        'How to use JSON Beautifier',
        'Learn how to format JSON',
        steps,
        baseUrl,
        '/tools/json-beautifier'
      )

      expect(schema.name).toBe('How to use JSON Beautifier')
      expect(schema.description).toBe('Learn how to format JSON')
    })

    it('should construct full URL', () => {
      const schema = generateHowToSchema(
        'How to use JSON Beautifier',
        'Learn how to format JSON',
        steps,
        baseUrl,
        '/tools/json-beautifier'
      )

      expect(schema.url).toBe(`${baseUrl}/tools/json-beautifier`)
    })

    it('should create HowToStep for each step', () => {
      const schema = generateHowToSchema(
        'How to use tool',
        'Description',
        steps,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step).toHaveLength(3)
      expect(schema.step[0]['@type']).toBe('HowToStep')
    })

    it('should set correct positions for steps', () => {
      const schema = generateHowToSchema(
        'How to use tool',
        'Description',
        steps,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step[0].position).toBe(1)
      expect(schema.step[1].position).toBe(2)
      expect(schema.step[2].position).toBe(3)
    })

    it('should preserve step names and text', () => {
      const schema = generateHowToSchema(
        'How to use tool',
        'Description',
        steps,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step[0].name).toBe('Step 1')
      expect(schema.step[0].text).toBe('Open the tool')
      expect(schema.step[1].name).toBe('Step 2')
      expect(schema.step[1].text).toBe('Enter your data')
    })

    it('should include step URL if provided', () => {
      const schema = generateHowToSchema(
        'How to use tool',
        'Description',
        steps,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step[2].url).toBe(`${baseUrl}/tools/json`)
    })

    it('should set URL to undefined if not provided', () => {
      const schema = generateHowToSchema(
        'How to use tool',
        'Description',
        steps,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step[0].url).toBeUndefined()
      expect(schema.step[1].url).toBeUndefined()
    })

    it('should handle single step', () => {
      const singleStep = [{ name: 'Only step', text: 'Do this' }]

      const schema = generateHowToSchema(
        'Simple guide',
        'Easy steps',
        singleStep,
        baseUrl,
        '/tools/test'
      )

      expect(schema.step).toHaveLength(1)
      expect(schema.step[0].position).toBe(1)
    })
  })

  describe('generateWebSiteSchema()', () => {
    it('should generate valid WebSite schema', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebSite')
      expect(schema.name).toBe('SuperTool')
      expect(schema.url).toBe(baseUrl)
    })

    it('should include description', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.description).toContain('40+')
      expect(schema.description).toContain('free tools')
    })

    it('should include SearchAction', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.potentialAction['@type']).toBe('SearchAction')
    })

    it('should configure search URL template', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.potentialAction.target['@type']).toBe('EntryPoint')
      expect(schema.potentialAction.target.urlTemplate).toBe(
        `${baseUrl}/?search={search_term_string}`
      )
    })

    it('should require search query input', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.potentialAction['query-input']).toBe('required name=search_term_string')
    })

    it('should support multiple languages', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.inLanguage).toEqual(['id-ID', 'en-US'])
    })
  })

  describe('generateToolWithRatingSchema()', () => {
    const tool = {
      name: 'JSON Beautifier',
      description: 'Format JSON',
      url: '/tools/json-beautifier',
      category: 'Developer Tools',
      keywords: ['json', 'formatter'],
    }

    it('should return base schema without rating if no rating data', () => {
      const schema = generateToolWithRatingSchema(tool, null, baseUrl) as any

      expect(schema.name).toBe('JSON Beautifier')
      expect(schema.aggregateRating).toBeUndefined()
    })

    it('should return base schema if totalRatings is 0', () => {
      const ratingData = { averageRating: 4.5, totalRatings: 0 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating).toBeUndefined()
    })

    it('should include aggregateRating if rating data exists', () => {
      const ratingData = { averageRating: 4.7, totalRatings: 150 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating).toBeDefined()
      expect(schema.aggregateRating['@type']).toBe('AggregateRating')
    })

    it('should format rating value to 1 decimal place', () => {
      const ratingData = { averageRating: 4.678, totalRatings: 100 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating.ratingValue).toBe('4.7')
    })

    it('should convert rating count to string', () => {
      const ratingData = { averageRating: 4.5, totalRatings: 250 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating.ratingCount).toBe('250')
    })

    it('should set rating bounds', () => {
      const ratingData = { averageRating: 4.5, totalRatings: 100 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating.bestRating).toBe('5')
      expect(schema.aggregateRating.worstRating).toBe('1')
    })

    it('should preserve base schema properties with rating', () => {
      const ratingData = { averageRating: 4.5, totalRatings: 100 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)

      expect(schema.name).toBe('JSON Beautifier')
      expect(schema.description).toBe('Format JSON')
      expect(schema['@type']).toBe('SoftwareApplication')
    })

    it('should handle rating of 5.0', () => {
      const ratingData = { averageRating: 5.0, totalRatings: 50 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating.ratingValue).toBe('5.0')
    })

    it('should handle rating of 1.0', () => {
      const ratingData = { averageRating: 1.0, totalRatings: 5 }
      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl) as any

      expect(schema.aggregateRating.ratingValue).toBe('1.0')
    })
  })
})
