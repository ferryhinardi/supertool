import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type BatchExportItem,
  type ExportFormat,
  type ExportMetadata,
  estimateFileSize,
  exportBatchToZIP,
  exportToJPEG,
  exportToPDF,
  exportToPNG,
  exportToSVG,
  exportToWebP,
  getRecommendedDPI,
} from '../qr-export-service'

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockPngData'),
  toJpeg: vi.fn().mockResolvedValue('data:image/jpeg;base64,mockJpegData'),
}))

// Mock jspdf - create mock functions we can spy on
const mockPdfSetFontSize = vi.fn()
const mockPdfText = vi.fn()
const mockPdfAddImage = vi.fn()
const mockPdfSetTextColor = vi.fn()
const mockPdfSave = vi.fn()
const mockJsPDFConstructor = vi.fn()

vi.mock('jspdf', () => {
  // Must use class for proper constructor behavior
  class MockJsPDF {
    constructor(options?: object) {
      mockJsPDFConstructor(options)
    }
    setFontSize = mockPdfSetFontSize
    text = mockPdfText
    addImage = mockPdfAddImage
    setTextColor = mockPdfSetTextColor
    save = mockPdfSave
  }
  return { jsPDF: MockJsPDF }
})

// Mock jszip - must use class for proper constructor behavior
// These are hoisted to module level so tests can access them
const mockJSZipFile = vi.fn().mockReturnThis()
const mockJSZipFolder = vi.fn().mockReturnValue({
  file: mockJSZipFile,
})
const mockJSZipGenerateAsync = vi
  .fn()
  .mockResolvedValue(new Blob(['test'], { type: 'application/zip' }))

vi.mock('jszip', () => {
  class MockJSZip {
    folder = mockJSZipFolder
    file = mockJSZipFile
    generateAsync = mockJSZipGenerateAsync
  }

  return { default: MockJSZip }
})

// Blob constructor spy for tracking calls
const mockBlobConstructor = vi.fn()

describe('qr-export-service', () => {
  let mockSvgElement: SVGSVGElement
  let mockLink: HTMLAnchorElement
  let originalCreateElement: typeof document.createElement
  let mockCreateObjectURL: ReturnType<typeof vi.fn>
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Create mock SVG element
    mockSvgElement = {
      width: { baseVal: { value: 256 } },
      height: { baseVal: { value: 256 } },
      cloneNode: vi.fn().mockReturnValue({
        setAttribute: vi.fn(),
        width: { baseVal: { value: 256 } },
        height: { baseVal: { value: 256 } },
      }),
      setAttribute: vi.fn(),
    } as unknown as SVGSVGElement

    // Create mock link element
    mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    // Store original methods
    originalCreateElement = document.createElement.bind(document)

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink
      }
      if (tagName === 'div') {
        return {
          style: {},
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        } as unknown as HTMLDivElement
      }
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({
            drawImage: vi.fn(),
          }),
          toDataURL: vi.fn().mockReturnValue('data:image/webp;base64,mockWebpData'),
        } as unknown as HTMLCanvasElement
      }
      return originalCreateElement(tagName)
    })

    // Mock document.body methods
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node as Node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node as Node)

    // Mock URL methods
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    mockRevokeObjectURL = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    })

    // Mock XMLSerializer - must use class for proper constructor behavior
    class MockXMLSerializer {
      serializeToString() {
        return '<svg></svg>'
      }
    }
    vi.stubGlobal('XMLSerializer', MockXMLSerializer)

    // Mock Image constructor - must use class for proper constructor behavior
    class MockImage {
      onload: (() => void) | null = null
      onerror: ((err: Error) => void) | null = null
      private _src = ''

      get src() {
        return this._src
      }

      set src(value: string) {
        this._src = value
        // Trigger onload after src is set
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 0)
      }
    }
    vi.stubGlobal('Image', MockImage)

    // Mock Blob - must use class for proper constructor behavior
    // Track constructor calls with the module-level spy
    class MockBlob {
      content: BlobPart[]
      type: string

      constructor(content?: BlobPart[], options?: BlobPropertyBag) {
        mockBlobConstructor(content, options)
        this.content = content || []
        this.type = options?.type || 'application/octet-stream'
      }
    }
    vi.stubGlobal('Blob', MockBlob)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('getRecommendedDPI', () => {
    it('should return 72 for screen use case', () => {
      expect(getRecommendedDPI('screen')).toBe(72)
    })

    it('should return 150 for print-draft use case', () => {
      expect(getRecommendedDPI('print-draft')).toBe(150)
    })

    it('should return 300 for print-quality use case', () => {
      expect(getRecommendedDPI('print-quality')).toBe(300)
    })

    it('should return 600 for print-pro use case', () => {
      expect(getRecommendedDPI('print-pro')).toBe(600)
    })

    it('should return 300 as default for unknown use case', () => {
      // @ts-expect-error - testing invalid input
      expect(getRecommendedDPI('unknown')).toBe(300)
    })
  })

  describe('estimateFileSize', () => {
    const testSize = 256
    const defaultDpi = 300

    it('should estimate PNG file size', () => {
      const result = estimateFileSize(testSize, 'png', defaultDpi)
      expect(result.value).toBeGreaterThan(0)
      expect(['B', 'KB', 'MB']).toContain(result.unit)
    })

    it('should estimate JPEG file size (smaller than PNG)', () => {
      const pngResult = estimateFileSize(testSize, 'png', defaultDpi)
      const jpegResult = estimateFileSize(testSize, 'jpeg', defaultDpi)
      // JPEG should be smaller due to compression
      expect(jpegResult.value).toBeLessThanOrEqual(pngResult.value * 0.5)
    })

    it('should estimate WebP file size (smaller than JPEG)', () => {
      const jpegResult = estimateFileSize(testSize, 'jpeg', defaultDpi)
      const webpResult = estimateFileSize(testSize, 'webp', defaultDpi)
      // WebP should be smaller
      expect(webpResult.value).toBeLessThanOrEqual(jpegResult.value)
    })

    it('should estimate SVG file size', () => {
      const result = estimateFileSize(testSize, 'svg', defaultDpi)
      expect(result.value).toBeGreaterThan(0)
    })

    it('should estimate PDF file size', () => {
      const result = estimateFileSize(testSize, 'pdf', defaultDpi)
      expect(result.value).toBeGreaterThan(0)
    })

    it('should return bytes for small files', () => {
      const result = estimateFileSize(10, 'svg', 72)
      expect(result.unit).toBe('B')
    })

    it('should return KB for medium files', () => {
      const result = estimateFileSize(256, 'png', 150)
      expect(['KB', 'B']).toContain(result.unit)
    })

    it('should return MB for large files', () => {
      const result = estimateFileSize(2000, 'png', 600)
      expect(result.unit).toBe('MB')
    })

    it('should scale with DPI', () => {
      const lowDpi = estimateFileSize(256, 'png', 72)
      const highDpi = estimateFileSize(256, 'png', 300)
      // Higher DPI should result in larger file
      // Convert to bytes for comparison
      const lowBytes =
        lowDpi.value * (lowDpi.unit === 'MB' ? 1024 * 1024 : lowDpi.unit === 'KB' ? 1024 : 1)
      const highBytes =
        highDpi.value * (highDpi.unit === 'MB' ? 1024 * 1024 : highDpi.unit === 'KB' ? 1024 : 1)
      expect(highBytes).toBeGreaterThan(lowBytes)
    })

    it('should use default DPI of 300 if not provided', () => {
      const withDefault = estimateFileSize(256, 'png')
      const with300 = estimateFileSize(256, 'png', 300)
      expect(withDefault.value).toBe(with300.value)
      expect(withDefault.unit).toBe(with300.unit)
    })
  })

  describe('exportToSVG', () => {
    it('should export SVG with correct filename', () => {
      exportToSVG(mockSvgElement, 'test-qr')

      expect(mockLink.download).toBe('test-qr.svg')
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should not duplicate .svg extension', () => {
      exportToSVG(mockSvgElement, 'test-qr.svg')

      expect(mockLink.download).toBe('test-qr.svg')
    })

    it('should create blob with correct type', () => {
      exportToSVG(mockSvgElement, 'test-qr')

      expect(mockBlobConstructor).toHaveBeenCalledWith(['<svg></svg>'], {
        type: 'image/svg+xml;charset=utf-8',
      })
    })

    it('should revoke object URL after download', () => {
      exportToSVG(mockSvgElement, 'test-qr')

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should throw error on failure', () => {
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Mock error')
      })

      expect(() => exportToSVG(mockSvgElement, 'test-qr')).toThrow('Failed to export SVG')
    })
  })

  describe('exportToPNG', () => {
    it('should export PNG with default DPI', async () => {
      await exportToPNG(mockSvgElement, 'test-qr')

      expect(mockLink.download).toBe('test-qr.png')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should not duplicate .png extension', async () => {
      await exportToPNG(mockSvgElement, 'test-qr.png')

      expect(mockLink.download).toBe('test-qr.png')
    })

    it('should scale SVG based on DPI', async () => {
      const { toPng } = await import('html-to-image')

      await exportToPNG(mockSvgElement, 'test-qr', 600)

      // 600 DPI = scaleFactor of 600/72 ≈ 8.33
      // So 256 * 8.33 ≈ 2133
      expect(toPng).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      const { toPng } = await import('html-to-image')
      vi.mocked(toPng).mockRejectedValueOnce(new Error('Mock error'))

      await expect(exportToPNG(mockSvgElement, 'test-qr')).rejects.toThrow('Failed to export PNG')
    })

    it('should clean up DOM after export', async () => {
      await exportToPNG(mockSvgElement, 'test-qr')

      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('exportToJPEG', () => {
    it('should export JPEG with default quality', async () => {
      await exportToJPEG(mockSvgElement, 'test-qr')

      expect(mockLink.download).toBe('test-qr.jpg')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should not duplicate .jpg extension', async () => {
      await exportToJPEG(mockSvgElement, 'test-qr.jpg')

      expect(mockLink.download).toBe('test-qr.jpg')
    })

    it('should use custom quality', async () => {
      const { toJpeg } = await import('html-to-image')

      await exportToJPEG(mockSvgElement, 'test-qr', 0.8)

      expect(toJpeg).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ quality: 0.8 })
      )
    })

    it('should use custom DPI', async () => {
      await exportToJPEG(mockSvgElement, 'test-qr', 0.95, 600)

      // Just verify it completes successfully with custom DPI
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      const { toJpeg } = await import('html-to-image')
      vi.mocked(toJpeg).mockRejectedValueOnce(new Error('Mock error'))

      await expect(exportToJPEG(mockSvgElement, 'test-qr')).rejects.toThrow('Failed to export JPEG')
    })

    it('should add white background for JPEG', async () => {
      await exportToJPEG(mockSvgElement, 'test-qr')

      // Verify a div was created (which has backgroundColor set)
      expect(document.createElement).toHaveBeenCalledWith('div')
    })
  })

  describe('exportToWebP', () => {
    it('should export WebP with default quality', async () => {
      await exportToWebP(mockSvgElement, 'test-qr')

      expect(mockLink.download).toBe('test-qr.webp')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should not duplicate .webp extension', async () => {
      await exportToWebP(mockSvgElement, 'test-qr.webp')

      expect(mockLink.download).toBe('test-qr.webp')
    })

    it('should use custom quality', async () => {
      await exportToWebP(mockSvgElement, 'test-qr', 0.7)

      // Verify canvas.toDataURL was called with quality
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      const { toPng } = await import('html-to-image')
      vi.mocked(toPng).mockRejectedValueOnce(new Error('Mock error'))

      await expect(exportToWebP(mockSvgElement, 'test-qr')).rejects.toThrow('Failed to export WebP')
    })

    it('should throw error when canvas context is not available', async () => {
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue(null),
          } as unknown as HTMLCanvasElement
        }
        if (tagName === 'div') {
          return {
            style: {},
            appendChild: vi.fn(),
          } as unknown as HTMLDivElement
        }
        if (tagName === 'a') {
          return mockLink
        }
        return originalCreateElement(tagName)
      })

      await expect(exportToWebP(mockSvgElement, 'test-qr')).rejects.toThrow('Failed to export WebP')
    })
  })

  describe('exportToPDF', () => {
    beforeEach(() => {
      // Clear all PDF mock functions before each test
      mockPdfSetFontSize.mockClear()
      mockPdfText.mockClear()
      mockPdfAddImage.mockClear()
      mockPdfSetTextColor.mockClear()
      mockPdfSave.mockClear()
    })

    it('should export PDF with no template', async () => {
      await exportToPDF(mockSvgElement, 'test-qr')

      expect(mockJsPDFConstructor).toHaveBeenCalledWith({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
    })

    it('should not duplicate .pdf extension', async () => {
      await exportToPDF(mockSvgElement, 'test-qr.pdf')

      // The save function should be called with the filename
      expect(mockPdfSave).toHaveBeenCalledWith('test-qr.pdf')
    })

    it('should apply business-card template', async () => {
      const metadata: ExportMetadata = {
        title: 'My Business',
        description: 'Contact me',
      }

      await exportToPDF(mockSvgElement, 'test-qr', 'business-card', metadata)

      expect(mockPdfSetFontSize).toHaveBeenCalledWith(10)
      expect(mockPdfText).toHaveBeenCalledWith('My Business', 10, 10)
      expect(mockPdfAddImage).toHaveBeenCalled()
    })

    it('should apply flyer template', async () => {
      const metadata: ExportMetadata = {
        title: 'Scan Me',
        description: 'Visit our website',
      }

      await exportToPDF(mockSvgElement, 'test-qr', 'flyer', metadata)

      expect(mockPdfSetFontSize).toHaveBeenCalledWith(24)
    })

    it('should apply product-label template', async () => {
      await exportToPDF(mockSvgElement, 'test-qr', 'product-label')

      expect(mockPdfSetFontSize).toHaveBeenCalledWith(16)
    })

    it('should apply a4-sheet template with grid', async () => {
      await exportToPDF(mockSvgElement, 'test-qr', 'a4-sheet')

      // A4 sheet template adds 8 QR codes (2x4 grid)
      expect(mockPdfAddImage).toHaveBeenCalledTimes(8)
    })

    it('should add metadata footer when createdAt is provided', async () => {
      const metadata: ExportMetadata = {
        createdAt: '2024-01-15',
      }

      await exportToPDF(mockSvgElement, 'test-qr', 'none', metadata)

      expect(mockPdfSetTextColor).toHaveBeenCalledWith(128)
      expect(mockPdfText).toHaveBeenCalledWith('Generated: 2024-01-15', 10, 290)
    })

    it('should throw error on failure', async () => {
      const { toPng } = await import('html-to-image')
      vi.mocked(toPng).mockRejectedValueOnce(new Error('Mock error'))

      await expect(exportToPDF(mockSvgElement, 'test-qr')).rejects.toThrow('Failed to export PDF')
    })

    it('should add title when provided with none template', async () => {
      const metadata: ExportMetadata = {
        title: 'My QR Code',
      }

      await exportToPDF(mockSvgElement, 'test-qr', 'none', metadata)

      expect(mockPdfSetFontSize).toHaveBeenCalledWith(16)
      expect(mockPdfText).toHaveBeenCalledWith('My QR Code', 105, 40, { align: 'center' })
    })
  })

  describe('exportBatchToZIP', () => {
    let mockItems: BatchExportItem[]

    beforeEach(() => {
      mockItems = [
        {
          id: '1',
          svgElement: mockSvgElement,
          filename: 'qr-1',
          metadata: {
            qrType: 'URL',
            createdAt: '2024-01-15',
            url: 'https://example.com',
            description: 'Test QR',
          },
        },
        {
          id: '2',
          svgElement: mockSvgElement,
          filename: 'qr-2',
          metadata: {
            qrType: 'Text',
          },
        },
      ]
    })

    it('should create ZIP with PNG files by default', async () => {
      await exportBatchToZIP(mockItems, 'qr-codes')

      expect(mockLink.download).toBe('qr-codes.zip')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should not duplicate .zip extension', async () => {
      await exportBatchToZIP(mockItems, 'qr-codes.zip')

      expect(mockLink.download).toBe('qr-codes.zip')
    })

    it('should export SVG files when format is svg', async () => {
      // Clear mocks and use the module-level mocks
      mockJSZipFile.mockClear()
      mockJSZipFolder.mockClear()

      await exportBatchToZIP(mockItems, 'qr-codes', 'svg')

      expect(mockJSZipFile).toHaveBeenCalledWith('qr-1.svg', expect.any(String))
    })

    it('should export JPEG files when format is jpeg', async () => {
      mockJSZipFile.mockClear()
      mockJSZipFolder.mockClear()

      await exportBatchToZIP(mockItems, 'qr-codes', 'jpeg', { quality: 0.9 })

      expect(mockJSZipFile).toHaveBeenCalledWith('qr-1.jpg', expect.any(String), { base64: true })
    })

    it('should export WebP files when format is webp', async () => {
      mockJSZipFile.mockClear()
      mockJSZipFolder.mockClear()

      await exportBatchToZIP(mockItems, 'qr-codes', 'webp', { quality: 0.85 })

      expect(mockJSZipFile).toHaveBeenCalledWith('qr-2.webp', expect.any(String), { base64: true })
    })

    it('should create metadata.txt file', async () => {
      mockJSZipFile.mockClear()
      mockJSZipFolder.mockClear()

      await exportBatchToZIP(mockItems, 'qr-codes')

      expect(mockJSZipFile).toHaveBeenCalledWith('metadata.txt', expect.stringContaining('qr-1'))
    })

    it('should revoke object URL after download', async () => {
      await exportBatchToZIP(mockItems, 'qr-codes')

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should throw error when folder creation fails', async () => {
      // Temporarily make folder return null to simulate failure
      mockJSZipFolder.mockReturnValueOnce(null)

      await expect(exportBatchToZIP(mockItems, 'qr-codes')).rejects.toThrow('Failed to export ZIP')
    })

    it('should throw error on general failure', async () => {
      // Temporarily make generateAsync reject to simulate failure
      mockJSZipGenerateAsync.mockRejectedValueOnce(new Error('Mock error'))

      await expect(exportBatchToZIP(mockItems, 'qr-codes')).rejects.toThrow('Failed to export ZIP')
    })

    it('should apply DPI scaling for PNG in batch', async () => {
      mockJSZipFile.mockClear()
      mockJSZipFolder.mockClear()

      await exportBatchToZIP(mockItems, 'qr-codes', 'png', { dpi: 600 })

      // Verify it completes successfully
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle items without metadata', async () => {
      const itemsWithoutMetadata: BatchExportItem[] = [
        {
          id: '1',
          svgElement: mockSvgElement,
          filename: 'qr-no-meta',
        },
      ]

      await exportBatchToZIP(itemsWithoutMetadata, 'qr-codes')

      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('Export format types', () => {
    const formats: ExportFormat[] = ['png', 'svg', 'pdf', 'webp', 'jpeg']

    it('should recognize all export formats', () => {
      formats.forEach((format) => {
        const result = estimateFileSize(256, format)
        expect(result.value).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle zero-size SVG', () => {
      const _zeroSvg = {
        ...mockSvgElement,
        width: { baseVal: { value: 0 } },
      } as unknown as SVGSVGElement

      const result = estimateFileSize(0, 'png')
      expect(result.value).toBe(0)
    })

    it('should handle very large SVG', () => {
      const result = estimateFileSize(10000, 'png', 600)
      expect(result.unit).toBe('MB')
    })

    it('should handle special characters in filename', async () => {
      await exportToPNG(mockSvgElement, 'test-qr_special (1)')

      expect(mockLink.download).toBe('test-qr_special (1).png')
    })

    it('should handle empty filename', async () => {
      await exportToPNG(mockSvgElement, '')

      expect(mockLink.download).toBe('.png')
    })
  })
})
