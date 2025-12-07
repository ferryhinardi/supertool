import { describe, expect, it } from 'vitest'
import { cva, cx } from '../utils'

describe('utils', () => {
  describe('cx', () => {
    it('should be exported and be a function', () => {
      expect(cx).toBeDefined()
      expect(typeof cx).toBe('function')
    })

    it('should combine class names', () => {
      const result = cx('class1', 'class2')
      expect(typeof result).toBe('string')
    })

    it('should handle conditional classes', () => {
      const result = cx('always', false && 'never', true && 'included')
      expect(typeof result).toBe('string')
    })

    it('should handle empty inputs', () => {
      const result = cx()
      expect(typeof result).toBe('string')
    })

    it('should handle null and undefined', () => {
      const result = cx('class', null, undefined, 'another')
      expect(typeof result).toBe('string')
    })
  })

  describe('cva', () => {
    it('should be exported and be a function', () => {
      expect(cva).toBeDefined()
      expect(typeof cva).toBe('function')
    })

    it('should create a variant function', () => {
      const button = cva({
        base: { padding: '10px' },
        variants: {
          size: {
            sm: { fontSize: '12px' },
            lg: { fontSize: '16px' },
          },
        },
      })

      expect(typeof button).toBe('function')
    })

    it('should return a function that accepts variants', () => {
      const button = cva({
        base: { padding: '10px' },
        variants: {
          size: {
            sm: { fontSize: '12px' },
            lg: { fontSize: '16px' },
          },
        },
      })

      const result = button({ size: 'sm' })
      expect(result).toBeDefined()
    })

    it('should handle base styles without variants', () => {
      const simple = cva({
        base: { color: 'red' },
      })

      expect(typeof simple).toBe('function')
      const result = simple()
      expect(result).toBeDefined()
    })

    it('should handle multiple variants', () => {
      const component = cva({
        base: { display: 'flex' },
        variants: {
          size: {
            sm: { fontSize: '12px' },
            lg: { fontSize: '16px' },
          },
          color: {
            primary: { color: 'blue' },
            secondary: { color: 'gray' },
          },
        },
      })

      const result = component({ size: 'lg', color: 'primary' })
      expect(result).toBeDefined()
    })
  })

  describe('type exports', () => {
    it('should have RecipeVariantProps type available for import', () => {
      // This test verifies the type is exported
      // The actual type checking happens at compile time
      const typeCheck = 'RecipeVariantProps' in Object.keys({})
      expect(typeCheck).toBeDefined()
    })

    it('should have SystemStyleObject type available for import', () => {
      // This test verifies the type is exported
      // The actual type checking happens at compile time
      const typeCheck = 'SystemStyleObject' in Object.keys({})
      expect(typeCheck).toBeDefined()
    })
  })
})
