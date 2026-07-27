'use client'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FFmpegProvider, useFFmpeg } from '../FFmpegProvider'

const mockFFmpegLoad = vi.fn()
const MockFFmpeg = vi.fn(function MockFFmpeg() {
  return { load: mockFFmpegLoad }
})
const mockToBlobURL = vi.fn()

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: MockFFmpeg,
}))

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: (...args: unknown[]) => mockToBlobURL(...args),
}))

function FFmpegProbe() {
  const { ffmpeg, isLoading, isError, error, load } = useFFmpeg()

  return (
    <div>
      <span>{ffmpeg ? 'ffmpeg-ready' : 'ffmpeg-missing'}</span>
      <span>{isLoading ? 'loading' : 'idle'}</span>
      <span>{isError ? 'error' : 'no-error'}</span>
      <span>{error?.message ?? 'no-message'}</span>
      <button onClick={() => void load()} type="button">
        Load FFmpeg
      </button>
    </div>
  )
}

describe('FFmpegProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToBlobURL.mockImplementation(async (url: string) => `blob:${url}`)
    mockFFmpegLoad.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws when useFFmpeg is used outside the provider', () => {
    expect(() => render(<FFmpegProbe />)).toThrow('useFFmpeg must be used within FFmpegProvider')
  })

  it('loads ffmpeg successfully and exposes the instance', async () => {
    const user = userEvent.setup()

    render(
      <FFmpegProvider>
        <FFmpegProbe />
      </FFmpegProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Load FFmpeg' }))

    await waitFor(() => {
      expect(screen.getByText('ffmpeg-ready')).toBeInTheDocument()
      expect(screen.getByText('idle')).toBeInTheDocument()
      expect(screen.getByText('no-error')).toBeInTheDocument()
    })

    expect(MockFFmpeg).toHaveBeenCalledTimes(1)
    expect(mockToBlobURL).toHaveBeenNthCalledWith(
      1,
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      'text/javascript'
    )
    expect(mockToBlobURL).toHaveBeenNthCalledWith(
      2,
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
      'application/wasm'
    )
    expect(mockFFmpegLoad).toHaveBeenCalledWith({
      coreURL: 'blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'blob:https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
    })
  })

  it('does not reload ffmpeg after it has already been initialized', async () => {
    const user = userEvent.setup()

    render(
      <FFmpegProvider>
        <FFmpegProbe />
      </FFmpegProvider>
    )

    const button = screen.getByRole('button', { name: 'Load FFmpeg' })
    await user.click(button)
    await waitFor(() => {
      expect(screen.getByText('ffmpeg-ready')).toBeInTheDocument()
    })

    await user.click(button)

    expect(MockFFmpeg).toHaveBeenCalledTimes(1)
    expect(mockFFmpegLoad).toHaveBeenCalledTimes(1)
  })

  it('surfaces load failures and uses a fallback error message for non-Error values', async () => {
    const user = userEvent.setup()
    mockFFmpegLoad.mockRejectedValueOnce('boom')

    render(
      <FFmpegProvider>
        <FFmpegProbe />
      </FFmpegProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Load FFmpeg' }))

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load FFmpeg')).toBeInTheDocument()
      expect(screen.getByText('idle')).toBeInTheDocument()
    })
  })
})
