import { useCallback, useEffect, useState } from 'react'

/**
 * Generic history item interface
 * Tools should extend this with their specific data
 */
export interface HistoryItem<T = unknown> {
  id: string
  timestamp: number
  isFavorite?: boolean
  data: T
}

/**
 * Filter and sort options for history
 */
export interface HistoryFilterOptions<T> {
  searchQuery?: string
  searchFields?: (keyof T)[]
  sortBy?: 'newest' | 'oldest' | 'favorites'
  showFavoritesOnly?: boolean
  customFilter?: (item: HistoryItem<T>) => boolean
}

/**
 * Configuration options for useToolHistory
 */
export interface ToolHistoryConfig {
  storageKey: string
  maxItems?: number
  autoSave?: boolean
}

/**
 * Generic tool history hook
 * Manages history with localStorage, favorites, search, and filtering
 *
 * @example
 * ```tsx
 * interface MyToolData {
 *   content: string
 *   type: string
 * }
 *
 * function MyTool() {
 *   const history = useToolHistory<MyToolData>({
 *     storageKey: 'my_tool_history',
 *     maxItems: 20
 *   })
 *
 *   // Add to history
 *   history.addItem({ content: 'Hello', type: 'text' })
 *
 *   // Get filtered items
 *   const items = history.getFilteredItems({
 *     searchQuery: 'hello',
 *     searchFields: ['content'],
 *     sortBy: 'newest'
 *   })
 * }
 * ```
 */
export function useToolHistory<T>({
  storageKey,
  maxItems = 50,
  autoSave = true,
}: ToolHistoryConfig) {
  const [items, setItems] = useState<HistoryItem<T>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setItems(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error(`Failed to load history for ${storageKey}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  // Save history to localStorage whenever items change (if autoSave enabled)
  useEffect(() => {
    if (typeof window === 'undefined' || !autoSave || isLoading) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch (error) {
      console.error(`Failed to save history for ${storageKey}:`, error)
    }
  }, [items, storageKey, autoSave, isLoading])

  /**
   * Add a new item to history
   * Maintains FIFO if maxItems is exceeded
   */
  const addItem = useCallback(
    (data: T, customId?: string): HistoryItem<T> => {
      const newItem: HistoryItem<T> = {
        id: customId || crypto.randomUUID(),
        timestamp: Date.now(),
        isFavorite: false,
        data,
      }

      setItems((prev) => {
        // Add to beginning and trim to maxItems
        const updated = [newItem, ...prev].slice(0, maxItems)
        return updated
      })

      return newItem
    },
    [maxItems]
  )

  /**
   * Update an existing item in history
   */
  const updateItem = useCallback((id: string, updates: Partial<HistoryItem<T>>): void => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              // Preserve id and timestamp unless explicitly overridden
              id: updates.id ?? item.id,
              timestamp: updates.timestamp ?? item.timestamp,
            }
          : item
      )
    )
  }, [])

  /**
   * Delete an item from history
   */
  const deleteItem = useCallback((id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  /**
   * Toggle favorite status of an item
   */
  const toggleFavorite = useCallback((id: string): void => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    )
  }, [])

  /**
   * Clear all history
   */
  const clearAll = useCallback((): void => {
    setItems([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  /**
   * Get filtered and sorted history items
   */
  const getFilteredItems = useCallback(
    (options: HistoryFilterOptions<T> = {}): HistoryItem<T>[] => {
      let filtered = [...items]

      // Apply custom filter first
      if (options.customFilter) {
        filtered = filtered.filter(options.customFilter)
      }

      // Filter by favorites
      if (options.showFavoritesOnly) {
        filtered = filtered.filter((item) => item.isFavorite)
      }

      // Filter by search query
      if (options.searchQuery?.trim() && options.searchFields?.length) {
        const query = options.searchQuery.toLowerCase()
        filtered = filtered.filter((item) => {
          return options.searchFields?.some((field) => {
            const value = item.data[field]
            if (typeof value === 'string') {
              return value.toLowerCase().includes(query)
            }
            if (typeof value === 'number') {
              return value.toString().includes(query)
            }
            return false
          })
        })
      }

      // Sort
      switch (options.sortBy) {
        case 'oldest':
          filtered.sort((a, b) => a.timestamp - b.timestamp)
          break
        case 'favorites':
          filtered.sort((a, b) => {
            if (a.isFavorite === b.isFavorite) {
              return b.timestamp - a.timestamp
            }
            return a.isFavorite ? -1 : 1
          })
          break
        case 'newest':
        default:
          filtered.sort((a, b) => b.timestamp - a.timestamp)
          break
      }

      return filtered
    },
    [items]
  )

  /**
   * Export history as JSON string
   */
  const exportAsJSON = useCallback((): string => {
    return JSON.stringify(items, null, 2)
  }, [items])

  /**
   * Import history from JSON string
   * Returns number of items imported
   */
  const importFromJSON = useCallback(
    (jsonString: string): number => {
      try {
        const imported = JSON.parse(jsonString)

        if (!Array.isArray(imported)) {
          throw new Error('Invalid JSON format: expected an array')
        }

        // Validate each item has required fields
        const validItems = imported.filter(
          (item): item is HistoryItem<T> =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            'timestamp' in item &&
            'data' in item
        )

        if (validItems.length === 0) {
          throw new Error('No valid history items found in JSON')
        }

        // Merge with existing history, keeping newer items first
        const mergedHistory = [...validItems, ...items]

        // Remove duplicates based on id
        const uniqueHistory = mergedHistory.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        )

        // Keep only maxItems
        const trimmedHistory = uniqueHistory.slice(0, maxItems)

        setItems(trimmedHistory)
        return validItems.length
      } catch (error) {
        console.error('Failed to import history:', error)
        throw error
      }
    },
    [items, maxItems]
  )

  /**
   * Get item count stats
   */
  const getStats = useCallback(() => {
    return {
      total: items.length,
      favorites: items.filter((item) => item.isFavorite).length,
      oldest: items.length > 0 ? Math.min(...items.map((item) => item.timestamp)) : null,
      newest: items.length > 0 ? Math.max(...items.map((item) => item.timestamp)) : null,
    }
  }, [items])

  return {
    // State
    items,
    isLoading,

    // Actions
    addItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    clearAll,

    // Queries
    getFilteredItems,
    getStats,

    // Import/Export
    exportAsJSON,
    importFromJSON,
  }
}
