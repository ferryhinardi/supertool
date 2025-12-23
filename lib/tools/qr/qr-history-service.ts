import type { QRCodeType } from '@/app/tools/productivity/qr-code/page'

// Re-declare interfaces to avoid circular dependencies
interface QRStyleConfig {
  preset: string
  cornerStyle: string
  dotStyle: string
  hasGradient: boolean
  gradientColor1: string
  gradientColor2: string
  hasLogo: boolean
  logoUrl: string
  logoSize: number
  logoOpacity: number
  logoPosition: string
  logoMask: string
  eyeColor: string
  hasEyeStyle: boolean
  hasFrame: boolean
  frameText: string
  frameColor: string
}

export interface QRHistoryItem {
  id: string
  type: QRCodeType
  content: string
  timestamp: number
  isFavorite: boolean
  styleConfig: QRStyleConfig
  thumbnail: string // Base64 QR code preview
  label?: string
}

const QR_HISTORY_KEY = 'qr_code_history'
const MAX_HISTORY_ITEMS = 20

/**
 * Save a QR code to history
 * Maintains a maximum of 20 items using FIFO (First In, First Out)
 */
export function saveToHistory(item: Omit<QRHistoryItem, 'id' | 'timestamp'>): QRHistoryItem {
  const history = getHistory()

  const newItem: QRHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }

  // Add to beginning of array
  history.unshift(newItem)

  // Keep only the last MAX_HISTORY_ITEMS
  const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS)

  setHistory(trimmedHistory)
  return newItem
}

/**
 * Get all QR code history
 */
export function getHistory(): QRHistoryItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(QR_HISTORY_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load QR history:', error)
    return []
  }
}

/**
 * Set history (internal helper)
 */
function setHistory(history: QRHistoryItem[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(QR_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save QR history:', error)
  }
}

/**
 * Toggle favorite status of a QR code
 */
export function toggleFavorite(id: string): void {
  const history = getHistory()
  const item = history.find((h) => h.id === id)

  if (item) {
    item.isFavorite = !item.isFavorite
    setHistory(history)
  }
}

/**
 * Delete a QR code from history
 */
export function deleteHistoryItem(id: string): void {
  const history = getHistory()
  const filtered = history.filter((h) => h.id !== id)
  setHistory(filtered)
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(QR_HISTORY_KEY)
}

/**
 * Export history as JSON
 */
export function exportHistory(): string {
  const history = getHistory()
  return JSON.stringify(history, null, 2)
}

/**
 * Import history from JSON
 * Returns number of items imported
 */
export function importHistory(jsonString: string): number {
  try {
    const imported = JSON.parse(jsonString)

    if (!Array.isArray(imported)) {
      throw new Error('Invalid JSON format: expected an array')
    }

    // Validate each item has required fields
    const validItems = imported.filter((item) => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        'content' in item &&
        'timestamp' in item &&
        'styleConfig' in item
      )
    })

    if (validItems.length === 0) {
      throw new Error('No valid QR history items found in JSON')
    }

    // Merge with existing history, keeping newer items first
    const existingHistory = getHistory()
    const mergedHistory = [...validItems, ...existingHistory]

    // Remove duplicates based on content and type
    const uniqueHistory = mergedHistory.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.content === item.content && t.type === item.type)
    )

    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = uniqueHistory.slice(0, MAX_HISTORY_ITEMS)

    setHistory(trimmedHistory)
    return validItems.length
  } catch (error) {
    console.error('Failed to import QR history:', error)
    throw error
  }
}

/**
 * Get filtered and sorted history
 */
export function getFilteredHistory(
  searchQuery: string,
  typeFilter: QRCodeType | 'all',
  sortBy: 'newest' | 'oldest' | 'favorites',
  showFavoritesOnly: boolean
): QRHistoryItem[] {
  let history = getHistory()

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    history = history.filter(
      (item) =>
        item.content.toLowerCase().includes(query) ||
        item.label?.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
    )
  }

  // Filter by type
  if (typeFilter !== 'all') {
    history = history.filter((item) => item.type === typeFilter)
  }

  // Filter by favorites
  if (showFavoritesOnly) {
    history = history.filter((item) => item.isFavorite)
  }

  // Sort
  switch (sortBy) {
    case 'newest':
      history.sort((a, b) => b.timestamp - a.timestamp)
      break
    case 'oldest':
      history.sort((a, b) => a.timestamp - b.timestamp)
      break
    case 'favorites':
      history.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) {
          return b.timestamp - a.timestamp
        }
        return a.isFavorite ? -1 : 1
      })
      break
  }

  return history
}
