'use client'

/**
 * Local Files State Hook
 *
 * Manages local file state for the Copilot tool, including:
 * - File uploads and selection
 * - Raw file mapping for chat attachments
 * - File analysis results
 * - Loading and error states
 */

import { useCallback, useMemo, useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'

// ============================================
// Types
// ============================================

export interface UseLocalFilesOptions {
  /** Callback when files are successfully uploaded */
  onUploadSuccess?: (files: LocalFileInfo[]) => void
  /** Callback when file analysis completes */
  onAnalysisComplete?: (result: LocalFileAnalysisResult) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

export interface UseLocalFilesReturn {
  // State
  localFiles: LocalFileInfo[]
  selectedLocalFiles: LocalFileInfo[]
  selectedRawFiles: File[]
  localAnalysisResult: LocalFileAnalysisResult | null
  isAnalyzingLocal: boolean
  localError: string | null

  // Actions
  handleLocalFilesUpload: (files: LocalFileInfo[]) => Promise<void>
  handleLocalFilesSelect: (files: LocalFileInfo[]) => void
  handleRawFilesUpload: (files: File[]) => void
  clearLocalFiles: () => void
  clearSelectedFiles: () => void
  clearError: () => void
  setLocalError: (error: string | null) => void
}

// ============================================
// Hook Implementation
// ============================================

export function useLocalFiles(options: UseLocalFilesOptions = {}): UseLocalFilesReturn {
  const { onUploadSuccess, onAnalysisComplete, onError } = options

  // File state
  const [localFiles, setLocalFiles] = useState<LocalFileInfo[]>([])
  const [selectedLocalFiles, setSelectedLocalFiles] = useState<LocalFileInfo[]>([])
  const [rawFilesMap, setRawFilesMap] = useState<Map<string, File>>(new Map())

  // Analysis state
  const [localAnalysisResult, setLocalAnalysisResult] = useState<LocalFileAnalysisResult | null>(
    null
  )
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Compute selected raw files from the map based on selectedLocalFiles
  const selectedRawFiles = useMemo(() => {
    return selectedLocalFiles
      .map((localFile) => rawFilesMap.get(localFile.name))
      .filter((file): file is File => file !== undefined)
  }, [selectedLocalFiles, rawFilesMap])

  // File upload handler with analysis
  const handleLocalFilesUpload = useCallback(
    async (files: LocalFileInfo[]) => {
      setLocalFiles((prev) => [...prev, ...files])
      setLocalError(null)

      // Analyze files after upload
      if (files.length > 0) {
        setIsAnalyzingLocal(true)
        try {
          const response = await fetch('/api/copilot/local-files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'analyze',
              files: files.map((f) => ({
                name: f.name,
                path: f.path,
                type: f.type,
                size: f.size,
                extension: f.extension,
                modifiedAt: f.modifiedAt,
                isDirectory: f.isDirectory,
              })),
            }),
          })

          if (response.ok) {
            const result = await response.json()
            setLocalAnalysisResult(result)
            onAnalysisComplete?.(result)
          } else {
            const errorMessage = 'Failed to analyze files'
            setLocalError(errorMessage)
            onError?.(errorMessage)
          }
        } catch (error) {
          console.error('Failed to analyze files:', error)
          const errorMessage = 'Failed to analyze files'
          setLocalError(errorMessage)
          onError?.(errorMessage)
        } finally {
          setIsAnalyzingLocal(false)
        }
      }

      trackToolEvent('copilot_local_files_uploaded', { count: files.length })
      onUploadSuccess?.(files)
    },
    [onUploadSuccess, onAnalysisComplete, onError]
  )

  // File selection handler
  const handleLocalFilesSelect = useCallback((files: LocalFileInfo[]) => {
    setSelectedLocalFiles(files)
    trackToolEvent('copilot_local_files_selected', { count: files.length })
  }, [])

  // Raw files upload handler (for actual File objects)
  const handleRawFilesUpload = useCallback((files: File[]) => {
    setRawFilesMap((prev) => {
      const newMap = new Map(prev)
      for (const file of files) {
        newMap.set(file.name, file)
      }
      return newMap
    })
  }, [])

  // Clear all local files
  const clearLocalFiles = useCallback(() => {
    setLocalFiles([])
    setSelectedLocalFiles([])
    setRawFilesMap(new Map())
    setLocalAnalysisResult(null)
    setLocalError(null)
  }, [])

  // Clear only selected files
  const clearSelectedFiles = useCallback(() => {
    setSelectedLocalFiles([])
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setLocalError(null)
  }, [])

  return {
    // State
    localFiles,
    selectedLocalFiles,
    selectedRawFiles,
    localAnalysisResult,
    isAnalyzingLocal,
    localError,

    // Actions
    handleLocalFilesUpload,
    handleLocalFilesSelect,
    handleRawFilesUpload,
    clearLocalFiles,
    clearSelectedFiles,
    clearError,
    setLocalError,
  }
}
