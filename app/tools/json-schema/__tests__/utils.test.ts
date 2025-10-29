import { describe, expect, it } from 'vitest'
import {
  formatSchema,
  generateSchema,
  generateSchemaFromValue,
  type JSONSchema,
  validateSchema,
} from '../utils'

describe('JSON Schema Generator Utilities', () => {
  describe('generateSchemaFromValue', () => {
    describe('primitive types', () => {
      it('should infer string type', () => {
        const schema = generateSchemaFromValue('hello')
        expect(schema.type).toBe('string')
        expect(schema.minLength).toBe(0)
      })

      it('should infer integer type for whole numbers', () => {
        const schema = generateSchemaFromValue(42)
        expect(schema.type).toBe('integer')
      })

      it('should infer number type for decimals', () => {
        const schema = generateSchemaFromValue(3.14)
        expect(schema.type).toBe('number')
      })

      it('should infer boolean type', () => {
        const schema = generateSchemaFromValue(true)
        expect(schema.type).toBe('boolean')
      })

      it('should infer null type', () => {
        const schema = generateSchemaFromValue(null)
        expect(schema.type).toBe('null')
      })
    })

    describe('format detection', () => {
      it('should detect email format', () => {
        const schema = generateSchemaFromValue('test@example.com', { detectFormats: true })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('email')
      })

      it('should detect URI format', () => {
        const schema = generateSchemaFromValue('https://example.com', { detectFormats: true })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('uri')
      })

      it('should detect date-time format', () => {
        const schema = generateSchemaFromValue('2024-01-01T12:00:00', { detectFormats: true })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('date-time')
      })

      it('should detect date format', () => {
        const schema = generateSchemaFromValue('2024-01-01', { detectFormats: true })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('date')
      })

      it('should detect time format', () => {
        const schema = generateSchemaFromValue('12:30:45', { detectFormats: true })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('time')
      })

      it('should detect UUID format', () => {
        const schema = generateSchemaFromValue('550e8400-e29b-41d4-a716-446655440000', {
          detectFormats: true,
        })
        expect(schema.type).toBe('string')
        expect(schema.format).toBe('uuid')
      })

      it('should not detect format when disabled', () => {
        const schema = generateSchemaFromValue('test@example.com', { detectFormats: false })
        expect(schema.format).toBeUndefined()
      })

      it('should not detect format for regular strings', () => {
        const schema = generateSchemaFromValue('just a regular string', { detectFormats: true })
        expect(schema.format).toBeUndefined()
      })
    })

    describe('array handling', () => {
      it('should infer array type', () => {
        const schema = generateSchemaFromValue([1, 2, 3])
        expect(schema.type).toBe('array')
      })

      it('should infer homogeneous array items', () => {
        const schema = generateSchemaFromValue([1, 2, 3])
        expect(schema.type).toBe('array')
        expect(schema.items?.type).toBe('integer')
      })

      it('should handle heterogeneous arrays with multiple types', () => {
        const schema = generateSchemaFromValue([1, 'string', true])
        expect(schema.type).toBe('array')
        expect(Array.isArray(schema.items?.type)).toBe(true)
        expect(schema.items?.type).toContain('integer')
        expect(schema.items?.type).toContain('string')
        expect(schema.items?.type).toContain('boolean')
      })

      it('should handle empty arrays', () => {
        const schema = generateSchemaFromValue([])
        expect(schema.type).toBe('array')
        expect(schema.items?.type).toBe('string')
      })

      it('should handle nested arrays', () => {
        const schema = generateSchemaFromValue([
          [1, 2],
          [3, 4],
        ])
        expect(schema.type).toBe('array')
        expect(schema.items?.type).toBe('array')
        expect(schema.items?.items?.type).toBe('integer')
      })

      it('should handle arrays of objects', () => {
        const schema = generateSchemaFromValue([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ])
        expect(schema.type).toBe('array')
        expect(schema.items?.type).toBe('object')
        expect(schema.items?.properties).toHaveProperty('id')
        expect(schema.items?.properties).toHaveProperty('name')
      })
    })

    describe('object handling', () => {
      it('should infer object type', () => {
        const schema = generateSchemaFromValue({ key: 'value' })
        expect(schema.type).toBe('object')
      })

      it('should generate properties for object fields', () => {
        const schema = generateSchemaFromValue({
          name: 'John',
          age: 30,
          active: true,
        })
        expect(schema.type).toBe('object')
        expect(schema.properties).toBeDefined()
        expect(schema.properties?.name.type).toBe('string')
        expect(schema.properties?.age.type).toBe('integer')
        expect(schema.properties?.active.type).toBe('boolean')
      })

      it('should handle nested objects', () => {
        const schema = generateSchemaFromValue({
          user: {
            name: 'John',
            address: {
              city: 'New York',
              zip: '10001',
            },
          },
        })
        expect(schema.type).toBe('object')
        expect(schema.properties?.user.type).toBe('object')
        expect(schema.properties?.user.properties?.address.type).toBe('object')
        expect(schema.properties?.user.properties?.address.properties?.city.type).toBe('string')
      })

      it('should detect required fields by default', () => {
        const schema = generateSchemaFromValue(
          {
            name: 'John',
            age: 30,
          },
          { detectRequired: true }
        )
        expect(schema.required).toContain('name')
        expect(schema.required).toContain('age')
      })

      it('should not mark null values as required', () => {
        const schema = generateSchemaFromValue(
          {
            name: 'John',
            optional: null,
          },
          { detectRequired: true }
        )
        expect(schema.required).toContain('name')
        expect(schema.required).not.toContain('optional')
      })

      it('should not detect required fields when disabled', () => {
        const schema = generateSchemaFromValue(
          {
            name: 'John',
            age: 30,
          },
          { detectRequired: false }
        )
        expect(schema.required).toBeUndefined()
      })

      it('should set additionalProperties to false', () => {
        const schema = generateSchemaFromValue({ key: 'value' })
        expect(schema.additionalProperties).toBe(false)
      })

      it('should handle empty objects', () => {
        const schema = generateSchemaFromValue({})
        expect(schema.type).toBe('object')
        expect(schema.properties).toEqual({})
      })
    })

    describe('complex nested structures', () => {
      it('should handle deeply nested structures', () => {
        const data = {
          level1: {
            level2: {
              level3: {
                value: 'deep',
              },
            },
          },
        }
        const schema = generateSchemaFromValue(data)
        expect(schema.type).toBe('object')
        expect(schema.properties?.level1.type).toBe('object')
        expect(schema.properties?.level1.properties?.level2.type).toBe('object')
        expect(schema.properties?.level1.properties?.level2.properties?.level3.type).toBe('object')
        expect(
          schema.properties?.level1.properties?.level2.properties?.level3.properties?.value.type
        ).toBe('string')
      })

      it('should handle mixed arrays and objects', () => {
        const data = {
          users: [
            { id: 1, tags: ['admin', 'user'] },
            { id: 2, tags: ['user'] },
          ],
        }
        const schema = generateSchemaFromValue(data)
        expect(schema.type).toBe('object')
        expect(schema.properties?.users.type).toBe('array')
        expect(schema.properties?.users.items?.type).toBe('object')
        expect(schema.properties?.users.items?.properties?.tags.type).toBe('array')
        expect(schema.properties?.users.items?.properties?.tags.items?.type).toBe('string')
      })
    })

    describe('edge cases', () => {
      it('should handle negative numbers', () => {
        const schema = generateSchemaFromValue(-42)
        expect(schema.type).toBe('integer')
      })

      it('should handle zero', () => {
        const schema = generateSchemaFromValue(0)
        expect(schema.type).toBe('integer')
      })

      it('should handle empty string', () => {
        const schema = generateSchemaFromValue('')
        expect(schema.type).toBe('string')
        expect(schema.minLength).toBe(0)
      })

      it('should handle large numbers', () => {
        const schema = generateSchemaFromValue(Number.MAX_SAFE_INTEGER)
        expect(schema.type).toBe('integer')
      })

      it('should handle floating point precision', () => {
        const schema = generateSchemaFromValue(0.1 + 0.2)
        expect(schema.type).toBe('number')
      })
    })
  })

  describe('generateSchema', () => {
    it('should parse JSON string and generate schema', () => {
      const json = '{"name": "John", "age": 30}'
      const schema = generateSchema(json)
      expect(schema.type).toBe('object')
      expect(schema.properties?.name.type).toBe('string')
      expect(schema.properties?.age.type).toBe('integer')
    })

    it('should include $schema by default', () => {
      const json = '{"key": "value"}'
      const schema = generateSchema(json)
      expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
    })

    it('should not include $schema when disabled', () => {
      const json = '{"key": "value"}'
      const schema = generateSchema(json, { includeSchema: false })
      expect(schema.$schema).toBeUndefined()
    })

    it('should add title when provided', () => {
      const json = '{"key": "value"}'
      const schema = generateSchema(json, { title: 'My Schema' })
      expect(schema.title).toBe('My Schema')
    })

    it('should add description when provided', () => {
      const json = '{"key": "value"}'
      const schema = generateSchema(json, { description: 'Schema description' })
      expect(schema.description).toBe('Schema description')
    })

    it('should respect detectRequired option', () => {
      const json = '{"name": "John", "age": 30}'
      const schema = generateSchema(json, { detectRequired: false })
      expect(schema.required).toBeUndefined()
    })

    it('should respect detectFormats option', () => {
      const json = '{"email": "test@example.com"}'
      const schema = generateSchema(json, { detectFormats: false })
      expect(schema.properties?.email.format).toBeUndefined()
    })

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{"key": invalid}'
      expect(() => generateSchema(invalidJson)).toThrow()
    })

    it('should handle array at root level', () => {
      const json = '[1, 2, 3]'
      const schema = generateSchema(json)
      expect(schema.type).toBe('array')
      expect(schema.items?.type).toBe('integer')
    })

    it('should handle primitive at root level', () => {
      const json = '"hello"'
      const schema = generateSchema(json)
      expect(schema.type).toBe('string')
    })

    it('should handle complex real-world example', () => {
      const json = JSON.stringify({
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        profile: {
          name: 'John Doe',
          age: 30,
          verified: true,
          joinedAt: '2024-01-01T12:00:00',
        },
        tags: ['developer', 'admin'],
        settings: {
          notifications: true,
          theme: 'dark',
        },
      })

      const schema = generateSchema(json, {
        title: 'User Schema',
        description: 'Schema for user object',
      })

      expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
      expect(schema.title).toBe('User Schema')
      expect(schema.description).toBe('Schema for user object')
      expect(schema.properties?.id.format).toBe('uuid')
      expect(schema.properties?.email.format).toBe('email')
      expect(schema.properties?.profile.type).toBe('object')
      expect(schema.properties?.tags.type).toBe('array')
      expect(schema.required).toContain('id')
      expect(schema.required).toContain('email')
    })
  })

  describe('validateSchema', () => {
    it('should validate valid schema', () => {
      const schema: JSONSchema = { type: 'string' }
      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should validate schema with properties', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      }
      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should reject schema without type', () => {
      const schema = { properties: {} }
      const result = validateSchema(schema)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('type')
    })

    it('should reject non-object schema', () => {
      const result1 = validateSchema(null)
      expect(result1.valid).toBe(false)
      expect(result1.error).toContain('object')

      const result2 = validateSchema('string')
      expect(result2.valid).toBe(false)

      const result3 = validateSchema(123)
      expect(result3.valid).toBe(false)
    })

    it('should reject invalid type values', () => {
      const schema = { type: 'invalid-type' }
      const result = validateSchema(schema)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid type')
    })

    it('should validate schema with array type', () => {
      const schema: JSONSchema = { type: ['string', 'null'] }
      const result = validateSchema(schema)
      expect(result.valid).toBe(true)
    })

    it('should reject schema with invalid type in array', () => {
      const schema = { type: ['string', 'invalid'] }
      const result = validateSchema(schema)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid type')
    })

    it('should validate all valid JSON Schema types', () => {
      const types = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']

      for (const type of types) {
        const schema: JSONSchema = { type }
        const result = validateSchema(schema)
        expect(result.valid).toBe(true)
      }
    })
  })

  describe('formatSchema', () => {
    it('should format schema as pretty JSON', () => {
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
        },
      }
      const formatted = formatSchema(schema)
      expect(formatted).toContain('\n')
      expect(formatted).toContain('  ')
      expect(JSON.parse(formatted)).toEqual(schema)
    })

    it('should maintain schema structure', () => {
      const schema: JSONSchema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        title: 'Test Schema',
        properties: {
          nested: {
            type: 'object',
            properties: {
              value: { type: 'string' },
            },
          },
        },
        required: ['nested'],
      }
      const formatted = formatSchema(schema)
      const parsed = JSON.parse(formatted)
      expect(parsed).toEqual(schema)
    })

    it('should format minimal schema', () => {
      const schema: JSONSchema = { type: 'string' }
      const formatted = formatSchema(schema)
      expect(formatted).toBe('{\n  "type": "string"\n}')
    })
  })

  describe('integration tests', () => {
    it('should handle complete workflow: parse -> validate -> format', () => {
      const json = '{"name": "John", "age": 30, "email": "john@example.com"}'
      const schema = generateSchema(json, {
        title: 'User',
        description: 'User object schema',
      })

      const validation = validateSchema(schema)
      expect(validation.valid).toBe(true)

      const formatted = formatSchema(schema)
      expect(formatted).toContain('"title": "User"')
      expect(formatted).toContain('"description": "User object schema"')
      expect(formatted).toContain('"email"')

      const reparsed = JSON.parse(formatted)
      expect(reparsed).toEqual(schema)
    })

    it('should preserve schema correctness through format cycle', () => {
      const data = {
        users: [
          {
            id: 1,
            name: 'Alice',
            contacts: {
              email: 'alice@example.com',
              phone: null,
            },
          },
        ],
        total: 1,
        active: true,
      }

      const schema = generateSchemaFromValue(data)
      const formatted = formatSchema(schema)
      const reparsed = JSON.parse(formatted)

      expect(reparsed).toEqual(schema)
      expect(validateSchema(reparsed).valid).toBe(true)
    })
  })

  describe('special characters and Unicode', () => {
    it('should handle special characters in strings', () => {
      const json = '{"text": "Hello!@#$%^&*()_+-=[]{}|;:,.<>?"}'
      const schema = generateSchema(json)
      expect(schema.properties?.text.type).toBe('string')
    })

    it('should handle Unicode characters', () => {
      const json = '{"text": "你好世界 🌍 こんにちは"}'
      const schema = generateSchema(json)
      expect(schema.properties?.text.type).toBe('string')
    })

    it('should handle escaped characters', () => {
      const json = '{"text": "Line 1\\nLine 2\\tTabbed"}'
      const schema = generateSchema(json)
      expect(schema.properties?.text.type).toBe('string')
    })
  })
})
