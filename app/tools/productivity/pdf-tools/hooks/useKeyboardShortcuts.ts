import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onUpload?: () => void
  onProcess?: () => void
  onDownloadAll?: () => void
  onClear?: () => void
  onCancel?: () => void
  onUndo?: () => void
  onRedo?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onUpload,
  onProcess,
  onDownloadAll,
  onClear,
  onCancel,
  onUndo,
  onRedo,
  enabled = true,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + O: Upload
      if (cmdOrCtrl && e.key === 'o' && onUpload) {
        e.preventDefault()
        onUpload()
      }

      // Ctrl/Cmd + P: Process
      if (cmdOrCtrl && e.key === 'p' && onProcess) {
        e.preventDefault()
        onProcess()
      }

      // Ctrl/Cmd + D: Download All
      if (cmdOrCtrl && e.key === 'd' && onDownloadAll) {
        e.preventDefault()
        onDownloadAll()
      }

      // Ctrl/Cmd + Delete: Clear
      if (cmdOrCtrl && e.key === 'Delete' && onClear) {
        e.preventDefault()
        onClear()
      }

      // Escape: Cancel
      if (e.key === 'Escape' && onCancel) {
        e.preventDefault()
        onCancel()
      }

      // Ctrl/Cmd + Z: Undo
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey && onUndo) {
        e.preventDefault()
        onUndo()
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (((cmdOrCtrl && e.key === 'z' && e.shiftKey) || (cmdOrCtrl && e.key === 'y')) && onRedo) {
        e.preventDefault()
        onRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onUpload, onProcess, onDownloadAll, onClear, onCancel, onUndo, onRedo])
}
