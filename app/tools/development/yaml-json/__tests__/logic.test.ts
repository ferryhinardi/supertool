import * as yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'

describe('YAML ↔ JSON Converter Logic', () => {
  describe('YAML to JSON Conversion', () => {
    it('converts simple YAML to JSON correctly', () => {
      const yamlInput = `name: John
age: 30
city: New York`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        name: 'John',
        age: 30,
        city: 'New York',
      })
    })

    it('converts nested YAML objects to JSON correctly', () => {
      const yamlInput = `person:
  name: Jane
  age: 25
  address:
    street: 123 Main St
    city: Boston`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        person: {
          name: 'Jane',
          age: 25,
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
        },
      })
    })

    it('converts YAML arrays to JSON correctly', () => {
      const yamlInput = `fruits:
  - apple
  - banana
  - orange`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        fruits: ['apple', 'banana', 'orange'],
      })
    })

    it('converts YAML with mixed arrays and objects to JSON correctly', () => {
      const yamlInput = `users:
  - name: Alice
    role: admin
  - name: Bob
    role: user`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        users: [
          { name: 'Alice', role: 'admin' },
          { name: 'Bob', role: 'user' },
        ],
      })
    })

    it('converts YAML with boolean values correctly', () => {
      const yamlInput = `settings:
  enabled: true
  debug: false`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        settings: {
          enabled: true,
          debug: false,
        },
      })
    })

    it('converts YAML with null values correctly', () => {
      const yamlInput = `data:
  value: null
  empty: ~`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        data: {
          value: null,
          empty: null,
        },
      })
    })

    it('converts YAML with numbers correctly', () => {
      const yamlInput = `numbers:
  integer: 42
  float: 3.14
  negative: -10
  scientific: 1.23e10`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        numbers: {
          integer: 42,
          float: 3.14,
          negative: -10,
          scientific: 1.23e10,
        },
      })
    })

    it('ignores YAML comments when converting to JSON', () => {
      const yamlInput = `# This is a comment
name: John # Inline comment
age: 30`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        name: 'John',
        age: 30,
      })
    })

    it('throws error for invalid YAML syntax', () => {
      const invalidYaml = `name: John
  age: 30
    city: Invalid indent`

      expect(() => yaml.load(invalidYaml)).toThrow()
    })
  })

  describe('JSON to YAML Conversion', () => {
    it('converts simple JSON to YAML correctly', () => {
      const jsonInput = JSON.stringify({
        name: 'John',
        age: 30,
        city: 'New York',
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      // Parse YAML back to verify
      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        name: 'John',
        age: 30,
        city: 'New York',
      })
    })

    it('converts nested JSON objects to YAML correctly', () => {
      const jsonInput = JSON.stringify({
        person: {
          name: 'Jane',
          age: 25,
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
        },
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        person: {
          name: 'Jane',
          age: 25,
          address: {
            street: '123 Main St',
            city: 'Boston',
          },
        },
      })
    })

    it('converts JSON arrays to YAML correctly', () => {
      const jsonInput = JSON.stringify({
        fruits: ['apple', 'banana', 'orange'],
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        fruits: ['apple', 'banana', 'orange'],
      })
    })

    it('converts JSON with mixed arrays and objects to YAML correctly', () => {
      const jsonInput = JSON.stringify({
        users: [
          { name: 'Alice', role: 'admin' },
          { name: 'Bob', role: 'user' },
        ],
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        users: [
          { name: 'Alice', role: 'admin' },
          { name: 'Bob', role: 'user' },
        ],
      })
    })

    it('converts JSON with boolean values correctly', () => {
      const jsonInput = JSON.stringify({
        settings: {
          enabled: true,
          debug: false,
        },
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        settings: {
          enabled: true,
          debug: false,
        },
      })
    })

    it('converts JSON with null values correctly', () => {
      const jsonInput = JSON.stringify({
        data: {
          value: null,
          empty: null,
        },
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        data: {
          value: null,
          empty: null,
        },
      })
    })

    it('converts JSON with numbers correctly', () => {
      const jsonInput = JSON.stringify({
        numbers: {
          integer: 42,
          float: 3.14,
          negative: -10,
        },
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        numbers: {
          integer: 42,
          float: 3.14,
          negative: -10,
        },
      })
    })

    it('throws error for invalid JSON syntax', () => {
      const invalidJson = `{ name: "John", age: 30, }` // Trailing comma

      expect(() => JSON.parse(invalidJson)).toThrow()
    })

    it('throws error for malformed JSON', () => {
      const malformedJson = `{ "name": "John" "age": 30 }` // Missing comma

      expect(() => JSON.parse(malformedJson)).toThrow()
    })
  })

  describe('Bidirectional Conversions', () => {
    it('converts YAML to JSON and back maintains data integrity', () => {
      const originalYaml = `name: SuperTool
version: 1.0.0
features:
  - JSON Formatter
  - YAML Converter
settings:
  theme: dark
  enabled: true`

      // YAML -> JSON
      const parsed1 = yaml.load(originalYaml)
      const json = JSON.stringify(parsed1, null, 2)

      // JSON -> YAML
      const parsed2 = JSON.parse(json)
      const yamlOutput = yaml.dump(parsed2, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      // Compare final result with original
      const finalParsed = yaml.load(yamlOutput)
      const originalParsed = yaml.load(originalYaml)

      expect(finalParsed).toEqual(originalParsed)
    })

    it('converts JSON to YAML and back maintains data integrity', () => {
      const originalJson = JSON.stringify(
        {
          name: 'SuperTool',
          version: '1.0.0',
          features: ['JSON Formatter', 'YAML Converter'],
          settings: {
            theme: 'dark',
            enabled: true,
          },
        },
        null,
        2
      )

      // JSON -> YAML
      const parsed1 = JSON.parse(originalJson)
      const yamlOutput = yaml.dump(parsed1, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      // YAML -> JSON
      const parsed2 = yaml.load(yamlOutput)
      const jsonOutput = JSON.stringify(parsed2, null, 2)

      // Compare final result with original
      expect(JSON.parse(jsonOutput)).toEqual(JSON.parse(originalJson))
    })
  })

  describe('Edge Cases', () => {
    it('handles empty YAML input', () => {
      const emptyYaml = ''
      const result = yaml.load(emptyYaml)
      expect(result).toBeUndefined()
    })

    it('handles empty JSON object', () => {
      const emptyJson = '{}'
      const parsed = JSON.parse(emptyJson)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      expect(yamlOutput).toBe('{}\n')
    })

    it('handles empty JSON array', () => {
      const emptyArray = '[]'
      const parsed = JSON.parse(emptyArray)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      expect(yamlOutput).toBe('[]\n')
    })

    it('handles YAML with special characters in strings', () => {
      const yamlInput = `message: "Hello: World!"
path: 'C:\\Users\\John'`

      const parsed = yaml.load(yamlInput)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toEqual({
        message: 'Hello: World!',
        path: 'C:\\Users\\John',
      })
    })

    it('handles JSON with special characters', () => {
      const jsonInput = JSON.stringify({
        message: 'Hello: World!',
        path: 'C:\\Users\\John',
        quote: 'She said "Hello"',
      })

      const parsed = JSON.parse(jsonInput)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toEqual({
        message: 'Hello: World!',
        path: 'C:\\Users\\John',
        quote: 'She said "Hello"',
      })
    })

    it('handles YAML with multiline strings', () => {
      const yamlInput = `description: |
  This is a
  multiline
  string`

      const parsed = yaml.load(yamlInput)
      const result = parsed as { description: string }

      expect(result.description).toBe('This is a\nmultiline\nstring\n')
    })

    it('handles deeply nested objects', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep',
                },
              },
            },
          },
        },
      }

      // JSON -> YAML
      const yamlOutput = yaml.dump(deepObject, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      // YAML -> JSON
      const parsed = yaml.load(yamlOutput)

      expect(parsed).toEqual(deepObject)
    })

    it('handles large arrays', () => {
      const largeArray = {
        numbers: Array.from({ length: 100 }, (_, i) => i),
      }

      // JSON -> YAML
      const yamlOutput = yaml.dump(largeArray, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      // YAML -> JSON
      const parsed = yaml.load(yamlOutput)

      expect(parsed).toEqual(largeArray)
    })
  })

  describe('Real-World Examples', () => {
    it('handles Docker Compose file structure', () => {
      const dockerComposeYaml = `version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
  db:
    image: postgres:13
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:`

      const parsed = yaml.load(dockerComposeYaml)
      const jsonOutput = JSON.stringify(parsed, null, 2)
      const result = JSON.parse(jsonOutput)

      expect(result).toHaveProperty('version', '3.8')
      expect(result).toHaveProperty('services')
      expect(result.services).toHaveProperty('web')
      expect(result.services).toHaveProperty('db')
    })

    it('handles package.json structure', () => {
      const packageJson = JSON.stringify({
        name: 'supertool',
        version: '1.0.0',
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          react: '^18.0.0',
          next: '^14.0.0',
        },
      })

      const parsed = JSON.parse(packageJson)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput)

      expect(result).toHaveProperty('name', 'supertool')
      expect(result).toHaveProperty('scripts')
      expect(result).toHaveProperty('dependencies')
    })

    it('handles API response structure', () => {
      const apiResponse = JSON.stringify({
        status: 'success',
        data: {
          users: [
            {
              id: 1,
              name: 'Alice',
              email: 'alice@example.com',
              active: true,
            },
            {
              id: 2,
              name: 'Bob',
              email: 'bob@example.com',
              active: false,
            },
          ],
          total: 2,
          page: 1,
        },
      })

      const parsed = JSON.parse(apiResponse)
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })

      const result = yaml.load(yamlOutput) as any

      expect(result).toHaveProperty('status', 'success')
      expect(result.data).toHaveProperty('users')
      expect(result.data.users).toHaveLength(2)
    })
  })
})
