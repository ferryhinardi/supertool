import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFavorites } from '../useFavorites'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  it('should add and remove favorites', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => {
      result.current.addFavorite({
        toolId: 'qr-code',
        label: 'Test QR',
      })
    })

    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.favorites[0].toolId).toBe('qr-code')

    const favoriteId = result.current.favorites[0].id

    act(() => {
      result.current.removeFavorite(favoriteId)
    })

    expect(result.current.favorites).toHaveLength(0)
  })

  it('should toggle favorites', () => {
    const { result } = renderHook(() => useFavorites())

    // Add favorite
    let wasAdded = false
    act(() => {
      wasAdded = result.current.toggleFavorite({
        toolId: 'password-gen',
        label: 'Strong Password',
      })
    })

    expect(wasAdded).toBe(true)
    expect(result.current.favorites).toHaveLength(1)

    // Remove favorite
    let wasRemoved = false
    act(() => {
      wasRemoved = result.current.toggleFavorite(
        {
          toolId: 'password-gen',
          label: 'Strong Password',
        },
        result.current.favorites[0].id
      )
    })

    expect(wasRemoved).toBe(false)
    expect(result.current.favorites).toHaveLength(0)
  })

  it('should check if item is favorited', () => {
    const { result } = renderHook(() => useFavorites())

    let favoriteId = ''

    act(() => {
      const fav = result.current.addFavorite({
        toolId: 'test-tool',
        label: 'Test',
      })
      favoriteId = fav.id
    })

    expect(result.current.isFavorite(favoriteId)).toBe(true)
    expect(result.current.isFavorite('non-existent')).toBe(false)
  })

  it('should get favorites by tool', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => {
      result.current.addFavorite({ toolId: 'tool-a', label: 'Item 1' })
      result.current.addFavorite({ toolId: 'tool-a', label: 'Item 2' })
      result.current.addFavorite({ toolId: 'tool-b', label: 'Item 3' })
    })

    const toolAFavorites = result.current.getFavoritesByTool('tool-a')
    expect(toolAFavorites).toHaveLength(2)

    const toolBFavorites = result.current.getFavoritesByTool('tool-b')
    expect(toolBFavorites).toHaveLength(1)
  })

  it('should provide correct stats', () => {
    const { result } = renderHook(() => useFavorites())

    act(() => {
      result.current.addFavorite({ toolId: 'tool-a', label: 'Item 1' })
      result.current.addFavorite({ toolId: 'tool-a', label: 'Item 2' })
      result.current.addFavorite({ toolId: 'tool-b', label: 'Item 3' })
    })

    const stats = result.current.getStats()

    expect(stats.total).toBe(3)
    expect(stats.byTool['tool-a']).toBe(2)
    expect(stats.byTool['tool-b']).toBe(1)
    expect(stats.oldest).toBeDefined()
    expect(stats.newest).toBeDefined()
  })
})
