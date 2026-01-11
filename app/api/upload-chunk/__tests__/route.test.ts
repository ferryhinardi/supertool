import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoist the mock functions
const mockMkdir = vi.hoisted(() => vi.fn())
const mockWriteFile = vi.hoisted(() => vi.fn())
const mockTmpdir = vi.hoisted(() => vi.fn(() => '/tmp'))

// Mock fs/promises with importOriginal
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    default: {
      ...actual,
      mkdir: mockMkdir,
      writeFile: mockWriteFile,
    },
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
  }
})

// Mock os with importOriginal
vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>()
  return {
    ...actual,
    default: {
      ...actual,
      tmpdir: mockTmpdir,
    },
    tmpdir: mockTmpdir,
  }
})

// Import after mocking
import { DELETE, GET, POST } from '../route'

describe('Upload Chunk API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function createChunkFormData(
    chunkData: string,
    metadata: {
      fileId: string
      fileName: string
      totalChunks: number
      chunkIndex: number
      fileSize: number
    }
  ): FormData {
    const formData = new FormData()
    const blob = new Blob([chunkData], { type: 'application/octet-stream' })
    const file = new File([blob], 'chunk', { type: 'application/octet-stream' })
    formData.append('chunk', file)
    formData.append('metadata', JSON.stringify(metadata))
    return formData
  }

  function createPostRequest(formData: FormData): NextRequest {
    return new NextRequest('http://localhost:3000/api/upload-chunk', {
      method: 'POST',
      body: formData,
    })
  }

  function createGetRequest(fileId?: string): NextRequest {
    const url = fileId
      ? `http://localhost:3000/api/upload-chunk?fileId=${fileId}`
      : 'http://localhost:3000/api/upload-chunk'
    return new NextRequest(url, { method: 'GET' })
  }

  function createDeleteRequest(fileId?: string): NextRequest {
    const url = fileId
      ? `http://localhost:3000/api/upload-chunk?fileId=${fileId}`
      : 'http://localhost:3000/api/upload-chunk'
    return new NextRequest(url, { method: 'DELETE' })
  }

  describe('POST - Chunk Upload', () => {
    it('should return 400 if chunk is missing', async () => {
      const formData = new FormData()
      formData.append('metadata', JSON.stringify({ fileId: 'test-id' }))

      const request = createPostRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing chunk or metadata')
    })

    it('should return 400 if metadata is missing', async () => {
      const formData = new FormData()
      const blob = new Blob(['chunk-data'], { type: 'application/octet-stream' })
      formData.append('chunk', blob, 'chunk')

      const request = createPostRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing chunk or metadata')
    })

    it('should accept first chunk and return in_progress status', async () => {
      const formData = createChunkFormData('chunk-0-data', {
        fileId: 'test-file-1',
        fileName: 'video.mp4',
        totalChunks: 3,
        chunkIndex: 0,
        fileSize: 1000,
      })

      const request = createPostRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('in_progress')
      expect(data.fileId).toBe('test-file-1')
      expect(data.chunksReceived).toBe(1)
      expect(data.totalChunks).toBe(3)
      expect(data.progress).toBe(33)
    })

    it('should track progress for multiple chunks', async () => {
      // Upload chunk 0
      const formData1 = createChunkFormData('chunk-0', {
        fileId: 'test-file-2',
        fileName: 'video.mp4',
        totalChunks: 4,
        chunkIndex: 0,
        fileSize: 2000,
      })

      const response1 = await POST(createPostRequest(formData1))
      const data1 = await response1.json()

      expect(data1.progress).toBe(25)

      // Upload chunk 1
      const formData2 = createChunkFormData('chunk-1', {
        fileId: 'test-file-2',
        fileName: 'video.mp4',
        totalChunks: 4,
        chunkIndex: 1,
        fileSize: 2000,
      })

      const response2 = await POST(createPostRequest(formData2))
      const data2 = await response2.json()

      expect(data2.status).toBe('in_progress')
      expect(data2.chunksReceived).toBe(2)
      expect(data2.progress).toBe(50)
    })

    it('should return complete status when all chunks are received', async () => {
      const fileId = 'test-file-complete'

      // Upload all 2 chunks
      for (let i = 0; i < 2; i++) {
        const formData = createChunkFormData(`chunk-${i}-data`, {
          fileId,
          fileName: 'small-video.mp4',
          totalChunks: 2,
          chunkIndex: i,
          fileSize: 500,
        })

        const response = await POST(createPostRequest(formData))
        const data = await response.json()

        if (i < 1) {
          expect(data.status).toBe('in_progress')
        } else {
          expect(data.status).toBe('complete')
          expect(data.fileId).toBe(fileId)
          expect(data.filePath).toContain('small-video.mp4')
          expect(data.size).toBeGreaterThan(0)
        }
      }
    })

    it('should handle chunks received out of order', async () => {
      const fileId = 'test-file-ooo'

      // Upload chunk 1 first
      const formData1 = createChunkFormData('chunk-1-data', {
        fileId,
        fileName: 'video.mp4',
        totalChunks: 2,
        chunkIndex: 1,
        fileSize: 1000,
      })

      const response1 = await POST(createPostRequest(formData1))
      const data1 = await response1.json()

      expect(data1.status).toBe('in_progress')
      expect(data1.chunksReceived).toBe(1)

      // Upload chunk 0 second
      const formData0 = createChunkFormData('chunk-0-data', {
        fileId,
        fileName: 'video.mp4',
        totalChunks: 2,
        chunkIndex: 0,
        fileSize: 1000,
      })

      const response0 = await POST(createPostRequest(formData0))
      const data0 = await response0.json()

      expect(data0.status).toBe('complete')
    })
  })

  describe('GET - Upload Status', () => {
    it('should return 400 if fileId is missing', async () => {
      const request = createGetRequest()
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing fileId parameter')
    })

    it('should return 404 if upload not found', async () => {
      const request = createGetRequest('non-existent-file')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Upload not found')
    })

    it('should return upload status for existing upload', async () => {
      const fileId = 'test-file-status'

      // First upload a chunk
      const formData = createChunkFormData('chunk-data', {
        fileId,
        fileName: 'test.mp4',
        totalChunks: 3,
        chunkIndex: 0,
        fileSize: 1500,
      })

      await POST(createPostRequest(formData))

      // Then check status
      const request = createGetRequest(fileId)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('in_progress')
      expect(data.fileId).toBe(fileId)
      expect(data.chunksReceived).toBe(1)
      expect(data.totalChunks).toBe(3)
      expect(data.progress).toBe(33)
    })
  })

  describe('DELETE - Cancel Upload', () => {
    it('should return 400 if fileId is missing', async () => {
      const request = createDeleteRequest()
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing fileId parameter')
    })

    it('should return 404 if upload not found', async () => {
      const request = createDeleteRequest('non-existent-file')
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Upload not found')
    })

    it('should cancel existing upload', async () => {
      const fileId = 'test-file-cancel'

      // First upload a chunk
      const formData = createChunkFormData('chunk-data', {
        fileId,
        fileName: 'test.mp4',
        totalChunks: 5,
        chunkIndex: 0,
        fileSize: 5000,
      })

      await POST(createPostRequest(formData))

      // Then cancel
      const request = createDeleteRequest(fileId)
      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('cancelled')
      expect(data.fileId).toBe(fileId)

      // Verify it's gone
      const statusResponse = await GET(createGetRequest(fileId))
      expect(statusResponse.status).toBe(404)
    })
  })

  describe('Error Handling', () => {
    it('should return 500 for invalid JSON metadata', async () => {
      const formData = new FormData()
      const blob = new Blob(['chunk-data'], { type: 'application/octet-stream' })
      formData.append('chunk', new File([blob], 'chunk'))
      formData.append('metadata', 'not-valid-json')

      const request = createPostRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})
