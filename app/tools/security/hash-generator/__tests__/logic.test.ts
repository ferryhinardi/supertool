import { describe, expect, it } from 'vitest'

// Convert ArrayBuffer to hex string
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Generate SHA-256 hash
export async function generateSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return arrayBufferToHex(hashBuffer)
}

// Generate SHA-384 hash
export async function generateSHA384(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-384', data)
  return arrayBufferToHex(hashBuffer)
}

// Generate SHA-512 hash
export async function generateSHA512(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  return arrayBufferToHex(hashBuffer)
}

// Generate SHA-1 hash
export async function generateSHA1(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  return arrayBufferToHex(hashBuffer)
}

// Simplified MD5 (using SHA-256 truncated for testing purposes)
export async function generateSimplifiedMD5(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return arrayBufferToHex(hashBuffer).substring(0, 32)
}

// Verify if two hashes match (case-insensitive)
export function verifyHash(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase().trim() === hash2.toLowerCase().trim()
}

// Get hash length for algorithm
export function getHashLength(algorithm: string): number {
  const lengths: Record<string, number> = {
    MD5: 32,
    'SHA-1': 40,
    'SHA-256': 64,
    'SHA-384': 96,
    'SHA-512': 128,
  }
  return lengths[algorithm] || 0
}

// Validate hash format (hex string)
export function isValidHashFormat(hash: string, expectedLength?: number): boolean {
  if (!hash || typeof hash !== 'string') return false

  // Check if it's a valid hex string
  const hexRegex = /^[0-9a-f]+$/i
  if (!hexRegex.test(hash)) return false

  // Check length if provided
  if (expectedLength && hash.length !== expectedLength) return false

  return true
}

// Identify hash algorithm by length
export function identifyHashAlgorithm(hash: string): string | null {
  const length = hash.length
  const algorithms: Record<number, string> = {
    32: 'MD5',
    40: 'SHA-1',
    64: 'SHA-256',
    96: 'SHA-384',
    128: 'SHA-512',
  }
  return algorithms[length] || null
}

// Calculate file hash from ArrayBuffer
export async function hashArrayBuffer(
  buffer: ArrayBuffer,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  // Ensure we have a proper typed array view for Node.js compatibility
  const bufferView = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer
  const hashBuffer = await crypto.subtle.digest(algorithm, bufferView)
  return arrayBufferToHex(hashBuffer)
}

// Format hash with separators (for readability)
export function formatHashWithSeparator(hash: string, separator = ':', chunkSize = 2): string {
  const chunks: string[] = []
  for (let i = 0; i < hash.length; i += chunkSize) {
    chunks.push(hash.substring(i, i + chunkSize))
  }
  return chunks.join(separator)
}

describe('Hash Generator Utilities', () => {
  describe('arrayBufferToHex', () => {
    it('should convert ArrayBuffer to hex string', () => {
      const buffer = new Uint8Array([0, 1, 15, 16, 255]).buffer
      expect(arrayBufferToHex(buffer)).toBe('00010f10ff')
    })

    it('should handle empty ArrayBuffer', () => {
      const buffer = new Uint8Array([]).buffer
      expect(arrayBufferToHex(buffer)).toBe('')
    })

    it('should pad single digit hex values', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer
      expect(arrayBufferToHex(buffer)).toBe('0102030405')
    })
  })

  describe('generateSHA256', () => {
    it('should generate correct SHA-256 hash for simple text', async () => {
      // Known SHA-256 hash for "hello"
      const hash = await generateSHA256('hello')
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    })

    it('should generate correct SHA-256 hash for empty string', async () => {
      // Known SHA-256 hash for empty string
      const hash = await generateSHA256('')
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })

    it('should generate 64-character hash', async () => {
      const hash = await generateSHA256('test')
      expect(hash.length).toBe(64)
    })

    it('should generate different hashes for different inputs', async () => {
      const hash1 = await generateSHA256('input1')
      const hash2 = await generateSHA256('input2')
      expect(hash1).not.toBe(hash2)
    })

    it('should be deterministic', async () => {
      const hash1 = await generateSHA256('test')
      const hash2 = await generateSHA256('test')
      expect(hash1).toBe(hash2)
    })
  })

  describe('generateSHA384', () => {
    it('should generate correct SHA-384 hash', async () => {
      const hash = await generateSHA384('hello')
      expect(hash).toBe(
        '59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f'
      )
    })

    it('should generate 96-character hash', async () => {
      const hash = await generateSHA384('test')
      expect(hash.length).toBe(96)
    })

    it('should be deterministic', async () => {
      const hash1 = await generateSHA384('test')
      const hash2 = await generateSHA384('test')
      expect(hash1).toBe(hash2)
    })
  })

  describe('generateSHA512', () => {
    it('should generate correct SHA-512 hash', async () => {
      const hash = await generateSHA512('hello')
      expect(hash).toBe(
        '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
      )
    })

    it('should generate 128-character hash', async () => {
      const hash = await generateSHA512('test')
      expect(hash.length).toBe(128)
    })

    it('should be deterministic', async () => {
      const hash1 = await generateSHA512('test')
      const hash2 = await generateSHA512('test')
      expect(hash1).toBe(hash2)
    })
  })

  describe('generateSHA1', () => {
    it('should generate correct SHA-1 hash', async () => {
      const hash = await generateSHA1('hello')
      expect(hash).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
    })

    it('should generate 40-character hash', async () => {
      const hash = await generateSHA1('test')
      expect(hash.length).toBe(40)
    })

    it('should be deterministic', async () => {
      const hash1 = await generateSHA1('test')
      const hash2 = await generateSHA1('test')
      expect(hash1).toBe(hash2)
    })
  })

  describe('generateSimplifiedMD5', () => {
    it('should generate 32-character hash', async () => {
      const hash = await generateSimplifiedMD5('test')
      expect(hash.length).toBe(32)
    })

    it('should be deterministic', async () => {
      const hash1 = await generateSimplifiedMD5('test')
      const hash2 = await generateSimplifiedMD5('test')
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes for different inputs', async () => {
      const hash1 = await generateSimplifiedMD5('input1')
      const hash2 = await generateSimplifiedMD5('input2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyHash', () => {
    it('should verify matching hashes', () => {
      const hash1 = 'abc123def456'
      const hash2 = 'abc123def456'
      expect(verifyHash(hash1, hash2)).toBe(true)
    })

    it('should verify matching hashes (case-insensitive)', () => {
      const hash1 = 'ABC123DEF456'
      const hash2 = 'abc123def456'
      expect(verifyHash(hash1, hash2)).toBe(true)
    })

    it('should verify matching hashes with whitespace', () => {
      const hash1 = '  abc123def456  '
      const hash2 = 'abc123def456'
      expect(verifyHash(hash1, hash2)).toBe(true)
    })

    it('should reject non-matching hashes', () => {
      const hash1 = 'abc123def456'
      const hash2 = 'abc123def789'
      expect(verifyHash(hash1, hash2)).toBe(false)
    })

    it('should reject hashes with different lengths', () => {
      const hash1 = 'abc123'
      const hash2 = 'abc123def'
      expect(verifyHash(hash1, hash2)).toBe(false)
    })
  })

  describe('getHashLength', () => {
    it('should return correct length for MD5', () => {
      expect(getHashLength('MD5')).toBe(32)
    })

    it('should return correct length for SHA-1', () => {
      expect(getHashLength('SHA-1')).toBe(40)
    })

    it('should return correct length for SHA-256', () => {
      expect(getHashLength('SHA-256')).toBe(64)
    })

    it('should return correct length for SHA-384', () => {
      expect(getHashLength('SHA-384')).toBe(96)
    })

    it('should return correct length for SHA-512', () => {
      expect(getHashLength('SHA-512')).toBe(128)
    })

    it('should return 0 for unknown algorithm', () => {
      expect(getHashLength('UNKNOWN')).toBe(0)
    })
  })

  describe('isValidHashFormat', () => {
    it('should validate correct hex strings', () => {
      expect(isValidHashFormat('abc123def456')).toBe(true)
      expect(isValidHashFormat('0123456789abcdef')).toBe(true)
      expect(isValidHashFormat('ABCDEF')).toBe(true)
    })

    it('should reject non-hex strings', () => {
      expect(isValidHashFormat('xyz123')).toBe(false)
      expect(isValidHashFormat('hello world')).toBe(false)
      expect(isValidHashFormat('abc!@#')).toBe(false)
    })

    it('should validate length when provided', () => {
      expect(isValidHashFormat('abc123def456', 12)).toBe(true)
      expect(isValidHashFormat('abc123def456', 10)).toBe(false)
    })

    it('should reject invalid inputs', () => {
      expect(isValidHashFormat('')).toBe(false)
      expect(isValidHashFormat(null as unknown as string)).toBe(false)
      expect(isValidHashFormat(undefined as unknown as string)).toBe(false)
    })

    it('should validate MD5 hash length', () => {
      const md5Hash = 'a'.repeat(32)
      expect(isValidHashFormat(md5Hash, 32)).toBe(true)
    })

    it('should validate SHA-256 hash length', () => {
      const sha256Hash = 'a'.repeat(64)
      expect(isValidHashFormat(sha256Hash, 64)).toBe(true)
    })
  })

  describe('identifyHashAlgorithm', () => {
    it('should identify MD5 by length', () => {
      const hash = 'a'.repeat(32)
      expect(identifyHashAlgorithm(hash)).toBe('MD5')
    })

    it('should identify SHA-1 by length', () => {
      const hash = 'a'.repeat(40)
      expect(identifyHashAlgorithm(hash)).toBe('SHA-1')
    })

    it('should identify SHA-256 by length', () => {
      const hash = 'a'.repeat(64)
      expect(identifyHashAlgorithm(hash)).toBe('SHA-256')
    })

    it('should identify SHA-384 by length', () => {
      const hash = 'a'.repeat(96)
      expect(identifyHashAlgorithm(hash)).toBe('SHA-384')
    })

    it('should identify SHA-512 by length', () => {
      const hash = 'a'.repeat(128)
      expect(identifyHashAlgorithm(hash)).toBe('SHA-512')
    })

    it('should return null for unknown lengths', () => {
      expect(identifyHashAlgorithm('abc')).toBe(null)
      expect(identifyHashAlgorithm('a'.repeat(50))).toBe(null)
    })
  })

  describe('hashArrayBuffer', () => {
    it('should hash ArrayBuffer with SHA-256', async () => {
      const data = new TextEncoder().encode('hello')
      const hash = await hashArrayBuffer(data.buffer, 'SHA-256')
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
    })

    it('should hash ArrayBuffer with SHA-512', async () => {
      const data = new TextEncoder().encode('hello')
      const hash = await hashArrayBuffer(data.buffer, 'SHA-512')
      expect(hash).toBe(
        '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
      )
    })

    it('should hash empty ArrayBuffer', async () => {
      const data = new Uint8Array([])
      const hash = await hashArrayBuffer(data.buffer as ArrayBuffer, 'SHA-256')
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })

    it('should be deterministic', async () => {
      const data = new TextEncoder().encode('test')
      const hash1 = await hashArrayBuffer(data.buffer, 'SHA-256')
      const hash2 = await hashArrayBuffer(data.buffer, 'SHA-256')
      expect(hash1).toBe(hash2)
    })
  })

  describe('formatHashWithSeparator', () => {
    it('should format hash with default colon separator', () => {
      const hash = 'abcdef123456'
      expect(formatHashWithSeparator(hash)).toBe('ab:cd:ef:12:34:56')
    })

    it('should format hash with custom separator', () => {
      const hash = 'abcdef123456'
      expect(formatHashWithSeparator(hash, '-')).toBe('ab-cd-ef-12-34-56')
    })

    it('should format hash with custom chunk size', () => {
      const hash = 'abcdef123456'
      expect(formatHashWithSeparator(hash, ':', 4)).toBe('abcd:ef12:3456')
    })

    it('should handle hash not divisible by chunk size', () => {
      const hash = 'abcde'
      expect(formatHashWithSeparator(hash, ':', 2)).toBe('ab:cd:e')
    })

    it('should handle empty hash', () => {
      expect(formatHashWithSeparator('')).toBe('')
    })

    it('should format MD5 hash in readable format', () => {
      const md5 = '5d41402abc4b2a76b9719d911017c592'
      const formatted = formatHashWithSeparator(md5, '-', 8)
      expect(formatted).toBe('5d41402a-bc4b2a76-b9719d91-1017c592')
    })
  })

  describe('hash consistency across algorithms', () => {
    it('should generate different hashes for same input with different algorithms', async () => {
      const input = 'test'
      const sha256 = await generateSHA256(input)
      const sha384 = await generateSHA384(input)
      const sha512 = await generateSHA512(input)
      const sha1 = await generateSHA1(input)

      expect(sha256).not.toBe(sha384)
      expect(sha256).not.toBe(sha512)
      expect(sha256).not.toBe(sha1)
      expect(sha384).not.toBe(sha512)
    })

    it('should maintain correct lengths for all algorithms', async () => {
      const input = 'test data'
      const sha256 = await generateSHA256(input)
      const sha384 = await generateSHA384(input)
      const sha512 = await generateSHA512(input)
      const sha1 = await generateSHA1(input)
      const md5 = await generateSimplifiedMD5(input)

      expect(sha256.length).toBe(64)
      expect(sha384.length).toBe(96)
      expect(sha512.length).toBe(128)
      expect(sha1.length).toBe(40)
      expect(md5.length).toBe(32)
    })
  })

  describe('edge cases', () => {
    it('should handle very long strings', async () => {
      const longString = 'A'.repeat(10000)
      const hash = await generateSHA256(longString)
      expect(hash.length).toBe(64)
      expect(isValidHashFormat(hash, 64)).toBe(true)
    })

    it('should handle special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await generateSHA256(specialChars)
      expect(hash.length).toBe(64)
      expect(isValidHashFormat(hash, 64)).toBe(true)
    })

    it('should handle newlines and tabs', async () => {
      const textWithWhitespace = 'Line 1\nLine 2\tTabbed'
      const hash = await generateSHA256(textWithWhitespace)
      expect(hash.length).toBe(64)
      expect(isValidHashFormat(hash, 64)).toBe(true)
    })

    it('should handle Unicode characters', async () => {
      const unicode = '你好世界 🌍 こんにちは'
      const hash = await generateSHA256(unicode)
      expect(hash.length).toBe(64)
      expect(isValidHashFormat(hash, 64)).toBe(true)
    })
  })
})
