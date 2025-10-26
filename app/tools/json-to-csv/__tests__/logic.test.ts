import { describe, it, expect } from 'vitest'

// JSON to CSV conversion logic
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const flattened: Record<string, unknown> = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey))
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value)
    } else {
      flattened[newKey] = value
    }
  })

  return flattened
}

function escapeCSVField(field: unknown, delimiter: string): string {
  if (field === null || field === undefined) return ''
  const str = String(field)
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function convertToCSV(
  data: Record<string, unknown>[],
  delimiter: string,
  flattenNested: boolean
): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty array of objects')
  }

  // Process data
  const processedData = flattenNested ? data.map((item) => flattenObject(item)) : data

  // Get all unique headers
  const headers = Array.from(new Set(processedData.flatMap((obj) => Object.keys(obj)))).sort()

  // Create CSV header row
  const headerRow = headers.map((h) => escapeCSVField(h, delimiter)).join(delimiter)

  // Create CSV data rows
  const dataRows = processedData.map((obj) => {
    return headers.map((header) => escapeCSVField(obj[header], delimiter)).join(delimiter)
  })

  return [headerRow, ...dataRows].join('\n')
}

describe('JSON to CSV Converter Logic', () => {
  describe('Basic Conversion', () => {
    it('converts simple JSON array to CSV', () => {
      const input = [
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: 'Jane', age: 25, email: 'jane@example.com' },
      ]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines).toHaveLength(3) // header + 2 rows
      expect(lines[0]).toBe('age,email,name')
      expect(lines[1]).toContain('30')
      expect(lines[1]).toContain('john@example.com')
      expect(lines[2]).toContain('25')
      expect(lines[2]).toContain('jane@example.com')
    })

    it('handles empty array error', () => {
      expect(() => convertToCSV([], ',', false)).toThrow(
        'Input must be a non-empty array of objects'
      )
    })

    it('converts single object array to CSV', () => {
      const input = [{ id: 1, status: 'active' }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines).toHaveLength(2) // header + 1 row
      expect(lines[0]).toBe('id,status')
      expect(lines[1]).toBe('1,active')
    })
  })

  describe('Nested Object Flattening', () => {
    it('flattens nested objects when enabled', () => {
      const input = [
        {
          name: 'John',
          address: {
            city: 'New York',
            country: 'USA',
          },
        },
      ]

      const result = convertToCSV(input, ',', true)
      const lines = result.split('\n')

      expect(lines[0]).toContain('address.city')
      expect(lines[0]).toContain('address.country')
      expect(lines[1]).toContain('New York')
      expect(lines[1]).toContain('USA')
    })

    it('does not flatten when disabled', () => {
      const input = [
        {
          name: 'John',
          address: {
            city: 'New York',
          },
        },
      ]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('address,name')
      expect(lines[1]).toContain('[object Object]')
    })

    it('flattens deeply nested objects', () => {
      const obj = {
        level1: {
          level2: {
            level3: 'deep value',
          },
        },
      }

      const flattened = flattenObject(obj)
      expect(flattened['level1.level2.level3']).toBe('deep value')
    })

    it('handles arrays in nested objects', () => {
      const obj = {
        name: 'Test',
        tags: ['tag1', 'tag2'],
      }

      const flattened = flattenObject(obj)
      expect(flattened.tags).toBe('["tag1","tag2"]')
    })
  })

  describe('CSV Escaping', () => {
    it('escapes fields with commas', () => {
      const input = [{ name: 'Doe, John', age: 30 }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[1]).toContain('"Doe, John"')
    })

    it('escapes fields with quotes', () => {
      const input = [{ message: 'He said "Hello"' }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[1]).toContain('"He said ""Hello"""')
    })

    it('escapes fields with newlines', () => {
      const input = [{ text: 'Line 1\nLine 2' }]

      const result = convertToCSV(input, ',', false)

      expect(result).toContain('"Line 1\nLine 2"')
    })

    it('handles null and undefined values', () => {
      const field1 = escapeCSVField(null, ',')
      const field2 = escapeCSVField(undefined, ',')

      expect(field1).toBe('')
      expect(field2).toBe('')
    })

    it('converts non-string values to strings', () => {
      const input = [{ count: 42, active: true, price: 19.99 }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[1]).toContain('42')
      expect(lines[1]).toContain('true')
      expect(lines[1]).toContain('19.99')
    })
  })

  describe('Custom Delimiters', () => {
    it('uses semicolon delimiter', () => {
      const input = [{ a: 1, b: 2 }]

      const result = convertToCSV(input, ';', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('a;b')
      expect(lines[1]).toBe('1;2')
    })

    it('uses tab delimiter', () => {
      const input = [{ x: 'foo', y: 'bar' }]

      const result = convertToCSV(input, '\t', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('x\ty')
      expect(lines[1]).toBe('foo\tbar')
    })

    it('uses pipe delimiter', () => {
      const input = [{ col1: 'A', col2: 'B' }]

      const result = convertToCSV(input, '|', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('col1|col2')
      expect(lines[1]).toBe('A|B')
    })
  })

  describe('Stats Calculation', () => {
    it('calculates correct stats for converted CSV', () => {
      const input = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]

      const csv = convertToCSV(input, ',', false)
      const lines = csv.split('\n')
      const columns = lines[0].split(',').length

      expect(lines.length).toBe(3) // 1 header + 2 data rows
      expect(columns).toBe(2) // age, name
      expect(csv.length).toBeGreaterThan(0)
    })

    it('counts rows correctly for large dataset', () => {
      const input = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        value: `item-${i + 1}`,
      }))

      const csv = convertToCSV(input, ',', false)
      const lines = csv.split('\n')

      expect(lines.length).toBe(101) // 1 header + 100 data rows
    })
  })

  describe('Edge Cases', () => {
    it('handles objects with different keys', () => {
      const input = [
        { a: 1, b: 2 },
        { b: 3, c: 4 },
        { a: 5, c: 6 },
      ]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('a,b,c')
      expect(lines[1].split(',').length).toBe(3)
      expect(lines[2].split(',').length).toBe(3)
      expect(lines[3].split(',').length).toBe(3)
    })

    it('handles empty string values', () => {
      const input = [{ name: '', value: '' }]

      const result = convertToCSV(input, ',', false)

      expect(result.split('\n')[1]).toBe(',')
    })

    it('handles special characters in keys', () => {
      const input = [{ 'user-name': 'John', 'email@address': 'john@test.com' }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[0]).toContain('email@address')
      expect(lines[0]).toContain('user-name')
    })

    it('sorts headers alphabetically', () => {
      const input = [{ z: 1, a: 2, m: 3 }]

      const result = convertToCSV(input, ',', false)
      const lines = result.split('\n')

      expect(lines[0]).toBe('a,m,z')
    })
  })

  describe('JSON Validation', () => {
    it('validates JSON parsing', () => {
      const validJSON = '[{"name":"John"},{"name":"Jane"}]'

      expect(() => {
        const parsed = JSON.parse(validJSON)
        if (!Array.isArray(parsed)) {
          throw new Error('Must be array')
        }
      }).not.toThrow()
    })

    it('detects invalid JSON', () => {
      const invalidJSON = '{invalid json'

      expect(() => {
        JSON.parse(invalidJSON)
      }).toThrow()
    })

    it('detects non-array JSON', () => {
      const nonArrayJSON = '{"key": "value"}'
      const parsed = JSON.parse(nonArrayJSON)

      expect(Array.isArray(parsed)).toBe(false)
    })
  })

  describe('Flatten Object Helper', () => {
    it('handles simple object', () => {
      const obj = { a: 1, b: 2 }
      const result = flattenObject(obj)

      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('handles null values in nested objects', () => {
      const obj = { a: { b: null } }
      const result = flattenObject(obj)

      expect(result['a.b']).toBe(null)
    })

    it('preserves empty strings', () => {
      const obj = { name: '', value: '' }
      const result = flattenObject(obj)

      expect(result.name).toBe('')
      expect(result.value).toBe('')
    })
  })
})
