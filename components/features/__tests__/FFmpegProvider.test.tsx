import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FFmpegProvider, useFFmpeg } from '../FFmpegProvider'

// Mock FFmpeg modules
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    exec: vi.fn(),
  })),
}))

vi.mock('@ffmpeg/util', () => ({
  toBlobURL: vi.fn().mockImplementation((url: string) => Promise.resolve(`blob:${url}`)),
  fetchFile: vi.fn(),
}))

// Test component that uses the hook
function TestComponent() {
  const { ffmpeg, isLoading, isError, error, load } = useFFmpeg()

  return (
    <div>
      <div data-testid="ffmpeg-status">{ffmpeg ? 'loaded' : 'not-loaded'}</div>
      <div data-testid="is-loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="is-error">{isError ? 'error' : 'no-error'}</div>
      <div data-testid="error-message">{error?.message || 'no-error'}</div>
      <button onClick={load}>Load FFmpeg</button>
    </div>
  )
}

describe('FFmpegProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(
      <FFmpegProvider>
        <div>Test Child</div>
      </FFmpegProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('provides FFmpeg context to children', () => {
    render(
      <FFmpegProvider>
        <TestComponent />
      </FFmpegProvider>
    )

    expect(screen.getByTestId('ffmpeg-status')).toHaveTextContent('not-loaded')
    expect(screen.getByTestId('is-loading')).toHaveTextContent('not-loading')
    expect(screen.getByTestId('is-error')).toHaveTextContent('no-error')
  })

  it('throws error when useFFmpeg is called outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useFFmpeg must be used within FFmpegProvider')

    consoleError.mockRestore()
  })

  it('provides loading state', () => {
    render(
      <FFmpegProvider>
        <TestComponent />
      </FFmpegProvider>
    )

    expect(screen.getByTestId('is-loading')).toBeInTheDocument()
  })

  it('provides error state', () => {
    render(
      <FFmpegProvider>
        <TestComponent />
      </FFmpegProvider>
    )

    expect(screen.getByTestId('is-error')).toBeInTheDocument()
  })

  it('provides error message', () => {
    render(
      <FFmpegProvider>
        <TestComponent />
      </FFmpegProvider>
    )

    expect(screen.getByTestId('error-message')).toBeInTheDocument()
  })

  it('provides load function', () => {
    render(
      <FFmpegProvider>
        <TestComponent />
      </FFmpegProvider>
    )

    expect(screen.getByRole('button', { name: /load ffmpeg/i })).toBeInTheDocument()
  })
})
