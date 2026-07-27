// @vitest-environment node
// FormData/File bodies must be Node (undici) natives: Node 24's fetch
// brand-checks multipart entries, so jsdom's File polyfill is rejected.
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock pdf-lib
const mockLoad = vi.hoisted(() => vi.fn())
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: mockLoad,
    create: mockCreate,
  },
}))

// Import after mocking
import { POST } from '../route'

describe('POST /api/pdf-unlock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockRequest = (formDataEntries: Record<string, string | File | null>) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(formDataEntries)) {
      if (value !== null) {
        formData.append(key, value)
      }
    }

    return new NextRequest('http://localhost:3000/api/pdf-unlock', {
      method: 'POST',
      body: formData,
    })
  }

  const createMockPDFFile = (name = 'test.pdf') => {
    const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // %PDF header
    return new File([pdfContent], name, { type: 'application/pdf' })
  }

  const createMockPdfDoc = (
    options: {
      pageCount?: number
      title?: string | undefined
      author?: string | undefined
      subject?: string | undefined
      keywords?: string[] | string | undefined
      creator?: string | undefined
      producer?: string | undefined
    } = {}
  ) => ({
    getPageCount: vi.fn().mockReturnValue(options.pageCount ?? 1),
    getTitle: vi.fn().mockReturnValue(options.title),
    getAuthor: vi.fn().mockReturnValue(options.author),
    getSubject: vi.fn().mockReturnValue(options.subject),
    getKeywords: vi.fn().mockReturnValue(options.keywords),
    getCreator: vi.fn().mockReturnValue(options.creator),
    getProducer: vi.fn().mockReturnValue(options.producer),
  })

  const createMockNewPdf = () => {
    const mockPage = { id: 'page1' }
    return {
      copyPages: vi.fn().mockResolvedValue([mockPage]),
      addPage: vi.fn(),
      setTitle: vi.fn(),
      setAuthor: vi.fn(),
      setSubject: vi.fn(),
      setKeywords: vi.fn(),
      setCreator: vi.fn(),
      setProducer: vi.fn(),
      save: vi.fn().mockResolvedValue(new Uint8Array([0x25, 0x50, 0x44, 0x46])),
    }
  }

  describe('Validation', () => {
    it('should return 400 if no file is provided', async () => {
      const request = createMockRequest({
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('No file provided')
    })

    it('should return 400 if password is missing', async () => {
      const request = createMockRequest({
        file: createMockPDFFile(),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password is required')
    })

    it('should return 400 if password is empty string', async () => {
      const request = createMockRequest({
        file: createMockPDFFile(),
        password: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password is required')
    })

    it('should return 400 if password is whitespace only', async () => {
      const request = createMockRequest({
        file: createMockPDFFile(),
        password: '   ',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password is required')
    })
  })

  describe('Successful PDF Unlock', () => {
    it('should unlock a PDF and return the unlocked file', async () => {
      const mockPdfDoc = createMockPdfDoc()
      const mockNewPdf = createMockNewPdf()

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const request = createMockRequest({
        file: createMockPDFFile('encrypted.pdf'),
        password: 'test1234',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/pdf')
      // Note: File name in FormData becomes 'blob' when using mock File objects
      expect(response.headers.get('Content-Disposition')).toContain(
        'attachment; filename="unlocked_'
      )

      expect(mockLoad).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ ignoreEncryption: true })
      )
      expect(mockCreate).toHaveBeenCalled()
      expect(mockNewPdf.copyPages).toHaveBeenCalledWith(mockPdfDoc, [0])
      expect(mockNewPdf.addPage).toHaveBeenCalled()
      expect(mockNewPdf.save).toHaveBeenCalled()
    })

    it('should handle multi-page PDFs', async () => {
      const mockPdfDoc = createMockPdfDoc({ pageCount: 5 })
      const mockNewPdf = createMockNewPdf()
      mockNewPdf.copyPages.mockResolvedValue([
        { id: 'page1' },
        { id: 'page2' },
        { id: 'page3' },
        { id: 'page4' },
        { id: 'page5' },
      ])

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockNewPdf.copyPages).toHaveBeenCalledWith(mockPdfDoc, [0, 1, 2, 3, 4])
      expect(mockNewPdf.addPage).toHaveBeenCalledTimes(5)
    })

    it('should copy metadata from original PDF', async () => {
      const mockPdfDoc = createMockPdfDoc({
        title: 'Test Document',
        author: 'John Doe',
        subject: 'Testing',
        keywords: ['test', 'pdf'],
        creator: 'Test Creator',
        producer: 'Test Producer',
      })
      const mockNewPdf = createMockNewPdf()

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockNewPdf.setTitle).toHaveBeenCalledWith('Test Document')
      expect(mockNewPdf.setAuthor).toHaveBeenCalledWith('John Doe')
      expect(mockNewPdf.setSubject).toHaveBeenCalledWith('Testing')
      expect(mockNewPdf.setKeywords).toHaveBeenCalledWith(['test', 'pdf'])
      expect(mockNewPdf.setCreator).toHaveBeenCalledWith('Test Creator')
      expect(mockNewPdf.setProducer).toHaveBeenCalledWith('Test Producer')
    })

    it('should handle keywords as string', async () => {
      const mockPdfDoc = createMockPdfDoc({
        keywords: 'single-keyword',
      })
      const mockNewPdf = createMockNewPdf()

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockNewPdf.setKeywords).toHaveBeenCalledWith(['single-keyword'])
    })

    it('should not set metadata if not present in original', async () => {
      const mockPdfDoc = createMockPdfDoc({
        title: undefined,
        author: undefined,
        subject: undefined,
        keywords: undefined,
        creator: undefined,
        producer: undefined,
      })
      const mockNewPdf = createMockNewPdf()

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockNewPdf.setTitle).not.toHaveBeenCalled()
      expect(mockNewPdf.setAuthor).not.toHaveBeenCalled()
      expect(mockNewPdf.setSubject).not.toHaveBeenCalled()
      expect(mockNewPdf.setKeywords).not.toHaveBeenCalled()
      expect(mockNewPdf.setCreator).not.toHaveBeenCalled()
      expect(mockNewPdf.setProducer).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should return 400 if PDF loading fails', async () => {
      mockLoad.mockRejectedValue(new Error('Invalid password'))

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'wrongpassword',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Failed to load PDF: Invalid password')
    })

    it('should return 400 for non-Error load failures', async () => {
      mockLoad.mockRejectedValue('Unknown load error')

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Failed to load PDF: Unknown load error')
    })

    it('should return 500 for errors after PDF is loaded', async () => {
      const mockPdfDoc = createMockPdfDoc()
      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockRejectedValue(new Error('Failed to create PDF'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create PDF')

      consoleSpy.mockRestore()
    })

    it('should return generic error for non-Error exceptions', async () => {
      const mockPdfDoc = createMockPdfDoc()
      const mockNewPdf = createMockNewPdf()
      mockNewPdf.save.mockRejectedValue('Save failed')

      mockLoad.mockResolvedValue(mockPdfDoc)
      mockCreate.mockResolvedValue(mockNewPdf)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to unlock PDF')

      consoleSpy.mockRestore()
    })
  })
})
