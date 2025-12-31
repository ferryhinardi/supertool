import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should debounce value updates with default delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated' })

    // Value should still be old immediately after update
    expect(result.current).toBe('initial')

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated')
      },
      { timeout: 400 }
    )
  })

  it('should debounce multiple rapid updates', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    // Simulate rapid typing
    rerender({ value: 'a' })
    rerender({ value: 'ab' })
    rerender({ value: 'abc' })
    rerender({ value: 'abcd' })

    // Should still show initial value
    expect(result.current).toBe('initial')

    // After delay, should show final value
    await waitFor(
      () => {
        expect(result.current).toBe('abcd')
      },
      { timeout: 400 }
    )
  })

  it('should use custom delay when provided', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    // Should update after custom 100ms delay
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('updated')

    vi.useRealTimers()
  })

  it('should cancel previous timeout on rapid updates', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    })

    // First update
    rerender({ value: 'first' })
    act(() => {
      vi.advanceTimersByTime(200) // Not enough time
    })
    expect(result.current).toBe('initial')

    // Second update (should cancel first timeout)
    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(200) // Not enough time again
    })
    expect(result.current).toBe('initial')

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('second')

    vi.useRealTimers()
  })

  it('should cleanup timeout on unmount', () => {
    vi.useFakeTimers()

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce('test', 300))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    clearTimeoutSpy.mockRestore()
    vi.useRealTimers()
  })

  it('should work with different data types', async () => {
    vi.useFakeTimers()

    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )

    numberRerender({ value: 42 })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(numberResult.current).toBe(42)

    // Test with boolean
    const { result: boolResult, rerender: boolRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: false } }
    )

    boolRerender({ value: true })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(boolResult.current).toBe(true)

    // Test with object
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: 'John' } } }
    )

    const newObj = { name: 'Jane' }
    objRerender({ value: newObj })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(objResult.current).toEqual(newObj)

    vi.useRealTimers()
  })

  it('should handle zero delay', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 0), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })

    // With 0 delay, should update almost immediately
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe('updated')

    vi.useRealTimers()
  })

  it('should handle same value updates', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'test' },
    })

    rerender({ value: 'test' }) // Same value

    await waitFor(
      () => {
        expect(result.current).toBe('test')
      },
      { timeout: 400 }
    )
  })

  it('should work in resume builder typing scenario', async () => {
    // Simulate real-world typing behavior
    interface Resume {
      name: string
      email: string
    }

    const { result, rerender } = renderHook(({ value }) => useDebounce<Resume>(value, 300), {
      initialProps: {
        value: { name: '', email: '' },
      },
    })

    // User types name character by character
    const typingSequence = [
      { name: 'J', email: '' },
      { name: 'Jo', email: '' },
      { name: 'Joh', email: '' },
      { name: 'John', email: '' },
    ]

    for (const resume of typingSequence) {
      rerender({ value: resume })
    }

    // Should still have initial value during typing
    expect(result.current).toEqual({ name: '', email: '' })

    // After debounce, should have final value
    await waitFor(
      () => {
        expect(result.current).toEqual({ name: 'John', email: '' })
      },
      { timeout: 400 }
    )
  })
})
