import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock pdf-lib
const mockLoad = vi.hoisted(() => vi.fn())

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: mockLoad,
  },
}))

// Import after mocking
import { POST } from '../route'

describe('POST /api/pdf-protect', () => {
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

    return new NextRequest('http://localhost:3000/api/pdf-protect', {
      method: 'POST',
      body: formData,
    })
  }

  const createMockPDFFile = (name = 'test.pdf') => {
    const pdfContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // %PDF header
    return new File([pdfContent], name, { type: 'application/pdf' })
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

    it('should return 400 if password is less than 4 characters', async () => {
      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'abc',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password must be at least 4 characters long')
    })
  })

  describe('Not Implemented Response', () => {
    it('should return 501 with valid inputs as feature is not implemented', async () => {
      const mockPdfDoc = {
        getPageCount: vi.fn().mockReturnValue(1),
      }
      mockLoad.mockResolvedValue(mockPdfDoc)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(501)
      expect(data.error).toContain('Password protection requires additional server setup')
    })

    it('should return 501 with owner password provided', async () => {
      const mockPdfDoc = {
        getPageCount: vi.fn().mockReturnValue(1),
      }
      mockLoad.mockResolvedValue(mockPdfDoc)

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'userpass',
        ownerPassword: 'ownerpass',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(501)
      expect(data.error).toContain('Password protection requires additional server setup')
    })

    it('should return 501 with valid permissions JSON', async () => {
      const mockPdfDoc = {
        getPageCount: vi.fn().mockReturnValue(1),
      }
      mockLoad.mockResolvedValue(mockPdfDoc)

      const permissions = JSON.stringify({
        printing: true,
        modifying: false,
        copying: true,
      })

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
        permissions,
      })

      const response = await POST(request)

      expect(response.status).toBe(501)
    })

    it('should handle invalid permissions JSON gracefully', async () => {
      const mockPdfDoc = {
        getPageCount: vi.fn().mockReturnValue(1),
      }
      mockLoad.mockResolvedValue(mockPdfDoc)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
        permissions: 'invalid-json',
      })

      const response = await POST(request)

      // Should still return 501 (feature not implemented) even with invalid JSON
      expect(response.status).toBe(501)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should return 500 if PDF loading fails', async () => {
      mockLoad.mockRejectedValue(new Error('Invalid PDF format'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Invalid PDF format')

      consoleSpy.mockRestore()
    })

    it('should return generic error message for non-Error objects', async () => {
      mockLoad.mockRejectedValue('Unknown error')

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        file: createMockPDFFile(),
        password: 'test1234',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to protect PDF')

      consoleSpy.mockRestore()
    })
  })
})
