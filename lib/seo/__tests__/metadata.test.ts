import { describe, expect, it } from 'vitest'

import {
  categoryKeywords,
  commonFAQs,
  generateFAQsForTool,
  generateHowToSteps,
  generateToolMetadata,
  getCategoryKeywords,
} from '../metadata'

describe('generateToolMetadata', () => {
  it('generates complete metadata for a tool', () => {
    const config = {
      title: 'JSON Formatter',
      description: 'Format and beautify JSON data with syntax highlighting.',
      keywords: ['json', 'formatter', 'beautify'],
      category: 'Data',
      path: '/tools/json-formatter',
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.title).toBe('JSON Formatter - Free Online Data Tool | SuperTool')
    expect(metadata.description).toBe('Format and beautify JSON data with syntax highlighting.')
    expect(metadata.keywords).toContain('json')
    expect(metadata.keywords).toContain('formatter')
    expect(metadata.keywords).toContain('free online tool')
    expect(metadata.keywords).toContain('data')
    expect(metadata.creator).toBe('SuperTool')
    expect(metadata.publisher).toBe('SuperTool')
  })

  it('truncates long descriptions to 160 characters', () => {
    const longDescription =
      'This is a very long description that exceeds 160 characters. It keeps going and going with more text to ensure we definitely exceed the limit for meta descriptions in SEO.'

    const config = {
      title: 'Test Tool',
      description: longDescription,
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.description?.length).toBeLessThanOrEqual(160)
    expect(metadata.description).toMatch(/\.\.\.$/)
  })

  it('includes Open Graph metadata', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)
    const og = metadata.openGraph as Record<string, unknown>

    expect(og).toBeDefined()
    expect(og.type).toBe('website')
    expect(og.locale).toBe('id_ID')
    expect(og.siteName).toBe('SuperTool')
    expect(og.title).toBe('Test Tool - Free Online Test Tool | SuperTool')
    expect(og.images).toHaveLength(1)
  })

  it('includes Twitter Card metadata', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)
    const twitter = metadata.twitter as Record<string, unknown>

    expect(twitter).toBeDefined()
    expect(twitter.card).toBe('summary_large_image')
    expect(twitter.creator).toBe('@ferryhinardi')
  })

  it('uses custom ogImagePath when provided', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
      ogImagePath: '/custom/og-image.png',
    }

    const metadata = generateToolMetadata(config)
    const ogImages = metadata.openGraph?.images as Array<{ url: string }>

    expect(ogImages[0].url).toContain('/custom/og-image.png')
  })

  it('generates default og image path from tool path', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/json-formatter',
    }

    const metadata = generateToolMetadata(config)
    const ogImages = metadata.openGraph?.images as Array<{ url: string }>

    expect(ogImages[0].url).toContain('/og-images/json-formatter.png')
  })

  it('includes features in other metadata when provided', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.other?.['tool-features']).toBe('Feature 1, Feature 2, Feature 3')
  })

  it('includes canonical URL in alternates', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.alternates?.canonical).toContain('/tools/test')
  })

  it('includes robots configuration', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.robots).toBeDefined()
    expect((metadata.robots as { index: boolean }).index).toBe(true)
    expect((metadata.robots as { follow: boolean }).follow).toBe(true)
  })

  it('includes mobile web app metadata', () => {
    const config = {
      title: 'Test Tool',
      description: 'Test description.',
      keywords: ['test'],
      category: 'Test',
      path: '/tools/test',
    }

    const metadata = generateToolMetadata(config)

    expect(metadata.other?.['application-name']).toBe('SuperTool')
    expect(metadata.other?.['apple-mobile-web-app-capable']).toBe('yes')
    expect(metadata.other?.['mobile-web-app-capable']).toBe('yes')
  })
})

describe('commonFAQs', () => {
  it('contains expected FAQ keys', () => {
    expect(commonFAQs).toHaveProperty('isItFree')
    expect(commonFAQs).toHaveProperty('dataPrivacy')
    expect(commonFAQs).toHaveProperty('noSignup')
    expect(commonFAQs).toHaveProperty('browserCompatibility')
    expect(commonFAQs).toHaveProperty('mobileSupport')
    expect(commonFAQs).toHaveProperty('limitationsAndRestrictions')
    expect(commonFAQs).toHaveProperty('offlineUsage')
    expect(commonFAQs).toHaveProperty('supportContact')
  })

  it('each FAQ has question and answer', () => {
    for (const key of Object.keys(commonFAQs)) {
      const faq = commonFAQs[key as keyof typeof commonFAQs]
      expect(faq.question).toBeDefined()
      expect(faq.answer).toBeDefined()
      expect(typeof faq.question).toBe('string')
      expect(typeof faq.answer).toBe('string')
      expect(faq.question.length).toBeGreaterThan(0)
      expect(faq.answer.length).toBeGreaterThan(0)
    }
  })
})

describe('generateFAQsForTool', () => {
  it('combines tool-specific FAQs with common FAQs', () => {
    const toolFAQs = [
      { question: 'How do I format JSON?', answer: 'Paste your JSON and click format.' },
    ]

    const result = generateFAQsForTool(toolFAQs)

    expect(result).toHaveLength(5) // 1 tool-specific + 4 default common
    expect(result[0].question).toBe('How do I format JSON?')
    expect(result[1].question).toBe(commonFAQs.isItFree.question)
  })

  it('includes only specified common FAQs', () => {
    const toolFAQs = [{ question: 'Custom Q?', answer: 'Custom A.' }]

    const result = generateFAQsForTool(toolFAQs, ['isItFree', 'dataPrivacy'])

    expect(result).toHaveLength(3) // 1 tool-specific + 2 common
    expect(result[1].question).toBe(commonFAQs.isItFree.question)
    expect(result[2].question).toBe(commonFAQs.dataPrivacy.question)
  })

  it('returns only tool FAQs when includeCommon is empty', () => {
    const toolFAQs = [
      { question: 'Q1?', answer: 'A1.' },
      { question: 'Q2?', answer: 'A2.' },
    ]

    const result = generateFAQsForTool(toolFAQs, [])

    expect(result).toHaveLength(2)
    expect(result[0].question).toBe('Q1?')
    expect(result[1].question).toBe('Q2?')
  })

  it('returns only common FAQs when tool FAQs is empty', () => {
    const result = generateFAQsForTool([])

    expect(result).toHaveLength(4) // 4 default common FAQs
  })
})

describe('generateHowToSteps', () => {
  it('adds numbered prefixes to step names', () => {
    const steps = [
      { name: 'Upload your file', text: 'Click the upload button or drag and drop.' },
      { name: 'Configure settings', text: 'Adjust the settings as needed.' },
      { name: 'Download result', text: 'Click download to save.' },
    ]

    const result = generateHowToSteps(steps)

    expect(result[0].name).toBe('1. Upload your file')
    expect(result[1].name).toBe('2. Configure settings')
    expect(result[2].name).toBe('3. Download result')
  })

  it('preserves step text and image', () => {
    const steps = [{ name: 'Step', text: 'Description text.', image: '/images/step1.png' }]

    const result = generateHowToSteps(steps)

    expect(result[0].text).toBe('Description text.')
    expect(result[0].image).toBe('/images/step1.png')
  })

  it('handles empty steps array', () => {
    const result = generateHowToSteps([])

    expect(result).toEqual([])
  })

  it('handles single step', () => {
    const steps = [{ name: 'Only step', text: 'Do this.' }]

    const result = generateHowToSteps(steps)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('1. Only step')
  })
})

describe('categoryKeywords', () => {
  it('contains expected categories', () => {
    expect(categoryKeywords).toHaveProperty('data')
    expect(categoryKeywords).toHaveProperty('media')
    expect(categoryKeywords).toHaveProperty('development')
    expect(categoryKeywords).toHaveProperty('productivity')
    expect(categoryKeywords).toHaveProperty('security')
    expect(categoryKeywords).toHaveProperty('finance')
    expect(categoryKeywords).toHaveProperty('design')
  })

  it('each category has array of keywords', () => {
    for (const key of Object.keys(categoryKeywords)) {
      const keywords = categoryKeywords[key as keyof typeof categoryKeywords]
      expect(Array.isArray(keywords)).toBe(true)
      expect(keywords.length).toBeGreaterThan(0)
    }
  })
})

describe('getCategoryKeywords', () => {
  it('returns keywords for data category', () => {
    const keywords = getCategoryKeywords('data')

    expect(keywords).toContain('data formatter')
    expect(keywords).toContain('data converter')
  })

  it('returns keywords for media category', () => {
    const keywords = getCategoryKeywords('media')

    expect(keywords).toContain('image tool')
    expect(keywords).toContain('video tool')
  })

  it('returns keywords for development category', () => {
    const keywords = getCategoryKeywords('development')

    expect(keywords).toContain('developer tool')
    expect(keywords).toContain('coding tool')
  })

  it('returns keywords for productivity category', () => {
    const keywords = getCategoryKeywords('productivity')

    expect(keywords).toContain('productivity tool')
  })

  it('returns keywords for security category', () => {
    const keywords = getCategoryKeywords('security')

    expect(keywords).toContain('security tool')
    expect(keywords).toContain('encryption tool')
  })

  it('returns keywords for finance category', () => {
    const keywords = getCategoryKeywords('finance')

    expect(keywords).toContain('finance tool')
    expect(keywords).toContain('calculator')
  })

  it('returns keywords for design category', () => {
    const keywords = getCategoryKeywords('design')

    expect(keywords).toContain('design tool')
    expect(keywords).toContain('creative tool')
  })

  it('returns empty array for unknown category', () => {
    // @ts-expect-error - Testing invalid category
    const keywords = getCategoryKeywords('unknown')

    expect(keywords).toEqual([])
  })
})
