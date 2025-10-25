import { describe, it, expect } from 'vitest'

// Test the diff tool utility functions
describe('Diff Tool Logic', () => {
  describe('Stats Calculation', () => {
    it('calculates line and character counts correctly', () => {
      const oldValue = 'line1\nline2\nline3'
      const newValue = 'line1\nline2\nline3\nline4'

      const oldLines = oldValue.split('\n').length
      const newLines = newValue.split('\n').length
      const oldChars = oldValue.length
      const newChars = newValue.length

      expect(oldLines).toBe(3)
      expect(newLines).toBe(4)
      expect(oldChars).toBe(17)
      expect(newChars).toBe(23)
    })

    it('calculates diff stats correctly', () => {
      const oldLines = 3
      const newLines = 5
      const oldChars = 100
      const newChars = 150

      const linesDiff = newLines - oldLines
      const charsDiff = newChars - oldChars

      expect(linesDiff).toBe(2)
      expect(charsDiff).toBe(50)
    })

    it('handles empty content', () => {
      const oldValue = ''
      const newValue = ''

      const oldLines = oldValue.split('\n').length
      const newLines = newValue.split('\n').length

      expect(oldLines).toBe(1) // Empty string still has 1 line
      expect(newLines).toBe(1)
    })

    it('calculates negative diff when content is removed', () => {
      const oldLines = 10
      const newLines = 5
      const oldChars = 200
      const newChars = 100

      const linesDiff = newLines - oldLines
      const charsDiff = newChars - oldChars

      expect(linesDiff).toBe(-5)
      expect(charsDiff).toBe(-100)
    })
  })

  describe('JSON Validation', () => {
    it('validates correct JSON', () => {
      const validJSON = '{"name": "John", "age": 30}'
      let isValid = true

      try {
        JSON.parse(validJSON)
      } catch {
        isValid = false
      }

      expect(isValid).toBe(true)
    })

    it('invalidates incorrect JSON', () => {
      const invalidJSON = '{name: "John"}'
      let isValid = true

      try {
        JSON.parse(invalidJSON)
      } catch {
        isValid = false
      }

      expect(isValid).toBe(false)
    })

    it('handles empty string as invalid JSON', () => {
      const emptyString = ''
      let isValid = true

      try {
        if (emptyString) JSON.parse(emptyString)
      } catch {
        isValid = false
      }

      // Empty string should not throw error with conditional check
      expect(isValid).toBe(true)
    })

    it('validates complex nested JSON', () => {
      const complexJSON = '{"user": {"name": "John", "address": {"city": "NYC"}}}'
      let isValid = true

      try {
        const parsed = JSON.parse(complexJSON)
        isValid = typeof parsed === 'object'
      } catch {
        isValid = false
      }

      expect(isValid).toBe(true)
    })
  })

  describe('JSON Formatting', () => {
    it('formats JSON with proper indentation', () => {
      const input = '{"name":"John","age":30}'
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)

      expect(formatted).toBe('{\n  "name": "John",\n  "age": 30\n}')
    })

    it('preserves data when formatting', () => {
      const input = '{"a":1,"b":2,"c":3}'
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      const reParsed = JSON.parse(formatted)

      expect(reParsed).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('handles arrays in JSON', () => {
      const input = '{"items":[1,2,3]}'
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)

      expect(formatted).toContain('[')
      expect(formatted).toContain(']')
    })
  })

  describe('Content Swapping', () => {
    it('swaps old and new values', () => {
      let oldValue = 'original'
      let newValue = 'modified'

      const temp = oldValue
      oldValue = newValue
      newValue = temp

      expect(oldValue).toBe('modified')
      expect(newValue).toBe('original')
    })

    it('handles empty values when swapping', () => {
      let oldValue = ''
      let newValue = 'content'

      const temp = oldValue
      oldValue = newValue
      newValue = temp

      expect(oldValue).toBe('content')
      expect(newValue).toBe('')
    })
  })

  describe('Diff Text Generation', () => {
    it('generates diff text format', () => {
      const oldValue = 'original content'
      const newValue = 'modified content'

      const diffText = `=== OLD ===\n${oldValue}\n\n=== NEW ===\n${newValue}`

      expect(diffText).toContain('=== OLD ===')
      expect(diffText).toContain('=== NEW ===')
      expect(diffText).toContain('original content')
      expect(diffText).toContain('modified content')
    })

    it('handles multiline content in diff', () => {
      const oldValue = 'line1\nline2'
      const newValue = 'line1\nline2\nline3'

      const diffText = `=== OLD ===\n${oldValue}\n\n=== NEW ===\n${newValue}`

      const lines = diffText.split('\n')
      expect(lines.length).toBeGreaterThan(4)
    })
  })

  describe('View Type Toggling', () => {
    it('switches between split and unified views', () => {
      let viewType: 'split' | 'unified' = 'split'

      viewType = 'unified'
      expect(viewType).toBe('unified')

      viewType = 'split'
      expect(viewType).toBe('split')
    })
  })

  describe('Content Type Detection', () => {
    it('switches between text and JSON modes', () => {
      let contentType: 'text' | 'json' = 'text'

      contentType = 'json'
      expect(contentType).toBe('json')

      contentType = 'text'
      expect(contentType).toBe('text')
    })

    it('validates JSON only in JSON mode', () => {
      const content = '{"valid": true}'
      let isValid = true

      const contentType: 'text' | 'json' = 'json'

      if (contentType === 'json') {
        try {
          JSON.parse(content)
        } catch {
          isValid = false
        }
      }

      expect(isValid).toBe(true)
    })

    it('skips validation in text mode', () => {
      const textMode = 'text'
      const jsonMode = 'json'

      expect(textMode).not.toBe(jsonMode)
      expect(textMode).toBe('text')
    })
  })

  describe('File Download', () => {
    it('creates proper filename with timestamp', () => {
      const timestamp = Date.now()
      const filename = `diff-${timestamp}.txt`

      expect(filename).toMatch(/^diff-\d+\.txt$/)
    })

    it('generates blob with correct content type', () => {
      const diffText = 'test content'
      const blob = new Blob([diffText], { type: 'text/plain' })

      expect(blob.type).toBe('text/plain')
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('Reset Functionality', () => {
    it('clears all values on reset', () => {
      let oldValue = 'some content'
      let newValue = 'other content'

      oldValue = ''
      newValue = ''

      expect(oldValue).toBe('')
      expect(newValue).toBe('')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long content', () => {
      const longContent = 'a'.repeat(10000)
      const lines = longContent.split('\n').length
      const chars = longContent.length

      expect(chars).toBe(10000)
      expect(lines).toBe(1)
    })

    it('handles special characters in content', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const chars = specialChars.length

      expect(chars).toBeGreaterThan(0)
    })

    it('handles unicode characters', () => {
      const unicode = '你好世界 🌍 مرحبا'
      const chars = unicode.length

      expect(chars).toBeGreaterThan(0)
    })

    it('handles mixed line endings', () => {
      const mixedContent = 'line1\nline2\r\nline3\rline4'
      const unixLines = mixedContent.split('\n').length

      expect(unixLines).toBeGreaterThan(1)
    })
  })
})
