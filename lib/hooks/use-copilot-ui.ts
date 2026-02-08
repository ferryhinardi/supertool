'use client'

/**
 * Copilot UI State Hook
 *
 * Manages UI state for the Copilot tool page, including:
 * - Sidebar visibility
 * - Source panel visibility
 * - Active source type
 * - Modals and overlays
 * - Session rename triggers
 */

import { useCallback, useState } from 'react'
import type { SourceType } from '@/components/copilot'
import { trackToolEvent } from '@/lib/services/analytics'

// ============================================
// Types
// ============================================

export interface UseCopilotUIOptions {
  /** Initial sidebar visibility state */
  initialSidebarOpen?: boolean
  /** Initial source panel visibility state */
  initialSourcePanelOpen?: boolean
  /** Initial active source type */
  initialActiveSource?: SourceType
}

export interface UseCopilotUIReturn {
  // Sidebar state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void

  // Source panel state
  isSourcePanelOpen: boolean
  toggleSourcePanel: () => void
  openSourcePanel: () => void
  closeSourcePanel: () => void

  // Active source
  activeSource: SourceType
  handleSourceChange: (source: SourceType) => void

  // Shortcuts modal
  showShortcutsModal: boolean
  openShortcutsModal: () => void
  closeShortcutsModal: () => void

  // Session rename trigger
  triggerRenameSessionId: string | null
  setTriggerRenameSessionId: (id: string | null) => void
  clearTriggerRenameSessionId: () => void
}

// ============================================
// Hook Implementation
// ============================================

export function useCopilotUI(options: UseCopilotUIOptions = {}): UseCopilotUIReturn {
  const {
    initialSidebarOpen = true,
    initialSourcePanelOpen = false,
    initialActiveSource = 'github',
  } = options

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(initialSidebarOpen)

  // Source panel state
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(initialSourcePanelOpen)

  // Active source
  const [activeSource, setActiveSource] = useState<SourceType>(initialActiveSource)

  // Shortcuts modal
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Session rename trigger
  const [triggerRenameSessionId, setTriggerRenameSessionId] = useState<string | null>(null)

  // ============================================
  // Sidebar Actions
  // ============================================

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  // ============================================
  // Source Panel Actions
  // ============================================

  const toggleSourcePanel = useCallback(() => {
    setIsSourcePanelOpen((prev) => {
      const newValue = !prev
      trackToolEvent('copilot_source_panel_toggled', { isOpen: newValue })
      return newValue
    })
  }, [])

  const openSourcePanel = useCallback(() => {
    setIsSourcePanelOpen(true)
    trackToolEvent('copilot_source_panel_toggled', { isOpen: true })
  }, [])

  const closeSourcePanel = useCallback(() => {
    setIsSourcePanelOpen(false)
    trackToolEvent('copilot_source_panel_toggled', { isOpen: false })
  }, [])

  // ============================================
  // Source Change Handler
  // ============================================

  const handleSourceChange = useCallback((source: SourceType) => {
    setActiveSource(source)
    trackToolEvent('copilot_source_changed', { source })
  }, [])

  // ============================================
  // Shortcuts Modal Actions
  // ============================================

  const openShortcutsModal = useCallback(() => {
    setShowShortcutsModal(true)
  }, [])

  const closeShortcutsModal = useCallback(() => {
    setShowShortcutsModal(false)
  }, [])

  // ============================================
  // Rename Session Actions
  // ============================================

  const clearTriggerRenameSessionId = useCallback(() => {
    setTriggerRenameSessionId(null)
  }, [])

  return {
    // Sidebar state
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Source panel state
    isSourcePanelOpen,
    toggleSourcePanel,
    openSourcePanel,
    closeSourcePanel,

    // Active source
    activeSource,
    handleSourceChange,

    // Shortcuts modal
    showShortcutsModal,
    openShortcutsModal,
    closeShortcutsModal,

    // Session rename trigger
    triggerRenameSessionId,
    setTriggerRenameSessionId,
    clearTriggerRenameSessionId,
  }
}
