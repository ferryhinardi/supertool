import { describe, expect, it } from 'vitest'
import { generateToolBreadcrumbs, generateToolMetadata } from '../metadata'

describe('Metadata Utilities', () => {
  describe('generateToolMetadata()', () => {
    const baseParams = {
      title: 'JSON Beautifier',
      description: 'Format and validate JSON with syntax highlighting',
      path: '/tools/json-beautifier',
    }

    it('should generate basic metadata', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.title).toBe('JSON Beautifier | SuperTool')
      expect(metadata.description).toBe('Format and validate JSON with syntax highlighting')
    })

    it('should include default keywords', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.keywords).toEqual(
        expect.arrayContaining([
          'free online tool',
          'web tool',
          'developer tool',
          'productivity tool',
          'supertool',
        ])
      )
    })

    it('should merge custom keywords with defaults', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        keywords: ['json', 'formatter', 'validator'],
      })

      expect(metadata.keywords).toEqual(
        expect.arrayContaining(['json', 'formatter', 'validator', 'free online tool', 'web tool'])
      )
    })

    it('should generate OpenGraph metadata', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.openGraph).toMatchObject({
        title: 'JSON Beautifier | SuperTool',
        description: 'Format and validate JSON with syntax highlighting',
        siteName: 'SuperTool',
        type: 'website',
        locale: 'en_US',
      })
    })

    it('should use baseUrl from environment or default', () => {
      const metadata = generateToolMetadata(baseParams)

      const expectedUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/tools/json-beautifier`
        : 'https://supertool.id/tools/json-beautifier'

      expect(metadata.openGraph?.url).toBe(expectedUrl)
    })

    it('should use custom OG title and description if provided', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        ogTitle: 'Custom OG Title',
        ogDescription: 'Custom OG description for social media',
      })

      expect(metadata.openGraph?.title).toBe('Custom OG Title')
      expect(metadata.openGraph?.description).toBe('Custom OG description for social media')
    })

    it('should fallback to default title/description if no custom OG values', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.openGraph?.title).toBe('JSON Beautifier | SuperTool')
      expect(metadata.openGraph?.description).toBe(
        'Format and validate JSON with syntax highlighting'
      )
    })

    it('should generate Twitter card metadata', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: 'JSON Beautifier | SuperTool',
        description: 'Format and validate JSON with syntax highlighting',
        creator: '@SuperToolID',
        site: '@SuperToolID',
      })
    })

    it('should use custom Twitter creator if provided', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        twitterCreator: '@customcreator',
      })

      expect(metadata.twitter?.creator).toBe('@customcreator')
      expect(metadata.twitter?.site).toBe('@SuperToolID')
    })

    it('should generate canonical URL', () => {
      const metadata = generateToolMetadata(baseParams)

      const expectedUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/tools/json-beautifier`
        : 'https://supertool.id/tools/json-beautifier'

      expect(metadata.alternates?.canonical).toBe(expectedUrl)
    })

    it('should set robots to index and follow', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.robots).toMatchObject({
        index: true,
        follow: true,
      })
    })

    it('should use custom category if provided', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        category: 'data processing',
      })

      expect(metadata.category).toBe('data processing')
    })

    it('should use default category if not provided', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.category).toBe('web tools')
    })

    it('should handle paths without leading slash', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        path: 'tools/test',
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
      expect(metadata.openGraph?.url).toBe(`${baseUrl}tools/test`)
    })

    it('should handle root path', () => {
      const metadata = generateToolMetadata({
        ...baseParams,
        path: '/',
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://supertool.id'
      expect(metadata.openGraph?.url).toBe(`${baseUrl}/`)
    })

    it('should have openGraph images', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.openGraph?.images).toBeTruthy()
    })

    it('should have twitter images', () => {
      const metadata = generateToolMetadata(baseParams)

      expect(metadata.twitter?.images).toBeTruthy()
    })
  })

  describe('generateToolBreadcrumbs()', () => {
    it('should generate breadcrumbs with home, tools, and current tool', () => {
      const breadcrumbs = generateToolBreadcrumbs('JSON Beautifier', '/tools/json-beautifier')

      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/' },
        { name: 'JSON Beautifier', url: '/tools/json-beautifier' },
      ])
    })

    it('should use empty string for tool path if not provided', () => {
      const breadcrumbs = generateToolBreadcrumbs('Test Tool')

      expect(breadcrumbs).toEqual([
        { name: 'Home', url: '/' },
        { name: 'Tools', url: '/' },
        { name: 'Test Tool', url: '' },
      ])
    })

    it('should handle tool names with special characters', () => {
      const breadcrumbs = generateToolBreadcrumbs('QR Code Generator & Scanner')

      expect(breadcrumbs[2].name).toBe('QR Code Generator & Scanner')
    })

    it('should always return 3 items', () => {
      const breadcrumbs = generateToolBreadcrumbs('Any Tool', '/any-path')

      expect(breadcrumbs).toHaveLength(3)
    })

    it('should have Home as first item', () => {
      const breadcrumbs = generateToolBreadcrumbs('Test Tool')

      expect(breadcrumbs[0]).toEqual({ name: 'Home', url: '/' })
    })

    it('should have Tools as second item', () => {
      const breadcrumbs = generateToolBreadcrumbs('Test Tool')

      expect(breadcrumbs[1]).toEqual({ name: 'Tools', url: '/' })
    })

    it('should preserve exact tool path provided', () => {
      const customPath = '/custom/nested/path'
      const breadcrumbs = generateToolBreadcrumbs('Custom Tool', customPath)

      expect(breadcrumbs[2].url).toBe(customPath)
    })
  })
})
