import { describe, expect, it } from 'vitest'
import {
  generateAppStoreQR,
  generateEmailQR,
  generateEventQR,
  generateGeoQR,
  generatePhoneQR,
  generateSMSQR,
  generateSocialQR,
  generateWhatsAppQR,
} from '../qr-types'

describe('QR Types - QR Code Generators', () => {
  describe('generateEmailQR()', () => {
    it('should generate mailto link with email address', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: '',
        body: '',
      })

      expect(result).toBe('mailto:test@example.com')
    })

    it('should include subject parameter if provided', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: 'Hello World',
        body: '',
      })

      expect(result).toBe('mailto:test@example.com?subject=Hello+World')
    })

    it('should include body parameter if provided', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: '',
        body: 'This is a test message',
      })

      expect(result).toBe('mailto:test@example.com?body=This+is+a+test+message')
    })

    it('should include both subject and body', () => {
      const result = generateEmailQR({
        to: 'contact@supertool.id',
        subject: 'Feedback',
        body: 'I love this tool!',
      })

      expect(result).toContain('mailto:contact@supertool.id')
      expect(result).toContain('subject=Feedback')
      expect(result).toContain('body=I+love+this+tool%21')
    })

    it('should URL encode special characters in subject', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: 'Test & Special Characters',
        body: '',
      })

      expect(result).toContain('subject=Test+%26+Special+Characters')
    })

    it('should URL encode special characters in body', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: '',
        body: 'Hello & goodbye!',
      })

      expect(result).toContain('body=Hello+%26+goodbye%21')
    })

    it('should handle empty subject and body', () => {
      const result = generateEmailQR({
        to: 'test@example.com',
        subject: '',
        body: '',
      })

      expect(result).toBe('mailto:test@example.com')
      expect(result).not.toContain('?')
    })
  })

  describe('generateSMSQR()', () => {
    it('should generate SMS link with phone and message', () => {
      const result = generateSMSQR({
        phone: '+1234567890',
        message: 'Hello',
      })

      expect(result).toBe('smsto:+1234567890:Hello')
    })

    it('should handle phone number with special characters', () => {
      const result = generateSMSQR({
        phone: '+1 (555) 123-4567',
        message: 'Test message',
      })

      expect(result).toBe('smsto:+1 (555) 123-4567:Test message')
    })

    it('should handle empty message', () => {
      const result = generateSMSQR({
        phone: '+1234567890',
        message: '',
      })

      expect(result).toBe('smsto:+1234567890:')
    })

    it('should handle message with special characters', () => {
      const result = generateSMSQR({
        phone: '+1234567890',
        message: 'Hello & goodbye!',
      })

      expect(result).toBe('smsto:+1234567890:Hello & goodbye!')
    })
  })

  describe('generatePhoneQR()', () => {
    it('should generate tel link with phone number', () => {
      const result = generatePhoneQR({ phone: '+1234567890' })

      expect(result).toBe('tel:+1234567890')
    })

    it('should preserve phone number formatting', () => {
      const result = generatePhoneQR({ phone: '+1 (555) 123-4567' })

      expect(result).toBe('tel:+1 (555) 123-4567')
    })

    it('should handle international numbers', () => {
      const result = generatePhoneQR({ phone: '+44 20 7946 0958' })

      expect(result).toBe('tel:+44 20 7946 0958')
    })

    it('should handle numbers without country code', () => {
      const result = generatePhoneQR({ phone: '555-1234' })

      expect(result).toBe('tel:555-1234')
    })
  })

  describe('generateWhatsAppQR()', () => {
    it('should generate WhatsApp link with clean phone number', () => {
      const result = generateWhatsAppQR({
        phone: '+1234567890',
        message: 'Hello',
      })

      expect(result).toBe('https://wa.me/1234567890?text=Hello')
    })

    it('should remove non-digit characters from phone', () => {
      const result = generateWhatsAppQR({
        phone: '+1 (555) 123-4567',
        message: '',
      })

      expect(result).toBe('https://wa.me/15551234567')
    })

    it('should URL encode the message', () => {
      const result = generateWhatsAppQR({
        phone: '+1234567890',
        message: 'Hello & goodbye!',
      })

      expect(result).toBe('https://wa.me/1234567890?text=Hello%20%26%20goodbye!')
    })

    it('should handle empty message', () => {
      const result = generateWhatsAppQR({
        phone: '+1234567890',
        message: '',
      })

      expect(result).toBe('https://wa.me/1234567890')
    })

    it('should handle message with emojis', () => {
      const result = generateWhatsAppQR({
        phone: '+1234567890',
        message: 'Hello 👋',
      })

      expect(result).toContain('wa.me/1234567890?text=Hello')
    })

    it('should handle international phone format', () => {
      const result = generateWhatsAppQR({
        phone: '+62 812-3456-7890',
        message: 'Test',
      })

      expect(result).toBe('https://wa.me/6281234567890?text=Test')
    })
  })

  describe('generateGeoQR()', () => {
    it('should generate geo URI with coordinates', () => {
      const result = generateGeoQR({
        latitude: '40.7128',
        longitude: '-74.0060',
      })

      expect(result).toBe('geo:40.7128,-74.0060')
    })

    it('should include label if provided', () => {
      const result = generateGeoQR({
        latitude: '40.7128',
        longitude: '-74.0060',
        label: 'New York City',
      })

      expect(result).toBe('geo:40.7128,-74.0060(New%20York%20City)')
    })

    it('should URL encode label with special characters', () => {
      const result = generateGeoQR({
        latitude: '51.5074',
        longitude: '-0.1278',
        label: 'London, UK',
      })

      expect(result).toContain('(London%2C%20UK)')
    })

    it('should handle negative coordinates', () => {
      const result = generateGeoQR({
        latitude: '-33.8688',
        longitude: '151.2093',
      })

      expect(result).toBe('geo:-33.8688,151.2093')
    })

    it('should handle coordinates with many decimal places', () => {
      const result = generateGeoQR({
        latitude: '37.7749295',
        longitude: '-122.4194155',
      })

      expect(result).toBe('geo:37.7749295,-122.4194155')
    })

    it('should handle zero coordinates', () => {
      const result = generateGeoQR({
        latitude: '0',
        longitude: '0',
      })

      expect(result).toBe('geo:0,0')
    })
  })

  describe('generateEventQR()', () => {
    const eventConfig = {
      title: 'Team Meeting',
      location: 'Conference Room A',
      startDate: '2024-12-25',
      startTime: '10:00',
      endDate: '2024-12-25',
      endTime: '11:00',
      description: 'Quarterly review meeting',
    }

    it('should generate iCalendar format', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('BEGIN:VEVENT')
      expect(result).toContain('END:VEVENT')
    })

    it('should include event title as SUMMARY', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('SUMMARY:Team Meeting')
    })

    it('should include event location', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('LOCATION:Conference Room A')
    })

    it('should include event description', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('DESCRIPTION:Quarterly review meeting')
    })

    it('should format start datetime in iCal format', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('DTSTART:')
      expect(result).toMatch(/DTSTART:\d{8}T\d{6}Z/)
    })

    it('should format end datetime in iCal format', () => {
      const result = generateEventQR(eventConfig)

      expect(result).toContain('DTEND:')
      expect(result).toMatch(/DTEND:\d{8}T\d{6}Z/)
    })

    it('should handle multi-day events', () => {
      const multiDayEvent = {
        ...eventConfig,
        startDate: '2024-12-25',
        startTime: '09:00',
        endDate: '2024-12-26',
        endTime: '17:00',
      }

      const result = generateEventQR(multiDayEvent)

      expect(result).toContain('DTSTART:')
      expect(result).toContain('DTEND:')
    })

    it('should handle events with special characters in title', () => {
      const specialEvent = {
        ...eventConfig,
        title: 'Q&A Session',
      }

      const result = generateEventQR(specialEvent)

      expect(result).toContain('SUMMARY:Q&A Session')
    })
  })

  describe('generateAppStoreQR()', () => {
    it('should generate iOS App Store link', () => {
      const result = generateAppStoreQR({
        platform: 'ios',
        appId: '123456789',
      })

      expect(result).toBe('https://apps.apple.com/app/id123456789')
    })

    it('should generate Android Play Store link', () => {
      const result = generateAppStoreQR({
        platform: 'android',
        appId: 'com.example.app',
      })

      expect(result).toBe('https://play.google.com/store/apps/details?id=com.example.app')
    })

    it('should handle iOS numeric app IDs', () => {
      const result = generateAppStoreQR({
        platform: 'ios',
        appId: '987654321',
      })

      expect(result).toContain('id987654321')
    })

    it('should handle Android package names', () => {
      const result = generateAppStoreQR({
        platform: 'android',
        appId: 'com.company.productname',
      })

      expect(result).toContain('id=com.company.productname')
    })
  })

  describe('generateSocialQR()', () => {
    it('should generate Instagram profile link', () => {
      const result = generateSocialQR({
        platform: 'instagram',
        handle: 'supertool',
      })

      expect(result).toBe('https://instagram.com/supertool')
    })

    it('should generate Twitter profile link', () => {
      const result = generateSocialQR({
        platform: 'twitter',
        handle: 'supertool',
      })

      expect(result).toBe('https://twitter.com/supertool')
    })

    it('should generate LinkedIn profile link', () => {
      const result = generateSocialQR({
        platform: 'linkedin',
        handle: 'john-doe',
      })

      expect(result).toBe('https://linkedin.com/in/john-doe')
    })

    it('should generate Facebook profile link', () => {
      const result = generateSocialQR({
        platform: 'facebook',
        handle: 'supertool',
      })

      expect(result).toBe('https://facebook.com/supertool')
    })

    it('should generate TikTok profile link', () => {
      const result = generateSocialQR({
        platform: 'tiktok',
        handle: 'supertool',
      })

      expect(result).toBe('https://tiktok.com/@supertool')
    })

    it('should generate YouTube channel link', () => {
      const result = generateSocialQR({
        platform: 'youtube',
        handle: 'supertool',
      })

      expect(result).toBe('https://youtube.com/@supertool')
    })

    it('should remove @ symbol from handle if present', () => {
      const result = generateSocialQR({
        platform: 'twitter',
        handle: '@supertool',
      })

      expect(result).toBe('https://twitter.com/supertool')
    })

    it('should handle @ symbol in Instagram handle', () => {
      const result = generateSocialQR({
        platform: 'instagram',
        handle: '@username',
      })

      expect(result).toBe('https://instagram.com/username')
    })

    it('should handle @ symbol in LinkedIn handle', () => {
      const result = generateSocialQR({
        platform: 'linkedin',
        handle: '@john-doe',
      })

      expect(result).toBe('https://linkedin.com/in/john-doe')
    })

    it('should preserve @ in TikTok URL even if removed from handle', () => {
      const result = generateSocialQR({
        platform: 'tiktok',
        handle: '@username',
      })

      expect(result).toBe('https://tiktok.com/@username')
    })

    it('should preserve @ in YouTube URL even if removed from handle', () => {
      const result = generateSocialQR({
        platform: 'youtube',
        handle: '@channel',
      })

      expect(result).toBe('https://youtube.com/@channel')
    })

    it('should handle handles with dots', () => {
      const result = generateSocialQR({
        platform: 'instagram',
        handle: 'user.name',
      })

      expect(result).toBe('https://instagram.com/user.name')
    })

    it('should handle handles with numbers', () => {
      const result = generateSocialQR({
        platform: 'twitter',
        handle: 'user123',
      })

      expect(result).toBe('https://twitter.com/user123')
    })

    it('should handle handles with underscores', () => {
      const result = generateSocialQR({
        platform: 'instagram',
        handle: 'user_name',
      })

      expect(result).toBe('https://instagram.com/user_name')
    })
  })
})
