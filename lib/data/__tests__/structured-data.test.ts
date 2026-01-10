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

describe('structured-data', () => {
  const baseUrl = 'https://supertool.dev'

  describe('generateWebApplicationSchema', () => {
    it('should generate valid WebApplication schema', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebApplication')
      expect(schema.name).toBe('SuperTool - Modern Developer Toolkit')
      expect(schema.url).toBe(baseUrl)
      expect(schema.applicationCategory).toBe('DeveloperApplication')
      expect(schema.operatingSystem).toBe('Any')
    })

    it('should include offers with free price', () => {
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

    it('should include language information', () => {
      const schema = generateWebApplicationSchema(baseUrl)

      expect(schema.inLanguage).toEqual(['id-ID', 'en-US'])
    })
  })

  describe('generateSoftwareApplicationSchema', () => {
    const tool = {
      name: 'JSON Beautifier',
      description: 'Format and beautify JSON data',
      url: '/tools/json-beautifier',
      category: 'Developer Tools',
      keywords: ['json', 'beautifier', 'formatter'],
    }

    it('should generate valid SoftwareApplication schema', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('SoftwareApplication')
      expect(schema.name).toBe('JSON Beautifier')
      expect(schema.description).toBe('Format and beautify JSON data')
      expect(schema.url).toBe(`${baseUrl}/tools/json-beautifier`)
    })

    it('should include keywords as comma-separated string', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.keywords).toBe('json, beautifier, formatter')
    })

    it('should include featureList as array', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.featureList).toEqual(['json', 'beautifier', 'formatter'])
    })

    it('should include free pricing', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.offers).toEqual({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      })
    })

    it('should include software version', () => {
      const schema = generateSoftwareApplicationSchema(tool, baseUrl)

      expect(schema.softwareVersion).toBe('1.0')
    })
  })

  describe('generateBreadcrumbSchema', () => {
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

    it('should generate correct itemListElement structure', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/tools' },
      ]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      })
      expect(schema.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${baseUrl}/tools`,
      })
    })

    it('should handle single item breadcrumb', () => {
      const items = [{ name: 'Home', url: '/' }]

      const schema = generateBreadcrumbSchema(items, baseUrl)

      expect(schema.itemListElement).toHaveLength(1)
      expect(schema.itemListElement[0].position).toBe(1)
    })

    it('should handle empty breadcrumb', () => {
      const schema = generateBreadcrumbSchema([], baseUrl)

      expect(schema.itemListElement).toHaveLength(0)
    })
  })

  describe('generateOrganizationSchema', () => {
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

    it('should include founding information', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.foundingDate).toBe('2024')
      expect(schema.foundingLocation).toEqual({
        '@type': 'Place',
        name: 'Indonesia',
      })
    })

    it('should include sameAs social links', () => {
      const schema = generateOrganizationSchema(baseUrl)

      expect(schema.sameAs).toContain('https://github.com/ferryhinardi/supertool')
    })
  })

  describe('generateFAQSchema', () => {
    it('should generate valid FAQPage schema', () => {
      const faqs = [
        { question: 'What is SuperTool?', answer: 'A developer toolkit.' },
        { question: 'Is it free?', answer: 'Yes, completely free.' },
      ]

      const schema = generateFAQSchema(faqs)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('FAQPage')
    })

    it('should generate correct mainEntity structure', () => {
      const faqs = [{ question: 'What is SuperTool?', answer: 'A developer toolkit.' }]

      const schema = generateFAQSchema(faqs)

      expect(schema.mainEntity).toHaveLength(1)
      expect(schema.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'What is SuperTool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A developer toolkit.',
        },
      })
    })

    it('should handle multiple FAQs', () => {
      const faqs = [
        { question: 'Q1?', answer: 'A1' },
        { question: 'Q2?', answer: 'A2' },
        { question: 'Q3?', answer: 'A3' },
      ]

      const schema = generateFAQSchema(faqs)

      expect(schema.mainEntity).toHaveLength(3)
    })

    it('should handle empty FAQs', () => {
      const schema = generateFAQSchema([])

      expect(schema.mainEntity).toHaveLength(0)
    })
  })

  describe('generateHowToSchema', () => {
    it('should generate valid HowTo schema', () => {
      const steps = [
        { name: 'Step 1', text: 'Do the first thing' },
        { name: 'Step 2', text: 'Do the second thing' },
      ]

      const schema = generateHowToSchema(
        'How to use JSON Beautifier',
        'A guide to formatting JSON',
        steps,
        baseUrl,
        '/tools/json-beautifier'
      )

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('HowTo')
      expect(schema.name).toBe('How to use JSON Beautifier')
      expect(schema.description).toBe('A guide to formatting JSON')
      expect(schema.url).toBe(`${baseUrl}/tools/json-beautifier`)
    })

    it('should generate correct step structure', () => {
      const steps = [
        { name: 'Step 1', text: 'First step text' },
        { name: 'Step 2', text: 'Second step text' },
      ]

      const schema = generateHowToSchema('Test', 'Description', steps, baseUrl, '/test')

      expect(schema.step).toHaveLength(2)
      expect(schema.step[0]).toEqual({
        '@type': 'HowToStep',
        position: 1,
        name: 'Step 1',
        text: 'First step text',
        url: undefined,
      })
      expect(schema.step[1].position).toBe(2)
    })

    it('should include step URL when provided', () => {
      const steps = [{ name: 'Step 1', text: 'Do something', url: '/step-1' }]

      const schema = generateHowToSchema('Test', 'Description', steps, baseUrl, '/test')

      expect(schema.step[0].url).toBe(`${baseUrl}/step-1`)
    })

    it('should handle steps without URL', () => {
      const steps = [{ name: 'Step 1', text: 'Do something' }]

      const schema = generateHowToSchema('Test', 'Description', steps, baseUrl, '/test')

      expect(schema.step[0].url).toBeUndefined()
    })

    it('should handle empty steps', () => {
      const schema = generateHowToSchema('Test', 'Description', [], baseUrl, '/test')

      expect(schema.step).toHaveLength(0)
    })
  })

  describe('generateWebSiteSchema', () => {
    it('should generate valid WebSite schema', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('WebSite')
      expect(schema.name).toBe('SuperTool')
      expect(schema.url).toBe(baseUrl)
    })

    it('should include SearchAction potentialAction', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.potentialAction).toEqual({
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      })
    })

    it('should include language information', () => {
      const schema = generateWebSiteSchema(baseUrl)

      expect(schema.inLanguage).toEqual(['id-ID', 'en-US'])
    })
  })

  describe('generateToolWithRatingSchema', () => {
    const tool = {
      name: 'JSON Beautifier',
      description: 'Format and beautify JSON data',
      url: '/tools/json-beautifier',
      category: 'Developer Tools',
      keywords: ['json', 'beautifier'],
    }

    it('should include aggregateRating when rating data is provided', () => {
      const ratingData = {
        averageRating: 4.5,
        totalRatings: 100,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)
      const schemaWithRating = schema as {
        aggregateRating?: {
          '@type': string
          ratingValue: string
          ratingCount: string
          bestRating: string
          worstRating: string
        }
      }

      expect(schemaWithRating.aggregateRating).toEqual({
        '@type': 'AggregateRating',
        ratingValue: '4.5',
        ratingCount: '100',
        bestRating: '5',
        worstRating: '1',
      })
    })

    it('should format rating value to one decimal place', () => {
      const ratingData = {
        averageRating: 4.567,
        totalRatings: 50,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)
      const schemaWithRating = schema as { aggregateRating?: { ratingValue: string } }

      expect(schemaWithRating.aggregateRating?.ratingValue).toBe('4.6')
    })

    it('should not include aggregateRating when rating data is null', () => {
      const schema = generateToolWithRatingSchema(tool, null, baseUrl)
      const schemaWithRating = schema as { aggregateRating?: unknown }

      expect(schemaWithRating.aggregateRating).toBeUndefined()
    })

    it('should not include aggregateRating when totalRatings is 0', () => {
      const ratingData = {
        averageRating: 0,
        totalRatings: 0,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)
      const schemaWithRating = schema as { aggregateRating?: unknown }

      expect(schemaWithRating.aggregateRating).toBeUndefined()
    })

    it('should include base software application schema properties', () => {
      const ratingData = {
        averageRating: 4.0,
        totalRatings: 10,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)

      expect(schema['@type']).toBe('SoftwareApplication')
      expect(schema.name).toBe('JSON Beautifier')
      expect(schema.url).toBe(`${baseUrl}/tools/json-beautifier`)
      expect(schema.offers).toBeDefined()
    })

    it('should handle edge case of 1 rating', () => {
      const ratingData = {
        averageRating: 5.0,
        totalRatings: 1,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)
      const schemaWithRating = schema as { aggregateRating?: { ratingCount: string } }

      expect(schemaWithRating.aggregateRating?.ratingCount).toBe('1')
    })

    it('should handle large number of ratings', () => {
      const ratingData = {
        averageRating: 4.2,
        totalRatings: 999999,
      }

      const schema = generateToolWithRatingSchema(tool, ratingData, baseUrl)
      const schemaWithRating = schema as { aggregateRating?: { ratingCount: string } }

      expect(schemaWithRating.aggregateRating?.ratingCount).toBe('999999')
    })
  })
})
