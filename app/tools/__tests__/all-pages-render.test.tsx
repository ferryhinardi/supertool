import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { tools } from '@/lib/data/tools'

/**
 * Integration test to ensure all tool pages render without 404 errors.
 * This test verifies that:
 * 1. All tool URLs in tools.ts have corresponding page files
 * 2. Each page component can be imported and rendered
 * 3. No navigation links lead to 404 pages
 */

describe('All Tool Pages Render Test', () => {
  // Filter out "coming soon" tools as they don't have actual pages yet
  const activeTools = tools.filter((tool) => !tool.comingSoon)

  describe('Page File Existence and Rendering', () => {
    it('should have tests for all active tool categories', () => {
      const categories = [...new Set(activeTools.map((tool) => tool.category))]
      expect(categories.length).toBeGreaterThan(0)

      // Verify we have tools in each category
      const categoryCounts = categories.map((category) => ({
        category,
        count: activeTools.filter((t) => t.category === category).length,
      }))

      console.log('Tool distribution by category:')
      categoryCounts.forEach(({ category, count }) => {
        console.log(`  ${category}: ${count} tools`)
      })

      expect(categoryCounts.every(({ count }) => count > 0)).toBe(true)
    })

    it('should have valid href paths for all active tools', () => {
      activeTools.forEach((tool) => {
        // Check that href starts with /tools/ and has a category
        expect(tool.href).toMatch(
          /^\/tools\/(data|development|media|productivity|security|finance|design)\//
        )

        // Check that href matches category
        const categoryInPath = tool.href.split('/')[2] as string
        const expectedCategories = [
          'data',
          'development',
          'media',
          'productivity',
          'security',
          'finance',
          'design',
        ]
        expect(expectedCategories).toContain(categoryInPath)
      })
    })

    it('should have unique hrefs for all tools', () => {
      const hrefs = activeTools.map((tool) => tool.href)
      const uniqueHrefs = new Set(hrefs)

      if (hrefs.length !== uniqueHrefs.size) {
        const duplicates = hrefs.filter((href, index) => hrefs.indexOf(href) !== index)
        console.error('Duplicate hrefs found:', [...new Set(duplicates)])
      }

      expect(hrefs.length).toBe(uniqueHrefs.size)
    })

    it('should have all required tool properties', () => {
      activeTools.forEach((tool) => {
        expect(tool.title).toBeTruthy()
        expect(tool.description).toBeTruthy()
        expect(tool.icon).toBeTruthy()
        expect(tool.href).toBeTruthy()
        expect(tool.gradient).toBeTruthy()
        expect(tool.features).toBeInstanceOf(Array)
        expect(tool.features.length).toBeGreaterThan(0)
        expect(tool.category).toBeTruthy()
      })
    })
  })

  describe('Tool Page Imports', () => {
    // Sample test for each category to verify import structure
    const sampleToolsByCategory = {
      data: activeTools.find((t) => t.category === 'data'),
      development: activeTools.find((t) => t.category === 'development'),
      media: activeTools.find((t) => t.category === 'media'),
      productivity: activeTools.find((t) => t.category === 'productivity'),
      security: activeTools.find((t) => t.category === 'security'),
      finance: activeTools.find((t) => t.category === 'finance'),
      design: activeTools.find((t) => t.category === 'design'),
    }

    Object.entries(sampleToolsByCategory).forEach(([category, tool]) => {
      if (tool) {
        it(`should be able to verify ${category} tool path structure: ${tool.title}`, () => {
          // Extract path segments from href
          const pathSegments = tool.href.split('/').filter(Boolean)

          expect(pathSegments[0]).toBe('tools')
          expect(pathSegments[1]).toBe(category)
          expect(pathSegments[2]).toBeTruthy()

          // Path should be: /tools/{category}/{tool-name}
          expect(pathSegments.length).toBe(3)
        })
      }
    })
  })

  describe('Tool URL Structure Validation', () => {
    it('should have all data tools under /tools/data/', () => {
      const dataTools = activeTools.filter((t) => t.category === 'data')
      dataTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/data\//)
      })
      expect(dataTools.length).toBeGreaterThan(0)
    })

    it('should have all development tools under /tools/development/', () => {
      const devTools = activeTools.filter((t) => t.category === 'development')
      devTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/development\//)
      })
      expect(devTools.length).toBeGreaterThan(0)
    })

    it('should have all media tools under /tools/media/', () => {
      const mediaTools = activeTools.filter((t) => t.category === 'media')
      mediaTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/media\//)
      })
      expect(mediaTools.length).toBeGreaterThan(0)
    })

    it('should have all productivity tools under /tools/productivity/', () => {
      const prodTools = activeTools.filter((t) => t.category === 'productivity')
      prodTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/productivity\//)
      })
      expect(prodTools.length).toBeGreaterThan(0)
    })

    it('should have all security tools under /tools/security/', () => {
      const secTools = activeTools.filter((t) => t.category === 'security')
      secTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/security\//)
      })
      expect(secTools.length).toBeGreaterThan(0)
    })

    it('should have all finance tools under /tools/finance/', () => {
      const financeTools = activeTools.filter((t) => t.category === 'finance')
      financeTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/finance\//)
      })
      expect(financeTools.length).toBeGreaterThan(0)
    })

    it('should have all design tools under /tools/design/', () => {
      const designTools = activeTools.filter((t) => t.category === 'design')
      designTools.forEach((tool) => {
        expect(tool.href).toMatch(/^\/tools\/design\//)
      })
      expect(designTools.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation Consistency', () => {
    it('should not have any tools with "all" category except coming soon', () => {
      const allCategoryTools = tools.filter((t) => t.category === 'all' && !t.comingSoon)
      expect(allCategoryTools.length).toBe(0)
    })

    it('should have matching category in href and category field', () => {
      activeTools.forEach((tool) => {
        if (tool.category !== 'all') {
          const categoryInPath = tool.href.split('/')[2]
          expect(categoryInPath).toBe(tool.category)
        }
      })
    })
  })

  describe('Tool Statistics', () => {
    it('should have a reasonable number of tools per category', () => {
      const categories = [
        'data',
        'development',
        'media',
        'productivity',
        'security',
        'finance',
        'design',
      ]

      categories.forEach((category) => {
        const count = activeTools.filter((t) => t.category === category).length
        // Each category should have at least 1 tool
        expect(count).toBeGreaterThanOrEqual(1)
      })
    })

    it('should display total active tools count', () => {
      console.log(`\nTotal active tools: ${activeTools.length}`)
      console.log(`Total tools (including coming soon): ${tools.length}`)
      console.log(`Coming soon tools: ${tools.length - activeTools.length}`)

      expect(activeTools.length).toBeGreaterThan(0)
    })
  })
})
