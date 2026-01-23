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
