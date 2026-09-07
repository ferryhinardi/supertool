import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from '../useMediaQuery'

type MediaQueryListListener = (event: MediaQueryListEvent) => void

function createMockMediaQueryList(initialMatches: boolean) {
  const listeners = new Set<MediaQueryListListener>()
  const mediaQueryList = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === 'change') {
        listeners.add(listener as MediaQueryListListener)
      }
    }),
    removeEventListener: vi.fn((event: string, listener: EventListener) => {
      if (event === 'change') {
        listeners.delete(listener as MediaQueryListListener)
      }
    }),
    addListener: vi.fn((listener: MediaQueryListListener) => {
      listeners.add(listener)
    }),
    removeListener: vi.fn((listener: MediaQueryListListener) => {
      listeners.delete(listener)
    }),
    dispatchEvent: vi.fn(),
    emit: (matches: boolean) => {
      mediaQueryList.matches = matches
      const event = { matches } as MediaQueryListEvent
      listeners.forEach((listener) => {
        listener(event)
      })
    },
  }
  return mediaQueryList
}

describe('useMediaQuery', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('returns the current matchMedia snapshot', () => {
    const mediaQueryList = createMockMediaQueryList(true)
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))

    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1023px)')
  })

  it('updates when the media query changes', () => {
    const mediaQueryList = createMockMediaQueryList(false)
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(max-width: 1023px)'))
    expect(result.current).toBe(false)

    act(() => {
      mediaQueryList.emit(true)
    })

    expect(result.current).toBe(true)
  })
})
