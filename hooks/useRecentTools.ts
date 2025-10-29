import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { RecentTool } from '@/lib/recent-tools'
import {
  addRecentTool,
  clearRecentTools,
  getRecentTools,
  isIndexedDBSupported,
} from '@/lib/recent-tools'

/**
 * Query key for recent tools
 */
export const RECENT_TOOLS_QUERY_KEY = ['recent-tools'] as const

/**
 * Hook to fetch recent tools from IndexedDB
 */
export function useRecentTools() {
  return useQuery({
    queryKey: RECENT_TOOLS_QUERY_KEY,
    queryFn: getRecentTools,
    enabled: isIndexedDBSupported(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  })
}

/**
 * Hook to add a tool to recent history
 */
export function useAddRecentTool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tool: Omit<RecentTool, 'timestamp'>) => addRecentTool(tool),
    onSuccess: () => {
      // Invalidate and refetch recent tools
      queryClient.invalidateQueries({ queryKey: RECENT_TOOLS_QUERY_KEY })
    },
  })
}

/**
 * Hook to clear all recent tools
 */
export function useClearRecentTools() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearRecentTools,
    onSuccess: () => {
      // Invalidate and refetch recent tools
      queryClient.invalidateQueries({ queryKey: RECENT_TOOLS_QUERY_KEY })
    },
  })
}

/**
 * Hook to automatically track tool views
 * Use this in tool pages to add them to recent history
 */
export function useTrackToolView(tool: Omit<RecentTool, 'timestamp'>) {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Only track if IndexedDB is supported
    if (isIndexedDBSupported()) {
      addRecentTool(tool).then(() => {
        // Invalidate queries after adding
        queryClient.invalidateQueries({ queryKey: RECENT_TOOLS_QUERY_KEY })
      })
    }
  }, [tool, queryClient]) // Track when tool object changes
}
