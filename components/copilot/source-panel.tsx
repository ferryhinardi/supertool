'use client'

/**
 * SourcePanel Component
 *
 * A unified panel that allows users to switch between different file sources:
 * - GitHub: Browse repository files, PRs, and issues
 * - Local: Upload and browse local files from user's system
 *
 * This component manages the source selection and renders the appropriate
 * child component based on the selected source.
 */

import { useCallback, useState } from 'react'
import type { FileContent, Issue, IssueDetail, PRDetail, PullRequest } from '@/lib/services/github'
import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'
import { css } from '@/styled-system/css'
import { GitHubPanel } from './github-panel'
import { LocalFileBrowser } from './local-file-browser'

// ============================================
// Types
// ============================================

export type SourceType = 'github' | 'local'

export interface SourcePanelProps {
  /** Initial source to display */
  initialSource?: SourceType
  /** Initial repository URL or owner/repo string for GitHub */
  initialRepo?: string
  /** Maximum height for the panel */
  maxHeight?: string

  // GitHub callbacks
  /** Callback when a GitHub file is selected */
  onGitHubFileSelect?: (path: string, content: FileContent) => void
  /** Callback when a GitHub PR is selected */
  onGitHubPRSelect?: (pr: PullRequest, detail: PRDetail) => void
  /** Callback when a GitHub issue is selected */
  onGitHubIssueSelect?: (issue: Issue, detail: IssueDetail) => void
  /** Currently selected GitHub file paths */
  selectedGitHubFiles?: string[]
  /** Currently selected GitHub PR numbers */
  selectedGitHubPRs?: number[]
  /** Currently selected GitHub issue numbers */
  selectedGitHubIssues?: number[]

  // Local file props
  /** Local files to display */
  localFiles?: LocalFileInfo[]
  /** Callback when local files are selected */
  onLocalFilesSelect?: (files: LocalFileInfo[]) => void
  /** Callback when local files are uploaded */
  onLocalFilesUpload?: (files: LocalFileInfo[]) => void
  /** Callback when raw File objects are uploaded (for content access) */
  onRawFilesUpload?: (files: File[]) => void
  /** Local file analysis result */
  localAnalysisResult?: LocalFileAnalysisResult | null
  /** Whether local files are being analyzed */
  isAnalyzingLocal?: boolean
  /** Error message for local files */
  localError?: string | null

  /** Callback when source changes */
  onSourceChange?: (source: SourceType) => void
}

// ============================================
// Icons
// ============================================

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>GitHub</title>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Local Files</title>
      <path d="M.54 3.87L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3H13.5a2 2 0 0 1 2 2v.054l-15-.184zm14.96 1.617V13a2 2 0 0 1-2 2H2.5a2 2 0 0 1-2-2V5.487h14.96z" />
    </svg>
  )
}

// ============================================
// Styles
// ============================================

const panelStyles = css({
  display: 'flex',
  flexDirection: 'column',
  h: 'full',
  bg: 'rgba(0, 0, 0, 0.2)',
  borderRadius: 'lg',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
})

const sourceTabsStyles = css({
  display: 'flex',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  bg: 'rgba(0, 0, 0, 0.1)',
})

const sourceTabStyles = css({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  px: '4',
  py: '3',
  bg: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: 'sm',
  fontWeight: 'medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minH: '44px',
  _hover: { color: 'rgba(255, 255, 255, 0.9)', bg: 'rgba(255, 255, 255, 0.05)' },
})

const activeSourceTabStyles = css({
  color: 'white',
  borderBottom: '2px solid rgba(59, 130, 246, 0.8)',
  bg: 'rgba(255, 255, 255, 0.05)',
})

const contentContainerStyles = css({
  flex: 1,
  overflow: 'hidden',
})

// ============================================
// Component
// ============================================

export function SourcePanel({
  initialSource = 'github',
  initialRepo = '',
  maxHeight = '100%',

  // GitHub props
  onGitHubFileSelect,
  onGitHubPRSelect,
  onGitHubIssueSelect,
  selectedGitHubFiles = [],
  selectedGitHubPRs = [],
  selectedGitHubIssues = [],

  // Local file props
  localFiles = [],
  onLocalFilesSelect,
  onLocalFilesUpload,
  onRawFilesUpload,
  localAnalysisResult,
  isAnalyzingLocal = false,
  localError,

  // General props
  onSourceChange,
}: SourcePanelProps) {
  const [activeSource, setActiveSource] = useState<SourceType>(initialSource)

  const handleSourceChange = useCallback(
    (source: SourceType) => {
      if (source === activeSource) return
      setActiveSource(source)
      onSourceChange?.(source)
    },
    [onSourceChange, activeSource]
  )

  return (
    <div className={panelStyles} style={{ maxHeight }}>
      {/* Source Tabs */}
      <div className={sourceTabsStyles} role="tablist" aria-label="File source selection">
        <button
          type="button"
          onClick={() => handleSourceChange('github')}
          className={`${sourceTabStyles} ${activeSource === 'github' ? activeSourceTabStyles : ''}`}
          aria-selected={activeSource === 'github'}
          role="tab"
          id="source-tab-github"
          aria-controls="source-panel-github"
        >
          <GitHubIcon />
          <span>GitHub</span>
        </button>
        <button
          type="button"
          onClick={() => handleSourceChange('local')}
          className={`${sourceTabStyles} ${activeSource === 'local' ? activeSourceTabStyles : ''}`}
          aria-selected={activeSource === 'local'}
          role="tab"
          id="source-tab-local"
          aria-controls="source-panel-local"
        >
          <FolderIcon />
          <span>Local Files</span>
        </button>
      </div>

      {/* Content */}
      <div className={contentContainerStyles}>
        {activeSource === 'github' && (
          <div
            id="source-panel-github"
            role="tabpanel"
            aria-labelledby="source-tab-github"
            style={{ height: '100%' }}
          >
            <GitHubPanel
              initialRepo={initialRepo}
              onFileSelect={onGitHubFileSelect}
              onPRSelect={onGitHubPRSelect}
              onIssueSelect={onGitHubIssueSelect}
              selectedFiles={selectedGitHubFiles}
              selectedPRs={selectedGitHubPRs}
              selectedIssues={selectedGitHubIssues}
              maxHeight="100%"
            />
          </div>
        )}

        {activeSource === 'local' && (
          <div
            id="source-panel-local"
            role="tabpanel"
            aria-labelledby="source-tab-local"
            style={{ height: '100%' }}
          >
            <LocalFileBrowser
              files={localFiles}
              onFilesSelect={onLocalFilesSelect}
              onFilesUpload={onLocalFilesUpload}
              onRawFilesUpload={onRawFilesUpload}
              analysisResult={localAnalysisResult}
              isLoading={isAnalyzingLocal}
              error={localError}
              maxHeight="100%"
              multiSelect={true}
              showAnalysis={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default SourcePanel
