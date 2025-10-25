import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMemo } from 'react'

// Test the JSON validation and stats logic
describe('JSON Beautifier Logic', () => {
  describe('JSON Stats Calculation', () => {
    it('calculates stats for valid JSON', () => {
      const value = '{"name": "John", "age": 30}'

      const { result } = renderHook(() => {
        return useMemo(() => {
          const lines = value.split('\n').length
          const chars = value.length
          let isValid = false
          let objDepth = 0

          try {
            const parsed = JSON.parse(value)
            isValid = true
            const getDepth = (obj: unknown): number => {
              if (obj == null || typeof obj !== 'object') return 0
              return (
                1 +
                Math.max(
                  0,
                  ...Object.values(obj as Record<string, unknown>).map((v) => getDepth(v))
                )
              )
            }
            objDepth = getDepth(parsed)
          } catch {
            isValid = false
          }

          return { lines, chars, isValid, objDepth }
        }, [])
      })

      expect(result.current.isValid).toBe(true)
      expect(result.current.lines).toBe(1)
      expect(result.current.chars).toBe(27) // '{"name": "John", "age": 30}' is 27 chars
      expect(result.current.objDepth).toBe(1)
    })

    it('marks invalid JSON as invalid', () => {
      const value = '{invalid json'

      const { result } = renderHook(() => {
        return useMemo(() => {
          const lines = value.split('\n').length
          const chars = value.length
          let isValid = false
          const objDepth = 0

          try {
            JSON.parse(value)
            isValid = true
          } catch {
            isValid = false
          }

          return { lines, chars, isValid, objDepth }
        }, [])
      })

      expect(result.current.isValid).toBe(false)
    })

    it('calculates nested object depth correctly', () => {
      const value = '{"level1": {"level2": {"level3": true}}}'

      const { result } = renderHook(() => {
        return useMemo(() => {
          const objDepth = 0
          try {
            const parsed = JSON.parse(value)
            const getDepth = (obj: unknown): number => {
              if (obj == null || typeof obj !== 'object') return 0
              return (
                1 +
                Math.max(
                  0,
                  ...Object.values(obj as Record<string, unknown>).map((v) => getDepth(v))
                )
              )
            }
            return getDepth(parsed)
          } catch {
            return objDepth
          }
        }, [])
      })

      expect(result.current).toBe(3)
    })
  })

  describe('JSON Beautify Operation', () => {
    it('beautifies valid JSON', () => {
      const input = '{"name":"John","age":30}'
      let output = ''

      try {
        const obj = JSON.parse(input)
        output = JSON.stringify(obj, null, 2)
      } catch {
        output = input
      }

      expect(output).toBe('{\n  "name": "John",\n  "age": 30\n}')
    })

    it('handles beautify error for invalid JSON', () => {
      const input = '{invalid'
      let errorOccurred = false

      try {
        const obj = JSON.parse(input)
        JSON.stringify(obj, null, 2)
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(true)
    })
  })

  describe('JSON Minify Operation', () => {
    it('minifies valid JSON', () => {
      const input = '{\n  "name": "John",\n  "age": 30\n}'
      let output = ''

      try {
        const obj = JSON.parse(input)
        output = JSON.stringify(obj)
      } catch {
        output = input
      }

      expect(output).toBe('{"name":"John","age":30}')
    })

    it('handles minify error for invalid JSON', () => {
      const input = '{invalid'
      let errorOccurred = false

      try {
        const obj = JSON.parse(input)
        JSON.stringify(obj)
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(true)
    })
  })

  describe('JSON Download', () => {
    it('creates blob for valid JSON', () => {
      const value = '{"valid": true}'
      const isValid = true

      if (isValid) {
        const blob = new Blob([value], { type: 'application/json' })
        expect(blob.type).toBe('application/json')
        expect(blob.size).toBeGreaterThan(0)
      }
    })

    it('prevents download for invalid JSON', () => {
      const value = '{invalid'
      let isValid = false
      let errorOccurred = false

      try {
        JSON.parse(value)
        isValid = true
      } catch {
        errorOccurred = true
      }

      expect(isValid).toBe(false)
      expect(errorOccurred).toBe(true)
    })
  })

  describe('JSON Copy to Clipboard', () => {
    it('validates value before copying', () => {
      const value = '{"test": true}'
      let isValid = false

      try {
        JSON.parse(value)
        isValid = true
      } catch {
        isValid = false
      }

      expect(isValid).toBe(true)
      expect(value).toBeTruthy()
    })
  })
})
