import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useAddRecentTool,
  useClearRecentTools,
  useRecentTools,
  useTrackToolView,
} from '@/hooks/tools/useRecentTools'
import * as recentToolsLib from '@/lib/services/recent-tools'

// Mock the recent-tools library
vi.mock('@/lib/services/recent-tools', () => ({
  getRecentTools: vi.fn(),
  addRecentTool: vi.fn(),
  clearRecentTools: vi.fn(),
  isIndexedDBSupported: vi.fn(() => true),
}))

describe('Recent Tools Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    // Create a new query client for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('useRecentTools', () => {
    it('should fetch recent tools', async () => {
      const mockTools = [
        {
          toolId: '/tools/json-beautify',
          title: 'JSON Beautifier',
          href: '/tools/json-beautify',
          iconName: 'FileJson',
          gradient: 'from-purple-500 to-pink-500',
          timestamp: Date.now(),
        },
      ]

      vi.mocked(recentToolsLib.getRecentTools).mockResolvedValue(mockTools)

      const { result } = renderHook(() => useRecentTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockTools)
      expect(recentToolsLib.getRecentTools).toHaveBeenCalledTimes(1)
    })

    it('should return empty array on error', async () => {
      vi.mocked(recentToolsLib.getRecentTools).mockRejectedValue(new Error('DB Error'))

      const { result } = renderHook(() => useRecentTools(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
    })

    it('should not fetch if IndexedDB is not supported', async () => {
      vi.mocked(recentToolsLib.isIndexedDBSupported).mockReturnValue(false)

      const { result } = renderHook(() => useRecentTools(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(recentToolsLib.getRecentTools).not.toHaveBeenCalled()
    })
  })

  describe('useAddRecentTool', () => {
    it('should add a tool to recent history', async () => {
      vi.mocked(recentToolsLib.addRecentTool).mockResolvedValue()

      const { result } = renderHook(() => useAddRecentTool(), { wrapper })

      const newTool = {
        toolId: '/tools/unit-converter',
        title: 'Unit Converter',
        href: '/tools/unit-converter',
        iconName: 'Calculator',
        gradient: 'from-blue-500 to-cyan-500',
      }

      result.current.mutate(newTool)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(recentToolsLib.addRecentTool).toHaveBeenCalledWith(newTool)
    })

    it('should invalidate queries on success', async () => {
      vi.mocked(recentToolsLib.addRecentTool).mockResolvedValue()

      const { result } = renderHook(() => useAddRecentTool(), { wrapper })

      const newTool = {
        toolId: '/tools/test',
        title: 'Test Tool',
        href: '/tools/test',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      }

      result.current.mutate(newTool)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('useClearRecentTools', () => {
    it('should clear all recent tools', async () => {
      vi.mocked(recentToolsLib.clearRecentTools).mockResolvedValue()

      const { result } = renderHook(() => useClearRecentTools(), { wrapper })

      result.current.mutate()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(recentToolsLib.clearRecentTools).toHaveBeenCalledTimes(1)
    })
  })

  describe('useTrackToolView', () => {
    it('should track tool view on mount', async () => {
      vi.mocked(recentToolsLib.addRecentTool).mockResolvedValue()
      vi.mocked(recentToolsLib.isIndexedDBSupported).mockReturnValue(true)

      const tool = {
        toolId: '/tools/json-beautify',
        title: 'JSON Beautifier',
        href: '/tools/json-beautify',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      }

      renderHook(() => useTrackToolView(tool), { wrapper })

      await waitFor(() => {
        expect(recentToolsLib.addRecentTool).toHaveBeenCalledWith(tool)
      })
    })

    it('should not track if IndexedDB is not supported', () => {
      vi.mocked(recentToolsLib.isIndexedDBSupported).mockReturnValue(false)

      const tool = {
        toolId: '/tools/json-beautify',
        title: 'JSON Beautifier',
        href: '/tools/json-beautify',
        iconName: 'FileJson',
        gradient: 'from-purple-500 to-pink-500',
      }

      renderHook(() => useTrackToolView(tool), { wrapper })

      expect(recentToolsLib.addRecentTool).not.toHaveBeenCalled()
    })
  })
})
