import type { IDBPDatabase } from 'idb'
import { openDB } from 'idb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetDBForTesting,
  addRecentTool,
  clearRecentTools,
  getRecentTools,
  isIndexedDBSupported,
  type RecentTool,
} from '@/lib/recent-tools'

// Mock idb
vi.mock('idb', () => ({
  openDB: vi.fn(),
}))

describe('Recent Tools Library', () => {
  let mockDB: {
    put: ReturnType<typeof vi.fn>
    getAllFromIndex: ReturnType<typeof vi.fn>
    clear: ReturnType<typeof vi.fn>
    transaction: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset the DB singleton instance for each test
    __resetDBForTesting()

    // Reset mocks
    vi.clearAllMocks()

    // Create mock IndexedDB instance - make it a new function each time
    const mockPut = vi.fn().mockResolvedValue(undefined)
    const mockGetAllFromIndex = vi.fn().mockResolvedValue([])
    const mockClear = vi.fn().mockResolvedValue(undefined)
    const mockTransaction = vi.fn(() => ({
      store: {
        delete: vi.fn().mockResolvedValue(undefined),
      },
      done: Promise.resolve(),
    }))

    mockDB = {
      put: mockPut,
      getAllFromIndex: mockGetAllFromIndex,
      clear: mockClear,
      transaction: mockTransaction,
    }

    // Mock openDB to return our mock DB
    vi.mocked(openDB).mockResolvedValue(mockDB as unknown as IDBPDatabase)
  })

  describe('isIndexedDBSupported', () => {
    it('should return true if window and indexedDB exist', () => {
      // In test environment, window and indexedDB should exist
      expect(isIndexedDBSupported()).toBe(true)
    })
  })

  describe('addRecentTool', () => {
    it('should add a tool to IndexedDB', async () => {
      const tool = {
        toolId: '/tools/json-beautify',
        title: 'JSON Beautifier',
        href: '/tools/json-beautify',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      }

      await addRecentTool(tool)

      expect(mockDB.put).toHaveBeenCalledWith(
        'recent-tools',
        expect.objectContaining({
          ...tool,
          timestamp: expect.any(Number),
        })
      )

      // Should also check for existing tools
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('recent-tools', 'by-timestamp')
    })

    it('should update existing tool with new timestamp', async () => {
      const existingTool = {
        toolId: '/tools/json-beautify',
        title: 'JSON Beautifier',
        href: '/tools/json-beautify',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
        timestamp: Date.now() - 1000,
      }

      mockDB.getAllFromIndex.mockResolvedValue([existingTool])

      await addRecentTool({
        toolId: existingTool.toolId,
        title: existingTool.title,
        href: existingTool.href,
        iconName: existingTool.iconName,
        gradient: existingTool.gradient,
      })

      expect(mockDB.put).toHaveBeenCalledWith(
        'recent-tools',
        expect.objectContaining({
          toolId: existingTool.toolId,
          timestamp: expect.any(Number),
        })
      )
    })

    it('should limit to 10 recent tools', async () => {
      const tools: RecentTool[] = Array.from({ length: 11 }, (_, i) => ({
        toolId: `/tools/tool-${i}`,
        title: `Tool ${i}`,
        href: `/tools/tool-${i}`,
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
        timestamp: Date.now() - i * 1000,
      }))

      mockDB.getAllFromIndex.mockResolvedValue(tools)

      await addRecentTool({
        toolId: '/tools/new-tool',
        title: 'New Tool',
        href: '/tools/new-tool',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      })

      // Should create transaction to delete oldest tool
      expect(mockDB.transaction).toHaveBeenCalledWith('recent-tools', 'readwrite')
    })

    it('should handle errors gracefully', async () => {
      mockDB.put.mockRejectedValue(new Error('DB Error'))

      const tool = {
        toolId: '/tools/test',
        title: 'Test',
        href: '/tools/test',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      }

      // Should not throw
      await expect(addRecentTool(tool)).resolves.toBeUndefined()
    })
  })

  describe('getRecentTools', () => {
    it('should fetch recent tools sorted by timestamp', async () => {
      const tools: RecentTool[] = [
        {
          toolId: '/tools/tool-1',
          title: 'Tool 1',
          href: '/tools/tool-1',
          iconName: 'FileJson',
          gradient: 'from-purple-500 to-pink-500',
          timestamp: 1000,
        },
        {
          toolId: '/tools/tool-2',
          title: 'Tool 2',
          href: '/tools/tool-2',
          iconName: 'Calculator',
          gradient: 'from-blue-500 to-cyan-500',
          timestamp: 2000,
        },
      ]

      mockDB.getAllFromIndex.mockResolvedValue(tools)

      const result = await getRecentTools()

      // Should be sorted by timestamp descending (newest first)
      expect(result).toHaveLength(2)
      expect(result[0].toolId).toBe('/tools/tool-2')
      expect(result[1].toolId).toBe('/tools/tool-1')
    })

    it('should limit to 10 tools', async () => {
      const tools: RecentTool[] = Array.from({ length: 15 }, (_, i) => ({
        toolId: `/tools/tool-${i}`,
        title: `Tool ${i}`,
        href: `/tools/tool-${i}`,
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
        timestamp: Date.now() - i * 1000,
      }))

      mockDB.getAllFromIndex.mockResolvedValue(tools)

      const result = await getRecentTools()

      expect(result).toHaveLength(10)
    })

    it('should return empty array on error', async () => {
      mockDB.getAllFromIndex.mockRejectedValue(new Error('DB Error'))

      const result = await getRecentTools()

      expect(result).toEqual([])
    })
  })

  describe('clearRecentTools', () => {
    it('should clear all recent tools', async () => {
      mockDB.clear.mockResolvedValue(undefined)

      await clearRecentTools()

      expect(mockDB.clear).toHaveBeenCalledWith('recent-tools')
    })

    it('should handle errors gracefully', async () => {
      mockDB.clear.mockRejectedValue(new Error('DB Error'))

      // Should not throw
      await expect(clearRecentTools()).resolves.toBeUndefined()
    })
  })
})
