/**
 * Local File Management Service
 *
 * Provides functionality for analyzing and organizing local files.
 * Based on GitHub Copilot SDK Cookbook - Managing Local Files
 */

// Export all service functions
export {
  analyzeLocalFiles,
  buildFileTree,
  flattenFileTree,
  generateMoveScript,
  generateOrganizationSuggestions,
  parseUploadedFiles,
  previewFileMoves,
} from './local-file-service'
// Export all types
export * from './types'
