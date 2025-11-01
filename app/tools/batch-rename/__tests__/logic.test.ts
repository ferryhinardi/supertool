import { describe, expect, it } from 'vitest'

interface RenamePattern {
  prefix: string
  suffix: string
  findText: string
  replaceText: string
  useRegex: boolean
  sequenceStart: number
  sequenceStep: number
  sequencePadding: number
  caseTransform: 'none' | 'lowercase' | 'uppercase' | 'capitalize' | 'camelCase' | 'kebabCase'
}

function applyRenamePattern(
  fileName: string,
  pattern: RenamePattern,
  sequenceNumber: number
): string {
  // Split filename and extension
  const lastDotIndex = fileName.lastIndexOf('.')
  let name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName
  const ext = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : ''

  // Apply find & replace
  if (pattern.findText) {
    if (pattern.useRegex) {
      try {
        const regex = new RegExp(pattern.findText, 'g')
        name = name.replace(regex, pattern.replaceText)
      } catch (error) {
        console.error('Invalid regex:', error)
      }
    } else {
      name = name.split(pattern.findText).join(pattern.replaceText)
    }
  }

  // Apply case transformation
  switch (pattern.caseTransform) {
    case 'lowercase':
      name = name.toLowerCase()
      break
    case 'uppercase':
      name = name.toUpperCase()
      break
    case 'capitalize':
      name = name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      break
    case 'camelCase':
      name = name
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
      break
    case 'kebabCase':
      name = name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
      break
  }

  // Add prefix
  if (pattern.prefix) {
    name = pattern.prefix + name
  }

  // Add suffix
  if (pattern.suffix) {
    name = name + pattern.suffix
  }

  // Add sequence number
  const paddedSequence = sequenceNumber.toString().padStart(pattern.sequencePadding, '0')
  name = name.replace(/\{n\}/g, paddedSequence)

  return name + ext
}

function validateFileName(fileName: string): string | undefined {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/g
  if (invalidChars.test(fileName)) {
    return 'Contains invalid characters: < > : " / \\ | ? *'
  }

  // Check if filename is empty
  if (!fileName.trim()) {
    return 'Filename cannot be empty'
  }

  return undefined
}

describe('Batch Rename Logic', () => {
  const defaultPattern: RenamePattern = {
    prefix: '',
    suffix: '',
    findText: '',
    replaceText: '',
    useRegex: false,
    sequenceStart: 1,
    sequenceStep: 1,
    sequencePadding: 3,
    caseTransform: 'none',
  }

  describe('applyRenamePattern', () => {
    it('should preserve original filename when no pattern is applied', () => {
      const result = applyRenamePattern('test.txt', defaultPattern, 1)
      expect(result).toBe('test.txt')
    })

    it('should add prefix to filename', () => {
      const pattern = { ...defaultPattern, prefix: 'new_' }
      const result = applyRenamePattern('test.txt', pattern, 1)
      expect(result).toBe('new_test.txt')
    })

    it('should add suffix to filename', () => {
      const pattern = { ...defaultPattern, suffix: '_backup' }
      const result = applyRenamePattern('test.txt', pattern, 1)
      expect(result).toBe('test_backup.txt')
    })

    it('should add both prefix and suffix', () => {
      const pattern = { ...defaultPattern, prefix: 'new_', suffix: '_v1' }
      const result = applyRenamePattern('test.txt', pattern, 1)
      expect(result).toBe('new_test_v1.txt')
    })

    it('should replace text in filename', () => {
      const pattern = { ...defaultPattern, findText: 'old', replaceText: 'new' }
      const result = applyRenamePattern('old_file.txt', pattern, 1)
      expect(result).toBe('new_file.txt')
    })

    it('should replace multiple occurrences', () => {
      const pattern = { ...defaultPattern, findText: 'a', replaceText: 'b' }
      const result = applyRenamePattern('banana.txt', pattern, 1)
      expect(result).toBe('bbnbnb.txt')
    })

    it('should apply regex replacement', () => {
      const pattern = { ...defaultPattern, findText: '\\d+', replaceText: 'X', useRegex: true }
      const result = applyRenamePattern('file123.txt', pattern, 1)
      expect(result).toBe('fileX.txt')
    })

    it('should add sequential numbers with {n} placeholder', () => {
      const pattern = { ...defaultPattern, prefix: 'file_{n}_' }
      expect(applyRenamePattern('test.txt', pattern, 1)).toBe('file_001_test.txt')
      expect(applyRenamePattern('test.txt', pattern, 2)).toBe('file_002_test.txt')
      expect(applyRenamePattern('test.txt', pattern, 10)).toBe('file_010_test.txt')
    })

    it('should respect sequence padding', () => {
      const pattern = { ...defaultPattern, prefix: 'file_{n}_', sequencePadding: 5 }
      expect(applyRenamePattern('test.txt', pattern, 1)).toBe('file_00001_test.txt')
      expect(applyRenamePattern('test.txt', pattern, 42)).toBe('file_00042_test.txt')
    })

    it('should apply lowercase transformation', () => {
      const pattern = { ...defaultPattern, caseTransform: 'lowercase' as const }
      const result = applyRenamePattern('TEST_File.txt', pattern, 1)
      expect(result).toBe('test_file.txt')
    })

    it('should apply uppercase transformation', () => {
      const pattern = { ...defaultPattern, caseTransform: 'uppercase' as const }
      const result = applyRenamePattern('test_file.txt', pattern, 1)
      expect(result).toBe('TEST_FILE.txt')
    })

    it('should apply capitalize transformation', () => {
      const pattern = { ...defaultPattern, caseTransform: 'capitalize' as const }
      const result = applyRenamePattern('hello world.txt', pattern, 1)
      expect(result).toBe('Hello World.txt')
    })

    it('should apply camelCase transformation', () => {
      const pattern = { ...defaultPattern, caseTransform: 'camelCase' as const }
      const result = applyRenamePattern('hello_world_test.txt', pattern, 1)
      expect(result).toBe('helloWorldTest.txt')
    })

    it('should apply kebab-case transformation', () => {
      const pattern = { ...defaultPattern, caseTransform: 'kebabCase' as const }
      const result = applyRenamePattern('HelloWorld.txt', pattern, 1)
      expect(result).toBe('hello-world.txt')
    })

    it('should handle files without extensions', () => {
      const pattern = { ...defaultPattern, prefix: 'new_' }
      const result = applyRenamePattern('README', pattern, 1)
      expect(result).toBe('new_README')
    })

    it('should preserve file extensions', () => {
      const pattern = { ...defaultPattern, caseTransform: 'uppercase' as const }
      const result = applyRenamePattern('test.txt', pattern, 1)
      expect(result).toBe('TEST.txt')
    })

    it('should apply multiple transformations in correct order', () => {
      const pattern = {
        ...defaultPattern,
        findText: 'old',
        replaceText: 'new',
        caseTransform: 'uppercase' as const,
        prefix: 'FILE_',
        suffix: '_v1',
      }
      const result = applyRenamePattern('old_test.txt', pattern, 1)
      expect(result).toBe('FILE_NEW_TEST_v1.txt')
    })
  })

  describe('validateFileName', () => {
    it('should accept valid filenames', () => {
      expect(validateFileName('test.txt')).toBeUndefined()
      expect(validateFileName('my-file_123.pdf')).toBeUndefined()
      expect(validateFileName('document (copy).docx')).toBeUndefined()
    })

    it('should reject filenames with invalid characters', () => {
      expect(validateFileName('test<file.txt')).toBeDefined()
      expect(validateFileName('test>file.txt')).toBeDefined()
      expect(validateFileName('test:file.txt')).toBeDefined()
      expect(validateFileName('test"file.txt')).toBeDefined()
      expect(validateFileName('test/file.txt')).toBeDefined()
      expect(validateFileName('test\\file.txt')).toBeDefined()
      expect(validateFileName('test|file.txt')).toBeDefined()
      expect(validateFileName('test?file.txt')).toBeDefined()
      expect(validateFileName('test*file.txt')).toBeDefined()
    })

    it('should reject empty filenames', () => {
      expect(validateFileName('')).toBeDefined()
      expect(validateFileName('   ')).toBeDefined()
    })
  })
})
