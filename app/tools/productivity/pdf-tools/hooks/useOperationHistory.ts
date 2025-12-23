import { useCallback, useState } from 'react'

export interface OperationSnapshot<T = unknown> {
  id: string
  timestamp: number
  operation: string
  data: T
}

export function useOperationHistory<T = unknown>(maxHistory = 50) {
  const [history, setHistory] = useState<OperationSnapshot<T>[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const addSnapshot = useCallback(
    (operation: string, data: T) => {
      const snapshot: OperationSnapshot<T> = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        operation,
        data,
      }

      setHistory((prev) => {
        // Remove any history after current index (when undoing then doing new action)
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push(snapshot)

        // Keep only last maxHistory items
        if (newHistory.length > maxHistory) {
          return newHistory.slice(-maxHistory)
        }

        return newHistory
      })

      setCurrentIndex((prev) => Math.min(prev + 1, maxHistory - 1))
    },
    [currentIndex, maxHistory]
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1]
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1]
    }
    return null
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  const clear = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  const getCurrentSnapshot = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex]
    }
    return null
  }, [currentIndex, history])

  return {
    history,
    currentIndex,
    addSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    getCurrentSnapshot,
  }
}
