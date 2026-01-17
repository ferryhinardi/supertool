import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ChunkedUploadOptions,
  type ChunkMetadata,
  calculateOptimalChunkSize,
  estimateUploadTime,
  formatBytes,
  uploadFileInChunks,
} from '../chunked-upload'

describe('chunked-upload', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi.fn()
    global.FormData = class MockFormData {
      private data: Map<string, any> = new Map()
      append(key: string, value: any) {
        this.data.set(key, value)
      }
      get(key: string) {
        return this.data.get(key)
      }
    } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('uploadFileInChunks', () => {
    const createMockFile = (size: number, name = 'test.txt'): File => {
      const content = new Array(size).fill('a').join('')
      return new File([content], name, { type: 'text/plain' })
    }

    it('should upload file in chunks', async () => {
      const file = createMockFile(15 * 1024 * 1024, 'large-file.txt') // 15MB file
      const uploadUrl = 'https://api.example.com/upload'

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      const fileId = await uploadFileInChunks(file, uploadUrl, {
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
      })

      expect(fileId).toBeDefined()
      expect(typeof fileId).toBe('string')
      expect(fetch).toHaveBeenCalledTimes(3) // 15MB / 5MB = 3 chunks
    })

    it('should call onProgress callback', async () => {
      const file = createMockFile(10 * 1024 * 1024) // 10MB
      const onProgress = vi.fn()

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload', {
        chunkSize: 5 * 1024 * 1024,
        onProgress,
      })

      expect(onProgress).toHaveBeenCalled()
      expect(onProgress).toHaveBeenLastCalledWith(100, file.size, file.size)
    })

    it('should call onChunkComplete callback', async () => {
      const file = createMockFile(6 * 1024 * 1024) // 6MB
      const onChunkComplete = vi.fn()

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload', {
        chunkSize: 5 * 1024 * 1024,
        onChunkComplete,
      })

      expect(onChunkComplete).toHaveBeenCalledTimes(2) // 2 chunks
      expect(onChunkComplete).toHaveBeenNthCalledWith(1, 0, 2)
      expect(onChunkComplete).toHaveBeenNthCalledWith(2, 1, 2)
    })

    it('should retry failed chunks', async () => {
      const file = createMockFile(5 * 1024 * 1024)

      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: async () => 'OK',
        } as Response)

      const fileId = await uploadFileInChunks(file, 'https://api.example.com/upload', {
        retryAttempts: 3,
        retryDelay: 100,
      })

      expect(fileId).toBeDefined()
      expect(fetch).toHaveBeenCalledTimes(2) // 1 failure + 1 success
    })

    it('should throw error after max retry attempts', async () => {
      const file = createMockFile(5 * 1024 * 1024)

      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(
        uploadFileInChunks(file, 'https://api.example.com/upload', {
          retryAttempts: 2,
          retryDelay: 10,
        })
      ).rejects.toThrow('Failed to upload chunk 1/1 after 2 attempts')
    })

    it('should handle HTTP errors', async () => {
      const file = createMockFile(1 * 1024 * 1024)

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response)

      await expect(
        uploadFileInChunks(file, 'https://api.example.com/upload', {
          retryAttempts: 1,
        })
      ).rejects.toThrow('Failed to upload chunk')
    })

    it('should use default chunk size if not specified', async () => {
      const file = createMockFile(15 * 1024 * 1024)

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload')

      // Default chunk size is 5MB, so 15MB should be 3 chunks
      expect(fetch).toHaveBeenCalledTimes(3)
    })

    it('should include chunk metadata in upload', async () => {
      const file = createMockFile(5 * 1024 * 1024, 'test-file.pdf')

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload', {
        chunkSize: 5 * 1024 * 1024,
      })

      // Verify fetch was called
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(Object),
        })
      )
    })

    it('should handle small files (single chunk)', async () => {
      const file = createMockFile(1024 * 1024) // 1MB

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload', {
        chunkSize: 5 * 1024 * 1024,
      })

      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('should calculate progress correctly', async () => {
      const file = createMockFile(10 * 1024 * 1024)
      const progressValues: number[] = []
      const onProgress = vi.fn((progress) => progressValues.push(progress))

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      await uploadFileInChunks(file, 'https://api.example.com/upload', {
        chunkSize: 5 * 1024 * 1024,
        onProgress,
      })

      expect(progressValues[0]).toBe(50) // After first chunk
      expect(progressValues[1]).toBe(100) // After second chunk
    })

    it('should generate unique file IDs', async () => {
      const file = createMockFile(1 * 1024 * 1024)

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        text: async () => 'OK',
      } as Response)

      const fileId1 = await uploadFileInChunks(file, 'https://api.example.com/upload')
      const fileId2 = await uploadFileInChunks(file, 'https://api.example.com/upload')

      expect(fileId1).not.toBe(fileId2)
    })
  })

  describe('calculateOptimalChunkSize', () => {
    it('should return 1MB for small files (<10MB)', () => {
      expect(calculateOptimalChunkSize(5)).toBe(1 * 1024 * 1024)
      expect(calculateOptimalChunkSize(9.9)).toBe(1 * 1024 * 1024)
    })

    it('should return 5MB for medium files (10-50MB)', () => {
      expect(calculateOptimalChunkSize(10)).toBe(5 * 1024 * 1024)
      expect(calculateOptimalChunkSize(30)).toBe(5 * 1024 * 1024)
      expect(calculateOptimalChunkSize(49.9)).toBe(5 * 1024 * 1024)
    })

    it('should return 10MB for large files (50-200MB)', () => {
      expect(calculateOptimalChunkSize(50)).toBe(10 * 1024 * 1024)
      expect(calculateOptimalChunkSize(100)).toBe(10 * 1024 * 1024)
      expect(calculateOptimalChunkSize(199.9)).toBe(10 * 1024 * 1024)
    })

    it('should return 20MB for very large files (>=200MB)', () => {
      expect(calculateOptimalChunkSize(200)).toBe(20 * 1024 * 1024)
      expect(calculateOptimalChunkSize(500)).toBe(20 * 1024 * 1024)
      expect(calculateOptimalChunkSize(1000)).toBe(20 * 1024 * 1024)
    })

    it('should handle edge cases', () => {
      expect(calculateOptimalChunkSize(0)).toBe(1 * 1024 * 1024)
      expect(calculateOptimalChunkSize(0.1)).toBe(1 * 1024 * 1024)
    })

    it('should ignore connection speed parameter (reserved for future)', () => {
      expect(calculateOptimalChunkSize(50, 10)).toBe(10 * 1024 * 1024)
      expect(calculateOptimalChunkSize(50, 0.5)).toBe(10 * 1024 * 1024)
    })
  })

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes', () => {
      expect(formatBytes(100)).toBe('100.00 Bytes')
      expect(formatBytes(1023)).toBe('1023.00 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.00 KB')
      expect(formatBytes(1536)).toBe('1.50 KB')
      expect(formatBytes(10240)).toBe('10.00 KB')
    })

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
      expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB')
      expect(formatBytes(10.5 * 1024 * 1024)).toBe('10.50 MB')
    })

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
      expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB')
    })

    it('should handle edge cases', () => {
      expect(formatBytes(1)).toBe('1.00 Bytes')
      expect(formatBytes(1023.999)).toBe('1024.00 Bytes')
    })

    it('should always show 2 decimal places', () => {
      expect(formatBytes(1500)).toMatch(/\d+\.\d{2}/)
      expect(formatBytes(1024 * 1024 * Math.PI)).toMatch(/\d+\.\d{2}/)
    })
  })

  describe('estimateUploadTime', () => {
    it('should estimate upload time for various speeds', () => {
      // 100MB file at 10Mbps
      const time1 = estimateUploadTime(100, 10)
      expect(time1).toBeGreaterThan(0)
      expect(time1).toBeLessThan(200) // Should be reasonable

      // 100MB file at 100Mbps (faster)
      const time2 = estimateUploadTime(100, 100)
      expect(time2).toBeLessThan(time1)
    })

    it('should add 30% overhead', () => {
      // 80MB at 10Mbps = 80 / (10/8) = 64 seconds
      // With 30% overhead: 64 * 1.3 = 83.2 seconds
      const time = estimateUploadTime(80, 10)
      expect(time).toBe(84) // Rounded up
    })

    it('should handle slow connections', () => {
      const time = estimateUploadTime(10, 1) // 10MB at 1Mbps
      expect(time).toBeGreaterThan(100) // Should take over 100 seconds
    })

    it('should handle fast connections', () => {
      const time = estimateUploadTime(10, 100) // 10MB at 100Mbps
      expect(time).toBeLessThan(5) // Should be very fast
    })

    it('should round up to nearest second', () => {
      const time = estimateUploadTime(1, 10)
      expect(Number.isInteger(time)).toBe(true)
      expect(time).toBeGreaterThan(0)
    })

    it('should handle zero file size', () => {
      expect(estimateUploadTime(0, 10)).toBe(0)
    })

    it('should handle large files', () => {
      const time = estimateUploadTime(1000, 10) // 1GB at 10Mbps
      expect(time).toBeGreaterThan(1000)
    })

    it('should scale linearly with file size', () => {
      const time1 = estimateUploadTime(100, 10)
      const time2 = estimateUploadTime(200, 10)
      expect(time2).toBeCloseTo(time1 * 2, 0)
    })

    it('should scale inversely with speed', () => {
      const time1 = estimateUploadTime(100, 10)
      const time2 = estimateUploadTime(100, 20)
      expect(time2).toBeCloseTo(time1 / 2, 0)
    })
  })

  describe('Type definitions', () => {
    it('should define ChunkedUploadOptions interface', () => {
      const options: ChunkedUploadOptions = {
        chunkSize: 5 * 1024 * 1024,
        onProgress: () => {},
        onChunkComplete: () => {},
        retryAttempts: 3,
        retryDelay: 1000,
      }

      expect(options.chunkSize).toBe(5 * 1024 * 1024)
      expect(options.retryAttempts).toBe(3)
    })

    it('should define ChunkMetadata interface', () => {
      const metadata: ChunkMetadata = {
        fileId: 'test-123',
        fileName: 'test.pdf',
        totalChunks: 5,
        chunkIndex: 2,
        fileSize: 25 * 1024 * 1024,
      }

      expect(metadata.chunkIndex).toBe(2)
      expect(metadata.totalChunks).toBe(5)
    })

    it('should allow optional fields in ChunkedUploadOptions', () => {
      const options: ChunkedUploadOptions = {}
      expect(options.chunkSize).toBeUndefined()
      expect(options.onProgress).toBeUndefined()
    })
  })
})
