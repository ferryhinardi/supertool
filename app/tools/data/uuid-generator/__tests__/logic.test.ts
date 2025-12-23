import { describe, expect, it } from 'vitest'

// UUID validation regex pattern (same as in page.tsx)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Validate UUID format and return version
function validateUUID(uuid: string): { valid: boolean; version?: number; error?: string } {
  if (!uuid || uuid.trim() === '') {
    return { valid: false, error: 'UUID cannot be empty' }
  }

  const trimmedUuid = uuid.trim()

  if (!UUID_PATTERN.test(trimmedUuid)) {
    return { valid: false, error: 'Invalid UUID format' }
  }

  // Extract version from the UUID (13th character, 0-indexed position 14)
  const version = Number.parseInt(trimmedUuid[14], 16)

  if (version < 1 || version > 5) {
    return { valid: false, error: `Invalid UUID version: ${version}` }
  }

  return { valid: true, version }
}

// Generate UUID v4 using Web Crypto API
function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Generate multiple UUIDs
function generateBulkUUIDs(count: number): string[] {
  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    uuids.push(generateUUIDv4())
  }
  return uuids
}

describe('UUID Validation Logic', () => {
  describe('validateUUID', () => {
    describe('Valid UUIDs', () => {
      it('validates UUID v1', () => {
        const result = validateUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(1)
        expect(result.error).toBeUndefined()
      })

      it('validates UUID v2', () => {
        const result = validateUUID('000003e8-2363-21ef-b200-325096b39f47')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(2)
        expect(result.error).toBeUndefined()
      })

      it('validates UUID v3', () => {
        const result = validateUUID('6ba7b811-9dad-31d1-80b4-00c04fd430c8')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(3)
        expect(result.error).toBeUndefined()
      })

      it('validates UUID v4', () => {
        const result = validateUUID('550e8400-e29b-41d4-a716-446655440000')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(4)
        expect(result.error).toBeUndefined()
      })

      it('validates UUID v5', () => {
        const result = validateUUID('886313e1-3b8a-5372-9b90-0c9aee199e5d')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(5)
        expect(result.error).toBeUndefined()
      })

      it('validates UUID with uppercase letters', () => {
        const result = validateUUID('550E8400-E29B-41D4-A716-446655440000')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(4)
      })

      it('validates UUID with mixed case', () => {
        const result = validateUUID('550e8400-E29B-41d4-A716-446655440000')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(4)
      })

      it('trims whitespace before validation', () => {
        const result = validateUUID('  550e8400-e29b-41d4-a716-446655440000  ')
        expect(result.valid).toBe(true)
        expect(result.version).toBe(4)
      })
    })

    describe('Invalid UUIDs', () => {
      it('rejects empty string', () => {
        const result = validateUUID('')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('UUID cannot be empty')
      })

      it('rejects whitespace-only string', () => {
        const result = validateUUID('   ')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('UUID cannot be empty')
      })

      it('rejects UUID without dashes', () => {
        const result = validateUUID('550e8400e29b41d4a716446655440000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects UUID with wrong dash positions', () => {
        const result = validateUUID('550e8400-e29-b41d4-a716-446655440000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects UUID with invalid characters', () => {
        const result = validateUUID('550e8400-e29b-41d4-a716-44665544000g')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects UUID that is too short', () => {
        const result = validateUUID('550e8400-e29b-41d4-a716')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects UUID that is too long', () => {
        const result = validateUUID('550e8400-e29b-41d4-a716-446655440000-extra')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects UUID with invalid version (0)', () => {
        const result = validateUUID('550e8400-e29b-01d4-a716-446655440000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format') // Regex rejects it before version check
      })

      it('rejects UUID with invalid version (6)', () => {
        const result = validateUUID('550e8400-e29b-61d4-a716-446655440000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format') // Regex rejects it before version check
      })

      it('rejects UUID with invalid variant bits', () => {
        const result = validateUUID('550e8400-e29b-41d4-0716-446655440000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects completely random string', () => {
        const result = validateUUID('not-a-valid-uuid')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })

      it('rejects null-like values', () => {
        const result = validateUUID('00000000-0000-0000-0000-000000000000')
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Invalid UUID format')
      })
    })
  })

  describe('generateUUIDv4', () => {
    it('generates a valid UUID v4', () => {
      const uuid = generateUUIDv4()
      const result = validateUUID(uuid)
      expect(result.valid).toBe(true)
      expect(result.version).toBe(4)
    })

    it('generates UUID with correct format', () => {
      const uuid = generateUUIDv4()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('generates unique UUIDs', () => {
      const uuids = new Set()
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUIDv4())
      }
      // All 100 should be unique
      expect(uuids.size).toBe(100)
    })

    it('generates UUID with version 4 in correct position', () => {
      const uuid = generateUUIDv4()
      // Position 14 (0-indexed) should be '4'
      expect(uuid[14]).toBe('4')
    })

    it('generates UUID with correct variant bits', () => {
      const uuid = generateUUIDv4()
      // Position 19 (0-indexed) should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(uuid[19].toLowerCase())
    })
  })

  describe('generateBulkUUIDs', () => {
    it('generates specified number of UUIDs', () => {
      const uuids = generateBulkUUIDs(10)
      expect(uuids).toHaveLength(10)
    })

    it('generates 1 UUID when count is 1', () => {
      const uuids = generateBulkUUIDs(1)
      expect(uuids).toHaveLength(1)
    })

    it('generates 100 UUIDs when count is 100', () => {
      const uuids = generateBulkUUIDs(100)
      expect(uuids).toHaveLength(100)
    })

    it('generates empty array when count is 0', () => {
      const uuids = generateBulkUUIDs(0)
      expect(uuids).toHaveLength(0)
    })

    it('generates all valid UUIDs', () => {
      const uuids = generateBulkUUIDs(20)
      for (const uuid of uuids) {
        const result = validateUUID(uuid)
        expect(result.valid).toBe(true)
        expect(result.version).toBe(4)
      }
    })

    it('generates unique UUIDs in bulk', () => {
      const uuids = generateBulkUUIDs(50)
      const uniqueUuids = new Set(uuids)
      // All should be unique
      expect(uniqueUuids.size).toBe(50)
    })

    it('handles negative count gracefully', () => {
      const uuids = generateBulkUUIDs(-5)
      expect(uuids).toHaveLength(0)
    })
  })

  describe('UUID Pattern Regex', () => {
    it('matches valid UUID v4 format', () => {
      expect(UUID_PATTERN.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('matches valid UUID v1 format', () => {
      expect(UUID_PATTERN.test('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
    })

    it('matches valid UUID v5 format', () => {
      expect(UUID_PATTERN.test('886313e1-3b8a-5372-9b90-0c9aee199e5d')).toBe(true)
    })

    it('does not match invalid format', () => {
      expect(UUID_PATTERN.test('not-a-uuid')).toBe(false)
    })

    it('does not match UUID without dashes', () => {
      expect(UUID_PATTERN.test('550e8400e29b41d4a716446655440000')).toBe(false)
    })

    it('does not match UUID with wrong version', () => {
      expect(UUID_PATTERN.test('550e8400-e29b-61d4-a716-446655440000')).toBe(false)
    })

    it('does not match UUID with wrong variant', () => {
      expect(UUID_PATTERN.test('550e8400-e29b-41d4-0716-446655440000')).toBe(false)
    })

    it('is case-insensitive', () => {
      expect(UUID_PATTERN.test('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })
  })
})
