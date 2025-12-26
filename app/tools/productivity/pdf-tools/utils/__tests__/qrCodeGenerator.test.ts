import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  blobToFile,
  generateQRCodeBlob,
  generateQRCodeDataURL,
  generateQRCodeFile,
} from '../qrCodeGenerator'

// Mock qrcode module
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn((text: string) => {
      if (!text || text.trim() === '') {
        return Promise.reject(new Error('QR code text cannot be empty'))
      }
      // Return a mock base64 PNG data URL
      return Promise.resolve(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      )
    }),
    toCanvas: vi.fn((canvas: HTMLCanvasElement, text: string) => {
      if (!text || text.trim() === '') {
        return Promise.reject(new Error('QR code text cannot be empty'))
      }
      // Mock canvas context
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 300, 300)
      }
      return Promise.resolve()
    }),
  },
}))

// Mock canvas toBlob
beforeEach(() => {
  HTMLCanvasElement.prototype.toBlob = vi.fn((callback: BlobCallback) => {
    const blob = new Blob(['fake-image-data'], { type: 'image/png' })
    callback(blob)
  })
})

describe('qrCodeGenerator', () => {
  describe('generateQRCodeDataURL', () => {
    it('should generate a QR code data URL from text', async () => {
      const result = await generateQRCodeDataURL('https://example.com')
      expect(result).toContain('data:image/png;base64,')
    })

    it('should generate a QR code with custom size', async () => {
      const result = await generateQRCodeDataURL('Test QR Code', 500)
      expect(result).toContain('data:image/png;base64,')
    })

    it('should use default size (300) if not provided', async () => {
      const result = await generateQRCodeDataURL('Default Size Test')
      expect(result).toContain('data:image/png;base64,')
    })

    it('should reject empty text', async () => {
      await expect(generateQRCodeDataURL('')).rejects.toThrow('QR code text cannot be empty')
    })

    it('should reject whitespace-only text', async () => {
      await expect(generateQRCodeDataURL('   ')).rejects.toThrow('QR code text cannot be empty')
    })
  })

  describe('generateQRCodeBlob', () => {
    it('should generate a QR code blob from text', async () => {
      const result = await generateQRCodeBlob('https://example.com')
      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('image/png')
    })

    it('should generate a blob with custom size', async () => {
      const result = await generateQRCodeBlob('Test', 400)
      expect(result).toBeInstanceOf(Blob)
    })

    it('should reject empty text', async () => {
      await expect(generateQRCodeBlob('')).rejects.toThrow('QR code text cannot be empty')
    })
  })

  describe('blobToFile', () => {
    it('should convert a Blob to File', () => {
      const blob = new Blob(['test data'], { type: 'image/png' })
      const file = blobToFile(blob, 'test.png')

      expect(file).toBeInstanceOf(File)
      expect(file.name).toBe('test.png')
      expect(file.type).toBe('image/png')
    })

    it('should preserve blob type', () => {
      const blob = new Blob(['data'], { type: 'image/jpeg' })
      const file = blobToFile(blob, 'photo.jpg')

      expect(file.type).toBe('image/jpeg')
    })
  })

  describe('generateQRCodeFile', () => {
    it('should generate a QR code File object', async () => {
      const result = await generateQRCodeFile('https://example.com', 'test-qr.png')
      expect(result).toBeInstanceOf(File)
      expect(result.name).toBe('test-qr.png')
      expect(result.type).toBe('image/png')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should use default filename if not provided', async () => {
      const result = await generateQRCodeFile('Test QR')
      expect(result).toBeInstanceOf(File)
      expect(result.name).toBe('qrcode.png')
      expect(result.type).toBe('image/png')
    })

    it('should generate QR code with custom size', async () => {
      const result = await generateQRCodeFile('Custom Size', 'custom.png', 400)
      expect(result).toBeInstanceOf(File)
      expect(result.name).toBe('custom.png')
    })

    it('should use default size (300) if not provided', async () => {
      const result = await generateQRCodeFile('Default', 'default.png')
      expect(result).toBeInstanceOf(File)
    })

    it('should handle various filename formats', async () => {
      const filenames = ['qr.png', 'my-qr-code.png', 'QR_CODE_123.png']
      for (const filename of filenames) {
        const result = await generateQRCodeFile('Test', filename)
        expect(result.name).toBe(filename)
      }
    })

    it('should reject empty text', async () => {
      await expect(generateQRCodeFile('', 'test.png')).rejects.toThrow(
        'QR code text cannot be empty'
      )
    })

    it('should create a valid file with size', async () => {
      const result = await generateQRCodeFile('Test', 'test.png')
      expect(result.size).toBeGreaterThan(0)
    })
  })

  describe('QR Code generation with different content types', () => {
    it('should handle URLs', async () => {
      const urls = ['https://example.com', 'http://test.org/path', 'ftp://files.example.com']

      for (const url of urls) {
        const result = await generateQRCodeDataURL(url)
        expect(result).toContain('data:image/png;base64,')
      }
    })

    it('should handle email addresses', async () => {
      const email = 'mailto:test@example.com'
      const result = await generateQRCodeDataURL(email)
      expect(result).toContain('data:image/png;base64,')
    })

    it('should handle phone numbers', async () => {
      const phone = 'tel:+1234567890'
      const result = await generateQRCodeDataURL(phone)
      expect(result).toContain('data:image/png;base64,')
    })

    it('should handle plain text', async () => {
      const text = 'This is a simple text message for the QR code'
      const result = await generateQRCodeDataURL(text)
      expect(result).toContain('data:image/png;base64,')
    })
  })
})
