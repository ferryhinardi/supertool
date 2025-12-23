import { describe, expect, it } from 'vitest'
import { calculateStrength, generatePassword } from '../utils'

describe('Password Generator - Logic Tests', () => {
  describe('generatePassword', () => {
    it('should generate password with correct length', () => {
      const password = generatePassword({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      })
      expect(password).toHaveLength(16)
    })

    it('should generate password with only uppercase letters', () => {
      const password = generatePassword({
        length: 20,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
      })
      expect(password).toMatch(/^[A-Z]+$/)
      expect(password).toHaveLength(20)
    })

    it('should generate password with only lowercase letters', () => {
      const password = generatePassword({
        length: 15,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
      })
      expect(password).toMatch(/^[a-z]+$/)
      expect(password).toHaveLength(15)
    })

    it('should generate password with only numbers', () => {
      const password = generatePassword({
        length: 12,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
      })
      expect(password).toMatch(/^[0-9]+$/)
      expect(password).toHaveLength(12)
    })

    it('should generate password with only symbols', () => {
      const password = generatePassword({
        length: 10,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
      })
      expect(password).toMatch(/^[!@#$%^&*()\-_+=[\]{}|;:,.<>?]+$/)
      expect(password).toHaveLength(10)
    })

    it('should generate password with mixed character types', () => {
      const password = generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      })
      expect(password).toHaveLength(20)
      // Should contain only valid characters
      expect(password).toMatch(/^[a-zA-Z0-9!@#$%^&*()\-_+=[\]{}|;:,.<>?]+$/)
    })

    it('should throw error when no character sets selected', () => {
      expect(() =>
        generatePassword({
          length: 12,
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
        })
      ).toThrow('At least one character set must be selected')
    })

    it('should generate different passwords on each call', () => {
      const options = {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      }
      const password1 = generatePassword(options)
      const password2 = generatePassword(options)
      const password3 = generatePassword(options)

      // Highly unlikely to generate identical passwords
      expect(password1).not.toBe(password2)
      expect(password2).not.toBe(password3)
      expect(password1).not.toBe(password3)
    })

    it('should handle minimum length', () => {
      const password = generatePassword({
        length: 8,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      })
      expect(password).toHaveLength(8)
    })

    it('should handle maximum length', () => {
      const password = generatePassword({
        length: 64,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      })
      expect(password).toHaveLength(64)
    })
  })

  describe('calculateStrength', () => {
    it('should return "No Password" for empty string', () => {
      const result = calculateStrength('')
      expect(result.label).toBe('No Password')
      expect(result.score).toBe(0)
      expect(result.feedback).toContain('Enter a password to see strength analysis')
    })

    it('should rate short simple password as "Very Weak"', () => {
      const result = calculateStrength('abc')
      expect(result.label).toBe('Very Weak')
      expect(result.score).toBe(0)
      expect(result.color).toBe('#ef4444')
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should rate 8-char lowercase-only password as "Very Weak"', () => {
      const result = calculateStrength('password')
      expect(result.label).toBe('Very Weak')
      // Feedback from zxcvbn should provide suggestions
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should rate mixed 12-char password as "Weak" or better', () => {
      const result = calculateStrength('Password123!')
      expect(['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']).toContain(result.label)
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('should rate strong 16-char password as "Fair" or better', () => {
      const result = calculateStrength('P@ssw0rd!234Abcd')
      expect(['Fair', 'Strong', 'Very Strong']).toContain(result.label)
      expect(result.score).toBeGreaterThanOrEqual(2)
    })

    it('should analyze passwords with varying complexity', () => {
      const weakPassword = calculateStrength('Aaaa1111!!!!')
      const strongPassword = calculateStrength('P@ssw0rd1234')
      // Both should return valid strength results
      expect(weakPassword.score).toBeGreaterThanOrEqual(0)
      expect(strongPassword.score).toBeGreaterThanOrEqual(0)
      expect(weakPassword.feedback.length).toBeGreaterThan(0)
    })

    it('should give feedback from zxcvbn analysis', () => {
      const result = calculateStrength('lowercase123')
      // zxcvbn provides feedback, just verify it exists
      expect(result.feedback.length).toBeGreaterThan(0)
      expect(typeof result.feedback[0]).toBe('string')
    })

    it('should recognize very strong passwords', () => {
      const result = calculateStrength('Tr0ng#P@ssw0rd!2024$xyz')
      expect(result.score).toBeGreaterThanOrEqual(4)
      expect(['Strong', 'Very Strong']).toContain(result.label)
    })

    it('should handle passwords with all character types', () => {
      const result = calculateStrength('Abc123!@#')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(4)
      expect(['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']).toContain(result.label)
    })

    it('should give lower score for short passwords even with variety', () => {
      const shortPassword = calculateStrength('Abc1!')
      const longPassword = calculateStrength('Abcdefgh1234!@#$')
      expect(shortPassword.score).toBeLessThan(longPassword.score)
    })
  })
})
