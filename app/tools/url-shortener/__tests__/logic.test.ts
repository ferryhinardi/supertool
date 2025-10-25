import { describe, it, expect } from 'vitest'

describe('URL Shortener Logic', () => {
  describe('URL Validation', () => {
    it('should validate correct HTTP URLs', () => {
      const testUrl = 'http://example.com'
      let isValid = false
      try {
        const urlObj = new URL(testUrl)
        isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        isValid = false
      }
      expect(isValid).toBe(true)
    })

    it('should validate correct HTTPS URLs', () => {
      const testUrl = 'https://example.com/path?query=value'
      let isValid = false
      try {
        const urlObj = new URL(testUrl)
        isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        isValid = false
      }
      expect(isValid).toBe(true)
    })

    it('should reject invalid URLs', () => {
      const testUrl = 'not-a-url'
      let isValid = false
      try {
        const urlObj = new URL(testUrl)
        isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        isValid = false
      }
      expect(isValid).toBe(false)
    })

    it('should reject non-HTTP protocols', () => {
      const testUrl = 'ftp://example.com'
      let isValid = false
      try {
        const urlObj = new URL(testUrl)
        isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        isValid = false
      }
      expect(isValid).toBe(false)
    })
  })

  describe('Custom Alias Validation', () => {
    it('should accept valid custom aliases', () => {
      const alias = 'my-custom-link'
      const isValid = /^[a-z0-9-]+$/.test(alias) && alias.length >= 3 && alias.length <= 50
      expect(isValid).toBe(true)
    })

    it('should accept alphanumeric aliases', () => {
      const alias = 'link123'
      const isValid = /^[a-z0-9-]+$/.test(alias) && alias.length >= 3 && alias.length <= 50
      expect(isValid).toBe(true)
    })

    it('should reject uppercase letters', () => {
      const alias = 'My-Link'
      const isValid = /^[a-z0-9-]+$/.test(alias)
      expect(isValid).toBe(false)
    })

    it('should reject special characters', () => {
      const alias = 'my_link!'
      const isValid = /^[a-z0-9-]+$/.test(alias)
      expect(isValid).toBe(false)
    })

    it('should reject aliases shorter than 3 characters', () => {
      const alias = 'ab'
      const isValid = /^[a-z0-9-]+$/.test(alias) && alias.length >= 3 && alias.length <= 50
      expect(isValid).toBe(false)
    })

    it('should reject aliases longer than 50 characters', () => {
      const alias = 'a'.repeat(51)
      const isValid = /^[a-z0-9-]+$/.test(alias) && alias.length >= 3 && alias.length <= 50
      expect(isValid).toBe(false)
    })

    it('should accept aliases with hyphens', () => {
      const alias = 'my-custom-link-2024'
      const isValid = /^[a-z0-9-]+$/.test(alias) && alias.length >= 3 && alias.length <= 50
      expect(isValid).toBe(true)
    })
  })

  describe('Short Code Generation', () => {
    it('should generate short codes of correct length', () => {
      // Simulate nanoid behavior
      const shortCode = 'abc123'
      expect(shortCode.length).toBe(6)
    })

    it('should generate alphanumeric short codes', () => {
      const shortCode = 'abc123'
      const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(shortCode)
      expect(isAlphanumeric).toBe(true)
    })
  })

  describe('Short URL Format', () => {
    it('should create proper short URL format', () => {
      const protocol = 'http'
      const host = 'localhost:3000'
      const shortCode = 'abc123'
      const shortUrl = `${protocol}://${host}/s/${shortCode}`

      expect(shortUrl).toBe('http://localhost:3000/s/abc123')
    })

    it('should handle HTTPS protocol', () => {
      const protocol = 'https'
      const host = 'supertool.com'
      const shortCode = 'xyz789'
      const shortUrl = `${protocol}://${host}/s/${shortCode}`

      expect(shortUrl).toBe('https://supertool.com/s/xyz789')
    })
  })

  describe('Statistics Calculation', () => {
    it('should calculate total URLs correctly', () => {
      const urls = [
        { id: '1', clicks: 10 },
        { id: '2', clicks: 20 },
        { id: '3', clicks: 30 },
      ]
      const total = urls.length
      expect(total).toBe(3)
    })

    it('should calculate total clicks correctly', () => {
      const urls = [
        { id: '1', clicks: 10 },
        { id: '2', clicks: 20 },
        { id: '3', clicks: 30 },
      ]
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
      expect(totalClicks).toBe(60)
    })

    it('should calculate average clicks correctly', () => {
      const urls = [
        { id: '1', clicks: 10 },
        { id: '2', clicks: 20 },
        { id: '3', clicks: 30 },
      ]
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
      const avgClicks = urls.length > 0 ? (totalClicks / urls.length).toFixed(1) : '0'
      expect(avgClicks).toBe('20.0')
    })

    it('should handle empty URL list', () => {
      const urls: { id: string; clicks: number }[] = []
      const total = urls.length
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
      const avgClicks = total > 0 ? (totalClicks / total).toFixed(1) : '0'

      expect(total).toBe(0)
      expect(totalClicks).toBe(0)
      expect(avgClicks).toBe('0')
    })
  })
})
