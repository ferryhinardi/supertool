import { describe, expect, it, vi } from 'vitest'
import { loadFFmpegModules } from '../ffmpeg-loader'

const mockFFmpeg = vi.fn()
const mockToBlobURL = vi.fn()
const mockFetchFile = vi.fn()

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: mockFFmpeg,
}))

vi.mock('@ffmpeg/util', () => ({
  fetchFile: mockFetchFile,
  toBlobURL: mockToBlobURL,
}))

describe('loadFFmpegModules', () => {
  it('loads the FFmpeg modules and returns the expected helpers', async () => {
    const modules = await loadFFmpegModules()

    expect(modules).toEqual({
      FFmpeg: mockFFmpeg,
      toBlobURL: mockToBlobURL,
      fetchFile: mockFetchFile,
    })
  })
})
