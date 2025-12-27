import { useCallback, useEffect, useState } from 'react'
import type { OperationType } from '../components/OperationGrid'

const STORAGE_KEY = 'pdf-tools-recent-operations'
const MAX_RECENT = 4

export interface RecentOperation {
  operation: OperationType
  timestamp: number
  count: number
}

export function useRecentOperations() {
  const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RecentOperation[]
        setRecentOperations(parsed)
      }
    } catch (error) {
      console.error('Failed to load recent operations:', error)
    }
  }, [])

  // Track operation usage
  const trackOperation = useCallback((operation: OperationType) => {
    setRecentOperations((prev) => {
      // Check if operation already exists
      const existingIndex = prev.findIndex((item) => item.operation === operation)

      let updated: RecentOperation[]

      if (existingIndex >= 0) {
        // Update existing: increment count and timestamp
        updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          timestamp: Date.now(),
          count: updated[existingIndex].count + 1,
        }
      } else {
        // Add new operation
        updated = [
          ...prev,
          {
            operation,
            timestamp: Date.now(),
            count: 1,
          },
        ]
      }

      // Sort by most recent timestamp, then by count
      updated.sort((a, b) => {
        // First by timestamp (most recent first)
        const timeDiff = b.timestamp - a.timestamp
        if (timeDiff !== 0) return timeDiff
        // Then by count (most used first)
        return b.count - a.count
      })

      // Keep only top MAX_RECENT
      const trimmed = updated.slice(0, MAX_RECENT)

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } catch (error) {
        console.error('Failed to save recent operations:', error)
      }

      return trimmed
    })
  }, [])

  // Clear all recent operations
  const clearRecent = useCallback(() => {
    setRecentOperations([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear recent operations:', error)
    }
  }, [])

  // Get operations as array of OperationType
  const getRecentOperationTypes = useCallback(() => {
    return recentOperations.map((item) => item.operation)
  }, [recentOperations])

  return {
    recentOperations,
    trackOperation,
    clearRecent,
    getRecentOperationTypes,
    hasRecent: recentOperations.length > 0,
  }
}
