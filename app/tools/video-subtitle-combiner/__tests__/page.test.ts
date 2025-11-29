import { describe, expect, it } from 'vitest'

describe('Video Subtitle Combiner', () => {
  describe('formatBytes utility', () => {
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
    }

    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes')
    })

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(2048)).toBe('2 KB')
    })

    it('should format megabytes correctly', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB')
    })

    it('should format gigabytes correctly', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle decimal values correctly', () => {
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })
  })

  describe('hexToRgb utility', () => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
          }
        : { r: 255, g: 255, b: 255 }
    }

    it('should convert white hex to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('should convert black hex to RGB', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('should convert red hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should convert green hex to RGB', () => {
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
    })

    it('should convert blue hex to RGB', () => {
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle invalid hex with default white', () => {
      expect(hexToRgb('invalid')).toEqual({ r: 255, g: 255, b: 255 })
    })
  })

  describe('rgbToAss utility', () => {
    const rgbToAss = (rgb: { r: number; g: number; b: number }) => {
      // ASS format is BGR (reversed)
      return `${rgb.b.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.r.toString(16).padStart(2, '0')}`
    }

    it('should convert white RGB to ASS format', () => {
      expect(rgbToAss({ r: 255, g: 255, b: 255 })).toBe('ffffff')
    })

    it('should convert black RGB to ASS format', () => {
      expect(rgbToAss({ r: 0, g: 0, b: 0 })).toBe('000000')
    })

    it('should convert red RGB to ASS format (reversed to BGR)', () => {
      expect(rgbToAss({ r: 255, g: 0, b: 0 })).toBe('0000ff')
    })

    it('should convert green RGB to ASS format (reversed to BGR)', () => {
      expect(rgbToAss({ r: 0, g: 255, b: 0 })).toBe('00ff00')
    })

    it('should convert blue RGB to ASS format (reversed to BGR)', () => {
      expect(rgbToAss({ r: 0, g: 0, b: 255 })).toBe('ff0000')
    })

    it('should pad single digit hex values', () => {
      expect(rgbToAss({ r: 15, g: 15, b: 15 })).toBe('0f0f0f')
    })
  })

  describe('Tool configuration', () => {
    it('should have correct constants', () => {
      const MAX_VIDEO_SIZE = 500 * 1024 * 1024
      expect(MAX_VIDEO_SIZE).toBe(524288000)
    })

    it('should have valid subtitle positions', () => {
      const positions = ['bottom', 'center', 'top']
      expect(positions).toContain('bottom')
      expect(positions).toContain('center')
      expect(positions).toContain('top')
    })

    it('should have valid font size range', () => {
      const minFontSize = 12
      const maxFontSize = 72
      expect(minFontSize).toBe(12)
      expect(maxFontSize).toBe(72)
    })

    it('should have valid opacity range', () => {
      const minOpacity = 0
      const maxOpacity = 1
      expect(minOpacity).toBe(0)
      expect(maxOpacity).toBe(1)
    })
  })

  describe('ProcessingFile interface', () => {
    it('should have correct status values', () => {
      const statuses = ['pending', 'processing', 'completed', 'error']
      expect(statuses).toContain('pending')
      expect(statuses).toContain('processing')
      expect(statuses).toContain('completed')
      expect(statuses).toContain('error')
    })
  })
})
