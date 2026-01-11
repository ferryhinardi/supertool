import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearHistory,
  deleteHistoryItem,
  exportHistory,
  getFilteredHistory,
  getHistory,
  importHistory,
  type QRHistoryItem,
  saveToHistory,
  toggleFavorite,
} from '../qr-history-service'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get _store() {
      return store
    },
    _reset() {
      store = {}
    },
  }
})()

// Mock crypto.randomUUID
const mockUUID = vi.fn(() => 'test-uuid-1234')

describe('qr-history-service', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage)
    vi.stubGlobal('crypto', { randomUUID: mockUUID })
    mockLocalStorage._reset()
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    mockUUID.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Helper to create a valid QR history item
  const createMockItem = (
    overrides: Partial<QRHistoryItem> = {}
  ): Omit<QRHistoryItem, 'id' | 'timestamp'> => ({
    type: 'url',
    content: 'https://example.com',
    isFavorite: false,
    styleConfig: {
      preset: 'default',
      cornerStyle: 'square',
      dotStyle: 'square',
      hasGradient: false,
      gradientColor1: '#000000',
      gradientColor2: '#000000',
      hasLogo: false,
      logoUrl: '',
      logoSize: 50,
      logoOpacity: 1,
      logoPosition: 'center',
      logoMask: 'none',
      eyeColor: '#000000',
      hasEyeStyle: false,
      hasFrame: false,
      frameText: '',
      frameColor: '#000000',
    },
    thumbnail: 'data:image/png;base64,abc123',
    ...overrides,
  })

  const createFullMockItem = (overrides: Partial<QRHistoryItem> = {}): QRHistoryItem => ({
    id: 'test-id-1',
    timestamp: Date.now(),
    ...createMockItem(),
    ...overrides,
  })

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const result = getHistory()
      expect(result).toEqual([])
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('qr_code_history')
    })

    it('should return parsed history from localStorage', () => {
      const mockHistory = [createFullMockItem()]
      mockLocalStorage._store.qr_code_history = JSON.stringify(mockHistory)

      const result = getHistory()
      expect(result).toEqual(mockHistory)
    })

    it('should return empty array on parse error', () => {
      mockLocalStorage._store.qr_code_history = 'invalid json'

      const result = getHistory()
      expect(result).toEqual([])
    })

    it('should return empty array if parsed value is not an array', () => {
      mockLocalStorage._store.qr_code_history = JSON.stringify({ not: 'array' })

      const result = getHistory()
      expect(result).toEqual([])
    })

    it('should return empty array when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      const result = getHistory()
      expect(result).toEqual([])
    })
  })

  describe('saveToHistory', () => {
    it('should save a new item to history', () => {
      const mockItem = createMockItem()
      const now = Date.now()
      vi.setSystemTime(now)

      const result = saveToHistory(mockItem)

      expect(result.id).toBe('test-uuid-1234')
      expect(result.timestamp).toBe(now)
      expect(result.content).toBe('https://example.com')
      expect(mockLocalStorage.setItem).toHaveBeenCalled()

      vi.useRealTimers()
    })

    it('should add new items at the beginning of the array', () => {
      const existingItem = createFullMockItem({ id: 'existing-1', content: 'https://old.com' })
      mockLocalStorage._store.qr_code_history = JSON.stringify([existingItem])

      const newItem = createMockItem({ content: 'https://new.com' })
      saveToHistory(newItem)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData[0].content).toBe('https://new.com')
      expect(savedData[1].content).toBe('https://old.com')
    })

    it('should limit history to MAX_HISTORY_ITEMS (20)', () => {
      // Create 20 existing items
      const existingItems = Array.from({ length: 20 }, (_, i) =>
        createFullMockItem({ id: `item-${i}`, content: `https://example${i}.com` })
      )
      mockLocalStorage._store.qr_code_history = JSON.stringify(existingItems)

      const newItem = createMockItem({ content: 'https://new-item.com' })
      saveToHistory(newItem)

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(20)
      expect(savedData[0].content).toBe('https://new-item.com')
      // Last item should be removed (FIFO)
      expect(
        savedData.some((item: QRHistoryItem) => item.content === 'https://example19.com')
      ).toBe(false)
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite status from false to true', () => {
      const item = createFullMockItem({ id: 'test-1', isFavorite: false })
      mockLocalStorage._store.qr_code_history = JSON.stringify([item])

      toggleFavorite('test-1')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData[0].isFavorite).toBe(true)
    })

    it('should toggle favorite status from true to false', () => {
      const item = createFullMockItem({ id: 'test-1', isFavorite: true })
      mockLocalStorage._store.qr_code_history = JSON.stringify([item])

      toggleFavorite('test-1')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData[0].isFavorite).toBe(false)
    })

    it('should do nothing if item is not found', () => {
      const item = createFullMockItem({ id: 'test-1' })
      mockLocalStorage._store.qr_code_history = JSON.stringify([item])

      toggleFavorite('non-existent-id')

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('deleteHistoryItem', () => {
    it('should remove an item from history', () => {
      const items = [
        createFullMockItem({ id: 'item-1', content: 'https://one.com' }),
        createFullMockItem({ id: 'item-2', content: 'https://two.com' }),
      ]
      mockLocalStorage._store.qr_code_history = JSON.stringify(items)

      deleteHistoryItem('item-1')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(1)
      expect(savedData[0].id).toBe('item-2')
    })

    it('should do nothing if item does not exist', () => {
      const items = [createFullMockItem({ id: 'item-1' })]
      mockLocalStorage._store.qr_code_history = JSON.stringify(items)

      deleteHistoryItem('non-existent')

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(1)
    })
  })

  describe('clearHistory', () => {
    it('should remove all history from localStorage', () => {
      mockLocalStorage._store.qr_code_history = JSON.stringify([createFullMockItem()])

      clearHistory()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('qr_code_history')
    })

    it('should do nothing when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      clearHistory()

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('exportHistory', () => {
    it('should return JSON string of history', () => {
      const items = [createFullMockItem({ id: 'item-1' })]
      mockLocalStorage._store.qr_code_history = JSON.stringify(items)

      const result = exportHistory()

      expect(result).toBe(JSON.stringify(items, null, 2))
    })

    it('should return empty array JSON when no history', () => {
      const result = exportHistory()
      expect(result).toBe('[]')
    })
  })

  describe('importHistory', () => {
    it('should import valid history items', () => {
      const importItems = [createFullMockItem({ id: 'import-1', content: 'https://import1.com' })]

      const count = importHistory(JSON.stringify(importItems))

      expect(count).toBe(1)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should merge with existing history', () => {
      const existingItems = [
        createFullMockItem({ id: 'existing-1', content: 'https://existing.com' }),
      ]
      mockLocalStorage._store.qr_code_history = JSON.stringify(existingItems)

      const importItems = [createFullMockItem({ id: 'import-1', content: 'https://import.com' })]
      importHistory(JSON.stringify(importItems))

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(2)
    })

    it('should remove duplicates based on content and type', () => {
      const existingItems = [
        createFullMockItem({ id: 'existing-1', content: 'https://same.com', type: 'url' }),
      ]
      mockLocalStorage._store.qr_code_history = JSON.stringify(existingItems)

      const importItems = [
        createFullMockItem({ id: 'import-1', content: 'https://same.com', type: 'url' }),
      ]
      importHistory(JSON.stringify(importItems))

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(1)
    })

    it('should throw error for non-array JSON', () => {
      expect(() => importHistory('{"not": "array"}')).toThrow(
        'Invalid JSON format: expected an array'
      )
    })

    it('should throw error for invalid JSON', () => {
      expect(() => importHistory('invalid json')).toThrow()
    })

    it('should throw error when no valid items found', () => {
      const invalidItems = [{ invalid: 'item' }]
      expect(() => importHistory(JSON.stringify(invalidItems))).toThrow(
        'No valid QR history items found in JSON'
      )
    })

    it('should filter out invalid items', () => {
      const mixedItems = [
        createFullMockItem({ id: 'valid-1' }),
        { invalid: 'item' },
        { type: 'url' }, // missing required fields
      ]

      const count = importHistory(JSON.stringify(mixedItems))
      expect(count).toBe(1)
    })

    it('should limit imported history to MAX_HISTORY_ITEMS', () => {
      const importItems = Array.from({ length: 25 }, (_, i) =>
        createFullMockItem({ id: `import-${i}`, content: `https://import${i}.com` })
      )

      importHistory(JSON.stringify(importItems))

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1])
      expect(savedData.length).toBe(20)
    })
  })

  describe('getFilteredHistory', () => {
    const setupFilteredHistoryTest = () => {
      const items: QRHistoryItem[] = [
        createFullMockItem({
          id: '1',
          content: 'https://example.com',
          type: 'url',
          isFavorite: true,
          timestamp: 1000,
          label: 'Example Site',
        }),
        createFullMockItem({
          id: '2',
          content: 'john@example.com',
          type: 'email',
          isFavorite: false,
          timestamp: 2000,
        }),
        createFullMockItem({
          id: '3',
          content: 'Hello World',
          type: 'text',
          isFavorite: true,
          timestamp: 3000,
        }),
        createFullMockItem({
          id: '4',
          content: '+1234567890',
          type: 'phone',
          isFavorite: false,
          timestamp: 4000,
        }),
      ]
      mockLocalStorage._store.qr_code_history = JSON.stringify(items)
      return items
    }

    it('should return all items when no filters applied', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'all', 'newest', false)

      expect(result.length).toBe(4)
    })

    it('should filter by search query in content', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('example', 'all', 'newest', false)

      expect(result.length).toBe(2)
      expect(result.some((item) => item.content.includes('example'))).toBe(true)
    })

    it('should filter by search query in label', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('Site', 'all', 'newest', false)

      expect(result.length).toBe(1)
      expect(result[0].label).toBe('Example Site')
    })

    it('should filter by search query in type', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('email', 'all', 'newest', false)

      expect(result.length).toBe(1)
      expect(result[0].type).toBe('email')
    })

    it('should filter by type', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'url', 'newest', false)

      expect(result.length).toBe(1)
      expect(result[0].type).toBe('url')
    })

    it('should filter by favorites only', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'all', 'newest', true)

      expect(result.length).toBe(2)
      expect(result.every((item) => item.isFavorite)).toBe(true)
    })

    it('should sort by newest first', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'all', 'newest', false)

      expect(result[0].timestamp).toBe(4000)
      expect(result[3].timestamp).toBe(1000)
    })

    it('should sort by oldest first', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'all', 'oldest', false)

      expect(result[0].timestamp).toBe(1000)
      expect(result[3].timestamp).toBe(4000)
    })

    it('should sort by favorites (favorites first, then by timestamp)', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('', 'all', 'favorites', false)

      // Favorites should be first
      expect(result[0].isFavorite).toBe(true)
      expect(result[1].isFavorite).toBe(true)
      // Within favorites, sorted by timestamp (newest first)
      expect(result[0].timestamp).toBe(3000)
      expect(result[1].timestamp).toBe(1000)
    })

    it('should combine multiple filters', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('example', 'url', 'newest', true)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe('1')
    })

    it('should handle empty results gracefully', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('nonexistent', 'all', 'newest', false)

      expect(result).toEqual([])
    })

    it('should be case-insensitive for search', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('HELLO', 'all', 'newest', false)

      expect(result.length).toBe(1)
      expect(result[0].content).toBe('Hello World')
    })

    it('should ignore whitespace-only search queries', () => {
      setupFilteredHistoryTest()

      const result = getFilteredHistory('   ', 'all', 'newest', false)

      expect(result.length).toBe(4)
    })
  })
})
