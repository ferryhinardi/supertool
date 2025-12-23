import { useCallback, useEffect, useState } from 'react'

/**
 * Favorite item interface
 */
export interface FavoriteItem {
  id: string
  toolId: string
  label?: string
  data?: Record<string, unknown>
  timestamp: number
}

/**
 * Configuration for useFavorites hook
 */
export interface FavoritesConfig {
  storageKey?: string
  maxFavorites?: number
}

/**
 * Hook for managing favorite items across tools
 * Uses localStorage for persistence
 *
 * @example
 * ```tsx
 * function MyTool() {
 *   const favorites = useFavorites({ storageKey: 'my_tool_favorites' })
 *
 *   // Add favorite
 *   favorites.addFavorite({
 *     toolId: 'qr-code',
 *     label: 'My Website',
 *     data: { url: 'https://example.com', type: 'url' }
 *   })
 *
 *   // Check if item is favorited
 *   const isFav = favorites.isFavorite('item-id')
 *
 *   // Get all favorites
 *   const allFavorites = favorites.getFavorites()
 * }
 * ```
 */
export function useFavorites(config: FavoritesConfig = {}) {
  const { storageKey = 'tool_favorites', maxFavorites = 100 } = config

  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFavorites(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error(`Failed to load favorites from ${storageKey}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error(`Failed to save favorites to ${storageKey}:`, error)
    }
  }, [favorites, storageKey, isLoading])

  /**
   * Add an item to favorites
   * Returns the created favorite item
   */
  const addFavorite = useCallback(
    (item: Omit<FavoriteItem, 'id' | 'timestamp'>): FavoriteItem => {
      const newFavorite: FavoriteItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }

      setFavorites((prev) => {
        // Check if already at max capacity
        if (prev.length >= maxFavorites) {
          // Remove oldest non-favorited item
          const sorted = [...prev].sort((a, b) => a.timestamp - b.timestamp)
          const updated = [newFavorite, ...sorted.slice(1)]
          return updated
        }

        return [newFavorite, ...prev]
      })

      return newFavorite
    },
    [maxFavorites]
  )

  /**
   * Remove an item from favorites by ID
   */
  const removeFavorite = useCallback((id: string): void => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }, [])

  /**
   * Toggle favorite status for an item
   * If exists, removes it. If doesn't exist, adds it.
   * Returns true if added, false if removed
   */
  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'id' | 'timestamp'>, existingId?: string): boolean => {
      const existing = existingId
        ? favorites.find((fav) => fav.id === existingId)
        : favorites.find((fav) => fav.toolId === item.toolId && fav.label === item.label)

      if (existing) {
        removeFavorite(existing.id)
        return false
      }

      addFavorite(item)
      return true
    },
    [favorites, addFavorite, removeFavorite]
  )

  /**
   * Check if an item is favorited
   */
  const isFavorite = useCallback(
    (id: string): boolean => {
      return favorites.some((fav) => fav.id === id)
    },
    [favorites]
  )

  /**
   * Check if an item is favorited by toolId and label
   */
  const isFavoriteByData = useCallback(
    (toolId: string, label?: string): boolean => {
      return favorites.some((fav) => fav.toolId === toolId && fav.label === label)
    },
    [favorites]
  )

  /**
   * Get all favorites
   */
  const getFavorites = useCallback((): FavoriteItem[] => {
    return [...favorites].sort((a, b) => b.timestamp - a.timestamp)
  }, [favorites])

  /**
   * Get favorites for a specific tool
   */
  const getFavoritesByTool = useCallback(
    (toolId: string): FavoriteItem[] => {
      return favorites.filter((fav) => fav.toolId === toolId)
    },
    [favorites]
  )

  /**
   * Update a favorite item
   */
  const updateFavorite = useCallback((id: string, updates: Partial<FavoriteItem>): void => {
    setFavorites((prev) =>
      prev.map((fav) =>
        fav.id === id
          ? {
              ...fav,
              ...updates,
              // Preserve id and timestamp unless explicitly overridden
              id: updates.id ?? fav.id,
              timestamp: updates.timestamp ?? fav.timestamp,
            }
          : fav
      )
    )
  }, [])

  /**
   * Clear all favorites
   */
  const clearAll = useCallback((): void => {
    setFavorites([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  /**
   * Clear favorites for a specific tool
   */
  const clearByTool = useCallback((toolId: string): void => {
    setFavorites((prev) => prev.filter((fav) => fav.toolId !== toolId))
  }, [])

  /**
   * Export favorites as JSON
   */
  const exportAsJSON = useCallback((): string => {
    return JSON.stringify(favorites, null, 2)
  }, [favorites])

  /**
   * Import favorites from JSON
   * Returns number of items imported
   */
  const importFromJSON = useCallback(
    (jsonString: string): number => {
      try {
        const imported = JSON.parse(jsonString)

        if (!Array.isArray(imported)) {
          throw new Error('Invalid JSON format: expected an array')
        }

        // Validate each item
        const validItems = imported.filter(
          (item): item is FavoriteItem =>
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            'toolId' in item &&
            'timestamp' in item
        )

        if (validItems.length === 0) {
          throw new Error('No valid favorite items found in JSON')
        }

        // Merge with existing favorites
        const mergedFavorites = [...validItems, ...favorites]

        // Remove duplicates based on id
        const uniqueFavorites = mergedFavorites.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        )

        // Keep only maxFavorites
        const trimmedFavorites = uniqueFavorites.slice(0, maxFavorites)

        setFavorites(trimmedFavorites)
        return validItems.length
      } catch (error) {
        console.error('Failed to import favorites:', error)
        throw error
      }
    },
    [favorites, maxFavorites]
  )

  /**
   * Get statistics about favorites
   */
  const getStats = useCallback(() => {
    const toolCounts: Record<string, number> = {}

    for (const fav of favorites) {
      toolCounts[fav.toolId] = (toolCounts[fav.toolId] || 0) + 1
    }

    return {
      total: favorites.length,
      byTool: toolCounts,
      oldest: favorites.length > 0 ? Math.min(...favorites.map((fav) => fav.timestamp)) : null,
      newest: favorites.length > 0 ? Math.max(...favorites.map((fav) => fav.timestamp)) : null,
    }
  }, [favorites])

  return {
    // State
    favorites,
    isLoading,

    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    updateFavorite,
    clearAll,
    clearByTool,

    // Queries
    isFavorite,
    isFavoriteByData,
    getFavorites,
    getFavoritesByTool,
    getStats,

    // Import/Export
    exportAsJSON,
    importFromJSON,
  }
}
