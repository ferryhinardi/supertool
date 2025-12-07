import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ExportFormat,
  type ExportMetadata,
  estimateFileSize,
  getRecommendedDPI,
} from '../qr-export-service'

describe('qr-export-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecommendedDPI', () => {
    it('should return 72 DPI for screen use', () => {
      expect(getRecommendedDPI('screen')).toBe(72)
    })

    it('should return 150 DPI for print draft', () => {
      expect(getRecommendedDPI('print-draft')).toBe(150)
    })

    it('should return 300 DPI for print quality', () => {
      expect(getRecommendedDPI('print-quality')).toBe(300)
    })

    it('should return 600 DPI for print pro', () => {
      expect(getRecommendedDPI('print-pro')).toBe(600)
    })

    it('should return 300 DPI as default for unknown use case', () => {
      expect(getRecommendedDPI('unknown' as any)).toBe(300)
    })
  })

  describe('estimateFileSize', () => {
    describe('PNG format', () => {
      it('should estimate file size for 256px PNG at 72 DPI', () => {
        const result = estimateFileSize(256, 'png', 72)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should estimate file size for 256px PNG at 300 DPI', () => {
        const result = estimateFileSize(256, 'png', 300)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should estimate larger size for higher DPI', () => {
        const size72 = estimateFileSize(256, 'png', 72)
        const size300 = estimateFileSize(256, 'png', 300)
        expect(size300.value).toBeGreaterThan(size72.value)
      })

      it('should handle small PNG file size in bytes', () => {
        const result = estimateFileSize(10, 'png', 72)
        expect(result.unit).toBe('B')
        expect(result.value).toBeGreaterThan(0)
      })
    })

    describe('JPEG format', () => {
      it('should estimate file size for JPEG', () => {
        const result = estimateFileSize(256, 'jpeg', 300)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should estimate smaller size for JPEG than PNG', () => {
        const pngSize = estimateFileSize(256, 'png', 300)
        const jpegSize = estimateFileSize(256, 'jpeg', 300)
        expect(jpegSize.value).toBeLessThan(pngSize.value)
      })

      it('should handle high DPI JPEG', () => {
        const result = estimateFileSize(512, 'jpeg', 600)
        expect(result.unit).toMatch(/KB|MB/)
        expect(result.value).toBeGreaterThan(0)
      })
    })

    describe('WebP format', () => {
      it('should estimate file size for WebP', () => {
        const result = estimateFileSize(256, 'webp', 300)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should estimate smallest size for WebP compared to PNG and JPEG', () => {
        const pngSize = estimateFileSize(256, 'png', 300)
        const jpegSize = estimateFileSize(256, 'jpeg', 300)
        const webpSize = estimateFileSize(256, 'webp', 300)
        expect(webpSize.value).toBeLessThan(jpegSize.value)
        expect(webpSize.value).toBeLessThan(pngSize.value)
      })
    })

    describe('SVG format', () => {
      it('should estimate file size for SVG', () => {
        const result = estimateFileSize(256, 'svg', 72)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should not be affected by DPI for SVG', () => {
        const size72 = estimateFileSize(256, 'svg', 72)
        const size300 = estimateFileSize(256, 'svg', 300)
        expect(size72.value).toBe(size300.value)
      })

      it('should estimate very small size for small SVG', () => {
        const result = estimateFileSize(50, 'svg', 72)
        expect(result.unit).toBe('KB')
        expect(result.value).toBeLessThan(10)
      })
    })

    describe('PDF format', () => {
      it('should estimate file size for PDF', () => {
        const result = estimateFileSize(256, 'pdf', 300)
        expect(result.unit).toMatch(/KB|MB/)
        expect(result.value).toBeGreaterThan(0)
      })

      it('should include PDF overhead in estimation', () => {
        const result = estimateFileSize(100, 'pdf', 72)
        // PDF should have base overhead of ~50KB
        expect(result.value).toBeGreaterThan(40)
      })

      it('should estimate large size for high DPI PDF', () => {
        const result = estimateFileSize(512, 'pdf', 600)
        expect(result.unit).toBe('MB')
        expect(result.value).toBeGreaterThan(0)
      })
    })

    describe('File size units', () => {
      it('should return bytes for very small files', () => {
        const result = estimateFileSize(10, 'svg', 72)
        expect(result.unit).toBe('B')
        expect(result.value).toBeLessThan(1024)
      })

      it('should return KB for medium files', () => {
        const result = estimateFileSize(256, 'png', 72)
        expect(result.unit).toBe('KB')
      })

      it('should return MB for large files', () => {
        const result = estimateFileSize(1024, 'png', 600)
        expect(result.unit).toBe('MB')
      })
    })

    describe('Edge cases', () => {
      it('should handle size of 0', () => {
        const result = estimateFileSize(0, 'png', 300)
        expect(result.value).toBe(0)
        expect(result.unit).toBe('B')
      })

      it('should handle size of 1', () => {
        const result = estimateFileSize(1, 'png', 300)
        expect(result.value).toBeGreaterThanOrEqual(0)
      })

      it('should handle very large sizes', () => {
        const result = estimateFileSize(4096, 'png', 600)
        expect(result.unit).toBe('MB')
        expect(result.value).toBeGreaterThan(0)
      })

      it('should handle minimum DPI', () => {
        const result = estimateFileSize(256, 'png', 1)
        expect(result.value).toBeGreaterThan(0)
      })

      it('should handle maximum practical DPI', () => {
        const result = estimateFileSize(256, 'png', 1200)
        expect(result.unit).toMatch(/KB|MB/)
        expect(result.value).toBeGreaterThan(0)
      })
    })
  })

  describe('Type exports', () => {
    it('should export ExportFormat type', () => {
      const formats: ExportFormat[] = ['png', 'svg', 'pdf', 'webp', 'jpeg']
      expect(formats).toHaveLength(5)
    })

    it('should export ExportMetadata type', () => {
      const metadata: ExportMetadata = {
        title: 'Test QR',
        description: 'Test description',
        url: 'https://example.com',
        createdAt: '2024-01-01',
        qrType: 'url',
      }
      expect(metadata.title).toBe('Test QR')
      expect(metadata.url).toBe('https://example.com')
    })

    it('should allow partial ExportMetadata', () => {
      const metadata: ExportMetadata = {
        title: 'Test',
      }
      expect(metadata.title).toBe('Test')
      expect(metadata.description).toBeUndefined()
    })

    it('should allow empty ExportMetadata', () => {
      const metadata: ExportMetadata = {}
      expect(Object.keys(metadata)).toHaveLength(0)
    })
  })

  describe('Format comparison', () => {
    it('should show format size ranking based on compression', () => {
      const size = 512
      const dpi = 300

      const webp = estimateFileSize(size, 'webp', dpi)
      const jpeg = estimateFileSize(size, 'jpeg', dpi)
      const png = estimateFileSize(size, 'png', dpi)

      // Convert to bytes for comparison
      const toBytes = (result: { value: number; unit: string }) => {
        if (result.unit === 'MB') return result.value * 1024 * 1024
        if (result.unit === 'KB') return result.value * 1024
        return result.value
      }

      // Verify WebP and JPEG are more compressed than PNG
      expect(toBytes(webp)).toBeLessThan(toBytes(png))
      expect(toBytes(jpeg)).toBeLessThan(toBytes(png))

      // Verify all formats return valid sizes
      expect(webp.value).toBeGreaterThan(0)
      expect(jpeg.value).toBeGreaterThan(0)
      expect(png.value).toBeGreaterThan(0)
    })
  })

  describe('DPI recommendations', () => {
    it('should provide increasing DPI values', () => {
      const screen = getRecommendedDPI('screen')
      const draft = getRecommendedDPI('print-draft')
      const quality = getRecommendedDPI('print-quality')
      const pro = getRecommendedDPI('print-pro')

      expect(draft).toBeGreaterThan(screen)
      expect(quality).toBeGreaterThan(draft)
      expect(pro).toBeGreaterThan(quality)
    })

    it('should double DPI from screen to print-draft', () => {
      const screen = getRecommendedDPI('screen')
      const draft = getRecommendedDPI('print-draft')
      expect(draft).toBeGreaterThanOrEqual(screen * 2)
    })

    it('should double DPI from print-quality to print-pro', () => {
      const quality = getRecommendedDPI('print-quality')
      const pro = getRecommendedDPI('print-pro')
      expect(pro).toBe(quality * 2)
    })
  })

  describe('Practical use cases', () => {
    it('should estimate reasonable size for business card QR (300 DPI)', () => {
      const result = estimateFileSize(200, 'png', 300)
      expect(result.unit).toBe('KB')
      expect(result.value).toBeGreaterThan(0)
      expect(result.value).toBeLessThan(1000) // Should be under 1MB
    })

    it('should estimate reasonable size for poster QR (600 DPI)', () => {
      const result = estimateFileSize(512, 'png', 600)
      expect(result.unit).toMatch(/KB|MB/)
    })

    it('should estimate small size for web QR (72 DPI)', () => {
      const result = estimateFileSize(256, 'png', 72)
      expect(result.unit).toBe('KB')
      expect(result.value).toBeLessThan(100) // Should be under 100KB for web
    })

    it('should estimate compact size for email-friendly WebP', () => {
      const result = estimateFileSize(256, 'webp', 150)
      expect(result.unit).toBe('KB')
      expect(result.value).toBeLessThan(50) // WebP should be very compact
    })
  })

  describe('Calculation accuracy', () => {
    it('should return integer values', () => {
      const result = estimateFileSize(256, 'png', 300)
      expect(Number.isInteger(result.value)).toBe(true)
    })

    it('should handle fractional sizes gracefully', () => {
      const result = estimateFileSize(255.5, 'png', 300)
      expect(result.value).toBeGreaterThan(0)
    })

    it('should be consistent for same inputs', () => {
      const result1 = estimateFileSize(256, 'png', 300)
      const result2 = estimateFileSize(256, 'png', 300)
      expect(result1.value).toBe(result2.value)
      expect(result1.unit).toBe(result2.unit)
    })
  })
})
