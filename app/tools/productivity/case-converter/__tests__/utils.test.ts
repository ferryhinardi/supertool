/**
 * Tests for case-converter utility functions
 *
 * Note: These functions are embedded in page.tsx. We're testing them
 * by importing the module and accessing the functions directly or
 * by recreating them here for isolated testing.
 */
import { describe, expect, it } from 'vitest'

// Recreate the utility functions for isolated testing
// These should match the implementations in page.tsx lines 89-161

function splitIntoWords(text: string): string[] {
  // Handle camelCase and PascalCase by inserting spaces before uppercase letters
  const withSpaces = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')

  // Split by common separators
  return withSpaces.split(/[\s_\-.]+/).filter((word) => word.length > 0)
}

type CaseType =
  | 'camelCase'
  | 'PascalCase'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE'
  | 'kebab-case'
  | 'TRAIN-CASE'
  | 'dot.case'
  | 'Title Case'
  | 'Sentence case'
  | 'lowercase'
  | 'UPPERCASE'

function convertCase(text: string, caseType: CaseType): string {
  if (!text.trim()) return ''

  const words = splitIntoWords(text)
  if (words.length === 0) return ''

  switch (caseType) {
    case 'camelCase':
      return words
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('')

    case 'PascalCase':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')

    case 'snake_case':
      return words.map((word) => word.toLowerCase()).join('_')

    case 'SCREAMING_SNAKE_CASE':
      return words.map((word) => word.toUpperCase()).join('_')

    case 'kebab-case':
      return words.map((word) => word.toLowerCase()).join('-')

    case 'TRAIN-CASE':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-')

    case 'dot.case':
      return words.map((word) => word.toLowerCase()).join('.')

    case 'Title Case':
      return words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

    case 'Sentence case':
      return words
        .map((word, index) =>
          index === 0
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
        )
        .join(' ')

    case 'lowercase':
      return words.map((word) => word.toLowerCase()).join(' ')

    case 'UPPERCASE':
      return words.map((word) => word.toUpperCase()).join(' ')

    default:
      return text
  }
}

describe('splitIntoWords', () => {
  describe('basic splitting', () => {
    it('splits space-separated words', () => {
      expect(splitIntoWords('hello world')).toEqual(['hello', 'world'])
    })

    it('splits underscore-separated words (snake_case)', () => {
      expect(splitIntoWords('hello_world')).toEqual(['hello', 'world'])
    })

    it('splits hyphen-separated words (kebab-case)', () => {
      expect(splitIntoWords('hello-world')).toEqual(['hello', 'world'])
    })

    it('splits dot-separated words (dot.case)', () => {
      expect(splitIntoWords('hello.world')).toEqual(['hello', 'world'])
    })

    it('splits camelCase words', () => {
      expect(splitIntoWords('helloWorld')).toEqual(['hello', 'World'])
    })

    it('splits PascalCase words', () => {
      expect(splitIntoWords('HelloWorld')).toEqual(['Hello', 'World'])
    })

    it('handles multiple separators', () => {
      expect(splitIntoWords('hello_world-test')).toEqual(['hello', 'world', 'test'])
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(splitIntoWords('')).toEqual([])
    })

    it('handles single word', () => {
      expect(splitIntoWords('hello')).toEqual(['hello'])
    })

    it('handles multiple spaces', () => {
      expect(splitIntoWords('hello   world')).toEqual(['hello', 'world'])
    })

    it('handles leading/trailing separators', () => {
      expect(splitIntoWords('_hello_world_')).toEqual(['hello', 'world'])
    })

    it('handles consecutive separators', () => {
      expect(splitIntoWords('hello__world')).toEqual(['hello', 'world'])
    })

    it('handles mixed case with separators', () => {
      expect(splitIntoWords('helloWorld_test')).toEqual(['hello', 'World', 'test'])
    })
  })

  describe('acronyms and special patterns', () => {
    it('handles acronyms followed by lowercase (XMLParser)', () => {
      expect(splitIntoWords('XMLParser')).toEqual(['XML', 'Parser'])
    })

    it('handles acronyms in the middle (parseXMLData)', () => {
      expect(splitIntoWords('parseXMLData')).toEqual(['parse', 'XML', 'Data'])
    })

    it('handles all caps word', () => {
      expect(splitIntoWords('HELLO')).toEqual(['HELLO'])
    })

    it('handles numbers in words', () => {
      expect(splitIntoWords('user2name')).toEqual(['user2name'])
    })

    it('handles number separated words', () => {
      expect(splitIntoWords('user_2_name')).toEqual(['user', '2', 'name'])
    })
  })
})

describe('convertCase', () => {
  const testInput = 'hello world test'
  const camelInput = 'helloWorldTest'
  const snakeInput = 'hello_world_test'
  const kebabInput = 'hello-world-test'

  describe('camelCase conversion', () => {
    it('converts space-separated to camelCase', () => {
      expect(convertCase(testInput, 'camelCase')).toBe('helloWorldTest')
    })

    it('converts snake_case to camelCase', () => {
      expect(convertCase(snakeInput, 'camelCase')).toBe('helloWorldTest')
    })

    it('converts kebab-case to camelCase', () => {
      expect(convertCase(kebabInput, 'camelCase')).toBe('helloWorldTest')
    })

    it('converts PascalCase to camelCase', () => {
      expect(convertCase('HelloWorldTest', 'camelCase')).toBe('helloWorldTest')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'camelCase')).toBe('hello')
    })

    it('handles already camelCase', () => {
      expect(convertCase(camelInput, 'camelCase')).toBe('helloWorldTest')
    })
  })

  describe('PascalCase conversion', () => {
    it('converts space-separated to PascalCase', () => {
      expect(convertCase(testInput, 'PascalCase')).toBe('HelloWorldTest')
    })

    it('converts snake_case to PascalCase', () => {
      expect(convertCase(snakeInput, 'PascalCase')).toBe('HelloWorldTest')
    })

    it('converts kebab-case to PascalCase', () => {
      expect(convertCase(kebabInput, 'PascalCase')).toBe('HelloWorldTest')
    })

    it('converts camelCase to PascalCase', () => {
      expect(convertCase(camelInput, 'PascalCase')).toBe('HelloWorldTest')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'PascalCase')).toBe('Hello')
    })
  })

  describe('snake_case conversion', () => {
    it('converts space-separated to snake_case', () => {
      expect(convertCase(testInput, 'snake_case')).toBe('hello_world_test')
    })

    it('converts camelCase to snake_case', () => {
      expect(convertCase(camelInput, 'snake_case')).toBe('hello_world_test')
    })

    it('converts PascalCase to snake_case', () => {
      expect(convertCase('HelloWorldTest', 'snake_case')).toBe('hello_world_test')
    })

    it('converts kebab-case to snake_case', () => {
      expect(convertCase(kebabInput, 'snake_case')).toBe('hello_world_test')
    })

    it('handles single word', () => {
      expect(convertCase('Hello', 'snake_case')).toBe('hello')
    })
  })

  describe('SCREAMING_SNAKE_CASE conversion', () => {
    it('converts space-separated to SCREAMING_SNAKE_CASE', () => {
      expect(convertCase(testInput, 'SCREAMING_SNAKE_CASE')).toBe('HELLO_WORLD_TEST')
    })

    it('converts camelCase to SCREAMING_SNAKE_CASE', () => {
      expect(convertCase(camelInput, 'SCREAMING_SNAKE_CASE')).toBe('HELLO_WORLD_TEST')
    })

    it('converts snake_case to SCREAMING_SNAKE_CASE', () => {
      expect(convertCase(snakeInput, 'SCREAMING_SNAKE_CASE')).toBe('HELLO_WORLD_TEST')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'SCREAMING_SNAKE_CASE')).toBe('HELLO')
    })
  })

  describe('kebab-case conversion', () => {
    it('converts space-separated to kebab-case', () => {
      expect(convertCase(testInput, 'kebab-case')).toBe('hello-world-test')
    })

    it('converts camelCase to kebab-case', () => {
      expect(convertCase(camelInput, 'kebab-case')).toBe('hello-world-test')
    })

    it('converts snake_case to kebab-case', () => {
      expect(convertCase(snakeInput, 'kebab-case')).toBe('hello-world-test')
    })

    it('converts PascalCase to kebab-case', () => {
      expect(convertCase('HelloWorldTest', 'kebab-case')).toBe('hello-world-test')
    })

    it('handles single word', () => {
      expect(convertCase('HELLO', 'kebab-case')).toBe('hello')
    })
  })

  describe('TRAIN-CASE conversion', () => {
    it('converts space-separated to TRAIN-CASE', () => {
      expect(convertCase(testInput, 'TRAIN-CASE')).toBe('Hello-World-Test')
    })

    it('converts camelCase to TRAIN-CASE', () => {
      expect(convertCase(camelInput, 'TRAIN-CASE')).toBe('Hello-World-Test')
    })

    it('converts snake_case to TRAIN-CASE', () => {
      expect(convertCase(snakeInput, 'TRAIN-CASE')).toBe('Hello-World-Test')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'TRAIN-CASE')).toBe('Hello')
    })
  })

  describe('dot.case conversion', () => {
    it('converts space-separated to dot.case', () => {
      expect(convertCase(testInput, 'dot.case')).toBe('hello.world.test')
    })

    it('converts camelCase to dot.case', () => {
      expect(convertCase(camelInput, 'dot.case')).toBe('hello.world.test')
    })

    it('converts snake_case to dot.case', () => {
      expect(convertCase(snakeInput, 'dot.case')).toBe('hello.world.test')
    })

    it('handles single word', () => {
      expect(convertCase('Hello', 'dot.case')).toBe('hello')
    })
  })

  describe('Title Case conversion', () => {
    it('converts space-separated to Title Case', () => {
      expect(convertCase(testInput, 'Title Case')).toBe('Hello World Test')
    })

    it('converts camelCase to Title Case', () => {
      expect(convertCase(camelInput, 'Title Case')).toBe('Hello World Test')
    })

    it('converts snake_case to Title Case', () => {
      expect(convertCase(snakeInput, 'Title Case')).toBe('Hello World Test')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'Title Case')).toBe('Hello')
    })
  })

  describe('Sentence case conversion', () => {
    it('converts space-separated to Sentence case', () => {
      expect(convertCase(testInput, 'Sentence case')).toBe('Hello world test')
    })

    it('converts camelCase to Sentence case', () => {
      expect(convertCase(camelInput, 'Sentence case')).toBe('Hello world test')
    })

    it('converts snake_case to Sentence case', () => {
      expect(convertCase(snakeInput, 'Sentence case')).toBe('Hello world test')
    })

    it('handles single word', () => {
      expect(convertCase('HELLO', 'Sentence case')).toBe('Hello')
    })
  })

  describe('lowercase conversion', () => {
    it('converts space-separated to lowercase', () => {
      expect(convertCase('Hello World Test', 'lowercase')).toBe('hello world test')
    })

    it('converts camelCase to lowercase', () => {
      expect(convertCase(camelInput, 'lowercase')).toBe('hello world test')
    })

    it('converts SCREAMING_SNAKE_CASE to lowercase', () => {
      expect(convertCase('HELLO_WORLD_TEST', 'lowercase')).toBe('hello world test')
    })

    it('handles single word', () => {
      expect(convertCase('HELLO', 'lowercase')).toBe('hello')
    })
  })

  describe('UPPERCASE conversion', () => {
    it('converts space-separated to UPPERCASE', () => {
      expect(convertCase(testInput, 'UPPERCASE')).toBe('HELLO WORLD TEST')
    })

    it('converts camelCase to UPPERCASE', () => {
      expect(convertCase(camelInput, 'UPPERCASE')).toBe('HELLO WORLD TEST')
    })

    it('converts snake_case to UPPERCASE', () => {
      expect(convertCase(snakeInput, 'UPPERCASE')).toBe('HELLO WORLD TEST')
    })

    it('handles single word', () => {
      expect(convertCase('hello', 'UPPERCASE')).toBe('HELLO')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(convertCase('', 'camelCase')).toBe('')
    })

    it('returns empty string for whitespace-only input', () => {
      expect(convertCase('   ', 'camelCase')).toBe('')
    })

    it('handles input with numbers', () => {
      expect(convertCase('user2name', 'PascalCase')).toBe('User2name')
    })

    it('handles mixed input with numbers and separators', () => {
      expect(convertCase('user_2_name', 'camelCase')).toBe('user2Name')
    })

    it('handles acronyms', () => {
      expect(convertCase('XMLParser', 'snake_case')).toBe('xml_parser')
    })

    it('handles long text', () => {
      const longInput = 'this is a very long text with many words'
      expect(convertCase(longInput, 'camelCase')).toBe('thisIsAVeryLongTextWithManyWords')
    })

    it('preserves original for unknown case type', () => {
      // @ts-expect-error - Testing invalid case type
      expect(convertCase('hello world', 'unknownCase')).toBe('hello world')
    })
  })

  describe('round-trip conversions', () => {
    it('converts camelCase -> snake_case -> camelCase', () => {
      const original = 'myVariableName'
      const snake = convertCase(original, 'snake_case')
      const backToCamel = convertCase(snake, 'camelCase')
      expect(backToCamel).toBe('myVariableName')
    })

    it('converts PascalCase -> kebab-case -> PascalCase', () => {
      const original = 'MyClassName'
      const kebab = convertCase(original, 'kebab-case')
      const backToPascal = convertCase(kebab, 'PascalCase')
      expect(backToPascal).toBe('MyClassName')
    })

    it('converts snake_case -> Title Case -> snake_case', () => {
      const original = 'my_variable_name'
      const title = convertCase(original, 'Title Case')
      const backToSnake = convertCase(title, 'snake_case')
      expect(backToSnake).toBe('my_variable_name')
    })
  })

  describe('real-world examples', () => {
    it('converts JavaScript variable name to Python style', () => {
      expect(convertCase('getUserById', 'snake_case')).toBe('get_user_by_id')
    })

    it('converts database column to JavaScript property', () => {
      expect(convertCase('user_first_name', 'camelCase')).toBe('userFirstName')
    })

    it('converts class name to URL slug', () => {
      expect(convertCase('UserProfileComponent', 'kebab-case')).toBe('user-profile-component')
    })

    it('converts constant to Title Case for display', () => {
      expect(convertCase('MAX_RETRY_COUNT', 'Title Case')).toBe('Max Retry Count')
    })

    it('converts HTTP header style', () => {
      expect(convertCase('content_type', 'TRAIN-CASE')).toBe('Content-Type')
    })

    it('converts config key to environment variable', () => {
      expect(convertCase('database.connection.string', 'SCREAMING_SNAKE_CASE')).toBe(
        'DATABASE_CONNECTION_STRING'
      )
    })
  })
})
