import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ComparisonResult } from '../utils'
import { compareImages, downloadImage, imageDataToDataURL, resizeImage } from '../utils'

// Polyfill ImageData for Node/Vitest environment
class MockImageData {
  data: Uint8ClampedArray
  width: number
  height: number
  colorSpace: 'srgb' = 'srgb'

  constructor(data: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
    if (typeof data === 'number') {
      // Constructor: new ImageData(width, height)
      this.width = data
      this.height = widthOrHeight || data
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      // Constructor: new ImageData(data, width, height)
      this.data = data
      this.width = widthOrHeight || 0
      this.height = height || 0
    }
  }
}
// Set global ImageData
;(globalThis as unknown as { ImageData: typeof MockImageData }).ImageData = MockImageData

// Mock pixelmatch
vi.mock('pixelmatch', () => ({
  default: vi.fn().mockImplementation((_img1, _img2, output, _width, _height) => {
    // Fill output with some diff data
    for (let i = 0; i < output.length; i += 4) {
      output[i] = 255 // R
      output[i + 1] = 0 // G
      output[i + 2] = 255 // B
      output[i + 3] = 255 // A
    }
    return 100 // Return 100 different pixels
  }),
}))

describe('screenshot-diff utils', () => {
  // Canvas context mock
  let mockContext: {
    drawImage: ReturnType<typeof vi.fn>
    getImageData: ReturnType<typeof vi.fn>
    putImageData: ReturnType<typeof vi.fn>
  }

  // Store original createElement
  const originalCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    // Setup canvas context mock
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100,
      }),
      putImageData: vi.fn(),
    }

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      mockContext as unknown as CanvasRenderingContext2D
    )

    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mockImageData'
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('compareImages', () => {
    const createMockImageData = (width: number, height: number): ImageData => {
      return {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        colorSpace: 'srgb',
      }
    }

    it('compares two identical dimension images successfully', () => {
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      const result = compareImages(img1, img2)

      expect(result).toBeDefined()
      expect(result.diffPixels).toBe(100)
      expect(result.totalPixels).toBe(10000)
      expect(result.percentageDiff).toBe(1) // 100/10000 * 100 = 1%
      expect(result.diffImageData).toBeDefined()
      expect(result.diffImageData.width).toBe(100)
      expect(result.diffImageData.height).toBe(100)
    })

    it('throws error when dimensions do not match', () => {
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(200, 200)

      expect(() => compareImages(img1, img2)).toThrow(
        'Image dimensions must match. Image 1: 100x100, Image 2: 200x200'
      )
    })

    it('throws error when width does not match', () => {
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(150, 100)

      expect(() => compareImages(img1, img2)).toThrow(
        'Image dimensions must match. Image 1: 100x100, Image 2: 150x100'
      )
    })

    it('throws error when height does not match', () => {
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 150)

      expect(() => compareImages(img1, img2)).toThrow(
        'Image dimensions must match. Image 1: 100x100, Image 2: 100x150'
      )
    })

    it('uses default threshold of 0.1', async () => {
      const pixelmatch = await import('pixelmatch')
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      compareImages(img1, img2)

      expect(pixelmatch.default).toHaveBeenCalledWith(
        img1.data,
        img2.data,
        expect.any(Uint8ClampedArray),
        100,
        100,
        expect.objectContaining({ threshold: 0.1 })
      )
    })

    it('uses custom threshold when provided', async () => {
      const pixelmatch = await import('pixelmatch')
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      compareImages(img1, img2, { threshold: 0.5 })

      expect(pixelmatch.default).toHaveBeenCalledWith(
        img1.data,
        img2.data,
        expect.any(Uint8ClampedArray),
        100,
        100,
        expect.objectContaining({ threshold: 0.5 })
      )
    })

    it('uses default includeAA of true', async () => {
      const pixelmatch = await import('pixelmatch')
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      compareImages(img1, img2)

      expect(pixelmatch.default).toHaveBeenCalledWith(
        img1.data,
        img2.data,
        expect.any(Uint8ClampedArray),
        100,
        100,
        expect.objectContaining({ includeAA: true })
      )
    })

    it('uses custom includeAA when provided', async () => {
      const pixelmatch = await import('pixelmatch')
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      compareImages(img1, img2, { includeAA: false })

      expect(pixelmatch.default).toHaveBeenCalledWith(
        img1.data,
        img2.data,
        expect.any(Uint8ClampedArray),
        100,
        100,
        expect.objectContaining({ includeAA: false })
      )
    })

    it('calculates percentageDiff correctly for different pixel counts', async () => {
      const pixelmatch = await import('pixelmatch')

      // Mock pixelmatch to return 500 different pixels
      vi.mocked(pixelmatch.default).mockReturnValueOnce(500)

      const img1 = createMockImageData(100, 100) // 10000 total pixels
      const img2 = createMockImageData(100, 100)

      const result = compareImages(img1, img2)

      expect(result.diffPixels).toBe(500)
      expect(result.totalPixels).toBe(10000)
      expect(result.percentageDiff).toBe(5) // 500/10000 * 100 = 5%
    })

    it('calculates percentageDiff correctly for zero differences', async () => {
      const pixelmatch = await import('pixelmatch')

      // Mock pixelmatch to return 0 different pixels
      vi.mocked(pixelmatch.default).mockReturnValueOnce(0)

      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      const result = compareImages(img1, img2)

      expect(result.diffPixels).toBe(0)
      expect(result.percentageDiff).toBe(0)
    })

    it('returns correct ComparisonResult structure', () => {
      const img1 = createMockImageData(50, 50)
      const img2 = createMockImageData(50, 50)

      const result: ComparisonResult = compareImages(img1, img2)

      expect(result).toHaveProperty('diffPixels')
      expect(result).toHaveProperty('totalPixels')
      expect(result).toHaveProperty('percentageDiff')
      expect(result).toHaveProperty('diffImageData')
      expect(typeof result.diffPixels).toBe('number')
      expect(typeof result.totalPixels).toBe('number')
      expect(typeof result.percentageDiff).toBe('number')
      expect(result.diffImageData).toHaveProperty('data')
      expect(result.diffImageData).toHaveProperty('width')
      expect(result.diffImageData).toHaveProperty('height')
    })

    it('passes correct options to pixelmatch', async () => {
      const pixelmatch = await import('pixelmatch')
      const img1 = createMockImageData(100, 100)
      const img2 = createMockImageData(100, 100)

      compareImages(img1, img2, { threshold: 0.2, includeAA: false })

      expect(pixelmatch.default).toHaveBeenCalledWith(
        img1.data,
        img2.data,
        expect.any(Uint8ClampedArray),
        100,
        100,
        {
          threshold: 0.2,
          includeAA: false,
          alpha: 0.1,
          diffColor: [255, 0, 255],
        }
      )
    })

    it('handles small images (1x1)', () => {
      const img1 = createMockImageData(1, 1)
      const img2 = createMockImageData(1, 1)

      const result = compareImages(img1, img2)

      expect(result.totalPixels).toBe(1)
    })

    it('handles large images', () => {
      const img1 = createMockImageData(1920, 1080)
      const img2 = createMockImageData(1920, 1080)

      const result = compareImages(img1, img2)

      expect(result.totalPixels).toBe(1920 * 1080)
    })
  })

  describe('resizeImage', () => {
    const createMockImageData = (width: number, height: number): ImageData => {
      return {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        colorSpace: 'srgb',
      }
    }

    it('resizes image to target dimensions', () => {
      const imageData = createMockImageData(100, 100)

      const result = resizeImage(imageData, 50, 50)

      expect(result).toBeDefined()
      expect(mockContext.putImageData).toHaveBeenCalledWith(imageData, 0, 0)
      expect(mockContext.drawImage).toHaveBeenCalled()
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 50, 50)
    })

    it('resizes image to larger dimensions', () => {
      const imageData = createMockImageData(50, 50)

      const result = resizeImage(imageData, 200, 200)

      expect(result).toBeDefined()
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 200, 200)
    })

    it('resizes image with different aspect ratio', () => {
      const imageData = createMockImageData(100, 100)

      const result = resizeImage(imageData, 200, 100)

      expect(result).toBeDefined()
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 200, 100)
    })

    it('throws error when canvas context is null', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

      const imageData = createMockImageData(100, 100)

      expect(() => resizeImage(imageData, 50, 50)).toThrow('Failed to get canvas context')
    })

    it('throws error when temp canvas context is null', () => {
      let callCount = 0
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return mockContext as unknown as CanvasRenderingContext2D
        }
        return null
      })

      const imageData = createMockImageData(100, 100)

      expect(() => resizeImage(imageData, 50, 50)).toThrow('Failed to get temp canvas context')
    })

    it('handles 1x1 image resize', () => {
      const imageData = createMockImageData(1, 1)

      const result = resizeImage(imageData, 10, 10)

      expect(result).toBeDefined()
      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 10, 10)
    })
  })

  describe('imageDataToDataURL', () => {
    const createMockImageData = (width: number, height: number): ImageData => {
      return {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        colorSpace: 'srgb',
      }
    }

    it('converts ImageData to data URL', () => {
      const imageData = createMockImageData(100, 100)

      const result = imageDataToDataURL(imageData)

      expect(result).toBe('data:image/png;base64,mockImageData')
      expect(mockContext.putImageData).toHaveBeenCalledWith(imageData, 0, 0)
    })

    it('creates canvas with correct dimensions', () => {
      const imageData = createMockImageData(200, 150)

      imageDataToDataURL(imageData)

      // Verify putImageData was called with the correct imageData
      expect(mockContext.putImageData).toHaveBeenCalledWith(imageData, 0, 0)
    })

    it('throws error when canvas context is null', () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

      const imageData = createMockImageData(100, 100)

      expect(() => imageDataToDataURL(imageData)).toThrow('Failed to get canvas context')
    })

    it('calls toDataURL with image/png format', () => {
      const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      const imageData = createMockImageData(100, 100)

      imageDataToDataURL(imageData)

      expect(toDataURLSpy).toHaveBeenCalledWith('image/png')
    })
  })

  describe('downloadImage', () => {
    const createMockImageData = (width: number, height: number): ImageData => {
      return {
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
        colorSpace: 'srgb',
      }
    }

    it('creates download link with correct filename', () => {
      const imageData = createMockImageData(100, 100)
      const mockClick = vi.fn()

      // Create a mock anchor element
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      } as unknown as HTMLAnchorElement

      // Mock createElement to return our mock anchor for 'a' tags only
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor
        }
        return originalCreateElement(tagName)
      })

      downloadImage(imageData, 'test-image.png')

      expect(mockAnchor.download).toBe('test-image.png')
      expect(mockAnchor.href).toBe('data:image/png;base64,mockImageData')
    })

    it('triggers click on link element', () => {
      const imageData = createMockImageData(100, 100)
      const mockClick = vi.fn()

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      } as unknown as HTMLAnchorElement

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor
        }
        return originalCreateElement(tagName)
      })

      downloadImage(imageData, 'download.png')

      expect(mockClick).toHaveBeenCalled()
    })

    it('handles filename with special characters', () => {
      const imageData = createMockImageData(100, 100)
      const mockClick = vi.fn()

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      } as unknown as HTMLAnchorElement

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor
        }
        return originalCreateElement(tagName)
      })

      downloadImage(imageData, 'diff-2024-01-15_screenshot.png')

      expect(mockAnchor.download).toBe('diff-2024-01-15_screenshot.png')
    })

    it('uses data URL from imageDataToDataURL', () => {
      const imageData = createMockImageData(100, 100)
      const mockClick = vi.fn()

      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {},
      } as unknown as HTMLAnchorElement

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor
        }
        return originalCreateElement(tagName)
      })

      downloadImage(imageData, 'test.png')

      expect(mockAnchor.href).toContain('data:image/png')
    })
  })
})
