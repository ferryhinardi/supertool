import { describe, it, expect } from 'vitest'
import {
  encryptText,
  decryptText,
  encryptFile,
  decryptFile,
  calculatePasswordStrength,
  createEncryptedLink,
  parseEncryptedLink,
  formatFileSize,
} from '../utils'

describe('Encryption Utils', () => {
  describe('encryptText', () => {
    it('should encrypt and decrypt text successfully', async () => {
      const plaintext = 'Hello, World!'
      const password = 'strongPassword123!'

      const encrypted = await encryptText(plaintext, password)

      expect(encrypted.encrypted).toBeTruthy()
      expect(encrypted.iv).toBeTruthy()
      expect(encrypted.salt).toBeTruthy()

      const decrypted = await decryptText(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        password
      )

      expect(decrypted).toBe(plaintext)
    })

    it('should fail to decrypt with wrong password', async () => {
      const plaintext = 'Secret message'
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'

      const encrypted = await encryptText(plaintext, password)

      await expect(
        decryptText(encrypted.encrypted, encrypted.iv, encrypted.salt, wrongPassword)
      ).rejects.toThrow('Decryption failed')
    })

    it('should throw error for empty plaintext', async () => {
      await expect(encryptText('', 'password')).rejects.toThrow('Plaintext cannot be empty')
    })

    it('should throw error for empty password', async () => {
      await expect(encryptText('Hello', '')).rejects.toThrow('Password cannot be empty')
    })

    it('should produce different encrypted outputs for same input', async () => {
      const plaintext = 'Same message'
      const password = 'samePassword'

      const encrypted1 = await encryptText(plaintext, password)
      const encrypted2 = await encryptText(plaintext, password)

      // IVs and salts should be different (random)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)

      // But both should decrypt to the same plaintext
      const decrypted1 = await decryptText(
        encrypted1.encrypted,
        encrypted1.iv,
        encrypted1.salt,
        password
      )
      const decrypted2 = await decryptText(
        encrypted2.encrypted,
        encrypted2.iv,
        encrypted2.salt,
        password
      )

      expect(decrypted1).toBe(plaintext)
      expect(decrypted2).toBe(plaintext)
    })

    it('should handle unicode characters', async () => {
      const plaintext = '你好世界 🌍 émojis & spëcial çhars!'
      const password = 'unicode-password-123'

      const encrypted = await encryptText(plaintext, password)
      const decrypted = await decryptText(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        password
      )

      expect(decrypted).toBe(plaintext)
    })

    it('should handle long text', async () => {
      const plaintext = 'A'.repeat(10000)
      const password = 'longTextPassword'

      const encrypted = await encryptText(plaintext, password)
      const decrypted = await decryptText(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        password
      )

      expect(decrypted).toBe(plaintext)
    })
  })

  describe('decryptText', () => {
    it('should throw error for missing encryption data', async () => {
      await expect(decryptText('', 'iv', 'salt', 'password')).rejects.toThrow(
        'Missing encryption data'
      )
      await expect(decryptText('encrypted', '', 'salt', 'password')).rejects.toThrow(
        'Missing encryption data'
      )
      await expect(decryptText('encrypted', 'iv', '', 'password')).rejects.toThrow(
        'Missing encryption data'
      )
    })

    it('should throw error for empty password', async () => {
      await expect(decryptText('encrypted', 'iv', 'salt', '')).rejects.toThrow(
        'Password cannot be empty'
      )
    })

    it('should throw error for corrupted data', async () => {
      await expect(decryptText('corrupted', 'base64data', 'here', 'password')).rejects.toThrow(
        'Decryption failed'
      )
    })
  })

  describe('encryptFile', () => {
    it('should encrypt and decrypt file data successfully', async () => {
      const fileData = new TextEncoder().encode('File content here').buffer
      const password = 'filePassword123'

      const encrypted = await encryptFile(fileData, password)

      expect(encrypted.encrypted).toBeTruthy()
      expect(encrypted.iv).toBeTruthy()
      expect(encrypted.salt).toBeTruthy()

      const decrypted = await decryptFile(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        password
      )

      const decryptedText = new TextDecoder().decode(decrypted)
      expect(decryptedText).toBe('File content here')
    })

    it('should throw error for empty file data', async () => {
      const emptyBuffer = new ArrayBuffer(0)
      await expect(encryptFile(emptyBuffer, 'password')).rejects.toThrow(
        'File data cannot be empty'
      )
    })

    it('should throw error for empty password', async () => {
      const fileData = new TextEncoder().encode('Content').buffer
      await expect(encryptFile(fileData, '')).rejects.toThrow('Password cannot be empty')
    })

    it('should handle binary file data', async () => {
      // Create some binary data
      const binaryData = new Uint8Array([0, 1, 2, 3, 255, 254, 128, 64, 32, 16])
      const password = 'binaryPassword'

      const encrypted = await encryptFile(binaryData.buffer, password)
      const decrypted = await decryptFile(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.salt,
        password
      )

      const decryptedArray = new Uint8Array(decrypted)
      expect(decryptedArray).toEqual(binaryData)
    })
  })

  describe('decryptFile', () => {
    it('should fail to decrypt with wrong password', async () => {
      const fileData = new TextEncoder().encode('Secret file').buffer
      const password = 'correctPassword'
      const wrongPassword = 'wrongPassword'

      const encrypted = await encryptFile(fileData, password)

      await expect(
        decryptFile(encrypted.encrypted, encrypted.iv, encrypted.salt, wrongPassword)
      ).rejects.toThrow('Decryption failed')
    })

    it('should throw error for missing data', async () => {
      await expect(decryptFile('', 'iv', 'salt', 'password')).rejects.toThrow(
        'Missing encryption data'
      )
    })
  })

  describe('calculatePasswordStrength', () => {
    it('should return very weak for empty password', () => {
      const strength = calculatePasswordStrength('')
      expect(strength.score).toBe(0)
      expect(strength.label).toBe('Very Weak')
      expect(strength.suggestions).toContain('Enter a password')
    })

    it('should return weak for short password', () => {
      const strength = calculatePasswordStrength('pass')
      expect(strength.score).toBeLessThanOrEqual(1)
      expect(strength.suggestions.some((s) => s.includes('8 characters'))).toBe(true)
    })

    it('should return strong for good password', () => {
      const strength = calculatePasswordStrength('MyStrongP@ssw0rd!')
      expect(strength.score).toBeGreaterThanOrEqual(3)
      expect(strength.label).toMatch(/Strong|Very Strong/)
    })

    it('should detect common patterns', () => {
      const strength1 = calculatePasswordStrength('123456789')
      const strength2 = calculatePasswordStrength('password123')
      const strength3 = calculatePasswordStrength('qwerty123')

      expect(strength1.suggestions.some((s) => s.includes('common patterns'))).toBe(true)
      expect(strength2.suggestions.some((s) => s.includes('common patterns'))).toBe(true)
      expect(strength3.suggestions.some((s) => s.includes('common patterns'))).toBe(true)
    })

    it('should suggest mixing cases', () => {
      const strength = calculatePasswordStrength('alllowercase123')
      expect(
        strength.suggestions.some((s) => s.toLowerCase().includes('uppercase and lowercase'))
      ).toBe(true)
    })

    it('should suggest adding numbers', () => {
      const strength = calculatePasswordStrength('NoNumbersHere')
      expect(strength.suggestions.some((s) => s.toLowerCase().includes('numbers'))).toBe(true)
    })

    it('should suggest adding special characters', () => {
      const strength = calculatePasswordStrength('NoSpecialChars123')
      expect(strength.suggestions.some((s) => s.toLowerCase().includes('special'))).toBe(true)
    })

    it('should return very strong for excellent password', () => {
      const strength = calculatePasswordStrength('Th1s!sAV3ry$tr0ngP@ssw0rd!')
      expect(strength.score).toBe(4)
      expect(strength.label).toBe('Very Strong')
    })

    it('should limit suggestions to 3', () => {
      const strength = calculatePasswordStrength('weak')
      expect(strength.suggestions.length).toBeLessThanOrEqual(3)
    })
  })

  describe('createEncryptedLink and parseEncryptedLink', () => {
    it('should create a valid encrypted link with query parameter', () => {
      const encryptedData = {
        encrypted: 'encryptedDataHere',
        iv: 'ivDataHere',
        salt: 'saltDataHere',
      }

      const link = createEncryptedLink(encryptedData)

      // Link should contain the current origin and pathname
      expect(link).toContain('?data=')
      expect(link).toMatch(/^https?:\/\//)
    })

    it('should parse encrypted link successfully', () => {
      const encryptedData = {
        encrypted: 'encryptedDataHere',
        iv: 'ivDataHere',
        salt: 'saltDataHere',
      }

      // Create a test URL with encoded data
      const data = {
        e: encryptedData.encrypted,
        i: encryptedData.iv,
        s: encryptedData.salt,
      }
      const encoded = btoa(JSON.stringify(data))
      const testUrl = `https://example.com/tools/encryption-tool?data=${encodeURIComponent(encoded)}`

      const parsed = parseEncryptedLink(testUrl)

      expect(parsed).toEqual(encryptedData)
    })

    it('should create and parse encrypted link roundtrip', () => {
      const encryptedData = {
        encrypted: 'encryptedDataHere',
        iv: 'ivDataHere',
        salt: 'saltDataHere',
      }

      const link = createEncryptedLink(encryptedData)
      const parsed = parseEncryptedLink(link)

      expect(parsed).toEqual(encryptedData)
    })

    it('should return null for invalid link', () => {
      const result = parseEncryptedLink('https://example.com/invalid')
      expect(result).toBeNull()
    })

    it('should return null for malformed data parameter', () => {
      const result = parseEncryptedLink('https://example.com/?data=invalidbase64')
      expect(result).toBeNull()
    })

    it('should handle special characters in encrypted data', () => {
      const encryptedData = {
        encrypted: 'abc+123/xyz=',
        iv: 'def+456/uvw=',
        salt: 'ghi+789/rst=',
      }

      const link = createEncryptedLink(encryptedData)
      const parsed = parseEncryptedLink(link)

      expect(parsed).toEqual(encryptedData)
    })
  })

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(2621440)).toBe('2.5 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
      expect(formatFileSize(2147483648)).toBe('2 GB')
    })

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toBe('1.18 MB')
    })
  })
})
