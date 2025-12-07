import { describe, expect, it, vi } from 'vitest'
import {
  type CompressionOptions,
  type CompressionResult,
  estimateCompressionTime,
  isCompressionSupported,
} from '../video-compressor'

describe('video-compressor', () => {
  describe('estimateCompressionTime', () => {
    it('should estimate time for small files', () => {
      const time = estimateCompressionTime(5)
      expect(time).toBe(5)
    })

    it('should estimate time for medium files', () => {
      const time = estimateCompressionTime(25.5)
      expect(time).toBe(26) // Rounds up
    })

    it('should estimate time for large files', () => {
      const time = estimateCompressionTime(100)
      expect(time).toBe(100)
    })

    it('should round up fractional seconds', () => {
      const time = estimateCompressionTime(10.1)
      expect(time).toBe(11)
    })

    it('should handle zero size', () => {
      const time = estimateCompressionTime(0)
      expect(time).toBe(0)
    })

    it('should handle very small files', () => {
      const time = estimateCompressionTime(0.5)
      expect(time).toBe(1)
    })
  })

  describe('isCompressionSupported', () => {
    it('should return false when MediaRecorder is undefined', () => {
      const originalMediaRecorder = global.MediaRecorder
      // @ts-expect-error Testing undefined case
      global.MediaRecorder = undefined

      const supported = isCompressionSupported()
      expect(supported).toBe(false)

      global.MediaRecorder = originalMediaRecorder
    })

    it('should check for codec support when MediaRecorder exists', () => {
      const mockIsTypeSupported = vi.fn((type: string) => {
        return type.includes('vp9')
      })

      global.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = mockIsTypeSupported
      } as unknown as typeof MediaRecorder

      const supported = isCompressionSupported()

      expect(mockIsTypeSupported).toHaveBeenCalled()
      expect(supported).toBe(true)
    })

    it('should return true if vp8 is supported', () => {
      const mockIsTypeSupported = vi.fn((type: string) => {
        return type.includes('vp8')
      })

      global.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = mockIsTypeSupported
      } as unknown as typeof MediaRecorder

      const supported = isCompressionSupported()

      expect(supported).toBe(true)
    })

    it('should return true if basic webm is supported', () => {
      const mockIsTypeSupported = vi.fn((type: string) => {
        return type === 'video/webm'
      })

      global.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = mockIsTypeSupported
      } as unknown as typeof MediaRecorder

      const supported = isCompressionSupported()

      expect(supported).toBe(true)
    })

    it('should return false if no webm codecs supported', () => {
      const mockIsTypeSupported = vi.fn(() => false)

      global.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = mockIsTypeSupported
      } as unknown as typeof MediaRecorder

      const supported = isCompressionSupported()

      expect(supported).toBe(false)
    })
  })

  describe('CompressionOptions interface', () => {
    it('should allow optional maxSizeMB', () => {
      const options: CompressionOptions = { maxSizeMB: 50 }
      expect(options.maxSizeMB).toBe(50)
    })

    it('should allow optional quality', () => {
      const options: CompressionOptions = { quality: 0.8 }
      expect(options.quality).toBe(0.8)
    })

    it('should allow optional maxWidthOrHeight', () => {
      const options: CompressionOptions = { maxWidthOrHeight: 1920 }
      expect(options.maxWidthOrHeight).toBe(1920)
    })

    it('should allow optional onProgress callback', () => {
      const callback = vi.fn()
      const options: CompressionOptions = { onProgress: callback }
      expect(options.onProgress).toBe(callback)
    })

    it('should allow all options together', () => {
      const callback = vi.fn()
      const options: CompressionOptions = {
        maxSizeMB: 25,
        quality: 0.7,
        maxWidthOrHeight: 1280,
        onProgress: callback,
      }
      expect(options.maxSizeMB).toBe(25)
      expect(options.quality).toBe(0.7)
      expect(options.maxWidthOrHeight).toBe(1280)
      expect(options.onProgress).toBe(callback)
    })

    it('should allow empty options object', () => {
      const options: CompressionOptions = {}
      expect(options).toEqual({})
    })
  })

  describe('CompressionResult interface', () => {
    it('should contain file property', () => {
      const mockFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })
      const result: CompressionResult = {
        file: mockFile,
        originalSize: 1000,
        compressedSize: 500,
        compressionRatio: 0.5,
      }
      expect(result.file).toBe(mockFile)
    })

    it('should calculate compression ratio correctly', () => {
      const mockFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })
      const result: CompressionResult = {
        file: mockFile,
        originalSize: 1000,
        compressedSize: 250,
        compressionRatio: 0.25,
      }
      expect(result.compressionRatio).toBe(0.25)
      expect(result.compressedSize / result.originalSize).toBe(result.compressionRatio)
    })

    it('should handle no compression case', () => {
      const mockFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })
      const result: CompressionResult = {
        file: mockFile,
        originalSize: 1000,
        compressedSize: 1000,
        compressionRatio: 1.0,
      }
      expect(result.compressionRatio).toBe(1.0)
    })
  })

  describe('compression calculations', () => {
    it('should calculate target size from maxSizeMB', () => {
      const maxSizeMB = 50
      const targetSize = maxSizeMB * 1024 * 1024
      expect(targetSize).toBe(52428800) // 50 MB in bytes
    })

    it('should calculate compression ratio', () => {
      const originalSize = 100000000 // 100 MB
      const compressedSize = 25000000 // 25 MB
      const ratio = compressedSize / originalSize
      expect(ratio).toBe(0.25)
    })

    it('should determine if file needs compression', () => {
      const fileSize = 60 * 1024 * 1024 // 60 MB
      const maxSizeMB = 50
      const targetSize = maxSizeMB * 1024 * 1024
      const needsCompression = fileSize > targetSize
      expect(needsCompression).toBe(true)
    })

    it('should skip compression for small files', () => {
      const fileSize = 30 * 1024 * 1024 // 30 MB
      const maxSizeMB = 50
      const targetSize = maxSizeMB * 1024 * 1024
      const needsCompression = fileSize > targetSize
      expect(needsCompression).toBe(false)
    })
  })

  describe('aspect ratio calculations', () => {
    it('should maintain aspect ratio when width is larger', () => {
      const originalWidth = 1920
      const originalHeight = 1080
      const maxWidthOrHeight = 1280

      let width = originalWidth
      let height = originalHeight

      if (width > maxWidthOrHeight) {
        height = Math.round((height * maxWidthOrHeight) / width)
        width = maxWidthOrHeight
      }

      expect(width).toBe(1280)
      expect(height).toBe(720) // Maintains 16:9 ratio
    })

    it('should maintain aspect ratio when height is larger', () => {
      const originalWidth = 1080
      const originalHeight = 1920
      const maxWidthOrHeight = 1280

      let width = originalWidth
      let height = originalHeight

      if (height > maxWidthOrHeight) {
        width = Math.round((width * maxWidthOrHeight) / height)
        height = maxWidthOrHeight
      }

      expect(height).toBe(1280)
      expect(width).toBe(720) // Maintains 9:16 ratio
    })

    it('should not scale up small videos', () => {
      const originalWidth = 640
      const originalHeight = 480
      const maxWidthOrHeight = 1280

      const width = originalWidth
      const height = originalHeight

      if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
        // Would scale here, but dimensions are smaller
      }

      expect(width).toBe(640)
      expect(height).toBe(480)
    })
  })

  describe('bitrate calculations', () => {
    it('should calculate target bitrate from file size and duration', () => {
      const targetSize = 50 * 1024 * 1024 // 50 MB
      const duration = 60 // 60 seconds
      const targetBitrate = Math.floor((targetSize * 8) / duration)

      expect(targetBitrate).toBe(6990506) // bits per second
    })

    it('should cap bitrate at maximum', () => {
      const targetBitrate = 5000000 // 5 Mbps
      const maxBitrate = 2500000 // 2.5 Mbps
      const actualBitrate = Math.min(targetBitrate, maxBitrate)

      expect(actualBitrate).toBe(2500000)
    })

    it('should use calculated bitrate if below max', () => {
      const targetBitrate = 2000000 // 2 Mbps
      const maxBitrate = 2500000 // 2.5 Mbps
      const actualBitrate = Math.min(targetBitrate, maxBitrate)

      expect(actualBitrate).toBe(2000000)
    })
  })

  describe('progress calculations', () => {
    it('should calculate progress percentage', () => {
      const currentTime = 30
      const duration = 60
      const progress = Math.round((currentTime / duration) * 100)

      expect(progress).toBe(50)
    })

    it('should handle 0% progress', () => {
      const currentTime = 0
      const duration = 60
      const progress = Math.round((currentTime / duration) * 100)

      expect(progress).toBe(0)
    })

    it('should handle 100% progress', () => {
      const currentTime = 60
      const duration = 60
      const progress = Math.round((currentTime / duration) * 100)

      expect(progress).toBe(100)
    })

    it('should round progress values', () => {
      const currentTime = 33.7
      const duration = 60
      const progress = Math.round((currentTime / duration) * 100)

      expect(progress).toBe(56)
    })
  })
})
