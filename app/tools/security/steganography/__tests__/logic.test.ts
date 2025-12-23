import { describe, expect, it } from 'vitest'

// Zero-width characters for encoding (matching the implementation)
const ZERO_WIDTH_CHARS = {
  ZERO: '\u200B', // Zero-width space
  ONE: '\u200C', // Zero-width non-joiner
  SEPARATOR: '\u200D', // Zero-width joiner (used as separator)
  MARKER: '\uFEFF', // Zero-width no-break space (marker at start/end)
}

/**
 * Encode a message into zero-width characters
 */
function encodeMessage(message: string): string {
  if (!message) return ''

  // Convert each character to binary, then to zero-width chars
  const binaryString = message
    .split('')
    .map((char) => {
      const binary = char.charCodeAt(0).toString(2).padStart(16, '0')
      return binary
        .split('')
        .map((bit) => (bit === '0' ? ZERO_WIDTH_CHARS.ZERO : ZERO_WIDTH_CHARS.ONE))
        .join('')
    })
    .join(ZERO_WIDTH_CHARS.SEPARATOR)

  return ZERO_WIDTH_CHARS.MARKER + binaryString + ZERO_WIDTH_CHARS.MARKER
}

/**
 * Decode zero-width characters back to message
 */
function decodeMessage(text: string): string {
  try {
    // Extract only zero-width characters
    const zeroWidthOnly = text
      .split('')
      .filter((char) => Object.values(ZERO_WIDTH_CHARS).includes(char))
      .join('')

    // Remove markers
    const withoutMarkers = zeroWidthOnly.replace(new RegExp(ZERO_WIDTH_CHARS.MARKER, 'g'), '')

    // Split by separator
    const charBinaries = withoutMarkers.split(ZERO_WIDTH_CHARS.SEPARATOR)

    // Convert each binary sequence back to character
    const decoded = charBinaries
      .filter((binary) => binary.length > 0)
      .map((binary) => {
        const binaryStr = binary
          .split('')
          .map((char) => (char === ZERO_WIDTH_CHARS.ZERO ? '0' : '1'))
          .join('')
        return String.fromCharCode(Number.parseInt(binaryStr, 2))
      })
      .join('')

    return decoded
  } catch (error) {
    console.error('Decode error:', error)
    return ''
  }
}

/**
 * Check if text contains hidden message
 */
function hasHiddenMessage(text: string): boolean {
  const markerCount = (text.match(new RegExp(ZERO_WIDTH_CHARS.MARKER, 'g')) || []).length
  return markerCount >= 2
}

describe('Steganography Logic', () => {
  describe('encodeMessage', () => {
    it('should encode a simple message', () => {
      const message = 'Hi'
      const encoded = encodeMessage(message)

      // Should contain zero-width characters
      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)

      // Should start and end with markers
      expect(encoded.startsWith(ZERO_WIDTH_CHARS.MARKER)).toBe(true)
      expect(encoded.endsWith(ZERO_WIDTH_CHARS.MARKER)).toBe(true)
    })

    it('should return empty string for empty input', () => {
      expect(encodeMessage('')).toBe('')
    })

    it('should encode special characters', () => {
      const message = '!@#$%'
      const encoded = encodeMessage(message)

      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should encode Unicode characters', () => {
      const message = '你好'
      const encoded = encodeMessage(message)

      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })

    it('should encode emojis', () => {
      const message = '😊'
      const encoded = encodeMessage(message)

      expect(encoded).toBeTruthy()
      expect(encoded.length).toBeGreaterThan(0)
    })
  })

  describe('decodeMessage', () => {
    it('should decode a simple message correctly', () => {
      const original = 'Hello'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode messages with numbers', () => {
      const original = 'Test123'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode messages with special characters', () => {
      const original = 'Hello!@#$'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode messages with spaces', () => {
      const original = 'Hello World'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode Unicode characters', () => {
      const original = '你好世界'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode emojis', () => {
      const original = '😊🎉'
      const encoded = encodeMessage(original)
      const decoded = decodeMessage(encoded)

      expect(decoded).toBe(original)
    })

    it('should decode message embedded in cover text', () => {
      const secret = 'SECRET'
      const encoded = encodeMessage(secret)
      const coverText = 'This is innocent text'
      const combined = coverText + encoded

      const decoded = decodeMessage(combined)
      expect(decoded).toBe(secret)
    })

    it('should return empty string for text without hidden message', () => {
      const plainText = 'Just normal text'
      const decoded = decodeMessage(plainText)

      expect(decoded).toBe('')
    })

    it('should handle malformed encoded data gracefully', () => {
      const malformed = ZERO_WIDTH_CHARS.MARKER + ZERO_WIDTH_CHARS.ZERO + ZERO_WIDTH_CHARS.ONE
      const decoded = decodeMessage(malformed)

      // Should not throw, should return empty or partial decode
      expect(typeof decoded).toBe('string')
    })
  })

  describe('hasHiddenMessage', () => {
    it('should detect hidden message in encoded text', () => {
      const encoded = encodeMessage('Secret')
      expect(hasHiddenMessage(encoded)).toBe(true)
    })

    it('should not detect hidden message in plain text', () => {
      const plainText = 'This is just normal text'
      expect(hasHiddenMessage(plainText)).toBe(false)
    })

    it('should detect hidden message in combined text', () => {
      const secret = encodeMessage('Hidden')
      const combined = `Cover text${secret} more text`
      expect(hasHiddenMessage(combined)).toBe(true)
    })

    it('should return false for text with only one marker', () => {
      const textWithOneMarker = `Text${ZERO_WIDTH_CHARS.MARKER}more text`
      expect(hasHiddenMessage(textWithOneMarker)).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(hasHiddenMessage('')).toBe(false)
    })

    it('should return true for text with multiple markers', () => {
      const textWithMarkers = `${ZERO_WIDTH_CHARS.MARKER}content${ZERO_WIDTH_CHARS.MARKER}`
      expect(hasHiddenMessage(textWithMarkers)).toBe(true)
    })
  })

  describe('Round-trip encoding/decoding', () => {
    it('should preserve message through encode-decode cycle', () => {
      const testCases = [
        'Hello, World!',
        '123456',
        'Special: !@#$%^&*()',
        'Mixed Case TeXt',
        'With\nNewlines\nAnd\tTabs',
        'Unicode: 你好世界',
        'Emojis: 😊🎉🚀',
        'Short',
        'A very long message that contains many words and should still be encoded and decoded correctly without any loss of information',
      ]

      for (const testCase of testCases) {
        const encoded = encodeMessage(testCase)
        const decoded = decodeMessage(encoded)
        expect(decoded).toBe(testCase)
      }
    })

    it('should preserve message when embedded in cover text', () => {
      const secret = 'SECRET_MESSAGE'
      const coverText = 'This is public information that everyone can see.'
      const encoded = encodeMessage(secret)
      const combined = coverText + encoded

      const decoded = decodeMessage(combined)
      expect(decoded).toBe(secret)

      // Verify cover text is still visible (not modified)
      expect(combined.includes(coverText.charAt(0))).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle single character', () => {
      const single = 'A'
      const encoded = encodeMessage(single)
      const decoded = decodeMessage(encoded)
      expect(decoded).toBe(single)
    })

    it('should handle repeated characters', () => {
      const repeated = 'AAA'
      const encoded = encodeMessage(repeated)
      const decoded = decodeMessage(encoded)
      expect(decoded).toBe(repeated)
    })

    it('should handle all ASCII printable characters', () => {
      const ascii =
        ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
      const encoded = encodeMessage(ascii)
      const decoded = decodeMessage(encoded)
      expect(decoded).toBe(ascii)
    })

    it('should handle multiple spaces', () => {
      const multiSpace = 'word    word'
      const encoded = encodeMessage(multiSpace)
      const decoded = decodeMessage(encoded)
      expect(decoded).toBe(multiSpace)
    })
  })
})
