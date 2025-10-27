import { describe, expect, it } from 'vitest'

// Base64 encoding function (mirrors btoa behavior)
export function encodeBase64(input: string): string {
  return btoa(input)
}

// Base64 decoding function (mirrors atob behavior)
export function decodeBase64(input: string): string {
  return atob(input)
}

// Check if a string is a valid Base64 string
export function isValidBase64(str: string): boolean {
  if (str === '' || str.trim() === '') {
    return false
  }
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

// Check if a Base64 string represents an image
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/')
}

// Extract image format from Base64 data URL
export function getImageFormat(dataUrl: string): string | null {
  const match = dataUrl.match(/^data:image\/(\w+);base64,/)
  return match ? match[1] : null
}

// Calculate the size of Base64 encoded data (approximate original size)
export function getBase64DecodedSize(base64String: string): number {
  // Remove data URL prefix if present
  let base64 = base64String
  if (base64.includes(',')) {
    base64 = base64.split(',')[1]
  }

  // Remove padding
  const padding = (base64.match(/=/g) || []).length

  // Calculate original size
  // Base64 encoding increases size by ~33%, so original = (base64.length * 3) / 4
  return (base64.length * 3) / 4 - padding
}

// Convert file size to Base64 encoded size (approximate)
export function calculateBase64Size(originalSize: number): number {
  // Base64 encoding increases size by ~33%
  // Formula: encodedSize = 4 * ceil(originalSize / 3)
  return Math.ceil(originalSize / 3) * 4
}

// Validate Base64 encoding of common characters
export function encodeSpecialChars(input: string): string {
  try {
    return btoa(input)
  } catch {
    // Handle Unicode characters
    return btoa(unescape(encodeURIComponent(input)))
  }
}

// Decode Base64 with Unicode support
export function decodeSpecialChars(input: string): string {
  try {
    return atob(input)
  } catch {
    // Handle Unicode characters
    return decodeURIComponent(escape(atob(input)))
  }
}

describe('Base64 Encoder/Decoder Utilities', () => {
  describe('encodeBase64', () => {
    it('should encode simple text correctly', () => {
      expect(encodeBase64('Hello')).toBe('SGVsbG8=')
      expect(encodeBase64('World')).toBe('V29ybGQ=')
    })

    it('should encode empty string', () => {
      expect(encodeBase64('')).toBe('')
    })

    it('should encode text with spaces', () => {
      expect(encodeBase64('Hello World')).toBe('SGVsbG8gV29ybGQ=')
    })

    it('should encode numbers', () => {
      expect(encodeBase64('12345')).toBe('MTIzNDU=')
    })

    it('should encode special characters', () => {
      expect(encodeBase64('Test@123!')).toBe('VGVzdEAxMjMh')
    })

    it('should encode multiline text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3'
      const encoded = encodeBase64(multiline)
      expect(encoded).toBe('TGluZSAxCkxpbmUgMgpMaW5lIDM=')
    })
  })

  describe('decodeBase64', () => {
    it('should decode simple text correctly', () => {
      expect(decodeBase64('SGVsbG8=')).toBe('Hello')
      expect(decodeBase64('V29ybGQ=')).toBe('World')
    })

    it('should decode empty string', () => {
      expect(decodeBase64('')).toBe('')
    })

    it('should decode text with spaces', () => {
      expect(decodeBase64('SGVsbG8gV29ybGQ=')).toBe('Hello World')
    })

    it('should decode numbers', () => {
      expect(decodeBase64('MTIzNDU=')).toBe('12345')
    })

    it('should decode special characters', () => {
      expect(decodeBase64('VGVzdEAxMjMh')).toBe('Test@123!')
    })

    it('should decode multiline text', () => {
      const decoded = decodeBase64('TGluZSAxCkxpbmUgMgpMaW5lIDM=')
      expect(decoded).toBe('Line 1\nLine 2\nLine 3')
    })
  })

  describe('isValidBase64', () => {
    it('should validate correct Base64 strings', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true)
      expect(isValidBase64('VGVzdEAxMjMh')).toBe(true)
      expect(isValidBase64('MTIzNDU=')).toBe(true)
    })

    it('should reject invalid Base64 strings', () => {
      expect(isValidBase64('Invalid!')).toBe(false)
      expect(isValidBase64('Hello World')).toBe(false)
      expect(isValidBase64('12345')).toBe(false)
    })

    it('should reject empty or whitespace strings', () => {
      expect(isValidBase64('')).toBe(false)
      expect(isValidBase64('   ')).toBe(false)
    })

    it('should handle Base64 strings with padding', () => {
      expect(isValidBase64('SGVsbG8=')).toBe(true)
      expect(isValidBase64('SGVsbG8gV29ybGQ=')).toBe(true)
    })
  })

  describe('isBase64Image', () => {
    it('should identify image data URLs', () => {
      expect(isBase64Image('data:image/png;base64,iVBORw0KGg')).toBe(true)
      expect(isBase64Image('data:image/jpeg;base64,/9j/4AAQ')).toBe(true)
      expect(isBase64Image('data:image/gif;base64,R0lGOD')).toBe(true)
    })

    it('should reject non-image data URLs', () => {
      expect(isBase64Image('data:text/plain;base64,SGVsbG8=')).toBe(false)
      expect(isBase64Image('data:application/pdf;base64,JVBERi')).toBe(false)
    })

    it('should reject plain Base64 strings', () => {
      expect(isBase64Image('SGVsbG8=')).toBe(false)
      expect(isBase64Image('iVBORw0KGg')).toBe(false)
    })
  })

  describe('getImageFormat', () => {
    it('should extract image format from data URL', () => {
      expect(getImageFormat('data:image/png;base64,iVBORw0KGg')).toBe('png')
      expect(getImageFormat('data:image/jpeg;base64,/9j/4AAQ')).toBe('jpeg')
      expect(getImageFormat('data:image/gif;base64,R0lGOD')).toBe('gif')
      expect(getImageFormat('data:image/webp;base64,UklGRi')).toBe('webp')
    })

    it('should return null for invalid data URLs', () => {
      expect(getImageFormat('SGVsbG8=')).toBe(null)
      expect(getImageFormat('data:text/plain;base64,SGVsbG8=')).toBe(null)
      expect(getImageFormat('not a data url')).toBe(null)
    })
  })

  describe('getBase64DecodedSize', () => {
    it('should calculate decoded size for plain Base64', () => {
      // "Hello" = 5 bytes, encoded to "SGVsbG8="
      expect(getBase64DecodedSize('SGVsbG8=')).toBe(5)

      // "Hello World" = 11 bytes
      expect(getBase64DecodedSize('SGVsbG8gV29ybGQ=')).toBe(11)
    })

    it('should handle data URLs', () => {
      // Should extract Base64 part and calculate
      const dataUrl = 'data:image/png;base64,SGVsbG8='
      expect(getBase64DecodedSize(dataUrl)).toBe(5)
    })

    it('should handle Base64 with no padding', () => {
      // "Hello!!" = 7 bytes, but calculation is approximate
      const size = getBase64DecodedSize('SGVsbG8hIQ')
      expect(size).toBeGreaterThan(6)
      expect(size).toBeLessThan(9)
    })

    it('should handle Base64 with double padding', () => {
      // "Hi" = 2 bytes, needs == padding
      expect(getBase64DecodedSize('SGk=')).toBe(2)
    })
  })

  describe('calculateBase64Size', () => {
    it('should calculate encoded size for various inputs', () => {
      // 3 bytes -> 4 Base64 chars
      expect(calculateBase64Size(3)).toBe(4)

      // 6 bytes -> 8 Base64 chars
      expect(calculateBase64Size(6)).toBe(8)

      // 10 bytes -> 16 Base64 chars (needs padding)
      expect(calculateBase64Size(10)).toBe(16)
    })

    it('should handle empty input', () => {
      expect(calculateBase64Size(0)).toBe(0)
    })

    it('should handle 1 byte input', () => {
      expect(calculateBase64Size(1)).toBe(4)
    })

    it('should handle large file sizes', () => {
      // 1 MB = 1,048,576 bytes
      // Encoded should be approximately 1,398,104 bytes
      expect(calculateBase64Size(1048576)).toBe(1398104)
    })

    it('should show ~33% size increase', () => {
      const originalSize = 1000
      const encodedSize = calculateBase64Size(originalSize)
      const increasePercent = ((encodedSize - originalSize) / originalSize) * 100
      expect(increasePercent).toBeGreaterThan(30)
      expect(increasePercent).toBeLessThan(35)
    })
  })

  describe('encodeSpecialChars', () => {
    it('should encode ASCII characters', () => {
      expect(encodeSpecialChars('Hello')).toBe('SGVsbG8=')
    })

    it('should handle empty string', () => {
      expect(encodeSpecialChars('')).toBe('')
    })

    it('should encode special characters', () => {
      expect(encodeSpecialChars('Test@#$%')).toBeTruthy()
    })
  })

  describe('decodeSpecialChars', () => {
    it('should decode ASCII characters', () => {
      expect(decodeSpecialChars('SGVsbG8=')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(decodeSpecialChars('')).toBe('')
    })
  })

  describe('encode and decode round-trip', () => {
    it('should preserve data through encode-decode cycle', () => {
      const testCases = [
        'Hello World',
        'Test123!@#',
        '12345',
        'MultiLine\nText\nTest',
        'Tabs\tand\tspaces',
        'Special chars: !@#$%^&*()',
        '',
      ]

      testCases.forEach((testCase) => {
        const encoded = encodeBase64(testCase)
        const decoded = decodeBase64(encoded)
        expect(decoded).toBe(testCase)
      })
    })

    it('should handle long text', () => {
      const longText = 'A'.repeat(10000)
      const encoded = encodeBase64(longText)
      const decoded = decodeBase64(encoded)
      expect(decoded).toBe(longText)
    })
  })
})
