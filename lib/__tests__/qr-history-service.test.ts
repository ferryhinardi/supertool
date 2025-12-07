import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { QRCodeType } from '@/app/tools/qr-code/page'
import type { QRHistoryItem } from '../qr-history-service'
import {
  clearHistory,
  deleteHistoryItem,
  exportHistory,
  getFilteredHistory,
  getHistory,
  importHistory,
  saveToHistory,
  toggleFavorite,
} from '../qr-history-service'

describe('qr-history-service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  const createMockItem = (
    overrides?: Partial<Omit<QRHistoryItem, 'id' | 'timestamp'>>
  ): Omit<QRHistoryItem, 'id' | 'timestamp'> => ({
    type: 'url' as QRCodeType,
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
      logoSize: 0,
      logoOpacity: 1,
      logoPosition: 'center',
      logoMask: 'none',
      eyeColor: '#000000',
      hasEyeStyle: false,
      hasFrame: false,
      frameText: '',
      frameColor: '#000000',
    },
    thumbnail: 'data:image/png;base64,test',
    label: 'Test QR Code',
    ...overrides,
  })

  describe('saveToHistory', () => {
    it('should save a new QR code to history', () => {
      const item = createMockItem()
      const saved = saveToHistory(item)

      expect(saved).toHaveProperty('id')
      expect(saved).toHaveProperty('timestamp')
      expect(saved.content).toBe('https://example.com')
      expect(saved.type).toBe('url')
      expect(typeof saved.id).toBe('string')
      expect(typeof saved.timestamp).toBe('number')
    })

    it('should add new items to the beginning of history', () => {
      const item1 = createMockItem({ content: 'First' })
      const item2 = createMockItem({ content: 'Second' })

      saveToHistory(item1)
      saveToHistory(item2)

      const history = getHistory()
      expect(history[0].content).toBe('Second')
      expect(history[1].content).toBe('First')
    })

    it('should maintain maximum of 20 items using FIFO', () => {
      // Add 25 items
      for (let i = 0; i < 25; i++) {
        saveToHistory(createMockItem({ content: `Item ${i}` }))
      }

      const history = getHistory()
      expect(history.length).toBe(20)
      // Most recent item should be first
      expect(history[0].content).toBe('Item 24')
      // Oldest kept item should be last
      expect(history[19].content).toBe('Item 5')
    })

    it('should generate unique IDs for each item', () => {
      const item = createMockItem()
      const saved1 = saveToHistory(item)
      const saved2 = saveToHistory(item)

      expect(saved1.id).not.toBe(saved2.id)
    })

    it('should preserve all item properties', () => {
      const item = createMockItem({
        type: 'wifi' as QRCodeType,
        content: 'WIFI:S:MyNetwork;T:WPA;P:password123;;',
        label: 'Home WiFi',
        isFavorite: true,
      })

      const saved = saveToHistory(item)

      expect(saved.type).toBe('wifi')
      expect(saved.content).toBe('WIFI:S:MyNetwork;T:WPA;P:password123;;')
      expect(saved.label).toBe('Home WiFi')
      expect(saved.isFavorite).toBe(true)
    })
  })

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getHistory()
      expect(history).toEqual([])
    })

    it('should return stored history items', () => {
      const item1 = saveToHistory(createMockItem({ content: 'First' }))
      const item2 = saveToHistory(createMockItem({ content: 'Second' }))

      const history = getHistory()
      expect(history.length).toBe(2)
      expect(history[0].id).toBe(item2.id)
      expect(history[1].id).toBe(item1.id)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('qr_code_history', 'invalid json')
      const history = getHistory()
      expect(history).toEqual([])
    })

    it('should handle non-array localStorage data', () => {
      localStorage.setItem('qr_code_history', JSON.stringify({ not: 'array' }))
      const history = getHistory()
      expect(history).toEqual([])
    })

    it('should return empty array in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      const history = getHistory()
      expect(history).toEqual([])

      global.window = originalWindow
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite status from false to true', () => {
      const item = saveToHistory(createMockItem({ isFavorite: false }))
      toggleFavorite(item.id)

      const history = getHistory()
      expect(history[0].isFavorite).toBe(true)
    })

    it('should toggle favorite status from true to false', () => {
      const item = saveToHistory(createMockItem({ isFavorite: true }))
      toggleFavorite(item.id)

      const history = getHistory()
      expect(history[0].isFavorite).toBe(false)
    })

    it('should toggle favorite multiple times', () => {
      const item = saveToHistory(createMockItem({ isFavorite: false }))

      toggleFavorite(item.id)
      expect(getHistory()[0].isFavorite).toBe(true)

      toggleFavorite(item.id)
      expect(getHistory()[0].isFavorite).toBe(false)

      toggleFavorite(item.id)
      expect(getHistory()[0].isFavorite).toBe(true)
    })

    it('should not affect other items when toggling favorite', () => {
      const item1 = saveToHistory(createMockItem({ content: 'First', isFavorite: false }))
      saveToHistory(createMockItem({ content: 'Second', isFavorite: false }))

      toggleFavorite(item1.id)

      const history = getHistory()
      expect(history[1].isFavorite).toBe(true) // item1
      expect(history[0].isFavorite).toBe(false) // item2
    })

    it('should handle non-existent ID gracefully', () => {
      saveToHistory(createMockItem())
      toggleFavorite('non-existent-id')
      // Should not throw error
      expect(getHistory().length).toBe(1)
    })
  })

  describe('deleteHistoryItem', () => {
    it('should delete an item from history', () => {
      const item1 = saveToHistory(createMockItem({ content: 'First' }))
      const item2 = saveToHistory(createMockItem({ content: 'Second' }))

      deleteHistoryItem(item1.id)

      const history = getHistory()
      expect(history.length).toBe(1)
      expect(history[0].id).toBe(item2.id)
    })

    it('should handle deleting non-existent item', () => {
      saveToHistory(createMockItem())
      deleteHistoryItem('non-existent-id')

      const history = getHistory()
      expect(history.length).toBe(1)
    })

    it('should delete all items if called multiple times', () => {
      const item1 = saveToHistory(createMockItem())
      const item2 = saveToHistory(createMockItem())

      deleteHistoryItem(item1.id)
      deleteHistoryItem(item2.id)

      const history = getHistory()
      expect(history.length).toBe(0)
    })
  })

  describe('clearHistory', () => {
    it('should clear all history items', () => {
      saveToHistory(createMockItem())
      saveToHistory(createMockItem())
      saveToHistory(createMockItem())

      clearHistory()

      const history = getHistory()
      expect(history).toEqual([])
    })

    it('should handle clearing empty history', () => {
      clearHistory()
      const history = getHistory()
      expect(history).toEqual([])
    })

    it('should not throw in SSR environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - Simulating SSR
      delete global.window

      expect(() => clearHistory()).not.toThrow()

      global.window = originalWindow
    })
  })

  describe('exportHistory', () => {
    it('should export history as formatted JSON string', () => {
      const item = saveToHistory(createMockItem({ content: 'Test Export' }))

      const exported = exportHistory()
      const parsed = JSON.parse(exported)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed.length).toBe(1)
      expect(parsed[0].id).toBe(item.id)
      expect(parsed[0].content).toBe('Test Export')
    })

    it('should export empty array when no history', () => {
      const exported = exportHistory()
      expect(JSON.parse(exported)).toEqual([])
    })

    it('should export multiple items', () => {
      saveToHistory(createMockItem({ content: 'First' }))
      saveToHistory(createMockItem({ content: 'Second' }))
      saveToHistory(createMockItem({ content: 'Third' }))

      const exported = exportHistory()
      const parsed = JSON.parse(exported)

      expect(parsed.length).toBe(3)
    })

    it('should preserve all item properties in export', () => {
      const item = createMockItem({
        type: 'vcard' as QRCodeType,
        content: 'BEGIN:VCARD\nFN:John Doe\nEND:VCARD',
        label: 'Business Card',
        isFavorite: true,
      })
      saveToHistory(item)

      const exported = exportHistory()
      const parsed = JSON.parse(exported)

      expect(parsed[0].type).toBe('vcard')
      expect(parsed[0].content).toContain('John Doe')
      expect(parsed[0].label).toBe('Business Card')
      expect(parsed[0].isFavorite).toBe(true)
    })
  })

  describe('importHistory', () => {
    it('should import valid history items', () => {
      const items = [
        { ...createMockItem({ content: 'Import 1' }), id: '1', timestamp: Date.now() },
        { ...createMockItem({ content: 'Import 2' }), id: '2', timestamp: Date.now() },
      ]

      const count = importHistory(JSON.stringify(items))

      expect(count).toBe(2)
      const history = getHistory()
      expect(history.length).toBe(2)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => importHistory('invalid json')).toThrow()
    })

    it('should throw error for non-array JSON', () => {
      expect(() => importHistory(JSON.stringify({ not: 'array' }))).toThrow('expected an array')
    })

    it('should filter out invalid items', () => {
      const items = [
        { ...createMockItem({ content: 'Valid 1' }), id: '1', timestamp: Date.now() },
        { invalid: 'item' },
        { ...createMockItem({ content: 'Valid 2' }), id: '2', timestamp: Date.now() },
      ]

      const count = importHistory(JSON.stringify(items))

      expect(count).toBe(2)
      expect(getHistory().length).toBe(2)
    })

    it('should throw error when no valid items found', () => {
      const invalidItems = [{ invalid: 'item1' }, { invalid: 'item2' }]
      expect(() => importHistory(JSON.stringify(invalidItems))).toThrow('No valid QR history items')
    })

    it('should merge with existing history', () => {
      saveToHistory(createMockItem({ content: 'Existing' }))

      const importItems = [
        { ...createMockItem({ content: 'Import 1' }), id: '1', timestamp: Date.now() },
      ]

      importHistory(JSON.stringify(importItems))

      const history = getHistory()
      expect(history.length).toBe(2)
    })

    it('should remove duplicate items based on content and type', () => {
      const item = createMockItem({ content: 'Duplicate', type: 'url' as QRCodeType })
      saveToHistory(item)

      const importItems = [
        { ...item, id: 'different-id', timestamp: Date.now() },
        { ...createMockItem({ content: 'New Item' }), id: '2', timestamp: Date.now() },
      ]

      importHistory(JSON.stringify(importItems))

      const history = getHistory()
      // Should have 2 items (one duplicate removed)
      expect(history.length).toBe(2)
      expect(history.filter((h) => h.content === 'Duplicate').length).toBe(1)
    })

    it('should respect MAX_HISTORY_ITEMS limit when importing', () => {
      // Create 25 items to import
      const importItems = Array.from({ length: 25 }, (_, i) => ({
        ...createMockItem({ content: `Import ${i}` }),
        id: `${i}`,
        timestamp: Date.now() + i,
      }))

      importHistory(JSON.stringify(importItems))

      const history = getHistory()
      expect(history.length).toBe(20)
    })
  })

  describe('getFilteredHistory', () => {
    beforeEach(() => {
      // Setup test data with explicit timestamps to ensure proper ordering
      const history = [
        {
          ...createMockItem({
            content: 'https://example.com',
            type: 'url' as QRCodeType,
            label: 'Example Website',
            isFavorite: true,
          }),
          id: 'url-1',
          timestamp: 1000,
        },
        {
          ...createMockItem({
            content: 'WIFI:S:MyNetwork;T:WPA;P:password;;',
            type: 'wifi' as QRCodeType,
            label: 'Home WiFi',
            isFavorite: false,
          }),
          id: 'wifi-1',
          timestamp: 2000,
        },
        {
          ...createMockItem({
            content: 'mailto:test@example.com',
            type: 'email' as QRCodeType,
            label: 'Contact Email',
            isFavorite: true,
          }),
          id: 'email-1',
          timestamp: 3000,
        },
      ]
      localStorage.setItem('qr_code_history', JSON.stringify(history))
    })

    it('should return all items with no filters', () => {
      const result = getFilteredHistory('', 'all', 'newest', false)
      expect(result.length).toBe(3)
    })

    it('should filter by search query in content', () => {
      const result = getFilteredHistory('example.com', 'all', 'newest', false)
      expect(result.length).toBe(2) // URL and email both contain example.com
    })

    it('should filter by search query in label', () => {
      const result = getFilteredHistory('wifi', 'all', 'newest', false)
      expect(result.length).toBe(1)
      expect(result[0].label).toBe('Home WiFi')
    })

    it('should filter by search query in type', () => {
      const result = getFilteredHistory('url', 'all', 'newest', false)
      expect(result.length).toBe(1)
      expect(result[0].type).toBe('url')
    })

    it('should be case-insensitive when searching', () => {
      const result1 = getFilteredHistory('EXAMPLE', 'all', 'newest', false)
      const result2 = getFilteredHistory('example', 'all', 'newest', false)
      expect(result1.length).toBe(result2.length)
    })

    it('should filter by type', () => {
      const result = getFilteredHistory('', 'wifi' as QRCodeType, 'newest', false)
      expect(result.length).toBe(1)
      expect(result[0].type).toBe('wifi')
    })

    it('should show only favorites when flag is true', () => {
      const result = getFilteredHistory('', 'all', 'newest', true)
      expect(result.length).toBe(2)
      expect(result.every((item) => item.isFavorite)).toBe(true)
    })

    it('should sort by newest first', () => {
      const result = getFilteredHistory('', 'all', 'newest', false)
      expect(result[0].type).toBe('email') // timestamp 3000 (most recent)
      expect(result[1].type).toBe('wifi') // timestamp 2000
      expect(result[2].type).toBe('url') // timestamp 1000 (oldest)
    })

    it('should sort by oldest first', () => {
      const result = getFilteredHistory('', 'all', 'oldest', false)
      expect(result[0].type).toBe('url') // timestamp 1000 (oldest)
      expect(result[1].type).toBe('wifi') // timestamp 2000
      expect(result[2].type).toBe('email') // timestamp 3000 (most recent)
    })

    it('should sort by favorites first, then by timestamp', () => {
      const result = getFilteredHistory('', 'all', 'favorites', false)
      expect(result[0].isFavorite).toBe(true)
      expect(result[1].isFavorite).toBe(true)
      expect(result[2].isFavorite).toBe(false)
      // Among favorites, newer first
      expect(result[0].type).toBe('email')
      expect(result[1].type).toBe('url')
    })

    it('should combine multiple filters', () => {
      const result = getFilteredHistory('example', 'url' as QRCodeType, 'newest', true)
      expect(result.length).toBe(1)
      expect(result[0].type).toBe('url')
      expect(result[0].isFavorite).toBe(true)
    })

    it('should return empty array when no matches', () => {
      const result = getFilteredHistory('nonexistent', 'all', 'newest', false)
      expect(result).toEqual([])
    })

    it('should handle empty search query without trimming results', () => {
      const result = getFilteredHistory('   ', 'all', 'newest', false)
      expect(result.length).toBe(3)
    })
  })
})
