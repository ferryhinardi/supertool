import { beforeEach, describe, expect, it, vi } from 'vitest'

import { generateToolBreadcrumbs, generateToolMetadata } from '../metadata'

describe('metadata', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  describe('generateToolMetadata', () => {
    const baseParams = {
      title: 'JSON Beautifier',
      description: 'Format and beautify JSON data online',
      path: '/tools/json-beautifier',
    }

    it('generates metadata with required fields', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.title).toBe('JSON Beautifier | SuperTool')
      expect(metadata.description).toBe('Format and beautify JSON data online')
    })

    it('generates correct canonical URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://supertool.id'
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.alternates?.canonical).toBe('https://supertool.id/tools/json-beautifier')
    })

    it('uses default base URL when env variable is not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.alternates?.canonical).toBe('https://supertool.id/tools/json-beautifier')
    })

    it('includes custom keywords along with defaults', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        keywords: ['json', 'formatter', 'beautifier'],
      })

      expect(metadata.keywords).toContain('json')
      expect(metadata.keywords).toContain('formatter')
      expect(metadata.keywords).toContain('beautifier')
      expect(metadata.keywords).toContain('free online tool')
      expect(metadata.keywords).toContain('supertool')
    })

    it('uses default keywords when none provided', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.keywords).toContain('free online tool')
      expect(metadata.keywords).toContain('web tool')
      expect(metadata.keywords).toContain('developer tool')
      expect(metadata.keywords).toContain('productivity tool')
      expect(metadata.keywords).toContain('supertool')
    })

    it('sets custom category', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        category: 'developer tools',
      })

      expect(metadata.category).toBe('developer tools')
    })

    it('uses default category when not provided', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.category).toBe('web tools')
    })

    describe('OpenGraph metadata', () => {
      it('generates openGraph with default values', () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://supertool.id'
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.openGraph?.title).toBe('JSON Beautifier | SuperTool')
        expect(metadata.openGraph?.description).toBe('Format and beautify JSON data online')
        expect(metadata.openGraph?.url).toBe('https://supertool.id/tools/json-beautifier')
        expect(metadata.openGraph?.siteName).toBe('SuperTool')
        expect(metadata.openGraph?.type).toBe('website')
        expect(metadata.openGraph?.locale).toBe('en_US')
      })

      it('uses custom ogTitle when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogTitle: 'Best JSON Beautifier Tool Online',
        })

        expect(metadata.openGraph?.title).toBe('Best JSON Beautifier Tool Online')
      })

      it('uses custom ogDescription when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogDescription: 'The best free JSON formatter and beautifier',
        })

        expect(metadata.openGraph?.description).toBe('The best free JSON formatter and beautifier')
      })

      it('uses custom ogImage when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogImage: 'https://supertool.id/images/json-beautifier-og.png',
        })

        const images = metadata.openGraph?.images as Array<{ url: string }>
        expect(images?.[0]?.url).toBe('https://supertool.id/images/json-beautifier-og.png')
      })

      it('uses default og image when not provided', () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://supertool.id'
        const metadata = generateToolMetadata(baseParams)

        const images = metadata.openGraph?.images as Array<{ url: string }>
        expect(images?.[0]?.url).toBe('https://supertool.id/og-image.png')
      })

      it('sets correct image dimensions', () => {
        const metadata = generateToolMetadata(baseParams)

        const images = metadata.openGraph?.images as Array<{ width: number; height: number }>
        expect(images?.[0]?.width).toBe(1200)
        expect(images?.[0]?.height).toBe(630)
      })

      it('uses ogTitle for image alt when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogTitle: 'Custom OG Title',
        })

        const images = metadata.openGraph?.images as Array<{ alt: string }>
        expect(images?.[0]?.alt).toBe('Custom OG Title')
      })

      it('uses title for image alt when ogTitle not provided', () => {
        const metadata = generateToolMetadata(baseParams)

        const images = metadata.openGraph?.images as Array<{ alt: string }>
        expect(images?.[0]?.alt).toBe('JSON Beautifier')
      })
    })

    describe('Twitter metadata', () => {
      it('generates twitter card metadata', () => {
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.twitter?.card).toBe('summary_large_image')
        expect(metadata.twitter?.site).toBe('@SuperToolID')
      })

      it('uses ogTitle for twitter title when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogTitle: 'Custom Twitter Title',
        })

        expect(metadata.twitter?.title).toBe('Custom Twitter Title')
      })

      it('uses full title for twitter when ogTitle not provided', () => {
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.twitter?.title).toBe('JSON Beautifier | SuperTool')
      })

      it('uses ogDescription for twitter description when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          ogDescription: 'Custom Twitter Description',
        })

        expect(metadata.twitter?.description).toBe('Custom Twitter Description')
      })

      it('uses custom twitterCreator when provided', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          twitterCreator: '@customcreator',
        })

        expect(metadata.twitter?.creator).toBe('@customcreator')
      })

      it('uses default twitterCreator when not provided', () => {
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.twitter?.creator).toBe('@SuperToolID')
      })

      it('includes twitter images', () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://supertool.id'
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.twitter?.images).toContain('https://supertool.id/og-image.png')
      })
    })

    describe('robots metadata', () => {
      it('enables indexing and following', () => {
        const metadata = generateToolMetadata(baseParams)

        expect(metadata.robots).toEqual({
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        })
      })
    })

    describe('edge cases', () => {
      it('handles empty keywords array', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          keywords: [],
        })

        expect(metadata.keywords).toHaveLength(5) // Only default keywords
      })

      it('handles path with trailing slash', () => {
        process.env.NEXT_PUBLIC_BASE_URL = 'https://supertool.id'
        const metadata = generateToolMetadata({
          ...baseParams,
          path: '/tools/json-beautifier/',
        })

        expect(metadata.alternates?.canonical).toBe('https://supertool.id/tools/json-beautifier/')
      })

      it('handles special characters in title', () => {
        const metadata = generateToolMetadata({
          ...baseParams,
          title: 'JSON & XML Formatter',
        })

        expect(metadata.title).toBe('JSON & XML Formatter | SuperTool')
      })
    })
  })

  describe('generateToolBreadcrumbs', () => {
    it('generates breadcrumbs with tool name', () => {
      const breadcrumbs = generateToolBreadcrumbs('JSON Beautifier')

      expect(breadcrumbs).toHaveLength(3)
      expect(breadcrumbs[0]).toEqual({ name: 'Home', url: '/' })
      expect(breadcrumbs[1]).toEqual({ name: 'Tools', url: '/' })
      expect(breadcrumbs[2]).toEqual({ name: 'JSON Beautifier', url: '' })
    })

    it('includes tool path when provided', () => {
      const breadcrumbs = generateToolBreadcrumbs('JSON Beautifier', '/tools/json-beautifier')

      expect(breadcrumbs[2]).toEqual({ name: 'JSON Beautifier', url: '/tools/json-beautifier' })
    })

    it('uses empty string for tool path when not provided', () => {
      const breadcrumbs = generateToolBreadcrumbs('Unit Converter')

      expect(breadcrumbs[2].url).toBe('')
    })

    it('handles tool names with special characters', () => {
      const breadcrumbs = generateToolBreadcrumbs('JSON & XML Converter')

      expect(breadcrumbs[2].name).toBe('JSON & XML Converter')
    })

    it('handles unicode characters in tool name', () => {
      const breadcrumbs = generateToolBreadcrumbs('Unit Converter \u2192 Metric')

      expect(breadcrumbs[2].name).toBe('Unit Converter \u2192 Metric')
    })
  })
})
