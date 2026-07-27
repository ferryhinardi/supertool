'use client'

/**
 * CopilotWorkspace Component
 *
 * Main workspace for GitHub-integrated Copilot chat. Provides a three-column
 * layout with:
 * - Left: GitHub repository browser (files, PRs, issues)
 * - Center: Chat interface
 * - Right: Context panel showing selected items
 *
 * Manages state for repository context and wires selection callbacks
 * from the GitHub panel to the context management system.
 */

import { useCallback, useId, useMemo, useState } from 'react'
import { useRepoContext } from '@/hooks/github/use-repo-context'
import type {
  FileContent,
  FileTreeItem,
  Issue,
  IssueDetail,
  PRDetail,
  PullRequest,
  Repository,
} from '@/lib/services/github'
import type { LocalFileAnalysisResult, LocalFileInfo } from '@/lib/services/local-files'
import { css } from '@/styled-system/css'
import { ChatContainer } from './chat-container'
import type { RepoContext as PanelRepoContext } from './context-panel'
import { ContextPanel } from './context-panel'
import { SourcePanel, type SourceType } from './source-panel'

// ============================================
// Types
// ============================================

export interface CopilotWorkspaceProps {
  /** Initial repository URL or owner/repo string */
  initialRepo?: string
  /** Callback when context changes */
  onContextChange?: (context: PanelRepoContext) => void
  /** Maximum height for the workspace */
  maxHeight?: string
  /** Custom class name */
  className?: string
}

interface WorkspaceState {
  repository: Repository | null
  files: Map<string, FileTreeItem>
  pullRequest: PullRequest | null
  pullRequestDetail: PRDetail | null
  issue: Issue | null
  issueDetail: IssueDetail | null
}

// ============================================
// Icons
// ============================================

function PanelLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Toggle Left Panel</title>
      <path d="M0 2.75C0 1.783.783 1 1.75 1h12.5c.967 0 1.75.783 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h4.5V2.5ZM7.75 2.5v11h6.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Z" />
    </svg>
  )
}

function PanelRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Toggle Right Panel</title>
      <path d="M0 2.75C0 1.783.783 1 1.75 1h12.5c.967 0 1.75.783 1.75 1.75v10.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25Zm1.75-.25a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h6.5V2.5Zm8 0v11h4.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25Z" />
    </svg>
  )
}

// ============================================
// Styles
// ============================================

const workspaceStyles = css({
  display: 'flex',
  flexDirection: 'column',
  h: 'full',
  w: 'full',
  bg: 'rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
})

const toolbarStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '4',
  py: '2',
  bg: 'rgba(0, 0, 0, 0.2)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
})

const toolbarLeftStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const toolbarRightStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const toggleButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '2',
  bg: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 'md',
  color: 'rgba(255, 255, 255, 0.6)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minW: '44px',
  minH: '44px',
  _hover: {
    bg: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.9)',
  },
})

const activeToggleStyles = css({
  bg: 'rgba(59, 130, 246, 0.2)',
  borderColor: 'rgba(59, 130, 246, 0.3)',
  color: 'rgba(147, 197, 253, 1)',
})

const titleStyles = css({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: 'medium',
})

const mainContentStyles = css({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
})

const leftPanelStyles = css({
  w: '320px',
  minW: '280px',
  maxW: '400px',
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
  transition: 'width 0.2s, min-width 0.2s, opacity 0.2s',
})

const leftPanelCollapsedStyles = css({
  w: '0',
  minW: '0',
  opacity: 0,
  overflow: 'hidden',
})

const centerPanelStyles = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minW: '400px',
})

const rightPanelStyles = css({
  w: '300px',
  minW: '250px',
  maxW: '350px',
  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'auto',
  p: '4',
  transition: 'width 0.2s, min-width 0.2s, opacity 0.2s',
})

const rightPanelCollapsedStyles = css({
  w: '0',
  minW: '0',
  p: '0',
  opacity: 0,
  overflow: 'hidden',
})

// ============================================
// Component
// ============================================

export function CopilotWorkspace({
  initialRepo = '',
  onContextChange,
  maxHeight = '100vh',
  className = '',
}: CopilotWorkspaceProps) {
  // Generate a stable session ID for this workspace instance
  const sessionId = useId()

  // Panel visibility state
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [contextPanelCollapsed, setContextPanelCollapsed] = useState(false)

  // Local file state
  const [localFiles, setLocalFiles] = useState<LocalFileInfo[]>([])
  const [localAnalysisResult, setLocalAnalysisResult] = useState<LocalFileAnalysisResult | null>(
    null
  )
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [_activeSource, setActiveSource] = useState<SourceType>('github')

  // Parse initial repo
  const parsedRepo = useMemo(() => {
    if (!initialRepo) return null
    const match = initialRepo.match(/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/)
    return match ? { owner: match[1], repo: match[2] } : null
  }, [initialRepo])

  // Workspace state - tracks selected items for the ContextPanel
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    repository: null,
    files: new Map(),
    pullRequest: null,
    pullRequestDetail: null,
    issue: null,
    issueDetail: null,
  })

  // Use repo context hook for AI context building
  const { addFileContext, addPRContext, addIssueContext, clearContext } = useRepoContext({
    owner: parsedRepo?.owner ?? '',
    repo: parsedRepo?.repo ?? '',
  })

  // Selected items for GitHubPanel
  const selectedFiles = useMemo(
    () => Array.from(workspaceState.files.keys()),
    [workspaceState.files]
  )

  const selectedPRs = useMemo(
    () => (workspaceState.pullRequest ? [workspaceState.pullRequest.number] : []),
    [workspaceState.pullRequest]
  )

  const selectedIssues = useMemo(
    () => (workspaceState.issue ? [workspaceState.issue.number] : []),
    [workspaceState.issue]
  )

  // Convert workspace state to ContextPanel format
  const panelContext: PanelRepoContext = useMemo(() => {
    return {
      repository: workspaceState.repository,
      files: Array.from(workspaceState.files.values()),
      pullRequest: workspaceState.pullRequest,
      issue: workspaceState.issue,
    }
  }, [workspaceState])

  // Handlers
  const handleFileSelect = useCallback(
    (path: string, content: FileContent) => {
      // Add to workspace state
      setWorkspaceState((prev) => {
        const newFiles = new Map(prev.files)
        // Create FileTreeItem from FileContent for the panel
        const fileItem: FileTreeItem = {
          path: content.path,
          sha: content.sha,
          type: 'blob',
          mode: '100644', // Standard file mode for regular files
          size: content.size,
          url: content.url,
        }
        newFiles.set(path, fileItem)
        return { ...prev, files: newFiles }
      })

      // Add to AI context
      addFileContext({ file: content })

      onContextChange?.(panelContext)
    },
    [addFileContext, onContextChange, panelContext]
  )

  const handlePRSelect = useCallback(
    (pr: PullRequest, detail: PRDetail) => {
      setWorkspaceState((prev) => ({
        ...prev,
        pullRequest: pr,
        pullRequestDetail: detail,
      }))

      // Add to AI context
      addPRContext({ pr: detail, includeDiff: true, includeReviews: true })

      onContextChange?.(panelContext)
    },
    [addPRContext, onContextChange, panelContext]
  )

  const handleIssueSelect = useCallback(
    (issue: Issue, detail: IssueDetail) => {
      setWorkspaceState((prev) => ({
        ...prev,
        issue: issue,
        issueDetail: detail,
      }))

      // Add to AI context
      addIssueContext({ issue: detail, includeComments: true })

      onContextChange?.(panelContext)
    },
    [addIssueContext, onContextChange, panelContext]
  )

  const handleRemoveFile = useCallback(
    (path: string) => {
      setWorkspaceState((prev) => {
        const newFiles = new Map(prev.files)
        newFiles.delete(path)
        return { ...prev, files: newFiles }
      })
      onContextChange?.(panelContext)
    },
    [onContextChange, panelContext]
  )

  const handleRemovePR = useCallback(() => {
    setWorkspaceState((prev) => ({
      ...prev,
      pullRequest: null,
      pullRequestDetail: null,
    }))
    onContextChange?.(panelContext)
  }, [onContextChange, panelContext])

  const handleRemoveIssue = useCallback(() => {
    setWorkspaceState((prev) => ({
      ...prev,
      issue: null,
      issueDetail: null,
    }))
    onContextChange?.(panelContext)
  }, [onContextChange, panelContext])

  const handleClearAll = useCallback(() => {
    setWorkspaceState({
      repository: null,
      files: new Map(),
      pullRequest: null,
      pullRequestDetail: null,
      issue: null,
      issueDetail: null,
    })
    clearContext()
    onContextChange?.(panelContext)
  }, [clearContext, onContextChange, panelContext])

  const handleToggleContextPanel = useCallback(() => {
    setContextPanelCollapsed((prev) => !prev)
  }, [])

  // Local file handlers
  const handleLocalFilesUpload = useCallback(async (files: LocalFileInfo[]) => {
    setLocalFiles(files)
    setLocalError(null)
    setIsAnalyzingLocal(true)
    try {
      const response = await fetch('/api/copilot/local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', files }),
      })
      if (!response.ok) throw new Error('Failed to analyze files')
      const result = await response.json()
      setLocalAnalysisResult(result)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to analyze files')
    } finally {
      setIsAnalyzingLocal(false)
    }
  }, [])

  const handleLocalFilesSelect = useCallback((_files: LocalFileInfo[]) => {
    // Selected local files - could be added to context in the future
  }, [])

  const handleSourceChange = useCallback((source: SourceType) => {
    setActiveSource(source)
  }, [])

  return (
    <div className={`${workspaceStyles} ${className}`} style={{ maxHeight }}>
      {/* Toolbar */}
      <div className={toolbarStyles}>
        <div className={toolbarLeftStyles}>
          <button
            type="button"
            onClick={() => setShowLeftPanel((prev) => !prev)}
            className={`${toggleButtonStyles} ${showLeftPanel ? activeToggleStyles : ''}`}
            aria-label="Toggle source panel"
            aria-pressed={showLeftPanel}
          >
            <PanelLeftIcon />
          </button>
          <span className={titleStyles}>Copilot Workspace</span>
        </div>
        <div className={toolbarRightStyles}>
          <button
            type="button"
            onClick={() => setShowRightPanel((prev) => !prev)}
            className={`${toggleButtonStyles} ${showRightPanel ? activeToggleStyles : ''}`}
            aria-label="Toggle context panel"
            aria-pressed={showRightPanel}
          >
            <PanelRightIcon />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={mainContentStyles}>
        {/* Left Panel - Source Browser */}
        <div className={showLeftPanel ? leftPanelStyles : leftPanelCollapsedStyles}>
          {showLeftPanel && (
            <SourcePanel
              initialRepo={initialRepo}
              maxHeight="100%"
              // GitHub props
              onGitHubFileSelect={handleFileSelect}
              onGitHubPRSelect={handlePRSelect}
              onGitHubIssueSelect={handleIssueSelect}
              selectedGitHubFiles={selectedFiles}
              selectedGitHubPRs={selectedPRs}
              selectedGitHubIssues={selectedIssues}
              // Local file props
              localFiles={localFiles}
              onLocalFilesSelect={handleLocalFilesSelect}
              onLocalFilesUpload={handleLocalFilesUpload}
              localAnalysisResult={localAnalysisResult}
              isAnalyzingLocal={isAnalyzingLocal}
              localError={localError}
              onSourceChange={handleSourceChange}
            />
          )}
        </div>

        {/* Center Panel - Chat */}
        <div className={centerPanelStyles}>
          <ChatContainer sessionId={sessionId} />
        </div>

        {/* Right Panel - Context */}
        <div className={showRightPanel ? rightPanelStyles : rightPanelCollapsedStyles}>
          {showRightPanel && (
            <ContextPanel
              context={panelContext}
              onRemoveFile={handleRemoveFile}
              onRemovePR={handleRemovePR}
              onRemoveIssue={handleRemoveIssue}
              onClearAll={handleClearAll}
              isCollapsed={contextPanelCollapsed}
              onToggleCollapse={handleToggleContextPanel}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CopilotWorkspace
