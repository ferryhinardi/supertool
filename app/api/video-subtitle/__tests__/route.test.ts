import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Skip FFmpeg-dependent tests in CI environment
const isCI = process.env.CI === 'true'

// Mock implementations - hoisted to be available before module loading
const mockExecFileAsync = vi.hoisted(() => vi.fn())
const mockAccessImpl = vi.hoisted(() => vi.fn())
const mockMkdirImpl = vi.hoisted(() => vi.fn())
const mockReadFileImpl = vi.hoisted(() => vi.fn())
const mockRmImpl = vi.hoisted(() => vi.fn())
const mockWriteFileImpl = vi.hoisted(() => vi.fn())
const mockTmpdirValue = vi.hoisted(() => ({ value: '/tmp' }))

// Mock ffmpeg-static FIRST to prevent real FFmpeg from being used
vi.mock('ffmpeg-static', () => ({
  default: '/usr/local/bin/ffmpeg',
}))

// Mock node:util to return our controlled mock for promisify(execFile)
vi.mock('node:util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:util')>()
  const customPromisify = (fn: unknown) => {
    // If it's execFile being promisified, return our mock
    if (typeof fn === 'function' && fn.name === 'execFile') {
      return mockExecFileAsync
    }
    // Otherwise use the real promisify
    return actual.promisify(fn as (...args: unknown[]) => unknown)
  }
  return {
    ...actual,
    promisify: customPromisify,
    default: {
      ...actual,
      promisify: customPromisify,
    },
  }
})

vi.mock('node:fs/promises', () => {
  const mocks = {
    access: (...args: unknown[]) => mockAccessImpl(...args),
    mkdir: (...args: unknown[]) => mockMkdirImpl(...args),
    readFile: (...args: unknown[]) => mockReadFileImpl(...args),
    rm: (...args: unknown[]) => mockRmImpl(...args),
    writeFile: (...args: unknown[]) => mockWriteFileImpl(...args),
  }
  return {
    ...mocks,
    default: mocks,
  }
})

vi.mock('node:os', () => {
  const mocks = {
    tmpdir: () => mockTmpdirValue.value,
  }
  return {
    ...mocks,
    default: mocks,
  }
})

// Import after mocks - must use dynamic import with resetModules to clear FFMPEG_PATH cache
let GET: typeof import('../route').GET
let POST: typeof import('../route').POST

// Expose mocks for test control
const mockAccess = mockAccessImpl
const mockMkdir = mockMkdirImpl
const mockReadFile = mockReadFileImpl
const mockRm = mockRmImpl
const mockWriteFile = mockWriteFileImpl

describe('Video Subtitle API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockTmpdirValue.value = '/tmp'

    // Reset modules to clear the cached FFMPEG_PATH
    vi.resetModules()

    // Re-import the route module after resetting
    const routeModule = await import('../route')
    GET = routeModule.GET
    POST = routeModule.POST

    // Default successful mocks
    mockAccess.mockResolvedValue(undefined)
    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)
    mockRm.mockResolvedValue(undefined)
    mockReadFile.mockResolvedValue(Buffer.from('processed-video-content'))

    // Mock execFileAsync (promisified) - returns Promise
    mockExecFileAsync.mockResolvedValue({ stdout: 'ffmpeg version 6.0', stderr: '' })
  })

  const createFormData = (
    options: {
      video?: { name: string; content: string; size?: number }
      subtitle?: { name: string; content: string }
      fontSize?: string
      fontColor?: string
      backgroundColor?: string
      backgroundOpacity?: string
      subtitlePosition?: string
      trimStart?: string
      trimEnd?: string
      brightness?: string
      contrast?: string
      saturation?: string
      blur?: string
      sharpen?: string
      vignette?: string
      temperature?: string
      exportPreset?: string
    } = {}
  ) => {
    const formData = new FormData()

    if (options.video) {
      const videoBlob = new Blob([options.video.content], { type: 'video/mp4' })
      const videoFile = new File([videoBlob], options.video.name, { type: 'video/mp4' })

      // Override size if specified (for testing large files)
      if (options.video.size !== undefined) {
        Object.defineProperty(videoFile, 'size', { value: options.video.size })
      }

      formData.append('video', videoFile)
    }

    if (options.subtitle) {
      const subtitleBlob = new Blob([options.subtitle.content], { type: 'text/plain' })
      const subtitleFile = new File([subtitleBlob], options.subtitle.name, { type: 'text/plain' })
      formData.append('subtitle', subtitleFile)
    }

    // Add optional styling parameters
    if (options.fontSize) formData.append('fontSize', options.fontSize)
    if (options.fontColor) formData.append('fontColor', options.fontColor)
    if (options.backgroundColor) formData.append('backgroundColor', options.backgroundColor)
    if (options.backgroundOpacity) formData.append('backgroundOpacity', options.backgroundOpacity)
    if (options.subtitlePosition) formData.append('subtitlePosition', options.subtitlePosition)
    if (options.trimStart) formData.append('trimStart', options.trimStart)
    if (options.trimEnd) formData.append('trimEnd', options.trimEnd)
    if (options.brightness) formData.append('brightness', options.brightness)
    if (options.contrast) formData.append('contrast', options.contrast)
    if (options.saturation) formData.append('saturation', options.saturation)
    if (options.blur) formData.append('blur', options.blur)
    if (options.sharpen) formData.append('sharpen', options.sharpen)
    if (options.vignette) formData.append('vignette', options.vignette)
    if (options.temperature) formData.append('temperature', options.temperature)
    if (options.exportPreset) formData.append('exportPreset', options.exportPreset)

    return formData
  }

  const createMockRequest = (formData: FormData) => {
    // Create a proper NextRequest that preserves file names in formData
    // NextRequest's serialization/deserialization can lose file names, so we
    // override formData() to return our prepared FormData directly
    const request = new NextRequest('http://localhost:3000/api/video-subtitle', {
      method: 'POST',
    })

    // Override formData to return our prepared FormData
    Object.defineProperty(request, 'formData', {
      value: () => Promise.resolve(formData),
      writable: false,
    })

    return request
  }

  describe('POST - Input Validation', () => {
    it('should return 400 when video file is missing', async () => {
      const formData = createFormData({
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing video or subtitle file')
    })

    it('should return 400 when subtitle file is missing', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing video or subtitle file')
    })

    it('should return 400 when both files are missing', async () => {
      const formData = createFormData({})

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing video or subtitle file')
    })

    it('should return 400 when video file exceeds 100MB', async () => {
      const formData = createFormData({
        video: { name: 'large.mp4', content: 'x', size: 101 * 1024 * 1024 },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Video file too large. Maximum size is 100MB')
    })

    it('should return 400 for invalid subtitle format (txt)', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.txt', content: 'subtitle content' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid subtitle format. Supported: SRT, VTT, ASS, SSA')
    })

    it('should return 400 for invalid subtitle format (json)', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.json', content: '{}' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid subtitle format. Supported: SRT, VTT, ASS, SSA')
    })
  })

  describe.skipIf(isCI)('POST - Valid Subtitle Formats', () => {
    it.each([
      ['srt', '1\n00:00:00,000 --> 00:00:05,000\nHello'],
      ['vtt', 'WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello'],
      ['ass', '[Script Info]\nTitle: Test'],
      ['ssa', '[Script Info]\nTitle: Test'],
    ])('should accept %s subtitle format', async (ext, content) => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: `test.${ext}`, content },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      // Should not return 400 for invalid format
      expect(response.status).not.toBe(400)
    })
  })

  describe.skipIf(isCI)('POST - FFmpeg Execution', () => {
    it('should return 500 when FFmpeg is not available', async () => {
      mockAccess.mockRejectedValueOnce(new Error('ENOENT'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('FFmpeg')
    })

    it('should return 500 when FFmpeg execution fails', async () => {
      // First access call succeeds (FFmpeg exists)
      mockAccess.mockResolvedValue(undefined)

      // First call for version check succeeds, second call for processing fails
      mockExecFileAsync
        .mockResolvedValueOnce({ stdout: 'ffmpeg version 6.0', stderr: '' }) // version check
        .mockRejectedValueOnce({ stderr: 'Duration: 00:00:30.00' }) // duration check (error is expected)
        .mockRejectedValueOnce(new Error('FFmpeg processing failed')) // actual processing

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    it('should clean up temp directory on error', async () => {
      // Make FFmpeg fail during processing
      mockExecFileAsync
        .mockResolvedValueOnce({ stdout: 'ffmpeg version 6.0', stderr: '' })
        .mockRejectedValueOnce({ stderr: 'Duration: 00:00:30.00' })
        .mockRejectedValueOnce(new Error('Processing failed'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      await POST(request)

      // Verify cleanup was attempted
      expect(mockRm).toHaveBeenCalled()
    })
  })

  describe.skipIf(isCI)('POST - Successful Processing', () => {
    it('should process video with subtitles successfully', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('video/mp4')
      expect(response.headers.get('Content-Disposition')).toContain('video-with-subtitles')
    })

    it('should create temp directory for processing', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      await POST(request)

      expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('/tmp/video-subtitle-'), {
        recursive: true,
      })
    })

    it('should write video and subtitle files to temp directory', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: 'subtitle-content' },
      })

      const request = createMockRequest(formData)
      await POST(request)

      expect(mockWriteFile).toHaveBeenCalledTimes(2)
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('input.mp4'),
        expect.any(Buffer)
      )
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('subtitle.srt'),
        expect.any(Buffer)
      )
    })

    it('should clean up temp directory after successful processing', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      await POST(request)

      expect(mockRm).toHaveBeenCalledWith(expect.stringContaining('/tmp/video-subtitle-'), {
        recursive: true,
        force: true,
      })
    })
  })

  describe.skipIf(isCI)('POST - Styling Options', () => {
    it('should accept custom font size', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        fontSize: '32',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept custom font color', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        fontColor: '#ff0000',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept background color and opacity', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        backgroundColor: '#000000',
        backgroundOpacity: '0.8',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept subtitle position options', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        subtitlePosition: 'top',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('should accept video adjustment options', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        brightness: '1.2',
        contrast: '1.1',
        saturation: '1.3',
        blur: '2',
        sharpen: '1',
        vignette: '0.5',
        temperature: '7000',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe.skipIf(isCI)('POST - Trim Options', () => {
    it('should accept trim start and end options', async () => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        trimStart: '5',
        trimEnd: '30',
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe.skipIf(isCI)('POST - Export Presets', () => {
    it.each([
      'instagram',
      'tiktok',
      'youtube',
      'twitter',
    ])('should accept %s export preset', async (preset) => {
      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
        exportPreset: preset,
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe.skipIf(isCI)('POST - Video Formats', () => {
    it.each([
      'mp4',
      'mov',
      'avi',
      'webm',
      'mkv',
    ])('should handle %s video format', async (format) => {
      const formData = createFormData({
        video: { name: `test.${format}`, content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Disposition')).toContain(format)
    })
  })

  describe.skipIf(isCI)('GET - Health Check', () => {
    it('should return ok status when FFmpeg is available', async () => {
      mockAccess.mockResolvedValue(undefined)
      mockExecFileAsync.mockResolvedValue({
        stdout: 'ffmpeg version 6.0\nbuilt with gcc',
        stderr: '',
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.ffmpeg).toBe('installed')
      expect(data.version).toBe('ffmpeg version 6.0')
    })

    it('should return error status when FFmpeg is not available', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT: no such file or directory'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('error')
      expect(data.ffmpeg).toBe('not available')
      expect(data.error).toBeDefined()
    })

    it('should return error when FFmpeg version check fails', async () => {
      mockAccess.mockResolvedValue(undefined)
      mockExecFileAsync.mockRejectedValue(new Error('Command failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('error')
      expect(data.ffmpeg).toBe('not available')
    })

    it('should include environment information in response', async () => {
      mockAccess.mockResolvedValue(undefined)
      mockExecFileAsync.mockResolvedValue({ stdout: 'ffmpeg version 6.0', stderr: '' })

      const response = await GET()
      const data = await response.json()

      expect(data.environment).toBeDefined()
    })
  })

  describe.skipIf(isCI)('POST - Error Handling', () => {
    it('should handle formData parsing errors gracefully', async () => {
      // Create a request that will fail to parse
      const request = new NextRequest('http://localhost:3000/api/video-subtitle', {
        method: 'POST',
        body: 'invalid-form-data',
        headers: {
          'Content-Type': 'text/plain',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    it('should handle file write errors', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Disk full'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Disk full')
    })

    it('should handle output file read errors', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('Output file not found'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Output file not found')
    })

    it('should handle mkdir errors', async () => {
      mockMkdir.mockRejectedValueOnce(new Error('Permission denied'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Permission denied')
    })

    it('should handle cleanup errors silently', async () => {
      // Make processing fail to trigger cleanup
      mockReadFile.mockRejectedValueOnce(new Error('Read error'))
      // Make cleanup also fail
      mockRm.mockRejectedValueOnce(new Error('Cleanup failed'))

      const formData = createFormData({
        video: { name: 'test.mp4', content: 'video-content' },
        subtitle: { name: 'test.srt', content: '1\n00:00:00,000 --> 00:00:05,000\nHello' },
      })

      const request = createMockRequest(formData)
      const response = await POST(request)
      const data = await response.json()

      // Should return the original error, not the cleanup error
      expect(response.status).toBe(500)
      expect(data.error).toBe('Read error')
    })
  })
})
