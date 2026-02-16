// Copilot hooks
export { useCopilot, useCopilotStore } from './use-copilot'
// Session management hooks
export {
  sessionKeys,
  useCreateSession,
  useDeleteSession,
  usePrefetchSession,
  usePrefetchSessions,
  useRenameSession,
  useSession,
  useSessions,
} from './use-copilot-session'
// Copilot UI state hook
export type { UseCopilotUIOptions, UseCopilotUIReturn } from './use-copilot-ui'
export { useCopilotUI } from './use-copilot-ui'
export type {
  CopilotShortcutKey,
  KeyboardShortcut,
  ModifierKey,
  UseKeyboardShortcutsOptions,
} from './use-keyboard-shortcuts'
// Keyboard shortcuts hook
export {
  COPILOT_SHORTCUTS,
  formatShortcut,
  useKeyboardShortcuts,
} from './use-keyboard-shortcuts'
// Local files hook
export type { UseLocalFilesOptions, UseLocalFilesReturn } from './use-local-files'
export { useLocalFiles } from './use-local-files'
// Re-export types for convenience
export type {
  UsePRVisualizationOptions,
  UsePRVisualizationResult,
} from './use-pr-visualization'
// PR visualization hooks
export {
  getChartColors,
  getDefaultChartConfig,
  prVisualizationKeys,
  transformPRToChartData,
  usePRVisualization,
  usePrefetchPRVisualization,
} from './use-pr-visualization'
