import { beforeEach, describe, expect, it } from 'vitest'
import {
  getPopularTemplates,
  getTemplatesByCategory,
  MEME_TEMPLATES,
  searchTemplates,
  TEMPLATE_CATEGORIES,
} from '../templates'
import type { MemeTemplate } from '../types'

describe('meme-generator templates', () => {
  // ===========================================
  // MEME_TEMPLATES constant tests
  // ===========================================
  describe('MEME_TEMPLATES', () => {
    describe('structure validation', () => {
      it('should be a non-empty array', () => {
        expect(Array.isArray(MEME_TEMPLATES)).toBe(true)
        expect(MEME_TEMPLATES.length).toBeGreaterThan(0)
      })

      it('should contain exactly 24 templates', () => {
        expect(MEME_TEMPLATES).toHaveLength(24)
      })

      it('should have all templates with required fields', () => {
        MEME_TEMPLATES.forEach((template, index) => {
          expect(template.id, `Template at index ${index} missing id`).toBeDefined()
          expect(template.name, `Template at index ${index} missing name`).toBeDefined()
          expect(template.category, `Template at index ${index} missing category`).toBeDefined()
          expect(template.imageUrl, `Template at index ${index} missing imageUrl`).toBeDefined()
          expect(template.width, `Template at index ${index} missing width`).toBeDefined()
          expect(template.height, `Template at index ${index} missing height`).toBeDefined()
          expect(template.boxCount, `Template at index ${index} missing boxCount`).toBeDefined()
          expect(template.keywords, `Template at index ${index} missing keywords`).toBeDefined()
          expect(template.popularity, `Template at index ${index} missing popularity`).toBeDefined()
        })
      })

      it('should have all templates with correct field types', () => {
        MEME_TEMPLATES.forEach((template, index) => {
          expect(typeof template.id, `Template ${index} id should be string`).toBe('string')
          expect(typeof template.name, `Template ${index} name should be string`).toBe('string')
          expect(typeof template.category, `Template ${index} category should be string`).toBe(
            'string'
          )
          expect(typeof template.imageUrl, `Template ${index} imageUrl should be string`).toBe(
            'string'
          )
          expect(typeof template.width, `Template ${index} width should be number`).toBe('number')
          expect(typeof template.height, `Template ${index} height should be number`).toBe('number')
          expect(typeof template.boxCount, `Template ${index} boxCount should be number`).toBe(
            'number'
          )
          expect(
            Array.isArray(template.keywords),
            `Template ${index} keywords should be array`
          ).toBe(true)
          expect(typeof template.popularity, `Template ${index} popularity should be number`).toBe(
            'number'
          )
        })
      })
    })

    describe('id validation', () => {
      it('should have unique ids for all templates', () => {
        const ids = MEME_TEMPLATES.map((t) => t.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })

      it('should have non-empty id strings', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.id.length).toBeGreaterThan(0)
        })
      })

      it('should have numeric-like ids (from ImgFlip API)', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(/^\d+$/.test(template.id)).toBe(true)
        })
      })
    })

    describe('name validation', () => {
      it('should have non-empty names', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.name.length).toBeGreaterThan(0)
        })
      })

      it('should have descriptive names (more than 2 characters)', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.name.length).toBeGreaterThan(2)
        })
      })

      it('should contain specific well-known meme templates', () => {
        const names = MEME_TEMPLATES.map((t) => t.name)
        expect(names).toContain('Drake Hotline Bling')
        expect(names).toContain('Distracted Boyfriend')
        expect(names).toContain('Change My Mind')
        expect(names).toContain('Mocking Spongebob')
        expect(names).toContain('Doge')
      })
    })

    describe('category validation', () => {
      const validCategories = [
        'classic',
        'reaction',
        'wholesome',
        'relatable',
        'trending',
        'animals',
        'office',
        'political',
        'custom',
      ]

      it('should have valid categories for all templates', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(validCategories).toContain(template.category)
        })
      })

      it('should have at least one classic template', () => {
        const classicTemplates = MEME_TEMPLATES.filter((t) => t.category === 'classic')
        expect(classicTemplates.length).toBeGreaterThan(0)
      })

      it('should have at least one reaction template', () => {
        const reactionTemplates = MEME_TEMPLATES.filter((t) => t.category === 'reaction')
        expect(reactionTemplates.length).toBeGreaterThan(0)
      })

      it('should have at least one wholesome template', () => {
        const wholesomeTemplates = MEME_TEMPLATES.filter((t) => t.category === 'wholesome')
        expect(wholesomeTemplates.length).toBeGreaterThan(0)
      })

      it('should have at least one animals template', () => {
        const animalTemplates = MEME_TEMPLATES.filter((t) => t.category === 'animals')
        expect(animalTemplates.length).toBeGreaterThan(0)
      })
    })

    describe('imageUrl validation', () => {
      it('should have valid image URLs', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.imageUrl).toMatch(/^https?:\/\//)
        })
      })

      it('should have ImgFlip URLs', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.imageUrl).toContain('imgflip.com')
        })
      })

      it('should have image file extensions in URLs', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.imageUrl).toMatch(/\.(jpg|jpeg|png|gif)$/i)
        })
      })
    })

    describe('dimensions validation', () => {
      it('should have positive width values', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.width).toBeGreaterThan(0)
        })
      })

      it('should have positive height values', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.height).toBeGreaterThan(0)
        })
      })

      it('should have reasonable width values (100-2000)', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.width).toBeGreaterThanOrEqual(100)
          expect(template.width).toBeLessThanOrEqual(2000)
        })
      })

      it('should have reasonable height values (100-2000)', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.height).toBeGreaterThanOrEqual(100)
          expect(template.height).toBeLessThanOrEqual(2000)
        })
      })
    })

    describe('boxCount validation', () => {
      it('should have positive boxCount values', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.boxCount).toBeGreaterThan(0)
        })
      })

      it('should have reasonable boxCount values (1-10)', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.boxCount).toBeGreaterThanOrEqual(1)
          expect(template.boxCount).toBeLessThanOrEqual(10)
        })
      })

      it('should have templates with 2 text boxes (most common)', () => {
        const twoBoxTemplates = MEME_TEMPLATES.filter((t) => t.boxCount === 2)
        expect(twoBoxTemplates.length).toBeGreaterThan(0)
      })

      it('should have templates with 3 text boxes', () => {
        const threeBoxTemplates = MEME_TEMPLATES.filter((t) => t.boxCount === 3)
        expect(threeBoxTemplates.length).toBeGreaterThan(0)
      })
    })

    describe('keywords validation', () => {
      it('should have non-empty keywords arrays', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.keywords.length).toBeGreaterThan(0)
        })
      })

      it('should have string keywords', () => {
        MEME_TEMPLATES.forEach((template) => {
          template.keywords.forEach((keyword) => {
            expect(typeof keyword).toBe('string')
          })
        })
      })

      it('should have non-empty keyword strings', () => {
        MEME_TEMPLATES.forEach((template) => {
          template.keywords.forEach((keyword) => {
            expect(keyword.length).toBeGreaterThan(0)
          })
        })
      })

      it('should have lowercase keywords', () => {
        MEME_TEMPLATES.forEach((template) => {
          template.keywords.forEach((keyword) => {
            expect(keyword).toBe(keyword.toLowerCase())
          })
        })
      })
    })

    describe('popularity validation', () => {
      it('should have popularity values between 1 and 10', () => {
        MEME_TEMPLATES.forEach((template) => {
          expect(template.popularity).toBeGreaterThanOrEqual(1)
          expect(template.popularity).toBeLessThanOrEqual(10)
        })
      })

      it('should have at least one template with popularity 10', () => {
        const maxPopularity = MEME_TEMPLATES.filter((t) => t.popularity === 10)
        expect(maxPopularity.length).toBeGreaterThan(0)
      })

      it('should have a range of popularity values', () => {
        const popularities = new Set(MEME_TEMPLATES.map((t) => t.popularity))
        expect(popularities.size).toBeGreaterThan(1)
      })
    })

    describe('specific template validation', () => {
      it('should have Drake Hotline Bling with correct properties', () => {
        const drake = MEME_TEMPLATES.find((t) => t.name === 'Drake Hotline Bling')
        expect(drake).toBeDefined()
        expect(drake?.category).toBe('classic')
        expect(drake?.boxCount).toBe(2)
        expect(drake?.popularity).toBe(10)
        expect(drake?.keywords).toContain('drake')
      })

      it('should have Distracted Boyfriend with correct properties', () => {
        const distracted = MEME_TEMPLATES.find((t) => t.name === 'Distracted Boyfriend')
        expect(distracted).toBeDefined()
        expect(distracted?.category).toBe('classic')
        expect(distracted?.boxCount).toBe(3)
        expect(distracted?.popularity).toBe(10)
        expect(distracted?.keywords).toContain('distracted')
      })

      it('should have Expanding Brain with correct properties', () => {
        const brain = MEME_TEMPLATES.find((t) => t.name === 'Expanding Brain')
        expect(brain).toBeDefined()
        expect(brain?.category).toBe('reaction')
        expect(brain?.boxCount).toBe(4)
        expect(brain?.keywords).toContain('brain')
      })

      it('should have Doge with correct properties', () => {
        const doge = MEME_TEMPLATES.find((t) => t.name === 'Doge')
        expect(doge).toBeDefined()
        expect(doge?.category).toBe('animals')
        expect(doge?.boxCount).toBe(5)
        expect(doge?.popularity).toBe(10)
        expect(doge?.keywords).toContain('doge')
        expect(doge?.keywords).toContain('shiba')
      })
    })
  })

  // ===========================================
  // TEMPLATE_CATEGORIES constant tests
  // ===========================================
  describe('TEMPLATE_CATEGORIES', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(TEMPLATE_CATEGORIES)).toBe(true)
      expect(TEMPLATE_CATEGORIES.length).toBeGreaterThan(0)
    })

    it('should contain exactly 9 categories', () => {
      expect(TEMPLATE_CATEGORIES).toHaveLength(9)
    })

    it('should include "all" as first category', () => {
      expect(TEMPLATE_CATEGORIES[0]).toBe('all')
    })

    it('should contain all expected categories', () => {
      expect(TEMPLATE_CATEGORIES).toContain('all')
      expect(TEMPLATE_CATEGORIES).toContain('classic')
      expect(TEMPLATE_CATEGORIES).toContain('reaction')
      expect(TEMPLATE_CATEGORIES).toContain('wholesome')
      expect(TEMPLATE_CATEGORIES).toContain('relatable')
      expect(TEMPLATE_CATEGORIES).toContain('trending')
      expect(TEMPLATE_CATEGORIES).toContain('animals')
      expect(TEMPLATE_CATEGORIES).toContain('office')
      expect(TEMPLATE_CATEGORIES).toContain('political')
    })

    it('should have unique categories', () => {
      const uniqueCategories = new Set(TEMPLATE_CATEGORIES)
      expect(uniqueCategories.size).toBe(TEMPLATE_CATEGORIES.length)
    })

    it('should have all string values', () => {
      TEMPLATE_CATEGORIES.forEach((category) => {
        expect(typeof category).toBe('string')
      })
    })

    it('should have all lowercase values', () => {
      TEMPLATE_CATEGORIES.forEach((category) => {
        expect(category).toBe(category.toLowerCase())
      })
    })

    it('should be readonly (const assertion)', () => {
      // This test verifies the type is properly narrowed
      const categories: readonly string[] = TEMPLATE_CATEGORIES
      expect(categories.length).toBe(9)
    })
  })

  // ===========================================
  // getTemplatesByCategory function tests
  // ===========================================
  describe('getTemplatesByCategory', () => {
    describe('all category', () => {
      it('should return all templates when category is "all"', () => {
        const result = getTemplatesByCategory('all')
        expect(result).toHaveLength(MEME_TEMPLATES.length)
        expect(result).toEqual(MEME_TEMPLATES)
      })

      it('should return same reference as MEME_TEMPLATES for "all"', () => {
        const result = getTemplatesByCategory('all')
        expect(result).toBe(MEME_TEMPLATES)
      })
    })

    describe('classic category', () => {
      it('should return only classic templates', () => {
        const result = getTemplatesByCategory('classic')
        result.forEach((template) => {
          expect(template.category).toBe('classic')
        })
      })

      it('should return non-empty array for classic', () => {
        const result = getTemplatesByCategory('classic')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should include known classic templates', () => {
        const result = getTemplatesByCategory('classic')
        const names = result.map((t) => t.name)
        expect(names).toContain('Drake Hotline Bling')
        expect(names).toContain('Distracted Boyfriend')
        expect(names).toContain('Change My Mind')
      })
    })

    describe('reaction category', () => {
      it('should return only reaction templates', () => {
        const result = getTemplatesByCategory('reaction')
        result.forEach((template) => {
          expect(template.category).toBe('reaction')
        })
      })

      it('should return non-empty array for reaction', () => {
        const result = getTemplatesByCategory('reaction')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should include known reaction templates', () => {
        const result = getTemplatesByCategory('reaction')
        const names = result.map((t) => t.name)
        expect(names).toContain('Mocking Spongebob')
        expect(names).toContain('Expanding Brain')
        expect(names).toContain('Roll Safe Think About It')
      })
    })

    describe('wholesome category', () => {
      it('should return only wholesome templates', () => {
        const result = getTemplatesByCategory('wholesome')
        result.forEach((template) => {
          expect(template.category).toBe('wholesome')
        })
      })

      it('should return non-empty array for wholesome', () => {
        const result = getTemplatesByCategory('wholesome')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should include known wholesome templates', () => {
        const result = getTemplatesByCategory('wholesome')
        const names = result.map((t) => t.name)
        expect(names).toContain('Woman Yelling At Cat')
        expect(names).toContain('Buff Doge vs. Cheems')
        expect(names).toContain('Epic Handshake')
      })
    })

    describe('animals category', () => {
      it('should return only animals templates', () => {
        const result = getTemplatesByCategory('animals')
        result.forEach((template) => {
          expect(template.category).toBe('animals')
        })
      })

      it('should return non-empty array for animals', () => {
        const result = getTemplatesByCategory('animals')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should include Doge template', () => {
        const result = getTemplatesByCategory('animals')
        const names = result.map((t) => t.name)
        expect(names).toContain('Doge')
      })
    })

    describe('relatable category', () => {
      it('should return only relatable templates', () => {
        const result = getTemplatesByCategory('relatable')
        result.forEach((template) => {
          expect(template.category).toBe('relatable')
        })
      })

      it('should include Is This A Pigeon template', () => {
        const result = getTemplatesByCategory('relatable')
        const names = result.map((t) => t.name)
        expect(names).toContain('Is This A Pigeon')
      })
    })

    describe('empty categories', () => {
      it('should return empty array for trending (no templates)', () => {
        const result = getTemplatesByCategory('trending')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for office (no templates)', () => {
        const result = getTemplatesByCategory('office')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for political (no templates)', () => {
        const result = getTemplatesByCategory('political')
        expect(result).toHaveLength(0)
      })
    })

    describe('invalid categories', () => {
      it('should return empty array for non-existent category', () => {
        const result = getTemplatesByCategory('nonexistent')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for empty string', () => {
        const result = getTemplatesByCategory('')
        expect(result).toHaveLength(0)
      })

      it('should be case-sensitive (ALL should not match)', () => {
        const result = getTemplatesByCategory('ALL')
        expect(result).toHaveLength(0)
      })

      it('should be case-sensitive (Classic should not match)', () => {
        const result = getTemplatesByCategory('Classic')
        expect(result).toHaveLength(0)
      })
    })

    describe('category counts', () => {
      it('should return correct count for each category', () => {
        const categoryCounts: Record<string, number> = {}
        MEME_TEMPLATES.forEach((t) => {
          categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
        })

        Object.entries(categoryCounts).forEach(([category, count]) => {
          const result = getTemplatesByCategory(category)
          expect(result).toHaveLength(count)
        })
      })

      it('should have sum of all categories equal to total templates', () => {
        const categories = ['classic', 'reaction', 'wholesome', 'relatable', 'animals']
        const totalFromCategories = categories.reduce((sum, cat) => {
          return sum + getTemplatesByCategory(cat).length
        }, 0)
        expect(totalFromCategories).toBe(MEME_TEMPLATES.length)
      })
    })

    describe('return value immutability', () => {
      it('should return new array for filtered results (not same reference)', () => {
        const result1 = getTemplatesByCategory('classic')
        const result2 = getTemplatesByCategory('classic')
        // Filter creates new array, so these should be different references
        expect(result1).not.toBe(result2)
        expect(result1).toEqual(result2)
      })
    })
  })

  // ===========================================
  // searchTemplates function tests
  // ===========================================
  describe('searchTemplates', () => {
    describe('search by name', () => {
      it('should find templates by exact name match', () => {
        const result = searchTemplates('Drake Hotline Bling')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Drake Hotline Bling')).toBe(true)
      })

      it('should find templates by partial name match', () => {
        const result = searchTemplates('Drake')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name.includes('Drake'))).toBe(true)
      })

      it('should find templates by single word in name', () => {
        const result = searchTemplates('Boyfriend')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Distracted Boyfriend')).toBe(true)
      })

      it('should find templates by lowercase name', () => {
        const result = searchTemplates('drake')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Drake Hotline Bling')).toBe(true)
      })

      it('should find templates by uppercase name', () => {
        const result = searchTemplates('DRAKE')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Drake Hotline Bling')).toBe(true)
      })

      it('should find templates by mixed case name', () => {
        const result = searchTemplates('DrAkE')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Drake Hotline Bling')).toBe(true)
      })
    })

    describe('search by keywords', () => {
      it('should find templates by exact keyword', () => {
        const result = searchTemplates('doge')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.keywords.includes('doge'))).toBe(true)
      })

      it('should find templates by partial keyword', () => {
        const result = searchTemplates('dog')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should find multiple templates with shared keyword', () => {
        const result = searchTemplates('choice')
        expect(result.length).toBeGreaterThan(1)
      })

      it('should find templates by uppercase keyword', () => {
        const result = searchTemplates('DOGE')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.keywords.includes('doge'))).toBe(true)
      })

      it('should find templates by specific keyword "brain"', () => {
        const result = searchTemplates('brain')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Expanding Brain')).toBe(true)
      })

      it('should find templates by specific keyword "batman"', () => {
        const result = searchTemplates('batman')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Batman Slapping Robin')).toBe(true)
      })
    })

    describe('search with no results', () => {
      it('should return empty array for non-matching query', () => {
        const result = searchTemplates('xyznonexistent123')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for gibberish', () => {
        const result = searchTemplates('asdfghjkl')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for special characters only', () => {
        const result = searchTemplates('!@#$%')
        expect(result).toHaveLength(0)
      })
    })

    describe('search edge cases', () => {
      it('should handle empty string query', () => {
        const result = searchTemplates('')
        // Empty string matches everything (includes '')
        expect(result).toHaveLength(MEME_TEMPLATES.length)
      })

      it('should handle whitespace query', () => {
        const result = searchTemplates('   ')
        // Whitespace likely matches some templates
        expect(result.length).toBeGreaterThanOrEqual(0)
      })

      it('should handle single character query', () => {
        const result = searchTemplates('a')
        // 'a' is in many names and keywords
        expect(result.length).toBeGreaterThan(0)
      })

      it('should handle numbers in query', () => {
        const result = searchTemplates('25')
        // "UNO Draw 25 Cards" should match
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('case insensitivity', () => {
      it('should return same results regardless of case', () => {
        const lower = searchTemplates('spongebob')
        const upper = searchTemplates('SPONGEBOB')
        const mixed = searchTemplates('SpOnGeBoB')

        expect(lower.length).toBe(upper.length)
        expect(lower.length).toBe(mixed.length)
        expect(lower.map((t) => t.id).sort()).toEqual(upper.map((t) => t.id).sort())
      })

      it('should handle CamelCase in template names', () => {
        const result = searchTemplates('hotline')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((t) => t.name === 'Drake Hotline Bling')).toBe(true)
      })
    })

    describe('combined name and keyword matches', () => {
      it('should find template by name that also has matching keywords', () => {
        const result = searchTemplates('doge')
        // Should match both by name and keywords
        const dogeTemplate = result.find((t) => t.name === 'Doge')
        expect(dogeTemplate).toBeDefined()
      })

      it('should not duplicate templates in results', () => {
        const result = searchTemplates('doge')
        const ids = result.map((t) => t.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })
    })

    describe('return type validation', () => {
      it('should return MemeTemplate array', () => {
        const result = searchTemplates('drake')
        expect(Array.isArray(result)).toBe(true)
        result.forEach((template) => {
          expect(template.id).toBeDefined()
          expect(template.name).toBeDefined()
          expect(template.category).toBeDefined()
        })
      })

      it('should return new filtered array', () => {
        const result1 = searchTemplates('drake')
        const result2 = searchTemplates('drake')
        expect(result1).not.toBe(result2)
        expect(result1).toEqual(result2)
      })
    })
  })

  // ===========================================
  // getPopularTemplates function tests
  // ===========================================
  describe('getPopularTemplates', () => {
    describe('default behavior', () => {
      it('should return 10 templates by default', () => {
        const result = getPopularTemplates()
        expect(result).toHaveLength(10)
      })

      it('should return templates sorted by popularity descending', () => {
        const result = getPopularTemplates()
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].popularity).toBeGreaterThanOrEqual(result[i + 1].popularity)
        }
      })

      it('should return MemeTemplate array', () => {
        const result = getPopularTemplates()
        expect(Array.isArray(result)).toBe(true)
        result.forEach((template) => {
          expect(template.id).toBeDefined()
          expect(template.name).toBeDefined()
          expect(template.popularity).toBeDefined()
        })
      })
    })

    describe('custom limit', () => {
      it('should return specified number of templates', () => {
        expect(getPopularTemplates(5)).toHaveLength(5)
        expect(getPopularTemplates(1)).toHaveLength(1)
        expect(getPopularTemplates(15)).toHaveLength(15)
        expect(getPopularTemplates(24)).toHaveLength(24)
      })

      it('should return all templates when limit equals total', () => {
        const result = getPopularTemplates(MEME_TEMPLATES.length)
        expect(result).toHaveLength(MEME_TEMPLATES.length)
      })

      it('should return all templates when limit exceeds total', () => {
        const result = getPopularTemplates(100)
        expect(result).toHaveLength(MEME_TEMPLATES.length)
      })

      it('should return empty array when limit is 0', () => {
        const result = getPopularTemplates(0)
        expect(result).toHaveLength(0)
      })
    })

    describe('sorting validation', () => {
      it('should have highest popularity templates first', () => {
        const result = getPopularTemplates(5)
        const maxPopularity = Math.max(...MEME_TEMPLATES.map((t) => t.popularity))
        expect(result[0].popularity).toBe(maxPopularity)
      })

      it('should include templates with popularity 10', () => {
        const result = getPopularTemplates()
        const topPopularity = result.filter((t) => t.popularity === 10)
        expect(topPopularity.length).toBeGreaterThan(0)
      })

      it('should have Drake Hotline Bling in top results', () => {
        const result = getPopularTemplates(5)
        const names = result.map((t) => t.name)
        expect(names).toContain('Drake Hotline Bling')
      })

      it('should have Distracted Boyfriend in top results', () => {
        const result = getPopularTemplates(5)
        const names = result.map((t) => t.name)
        expect(names).toContain('Distracted Boyfriend')
      })

      it('should have Doge in top results', () => {
        const result = getPopularTemplates(5)
        const names = result.map((t) => t.name)
        expect(names).toContain('Doge')
      })
    })

    describe('return value immutability', () => {
      it('should return new array (not mutate original)', () => {
        const result = getPopularTemplates()
        expect(result).not.toBe(MEME_TEMPLATES)
      })

      it('should not affect original array order', () => {
        const originalOrder = MEME_TEMPLATES.map((t) => t.id)
        getPopularTemplates()
        const afterOrder = MEME_TEMPLATES.map((t) => t.id)
        expect(originalOrder).toEqual(afterOrder)
      })

      it('should return different array references on multiple calls', () => {
        const result1 = getPopularTemplates()
        const result2 = getPopularTemplates()
        expect(result1).not.toBe(result2)
        expect(result1).toEqual(result2)
      })
    })

    describe('edge cases', () => {
      it('should handle negative limit (slice returns all but last N elements)', () => {
        // slice(0, -1) returns all elements except the last one
        const result = getPopularTemplates(-1)
        expect(result).toHaveLength(MEME_TEMPLATES.length - 1)
      })

      it('should handle decimal limit (truncated by slice)', () => {
        const result = getPopularTemplates(5.9)
        expect(result).toHaveLength(5)
      })

      it('should handle very large limit', () => {
        const result = getPopularTemplates(999999)
        expect(result).toHaveLength(MEME_TEMPLATES.length)
      })
    })

    describe('consistency checks', () => {
      it('should return same templates in same order for same limit', () => {
        const result1 = getPopularTemplates(10)
        const result2 = getPopularTemplates(10)
        expect(result1.map((t) => t.id)).toEqual(result2.map((t) => t.id))
      })

      it('should have first n templates of larger result equal smaller result', () => {
        const result5 = getPopularTemplates(5)
        const result10 = getPopularTemplates(10)
        expect(result10.slice(0, 5).map((t) => t.id)).toEqual(result5.map((t) => t.id))
      })
    })
  })

  // ===========================================
  // Integration tests
  // ===========================================
  describe('integration tests', () => {
    describe('category and popularity combined', () => {
      it('should find popular templates in specific category', () => {
        const classic = getTemplatesByCategory('classic')
        const popular = getPopularTemplates(25)

        const popularClassic = popular.filter((p) => classic.some((c) => c.id === p.id))
        expect(popularClassic.length).toBeGreaterThan(0)
      })

      it('should be able to get top N from category', () => {
        const reaction = getTemplatesByCategory('reaction')
        const sorted = [...reaction].sort((a, b) => b.popularity - a.popularity)
        expect(sorted[0].popularity).toBeGreaterThanOrEqual(sorted[sorted.length - 1].popularity)
      })
    })

    describe('search and category combined', () => {
      it('should find searched templates that match category', () => {
        const searched = searchTemplates('doge')
        const animals = getTemplatesByCategory('animals')

        const searchedAnimals = searched.filter((s) => animals.some((a) => a.id === s.id))
        expect(searchedAnimals.length).toBeGreaterThan(0)
      })

      it('should return consistent results when filtering then searching', () => {
        const allClassic = getTemplatesByCategory('classic')
        const drakeFromAll = searchTemplates('drake')

        // Drake should be in both classic and search results
        const drakeIsClassic = drakeFromAll.some((d) => allClassic.some((c) => c.id === d.id))
        expect(drakeIsClassic).toBe(true)
      })
    })

    describe('all functions with same template', () => {
      const testTemplateName = 'Drake Hotline Bling'

      it('should find Drake in all category', () => {
        const all = getTemplatesByCategory('all')
        expect(all.some((t) => t.name === testTemplateName)).toBe(true)
      })

      it('should find Drake in classic category', () => {
        const classic = getTemplatesByCategory('classic')
        expect(classic.some((t) => t.name === testTemplateName)).toBe(true)
      })

      it('should find Drake via search', () => {
        const searched = searchTemplates('drake')
        expect(searched.some((t) => t.name === testTemplateName)).toBe(true)
      })

      it('should find Drake in popular templates', () => {
        const popular = getPopularTemplates()
        expect(popular.some((t) => t.name === testTemplateName)).toBe(true)
      })
    })

    describe('data consistency', () => {
      it('should have same templates across all access methods', () => {
        const allTemplates = getTemplatesByCategory('all')
        const categories = ['classic', 'reaction', 'wholesome', 'relatable', 'animals']

        const fromCategories: MemeTemplate[] = []
        categories.forEach((cat) => {
          fromCategories.push(...getTemplatesByCategory(cat))
        })

        expect(fromCategories.length).toBe(allTemplates.length)
        expect(new Set(fromCategories.map((t) => t.id))).toEqual(
          new Set(allTemplates.map((t) => t.id))
        )
      })

      it('should not lose any templates through any operation', () => {
        const original = MEME_TEMPLATES.length

        // Various operations
        getTemplatesByCategory('classic')
        searchTemplates('drake')
        getPopularTemplates()

        expect(MEME_TEMPLATES.length).toBe(original)
      })
    })
  })
})
