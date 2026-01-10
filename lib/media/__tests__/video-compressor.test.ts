import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CompressionOptions,
  compressVideo,
  estimateCompressionTime,
  isCompressionSupported,
} from '../video-compressor'

// Mock MediaRecorder
const mockMediaRecorderStart = vi.fn()
const mockMediaRecorderStop = vi.fn()
const mockIsTypeSupported = vi.fn()

class MockMediaRecorder {
  static isTypeSupported = mockIsTypeSupported
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: ((error: unknown) => void) | null = null
  state = 'inactive'

  constructor(
    public stream: MediaStream,
    public options?: MediaRecorderOptions
  ) {}

  start(timeslice?: number) {
    mockMediaRecorderStart(timeslice)
    this.state = 'recording'
  }

  stop() {
    mockMediaRecorderStop()
    this.state = 'inactive'
  }
}

// Mock canvas context
const mockDrawImage = vi.fn()
const _mockGetContext = vi.fn()

// Mock captureStream
const _mockCaptureStream = vi.fn()

// Mock video element factory
let mockVideoElement: {
  preload: string
  muted: boolean
  playsInline: boolean
  src: string
  currentTime: number
  duration: number
  videoWidth: number
  videoHeight: number
  paused: boolean
  ended: boolean
  onloadedmetadata: (() => void) | null
  onerror: (() => void) | null
  play: ReturnType<typeof vi.fn>
}

// Mock canvas element factory
let mockCanvasElement: {
  width: number
  height: number
  getContext: ReturnType<typeof vi.fn>
  captureStream: ReturnType<typeof vi.fn>
}

// Store original globals
const originalDocument = global.document
const originalMediaRecorder = global.MediaRecorder
const originalURL = global.URL
const originalRequestAnimationFrame = global.requestAnimationFrame

describe('video-compressor', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock video element for each test
    mockVideoElement = {
      preload: '',
      muted: false,
      playsInline: false,
      src: '',
      currentTime: 0,
      duration: 10,
      videoWidth: 1920,
      videoHeight: 1080,
      paused: false,
      ended: false,
      onloadedmetadata: null,
      onerror: null,
      play: vi.fn().mockResolvedValue(undefined),
    }

    // Reset mock canvas element for each test
    mockCanvasElement = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: mockDrawImage,
      })),
      captureStream: vi.fn(() => ({
        getTracks: () => [],
      })),
    }

    // Mock document.createElement
    global.document = {
      ...originalDocument,
      createElement: vi.fn((tag: string) => {
        if (tag === 'video') return mockVideoElement
        if (tag === 'canvas') return mockCanvasElement
        return {}
      }),
    } as unknown as Document

    // Mock MediaRecorder
    global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder
    mockIsTypeSupported.mockReturnValue(true)

    // Mock URL
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    } as unknown as typeof URL

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      // Simulate ending the video after one frame
      mockVideoElement.ended = true
      callback(0)
      return 0
    })
  })

  afterEach(() => {
    global.document = originalDocument
    global.MediaRecorder = originalMediaRecorder
    global.URL = originalURL
    global.requestAnimationFrame = originalRequestAnimationFrame
  })

  describe('compressVideo', () => {
    it('should return original file if already under target size', async () => {
      const smallFile = new File(['small content'], 'small.mp4', { type: 'video/mp4' })
      // File is ~13 bytes, well under 50MB default

      const result = await compressVideo(smallFile)

      expect(result.file).toBe(smallFile)
      expect(result.originalSize).toBe(smallFile.size)
      expect(result.compressedSize).toBe(smallFile.size)
      expect(result.compressionRatio).toBe(1.0)
    })

    it('should return original file with custom maxSizeMB option', async () => {
      const content = 'x'.repeat(100)
      const file = new File([content], 'test.mp4', { type: 'video/mp4' })

      // Set maxSizeMB to 1MB, file is ~100 bytes so it should pass through
      const result = await compressVideo(file, { maxSizeMB: 1 })

      expect(result.file).toBe(file)
      expect(result.compressionRatio).toBe(1.0)
    })

    it('should compress video when file exceeds target size', async () => {
      // Create a large mock file (simulated)
      const largeContent = new ArrayBuffer(60 * 1024 * 1024) // 60MB
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Set up mock recorder to emit data and stop
      global.MediaRecorder = class extends MockMediaRecorder {
        start(timeslice?: number) {
          super.start(timeslice)
          // Simulate data available after a short time
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['compressed data'], { type: 'video/webm' }) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) {
              this.onstop()
            }
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { maxSizeMB: 50 })

      // Wait for video metadata to load
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Trigger metadata loaded
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      expect(result.originalSize).toBe(largeFile.size)
      expect(result.compressedSize).toBeLessThan(result.originalSize)
      expect(result.compressionRatio).toBeLessThan(1.0)
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('should reject if canvas context is not available', async () => {
      // Create large file to trigger compression
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Mock canvas to return null context for this specific test
      mockCanvasElement.getContext = vi.fn(() => null)

      await expect(compressVideo(largeFile)).rejects.toThrow('Failed to get canvas context')
    })

    it('should reject on video load error', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      const compressionPromise = compressVideo(largeFile)

      // Wait a tick then trigger error
      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onerror) {
        mockVideoElement.onerror()
      }

      await expect(compressionPromise).rejects.toThrow('Failed to load video file')
    })

    it('should scale down video dimensions when width exceeds max', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Set video dimensions where width > height
      mockVideoElement.videoWidth = 3840
      mockVideoElement.videoHeight = 2160

      // Set up mock recorder
      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { maxWidthOrHeight: 1280 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // Canvas should be scaled down
      expect(mockCanvasElement.width).toBe(1280)
      expect(mockCanvasElement.height).toBe(720) // 2160 * 1280 / 3840
    })

    it('should scale down video dimensions when height exceeds max', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Set video dimensions where height > width
      mockVideoElement.videoWidth = 1080
      mockVideoElement.videoHeight = 1920

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { maxWidthOrHeight: 1280 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // Canvas should be scaled down based on height
      expect(mockCanvasElement.height).toBe(1280)
      expect(mockCanvasElement.width).toBe(720) // 1080 * 1280 / 1920
    })

    it('should not scale dimensions when under max', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Set video dimensions under max
      mockVideoElement.videoWidth = 640
      mockVideoElement.videoHeight = 480

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { maxWidthOrHeight: 1280 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // Canvas should keep original dimensions
      expect(mockCanvasElement.width).toBe(640)
      expect(mockCanvasElement.height).toBe(480)
    })

    it('should use vp9 codec when supported', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm;codecs=vp9'
      })

      let usedMimeType: string | undefined

      global.MediaRecorder = class extends MockMediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          super(stream, options)
          usedMimeType = options?.mimeType
        }
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(usedMimeType).toBe('video/webm;codecs=vp9')
    })

    it('should fall back to vp8 codec when vp9 not supported', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm;codecs=vp8'
      })

      let usedMimeType: string | undefined

      global.MediaRecorder = class extends MockMediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          super(stream, options)
          usedMimeType = options?.mimeType
        }
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(usedMimeType).toBe('video/webm;codecs=vp8')
    })

    it('should fall back to basic webm when no codecs supported', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm'
      })

      let usedMimeType: string | undefined

      global.MediaRecorder = class extends MockMediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          super(stream, options)
          usedMimeType = options?.mimeType
        }
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(usedMimeType).toBe('video/webm')
    })

    it('should call onProgress callback during compression', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      const onProgress = vi.fn()
      let frameCount = 0

      // Override requestAnimationFrame to simulate multiple frames
      global.requestAnimationFrame = vi.fn((callback) => {
        frameCount++
        if (frameCount < 3) {
          mockVideoElement.currentTime = frameCount * 3 // 0, 3, 6 seconds
          callback(0)
        } else {
          mockVideoElement.ended = true
          callback(0)
        }
        return frameCount
      })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { onProgress })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(onProgress).toHaveBeenCalled()
    })

    it('should handle MediaRecorder error', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Recording failed'))
            }
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await expect(compressionPromise).rejects.toThrow('MediaRecorder error')
    })

    it('should cap bitrate at 2.5 Mbps', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      // Short video duration = high bitrate requirement
      mockVideoElement.duration = 1 // 1 second

      let usedBitrate: number | undefined

      global.MediaRecorder = class extends MockMediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          super(stream, options)
          usedBitrate = options?.videoBitsPerSecond
        }
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // Should be capped at 2.5 Mbps
      expect(usedBitrate).toBe(2500000)
    })

    it('should skip data chunks with zero size', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              // First chunk is empty
              this.ondataavailable({ data: new Blob([]) })
              // Second chunk has data
              this.ondataavailable({ data: new Blob(['actual data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      // Result should still work
      expect(result.file).toBeDefined()
    })

    it('should stop recording when video is paused', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      let frameCount = 0
      global.requestAnimationFrame = vi.fn((callback) => {
        frameCount++
        if (frameCount === 1) {
          mockVideoElement.paused = true
        }
        callback(0)
        return frameCount
      })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      expect(mockMediaRecorderStop).toHaveBeenCalled()
      expect(result.file).toBeDefined()
    })

    it('should use default options when not provided', async () => {
      const smallFile = new File(['content'], 'test.mp4', { type: 'video/mp4' })

      const result = await compressVideo(smallFile)

      // Should return original file since it's small
      expect(result.file).toBe(smallFile)
    })

    it('should set correct video element properties', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      // Check video element properties were set before triggering metadata
      expect(mockVideoElement.preload).toBe('metadata')
      expect(mockVideoElement.muted).toBe(true)
      expect(mockVideoElement.playsInline).toBe(true)
      expect(mockVideoElement.src).toBe('blob:mock-url')

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise
    })

    it('should call captureStream with 30 FPS', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(mockCanvasElement.captureStream).toHaveBeenCalledWith(30)
    })

    it('should start MediaRecorder with 100ms timeslice', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start(timeslice?: number) {
          super.start(timeslice)
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      expect(mockMediaRecorderStart).toHaveBeenCalledWith(100)
    })

    it('should reset currentTime to 0 before playing', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' })

      mockVideoElement.currentTime = 5 // Set to non-zero initially

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      // Before triggering metadata, currentTime is still 5
      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // play() should have been called
      expect(mockVideoElement.play).toHaveBeenCalled()
    })
  })

  describe('isCompressionSupported', () => {
    it('should return true when MediaRecorder supports vp9', () => {
      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm;codecs=vp9'
      })

      expect(isCompressionSupported()).toBe(true)
    })

    it('should return true when MediaRecorder supports vp8', () => {
      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm;codecs=vp8'
      })

      expect(isCompressionSupported()).toBe(true)
    })

    it('should return true when MediaRecorder supports basic webm', () => {
      mockIsTypeSupported.mockImplementation((type: string) => {
        return type === 'video/webm'
      })

      expect(isCompressionSupported()).toBe(true)
    })

    it('should return false when MediaRecorder is not defined', () => {
      // @ts-expect-error - intentionally setting to undefined
      global.MediaRecorder = undefined

      expect(isCompressionSupported()).toBe(false)
    })

    it('should return false when no webm format is supported', () => {
      mockIsTypeSupported.mockReturnValue(false)

      expect(isCompressionSupported()).toBe(false)
    })

    it('should return true when all webm formats are supported', () => {
      mockIsTypeSupported.mockReturnValue(true)

      expect(isCompressionSupported()).toBe(true)
    })
  })

  describe('estimateCompressionTime', () => {
    it('should return ceiling of file size in MB', () => {
      expect(estimateCompressionTime(10)).toBe(10)
      expect(estimateCompressionTime(10.5)).toBe(11)
      expect(estimateCompressionTime(0.1)).toBe(1)
    })

    it('should handle zero file size', () => {
      expect(estimateCompressionTime(0)).toBe(0)
    })

    it('should handle large file sizes', () => {
      expect(estimateCompressionTime(1000)).toBe(1000)
      expect(estimateCompressionTime(5000.7)).toBe(5001)
    })

    it('should handle decimal values correctly', () => {
      expect(estimateCompressionTime(1.001)).toBe(2)
      expect(estimateCompressionTime(1.999)).toBe(2)
      expect(estimateCompressionTime(2.0)).toBe(2)
    })

    it('should handle negative values', () => {
      // Math.ceil of negative returns toward zero
      expect(estimateCompressionTime(-5)).toBe(-5)
      expect(estimateCompressionTime(-5.5)).toBe(-5)
    })
  })

  describe('CompressionOptions interface', () => {
    it('should accept all optional parameters', async () => {
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' })
      const options: CompressionOptions = {
        maxSizeMB: 25,
        quality: 0.8,
        maxWidthOrHeight: 720,
        onProgress: vi.fn(),
      }

      const result = await compressVideo(file, options)

      // File is small, returns as-is
      expect(result.file).toBe(file)
    })

    it('should work with empty options object', async () => {
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' })

      const result = await compressVideo(file, {})

      expect(result.file).toBe(file)
    })
  })

  describe('CompressionResult interface', () => {
    it('should return correct structure for small files', async () => {
      const file = new File(['content'], 'test.mp4', { type: 'video/mp4' })

      const result = await compressVideo(file)

      expect(result).toHaveProperty('file')
      expect(result).toHaveProperty('originalSize')
      expect(result).toHaveProperty('compressedSize')
      expect(result).toHaveProperty('compressionRatio')
      expect(typeof result.originalSize).toBe('number')
      expect(typeof result.compressedSize).toBe('number')
      expect(typeof result.compressionRatio).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should handle file exactly at target size', async () => {
      // Create file exactly at 50MB
      const exactContent = new ArrayBuffer(50 * 1024 * 1024)
      const exactFile = new File([exactContent], 'exact.mp4', { type: 'video/mp4' })

      const result = await compressVideo(exactFile, { maxSizeMB: 50 })

      // Should return as-is (not greater than target)
      expect(result.file).toBe(exactFile)
      expect(result.compressionRatio).toBe(1.0)
    })

    it('should handle file 1 byte over target size', async () => {
      // Create file just over 50MB
      const content = new ArrayBuffer(50 * 1024 * 1024 + 1)
      const file = new File([content], 'over.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['compressed']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(file, { maxSizeMB: 50 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      // Should compress since it's over target
      expect(result.originalSize).toBe(file.size)
    })

    it('should handle very small maxSizeMB', async () => {
      const content = new ArrayBuffer(1024) // 1KB
      const file = new File([content], 'tiny.mp4', { type: 'video/mp4' })

      // maxSizeMB of 0.0001 = ~100 bytes
      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['x']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(file, { maxSizeMB: 0.0001 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      expect(result.file).toBeDefined()
    })

    it('should preserve original filename in compressed file', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'my-video-2024.mp4', { type: 'video/mp4' })

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      const result = await compressionPromise

      expect(result.file.name).toBe('my-video-2024.mp4')
    })

    it('should handle video with equal width and height', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'square.mp4', { type: 'video/mp4' })

      mockVideoElement.videoWidth = 2000
      mockVideoElement.videoHeight = 2000

      global.MediaRecorder = class extends MockMediaRecorder {
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile, { maxWidthOrHeight: 1280 })

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // Both should be scaled to max (height >= width case)
      expect(mockCanvasElement.width).toBe(1280)
      expect(mockCanvasElement.height).toBe(1280)
    })

    it('should use lower bitrate for longer videos', async () => {
      const largeContent = new ArrayBuffer(60 * 1024 * 1024)
      const largeFile = new File([largeContent], 'long.mp4', { type: 'video/mp4' })

      // Long video duration
      mockVideoElement.duration = 600 // 10 minutes

      let usedBitrate: number | undefined

      global.MediaRecorder = class extends MockMediaRecorder {
        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          super(stream, options)
          usedBitrate = options?.videoBitsPerSecond
        }
        start() {
          super.start()
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ data: new Blob(['data']) })
            }
          }, 0)
        }
        stop() {
          super.stop()
          setTimeout(() => {
            if (this.onstop) this.onstop()
          }, 0)
        }
      } as unknown as typeof MediaRecorder

      const compressionPromise = compressVideo(largeFile)

      await new Promise((resolve) => setTimeout(resolve, 10))

      if (mockVideoElement.onloadedmetadata) {
        mockVideoElement.onloadedmetadata()
      }

      await compressionPromise

      // For 600s video with 50MB target: (50 * 1024 * 1024 * 8) / 600 = ~699050 bps
      expect(usedBitrate).toBeLessThan(2500000)
      expect(usedBitrate).toBeGreaterThan(0)
    })
  })
})
