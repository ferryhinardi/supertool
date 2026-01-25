'use client'

import { useCallback, useMemo } from 'react'
import { css } from '@/styled-system/css'

// ============================================
// Types
// ============================================

export type ActionType =
  | 'review-pr'
  | 'fix-issue'
  | 'explain-code'
  | 'summarize-changes'
  | 'generate-tests'
  | 'refactor-code'
  | 'add-docs'
  | 'find-bugs'
  | 'optimize'
  | 'security-review'

export type ContextType = 'none' | 'file' | 'pr' | 'issue' | 'multiple'

export interface QuickAction {
  id: ActionType
  label: string
  description: string
  icon: React.ReactNode
  shortcut?: string
  requiredContext?: ContextType[]
  category: 'code' | 'pr' | 'issue' | 'general'
}

export interface QuickActionsProps {
  contextType: ContextType
  onAction: (actionId: ActionType) => void
  loadingAction?: ActionType | null
  disabledActions?: ActionType[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// ============================================
// Icons
// ============================================

function ChevronDownIcon({ rotated = false }: { rotated?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '4',
        h: '4',
        flexShrink: 0,
        transition: 'transform 0.2s ease',
        transform: rotated ? 'rotate(-90deg)' : 'rotate(0deg)',
      })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  )
}

function LightBulbIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

function DocumentTextIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function TestTubeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
      />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}

function BugIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className={css({ w: '4', h: '4', flexShrink: 0 })}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      className={css({
        w: '4',
        h: '4',
        flexShrink: 0,
        animation: 'spin 1s linear infinite',
      })}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className={css({ opacity: 0.25 })}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className={css({ opacity: 0.75 })}
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ============================================
// Action Definitions
// ============================================

const ACTIONS: QuickAction[] = [
  {
    id: 'review-pr',
    label: 'Review PR',
    description: 'Analyze pull request for issues and improvements',
    icon: <ReviewIcon />,
    shortcut: 'R',
    requiredContext: ['pr'],
    category: 'pr',
  },
  {
    id: 'fix-issue',
    label: 'Fix Issue',
    description: 'Suggest fixes for the selected issue',
    icon: <WrenchIcon />,
    shortcut: 'F',
    requiredContext: ['issue'],
    category: 'issue',
  },
  {
    id: 'explain-code',
    label: 'Explain Code',
    description: 'Get a detailed explanation of the code',
    icon: <LightBulbIcon />,
    shortcut: 'E',
    requiredContext: ['file', 'multiple'],
    category: 'code',
  },
  {
    id: 'summarize-changes',
    label: 'Summarize Changes',
    description: 'Summarize all changes in the context',
    icon: <DocumentTextIcon />,
    shortcut: 'S',
    requiredContext: ['pr', 'file', 'multiple'],
    category: 'general',
  },
  {
    id: 'generate-tests',
    label: 'Generate Tests',
    description: 'Generate test cases for the selected code',
    icon: <TestTubeIcon />,
    shortcut: 'T',
    requiredContext: ['file', 'multiple'],
    category: 'code',
  },
  {
    id: 'refactor-code',
    label: 'Refactor Code',
    description: 'Suggest refactoring improvements',
    icon: <RefreshIcon />,
    shortcut: 'C',
    requiredContext: ['file', 'multiple'],
    category: 'code',
  },
  {
    id: 'add-docs',
    label: 'Add Documentation',
    description: 'Generate documentation for the code',
    icon: <DocumentTextIcon />,
    shortcut: 'D',
    requiredContext: ['file', 'multiple'],
    category: 'code',
  },
  {
    id: 'find-bugs',
    label: 'Find Bugs',
    description: 'Scan code for potential bugs and issues',
    icon: <BugIcon />,
    shortcut: 'B',
    requiredContext: ['file', 'pr', 'multiple'],
    category: 'code',
  },
  {
    id: 'optimize',
    label: 'Optimize',
    description: 'Suggest performance optimizations',
    icon: <SparklesIcon />,
    shortcut: 'O',
    requiredContext: ['file', 'multiple'],
    category: 'code',
  },
  {
    id: 'security-review',
    label: 'Security Review',
    description: 'Check for security vulnerabilities',
    icon: <ShieldCheckIcon />,
    shortcut: 'V',
    requiredContext: ['file', 'pr', 'multiple'],
    category: 'code',
  },
]

// ============================================
// Styles
// ============================================

const containerStyles = css({
  display: 'flex',
  flexDir: 'column',
  bg: 'rgba(0, 0, 0, 0.2)',
  rounded: 'xl',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
})

const headerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '4',
  py: '3',
  bg: 'rgba(0, 0, 0, 0.3)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  _hover: {
    bg: 'rgba(0, 0, 0, 0.4)',
  },
})

const headerLeftStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: '500',
})

const headerRightStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const contentStyles = css({
  display: 'flex',
  flexDir: 'column',
  gap: '3',
  p: '4',
})

const categoryLabelStyles = css({
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: 'xs',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  mb: '1',
})

const actionsGridStyles = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '2',
})

const actionButtonStyles = (isDisabled: boolean, _isLoading: boolean) =>
  css({
    display: 'flex',
    flexDir: 'column',
    alignItems: 'flex-start',
    gap: '1',
    p: '3',
    bg: isDisabled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
    rounded: 'lg',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.4 : 1,
    transition: 'all 0.2s ease',
    textAlign: 'left',
    _hover: isDisabled
      ? {}
      : {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          transform: 'translateY(-1px)',
        },
    _active: isDisabled
      ? {}
      : {
          transform: 'translateY(0)',
        },
  })

const actionHeaderStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  w: 'full',
})

const actionLabelContainerStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
})

const actionIconStyles = css({
  color: 'rgb(59, 130, 246)',
})

const actionLabelStyles = css({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: 'sm',
  fontWeight: '500',
})

const actionShortcutStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '5',
  h: '5',
  bg: 'rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: 'xs',
  fontWeight: '500',
  rounded: 'md',
})

const actionDescriptionStyles = css({
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: 'xs',
  lineHeight: '1.4',
})

const emptyStateStyles = css({
  display: 'flex',
  flexDir: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  py: '6',
  color: 'rgba(255, 255, 255, 0.4)',
  textAlign: 'center',
})

const badgeStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  px: '2',
  py: '0.5',
  bg: 'rgba(59, 130, 246, 0.2)',
  color: 'rgb(147, 197, 253)',
  fontSize: 'xs',
  fontWeight: '500',
  rounded: 'full',
})

// ============================================
// Utility Functions
// ============================================

function isActionAvailable(action: QuickAction, contextType: ContextType): boolean {
  if (!action.requiredContext) return true
  if (contextType === 'none') return false
  return action.requiredContext.includes(contextType)
}

function groupActionsByCategory(actions: QuickAction[]): Record<string, QuickAction[]> {
  return actions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = []
      }
      acc[action.category].push(action)
      return acc
    },
    {} as Record<string, QuickAction[]>
  )
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'code':
      return 'Code Actions'
    case 'pr':
      return 'Pull Request'
    case 'issue':
      return 'Issue'
    case 'general':
      return 'General'
    default:
      return category
  }
}

// ============================================
// Sub-Components
// ============================================

interface ActionButtonProps {
  action: QuickAction
  isAvailable: boolean
  isLoading: boolean
  isDisabled: boolean
  onAction: (actionId: ActionType) => void
}

function ActionButton({ action, isAvailable, isLoading, isDisabled, onAction }: ActionButtonProps) {
  const handleClick = useCallback(() => {
    if (!isDisabled && isAvailable) {
      onAction(action.id)
    }
  }, [action.id, isDisabled, isAvailable, onAction])

  const disabled = isDisabled || !isAvailable

  return (
    <button
      type="button"
      className={actionButtonStyles(disabled, isLoading)}
      onClick={handleClick}
      disabled={disabled}
      aria-label={action.label}
      title={!isAvailable ? 'Select appropriate context to enable this action' : action.description}
    >
      <div className={actionHeaderStyles}>
        <div className={actionLabelContainerStyles}>
          <span className={actionIconStyles}>{isLoading ? <LoadingSpinner /> : action.icon}</span>
          <span className={actionLabelStyles}>{action.label}</span>
        </div>
        {action.shortcut && !isLoading && (
          <span className={actionShortcutStyles}>{action.shortcut}</span>
        )}
      </div>
      <span className={actionDescriptionStyles}>{action.description}</span>
    </button>
  )
}

interface ActionCategoryProps {
  category: string
  actions: QuickAction[]
  contextType: ContextType
  loadingAction: ActionType | null
  disabledActions: ActionType[]
  onAction: (actionId: ActionType) => void
}

function ActionCategory({
  category,
  actions,
  contextType,
  loadingAction,
  disabledActions,
  onAction,
}: ActionCategoryProps) {
  const availableActions = useMemo(
    () => actions.filter((a) => isActionAvailable(a, contextType)),
    [actions, contextType]
  )

  if (availableActions.length === 0) return null

  return (
    <div>
      <div className={categoryLabelStyles}>{getCategoryLabel(category)}</div>
      <div className={actionsGridStyles}>
        {availableActions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            isAvailable={isActionAvailable(action, contextType)}
            isLoading={loadingAction === action.id}
            isDisabled={disabledActions.includes(action.id)}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function QuickActions({
  contextType,
  onAction,
  loadingAction = null,
  disabledActions = [],
  isCollapsed = false,
  onToggleCollapse,
}: QuickActionsProps) {
  const handleToggleCollapse = useCallback(() => {
    onToggleCollapse?.()
  }, [onToggleCollapse])

  const groupedActions = useMemo(() => groupActionsByCategory(ACTIONS), [])

  const availableActionsCount = useMemo(() => {
    return ACTIONS.filter((a) => isActionAvailable(a, contextType)).length
  }, [contextType])

  const categoryOrder = ['code', 'pr', 'issue', 'general']

  return (
    <div className={containerStyles}>
      {/* Header */}
      <button
        type="button"
        className={headerStyles}
        onClick={handleToggleCollapse}
        aria-expanded={!isCollapsed}
        aria-label="Toggle quick actions panel"
      >
        <span className={headerLeftStyles}>
          <BoltIcon />
          Quick Actions
        </span>
        <span className={headerRightStyles}>
          <span className={badgeStyles}>{availableActionsCount} available</span>
          <ChevronDownIcon rotated={isCollapsed} />
        </span>
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className={contentStyles}>
          {contextType === 'none' ? (
            <div className={emptyStateStyles}>
              <BoltIcon />
              <span className={css({ fontSize: 'sm' })}>No context selected</span>
              <span className={css({ fontSize: 'xs' })}>
                Select files, PRs, or issues to see available actions
              </span>
            </div>
          ) : (
            categoryOrder.map((category) => {
              const actions = groupedActions[category]
              if (!actions) return null
              return (
                <ActionCategory
                  key={category}
                  category={category}
                  actions={actions}
                  contextType={contextType}
                  loadingAction={loadingAction}
                  disabledActions={disabledActions}
                  onAction={onAction}
                />
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default QuickActions
