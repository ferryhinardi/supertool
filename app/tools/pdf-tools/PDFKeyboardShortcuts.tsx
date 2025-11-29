'use client'

import { useEffect } from 'react'

interface PDFKeyboardShortcutsProps {
  onUpload: () => void
  onProcess: () => void
  onDownloadAll: () => void
  onClear: () => void
  onCancel: () => void
  disabled?: boolean
}

export function PDFKeyboardShortcuts({
  onUpload,
  onProcess,
  onDownloadAll,
  onClear,
  onCancel,
  disabled = false,
}: PDFKeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O / Cmd+O - Upload
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        onUpload()
      }
      // Ctrl+P / Cmd+P - Process
      else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        onProcess()
      }
      // Ctrl+D / Cmd+D - Download All
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        onDownloadAll()
      }
      // Ctrl+Delete / Cmd+Delete - Clear All
      else if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
        e.preventDefault()
        onClear()
      }
      // Escape - Cancel
      else if (e.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUpload, onProcess, onDownloadAll, onClear, onCancel, disabled])

  return null
}
