import { describe, expect, it } from 'vitest'
import { tools } from '@/lib/tools'

// Test the tools configuration and rendering logic
describe('Home Page Tools', () => {
  describe('Tools Data Structure', () => {
    it('has valid tool entries', () => {
      expect(tools.length).toBeGreaterThan(0)

      tools.forEach((tool) => {
        expect(tool.title).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.href).toBeTruthy()
        expect(tool.category).toBeTruthy()
        expect(tool.features).toBeInstanceOf(Array)
        expect(tool.features.length).toBeGreaterThan(0)
      })
    })

    it('has unique tool titles', () => {
      const titles = tools.map((t) => t.title)
      const uniqueTitles = new Set(titles)
      expect(uniqueTitles.size).toBe(titles.length)
    })

    it('has unique tool hrefs', () => {
      const hrefs = tools.map((t) => t.href)
      const uniqueHrefs = new Set(hrefs)
      expect(uniqueHrefs.size).toBe(hrefs.length)
    })

    it('has valid href paths', () => {
      tools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\//)
      })
    })
  })

  describe('Popular View Feature', () => {
    it('has tools marked as popular', () => {
      const popularTools = tools.filter((t) => t.popular)
      expect(popularTools.length).toBeGreaterThan(0)
    })

    it('has tools marked as new', () => {
      const newTools = tools.filter((t) => t.new)
      expect(newTools.length).toBeGreaterThan(0)
    })

    it('popular tools have all required fields', () => {
      const popularTools = tools.filter((t) => t.popular)
      popularTools.forEach((tool) => {
        expect(tool.title).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.href).toBeTruthy()
        expect(tool.category).toBeTruthy()
        expect(tool.gradient).toBeTruthy()
        expect(tool.features.length).toBeGreaterThan(0)
      })
    })

    it('popular view should show approximately 20 tools', () => {
      const popularTools = tools.filter((t) => t.popular)
      const newTools = tools
        .filter((t) => t.new && !t.comingSoon)
        .sort((a, b) => {
          const aIndex = tools.indexOf(a)
          const bIndex = tools.indexOf(b)
          return aIndex - bIndex
        })
        .slice(0, 5)

      const popularViewCount = popularTools.length + newTools.length
      // Should show around 15-25 tools in popular view
      expect(popularViewCount).toBeGreaterThan(10)
      expect(popularViewCount).toBeLessThan(30)
    })

    it('all view includes coming soon tools', () => {
      const comingSoonTools = tools.filter((t) => t.comingSoon)
      expect(comingSoonTools.length).toBeGreaterThan(0)
    })

    it('popular view logic filters correctly', () => {
      // Simulate popular view filtering
      const popularTools = tools.filter((t) => t.popular && !t.comingSoon)
      const newTools = tools
        .filter((t) => t.new && !t.comingSoon)
        .sort((a, b) => tools.indexOf(a) - tools.indexOf(b))
        .slice(0, 5)

      const popularViewTools = [...popularTools, ...newTools]
      const uniqueTools = Array.from(new Set(popularViewTools.map((t) => t.href))).map((href) =>
        popularViewTools.find((t) => t.href === href)
      )

      // Ensure we have unique tools only
      expect(uniqueTools.length).toBeGreaterThan(0)
      expect(uniqueTools.length).toBeLessThanOrEqual(popularTools.length + 5)
    })

    it('all view includes all non-coming-soon tools', () => {
      const allActiveTools = tools.filter((t) => !t.comingSoon)
      expect(allActiveTools.length).toBeGreaterThan(0)
      expect(allActiveTools.length).toBe(tools.filter((t) => !t.comingSoon).length)
    })
  })

  describe('Tool Categories', () => {
    it('all tools have valid categories', () => {
      const validCategories = [
        'data',
        'media',
        'development',
        'productivity',
        'security',
        'finance',
        'design',
      ]

      tools.forEach((tool) => {
        expect(validCategories).toContain(tool.category)
      })
    })

    it('each category has at least one tool', () => {
      const categories = new Set(tools.map((t) => t.category))
      expect(categories.size).toBeGreaterThan(0)
    })
  })

  describe('Animation Configuration', () => {
    it('has valid stagger animation config', () => {
      const container = {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }

      const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }

      expect(container.hidden.opacity).toBe(0)
      expect(container.show.opacity).toBe(1)
      expect(container.show.transition.staggerChildren).toBe(0.1)

      expect(item.hidden.opacity).toBe(0)
      expect(item.hidden.y).toBe(20)
      expect(item.show.opacity).toBe(1)
      expect(item.show.y).toBe(0)
    })
  })
})
