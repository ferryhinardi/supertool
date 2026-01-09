/**
 * Tests for privacy utilities
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { anonymizeEmail, anonymizeName, formatRelativeTime } from '../privacy'

describe('privacy utilities', () => {
  describe('anonymizeName', () => {
    it('should return "Anonymous Supporter" for null input', () => {
      expect(anonymizeName(null)).toBe('Anonymous Supporter')
    })

    it('should return "Anonymous Supporter" for undefined input', () => {
      expect(anonymizeName(undefined)).toBe('Anonymous Supporter')
    })

    it('should return "Anonymous Supporter" for empty string', () => {
      expect(anonymizeName('')).toBe('Anonymous Supporter')
    })

    it('should return "Anonymous Supporter" for whitespace-only string', () => {
      expect(anonymizeName('   ')).toBe('Anonymous Supporter')
    })

    it('should return single name as-is', () => {
      expect(anonymizeName('John')).toBe('John')
    })

    it('should anonymize two-part name (first name + last initial)', () => {
      expect(anonymizeName('John Doe')).toBe('John D.')
    })

    it('should anonymize three-part name (first name + last initial)', () => {
      expect(anonymizeName('John Michael Doe')).toBe('John D.')
    })

    it('should handle extra whitespace between names', () => {
      expect(anonymizeName('John    Doe')).toBe('John D.')
    })

    it('should handle leading/trailing whitespace', () => {
      expect(anonymizeName('  John Doe  ')).toBe('John D.')
    })

    it('should handle names with special characters', () => {
      expect(anonymizeName("Mary O'Brien")).toBe('Mary O.')
    })

    it('should handle hyphenated last names', () => {
      expect(anonymizeName('Jane Smith-Jones')).toBe('Jane S.')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-09T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "just now" for times within 60 seconds', () => {
      const date = new Date('2026-01-09T11:59:30Z') // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('just now')
    })

    it('should return "1 minute ago" for exactly 1 minute', () => {
      const date = new Date('2026-01-09T11:59:00Z') // 1 minute ago
      expect(formatRelativeTime(date)).toBe('1 minute ago')
    })

    it('should return "X minutes ago" for multiple minutes', () => {
      const date = new Date('2026-01-09T11:45:00Z') // 15 minutes ago
      expect(formatRelativeTime(date)).toBe('15 minutes ago')
    })

    it('should return "1 hour ago" for exactly 1 hour', () => {
      const date = new Date('2026-01-09T11:00:00Z') // 1 hour ago
      expect(formatRelativeTime(date)).toBe('1 hour ago')
    })

    it('should return "X hours ago" for multiple hours', () => {
      const date = new Date('2026-01-09T06:00:00Z') // 6 hours ago
      expect(formatRelativeTime(date)).toBe('6 hours ago')
    })

    it('should return "1 day ago" for exactly 1 day', () => {
      const date = new Date('2026-01-08T12:00:00Z') // 1 day ago
      expect(formatRelativeTime(date)).toBe('1 day ago')
    })

    it('should return "X days ago" for multiple days', () => {
      const date = new Date('2026-01-02T12:00:00Z') // 7 days ago
      expect(formatRelativeTime(date)).toBe('7 days ago')
    })

    it('should return formatted date for dates older than 30 days', () => {
      const date = new Date('2025-11-01T12:00:00Z') // ~69 days ago
      expect(formatRelativeTime(date)).toBe('Nov 2025')
    })

    it('should handle string date input', () => {
      const date = '2026-01-09T11:30:00Z' // 30 minutes ago
      expect(formatRelativeTime(date)).toBe('30 minutes ago')
    })

    it('should handle ISO date string', () => {
      const date = '2026-01-09T10:00:00.000Z' // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2 hours ago')
    })
  })

  describe('anonymizeEmail', () => {
    it('should return default anonymous email for null input', () => {
      expect(anonymizeEmail(null)).toBe('anonymous@supporter.com')
    })

    it('should return default anonymous email for undefined input', () => {
      expect(anonymizeEmail(undefined)).toBe('anonymous@supporter.com')
    })

    it('should return default anonymous email for invalid email (no @)', () => {
      expect(anonymizeEmail('invalidemail')).toBe('anonymous@supporter.com')
    })

    it('should anonymize standard email address', () => {
      expect(anonymizeEmail('john.doe@example.com')).toBe('j***@example.com')
    })

    it('should anonymize email with single character local part', () => {
      expect(anonymizeEmail('a@example.com')).toBe('a***@example.com')
    })

    it('should anonymize email with subdomain', () => {
      expect(anonymizeEmail('user@mail.example.com')).toBe('u***@mail.example.com')
    })

    it('should anonymize email with numbers', () => {
      expect(anonymizeEmail('user123@example.com')).toBe('u***@example.com')
    })

    it('should anonymize email with plus sign', () => {
      expect(anonymizeEmail('user+tag@example.com')).toBe('u***@example.com')
    })

    it('should anonymize email with dots in local part', () => {
      expect(anonymizeEmail('first.last@example.com')).toBe('f***@example.com')
    })
  })
})
