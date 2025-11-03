import { describe, expect, it } from 'vitest'

// Helper function to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
}

// Helper function to validate PDF MIME type
export function isValidPDFType(type: string): boolean {
  return type === 'application/pdf'
}

// Helper function to validate page number range
export function isValidPageRange(start: number, end: number, totalPages: number): boolean {
  return start >= 1 && end <= totalPages && start <= end
}

// Helper function to calculate compression ratio
export function calculateCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0
  return Math.round(((original - compressed) / original) * 100)
}

// Helper function to validate watermark opacity
export function isValidOpacity(opacity: number): boolean {
  return opacity >= 0 && opacity <= 1
}

// Helper function to validate rotation angle
export function isValidRotationAngle(angle: number): boolean {
  return [90, 180, 270, 360].includes(angle)
}

// Helper function to generate filename with suffix
export function generateOutputFilename(
  originalName: string,
  operation: string,
  extension = 'pdf'
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  return `${baseName}_${operation}.${extension}`
}

// Helper function to validate DOCX conversion
export function shouldConvertToDocx(operation: string): boolean {
  return operation === 'toWord'
}

// Helper function to get output extension based on operation
export function getOutputExtension(operation: string): string {
  return operation === 'toWord' ? 'docx' : 'pdf'
}

describe('PDF Tools Utilities', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes to KB', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(2048)).toBe('2 KB')
    })

    it('should format bytes to MB', () => {
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(5242880)).toBe('5 MB')
    })

    it('should format bytes to GB', () => {
      expect(formatBytes(1073741824)).toBe('1 GB')
      expect(formatBytes(2147483648)).toBe('2 GB')
    })

    it('should round to 2 decimal places', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1638400)).toBe('1.56 MB')
    })

    it('should handle large file sizes', () => {
      expect(formatBytes(1073741824 * 10)).toBe('10 GB')
    })
  })

  describe('isValidPDFType', () => {
    it('should validate correct PDF MIME type', () => {
      expect(isValidPDFType('application/pdf')).toBe(true)
    })

    it('should reject non-PDF MIME types', () => {
      expect(isValidPDFType('image/jpeg')).toBe(false)
      expect(isValidPDFType('text/plain')).toBe(false)
      expect(isValidPDFType('application/json')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidPDFType('')).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(isValidPDFType('Application/PDF')).toBe(false)
      expect(isValidPDFType('application/PDF')).toBe(false)
    })
  })

  describe('isValidPageRange', () => {
    it('should validate correct page ranges', () => {
      expect(isValidPageRange(1, 5, 10)).toBe(true)
      expect(isValidPageRange(1, 10, 10)).toBe(true)
      expect(isValidPageRange(5, 5, 10)).toBe(true)
    })

    it('should reject start page less than 1', () => {
      expect(isValidPageRange(0, 5, 10)).toBe(false)
      expect(isValidPageRange(-1, 5, 10)).toBe(false)
    })

    it('should reject end page greater than total pages', () => {
      expect(isValidPageRange(1, 11, 10)).toBe(false)
      expect(isValidPageRange(1, 100, 10)).toBe(false)
    })

    it('should reject start page greater than end page', () => {
      expect(isValidPageRange(5, 3, 10)).toBe(false)
      expect(isValidPageRange(10, 1, 10)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidPageRange(1, 1, 1)).toBe(true)
      expect(isValidPageRange(10, 10, 10)).toBe(true)
    })
  })

  describe('calculateCompressionRatio', () => {
    it('should calculate compression ratio correctly', () => {
      expect(calculateCompressionRatio(100, 50)).toBe(50)
      expect(calculateCompressionRatio(1000, 250)).toBe(75)
      expect(calculateCompressionRatio(1000, 900)).toBe(10)
    })

    it('should handle 0% compression', () => {
      expect(calculateCompressionRatio(100, 100)).toBe(0)
    })

    it('should handle 100% compression', () => {
      expect(calculateCompressionRatio(100, 0)).toBe(100)
    })

    it('should handle original size of 0', () => {
      expect(calculateCompressionRatio(0, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateCompressionRatio(100, 33)).toBe(67)
      expect(calculateCompressionRatio(100, 66)).toBe(34)
    })

    it('should handle larger compressed than original (negative compression)', () => {
      const result = calculateCompressionRatio(100, 150)
      expect(result).toBe(-50)
    })
  })

  describe('isValidOpacity', () => {
    it('should validate opacity in valid range', () => {
      expect(isValidOpacity(0)).toBe(true)
      expect(isValidOpacity(0.5)).toBe(true)
      expect(isValidOpacity(1)).toBe(true)
      expect(isValidOpacity(0.3)).toBe(true)
    })

    it('should reject opacity less than 0', () => {
      expect(isValidOpacity(-0.1)).toBe(false)
      expect(isValidOpacity(-1)).toBe(false)
    })

    it('should reject opacity greater than 1', () => {
      expect(isValidOpacity(1.1)).toBe(false)
      expect(isValidOpacity(2)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isValidOpacity(0.0)).toBe(true)
      expect(isValidOpacity(1.0)).toBe(true)
      expect(isValidOpacity(0.01)).toBe(true)
      expect(isValidOpacity(0.99)).toBe(true)
    })
  })

  describe('isValidRotationAngle', () => {
    it('should validate standard rotation angles', () => {
      expect(isValidRotationAngle(90)).toBe(true)
      expect(isValidRotationAngle(180)).toBe(true)
      expect(isValidRotationAngle(270)).toBe(true)
      expect(isValidRotationAngle(360)).toBe(true)
    })

    it('should reject invalid rotation angles', () => {
      expect(isValidRotationAngle(0)).toBe(false)
      expect(isValidRotationAngle(45)).toBe(false)
      expect(isValidRotationAngle(135)).toBe(false)
      expect(isValidRotationAngle(225)).toBe(false)
      expect(isValidRotationAngle(315)).toBe(false)
    })

    it('should reject negative angles', () => {
      expect(isValidRotationAngle(-90)).toBe(false)
      expect(isValidRotationAngle(-180)).toBe(false)
    })

    it('should reject non-standard positive angles', () => {
      expect(isValidRotationAngle(450)).toBe(false)
      expect(isValidRotationAngle(720)).toBe(false)
    })
  })

  describe('generateOutputFilename', () => {
    it('should generate correct filename with operation suffix', () => {
      expect(generateOutputFilename('document.pdf', 'merged')).toBe('document_merged.pdf')
      expect(generateOutputFilename('file.pdf', 'compressed')).toBe('file_compressed.pdf')
    })

    it('should handle filenames without extension', () => {
      expect(generateOutputFilename('document', 'merged')).toBe('document_merged.pdf')
    })

    it('should handle multiple dots in filename', () => {
      expect(generateOutputFilename('my.document.pdf', 'merged')).toBe('my.document_merged.pdf')
    })

    it('should support custom extension', () => {
      expect(generateOutputFilename('document.pdf', 'page_1', 'png')).toBe('document_page_1.png')
    })

    it('should handle various operations', () => {
      expect(generateOutputFilename('doc.pdf', 'watermarked')).toBe('doc_watermarked.pdf')
      expect(generateOutputFilename('doc.pdf', 'rotated')).toBe('doc_rotated.pdf')
      expect(generateOutputFilename('doc.pdf', 'extracted')).toBe('doc_extracted.pdf')
    })

    it('should handle filenames with spaces', () => {
      expect(generateOutputFilename('my document.pdf', 'merged')).toBe('my document_merged.pdf')
    })

    it('should handle long filenames', () => {
      const longName = 'this_is_a_very_long_filename_for_testing_purposes.pdf'
      expect(generateOutputFilename(longName, 'merged')).toBe(
        'this_is_a_very_long_filename_for_testing_purposes_merged.pdf'
      )
    })
  })

  describe('integration scenarios', () => {
    it('should validate complete merge operation parameters', () => {
      const file1Size = 1048576 // 1 MB
      const file2Size = 2097152 // 2 MB
      const mergedSize = file1Size + file2Size
      const formatted = formatBytes(mergedSize)

      expect(formatted).toBe('3 MB')
      expect(isValidPDFType('application/pdf')).toBe(true)
    })

    it('should validate complete split operation parameters', () => {
      const totalPages = 10
      const splitAt = 5

      expect(isValidPageRange(1, splitAt, totalPages)).toBe(true)
      expect(isValidPageRange(splitAt + 1, totalPages, totalPages)).toBe(true)
      expect(generateOutputFilename('document.pdf', 'part1')).toBe('document_part1.pdf')
      expect(generateOutputFilename('document.pdf', 'part2')).toBe('document_part2.pdf')
    })

    it('should validate complete watermark operation parameters', () => {
      const opacity = 0.3
      expect(isValidOpacity(opacity)).toBe(true)
      expect(generateOutputFilename('document.pdf', 'watermarked')).toBe('document_watermarked.pdf')
    })

    it('should validate complete rotation operation parameters', () => {
      expect(isValidRotationAngle(90)).toBe(true)
      expect(isValidRotationAngle(180)).toBe(true)
      expect(isValidRotationAngle(270)).toBe(true)
      expect(generateOutputFilename('document.pdf', 'rotated')).toBe('document_rotated.pdf')
    })

    it('should validate complete compress operation', () => {
      const originalSize = 10485760 // 10 MB
      const compressedSize = 2621440 // 2.5 MB

      expect(formatBytes(originalSize)).toBe('10 MB')
      expect(formatBytes(compressedSize)).toBe('2.5 MB')
      expect(calculateCompressionRatio(originalSize, compressedSize)).toBe(75)
    })

    it('should validate complete extract pages operation', () => {
      const totalPages = 50
      const startPage = 10
      const endPage = 20

      expect(isValidPageRange(startPage, endPage, totalPages)).toBe(true)
      expect(generateOutputFilename('document.pdf', 'extracted')).toBe('document_extracted.pdf')
    })

    it('should validate complete convert to images operation', () => {
      const totalPages = 5
      for (let i = 1; i <= totalPages; i++) {
        expect(generateOutputFilename('doc.pdf', `page_${i}`, 'png')).toBe(`doc_page_${i}.png`)
      }
    })

    it('should validate complete PDF to Word conversion operation', () => {
      expect(shouldConvertToDocx('toWord')).toBe(true)
      expect(shouldConvertToDocx('merge')).toBe(false)
      expect(getOutputExtension('toWord')).toBe('docx')
      expect(getOutputExtension('merge')).toBe('pdf')
      expect(generateOutputFilename('document.pdf', '', 'docx')).toBe('document_.docx')
    })
  })

  describe('getOutputExtension', () => {
    it('should return docx for toWord operation', () => {
      expect(getOutputExtension('toWord')).toBe('docx')
    })

    it('should return pdf for all other operations', () => {
      expect(getOutputExtension('merge')).toBe('pdf')
      expect(getOutputExtension('split')).toBe('pdf')
      expect(getOutputExtension('compress')).toBe('pdf')
      expect(getOutputExtension('watermark')).toBe('pdf')
      expect(getOutputExtension('extract')).toBe('pdf')
      expect(getOutputExtension('rotate')).toBe('pdf')
    })
  })

  describe('shouldConvertToDocx', () => {
    it('should return true only for toWord operation', () => {
      expect(shouldConvertToDocx('toWord')).toBe(true)
    })

    it('should return false for other operations', () => {
      expect(shouldConvertToDocx('merge')).toBe(false)
      expect(shouldConvertToDocx('split')).toBe(false)
      expect(shouldConvertToDocx('compress')).toBe(false)
      expect(shouldConvertToDocx('toImages')).toBe(false)
      expect(shouldConvertToDocx('watermark')).toBe(false)
      expect(shouldConvertToDocx('extract')).toBe(false)
      expect(shouldConvertToDocx('rotate')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle very large file sizes', () => {
      const largeSize = 1073741824 * 5 // 5 GB
      expect(formatBytes(largeSize)).toBe('5 GB')
    })

    it('should handle very small opacity values', () => {
      expect(isValidOpacity(0.001)).toBe(true)
      expect(isValidOpacity(0.999)).toBe(true)
    })

    it('should handle single-page PDF operations', () => {
      expect(isValidPageRange(1, 1, 1)).toBe(true)
      expect(calculateCompressionRatio(1024, 512)).toBe(50)
    })

    it('should handle filenames with special characters', () => {
      expect(generateOutputFilename('my-document_v2.pdf', 'merged')).toBe(
        'my-document_v2_merged.pdf'
      )
    })
  })
})
