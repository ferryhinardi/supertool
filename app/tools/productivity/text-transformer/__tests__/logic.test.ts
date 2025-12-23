import { describe, expect, it } from 'vitest'

// Text transformation functions for testing
function toUpperCase(text: string): string {
  return text.toUpperCase()
}

function toLowerCase(text: string): string {
  return text.toLowerCase()
}

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
}

function toSentenceCase(text: string): string {
  return text.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
}

function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
}

function toPascalCase(text: string): string {
  return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/\s+/g, '')
}

function toSnakeCase(text: string): string {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_')
}

function toKebabCase(text: string): string {
  return text
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('-')
}

function reverseText(text: string): string {
  return text.split('').reverse().join('')
}

function removeDuplicateLines(text: string): string {
  const lines = text.split('\n')
  const uniqueLines = [...new Set(lines)]
  return uniqueLines.join('\n')
}

function removeEmptyLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .join('\n')
}

function sortLinesAsc(text: string): string {
  return text.split('\n').sort().join('\n')
}

function sortLinesDesc(text: string): string {
  return text.split('\n').sort().reverse().join('\n')
}

function trimLines(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
}

function removeExtraSpaces(text: string): string {
  return text.replace(/\s+/g, ' ')
}

function addLineNumbers(text: string): string {
  return text
    .split('\n')
    .map((line, index) => `${index + 1}. ${line}`)
    .join('\n')
}

function removeLineNumbers(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, ''))
    .join('\n')
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function countCharacters(text: string): number {
  return text.length
}

function countCharactersNoSpaces(text: string): number {
  return text.replace(/\s/g, '').length
}

function countLines(text: string): number {
  return text ? text.split('\n').length : 0
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
}

function countParagraphs(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0).length
}

describe('Text Transformer - Case Conversions', () => {
  it('should convert text to uppercase', () => {
    expect(toUpperCase('hello world')).toBe('HELLO WORLD')
    expect(toUpperCase('Hello World')).toBe('HELLO WORLD')
    expect(toUpperCase('HELLO WORLD')).toBe('HELLO WORLD')
  })

  it('should convert text to lowercase', () => {
    expect(toLowerCase('HELLO WORLD')).toBe('hello world')
    expect(toLowerCase('Hello World')).toBe('hello world')
    expect(toLowerCase('hello world')).toBe('hello world')
  })

  it('should convert text to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
    expect(toTitleCase('hello WORLD test')).toBe('Hello World Test')
  })

  it('should convert text to sentence case', () => {
    expect(toSentenceCase('hello world. this is a test.')).toContain('Hello')
    expect(toSentenceCase('hello world. this is a test.')).toContain('This')
  })

  it('should convert text to camelCase', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
    expect(toCamelCase('Hello World')).toBe('helloWorld')
    expect(toCamelCase('hello world test')).toBe('helloWorldTest')
  })

  it('should convert text to PascalCase', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld')
    expect(toPascalCase('Hello World')).toBe('HelloWorld')
    expect(toPascalCase('hello world test')).toBe('HelloWorldTest')
  })

  it('should convert text to snake_case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world')
    expect(toSnakeCase('Hello World')).toBe('hello_world')
    expect(toSnakeCase('HelloWorld')).toBe('hello_world')
  })

  it('should convert text to kebab-case', () => {
    expect(toKebabCase('hello world')).toBe('hello-world')
    expect(toKebabCase('Hello World')).toBe('hello-world')
    expect(toKebabCase('HelloWorld')).toBe('hello-world')
  })
})

describe('Text Transformer - Clean Operations', () => {
  it('should remove duplicate lines', () => {
    const input = 'line1\nline2\nline1\nline3\nline2'
    const expected = 'line1\nline2\nline3'
    expect(removeDuplicateLines(input)).toBe(expected)
  })

  it('should remove empty lines', () => {
    const input = 'line1\n\nline2\n\n\nline3'
    const expected = 'line1\nline2\nline3'
    expect(removeEmptyLines(input)).toBe(expected)
  })

  it('should trim each line', () => {
    const input = '  line1  \n  line2  \n  line3  '
    const expected = 'line1\nline2\nline3'
    expect(trimLines(input)).toBe(expected)
  })

  it('should remove extra spaces', () => {
    expect(removeExtraSpaces('hello    world')).toBe('hello world')
    expect(removeExtraSpaces('hello  world  test')).toBe('hello world test')
  })
})

describe('Text Transformer - Sort Operations', () => {
  it('should sort lines in ascending order', () => {
    const input = 'zebra\napple\nbanana'
    const expected = 'apple\nbanana\nzebra'
    expect(sortLinesAsc(input)).toBe(expected)
  })

  it('should sort lines in descending order', () => {
    const input = 'apple\nbanana\nzebra'
    const expected = 'zebra\nbanana\napple'
    expect(sortLinesDesc(input)).toBe(expected)
  })
})

describe('Text Transformer - Modify Operations', () => {
  it('should reverse text', () => {
    expect(reverseText('hello')).toBe('olleh')
    expect(reverseText('hello world')).toBe('dlrow olleh')
  })

  it('should add line numbers', () => {
    const input = 'line1\nline2\nline3'
    const expected = '1. line1\n2. line2\n3. line3'
    expect(addLineNumbers(input)).toBe(expected)
  })

  it('should remove line numbers', () => {
    const input = '1. line1\n2. line2\n3. line3'
    const expected = 'line1\nline2\nline3'
    expect(removeLineNumbers(input)).toBe(expected)
  })
})

describe('Text Transformer - Text Statistics', () => {
  const sampleText = 'Hello world. This is a test.\n\nNew paragraph here.'

  it('should count words correctly', () => {
    expect(countWords('hello world')).toBe(2)
    expect(countWords('hello world test')).toBe(3)
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
  })

  it('should count characters correctly', () => {
    expect(countCharacters('hello')).toBe(5)
    expect(countCharacters('hello world')).toBe(11)
    expect(countCharacters('')).toBe(0)
  })

  it('should count characters without spaces', () => {
    expect(countCharactersNoSpaces('hello world')).toBe(10)
    expect(countCharactersNoSpaces('hello  world  test')).toBe(14)
  })

  it('should count lines correctly', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3)
    expect(countLines('single line')).toBe(1)
    expect(countLines('')).toBe(0)
  })

  it('should count sentences correctly', () => {
    expect(countSentences('Hello. World.')).toBe(2)
    expect(countSentences('Hello! World?')).toBe(2)
    expect(countSentences(sampleText)).toBeGreaterThan(0)
  })

  it('should count paragraphs correctly', () => {
    expect(countParagraphs('para1\n\npara2')).toBe(2)
    expect(countParagraphs('para1\n\npara2\n\npara3')).toBe(3)
    expect(countParagraphs(sampleText)).toBe(2)
  })
})

describe('Text Transformer - Edge Cases', () => {
  it('should handle empty strings', () => {
    expect(toUpperCase('')).toBe('')
    expect(toLowerCase('')).toBe('')
    expect(reverseText('')).toBe('')
    expect(countWords('')).toBe(0)
  })

  it('should handle single character', () => {
    expect(toUpperCase('a')).toBe('A')
    expect(toLowerCase('A')).toBe('a')
    expect(reverseText('a')).toBe('a')
  })

  it('should handle special characters', () => {
    expect(toUpperCase('hello@world!')).toBe('HELLO@WORLD!')
    expect(toLowerCase('HELLO@WORLD!')).toBe('hello@world!')
  })

  it('should handle unicode characters', () => {
    expect(toUpperCase('café')).toBe('CAFÉ')
    expect(toLowerCase('CAFÉ')).toBe('café')
  })

  it('should handle numbers', () => {
    expect(toUpperCase('hello123')).toBe('HELLO123')
    expect(toLowerCase('HELLO123')).toBe('hello123')
  })
})

describe('Text Transformer - Find & Replace', () => {
  it('should replace text (case insensitive)', () => {
    const text = 'Hello World, hello world'
    const result = text.replace(/hello/gi, 'hi')
    expect(result).toBe('hi World, hi world')
  })

  it('should replace text (case sensitive)', () => {
    const text = 'Hello World, hello world'
    const result = text.replace(/hello/g, 'hi')
    expect(result).toBe('Hello World, hi world')
  })

  it('should handle regex patterns', () => {
    const text = 'test123test456test'
    const result = text.replace(/\d+/g, 'X')
    expect(result).toBe('testXtestXtest')
  })
})
