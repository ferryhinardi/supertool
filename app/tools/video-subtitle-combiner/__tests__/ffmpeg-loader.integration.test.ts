import { describe, expect, it } from 'vitest'

/**
 * Integration test for FFmpeg loader
 * This tests the ACTUAL dynamic imports without mocking
 */
describe('FFmpeg Loader Integration', () => {
  it('should load FFmpeg modules dynamically in browser', async () => {
    // Test the actual loader without mocking
    const { loadFFmpegModules } = await import('@/lib/ffmpeg-loader')

    // This should not throw
    const modules = await loadFFmpegModules()

    // Verify all required exports exist
    expect(modules.FFmpeg).toBeDefined()
    expect(modules.toBlobURL).toBeDefined()
    expect(modules.fetchFile).toBeDefined()

    // Verify FFmpeg is a constructor
    expect(typeof modules.FFmpeg).toBe('function')
    expect(typeof modules.toBlobURL).toBe('function')
    expect(typeof modules.fetchFile).toBe('function')
  })

  it('should create FFmpeg instance successfully', async () => {
    const { loadFFmpegModules } = await import('@/lib/ffmpeg-loader')
    const { FFmpeg } = await loadFFmpegModules()

    // Create instance
    const ffmpeg = new FFmpeg()

    // Verify instance has required methods
    expect(ffmpeg.load).toBeDefined()
    expect(ffmpeg.on).toBeDefined()
    expect(ffmpeg.writeFile).toBeDefined()
    expect(ffmpeg.readFile).toBeDefined()
    expect(ffmpeg.exec).toBeDefined()
  })

  it('should load toBlobURL utility successfully', async () => {
    const { loadFFmpegModules } = await import('@/lib/ffmpeg-loader')
    const { toBlobURL } = await loadFFmpegModules()

    // Test toBlobURL with a fake URL
    const testUrl = 'https://example.com/test.js'
    const blobUrl = await toBlobURL(testUrl, 'text/javascript')

    // Should return a blob URL
    expect(blobUrl).toBeDefined()
    expect(typeof blobUrl).toBe('string')
  })

  it('should handle dynamic import correctly', async () => {
    // This tests if the dynamic import syntax works in the browser
    let error: Error | null = null

    try {
      const loaderModule = await import('@/lib/ffmpeg-loader')
      expect(loaderModule.loadFFmpegModules).toBeDefined()

      const modules = await loaderModule.loadFFmpegModules()
      expect(modules).toBeDefined()
    } catch (e) {
      error = e as Error
    }

    // Should not throw any error
    expect(error).toBeNull()
  })
})
