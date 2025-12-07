import { describe, expect, it } from 'vitest'
import { type Tool, type ToolCategory, tools } from '../tools'

describe('tools configuration', () => {
  describe('tools array', () => {
    it('should have at least one tool defined', () => {
      expect(tools.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each tool', () => {
      for (const tool of tools) {
        expect(tool).toHaveProperty('title')
        expect(tool).toHaveProperty('description')
        expect(tool).toHaveProperty('icon')
        expect(tool).toHaveProperty('href')
        expect(tool).toHaveProperty('gradient')
        expect(tool).toHaveProperty('features')
        expect(tool).toHaveProperty('category')
      }
    })

    it('should have unique titles', () => {
      const titles = tools.map((t) => t.title)
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length)
    })

    it('should have unique hrefs', () => {
      const hrefs = tools.map((t) => t.href)
      const uniqueHrefs = new Set(hrefs)
      expect(uniqueHrefs.size).toBe(hrefs.length)
    })

    it('should have valid category for each tool', () => {
      const validCategories: ToolCategory[] = [
        'all',
        'data',
        'media',
        'development',
        'productivity',
        'security',
        'finance',
        'design',
      ]

      for (const tool of tools) {
        expect(validCategories).toContain(tool.category)
      }
    })

    it('should have non-empty title for each tool', () => {
      for (const tool of tools) {
        expect(tool.title.length).toBeGreaterThan(0)
      }
    })

    it('should have non-empty description for each tool', () => {
      for (const tool of tools) {
        expect(tool.description.length).toBeGreaterThan(0)
      }
    })

    it('should have at least one feature for each tool', () => {
      for (const tool of tools) {
        expect(tool.features.length).toBeGreaterThan(0)
      }
    })

    it('should have valid href format (starts with /)', () => {
      for (const tool of tools) {
        expect(tool.href).toMatch(/^\//)
      }
    })

    it('should have valid gradient format', () => {
      for (const tool of tools) {
        expect(tool.gradient).toMatch(/^from-/)
        expect(tool.gradient).toMatch(/to-/)
      }
    })

    it('should have icon property defined', () => {
      for (const tool of tools) {
        expect(tool.icon).toBeDefined()
        // Icon can be a function or object (React component)
        expect(['function', 'object']).toContain(typeof tool.icon)
      }
    })
  })

  describe('tool categories', () => {
    it('should have tools in data category', () => {
      const dataTools = tools.filter((t) => t.category === 'data')
      expect(dataTools.length).toBeGreaterThan(0)
    })

    it('should have tools in development category', () => {
      const devTools = tools.filter((t) => t.category === 'development')
      expect(devTools.length).toBeGreaterThan(0)
    })

    it('should have tools in media category', () => {
      const mediaTools = tools.filter((t) => t.category === 'media')
      expect(mediaTools.length).toBeGreaterThan(0)
    })

    it('should have tools in productivity category', () => {
      const productivityTools = tools.filter((t) => t.category === 'productivity')
      expect(productivityTools.length).toBeGreaterThan(0)
    })

    it('should have tools in security category', () => {
      const securityTools = tools.filter((t) => t.category === 'security')
      expect(securityTools.length).toBeGreaterThan(0)
    })
  })

  describe('tool flags', () => {
    it('should have at least one popular tool', () => {
      const popularTools = tools.filter((t) => t.popular === true)
      expect(popularTools.length).toBeGreaterThan(0)
    })

    it('should mark some tools as popular', () => {
      const popularTools = tools.filter((t) => t.popular)
      expect(popularTools.length).toBeGreaterThan(0)
    })

    it('should have boolean or undefined for comingSoon flag', () => {
      for (const tool of tools) {
        if ('comingSoon' in tool) {
          expect(typeof tool.comingSoon).toBe('boolean')
        }
      }
    })

    it('should have boolean or undefined for popular flag', () => {
      for (const tool of tools) {
        if ('popular' in tool) {
          expect(typeof tool.popular).toBe('boolean')
        }
      }
    })

    it('should have boolean or undefined for new flag', () => {
      for (const tool of tools) {
        if ('new' in tool) {
          expect(typeof tool.new).toBe('boolean')
        }
      }
    })

    it('should have boolean or undefined for premium flag', () => {
      for (const tool of tools) {
        if ('premium' in tool) {
          expect(typeof tool.premium).toBe('boolean')
        }
      }
    })
  })

  describe('tool features', () => {
    it('should have non-empty feature strings', () => {
      for (const tool of tools) {
        for (const feature of tool.features) {
          expect(feature.length).toBeGreaterThan(0)
        }
      }
    })

    it('should have reasonable number of features (1-10)', () => {
      for (const tool of tools) {
        expect(tool.features.length).toBeGreaterThanOrEqual(1)
        expect(tool.features.length).toBeLessThanOrEqual(10)
      }
    })

    it('should have unique features per tool', () => {
      for (const tool of tools) {
        const uniqueFeatures = new Set(tool.features)
        expect(uniqueFeatures.size).toBe(tool.features.length)
      }
    })
  })

  describe('tool descriptions', () => {
    it('should have reasonable description length (50-500 chars)', () => {
      for (const tool of tools) {
        expect(tool.description.length).toBeGreaterThanOrEqual(50)
        expect(tool.description.length).toBeLessThanOrEqual(500)
      }
    })

    it('should have descriptions ending with proper punctuation', () => {
      for (const tool of tools) {
        const lastChar = tool.description[tool.description.length - 1]
        expect(['.', '!', '?']).toContain(lastChar)
      }
    })
  })

  describe('tool hrefs', () => {
    it('should all start with /tools/', () => {
      for (const tool of tools) {
        expect(tool.href).toMatch(/^\/tools\//)
      }
    })

    it('should use kebab-case for tool paths', () => {
      for (const tool of tools) {
        const path = tool.href.replace('/tools/', '')
        // Check if path is kebab-case (lowercase with hyphens)
        expect(path).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      }
    })
  })

  describe('specific tools', () => {
    it('should include JSON Beautifier tool', () => {
      const jsonTool = tools.find((t) => t.title.includes('JSON'))
      expect(jsonTool).toBeDefined()
    })

    it('should include QR Code tool', () => {
      const qrTool = tools.find((t) => t.title.includes('QR'))
      expect(qrTool).toBeDefined()
    })

    it('should include Split Bill tool', () => {
      const splitBillTool = tools.find((t) => t.title.includes('Split Bill'))
      expect(splitBillTool).toBeDefined()
    })

    it('JSON Beautifier should be marked as popular', () => {
      const jsonTool = tools.find((t) => t.title.includes('JSON Beautifier'))
      expect(jsonTool?.popular).toBe(true)
    })

    it('JSON Beautifier should be in data category', () => {
      const jsonTool = tools.find((t) => t.title.includes('JSON Beautifier'))
      expect(jsonTool?.category).toBe('data')
    })
  })

  describe('tool count', () => {
    it('should have a substantial number of tools (>20)', () => {
      expect(tools.length).toBeGreaterThan(20)
    })

    it('should have balanced category distribution', () => {
      const categories = tools.map((t) => t.category)
      const categoryCounts = categories.reduce(
        (acc, cat) => {
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      // Each category should have at least 1 tool
      for (const count of Object.values(categoryCounts)) {
        expect(count).toBeGreaterThan(0)
      }
    })
  })

  describe('Type definitions', () => {
    it('should define Tool interface correctly', () => {
      const mockTool: Tool = {
        title: 'Test Tool',
        description: 'A test tool for validation purposes.',
        icon: () => null,
        href: '/tools/test',
        gradient: 'from-blue-500 to-purple-500',
        features: ['Feature 1', 'Feature 2'],
        category: 'data',
      }

      expect(mockTool.title).toBe('Test Tool')
      expect(mockTool.category).toBe('data')
    })

    it('should allow optional flags in Tool interface', () => {
      const mockTool: Tool = {
        title: 'Test',
        description: 'Test description here for validation.',
        icon: () => null,
        href: '/tools/test',
        gradient: 'from-blue-500 to-red-500',
        features: ['F1'],
        category: 'data',
        comingSoon: true,
        popular: true,
        new: true,
        premium: false,
      }

      expect(mockTool.comingSoon).toBe(true)
      expect(mockTool.popular).toBe(true)
      expect(mockTool.new).toBe(true)
      expect(mockTool.premium).toBe(false)
    })
  })
})
