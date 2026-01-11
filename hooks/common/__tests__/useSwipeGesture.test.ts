import { act, renderHook } from '@testing-library/react'
import type { TouchEvent } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSwipeGesture, useSwipeToDelete } from '../useSwipeGesture'

// Helper to create mock TouchEvent
const createTouchEvent = (_type: string, clientX: number, clientY: number) => {
  return {
    touches: [{ clientX, clientY }],
    preventDefault: vi.fn(),
  } as unknown as TouchEvent
}

describe('useSwipeGesture', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns initial swipe state', () => {
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft: vi.fn() }))

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      direction: null,
      distance: 0,
      velocity: 0,
    })
  })

  it('returns touch handlers', () => {
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft: vi.fn() }))

    expect(result.current.handlers).toHaveProperty('onTouchStart')
    expect(result.current.handlers).toHaveProperty('onTouchMove')
    expect(result.current.handlers).toHaveProperty('onTouchEnd')
    expect(typeof result.current.handlers.onTouchStart).toBe('function')
    expect(typeof result.current.handlers.onTouchMove).toBe('function')
    expect(typeof result.current.handlers.onTouchEnd).toBe('function')
  })

  it('detects left swipe when threshold is met', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft, threshold: 100 }))

    // Start touch at x=200
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Move left by 150px (more than threshold)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
    })

    expect(result.current.swipeState.isSwiping).toBe(true)
    expect(result.current.swipeState.direction).toBe('left')
    expect(result.current.swipeState.distance).toBe(150)

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
  })

  it('detects right swipe when threshold is met', () => {
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeRight, threshold: 100 }))

    // Start touch at x=50
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 50, 100))
    })

    // Move right by 150px
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 200, 100))
    })

    expect(result.current.swipeState.direction).toBe('right')

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
  })

  it('does not trigger swipe when threshold is not met and velocity is low', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, threshold: 100, velocityThreshold: 10 })
    )

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Advance time to make velocity low (50px over 1000ms = 0.05 velocity, below threshold 10)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Move only 50px (less than threshold)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 150, 100))
    })

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does not trigger swipe for vertical movement', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft, threshold: 100 }))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Move vertically more than horizontally
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 195, 250))
    })

    expect(result.current.swipeState.isSwiping).toBe(false)

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('prevents scroll when preventScroll is true and swiping horizontally', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft: vi.fn(), preventScroll: true })
    )

    const mockEvent = createTouchEvent('touchmove', 50, 100)

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Move horizontally
    act(() => {
      result.current.handlers.onTouchMove(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('does not prevent scroll when preventScroll is false', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft: vi.fn(), preventScroll: false })
    )

    const mockEvent = createTouchEvent('touchmove', 50, 100)

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Move horizontally
    act(() => {
      result.current.handlers.onTouchMove(mockEvent)
    })

    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('resets state on touch end', () => {
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft: vi.fn() }))

    // Start and move
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
    })

    expect(result.current.swipeState.isSwiping).toBe(true)

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      direction: null,
      distance: 0,
      velocity: 0,
    })
  })

  it('uses default threshold of 100 when velocity is low', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft, velocityThreshold: 10 }))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Advance time to make velocity very low
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Move 99px (less than default 100)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 101, 100))
    })

    act(() => {
      result.current.handlers.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does not update state if touch start was not called', () => {
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft: vi.fn() }))

    // Move without starting
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
    })

    expect(result.current.swipeState.isSwiping).toBe(false)
  })

  it('calculates velocity during swipe', () => {
    const { result } = renderHook(() => useSwipeGesture({ onSwipeLeft: vi.fn() }))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Move left
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
    })

    expect(result.current.swipeState.velocity).toBeGreaterThan(0)
  })
})

describe('useSwipeToDelete', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    expect(result.current.isDeleting).toBe(false)
    expect(result.current.deleteProgress).toBe(0)
    expect(result.current.isSwiping).toBe(false)
    expect(result.current.swipeDirection).toBeNull()
  })

  it('returns touch handlers', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    expect(result.current.handlers).toHaveProperty('onTouchStart')
    expect(result.current.handlers).toHaveProperty('onTouchMove')
    expect(result.current.handlers).toHaveProperty('onTouchEnd')
  })

  it('updates deleteProgress during left swipe', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Swipe left by 60px (50% of 120 threshold)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
    })

    expect(result.current.deleteProgress).toBe(50)
    expect(result.current.isSwiping).toBe(true)
    expect(result.current.swipeDirection).toBe('left')
  })

  it('caps deleteProgress at 100', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 300, 100))
    })

    // Swipe left by 200px (more than 120 threshold)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 100, 100))
    })

    expect(result.current.deleteProgress).toBe(100)
  })

  it('does not update deleteProgress for right swipe', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 100, 100))
    })

    // Swipe right
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 200, 100))
    })

    expect(result.current.deleteProgress).toBe(0)
    expect(result.current.swipeDirection).toBe('right')
  })

  it('calls onDelete after swipe left completes', () => {
    const onDelete = vi.fn()
    const { result } = renderHook(() => useSwipeToDelete(onDelete))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 300, 100))
    })

    // Swipe left beyond threshold (120px)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 100, 100))
    })

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    // Should be in deleting state
    expect(result.current.isDeleting).toBe(true)

    // Fast-forward through the 300ms timeout
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.deleteProgress).toBe(0)
  })

  it('resets deleteProgress when not swiping', () => {
    const { result } = renderHook(() => useSwipeToDelete(vi.fn()))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Swipe left partially
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
    })

    expect(result.current.deleteProgress).toBeGreaterThan(0)

    // End touch without completing swipe (didn't reach threshold)
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    // Progress should reset
    expect(result.current.deleteProgress).toBe(0)
  })

  it('does not trigger delete when below threshold and velocity is low', () => {
    const onDelete = vi.fn()
    const { result } = renderHook(() => useSwipeToDelete(onDelete))

    // Start touch
    act(() => {
      result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
    })

    // Advance time to make velocity very low (distance/time will be low)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Swipe left by 100px (less than 120 threshold)
    act(() => {
      result.current.handlers.onTouchMove(createTouchEvent('touchmove', 100, 100))
    })

    // End touch
    act(() => {
      result.current.handlers.onTouchEnd()
    })

    // Should not trigger delete because distance < 120 and velocity is low
    expect(result.current.isDeleting).toBe(false)
    expect(onDelete).not.toHaveBeenCalled()
  })
})
