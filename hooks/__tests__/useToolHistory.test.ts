import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToolHistory } from '../useToolHistory'

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

describe('useToolHistory', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic Operations', () => {
    it('should initialize with empty history', () => {
      const { result } = renderHook(() =>
        useToolHistory({
          storageKey: 'test_history',
        })
      )

      expect(result.current.items).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })

    it('should add item to history', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        result.current.addItem({ text: 'Hello World' })
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].data.text).toBe('Hello World')
      expect(result.current.items[0].id).toBeDefined()
      expect(result.current.items[0].timestamp).toBeDefined()
    })

    it('should add multiple items with FIFO behavior', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
          maxItems: 3,
        })
      )

      act(() => {
        result.current.addItem({ text: 'First' })
        result.current.addItem({ text: 'Second' })
        result.current.addItem({ text: 'Third' })
        result.current.addItem({ text: 'Fourth' })
      })

      // Should have only 3 items (max)
      expect(result.current.items).toHaveLength(3)
      // Newest should be first
      expect(result.current.items[0].data.text).toBe('Fourth')
      expect(result.current.items[1].data.text).toBe('Third')
      expect(result.current.items[2].data.text).toBe('Second')
    })

    it('should delete item from history', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let itemId = ''

      act(() => {
        const item = result.current.addItem({ text: 'To Delete' })
        itemId = item.id
      })

      expect(result.current.items).toHaveLength(1)

      act(() => {
        result.current.deleteItem(itemId)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('should update item in history', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let itemId = ''

      act(() => {
        const item = result.current.addItem({ text: 'Original' })
        itemId = item.id
      })

      act(() => {
        result.current.updateItem(itemId, {
          data: { text: 'Updated' },
        })
      })

      expect(result.current.items[0].data.text).toBe('Updated')
    })

    it('should clear all history', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        result.current.addItem({ text: 'First' })
        result.current.addItem({ text: 'Second' })
      })

      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.clearAll()
      })

      expect(result.current.items).toHaveLength(0)
      // clearAll removes the key, which sets empty array instead of null
      const stored = localStorageMock.getItem('test_history')
      expect(stored === null || stored === '[]').toBe(true)
    })
  })

  describe('Favorites', () => {
    it('should toggle favorite status', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let itemId = ''

      act(() => {
        const item = result.current.addItem({ text: 'Favorite Me' })
        itemId = item.id
      })

      expect(result.current.items[0].isFavorite).toBe(false)

      act(() => {
        result.current.toggleFavorite(itemId)
      })

      expect(result.current.items[0].isFavorite).toBe(true)

      act(() => {
        result.current.toggleFavorite(itemId)
      })

      expect(result.current.items[0].isFavorite).toBe(false)
    })
  })

  describe('Filtering and Sorting', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should filter by search query', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ name: string; type: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        result.current.addItem({ name: 'Apple', type: 'fruit' })
        result.current.addItem({ name: 'Banana', type: 'fruit' })
        result.current.addItem({ name: 'Carrot', type: 'vegetable' })
      })

      const filtered = result.current.getFilteredItems({
        searchQuery: 'apple',
        searchFields: ['name'],
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].data.name).toBe('Apple')
    })

    it('should filter by favorites only', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let id1 = ''

      act(() => {
        const item1 = result.current.addItem({ text: 'First' })
        result.current.addItem({ text: 'Second' })
        id1 = item1.id
      })

      act(() => {
        result.current.toggleFavorite(id1)
      })

      const filtered = result.current.getFilteredItems({
        showFavoritesOnly: true,
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(id1)
    })

    it('should sort by newest (default)', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01'))
        result.current.addItem({ text: 'First' })

        vi.setSystemTime(new Date('2024-01-02'))
        result.current.addItem({ text: 'Second' })

        vi.setSystemTime(new Date('2024-01-03'))
        result.current.addItem({ text: 'Third' })
      })

      const sorted = result.current.getFilteredItems({
        sortBy: 'newest',
      })

      expect(sorted[0].data.text).toBe('Third')
      expect(sorted[1].data.text).toBe('Second')
      expect(sorted[2].data.text).toBe('First')
    })

    it('should sort by oldest', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        vi.setSystemTime(new Date('2024-01-01'))
        result.current.addItem({ text: 'First' })

        vi.setSystemTime(new Date('2024-01-02'))
        result.current.addItem({ text: 'Second' })

        vi.setSystemTime(new Date('2024-01-03'))
        result.current.addItem({ text: 'Third' })
      })

      const sorted = result.current.getFilteredItems({
        sortBy: 'oldest',
      })

      expect(sorted[0].data.text).toBe('First')
      expect(sorted[1].data.text).toBe('Second')
      expect(sorted[2].data.text).toBe('Third')
    })

    it('should sort by favorites', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let id2 = ''

      act(() => {
        result.current.addItem({ text: 'First' })
        const item2 = result.current.addItem({ text: 'Second' })
        result.current.addItem({ text: 'Third' })
        id2 = item2.id
      })

      act(() => {
        result.current.toggleFavorite(id2)
      })

      const sorted = result.current.getFilteredItems({
        sortBy: 'favorites',
      })

      expect(sorted[0].data.text).toBe('Second')
      expect(sorted[0].isFavorite).toBe(true)
    })
  })

  describe('Import/Export', () => {
    it('should export history as JSON', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        result.current.addItem({ text: 'First' })
        result.current.addItem({ text: 'Second' })
      })

      const exported = result.current.exportAsJSON()
      const parsed = JSON.parse(exported)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(2)
    })

    it('should import history from JSON', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      const jsonData = JSON.stringify([
        {
          id: '1',
          timestamp: Date.now(),
          isFavorite: false,
          data: { text: 'Imported 1' },
        },
        {
          id: '2',
          timestamp: Date.now(),
          isFavorite: true,
          data: { text: 'Imported 2' },
        },
      ])

      act(() => {
        const count = result.current.importFromJSON(jsonData)
        expect(count).toBe(2)
      })

      expect(result.current.items).toHaveLength(2)
    })

    it('should merge imported items with existing', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      act(() => {
        result.current.addItem({ text: 'Existing' })
      })

      const jsonData = JSON.stringify([
        {
          id: 'imported-1',
          timestamp: Date.now(),
          isFavorite: false,
          data: { text: 'Imported' },
        },
      ])

      act(() => {
        result.current.importFromJSON(jsonData)
      })

      expect(result.current.items).toHaveLength(2)
    })
  })

  describe('Statistics', () => {
    it('should return correct stats', () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      let id1 = ''

      act(() => {
        const item1 = result.current.addItem({ text: 'First' })
        result.current.addItem({ text: 'Second' })
        id1 = item1.id
      })

      act(() => {
        result.current.toggleFavorite(id1)
      })

      const stats = result.current.getStats()

      expect(stats.total).toBe(2)
      expect(stats.favorites).toBe(1)
      expect(stats.oldest).toBeDefined()
      expect(stats.newest).toBeDefined()
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should persist to localStorage on add', async () => {
      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
          autoSave: true,
        })
      )

      await act(async () => {
        result.current.addItem({ text: 'Persisted' })
        // Wait for useEffect to run
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      const stored = localStorageMock.getItem('test_history')
      expect(stored).not.toBeNull()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].data.text).toBe('Persisted')
    })

    it('should load from localStorage on mount', () => {
      const testData = [
        {
          id: '1',
          timestamp: Date.now(),
          isFavorite: false,
          data: { text: 'Loaded' },
        },
      ]

      localStorageMock.setItem('test_history', JSON.stringify(testData))

      const { result } = renderHook(() =>
        useToolHistory<{ text: string }>({
          storageKey: 'test_history',
        })
      )

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].data.text).toBe('Loaded')
    })
  })
})
