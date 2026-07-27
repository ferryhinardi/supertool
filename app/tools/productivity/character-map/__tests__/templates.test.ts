import { describe, expect, it } from 'vitest'
import {
  type Character,
  type CharacterCategory,
  characterCategories,
  getAllCharacters,
  getCharactersByCategory,
  searchCharacters,
} from '../templates'

describe('Character Map Templates', () => {
  describe('characterCategories', () => {
    it('should be an array of categories', () => {
      expect(Array.isArray(characterCategories)).toBe(true)
      expect(characterCategories.length).toBeGreaterThan(0)
    })

    it('should have exactly 6 categories', () => {
      expect(characterCategories).toHaveLength(6)
    })

    it('should contain expected category IDs', () => {
      const categoryIds = characterCategories.map((cat) => cat.id)
      expect(categoryIds).toContain('arrows')
      expect(categoryIds).toContain('math')
      expect(categoryIds).toContain('currency')
      expect(categoryIds).toContain('greek')
      expect(categoryIds).toContain('punctuation')
      expect(categoryIds).toContain('symbols')
    })

    describe('category structure validation', () => {
      it.each(
        characterCategories
      )('category "$name" should have required properties', (category) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('characters')
        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.description).toBe('string')
        expect(Array.isArray(category.characters)).toBe(true)
      })

      it.each(
        characterCategories
      )('category "$name" should have non-empty characters array', (category) => {
        expect(category.characters.length).toBeGreaterThan(0)
      })
    })

    describe('character structure validation', () => {
      it('all characters should have required properties', () => {
        for (const category of characterCategories) {
          for (const char of category.characters) {
            expect(char).toHaveProperty('char')
            expect(char).toHaveProperty('name')
            expect(char).toHaveProperty('code')
            expect(char).toHaveProperty('category')
            expect(typeof char.char).toBe('string')
            expect(typeof char.name).toBe('string')
            expect(typeof char.code).toBe('string')
            expect(typeof char.category).toBe('string')
          }
        }
      })

      it('all characters should have matching category ID', () => {
        for (const category of characterCategories) {
          for (const char of category.characters) {
            expect(char.category).toBe(category.id)
          }
        }
      })

      it('all characters should have valid Unicode code format', () => {
        const unicodePattern = /^U\+[0-9A-F]{4,5}$/
        for (const category of characterCategories) {
          for (const char of category.characters) {
            expect(char.code).toMatch(unicodePattern)
          }
        }
      })

      it('all characters should have non-empty char and name', () => {
        for (const category of characterCategories) {
          for (const char of category.characters) {
            expect(char.char.length).toBeGreaterThan(0)
            expect(char.name.length).toBeGreaterThan(0)
          }
        }
      })
    })

    describe('arrows category', () => {
      const arrowsCategory = characterCategories.find((cat) => cat.id === 'arrows')

      it('should exist', () => {
        expect(arrowsCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(arrowsCategory?.name).toBe('Arrows')
        expect(arrowsCategory?.description).toBe('Directional arrows and pointer symbols')
      })

      it('should contain common arrow characters', () => {
        const chars = arrowsCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('←')
        expect(chars).toContain('→')
        expect(chars).toContain('↑')
        expect(chars).toContain('↓')
        expect(chars).toContain('↔')
        expect(chars).toContain('↕')
      })

      it('should have 24 arrow characters', () => {
        expect(arrowsCategory?.characters).toHaveLength(24)
      })
    })

    describe('math category', () => {
      const mathCategory = characterCategories.find((cat) => cat.id === 'math')

      it('should exist', () => {
        expect(mathCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(mathCategory?.name).toBe('Math Symbols')
        expect(mathCategory?.description).toBe('Mathematical operators and symbols')
      })

      it('should contain common math characters', () => {
        const chars = mathCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('+')
        expect(chars).toContain('−')
        expect(chars).toContain('×')
        expect(chars).toContain('÷')
        expect(chars).toContain('=')
        expect(chars).toContain('≠')
        expect(chars).toContain('∞')
        expect(chars).toContain('√')
        expect(chars).toContain('∑') // Summation symbol
      })

      it('should have 32 math characters', () => {
        expect(mathCategory?.characters).toHaveLength(32)
      })
    })

    describe('currency category', () => {
      const currencyCategory = characterCategories.find((cat) => cat.id === 'currency')

      it('should exist', () => {
        expect(currencyCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(currencyCategory?.name).toBe('Currency')
        expect(currencyCategory?.description).toBe('Currency symbols from around the world')
      })

      it('should contain common currency characters', () => {
        const chars = currencyCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('$')
        expect(chars).toContain('€')
        expect(chars).toContain('£')
        expect(chars).toContain('¥')
        expect(chars).toContain('₹')
      })

      it('should have 16 currency characters', () => {
        expect(currencyCategory?.characters).toHaveLength(16)
      })
    })

    describe('greek category', () => {
      const greekCategory = characterCategories.find((cat) => cat.id === 'greek')

      it('should exist', () => {
        expect(greekCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(greekCategory?.name).toBe('Greek Letters')
        expect(greekCategory?.description).toBe('Greek alphabet characters')
      })

      it('should contain common greek letters', () => {
        const chars = greekCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('α')
        expect(chars).toContain('β')
        expect(chars).toContain('γ')
        expect(chars).toContain('δ')
        expect(chars).toContain('π')
        expect(chars).toContain('Σ')
        expect(chars).toContain('Ω')
      })

      it('should have 36 greek characters', () => {
        expect(greekCategory?.characters).toHaveLength(36)
      })
    })

    describe('punctuation category', () => {
      const punctuationCategory = characterCategories.find((cat) => cat.id === 'punctuation')

      it('should exist', () => {
        expect(punctuationCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(punctuationCategory?.name).toBe('Punctuation')
        expect(punctuationCategory?.description).toBe(
          'Special punctuation marks and quotation marks'
        )
      })

      it('should contain common punctuation characters', () => {
        const chars = punctuationCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('•')
        expect(chars).toContain('…')
        expect(chars).toContain('©')
        expect(chars).toContain('®')
        expect(chars).toContain('™')
      })

      it('should have 24 punctuation characters', () => {
        expect(punctuationCategory?.characters).toHaveLength(24)
      })
    })

    describe('symbols category', () => {
      const symbolsCategory = characterCategories.find((cat) => cat.id === 'symbols')

      it('should exist', () => {
        expect(symbolsCategory).toBeDefined()
      })

      it('should have correct name and description', () => {
        expect(symbolsCategory?.name).toBe('Symbols')
        expect(symbolsCategory?.description).toBe('Miscellaneous symbols and special characters')
      })

      it('should contain common symbol characters', () => {
        const chars = symbolsCategory?.characters.map((c) => c.char) || []
        expect(chars).toContain('★')
        expect(chars).toContain('☆')
        expect(chars).toContain('♥')
        expect(chars).toContain('♠')
        expect(chars).toContain('✓')
        expect(chars).toContain('✔')
      })

      it('should have 38 symbol characters', () => {
        expect(symbolsCategory?.characters).toHaveLength(38)
      })
    })
  })

  describe('getAllCharacters', () => {
    it('should return an array', () => {
      const result = getAllCharacters()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return all characters from all categories', () => {
      const result = getAllCharacters()
      const expectedTotal = characterCategories.reduce((sum, cat) => sum + cat.characters.length, 0)
      expect(result).toHaveLength(expectedTotal)
    })

    it('should return 170 total characters', () => {
      const result = getAllCharacters()
      // 24 arrows + 32 math + 16 currency + 36 greek + 24 punctuation + 38 symbols = 170
      expect(result).toHaveLength(170)
    })

    it('should return flat array of Character objects', () => {
      const result = getAllCharacters()
      for (const char of result) {
        expect(char).toHaveProperty('char')
        expect(char).toHaveProperty('name')
        expect(char).toHaveProperty('code')
        expect(char).toHaveProperty('category')
      }
    })

    it('should include characters from all categories', () => {
      const result = getAllCharacters()
      const categories = new Set(result.map((c) => c.category))
      expect(categories.size).toBe(6)
      expect(categories).toContain('arrows')
      expect(categories).toContain('math')
      expect(categories).toContain('currency')
      expect(categories).toContain('greek')
      expect(categories).toContain('punctuation')
      expect(categories).toContain('symbols')
    })

    it('should preserve character order within categories', () => {
      const result = getAllCharacters()
      // First character should be from arrows category
      expect(result[0].category).toBe('arrows')
      expect(result[0].char).toBe('←')
    })

    it('should return a new array each time (not cached reference)', () => {
      const result1 = getAllCharacters()
      const result2 = getAllCharacters()
      expect(result1).not.toBe(result2)
      expect(result1).toEqual(result2)
    })
  })

  describe('searchCharacters', () => {
    describe('empty or whitespace queries', () => {
      it('should return all characters for empty query', () => {
        const result = searchCharacters('')
        expect(result).toHaveLength(getAllCharacters().length)
      })

      it('should return all characters for whitespace-only query', () => {
        const result = searchCharacters('   ')
        expect(result).toHaveLength(getAllCharacters().length)
      })

      it('should return all characters for null-like empty string', () => {
        const result = searchCharacters('')
        const allChars = getAllCharacters()
        expect(result.length).toBe(allChars.length)
      })
    })

    describe('search by character name', () => {
      it('should find characters by exact name match', () => {
        const result = searchCharacters('Leftwards Arrow')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((c) => c.name === 'Leftwards Arrow')).toBe(true)
      })

      it('should find characters by partial name match', () => {
        const result = searchCharacters('arrow')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('arrow')
        })
      })

      it('should be case-insensitive for name search', () => {
        const resultLower = searchCharacters('arrow')
        const resultUpper = searchCharacters('ARROW')
        const resultMixed = searchCharacters('ArRoW')
        expect(resultLower.length).toBe(resultUpper.length)
        expect(resultLower.length).toBe(resultMixed.length)
      })

      it('should find Pi character by name', () => {
        const result = searchCharacters('pi')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((c) => c.name.toLowerCase().includes('pi'))).toBe(true)
      })

      it('should find Euro by name', () => {
        const result = searchCharacters('euro')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((c) => c.name.toLowerCase().includes('euro'))).toBe(true)
      })

      it('should find Infinity symbol by name', () => {
        const result = searchCharacters('infinity')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((c) => c.char === '∞')).toBe(true)
      })

      it('should find characters with multi-word names', () => {
        const result = searchCharacters('double arrow')
        expect(result.length).toBeGreaterThan(0)
      })

      it('should find characters by partial word match', () => {
        const result = searchCharacters('left')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('left')
        })
      })
    })

    describe('search by character symbol', () => {
      it('should find character by exact symbol match', () => {
        const result = searchCharacters('→')
        expect(result.length).toBeGreaterThan(0)
        expect(result.some((c) => c.char === '→')).toBe(true)
      })

      it('should find Euro symbol by character', () => {
        const result = searchCharacters('€')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('€')
      })

      it('should find Dollar symbol by character', () => {
        const result = searchCharacters('$')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('$')
      })

      it('should find Greek alpha by character', () => {
        const result = searchCharacters('α')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('α')
      })

      it('should find Check Mark by character', () => {
        const result = searchCharacters('✓')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('✓')
      })

      it('should find Star symbols by character', () => {
        const resultBlack = searchCharacters('★')
        const resultWhite = searchCharacters('☆')
        expect(resultBlack.length).toBe(1)
        expect(resultWhite.length).toBe(1)
      })
    })

    describe('search by Unicode code', () => {
      it('should find character by exact Unicode code', () => {
        const result = searchCharacters('U+2192')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('→')
      })

      it('should find character by partial Unicode code', () => {
        const result = searchCharacters('2192')
        expect(result.length).toBe(1)
        expect(result[0].code).toBe('U+2192')
      })

      it('should be case-insensitive for Unicode code search', () => {
        const resultUpper = searchCharacters('U+2192')
        const resultLower = searchCharacters('u+2192')
        expect(resultUpper.length).toBe(resultLower.length)
      })

      it('should find character by U+ prefix search', () => {
        const result = searchCharacters('U+')
        // Should return all characters since all codes start with U+
        expect(result.length).toBe(getAllCharacters().length)
      })

      it('should find Euro by Unicode code', () => {
        const result = searchCharacters('20AC')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('€')
      })
    })

    describe('no results scenarios', () => {
      it('should return empty array for non-matching query', () => {
        const result = searchCharacters('xyznonexistent123')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for gibberish query', () => {
        const result = searchCharacters('qwertyuiopasdfghjkl')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for invalid Unicode code', () => {
        const result = searchCharacters('U+ZZZZ')
        expect(result).toHaveLength(0)
      })
    })

    describe('query trimming', () => {
      it('should trim leading whitespace', () => {
        const result = searchCharacters('   arrow')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('arrow')
        })
      })

      it('should trim trailing whitespace', () => {
        const result = searchCharacters('arrow   ')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('arrow')
        })
      })

      it('should trim both leading and trailing whitespace', () => {
        const result = searchCharacters('   arrow   ')
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('specific search scenarios', () => {
      it('should find all star-related characters', () => {
        const result = searchCharacters('star')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('star')
        })
      })

      it('should find all heart-related characters', () => {
        const result = searchCharacters('heart')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('heart')
        })
      })

      it('should find all check-related characters', () => {
        const result = searchCharacters('check')
        expect(result.length).toBeGreaterThan(0)
        result.forEach((c) => {
          expect(c.name.toLowerCase()).toContain('check')
        })
      })

      it('should find summation symbol', () => {
        const result = searchCharacters('summation')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('∑')
      })

      it('should find integral symbol', () => {
        const result = searchCharacters('integral')
        expect(result.length).toBe(1)
        expect(result[0].char).toBe('∫')
      })
    })
  })

  describe('getCharactersByCategory', () => {
    describe('valid category IDs', () => {
      it('should return arrows characters', () => {
        const result = getCharactersByCategory('arrows')
        expect(result.length).toBe(24)
        result.forEach((c) => {
          expect(c.category).toBe('arrows')
        })
      })

      it('should return math characters', () => {
        const result = getCharactersByCategory('math')
        expect(result.length).toBe(32)
        result.forEach((c) => {
          expect(c.category).toBe('math')
        })
      })

      it('should return currency characters', () => {
        const result = getCharactersByCategory('currency')
        expect(result.length).toBe(16)
        result.forEach((c) => {
          expect(c.category).toBe('currency')
        })
      })

      it('should return greek characters', () => {
        const result = getCharactersByCategory('greek')
        expect(result.length).toBe(36)
        result.forEach((c) => {
          expect(c.category).toBe('greek')
        })
      })

      it('should return punctuation characters', () => {
        const result = getCharactersByCategory('punctuation')
        expect(result.length).toBe(24)
        result.forEach((c) => {
          expect(c.category).toBe('punctuation')
        })
      })

      it('should return symbols characters', () => {
        const result = getCharactersByCategory('symbols')
        expect(result.length).toBe(38)
        result.forEach((c) => {
          expect(c.category).toBe('symbols')
        })
      })
    })

    describe('invalid category IDs', () => {
      it('should return empty array for non-existent category', () => {
        const result = getCharactersByCategory('nonexistent')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for empty string', () => {
        const result = getCharactersByCategory('')
        expect(result).toHaveLength(0)
      })

      it('should return empty array for "all" category (not a real category)', () => {
        const result = getCharactersByCategory('all')
        expect(result).toHaveLength(0)
      })

      it('should be case-sensitive for category ID', () => {
        const resultLower = getCharactersByCategory('arrows')
        const resultUpper = getCharactersByCategory('ARROWS')
        expect(resultLower.length).toBe(24)
        expect(resultUpper.length).toBe(0)
      })
    })

    describe('character content validation', () => {
      it('should return Character objects with correct structure', () => {
        const result = getCharactersByCategory('math')
        for (const char of result) {
          expect(char).toMatchObject({
            char: expect.any(String),
            name: expect.any(String),
            code: expect.any(String),
            category: 'math',
          })
        }
      })

      it('should return same characters as in characterCategories', () => {
        const arrowsFromCategories =
          characterCategories.find((c) => c.id === 'arrows')?.characters || []
        const arrowsFromFunction = getCharactersByCategory('arrows')
        expect(arrowsFromFunction).toEqual(arrowsFromCategories)
      })
    })
  })

  describe('Type Definitions', () => {
    it('Character interface should match expected structure', () => {
      const char: Character = {
        char: '→',
        name: 'Rightwards Arrow',
        code: 'U+2192',
        category: 'arrows',
      }
      expect(char).toHaveProperty('char')
      expect(char).toHaveProperty('name')
      expect(char).toHaveProperty('code')
      expect(char).toHaveProperty('category')
    })

    it('CharacterCategory interface should match expected structure', () => {
      const category: CharacterCategory = {
        id: 'test',
        name: 'Test Category',
        description: 'A test category',
        characters: [{ char: 'X', name: 'Test', code: 'U+0058', category: 'test' }],
      }
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('description')
      expect(category).toHaveProperty('characters')
    })
  })

  describe('Edge Cases and Data Integrity', () => {
    it('should not have duplicate characters across categories', () => {
      const allChars = getAllCharacters()
      // Some characters might appear in multiple categories, so we check for exact duplicates
      const charCodeSet = new Set(allChars.map((c) => `${c.char}-${c.code}`))
      expect(charCodeSet.size).toBe(allChars.length)
    })

    it('should not have duplicate Unicode codes', () => {
      const allChars = getAllCharacters()
      const codes = allChars.map((c) => c.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })

    it('should have unique character-code combinations per category', () => {
      for (const category of characterCategories) {
        const combinations = category.characters.map((c) => `${c.char}-${c.code}`)
        const uniqueCombinations = new Set(combinations)
        expect(uniqueCombinations.size).toBe(category.characters.length)
      }
    })
  })
})
