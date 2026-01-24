'use client'

/**
 * GitHubPanel Component
 *
 * Panel for browsing GitHub repository content including files, PRs, and issues.
 * Integrates with GitHub hooks to fetch data and allows users to select items
 * to add to the Copilot context.
 */

import { useCallback, useMemo, useState } from 'react'
import { useGitHubFiles } from '@/hooks/github/use-github-files'
import { useGitHubIssues } from '@/hooks/github/use-github-issues'
import { useGitHubPRs } from '@/hooks/github/use-github-prs'
import type { FileContent, Issue, IssueDetail, PRDetail, PullRequest } from '@/lib/services/github'
import { css } from '@/styled-system/css'
import { FileBrowser } from './file-browser'
import { IssueList } from './issue-list'
import { PRList } from './pr-list'

// ============================================
// Types
// ============================================

export interface GitHubPanelProps {
  /** Callback when a file is selected */
  onFileSelect?: (path: string, content: FileContent) => void
  /** Callback when a PR is selected */
  onPRSelect?: (pr: PullRequest, detail: PRDetail) => void
  /** Callback when an issue is selected */
  onIssueSelect?: (issue: Issue, detail: IssueDetail) => void
  /** Currently selected file paths */
  selectedFiles?: string[]
  /** Currently selected PR numbers */
  selectedPRs?: number[]
  /** Currently selected issue numbers */
  selectedIssues?: number[]
  /** Maximum height for the panel */
  maxHeight?: string
  /** Initial repository URL or owner/repo string */
  initialRepo?: string
}

type TabType = 'files' | 'prs' | 'issues'

interface ParsedRepo {
  owner: string
  repo: string
}

// ============================================
// Icons
// ============================================

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Folder</title>
      <path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H7.5c-.55 0-1.07-.26-1.4-.7l-.9-1.2a.25.25 0 0 0-.2-.1H1.75Z" />
    </svg>
  )
}

function GitPullRequestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Pull Request</title>
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  )
}

function IssueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Issue</title>
      <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
    </svg>
  )
}

function RepoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Repository</title>
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <title>Search</title>
      <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className={css({ animation: 'spin 1s linear infinite' })}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <title>Loading</title>
      <circle cx="8" cy="8" r="6" strokeOpacity="0.25" />
      <path d="M8 2a6 6 0 0 1 6 6" strokeLinecap="round" />
    </svg>
  )
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse a GitHub URL or owner/repo string into owner and repo parts
 */
function parseGitHubUrl(input: string): ParsedRepo | null {
  const trimmed = input.trim()

  // Handle owner/repo format directly
  const simpleMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/)
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] }
  }

  // Handle full GitHub URLs
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/
  )
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }

  return null
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

const headerStyles = css({
  p: '4',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
})

const inputContainerStyles = css({
  display: 'flex',
  gap: '2',
  alignItems: 'center',
})

const inputStyles = css({
  flex: 1,
  px: '3',
  py: '2',
  bg: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 'md',
  color: 'white',
  fontSize: 'sm',
  outline: 'none',
  transition: 'border-color 0.2s',
  _placeholder: { color: 'rgba(255, 255, 255, 0.4)' },
  _focus: { borderColor: 'rgba(59, 130, 246, 0.5)' },
})

const loadButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: '3',
  py: '2',
  bg: 'rgba(59, 130, 246, 0.2)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: 'md',
  color: 'rgba(147, 197, 253, 1)',
  fontSize: 'sm',
  fontWeight: 'medium',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minW: '44px',
  minH: '44px',
  _hover: { bg: 'rgba(59, 130, 246, 0.3)' },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
})

const repoInfoStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  mt: '3',
  p: '2',
  bg: 'rgba(0, 0, 0, 0.2)',
  borderRadius: 'md',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: 'sm',
})

const tabContainerStyles = css({
  display: 'flex',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
})

const tabStyles = css({
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

const activeTabStyles = css({
  color: 'white',
  borderBottom: '2px solid rgba(59, 130, 246, 0.8)',
  bg: 'rgba(255, 255, 255, 0.05)',
})

const contentStyles = css({
  flex: 1,
  overflow: 'auto',
})

const emptyStateStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '3',
  p: '8',
  color: 'rgba(255, 255, 255, 0.5)',
  textAlign: 'center',
})

const emptyIconStyles = css({
  color: 'rgba(255, 255, 255, 0.3)',
})

const badgeStyles = css({
  px: '2',
  py: '0.5',
  bg: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 'full',
  fontSize: 'xs',
  color: 'rgba(255, 255, 255, 0.7)',
})

const errorStyles = css({
  p: '3',
  mx: '4',
  mt: '2',
  bg: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: 'md',
  color: 'rgba(252, 165, 165, 1)',
  fontSize: 'sm',
})

// ============================================
// Component
// ============================================

export function GitHubPanel({
  onFileSelect,
  onPRSelect,
  onIssueSelect,
  selectedFiles = [],
  selectedPRs = [],
  selectedIssues = [],
  maxHeight = '600px',
  initialRepo = '',
}: GitHubPanelProps) {
  // State
  const [repoInput, setRepoInput] = useState(initialRepo)
  const [activeRepo, setActiveRepo] = useState<ParsedRepo | null>(() =>
    initialRepo ? parseGitHubUrl(initialRepo) : null
  )
  const [activeTab, setActiveTab] = useState<TabType>('files')
  const [parseError, setParseError] = useState<string | null>(null)

  // Hooks - only fetch when we have an active repo
  const {
    tree,
    isLoading: filesLoading,
    error: filesError,
    fetchFileContent,
  } = useGitHubFiles({
    owner: activeRepo?.owner ?? '',
    repo: activeRepo?.repo ?? '',
  })

  const {
    pullRequests,
    isLoading: prsLoading,
    error: prsError,
    fetchPRDetail,
  } = useGitHubPRs({
    owner: activeRepo?.owner ?? '',
    repo: activeRepo?.repo ?? '',
    autoFetch: !!activeRepo,
  })

  const {
    issues,
    isLoading: issuesLoading,
    error: issuesError,
    fetchIssueDetail,
  } = useGitHubIssues({
    owner: activeRepo?.owner ?? '',
    repo: activeRepo?.repo ?? '',
    autoFetch: !!activeRepo,
  })

  // Handlers
  const handleLoadRepo = useCallback(() => {
    const parsed = parseGitHubUrl(repoInput)
    if (parsed) {
      setActiveRepo(parsed)
      setParseError(null)
    } else {
      setParseError('Invalid repository format. Use "owner/repo" or a GitHub URL.')
    }
  }, [repoInput])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLoadRepo()
      }
    },
    [handleLoadRepo]
  )

  const handleFileSelect = useCallback(
    async (path: string) => {
      if (!onFileSelect || !activeRepo) return

      const content = await fetchFileContent(path)
      if (content) {
        onFileSelect(path, content)
      }
    },
    [onFileSelect, activeRepo, fetchFileContent]
  )

  const handlePRSelect = useCallback(
    async (pr: PullRequest) => {
      if (!onPRSelect) return

      const detail = await fetchPRDetail(pr.number, true, true)
      if (detail) {
        onPRSelect(pr, detail)
      }
    },
    [onPRSelect, fetchPRDetail]
  )

  const handleIssueSelect = useCallback(
    async (issue: Issue) => {
      if (!onIssueSelect) return

      const detail = await fetchIssueDetail(issue.number, true, false)
      if (detail) {
        onIssueSelect(issue, detail)
      }
    },
    [onIssueSelect, fetchIssueDetail]
  )

  // Computed values
  const isLoading = filesLoading || prsLoading || issuesLoading
  const currentError =
    activeTab === 'files' ? filesError : activeTab === 'prs' ? prsError : issuesError

  const tabCounts = useMemo(
    () => ({
      files: tree?.tree?.length ?? 0,
      prs: pullRequests.length,
      issues: issues.length,
    }),
    [tree, pullRequests, issues]
  )

  // Render
  return (
    <div className={panelStyles} style={{ maxHeight }}>
      {/* Header with repo input */}
      <div className={headerStyles}>
        <div className={inputContainerStyles}>
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="owner/repo or GitHub URL"
            className={inputStyles}
            aria-label="Repository input"
          />
          <button
            type="button"
            onClick={handleLoadRepo}
            disabled={!repoInput.trim() || isLoading}
            className={loadButtonStyles}
            aria-label="Load repository"
          >
            {isLoading ? <LoadingSpinner /> : <SearchIcon />}
          </button>
        </div>

        {parseError && <div className={errorStyles}>{parseError}</div>}

        {activeRepo && (
          <div className={repoInfoStyles}>
            <RepoIcon />
            <span>
              {activeRepo.owner}/{activeRepo.repo}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={tabContainerStyles}>
        <button
          type="button"
          onClick={() => setActiveTab('files')}
          className={`${tabStyles} ${activeTab === 'files' ? activeTabStyles : ''}`}
          aria-selected={activeTab === 'files'}
          role="tab"
        >
          <FolderIcon />
          <span>Files</span>
          {tabCounts.files > 0 && <span className={badgeStyles}>{tabCounts.files}</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('prs')}
          className={`${tabStyles} ${activeTab === 'prs' ? activeTabStyles : ''}`}
          aria-selected={activeTab === 'prs'}
          role="tab"
        >
          <GitPullRequestIcon />
          <span>PRs</span>
          {tabCounts.prs > 0 && <span className={badgeStyles}>{tabCounts.prs}</span>}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('issues')}
          className={`${tabStyles} ${activeTab === 'issues' ? activeTabStyles : ''}`}
          aria-selected={activeTab === 'issues'}
          role="tab"
        >
          <IssueIcon />
          <span>Issues</span>
          {tabCounts.issues > 0 && <span className={badgeStyles}>{tabCounts.issues}</span>}
        </button>
      </div>

      {/* Content */}
      <div className={contentStyles}>
        {currentError && <div className={errorStyles}>{currentError}</div>}

        {!activeRepo ? (
          <div className={emptyStateStyles}>
            <div className={emptyIconStyles}>
              <RepoIcon />
            </div>
            <p>Enter a repository to browse</p>
            <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.4)' })}>
              Example: facebook/react
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'files' && (
              <FileBrowser
                fileTree={tree}
                onFileSelect={handleFileSelect}
                selectedFiles={selectedFiles}
                isLoading={filesLoading}
                error={filesError}
                maxHeight="100%"
              />
            )}
            {activeTab === 'prs' && (
              <PRList
                pullRequests={pullRequests}
                onSelect={handlePRSelect}
                selectedPRs={selectedPRs}
                isLoading={prsLoading}
                error={prsError}
                maxHeight="100%"
              />
            )}
            {activeTab === 'issues' && (
              <IssueList
                issues={issues}
                onSelect={handleIssueSelect}
                selectedIssues={selectedIssues}
                isLoading={issuesLoading}
                error={issuesError}
                maxHeight="100%"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default GitHubPanel
