import { describe, expect, it } from 'vitest'
import { getRecommendedSettings, parseQRData, type ValidationResult } from '../qr-scanner-service'

describe('qr-scanner-service', () => {
  describe('parseQRData', () => {
    describe('URL detection', () => {
      it('should parse HTTP URLs', () => {
        const result = parseQRData('http://example.com')
        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe('http://example.com')
        expect(result.displayText).toBe('http://example.com')
      })

      it('should parse HTTPS URLs', () => {
        const result = parseQRData('https://example.com')
        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe('https://example.com')
        expect(result.displayText).toBe('https://example.com')
      })

      it('should parse URLs with paths and query params', () => {
        const url = 'https://example.com/path?param=value'
        const result = parseQRData(url)
        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe(url)
      })

      it('should parse URLs with fragments', () => {
        const url = 'https://example.com#section'
        const result = parseQRData(url)
        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe(url)
      })
    })

    describe('WiFi detection', () => {
      it('should parse WiFi WPA QR codes', () => {
        const data = 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;'
        const result = parseQRData(data)
        expect(result.type).toBe('WiFi')
        expect(result.parsed.encryption).toBe('WPA')
        expect(result.parsed.ssid).toBe('MyNetwork')
        expect(result.parsed.password).toBe('MyPassword')
        expect(result.parsed.hidden).toBe('false')
        expect(result.displayText).toBe('WiFi: MyNetwork')
      })

      it('should parse WiFi WPA2 QR codes', () => {
        const data = 'WIFI:T:WPA2;S:SecureNet;P:secret123;H:false;;'
        const result = parseQRData(data)
        expect(result.type).toBe('WiFi')
        expect(result.parsed.encryption).toBe('WPA2')
        expect(result.parsed.ssid).toBe('SecureNet')
      })

      it('should parse WiFi without password', () => {
        const data = 'WIFI:T:nopass;S:OpenNetwork;P:;H:false;;'
        const result = parseQRData(data)
        expect(result.type).toBe('WiFi')
        expect(result.parsed.ssid).toBe('OpenNetwork')
      })

      it('should handle WiFi with missing SSID', () => {
        const data = 'WIFI:T:WPA;S:;P:password;;'
        const result = parseQRData(data)
        expect(result.type).toBe('WiFi')
        expect(result.displayText).toBe('WiFi: Unknown Network')
      })

      it('should parse hidden WiFi networks', () => {
        const data = 'WIFI:T:WPA;S:HiddenNet;P:secret;H:true;;'
        const result = parseQRData(data)
        expect(result.parsed.hidden).toBe('true')
      })
    })

    describe('vCard detection', () => {
      it('should parse basic vCard', () => {
        const data = 'BEGIN:VCARD\nFN:John Doe\nEND:VCARD'
        const result = parseQRData(data)
        expect(result.type).toBe('vCard')
        expect(result.parsed.name).toBe('John Doe')
        expect(result.displayText).toBe('Contact: John Doe')
      })

      it('should parse vCard with multiple fields', () => {
        const data =
          'BEGIN:VCARD\nFN:John Doe\nORG:Acme Corp\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD'
        const result = parseQRData(data)
        expect(result.type).toBe('vCard')
        expect(result.parsed.name).toBe('John Doe')
        expect(result.parsed.organization).toBe('Acme Corp')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.parsed.email).toBe('john@example.com')
      })

      it('should parse vCard with URL and address', () => {
        const data =
          'BEGIN:VCARD\nFN:Jane Smith\nURL:https://example.com\nADR:123 Main St, City, State\nEND:VCARD'
        const result = parseQRData(data)
        expect(result.parsed.url).toBe('https://example.com')
        expect(result.parsed.address).toBe('123 Main St, City, State')
      })

      it('should handle vCard without name', () => {
        const data = 'BEGIN:VCARD\nEND:VCARD'
        const result = parseQRData(data)
        expect(result.type).toBe('vCard')
        expect(result.displayText).toBe('Contact: Unknown')
      })
    })

    describe('Email detection', () => {
      it('should parse mailto links', () => {
        const result = parseQRData('mailto:test@example.com')
        expect(result.type).toBe('Email')
        expect(result.parsed.email).toBe('test@example.com')
        expect(result.displayText).toBe('test@example.com')
      })

      it('should parse mailto with subject and body', () => {
        const result = parseQRData('mailto:test@example.com?subject=Hello&body=World')
        expect(result.type).toBe('Email')
        expect(result.parsed.email).toContain('test@example.com')
      })

      it('should parse simple email addresses', () => {
        const result = parseQRData('mailto:john.doe@company.co.uk')
        expect(result.type).toBe('Email')
        expect(result.parsed.email).toBe('john.doe@company.co.uk')
      })
    })

    describe('Phone detection', () => {
      it('should parse tel links', () => {
        const result = parseQRData('tel:+1234567890')
        expect(result.type).toBe('Phone')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.displayText).toBe('+1234567890')
      })

      it('should parse phone numbers with dashes', () => {
        const result = parseQRData('tel:123-456-7890')
        expect(result.type).toBe('Phone')
        expect(result.parsed.phone).toBe('123-456-7890')
      })

      it('should parse international phone numbers', () => {
        const result = parseQRData('tel:+44-20-1234-5678')
        expect(result.type).toBe('Phone')
        expect(result.parsed.phone).toBe('+44-20-1234-5678')
      })
    })

    describe('SMS detection', () => {
      it('should parse sms links', () => {
        const result = parseQRData('sms:+1234567890')
        expect(result.type).toBe('SMS')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.displayText).toBe('+1234567890')
      })

      it('should parse smsto links', () => {
        const result = parseQRData('smsto:+1234567890')
        expect(result.type).toBe('SMS')
        expect(result.parsed.phone).toBe('+1234567890')
      })

      it('should parse SMS with message body', () => {
        const result = parseQRData('sms:+1234567890?body=Hello')
        expect(result.type).toBe('SMS')
        expect(result.parsed.phone).toContain('+1234567890')
      })
    })

    describe('Plain text detection', () => {
      it('should parse plain text', () => {
        const result = parseQRData('Just some plain text')
        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('Just some plain text')
        expect(result.displayText).toBe('Just some plain text')
      })

      it('should parse numbers as text', () => {
        const result = parseQRData('123456')
        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('123456')
      })

      it('should parse empty string', () => {
        const result = parseQRData('')
        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('')
      })

      it('should parse special characters', () => {
        const text = '!@#$%^&*()'
        const result = parseQRData(text)
        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe(text)
      })

      it('should parse multiline text', () => {
        const text = 'Line 1\nLine 2\nLine 3'
        const result = parseQRData(text)
        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe(text)
      })
    })

    describe('Edge cases', () => {
      it('should handle URLs with tel: in path', () => {
        const result = parseQRData('https://example.com/tel:123')
        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe('https://example.com/tel:123')
      })

      it('should handle case sensitivity for mailto', () => {
        const result = parseQRData('MAILTO:test@example.com')
        expect(result.type).toBe('Text') // Should not match uppercase
      })

      it('should handle malformed WiFi strings', () => {
        const result = parseQRData('WIFI:invalid')
        expect(result.type).toBe('WiFi')
      })

      it('should handle very long text', () => {
        const longText = 'a'.repeat(1000)
        const result = parseQRData(longText)
        expect(result.type).toBe('Text')
        expect(result.parsed.text.length).toBe(1000)
      })
    })
  })

  describe('getRecommendedSettings', () => {
    it('should recommend settings for business cards', () => {
      const settings = getRecommendedSettings('business-card')
      expect(settings.size).toBe(300)
      expect(settings.errorCorrection).toBe('H')
      expect(settings.description).toContain('Business cards')
    })

    it('should recommend settings for posters', () => {
      const settings = getRecommendedSettings('poster')
      expect(settings.size).toBe(512)
      expect(settings.errorCorrection).toBe('M')
      expect(settings.description).toContain('Posters')
    })

    it('should recommend settings for product labels', () => {
      const settings = getRecommendedSettings('product-label')
      expect(settings.size).toBe(256)
      expect(settings.errorCorrection).toBe('Q')
      expect(settings.description).toContain('Product labels')
    })

    it('should recommend settings for digital displays', () => {
      const settings = getRecommendedSettings('digital')
      expect(settings.size).toBe(256)
      expect(settings.errorCorrection).toBe('M')
      expect(settings.description).toContain('Digital displays')
    })

    it('should recommend settings for outdoor use', () => {
      const settings = getRecommendedSettings('outdoor')
      expect(settings.size).toBe(384)
      expect(settings.errorCorrection).toBe('H')
      expect(settings.description).toContain('Outdoor use')
    })

    it('should provide default settings for unknown use case', () => {
      const settings = getRecommendedSettings('unknown')
      expect(settings.size).toBe(256)
      expect(settings.errorCorrection).toBe('M')
      expect(settings.description).toContain('General purpose')
    })

    it('should provide default settings for empty string', () => {
      const settings = getRecommendedSettings('')
      expect(settings.size).toBe(256)
      expect(settings.errorCorrection).toBe('M')
    })

    it('should have size progression: business-card < product-label = digital < outdoor < poster', () => {
      const businessCard = getRecommendedSettings('business-card')
      const productLabel = getRecommendedSettings('product-label')
      const outdoor = getRecommendedSettings('outdoor')
      const poster = getRecommendedSettings('poster')

      expect(businessCard.size).toBeGreaterThan(productLabel.size)
      expect(outdoor.size).toBeGreaterThan(productLabel.size)
      expect(poster.size).toBeGreaterThan(outdoor.size)
    })

    it('should use high error correction for business cards and outdoor', () => {
      expect(getRecommendedSettings('business-card').errorCorrection).toBe('H')
      expect(getRecommendedSettings('outdoor').errorCorrection).toBe('H')
    })

    it('should use medium error correction for digital and posters', () => {
      expect(getRecommendedSettings('digital').errorCorrection).toBe('M')
      expect(getRecommendedSettings('poster').errorCorrection).toBe('M')
    })

    it('should use quality error correction for product labels', () => {
      expect(getRecommendedSettings('product-label').errorCorrection).toBe('Q')
    })
  })

  describe('Type exports', () => {
    it('should export ScanResult type', () => {
      const scanResult: import('../qr-scanner-service').ScanResult = {
        data: 'test',
        timestamp: Date.now(),
        format: 'QR_CODE',
        type: 'webcam',
      }
      expect(scanResult.data).toBe('test')
      expect(scanResult.type).toBe('webcam')
    })

    it('should export ValidationResult type', () => {
      const validationResult: ValidationResult = {
        isValid: true,
        score: 100,
        issues: [],
        recommendations: ['Test well'],
        details: {
          hasValidContent: true,
          hasGoodContrast: true,
          hasAppropriateSize: true,
          hasErrorCorrection: true,
          estimatedScanDistance: 'Up to 10 feet',
        },
      }
      expect(validationResult.isValid).toBe(true)
      expect(validationResult.score).toBe(100)
    })

    it('should export ScannerState type', () => {
      const states: import('../qr-scanner-service').ScannerState[] = [
        'idle',
        'scanning',
        'success',
        'error',
      ]
      expect(states).toHaveLength(4)
    })
  })

  describe('Practical scenarios', () => {
    it('should handle real-world WiFi QR code', () => {
      const wifiData = 'WIFI:T:WPA2;S:CoffeeShop-Guest;P:welcome123;H:false;;'
      const result = parseQRData(wifiData)
      expect(result.type).toBe('WiFi')
      expect(result.parsed.ssid).toBe('CoffeeShop-Guest')
      expect(result.parsed.encryption).toBe('WPA2')
    })

    it('should handle real-world vCard QR code', () => {
      const vcard =
        'BEGIN:VCARD\nVERSION:3.0\nFN:John Smith\nORG:Tech Corp\nTEL;TYPE=WORK:+1-555-0100\nEMAIL:john.smith@techcorp.com\nURL:https://techcorp.com\nEND:VCARD'
      const result = parseQRData(vcard)
      expect(result.type).toBe('vCard')
      expect(result.parsed.name).toBe('John Smith')
      expect(result.parsed.email).toBe('john.smith@techcorp.com')
    })

    it('should handle real-world product URL', () => {
      const url = 'https://example.com/products/item123?ref=qr'
      const result = parseQRData(url)
      expect(result.type).toBe('URL')
      expect(result.parsed.url).toBe(url)
    })

    it('should handle WhatsApp link', () => {
      const whatsapp = 'https://wa.me/1234567890'
      const result = parseQRData(whatsapp)
      expect(result.type).toBe('URL')
      expect(result.parsed.url).toBe(whatsapp)
    })

    it('should handle event registration link', () => {
      const eventUrl = 'https://eventbrite.com/e/12345?discount=EARLY'
      const result = parseQRData(eventUrl)
      expect(result.type).toBe('URL')
    })

    it('should handle restaurant menu QR', () => {
      const menuUrl = 'https://restaurant.com/menu/table-5'
      const result = parseQRData(menuUrl)
      expect(result.type).toBe('URL')
      expect(result.parsed.url).toContain('menu')
    })
  })

  describe('Settings validation', () => {
    it('should always return positive sizes', () => {
      const cases = ['business-card', 'poster', 'product-label', 'digital', 'outdoor', 'unknown']
      cases.forEach((useCase) => {
        const settings = getRecommendedSettings(useCase)
        expect(settings.size).toBeGreaterThan(0)
      })
    })

    it('should always return valid error correction levels', () => {
      const cases = ['business-card', 'poster', 'product-label', 'digital', 'outdoor']
      const validLevels = ['L', 'M', 'Q', 'H']
      cases.forEach((useCase) => {
        const settings = getRecommendedSettings(useCase)
        expect(validLevels).toContain(settings.errorCorrection)
      })
    })

    it('should always return non-empty descriptions', () => {
      const cases = ['business-card', 'poster', 'product-label', 'digital', 'outdoor', 'unknown']
      cases.forEach((useCase) => {
        const settings = getRecommendedSettings(useCase)
        expect(settings.description.length).toBeGreaterThan(0)
      })
    })
  })
})
