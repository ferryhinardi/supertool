import { describe, expect, it, vi } from 'vitest'
import { loadFFmpegModules } from '../ffmpeg-loader'

// Mock the FFmpeg modules
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: class FFmpeg {
    load = vi.fn()
    exec = vi.fn()
    on = vi.fn()
    off = vi.fn()
  },
}))

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: vi.fn((url: string) => Promise.resolve(`blob:${url}`)),
  fetchFile: vi.fn(() => Promise.resolve(new Uint8Array())),
}))

describe('ffmpeg-loader', () => {
  describe('loadFFmpegModules', () => {
    it('should load FFmpeg modules successfully', async () => {
      const modules = await loadFFmpegModules()

      expect(modules).toHaveProperty('FFmpeg')
      expect(modules).toHaveProperty('toBlobURL')
      expect(modules).toHaveProperty('fetchFile')
    })

    it('should return FFmpeg constructor', async () => {
      const { FFmpeg } = await loadFFmpegModules()

      expect(FFmpeg).toBeDefined()
      expect(typeof FFmpeg).toBe('function')
    })

    it('should return toBlobURL utility', async () => {
      const { toBlobURL } = await loadFFmpegModules()

      expect(toBlobURL).toBeDefined()
      expect(typeof toBlobURL).toBe('function')
    })

    it('should return fetchFile utility', async () => {
      const { fetchFile } = await loadFFmpegModules()

      expect(fetchFile).toBeDefined()
      expect(typeof fetchFile).toBe('function')
    })

    it('should allow creating FFmpeg instance', async () => {
      const { FFmpeg } = await loadFFmpegModules()
      const ffmpeg = new FFmpeg()

      expect(ffmpeg).toBeDefined()
      expect(ffmpeg).toHaveProperty('load')
      expect(ffmpeg).toHaveProperty('exec')
    })

    it('should allow calling toBlobURL', async () => {
      const { toBlobURL } = await loadFFmpegModules()
      const result = await toBlobURL('https://example.com/file.wasm', 'video/wasm')

      expect(result).toBe('blob:https://example.com/file.wasm')
    })

    it('should allow calling fetchFile', async () => {
      const { fetchFile } = await loadFFmpegModules()
      const result = await fetchFile('test-data')

      expect(result).toBeInstanceOf(Uint8Array)
    })

    it('should load modules multiple times consistently', async () => {
      const modules1 = await loadFFmpegModules()
      const modules2 = await loadFFmpegModules()

      expect(modules1.FFmpeg).toBeDefined()
      expect(modules2.FFmpeg).toBeDefined()
      expect(typeof modules1.FFmpeg).toBe(typeof modules2.FFmpeg)
    })

    it('should return all three required exports', async () => {
      const modules = await loadFFmpegModules()
      const keys = Object.keys(modules)

      expect(keys).toContain('FFmpeg')
      expect(keys).toContain('toBlobURL')
      expect(keys).toContain('fetchFile')
      expect(keys.length).toBe(3)
    })
  })
})
