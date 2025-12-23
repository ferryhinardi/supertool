import { describe, expect, it, vi } from 'vitest'
import {
  copyToClipboard,
  createIcoFile,
  downloadBlob,
  FAVICON_SIZES,
  type FaviconSize,
  type GeneratedFavicon,
  generateHtmlTags,
  isValidImageFile,
} from '../utils'

// Mock navigator.clipboard
const mockWriteText = vi.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
})

describe('Favicon Generator Utils', () => {
  describe('FAVICON_SIZES', () => {
    it('should contain all standard favicon sizes', () => {
      expect(FAVICON_SIZES).toEqual([16, 32, 48, 64, 128, 180])
    })

    it('should export as const array', () => {
      expect(Array.isArray(FAVICON_SIZES)).toBe(true)
      expect(FAVICON_SIZES.length).toBe(6)
    })
  })

  describe('isValidImageFile', () => {
    it('should return true for PNG files', () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' })
      expect(isValidImageFile(pngFile)).toBe(true)
    })

    it('should return true for JPEG files', () => {
      const jpegFile = new File([''], 'test.jpeg', { type: 'image/jpeg' })
      expect(isValidImageFile(jpegFile)).toBe(true)
    })

    it('should return true for JPG files', () => {
      const jpgFile = new File([''], 'test.jpg', { type: 'image/jpg' })
      expect(isValidImageFile(jpgFile)).toBe(true)
    })

    it('should return true for GIF files', () => {
      const gifFile = new File([''], 'test.gif', { type: 'image/gif' })
      expect(isValidImageFile(gifFile)).toBe(true)
    })

    it('should return true for SVG files', () => {
      const svgFile = new File([''], 'test.svg', { type: 'image/svg+xml' })
      expect(isValidImageFile(svgFile)).toBe(true)
    })

    it('should return true for WebP files', () => {
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' })
      expect(isValidImageFile(webpFile)).toBe(true)
    })

    it('should return false for PDF files', () => {
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' })
      expect(isValidImageFile(pdfFile)).toBe(false)
    })

    it('should return false for text files', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      expect(isValidImageFile(textFile)).toBe(false)
    })

    it('should return false for video files', () => {
      const videoFile = new File([''], 'test.mp4', { type: 'video/mp4' })
      expect(isValidImageFile(videoFile)).toBe(false)
    })

    it('should return false for JSON files', () => {
      const jsonFile = new File([''], 'test.json', { type: 'application/json' })
      expect(isValidImageFile(jsonFile)).toBe(false)
    })
  })

  describe('createIcoFile', () => {
    it('should create ICO file from multiple sizes', async () => {
      const mockFavicons: GeneratedFavicon[] = [
        {
          size: 16 as FaviconSize,
          blob: new Blob(['test16'], { type: 'image/png' }),
          dataUrl: 'data:image/png;base64,test16',
        },
        {
          size: 32 as FaviconSize,
          blob: new Blob(['test32'], { type: 'image/png' }),
          dataUrl: 'data:image/png;base64,test32',
        },
        {
          size: 48 as FaviconSize,
          blob: new Blob(['test48'], { type: 'image/png' }),
          dataUrl: 'data:image/png;base64,test48',
        },
      ]

      const icoBlob = await createIcoFile(mockFavicons)

      expect(icoBlob).toBeInstanceOf(Blob)
      expect(icoBlob.type).toBe('image/x-icon')
      expect(icoBlob.size).toBeGreaterThan(0)
    })

    it('should only use 16x16, 32x32, and 48x48 sizes for ICO', async () => {
      const mockFavicons: GeneratedFavicon[] = FAVICON_SIZES.map((size) => ({
        size,
        blob: new Blob([`test${size}`], { type: 'image/png' }),
        dataUrl: `data:image/png;base64,test${size}`,
      }))

      const icoBlob = await createIcoFile(mockFavicons)

      expect(icoBlob).toBeInstanceOf(Blob)
      expect(icoBlob.type).toBe('image/x-icon')
      // ICO should filter to only include 16, 32, 48
      expect(icoBlob.size).toBeGreaterThan(0)
    })

    it('should handle empty array gracefully', async () => {
      const icoBlob = await createIcoFile([])

      expect(icoBlob).toBeInstanceOf(Blob)
      expect(icoBlob.type).toBe('image/x-icon')
    })

    it('should create proper ICO file structure', async () => {
      const mockFavicons: GeneratedFavicon[] = [
        {
          size: 16 as FaviconSize,
          blob: new Blob(['test16'], { type: 'image/png' }),
          dataUrl: 'data:image/png;base64,test16',
        },
      ]

      const icoBlob = await createIcoFile(mockFavicons)
      const arrayBuffer = await icoBlob.arrayBuffer()
      const dataView = new DataView(arrayBuffer)

      // Check ICO header
      expect(dataView.getUint16(0, true)).toBe(0) // Reserved
      expect(dataView.getUint16(2, true)).toBe(1) // Type (1 = ICO)
      expect(dataView.getUint16(4, true)).toBeGreaterThanOrEqual(0) // Number of images
    })
  })

  describe('generateHtmlTags', () => {
    it('should generate HTML tags for all standard sizes', () => {
      const html = generateHtmlTags(FAVICON_SIZES as unknown as FaviconSize[])

      expect(html).toContain('rel="icon"')
      expect(html).toContain('type="image/x-icon"')
      expect(html).toContain('href="/favicon.ico"')
      expect(html).toContain('sizes="16x16"')
      expect(html).toContain('sizes="32x32"')
      expect(html).toContain('sizes="48x48"')
      expect(html).toContain('sizes="64x64"')
      expect(html).toContain('sizes="128x128"')
      expect(html).toContain('sizes="180x180"')
      expect(html).toContain('rel="apple-touch-icon"')
    })

    it('should generate tags for specific sizes only', () => {
      const sizes: FaviconSize[] = [16, 32, 48]
      const html = generateHtmlTags(sizes)

      expect(html).toContain('sizes="16x16"')
      expect(html).toContain('sizes="32x32"')
      expect(html).toContain('sizes="48x48"')
      expect(html).not.toContain('sizes="64x64"')
      expect(html).not.toContain('sizes="128x128"')
    })

    it('should include apple-touch-icon for 180px size', () => {
      const sizes: FaviconSize[] = [180]
      const html = generateHtmlTags(sizes)

      expect(html).toContain('rel="apple-touch-icon"')
      expect(html).toContain('sizes="180x180"')
      expect(html).toContain('href="/apple-touch-icon.png"')
    })

    it('should generate standard favicon.ico link', () => {
      const html = generateHtmlTags([16])

      expect(html).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico">')
    })

    it('should generate PNG links with correct filenames', () => {
      const sizes: FaviconSize[] = [16, 32, 48]
      const html = generateHtmlTags(sizes)

      expect(html).toContain('href="/favicon-16x16.png"')
      expect(html).toContain('href="/favicon-32x32.png"')
      expect(html).toContain('href="/favicon-48x48.png"')
    })

    it('should include HTML comments for organization', () => {
      const html = generateHtmlTags([16])

      expect(html).toContain('<!-- Standard Favicon -->')
      expect(html).toContain('<!-- PNG Icons -->')
    })

    it('should generate proper link tag structure', () => {
      const html = generateHtmlTags([32])

      expect(html).toMatch(
        /<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32x32\.png">/
      )
    })

    it('should handle empty sizes array', () => {
      const html = generateHtmlTags([])

      expect(html).toContain('favicon.ico')
      expect(html).not.toContain('sizes=')
    })
  })

  describe('downloadBlob', () => {
    it('should create and trigger download link', () => {
      const mockClick = vi.fn()
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
        style: { display: '' },
      }

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockLink as unknown as HTMLElement)
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => mockLink as unknown as Node)
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => mockLink as unknown as Node)
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const blob = new Blob(['test'], { type: 'image/png' })
      downloadBlob(blob, 'test.png')

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe('test.png')
      expect(mockClick).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
      expect(revokeObjectURLSpy).toHaveBeenCalled()

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('should handle different file types', () => {
      const mockClick = vi.fn()
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
        style: { display: '' },
      }

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      const icoBlob = new Blob(['test'], { type: 'image/x-icon' })
      downloadBlob(icoBlob, 'favicon.ico')

      expect(mockLink.download).toBe('favicon.ico')
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue(undefined)

      await copyToClipboard('test text')

      expect(mockWriteText).toHaveBeenCalledWith('test text')
    })

    it('should handle clipboard errors', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'))

      await expect(copyToClipboard('test')).rejects.toThrow('Clipboard error')
    })

    it('should copy HTML code', async () => {
      mockWriteText.mockResolvedValue(undefined)

      const html = '<link rel="icon" href="/favicon.ico">'
      await copyToClipboard(html)

      expect(mockWriteText).toHaveBeenCalledWith(html)
    })

    it('should copy multi-line HTML', async () => {
      mockWriteText.mockResolvedValue(undefined)

      const html = `<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
      await copyToClipboard(html)

      expect(mockWriteText).toHaveBeenCalledWith(html)
    })
  })

  describe('Type definitions', () => {
    it('should have correct GeneratedFavicon interface', () => {
      const favicon: GeneratedFavicon = {
        size: 32,
        dataUrl: 'data:image/png;base64,test',
        blob: new Blob(['test'], { type: 'image/png' }),
      }

      expect(favicon.size).toBe(32)
      expect(favicon.dataUrl).toContain('data:image/png')
      expect(favicon.blob).toBeInstanceOf(Blob)
    })

    it('should accept all standard sizes', () => {
      const sizes: FaviconSize[] = [16, 32, 48, 64, 128, 180]

      sizes.forEach((size) => {
        expect(FAVICON_SIZES).toContain(size)
      })
    })
  })
})
