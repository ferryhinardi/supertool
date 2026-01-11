import { describe, expect, it } from 'vitest'

import {
  getRecommendedSettings,
  parseQRData,
  type ScanResult,
  type ValidationResult,
  validateQRCode,
} from '../qr-scanner-service'

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
        const result = parseQRData('https://example.com/path?query=1')

        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe('https://example.com/path?query=1')
        expect(result.displayText).toBe('https://example.com/path?query=1')
      })

      it('should parse URLs with complex paths', () => {
        const url = 'https://api.example.com/v1/users/123?token=abc&lang=en#section'
        const result = parseQRData(url)

        expect(result.type).toBe('URL')
        expect(result.parsed.url).toBe(url)
      })
    })

    describe('WiFi detection', () => {
      it('should parse WiFi QR code with WPA encryption', () => {
        const result = parseQRData('WIFI:T:WPA;S:MyNetwork;P:MyPassword;;')

        expect(result.type).toBe('WiFi')
        expect(result.parsed.ssid).toBe('MyNetwork')
        expect(result.parsed.password).toBe('MyPassword')
        expect(result.parsed.encryption).toBe('WPA')
        expect(result.displayText).toBe('WiFi: MyNetwork')
      })

      it('should parse WiFi QR code with WPA2 encryption', () => {
        const result = parseQRData('WIFI:T:WPA2;S:SecureNetwork;P:SecretPass123;;')

        expect(result.type).toBe('WiFi')
        expect(result.parsed.ssid).toBe('SecureNetwork')
        expect(result.parsed.password).toBe('SecretPass123')
        expect(result.parsed.encryption).toBe('WPA2')
      })

      it('should parse WiFi QR code with hidden network', () => {
        const result = parseQRData('WIFI:T:WPA;S:HiddenNetwork;P:Pass123;H:true;;')

        expect(result.type).toBe('WiFi')
        expect(result.parsed.ssid).toBe('HiddenNetwork')
        expect(result.parsed.hidden).toBe('true')
      })

      it('should parse open WiFi network (no password)', () => {
        const result = parseQRData('WIFI:T:nopass;S:FreeWiFi;P:;;')

        expect(result.type).toBe('WiFi')
        expect(result.parsed.ssid).toBe('FreeWiFi')
        expect(result.parsed.encryption).toBe('nopass')
      })

      it('should handle WiFi without SSID gracefully', () => {
        const result = parseQRData('WIFI:T:WPA;P:Password;;')

        expect(result.type).toBe('WiFi')
        expect(result.displayText).toBe('WiFi: Unknown Network')
      })
    })

    describe('vCard detection', () => {
      it('should parse basic vCard', () => {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
END:VCARD`
        const result = parseQRData(vcard)

        expect(result.type).toBe('vCard')
        expect(result.parsed.name).toBe('John Doe')
        expect(result.displayText).toBe('Contact: John Doe')
      })

      it('should parse vCard with full contact information', () => {
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Acme Corp
TEL:+1234567890
EMAIL:jane@example.com
URL:https://example.com
ADR:123 Main St
END:VCARD`
        const result = parseQRData(vcard)

        expect(result.type).toBe('vCard')
        expect(result.parsed.name).toBe('Jane Smith')
        expect(result.parsed.organization).toBe('Acme Corp')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.parsed.email).toBe('jane@example.com')
        expect(result.parsed.url).toBe('https://example.com')
        expect(result.parsed.address).toBe('123 Main St')
      })

      it('should handle vCard without name gracefully', () => {
        const vcard = `BEGIN:VCARD
VERSION:3.0
TEL:+1234567890
END:VCARD`
        const result = parseQRData(vcard)

        expect(result.type).toBe('vCard')
        expect(result.displayText).toBe('Contact: Unknown')
      })
    })

    describe('Email detection', () => {
      it('should parse mailto: links', () => {
        const result = parseQRData('mailto:test@example.com')

        expect(result.type).toBe('Email')
        expect(result.parsed.email).toBe('test@example.com')
        expect(result.displayText).toBe('test@example.com')
      })

      it('should parse complex mailto: links', () => {
        const result = parseQRData('mailto:support@company.co.uk')

        expect(result.type).toBe('Email')
        expect(result.parsed.email).toBe('support@company.co.uk')
      })
    })

    describe('Phone detection', () => {
      it('should parse tel: links', () => {
        const result = parseQRData('tel:+1234567890')

        expect(result.type).toBe('Phone')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.displayText).toBe('+1234567890')
      })

      it('should parse phone numbers with dashes', () => {
        const result = parseQRData('tel:+1-555-123-4567')

        expect(result.type).toBe('Phone')
        expect(result.parsed.phone).toBe('+1-555-123-4567')
      })
    })

    describe('SMS detection', () => {
      it('should parse sms: links', () => {
        const result = parseQRData('sms:+1234567890')

        expect(result.type).toBe('SMS')
        expect(result.parsed.phone).toBe('+1234567890')
        expect(result.displayText).toBe('+1234567890')
      })

      it('should parse smsto: links', () => {
        const result = parseQRData('smsto:+1234567890')

        expect(result.type).toBe('SMS')
        expect(result.parsed.phone).toBe('+1234567890')
      })
    })

    describe('Plain text detection', () => {
      it('should parse plain text as Text type', () => {
        const result = parseQRData('Hello, World!')

        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('Hello, World!')
        expect(result.displayText).toBe('Hello, World!')
      })

      it('should handle empty string', () => {
        const result = parseQRData('')

        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('')
      })

      it('should handle multi-line text', () => {
        const text = `Line 1
Line 2
Line 3`
        const result = parseQRData(text)

        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe(text)
      })

      it('should not misidentify text starting with "http" (no ://)', () => {
        const result = parseQRData('http-server is a tool')

        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('http-server is a tool')
      })

      it('should not misidentify text starting with "wifi"', () => {
        const result = parseQRData('wifi password is 12345')

        expect(result.type).toBe('Text')
        expect(result.parsed.text).toBe('wifi password is 12345')
      })
    })
  })

  describe('getRecommendedSettings', () => {
    it('should return settings for business-card use case', () => {
      const result = getRecommendedSettings('business-card')

      expect(result.size).toBe(300)
      expect(result.errorCorrection).toBe('H')
      expect(result.description).toContain('Business cards')
    })

    it('should return settings for poster use case', () => {
      const result = getRecommendedSettings('poster')

      expect(result.size).toBe(512)
      expect(result.errorCorrection).toBe('M')
      expect(result.description).toContain('Posters')
    })

    it('should return settings for product-label use case', () => {
      const result = getRecommendedSettings('product-label')

      expect(result.size).toBe(256)
      expect(result.errorCorrection).toBe('Q')
      expect(result.description).toContain('Product labels')
    })

    it('should return settings for digital use case', () => {
      const result = getRecommendedSettings('digital')

      expect(result.size).toBe(256)
      expect(result.errorCorrection).toBe('M')
      expect(result.description).toContain('Digital displays')
    })

    it('should return settings for outdoor use case', () => {
      const result = getRecommendedSettings('outdoor')

      expect(result.size).toBe(384)
      expect(result.errorCorrection).toBe('H')
      expect(result.description).toContain('Outdoor')
    })

    it('should return default settings for unknown use case', () => {
      const result = getRecommendedSettings('unknown')

      expect(result.size).toBe(256)
      expect(result.errorCorrection).toBe('M')
      expect(result.description).toContain('General purpose')
    })

    it('should return default settings for empty string', () => {
      const result = getRecommendedSettings('')

      expect(result.size).toBe(256)
      expect(result.errorCorrection).toBe('M')
    })
  })

  describe('validateQRCode', () => {
    // Helper to create mock SVG element
    function createMockSVG(options: {
      width: number
      height: number
      fgColor?: string
      bgColor?: string
    }): SVGSVGElement {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

      // Mock width and height baseVal
      Object.defineProperty(svg, 'width', {
        value: { baseVal: { value: options.width } },
        writable: false,
      })
      Object.defineProperty(svg, 'height', {
        value: { baseVal: { value: options.height } },
        writable: false,
      })

      // Add background rect if bgColor is specified
      if (options.bgColor) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rect.setAttribute('fill', options.bgColor)
        svg.appendChild(rect)
      }

      // Add path element if fgColor is specified
      if (options.fgColor) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('fill', options.fgColor)
        svg.appendChild(path)
      }

      return svg
    }

    // Helper to create mock Canvas element
    function createMockCanvas(width: number, height: number): HTMLCanvasElement {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      return canvas
    }

    describe('size validation', () => {
      it('should pass validation for QR code with appropriate size (200px+)', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasAppropriateSize).toBe(true)
        expect(result.issues.some((issue) => /too small/i.test(issue))).toBe(false)
      })

      it('should fail validation for QR code that is too small', () => {
        const svg = createMockSVG({
          width: 150,
          height: 150,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasAppropriateSize).toBe(false)
        expect(result.issues.some((issue) => /too small/i.test(issue))).toBe(true)
        expect(result.score).toBeLessThan(100)
      })

      it('should validate canvas elements', () => {
        const canvas = createMockCanvas(300, 300)
        const result = validateQRCode(canvas)

        expect(result.details.hasAppropriateSize).toBe(true)
      })

      it('should fail validation for small canvas', () => {
        const canvas = createMockCanvas(100, 100)
        const result = validateQRCode(canvas)

        expect(result.details.hasAppropriateSize).toBe(false)
      })
    })

    describe('contrast validation', () => {
      it('should pass contrast check for black on white', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasGoodContrast).toBe(true)
      })

      it('should pass contrast check for dark blue on white', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#000080',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasGoodContrast).toBe(true)
      })

      it('should fail contrast check for similar colors', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#808080',
          bgColor: '#A0A0A0',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasGoodContrast).toBe(false)
        expect(result.issues.some((issue) => /contrast/i.test(issue))).toBe(true)
        expect(result.score).toBeLessThan(100)
      })

      it('should fail contrast check for light colors on light background', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#DDDDDD',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasGoodContrast).toBe(false)
      })
    })

    describe('estimated scan distance', () => {
      it('should estimate up to 10 feet for 512px+ QR codes', () => {
        const svg = createMockSVG({
          width: 512,
          height: 512,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.estimatedScanDistance).toContain('10 feet')
      })

      it('should estimate up to 6 feet for 384px+ QR codes', () => {
        const svg = createMockSVG({
          width: 400,
          height: 400,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.estimatedScanDistance).toContain('6 feet')
      })

      it('should estimate up to 3 feet for 256px+ QR codes', () => {
        const svg = createMockSVG({
          width: 280,
          height: 280,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.estimatedScanDistance).toContain('3 feet')
      })

      it('should estimate up to 1.5 feet for 128px+ QR codes', () => {
        const svg = createMockSVG({
          width: 200,
          height: 200,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.estimatedScanDistance).toContain('1.5 feet')
      })

      it('should indicate very close range for small QR codes', () => {
        const svg = createMockSVG({
          width: 100,
          height: 100,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.estimatedScanDistance).toContain('Very close range')
        expect(result.issues.some((issue) => /too small for practical/i.test(issue))).toBe(true)
      })
    })

    describe('score and validity', () => {
      it('should return score of 100 for perfect QR code', () => {
        const svg = createMockSVG({
          width: 300,
          height: 300,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.score).toBe(100)
        expect(result.isValid).toBe(true)
        expect(result.recommendations.some((rec) => /looks great/i.test(rec))).toBe(true)
      })

      it('should reduce score for small size', () => {
        const svg = createMockSVG({
          width: 180,
          height: 180,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.score).toBeLessThan(100)
      })

      it('should reduce score for poor contrast', () => {
        const svg = createMockSVG({
          width: 300,
          height: 300,
          fgColor: '#888888',
          bgColor: '#999999',
        })
        const result = validateQRCode(svg)

        expect(result.score).toBeLessThan(100)
      })

      it('should mark QR code as invalid when score is below 60', () => {
        // Very small and poor contrast
        const svg = createMockSVG({ width: 80, height: 80, fgColor: '#777777', bgColor: '#888888' })
        const result = validateQRCode(svg)

        expect(result.score).toBeLessThan(60)
        expect(result.isValid).toBe(false)
      })

      it('should provide recommendations for imperfect QR codes', () => {
        const svg = createMockSVG({
          width: 180,
          height: 180,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.recommendations.length).toBeGreaterThan(0)
        expect(result.recommendations.some((rec) => /test|multiple devices/i.test(rec))).toBe(true)
      })
    })

    describe('error correction', () => {
      it('should always indicate error correction is present', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasErrorCorrection).toBe(true)
      })

      it('should always indicate valid content', () => {
        const svg = createMockSVG({
          width: 256,
          height: 256,
          fgColor: '#000000',
          bgColor: '#FFFFFF',
        })
        const result = validateQRCode(svg)

        expect(result.details.hasValidContent).toBe(true)
      })
    })
  })

  describe('types', () => {
    it('should have correct ScanResult type structure', () => {
      const scanResult: ScanResult = {
        data: 'test data',
        timestamp: Date.now(),
        format: 'QR_CODE',
        type: 'webcam',
      }

      expect(scanResult.data).toBe('test data')
      expect(scanResult.timestamp).toBeDefined()
      expect(scanResult.format).toBe('QR_CODE')
      expect(scanResult.type).toBe('webcam')
    })

    it('should allow ScanResult without optional fields', () => {
      const scanResult: ScanResult = {
        data: 'test data',
        timestamp: Date.now(),
      }

      expect(scanResult.data).toBe('test data')
      expect(scanResult.format).toBeUndefined()
      expect(scanResult.type).toBeUndefined()
    })

    it('should have correct ValidationResult type structure', () => {
      const validationResult: ValidationResult = {
        isValid: true,
        score: 85,
        issues: ['Issue 1'],
        recommendations: ['Recommendation 1'],
        details: {
          hasValidContent: true,
          hasGoodContrast: true,
          hasAppropriateSize: true,
          hasErrorCorrection: true,
          estimatedScanDistance: '3 feet',
        },
      }

      expect(validationResult.isValid).toBe(true)
      expect(validationResult.score).toBe(85)
      expect(validationResult.issues).toHaveLength(1)
      expect(validationResult.recommendations).toHaveLength(1)
      expect(validationResult.details.hasValidContent).toBe(true)
    })
  })
})
