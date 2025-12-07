import { act, renderHook } from '@testing-library/react'
import type React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSwipeGesture, useSwipeToDelete } from '../useSwipeGesture'

// Helper to create touch event mock
const createTouchEvent = (
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientX: number,
  clientY: number = 0
): React.TouchEvent => {
  return {
    type,
    touches: [{ clientX, clientY }],
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent
}

describe('useSwipeGesture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should return initial state and handlers', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
          onSwipeRight: vi.fn(),
        })
      )

      expect(result.current.swipeState).toEqual({
        isSwiping: false,
        direction: null,
        distance: 0,
        velocity: 0,
      })

      expect(result.current.handlers).toHaveProperty('onTouchStart')
      expect(result.current.handlers).toHaveProperty('onTouchMove')
      expect(result.current.handlers).toHaveProperty('onTouchEnd')
    })

    it('should use default threshold of 100', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
        })
      )

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      // Start touch
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Advance time to ensure low velocity
      vi.setSystemTime(startTime + 1000)

      // Move left but not past threshold (50px in 1000ms = 0.05 pixels/ms, below default 0.3 threshold)
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 150, 100))
      })

      // End touch
      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Should not trigger (distance = 50 < 100, velocity = 0.05 < 0.3)
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })

    it('should use custom threshold', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 30,
        })
      )

      // Start touch
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move left past custom threshold
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 160, 100))
      })

      // End touch
      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Should trigger (distance = 40, threshold = 30)
      expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    })
  })

  describe('swipe left detection', () => {
    it('should detect swipe left gesture', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 100,
        })
      )

      // Start touch at x=200
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move left to x=50 (distance = 150)
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

    it('should call onSwipeLeft when threshold is met', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 100,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 80, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    })

    it('should not call onSwipeLeft when threshold is not met', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 100,
        })
      )

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Advance time to ensure low velocity
      vi.setSystemTime(startTime + 1000)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 150, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Should not trigger (distance = 50 < 100, velocity = 0.05 < 0.3)
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('swipe right detection', () => {
    it('should detect swipe right gesture', () => {
      const onSwipeRight = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeRight,
          threshold: 100,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 50, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 200, 100))
      })

      expect(result.current.swipeState.isSwiping).toBe(true)
      expect(result.current.swipeState.direction).toBe('right')
      expect(result.current.swipeState.distance).toBe(150)

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(onSwipeRight).toHaveBeenCalledTimes(1)
    })

    it('should call onSwipeRight when threshold is met', () => {
      const onSwipeRight = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeRight,
          threshold: 100,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 50, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 170, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(onSwipeRight).toHaveBeenCalledTimes(1)
    })
  })

  describe('velocity threshold', () => {
    it('should trigger swipe with high velocity even if distance is small', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 100,
          velocityThreshold: 0.5, // 0.5 pixels per ms
        })
      )

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move 60px in 100ms = 0.6 pixels/ms velocity
      vi.setSystemTime(startTime + 100)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Should trigger due to velocity (0.6 > 0.5) even though distance (60) < threshold (100)
      expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    })

    it('should not trigger swipe with low velocity and insufficient distance', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 100,
          velocityThreshold: 0.5,
        })
      )

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move 40px in 200ms = 0.2 pixels/ms velocity
      vi.setSystemTime(startTime + 200)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 160, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Should not trigger (velocity: 0.2 < 0.5, distance: 40 < 100)
      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('scroll prevention', () => {
    it('should prevent scroll by default during horizontal swipe', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      const touchMoveEvent = createTouchEvent('touchmove', 180, 100)

      act(() => {
        result.current.handlers.onTouchMove(touchMoveEvent)
      })

      expect(touchMoveEvent.preventDefault).toHaveBeenCalled()
    })

    it('should not prevent scroll when preventScroll is false', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
          preventScroll: false,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      const touchMoveEvent = createTouchEvent('touchmove', 180, 100)

      act(() => {
        result.current.handlers.onTouchMove(touchMoveEvent)
      })

      expect(touchMoveEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('should not detect swipe for primarily vertical movement', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 100, 100))
      })

      // Move more vertically than horizontally (20px horizontal, 100px vertical)
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 80, 200))
      })

      expect(result.current.swipeState.isSwiping).toBe(false)

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(onSwipeLeft).not.toHaveBeenCalled()
    })
  })

  describe('state reset', () => {
    it('should reset state after swipe completes', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
          threshold: 100,
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
      })

      expect(result.current.swipeState.isSwiping).toBe(true)

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

    it('should reset state when touch ends without swiping', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
        })
      )

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // End without moving
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
  })

  describe('edge cases', () => {
    it('should handle touchMove without touchStart', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft: vi.fn(),
        })
      )

      // Call touchMove without touchStart
      expect(() => {
        act(() => {
          result.current.handlers.onTouchMove(createTouchEvent('touchmove', 100, 100))
        })
      }).not.toThrow()

      expect(result.current.swipeState.isSwiping).toBe(false)
    })

    it('should handle multiple rapid swipes', () => {
      const onSwipeLeft = vi.fn()

      const { result } = renderHook(() =>
        useSwipeGesture({
          onSwipeLeft,
          threshold: 50,
        })
      )

      // First swipe
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
      })
      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Second swipe
      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
      })
      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(onSwipeLeft).toHaveBeenCalledTimes(2)
    })

    it('should not call callback if callback is not provided', () => {
      const { result } = renderHook(() =>
        useSwipeGesture({
          // No onSwipeLeft or onSwipeRight
          threshold: 50,
        })
      )

      expect(() => {
        act(() => {
          result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
        })
        act(() => {
          result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
        })
        act(() => {
          result.current.handlers.onTouchEnd()
        })
      }).not.toThrow()
    })
  })
})

describe('useSwipeToDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should return handlers and initial state', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      expect(result.current.handlers).toHaveProperty('onTouchStart')
      expect(result.current.handlers).toHaveProperty('onTouchMove')
      expect(result.current.handlers).toHaveProperty('onTouchEnd')
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteProgress).toBe(0)
      expect(result.current.isSwiping).toBe(false)
      expect(result.current.swipeDirection).toBeNull()
    })

    it('should use threshold of 120', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 90, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      // Distance = 110, which is less than threshold 120
      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  describe('delete progress', () => {
    it('should calculate delete progress during left swipe', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move 60px left (50% of 120 threshold)
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
      })

      expect(result.current.deleteProgress).toBe(50)
      expect(result.current.isSwiping).toBe(true)
      expect(result.current.swipeDirection).toBe('left')
    })

    it('should cap delete progress at 100%', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move 180px left (150% of 120 threshold)
      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 20, 100))
      })

      expect(result.current.deleteProgress).toBe(100)
    })

    it('should reset progress when swipe ends', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 140, 100))
      })

      expect(result.current.deleteProgress).toBeGreaterThan(0)

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(result.current.deleteProgress).toBe(0)
    })

    it('should not show progress for right swipe', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 50, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 170, 100))
      })

      expect(result.current.deleteProgress).toBe(0)
      expect(result.current.swipeDirection).toBe('right')
    })
  })

  describe('delete action', () => {
    it('should trigger delete after successful left swipe', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 50, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(result.current.isDeleting).toBe(true)

      // Fast-forward 300ms
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onDelete).toHaveBeenCalledTimes(1)
      expect(result.current.isDeleting).toBe(false)
      expect(result.current.deleteProgress).toBe(0)
    })

    it('should not trigger delete for insufficient swipe distance', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Advance time to ensure low velocity
      vi.setSystemTime(startTime + 1000)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 100, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Should not trigger (distance = 100 < 120, velocity = 0.1 < 0.5)
      expect(onDelete).not.toHaveBeenCalled()
      expect(result.current.isDeleting).toBe(false)
    })

    it('should trigger delete with high velocity swipe', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useSwipeToDelete(onDelete))

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      act(() => {
        result.current.handlers.onTouchStart(createTouchEvent('touchstart', 200, 100))
      })

      // Move 80px in 100ms = 0.8 pixels/ms (velocity threshold is 0.5)
      vi.setSystemTime(startTime + 100)

      act(() => {
        result.current.handlers.onTouchMove(createTouchEvent('touchmove', 120, 100))
      })

      act(() => {
        result.current.handlers.onTouchEnd()
      })

      expect(result.current.isDeleting).toBe(true)

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })
})
