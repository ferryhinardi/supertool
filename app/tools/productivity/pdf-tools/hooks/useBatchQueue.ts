import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  processedBlob?: Blob
  processedSize?: number
}

interface BatchQueueStats {
  totalFiles: number
  pending: number
  processing: number
  completed: number
  error: number
  overallProgress: number
}

export function useBatchQueue(
  pdfs: PDFFile[],
  setPdfs: React.Dispatch<React.SetStateAction<PDFFile[]>>
) {
  const [isPaused, setIsPaused] = useState(false)

  // Calculate stats
  const stats: BatchQueueStats = useMemo(() => {
    const totalFiles = pdfs.length
    const pending = pdfs.filter((p) => p.status === 'pending').length
    const processing = pdfs.filter((p) => p.status === 'processing').length
    const completed = pdfs.filter((p) => p.status === 'completed').length
    const error = pdfs.filter((p) => p.status === 'error').length

    const overallProgress = totalFiles > 0 ? Math.round((completed / totalFiles) * 100) : 0

    return {
      totalFiles,
      pending,
      processing,
      completed,
      error,
      overallProgress,
    }
  }, [pdfs])

  // Pause/Resume batch processing
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  // Cancel all pending/processing files
  const cancelAll = useCallback(() => {
    setPdfs((prev) =>
      prev.map((pdf) => {
        if (pdf.status === 'pending' || pdf.status === 'processing') {
          return {
            ...pdf,
            status: 'error' as const,
            error: 'Cancelled by user',
            progress: 0,
          }
        }
        return pdf
      })
    )
    setIsPaused(false)
  }, [setPdfs])

  // Retry all failed files
  const retryFailed = useCallback(() => {
    setPdfs((prev) =>
      prev.map((pdf) => {
        if (pdf.status === 'error') {
          return {
            ...pdf,
            status: 'pending' as const,
            error: undefined,
            progress: 0,
          }
        }
        return pdf
      })
    )
  }, [setPdfs])

  // Retry a single file
  const retryFile = useCallback(
    (id: string) => {
      setPdfs((prev) =>
        prev.map((pdf) => {
          if (pdf.id === id && pdf.status === 'error') {
            return {
              ...pdf,
              status: 'pending' as const,
              error: undefined,
              progress: 0,
            }
          }
          return pdf
        })
      )
    },
    [setPdfs]
  )

  // Remove a file from queue
  const removeFile = useCallback(
    (id: string) => {
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== id))
    },
    [setPdfs]
  )

  // Clear all completed files
  const clearCompleted = useCallback(() => {
    setPdfs((prev) => prev.filter((pdf) => pdf.status !== 'completed'))
  }, [setPdfs])

  // Reset all files to pending
  const resetAll = useCallback(() => {
    setPdfs((prev) =>
      prev.map((pdf) => ({
        ...pdf,
        status: 'pending' as const,
        progress: 0,
        error: undefined,
        processedBlob: undefined,
        processedSize: undefined,
      }))
    )
  }, [setPdfs])

  // Get files by status
  const getFilesByStatus = useCallback(
    (status: 'pending' | 'processing' | 'completed' | 'error') => {
      return pdfs.filter((pdf) => pdf.status === status)
    },
    [pdfs]
  )

  return {
    // State
    isPaused,
    stats,

    // Actions
    togglePause,
    cancelAll,
    retryFailed,
    retryFile,
    removeFile,
    clearCompleted,
    resetAll,

    // Selectors
    getFilesByStatus,
  }
}
