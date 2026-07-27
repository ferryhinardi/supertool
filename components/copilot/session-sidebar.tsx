'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useCreateSession,
  useDeleteSession,
  usePrefetchSession,
  useRenameSession,
  useSessions,
} from '@/lib/hooks/use-copilot-session'
import type { CopilotSession } from '@/lib/services/copilot/types'
import { downloadSessionAsMarkdown } from '@/lib/utils/export-session'
import { css } from '@/styled-system/css'

interface SessionSidebarProps {
  activeSessionId?: string
  onSessionSelect: (id: string) => void
  triggerRenameSessionId?: string | null
  onRenameTriggered?: () => void
}

export function SessionSidebar({
  activeSessionId,
  onSessionSelect,
  triggerRenameSessionId,
  onRenameTriggered,
}: SessionSidebarProps) {
  const { data: sessions, isLoading, isError, error } = useSessions()
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const renameSession = useRenameSession()
  const prefetchSession = usePrefetchSession()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [exportingId, setExportingId] = useState<string | null>(null)

  // Filter sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!sessions) return []
    if (!searchQuery.trim()) return sessions

    const query = searchQuery.toLowerCase().trim()
    return sessions.filter((session) => {
      const nameMatch = session.name.toLowerCase().includes(query)
      const previewMatch = session.preview?.toLowerCase().includes(query) ?? false
      return nameMatch || previewMatch
    })
  }, [sessions, searchQuery])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleCreateSession = useCallback(() => {
    createSession.mutate(
      { name: `New Chat ${new Date().toLocaleDateString()}` },
      {
        onSuccess: (newSession) => {
          onSessionSelect(newSession.id)
        },
      }
    )
  }, [createSession, onSessionSelect])

  const handleDeleteSession = useCallback(
    (id: string) => {
      deleteSession.mutate(id, {
        onSuccess: () => {
          setDeleteConfirmId(null)
          // If we deleted the active session, clear selection
          if (activeSessionId === id) {
            onSessionSelect('')
          }
        },
      })
    },
    [deleteSession, activeSessionId, onSessionSelect]
  )

  const handleStartRename = useCallback((id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }, [])

  const handleSaveRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameSession.mutate(
        { id: editingId, name: editingName.trim() },
        {
          onSuccess: () => {
            setEditingId(null)
            setEditingName('')
          },
        }
      )
    }
  }, [editingId, editingName, renameSession])

  const handleCancelRename = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  const handleExportSession = useCallback(async (id: string) => {
    setExportingId(id)
    try {
      const response = await fetch(`/api/copilot/sessions/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const result = await response.json()
      if (result.success && result.data) {
        downloadSessionAsMarkdown(result.data as CopilotSession)
      }
    } catch (error) {
      console.error('Failed to export session:', error)
    } finally {
      setExportingId(null)
    }
  }, [])

  const handleHover = useCallback(
    (id: string) => {
      prefetchSession(id)
    },
    [prefetchSession]
  )

  // Handle external rename trigger (from keyboard shortcut)
  useEffect(() => {
    if (triggerRenameSessionId && sessions) {
      const session = sessions.find((s) => s.id === triggerRenameSessionId)
      if (session) {
        handleStartRename(triggerRenameSessionId, session.name)
        onRenameTriggered?.()
      }
    }
  }, [triggerRenameSessionId, sessions, handleStartRename, onRenameTriggered])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return 'Today'
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        h: 'full',
        bg: 'rgba(0, 0, 0, 0.3)',
        rounded: 'xl',
        overflow: 'hidden',
      })}
    >
      {/* Header */}
      <div
        className={css({
          p: '4',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <h2
          className={css({
            fontSize: 'sm',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.8)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          })}
        >
          Sessions
        </h2>
        <button
          type="button"
          onClick={handleCreateSession}
          disabled={createSession.isPending}
          className={css({
            p: '2',
            rounded: 'lg',
            bg: 'rgba(59, 130, 246, 0.2)',
            color: 'rgb(147, 197, 253)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            _hover: {
              bg: 'rgba(59, 130, 246, 0.3)',
            },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          })}
          aria-label="Create new session"
        >
          {createSession.isPending ? <SpinnerIcon /> : <PlusIcon />}
        </button>
      </div>

      {/* Search Input */}
      {sessions && sessions.length > 0 && (
        <div
          className={css({
            px: '3',
            pb: '2',
          })}
        >
          <div
            className={css({
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <SearchIcon />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              aria-label="Search sessions"
              className={css({
                w: 'full',
                pl: '8',
                pr: searchQuery ? '8' : '3',
                py: '2',
                rounded: 'lg',
                bg: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 'sm',
                outline: 'none',
                transition: 'all 0.2s',
                _placeholder: {
                  color: 'rgba(255, 255, 255, 0.4)',
                },
                _focus: {
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  bg: 'rgba(0, 0, 0, 0.4)',
                },
              })}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={css({
                  position: 'absolute',
                  right: '2',
                  p: '1',
                  rounded: 'md',
                  color: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  _hover: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    bg: 'rgba(255, 255, 255, 0.1)',
                  },
                })}
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          {searchQuery && (
            <p
              className={css({
                mt: '1',
                fontSize: 'xs',
                color: 'rgba(255, 255, 255, 0.4)',
              })}
            >
              {filteredSessions.length} of {sessions.length} sessions
            </p>
          )}
        </div>
      )}

      {/* Sessions List */}
      <div
        className={css({
          flex: '1',
          overflowY: 'auto',
          p: '2',
        })}
      >
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error} />
        ) : sessions && sessions.length > 0 ? (
          filteredSessions.length > 0 ? (
            <div className={css({ display: 'flex', flexDir: 'column', gap: '1' })}>
              {filteredSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  isEditing={editingId === session.id}
                  editingName={editingName}
                  isDeleting={deleteConfirmId === session.id}
                  isExporting={exportingId === session.id}
                  onSelect={() => onSessionSelect(session.id)}
                  onHover={() => handleHover(session.id)}
                  onStartRename={() => handleStartRename(session.id, session.name)}
                  onSaveRename={handleSaveRename}
                  onCancelRename={handleCancelRename}
                  onEditingNameChange={setEditingName}
                  onDeleteConfirm={() => setDeleteConfirmId(session.id)}
                  onDeleteCancel={() => setDeleteConfirmId(null)}
                  onDelete={() => handleDeleteSession(session.id)}
                  onExport={() => handleExportSession(session.id)}
                  formatDate={formatDate}
                  isPendingDelete={deleteSession.isPending}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          ) : (
            <NoResultsState query={searchQuery} onClear={handleClearSearch} />
          )
        ) : (
          <EmptyState onCreateSession={handleCreateSession} />
        )}
      </div>
    </div>
  )
}

interface SessionItemProps {
  session: {
    id: string
    name: string
    messageCount: number
    updatedAt: number
    preview?: string
  }
  isActive: boolean
  isEditing: boolean
  editingName: string
  isDeleting: boolean
  isExporting: boolean
  onSelect: () => void
  onHover: () => void
  onStartRename: () => void
  onSaveRename: () => void
  onCancelRename: () => void
  onEditingNameChange: (name: string) => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
  onDelete: () => void
  onExport: () => void
  formatDate: (timestamp: number) => string
  isPendingDelete: boolean
  searchQuery?: string
}

function SessionItem({
  session,
  isActive,
  isEditing,
  editingName,
  isDeleting,
  isExporting,
  onSelect,
  onHover,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditingNameChange,
  onDeleteConfirm,
  onDeleteCancel,
  onDelete,
  onExport,
  formatDate,
  isPendingDelete,
  searchQuery,
}: SessionItemProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  if (isDeleting) {
    return (
      <div
        className={css({
          p: '3',
          rounded: 'lg',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        })}
      >
        <p
          className={css({
            fontSize: 'sm',
            color: 'rgb(252, 165, 165)',
            mb: '2',
          })}
        >
          Delete this session?
        </p>
        <div className={css({ display: 'flex', gap: '2' })}>
          <button
            type="button"
            onClick={onDelete}
            disabled={isPendingDelete}
            className={css({
              flex: '1',
              py: '1.5',
              px: '3',
              rounded: 'md',
              bg: 'rgba(239, 68, 68, 0.3)',
              color: 'rgb(252, 165, 165)',
              fontSize: 'xs',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: { bg: 'rgba(239, 68, 68, 0.4)' },
              _disabled: { opacity: 0.5 },
            })}
          >
            {isPendingDelete ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            onClick={onDeleteCancel}
            className={css({
              flex: '1',
              py: '1.5',
              px: '3',
              rounded: 'md',
              bg: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 'xs',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              _hover: { bg: 'rgba(255, 255, 255, 0.15)' },
            })}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={css({
        w: 'full',
        textAlign: 'left',
        p: '3',
        rounded: 'lg',
        cursor: isEditing ? 'default' : 'pointer',
        transition: 'all 0.2s',
        bg: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        borderLeft: isActive ? '2px solid rgb(59, 130, 246)' : '2px solid transparent',
        position: 'relative',
        _hover: {
          bg: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        },
      })}
    >
      {isEditing ? (
        <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSaveRename()
              } else if (e.key === 'Escape') {
                onCancelRename()
              }
            }}
            ref={inputRef}
            className={css({
              w: 'full',
              px: '2',
              py: '1',
              rounded: 'md',
              bg: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 'sm',
              outline: 'none',
              _focus: {
                borderColor: 'rgb(59, 130, 246)',
              },
            })}
          />
          <div className={css({ display: 'flex', gap: '2' })}>
            <button
              type="button"
              onClick={onSaveRename}
              className={css({
                flex: '1',
                py: '1',
                rounded: 'md',
                bg: 'rgba(59, 130, 246, 0.2)',
                color: 'rgb(147, 197, 253)',
                fontSize: 'xs',
                cursor: 'pointer',
                _hover: { bg: 'rgba(59, 130, 246, 0.3)' },
              })}
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              className={css({
                flex: '1',
                py: '1',
                rounded: 'md',
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 'xs',
                cursor: 'pointer',
                _hover: { bg: 'rgba(255, 255, 255, 0.15)' },
              })}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className={css({
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '2',
          })}
        >
          <button
            type="button"
            onClick={onSelect}
            onMouseEnter={onHover}
            className={css({
              flex: '1',
              minW: '0',
              bg: 'transparent',
              border: 'none',
              p: '0',
              textAlign: 'left',
              cursor: 'pointer',
            })}
          >
            <div className={css({ flex: '1', minW: '0' })}>
              <h3
                className={css({
                  fontSize: 'sm',
                  fontWeight: '500',
                  color: isActive ? 'rgb(191, 219, 254)' : 'rgba(255, 255, 255, 0.8)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                })}
              >
                <HighlightText text={session.name} query={searchQuery} />
              </h3>
              {session.preview && (
                <p
                  className={css({
                    fontSize: 'xs',
                    color: 'rgba(255, 255, 255, 0.4)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mt: '0.5',
                  })}
                >
                  <HighlightText text={session.preview} query={searchQuery} />
                </p>
              )}

              {/* Meta info */}
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  mt: '1',
                  fontSize: 'xs',
                  color: 'rgba(255, 255, 255, 0.4)',
                })}
              >
                <span>{session.messageCount} messages</span>
                <span>•</span>
                <span>{formatDate(session.updatedAt)}</span>
              </div>
            </div>
          </button>

          {/* Action buttons */}
          <div
            className={css({
              display: 'flex',
              gap: '1',
              opacity: '0',
              transition: 'opacity 0.2s',
              _groupHover: { opacity: '1' },
            })}
            style={{ opacity: isActive ? 1 : undefined }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onExport()
              }}
              disabled={isExporting}
              className={css({
                p: '1',
                rounded: 'md',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  color: 'rgba(167, 139, 250, 1)',
                  bg: 'rgba(139, 92, 246, 0.1)',
                },
                _disabled: {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              })}
              aria-label="Export session as Markdown"
            >
              {isExporting ? <LoadingSpinner /> : <DownloadIcon />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onStartRename()
              }}
              className={css({
                p: '1',
                rounded: 'md',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  color: 'rgba(255, 255, 255, 0.8)',
                  bg: 'rgba(255, 255, 255, 0.1)',
                },
              })}
              aria-label="Rename session"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteConfirm()
              }}
              className={css({
                p: '1',
                rounded: 'md',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  color: 'rgb(252, 165, 165)',
                  bg: 'rgba(239, 68, 68, 0.1)',
                },
              })}
              aria-label="Delete session"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        gap: '2',
        p: '2',
      })}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={`skeleton-${i}`}
          className={css({
            p: '3',
            rounded: 'lg',
            bg: 'rgba(255, 255, 255, 0.05)',
            animation: 'pulse 2s infinite',
          })}
        >
          <div
            className={css({
              h: '4',
              w: '3/4',
              rounded: 'md',
              bg: 'rgba(255, 255, 255, 0.1)',
              mb: '2',
            })}
          />
          <div
            className={css({
              h: '3',
              w: '1/2',
              rounded: 'md',
              bg: 'rgba(255, 255, 255, 0.05)',
            })}
          />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error }: { error: Error | null }) {
  return (
    <div
      className={css({
        p: '4',
        rounded: 'lg',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: 'rgb(252, 165, 165)',
        fontSize: 'sm',
        textAlign: 'center',
      })}
    >
      <ErrorIcon />
      <p className={css({ mt: '2', fontWeight: '500' })}>Failed to load sessions</p>
      <p className={css({ mt: '1', fontSize: 'xs', color: 'rgba(252, 165, 165, 0.8)' })}>
        {error?.message || 'An unexpected error occurred'}
      </p>
    </div>
  )
}

function EmptyState({ onCreateSession }: { onCreateSession: () => void }) {
  return (
    <div
      className={css({
        p: '6',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
      })}
    >
      <div
        className={css({
          w: '12',
          h: '12',
          mx: 'auto',
          mb: '3',
          rounded: 'full',
          bg: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <ChatIcon />
      </div>
      <p className={css({ fontSize: 'sm', mb: '3' })}>No sessions yet</p>
      <button
        type="button"
        onClick={onCreateSession}
        className={css({
          px: '4',
          py: '2',
          rounded: 'lg',
          bg: 'rgba(59, 130, 246, 0.2)',
          color: 'rgb(147, 197, 253)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: 'sm',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          _hover: {
            bg: 'rgba(59, 130, 246, 0.3)',
          },
        })}
      >
        Start a conversation
      </button>
    </div>
  )
}

function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div
      className={css({
        p: '6',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
      })}
    >
      <div
        className={css({
          w: '12',
          h: '12',
          mx: 'auto',
          mb: '3',
          rounded: 'full',
          bg: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
        })}
      >
        <SearchIconLarge />
      </div>
      <p className={css({ fontSize: 'sm', mb: '1' })}>No sessions found</p>
      <p className={css({ fontSize: 'xs', color: 'rgba(255, 255, 255, 0.4)', mb: '3' })}>
        No results for "{query}"
      </p>
      <button
        type="button"
        onClick={onClear}
        className={css({
          px: '3',
          py: '1.5',
          rounded: 'md',
          bg: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 'xs',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.15)',
          },
        })}
      >
        Clear search
      </button>
    </div>
  )
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) {
    return <>{text}</>
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  const parts = text.split(regex)
  let currentOffset = 0

  return (
    <>
      {parts.map((part) => {
        const partOffset = currentOffset
        const partKey = `${partOffset}-${part}`
        currentOffset += part.length

        return part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={partKey}
            className={css({
              bg: 'rgba(59, 130, 246, 0.3)',
              color: 'rgb(191, 219, 254)',
              px: '0.5',
              rounded: 'sm',
            })}
          >
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </>
  )
}

// Icons
function PlusIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Add</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className={css({ w: '4', h: '4', animation: 'spin 1s linear infinite' })}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Loading</title>
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

function EditIcon() {
  return (
    <svg
      className={css({ w: '3.5', h: '3.5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Edit</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      className={css({ w: '3.5', h: '3.5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Delete</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg
      className={css({ w: '6', h: '6', color: 'rgb(59, 130, 246)' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <title>Chat</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      className={css({ w: '8', h: '8', mx: 'auto' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <title>Error</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      className={css({
        w: '4',
        h: '4',
        position: 'absolute',
        left: '2.5',
        color: 'rgba(255, 255, 255, 0.4)',
      })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Search</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function SearchIconLarge() {
  return (
    <svg
      className={css({ w: '6', h: '6' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <title>Search</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className={css({ w: '3.5', h: '3.5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Clear</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      className={css({ w: '3.5', h: '3.5' })}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <title>Export</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className={css({ w: '3.5', h: '3.5', animation: 'spin 1s linear infinite' })}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Loading</title>
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
